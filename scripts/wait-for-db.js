// Wait until the target PostgreSQL has the core schema applied, then exit 0.
//
// Used by the end-to-end Playwright setup: one server runs the migrations, a second server must
// not start serving (or race the migration) until the tables exist.
//
//   DATABASE_URL=postgresql://... node scripts/wait-for-db.js [timeoutSeconds]

require('dotenv').config();
const { Pool } = require('pg');

const url = (process.env.REPIW_TEST_DATABASE_URL || process.env.DATABASE_URL || '').trim();
const timeoutMs = Number(process.argv[2] || 90) * 1000;

async function main() {
  if (!url) throw new Error('Set REPIW_TEST_DATABASE_URL or DATABASE_URL.');
  const pool = new Pool({ connectionString: url, max: 1, application_name: 'repiw-wait-for-db' });
  const deadline = Date.now() + timeoutMs;
  try {
    while (Date.now() < deadline) {
      try {
        const { rows } = await pool.query(
          "SELECT to_regclass('public.cards') AS cards, to_regclass('public.rate_events') AS rate_events, to_regclass('public.resolution_jobs') AS resolution_jobs",
        );
        const row = rows[0] || {};
        if (row.cards && row.rate_events && row.resolution_jobs) {
          console.log('[wait-for-db] schema is ready');
          return;
        }
      } catch {
        /* not ready yet */
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error('Timed out waiting for the migrated database.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`[wait-for-db] ${error.message}`);
  process.exit(1);
});
