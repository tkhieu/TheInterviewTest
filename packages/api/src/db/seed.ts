import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { Campaign, CampaignRecipient, Recipient, User } from '../models/index.js';
import { migrate } from './migrate.js';
import { sequelize } from './sequelize.js';

const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'Demo123!';
const DEMO_NAME = 'Demo User';

async function clearAll(): Promise<void> {
  // CASCADE is required: campaign_recipients FKs would otherwise reject the truncate.
  await sequelize.query(
    'TRUNCATE TABLE campaign_recipients, campaigns, recipients, users RESTART IDENTITY CASCADE',
  );
}

async function seed(): Promise<void> {
  await sequelize.authenticate();
  await migrate();
  await clearAll();

  const password_hash = await bcrypt.hash(DEMO_PASSWORD, env.BCRYPT_ROUNDS);
  const user = await User.create({
    email: DEMO_EMAIL,
    name: DEMO_NAME,
    password_hash,
  });
  console.log(`[seed] user: ${user.email} (id=${user.id})`);

  const recipients = await Recipient.bulkCreate(
    Array.from({ length: 20 }, (_, i) => ({
      email: `recipient${i + 1}@example.com`,
      name: `Recipient ${i + 1}`,
    })),
  );
  console.log(`[seed] recipients: ${recipients.length}`);

  const now = Date.now();
  const dayMs = 86_400_000;

  const draft = await Campaign.create({
    name: 'Draft: Q4 Newsletter',
    subject: 'Catch up before the year ends',
    body: 'Hey there,\n\nHere are the highlights of Q4. Edit me before sending.',
    status: 'draft',
    scheduled_at: null,
    created_by: user.id,
  });

  const scheduled = await Campaign.create({
    name: 'Scheduled: Black Friday Promo',
    subject: 'Save up to 40% — early access',
    body: "It's our biggest sale of the year. Get in early before everyone else.",
    status: 'scheduled',
    scheduled_at: new Date(now + 2 * dayMs),
    created_by: user.id,
  });

  const sending = await Campaign.create({
    name: 'Sending: Welcome Series #2',
    subject: 'A few tips to get started',
    body: 'Now that you have an account, here is what to try first...',
    status: 'sending',
    scheduled_at: null,
    created_by: user.id,
  });

  const sentCampaign = await Campaign.create({
    name: 'Sent: Holiday Promo',
    subject: 'Happy holidays from us',
    body: 'Thanks for being a customer this year. Have a great holiday!',
    status: 'sent',
    scheduled_at: null,
    created_by: user.id,
  });

  const failedCampaign = await Campaign.create({
    name: 'Failed: Server Migration Notice',
    subject: 'Brief downtime tonight',
    body: 'We are migrating servers. Expect ~15 min downtime around 2 AM.',
    status: 'failed',
    scheduled_at: null,
    created_by: user.id,
  });

  // Draft -- all 20 pending, no transitions yet.
  await CampaignRecipient.bulkCreate(
    recipients.map((r) => ({
      campaign_id: draft.id,
      recipient_id: r.id,
      status: 'pending' as const,
      sent_at: null,
      opened_at: null,
    })),
  );

  // Scheduled -- all 20 pending, will transition when scheduled_at fires.
  await CampaignRecipient.bulkCreate(
    recipients.map((r) => ({
      campaign_id: scheduled.id,
      recipient_id: r.id,
      status: 'pending' as const,
      sent_at: null,
      opened_at: null,
    })),
  );

  // Sending -- mid-flight: 8 sent (3 opened), 2 failed, 10 still pending.
  await CampaignRecipient.bulkCreate(
    recipients.map((r, i) => {
      const status = i < 8 ? 'sent' : i < 10 ? 'failed' : 'pending';
      return {
        campaign_id: sending.id,
        recipient_id: r.id,
        status: status as 'pending' | 'sent' | 'failed',
        sent_at: status === 'pending' ? null : new Date(now - 60_000),
        opened_at: status === 'sent' && i < 3 ? new Date(now - 30_000) : null,
      };
    }),
  );

  // Sent -- finalized: 18 sent (12 opened), 2 failed.
  await CampaignRecipient.bulkCreate(
    recipients.map((r, i) => {
      const status = i < 18 ? 'sent' : 'failed';
      return {
        campaign_id: sentCampaign.id,
        recipient_id: r.id,
        status: status as 'sent' | 'failed',
        sent_at: new Date(now - 7 * dayMs),
        opened_at: status === 'sent' && i < 12 ? new Date(now - 6 * dayMs) : null,
      };
    }),
  );

  // Failed -- per CLAUDE.md hard rule #6, campaign is `failed` only when zero sent.
  await CampaignRecipient.bulkCreate(
    recipients.map((r) => ({
      campaign_id: failedCampaign.id,
      recipient_id: r.id,
      status: 'failed' as const,
      sent_at: new Date(now - 3 * dayMs),
      opened_at: null,
    })),
  );

  console.log('[seed] campaigns: 5 (draft / scheduled / sending / sent / failed)');
  console.log(`[seed] campaign_recipients: ${5 * recipients.length}`);
  console.log(`[seed] login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

seed()
  .then(() => sequelize.close())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed] failed:', err);
    sequelize.close().finally(() => process.exit(1));
  });
