// READ-ONLY database readiness probe. Never runs migrations and never writes data.
//
//   npm run db:status
//
// Prints: schema version, resolver table presence, card counts and worker heartbeats.
// Exit code 0 only when the database is ready for the automatic resolver (schema version >= 8).
// No connection string, host, user or password is ever printed.

require('dotenv').config();
const { Pool } = require('pg');

const REQUIRED_VERSION = 8;

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Point it at the target database (see .env.example).');
    process.exit(2);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, application_name: 'repiw-db-status' });
  try {
    await pool.query('SELECT 1');

    const dbinfo = await pool.query('SELECT current_database() AS database, current_schema() AS schema');
    const version = await pool
      .query('SELECT COALESCE(MAX(version), 0) AS version FROM schema_migrations')
      .catch((error) => (error.code === '42P01' ? { rows: [{ version: 0 }] } : Promise.reject(error)));
    const schemaVersion = Number(version.rows[0].version);

    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('resolution_jobs','resolution_audit','resolver_workers')",
    );
    const present = new Set(tables.rows.map((r) => r.table_name));

    let cards = { total: null, active: null };
    try {
      const r = await pool.query('SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN active=1 THEN 1 ELSE 0 END),0) AS active FROM cards');
      cards = { total: Number(r.rows[0].total), active: Number(r.rows[0].active) };
    } catch {
      /* pre-initial database */
    }

    let jobs = null;
    let workers = null;
    if (present.has('resolution_jobs')) {
      const r = await pool.query(
        "SELECT COUNT(*) FILTER (WHERE status='pending') AS pending, COUNT(*) FILTER (WHERE status='running') AS running, COUNT(*) AS total FROM resolution_jobs",
      );
      jobs = { pending: Number(r.rows[0].pending), running: Number(r.rows[0].running), total: Number(r.rows[0].total) };
    }
    if (present.has('resolver_workers')) {
      const r = await pool.query(
        'SELECT COUNT(*) AS workers, MAX(last_seen_at) AS last_seen_at, ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - MAX(last_seen_at)))) AS age_seconds FROM resolver_workers',
      );
      const age = r.rows[0].age_seconds === null ? null : Number(r.rows[0].age_seconds);
      workers = { registered: Number(r.rows[0].workers), last_seen_seconds_ago: age, live: age !== null && age <= 30 };
    }

    const ready = schemaVersion >= REQUIRED_VERSION && present.has('resolution_jobs') && present.has('resolver_workers');
    const report = {
      ok: ready,
      database: dbinfo.rows[0].database,
      schema: dbinfo.rows[0].schema,
      schemaVersion,
      requiredVersion: REQUIRED_VERSION,
      resolverTables: {
        resolution_jobs: present.has('resolution_jobs'),
        resolution_audit: present.has('resolution_audit'),
        resolver_workers: present.has('resolver_workers'),
      },
      cards,
      jobs,
      workers,
      note: ready
        ? 'Schema is ready. The resolver still stays disabled until PLAYWRIGHT_RESOLVER_ENABLED=1 is approved.'
        : 'Schema is NOT ready: apply migrations 1-8 with `npm run db:migrate` during an approved maintenance window.',
    };
    console.log(JSON.stringify(report, null, 2));
    process.exit(ready ? 0 : 1);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`Database status check failed: ${error.code || error.message}`);
  process.exit(2);
});
