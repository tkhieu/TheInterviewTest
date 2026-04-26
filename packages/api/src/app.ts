import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter } from './routes/auth.js';
import { campaignsRouter } from './routes/campaigns.js';
import { recipientsRouter } from './routes/recipients.js';
import { errorHandler } from './lib/errors.js';

export function buildApp(): Express {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/auth', authRouter);
  app.use('/campaigns', campaignsRouter);
  app.use('/recipients', recipientsRouter);

  app.use(errorHandler);

  return app;
}
