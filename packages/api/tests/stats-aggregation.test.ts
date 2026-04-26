import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { Campaign, CampaignRecipient, Recipient } from '../src/models/index.js';
import { closeDb, createTestUser, getApp, truncateAll, type TestUser } from './setup.js';

describe('stats aggregation (T3.1 #3)', () => {
  let app: Express;
  let user: TestUser;

  beforeAll(async () => {
    app = await getApp();
  });

  afterAll(async () => {
    await closeDb();
  });

  beforeEach(async () => {
    await truncateAll();
    user = await createTestUser(app);
  });

  it('0 recipients -> rates are 0, never NaN', async () => {
    const c = await Campaign.create({
      name: 'Empty', subject: 's', body: 'b', status: 'draft',
      scheduled_at: null, created_by: user.id,
    });

    const res = await request(app)
      .get(`/campaigns/${c.id}`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).toBe(200);

    const { stats } = res.body;
    expect(stats.total).toBe(0);
    expect(stats.sent).toBe(0);
    expect(stats.failed).toBe(0);
    expect(stats.opened).toBe(0);
    expect(stats.send_rate).toBe(0);
    expect(stats.open_rate).toBe(0);
    expect(Number.isFinite(stats.send_rate)).toBe(true);
    expect(Number.isFinite(stats.open_rate)).toBe(true);
  });

  it('10 recipients with mixed status -> correct rates', async () => {
    const c = await Campaign.create({
      name: 'Mixed', subject: 's', body: 'b', status: 'sent',
      scheduled_at: null, created_by: user.id,
    });

    const recipients = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        Recipient.create({ email: `r${i}@x.com`, name: null }),
      ),
    );

    let idx = 0;
    for (const recipient of recipients) {
      const status: 'sent' | 'failed' | 'pending' =
        idx < 7 ? 'sent' : idx < 9 ? 'failed' : 'pending';
      await CampaignRecipient.create({
        campaign_id: c.id,
        recipient_id: recipient.id,
        status,
        sent_at: status === 'pending' ? null : new Date(),
        opened_at: idx < 3 ? new Date() : null,
      });
      idx += 1;
    }

    const res = await request(app)
      .get(`/campaigns/${c.id}`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).toBe(200);

    const { stats } = res.body;
    expect(stats.total).toBe(10);
    expect(stats.sent).toBe(7);
    expect(stats.failed).toBe(2);
    expect(stats.opened).toBe(3);
    expect(stats.send_rate).toBeCloseTo(0.7, 5);
    expect(stats.open_rate).toBeCloseTo(3 / 7, 5);
  });

  it('numeric types are number, not string (Postgres bigint guard)', async () => {
    const c = await Campaign.create({
      name: 'Types', subject: 's', body: 'b', status: 'sent',
      scheduled_at: null, created_by: user.id,
    });
    const r = await Recipient.create({ email: 'one@x.com', name: null });
    await CampaignRecipient.create({
      campaign_id: c.id,
      recipient_id: r.id,
      status: 'sent',
      sent_at: new Date(),
      opened_at: null,
    });

    const res = await request(app)
      .get(`/campaigns/${c.id}`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).toBe(200);

    const { stats } = res.body;
    expect(typeof stats.total).toBe('number');
    expect(typeof stats.sent).toBe('number');
    expect(typeof stats.failed).toBe('number');
    expect(typeof stats.opened).toBe('number');
    expect(typeof stats.send_rate).toBe('number');
    expect(typeof stats.open_rate).toBe('number');
  });
});
