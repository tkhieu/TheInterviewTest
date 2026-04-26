import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { Campaign } from '../src/models/index.js';
import { closeDb, createTestUser, getApp, truncateAll, type TestUser } from './setup.js';

describe('campaign edit rules (T3.1 #1)', () => {
  let app: Express;
  let user: TestUser;
  let draftId: string;
  let scheduledId: string;
  let sentId: string;

  beforeAll(async () => {
    app = await getApp();
  });

  afterAll(async () => {
    await closeDb();
  });

  beforeEach(async () => {
    await truncateAll();
    user = await createTestUser(app);

    const draft = await Campaign.create({
      name: 'Draft', subject: 's', body: 'b', status: 'draft',
      scheduled_at: null, created_by: user.id,
    });
    const scheduled = await Campaign.create({
      name: 'Scheduled', subject: 's', body: 'b', status: 'scheduled',
      scheduled_at: new Date(Date.now() + 86_400_000), created_by: user.id,
    });
    const sent = await Campaign.create({
      name: 'Sent', subject: 's', body: 'b', status: 'sent',
      scheduled_at: null, created_by: user.id,
    });

    draftId = draft.id;
    scheduledId = scheduled.id;
    sentId = sent.id;
  });

  it('PATCH draft -> 200', async () => {
    const res = await request(app)
      .patch(`/campaigns/${draftId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated');
    expect(res.body.status).toBe('draft');
  });

  it('PATCH scheduled -> 409 INVALID_STATUS', async () => {
    const res = await request(app)
      .patch(`/campaigns/${scheduledId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ name: 'Should fail' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_STATUS');
  });

  it('DELETE draft -> 204', async () => {
    const res = await request(app)
      .delete(`/campaigns/${draftId}`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).toBe(204);
    const found = await Campaign.findByPk(draftId);
    expect(found).toBeNull();
  });

  it('DELETE sent -> 409 INVALID_STATUS', async () => {
    const res = await request(app)
      .delete(`/campaigns/${sentId}`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_STATUS');
    const found = await Campaign.findByPk(sentId);
    expect(found).not.toBeNull();
  });
});
