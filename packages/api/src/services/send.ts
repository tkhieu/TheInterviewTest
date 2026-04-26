import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.js';
import {
  Campaign,
  CampaignRecipient,
  type CampaignStatus,
} from '../models/index.js';
import { errors } from '../lib/errors.js';

const SEND_SUCCESS_RATE = 0.9;
const PER_RECIPIENT_DELAY_MIN_MS = 60;
const PER_RECIPIENT_DELAY_RANGE_MS = 80;

export async function scheduleCampaign(
  campaignId: string,
  userId: string,
  scheduledAt: Date,
): Promise<Campaign> {
  if (scheduledAt.getTime() <= Date.now()) {
    throw errors.validation('scheduled_at must be in the future');
  }

  const [count] = await Campaign.update(
    {
      status: 'scheduled',
      scheduled_at: scheduledAt,
      updated_at: new Date(),
    },
    {
      where: { id: campaignId, created_by: userId, status: 'draft' },
    },
  );

  if (count === 0) {
    const existing = await Campaign.findOne({
      where: { id: campaignId, created_by: userId },
    });
    if (!existing) throw errors.notFound('Campaign not found');
    throw errors.invalidStatus('Can only schedule draft campaigns');
  }

  const updated = await Campaign.findByPk(campaignId);
  if (!updated) throw errors.notFound('Campaign not found');
  return updated;
}

export async function sendCampaign(
  campaignId: string,
  userId: string,
): Promise<{ id: string; status: 'sending' }> {
  const [count] = await Campaign.update(
    { status: 'sending', updated_at: new Date() },
    {
      where: {
        id: campaignId,
        created_by: userId,
        status: { [Op.in]: ['draft', 'scheduled'] },
      },
    },
  );

  if (count === 0) {
    const existing = await Campaign.findOne({
      where: { id: campaignId, created_by: userId },
    });
    if (!existing) throw errors.notFound('Campaign not found');
    throw errors.invalidStatus('Already sending or completed');
  }

  setImmediate(() => {
    runSendSimulation(campaignId).catch((err) => {
      console.error('[send] simulation crashed for %s:', campaignId, err);
    });
  });

  return { id: campaignId, status: 'sending' };
}

async function runSendSimulation(campaignId: string): Promise<void> {
  const recipients = await CampaignRecipient.findAll({
    where: { campaign_id: campaignId, status: 'pending' },
  });

  for (const cr of recipients) {
    await sleep(
      PER_RECIPIENT_DELAY_MIN_MS + Math.random() * PER_RECIPIENT_DELAY_RANGE_MS,
    );
    const success = Math.random() < SEND_SUCCESS_RATE;
    await CampaignRecipient.update(
      success
        ? { status: 'sent', sent_at: new Date() }
        : { status: 'failed' },
      {
        where: {
          campaign_id: cr.campaign_id,
          recipient_id: cr.recipient_id,
        },
      },
    );
  }

  const tally = await sequelize.query<{ sent: number }>(
    `SELECT CAST(COUNT(*) FILTER (WHERE status = 'sent') AS INTEGER) AS sent
     FROM campaign_recipients
     WHERE campaign_id = $1`,
    { bind: [campaignId], type: QueryTypes.SELECT },
  );
  const sentCount = tally[0]?.sent ?? 0;
  const finalStatus: CampaignStatus = sentCount > 0 ? 'sent' : 'failed';

  await Campaign.update(
    { status: finalStatus, updated_at: new Date() },
    { where: { id: campaignId, status: 'sending' } },
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
