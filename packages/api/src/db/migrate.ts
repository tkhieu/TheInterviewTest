import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { QueryTypes } from 'sequelize';
import { sequelize } from './sequelize.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

export async function migrate(): Promise<void> {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const applied = await sequelize.query<{ filename: string }>(
    'SELECT filename FROM schema_migrations',
    { type: QueryTypes.SELECT },
  );
  const appliedSet = new Set(applied.map((r) => r.filename));

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let appliedCount = 0;
  for (const filename of files) {
    if (appliedSet.has(filename)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf8');
    await sequelize.transaction(async (t) => {
      await sequelize.query(sql, { transaction: t });
      await sequelize.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        { bind: [filename], transaction: t },
      );
    });
    console.log(`[migrate] applied ${filename}`);
    appliedCount += 1;
  }

  if (appliedCount === 0) {
    console.log('[migrate] no pending migrations');
  }
}

const isMain = process.argv[1] && import.meta.url === `file://${path.resolve(process.argv[1])}`;
if (isMain) {
  migrate()
    .then(() => sequelize.close())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[migrate] failed:', err);
      process.exit(1);
    });
}
