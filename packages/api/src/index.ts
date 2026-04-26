import express from 'express';
import { env } from './config/env.js';
import { sequelize } from './db/sequelize.js';
import { migrate } from './db/migrate.js';

async function main(): Promise<void> {
  await sequelize.authenticate();
  await migrate();

  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.listen(env.API_PORT, () => {
    console.log(`[api] listening on :${env.API_PORT}`);
  });
}

main().catch((err) => {
  console.error('[api] fatal startup error:', err);
  process.exit(1);
});
