import { QueryTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.js';
import {
  Campaign,
  CampaignRecipient,
  Recipient,
  type CampaignStatus,
  type CrStatus,
} from '../models/index.js';

export interface CampaignStats {
  total: number;
  sent: number;
  failed: number;
  opened: number;
  send_rate: number;
  open_rate: number;
}

export interface CampaignListRow {
  id: string;
  name: string;
  subject: string;
  status: CampaignStatus;
  recipients_count: number;
  send_rate: number;
  created_at: Date;
}

export interface CampaignRecipientRow {
  id: string;
  email: string;
  name: string | null;
  status: CrStatus;
  sent_at: Date | null;
  opened_at: Date | null;
}

export async function getCampaignStats(campaignId: string): Promise<CampaignStats> {
  const rows = await sequelize.query<{
    total: number;
    sent: number;
    failed: number;
    opened: number;
  }>(
    `SELECT
       CAST(COUNT(*) AS INTEGER) AS total,
       CAST(COUNT(*) FILTER (WHERE status = 'sent') AS INTEGER) AS sent,
       CAST(COUNT(*) FILTER (WHERE status = 'failed') AS INTEGER) AS failed,
       CAST(COUNT(*) FILTER (WHERE opened_at IS NOT NULL) AS INTEGER) AS opened
     FROM campaign_recipients
     WHERE campaign_id = $1`,
    { bind: [campaignId], type: QueryTypes.SELECT },
  );
  const row = rows[0] ?? { total: 0, sent: 0, failed: 0, opened: 0 };
  const { total, sent, failed, opened } = row;
  return {
    total,
    sent,
    failed,
    opened,
    send_rate: total > 0 ? sent / total : 0,
    open_rate: sent > 0 ? opened / sent : 0,
  };
}

export async function listCampaigns(
  userId: string,
  page: number,
  limit: number,
): Promise<{ data: CampaignListRow[]; total: number }> {
  const offset = (page - 1) * limit;
  const data = await sequelize.query<CampaignListRow>(
    `SELECT
       c.id, c.name, c.subject, c.status, c.created_at,
       CAST(COALESCE(s.total, 0) AS INTEGER) AS recipients_count,
       CASE WHEN COALESCE(s.total, 0) > 0
            THEN COALESCE(s.sent, 0)::float / s.total
            ELSE 0
       END AS send_rate
     FROM campaigns c
     LEFT JOIN LATERAL (
       SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status = 'sent') AS sent
       FROM campaign_recipients
       WHERE campaign_id = c.id
     ) s ON TRUE
     WHERE c.created_by = $1
     ORDER BY c.created_at DESC
     LIMIT $2 OFFSET $3`,
    { bind: [userId, limit, offset], type: QueryTypes.SELECT },
  );

  const countRows = await sequelize.query<{ count: number }>(
    `SELECT CAST(COUNT(*) AS INTEGER) AS count FROM campaigns WHERE created_by = $1`,
    { bind: [userId], type: QueryTypes.SELECT },
  );
  const total = countRows[0]?.count ?? 0;

  return { data, total };
}

export interface CreateCampaignInput {
  userId: string;
  name: string;
  subject: string;
  body: string;
  recipient_emails: string[];
}

export async function createCampaign(
  input: CreateCampaignInput,
): Promise<{ campaign: Campaign; recipients_count: number }> {
  const uniqueEmails = [...new Set(input.recipient_emails.map((e) => e.toLowerCase()))];

  return sequelize.transaction(async (t) => {
    const campaign = await Campaign.create(
      {
        name: input.name,
        subject: input.subject,
        body: input.body,
        status: 'draft',
        scheduled_at: null,
        created_by: input.userId,
      },
      { transaction: t },
    );

    const recipientIds: string[] = [];
    for (const email of uniqueEmails) {
      const [recipient] = await Recipient.findOrCreate({
        where: { email },
        defaults: { email, name: null },
        transaction: t,
      });
      recipientIds.push(recipient.id);
    }

    await CampaignRecipient.bulkCreate(
      recipientIds.map((rid) => ({
        campaign_id: campaign.id,
        recipient_id: rid,
        status: 'pending' as const,
        sent_at: null,
        opened_at: null,
      })),
      { transaction: t },
    );

    return { campaign, recipients_count: recipientIds.length };
  });
}

export async function getCampaignDetail(
  campaignId: string,
  userId: string,
): Promise<{
  campaign: Campaign;
  stats: CampaignStats;
  recipients: CampaignRecipientRow[];
} | null> {
  const campaign = await Campaign.findOne({
    where: { id: campaignId, created_by: userId },
  });
  if (!campaign) return null;

  const stats = await getCampaignStats(campaignId);

  const recipients = await sequelize.query<CampaignRecipientRow>(
    `SELECT r.id, r.email, r.name, cr.status, cr.sent_at, cr.opened_at
     FROM campaign_recipients cr
     JOIN recipients r ON r.id = cr.recipient_id
     WHERE cr.campaign_id = $1
     ORDER BY r.email`,
    { bind: [campaignId], type: QueryTypes.SELECT },
  );

  return { campaign, stats, recipients };
}
