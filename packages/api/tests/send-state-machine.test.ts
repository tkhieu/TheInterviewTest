import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { Campaign } from '../src/models/index.js';
import { closeDb, createTestUser, getApp, truncateAll, type TestUser } from './setup.js';

async function waitForStatus(
  id: string,
  expected: readonly string[],
  timeoutMs = 10_000,
): Promise<string | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const c = await Campaign.findByPk(id);
    if (c && expected.includes(c.status)) return c.status;
    await new Promise((r) => setTimeout(r, 100));
  }
  return null;
}

describe('send state machine (T3.1 #2)', () => {
  let app: Express;
  let user: TestUser;
  let draftId: string;

  beforeAll(async () => {
    app = await getApp();
  });

  afterAll(async () => {
    await closeDb();
  });

  beforeEach(async () => {
    await truncateAll();
    user = await createTestUser(app);

    const created = await request(app)
      .post('/campaigns')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'C',
        subject: 's',
        body: 'b',
        recipient_emails: ['a@x.com', 'b@x.com', 'c@x.com'],
      });
    expect(created.status).toBe(201);
    draftId = created.body.id;
  });

  it('Send draft -> 202 sending', async () => {
    const res = await request(app)
      .post(`/campaigns/${draftId}/send`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).toBe(202);
    expect(res.body.status).toBe('sending');
  });

  it('Double-send -> 409 INVALID_STATUS', async () => {
    const first = await request(app)
      .post(`/campaigns/${draftId}/send`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(first.status).toBe(202);

    const second = await request(app)
      .post(`/campaigns/${draftId}/send`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('INVALID_STATUS');
  });

  it('Eventually transitions to sent or failed', async () => {
    await request(app)
      .post(`/campaigns/${draftId}/send`)
      .set('Authorization', `Bearer ${user.token}`);

    const final = await waitForStatus(draftId, ['sent', 'failed']);
    expect(final).not.toBeNull();
    expect(['sent', 'failed']).toContain(final);
  });

  it('Send completed -> 409', async () => {
    await request(app)
      .post(`/campaigns/${draftId}/send`)
      .set('Authorization', `Bearer ${user.token}`);
    const final = await waitForStatus(draftId, ['sent', 'failed']);
    expect(final).not.toBeNull();

    const res = await request(app)
      .post(`/campaigns/${draftId}/send`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_STATUS');
  });
});
