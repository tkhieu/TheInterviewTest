import type { Express } from 'express';
import request from 'supertest';
import { sequelize } from '../src/db/sequelize.js';
import { migrate } from '../src/db/migrate.js';
import { buildApp } from '../src/app.js';

let _app: Express | null = null;
let _connected = false;

export async function setupDb(): Promise<void> {
  if (_connected) return;
  await sequelize.authenticate();
  await migrate();
  _connected = true;
}

export async function closeDb(): Promise<void> {
  if (!_connected) return;
  await sequelize.close();
  _connected = false;
  _app = null;
}

export async function getApp(): Promise<Express> {
  if (!_app) {
    await setupDb();
    _app = buildApp();
  }
  return _app;
}

export async function truncateAll(): Promise<void> {
  await sequelize.query(
    'TRUNCATE users, campaigns, recipients, campaign_recipients RESTART IDENTITY CASCADE',
  );
}

export interface TestUser {
  id: string;
  email: string;
  token: string;
}

let _userCounter = 0;

export async function createTestUser(
  app: Express,
  overrides: { email?: string; password?: string; name?: string } = {},
): Promise<TestUser> {
  _userCounter += 1;
  const email =
    overrides.email ?? `test-${Date.now()}-${_userCounter}@example.com`;
  const password = overrides.password ?? 'TestPassword12345';
  const name = overrides.name ?? 'Test User';
  const res = await request(app).post('/auth/register').send({ email, password, name });
  if (res.status !== 201) {
    throw new Error(`createTestUser failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { id: res.body.user.id, email: res.body.user.email, token: res.body.token };
}
