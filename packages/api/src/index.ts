import { env } from './config/env.js';
import { sequelize } from './db/sequelize.js';
import { migrate } from './db/migrate.js';
import { buildApp } from './app.js';

async function authenticateWithRetry(maxAttempts = 10, delayMs = 1_000): Promise<void> {
  for (let i = 1; i <= maxAttempts; i += 1) {
    try {
      await sequelize.authenticate();
      return;
    } catch (err) {
      if (i === maxAttempts) throw err;
      const reason = err instanceof Error ? err.message : String(err);
      console.log(`[api] db connection attempt ${i}/${maxAttempts} failed (${reason}); retrying in ${delayMs}ms`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

async function main(): Promise<void> {
  await authenticateWithRetry();
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
