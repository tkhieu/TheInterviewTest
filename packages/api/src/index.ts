import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { sequelize } from './db/sequelize.js';
import { migrate } from './db/migrate.js';
import { authRouter } from './routes/auth.js';
import { errorHandler } from './lib/errors.js';

async function main(): Promise<void> {
  await sequelize.authenticate();
  await migrate();

  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/auth', authRouter);

  app.use(errorHandler);

  app.listen(env.API_PORT, () => {
    console.log(`[api] listening on :${env.API_PORT}`);
  });
}

main().catch((err) => {
  console.error('[api] fatal startup error:', err);
  process.exit(1);
});
