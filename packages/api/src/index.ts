import { env } from './config/env.js';
import { sequelize } from './db/sequelize.js';
import { migrate } from './db/migrate.js';
import { buildApp } from './app.js';

async function main(): Promise<void> {
  await sequelize.authenticate();
  await migrate();

  const app = buildApp();
  app.listen(env.API_PORT, () => {
    console.log(`[api] listening on :${env.API_PORT}`);
  });
}

main().catch((err) => {
  console.error('[api] fatal startup error:', err);
  process.exit(1);
});
