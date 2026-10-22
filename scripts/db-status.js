// READ-ONLY database readiness probe. Never runs migrations and never writes data.
//
//   npm run db:status
//
// Prints: schema version, provenance readiness, and card counts. Never inspects credentials.
// Exit code 0 when card provenance columns for the HTTP/Places resolver are available.
// No connection string, host, user or password is ever printed.

require('dotenv').config();
const { Pool } = require('pg');

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

    const provenance = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='cards' AND column_name IN ('place_id','source_url','resolution_status','resolution_method')");
    const present = new Set(provenance.rows.map((r) => r.column_name));

    let cards = { total: null, active: null };
    try {
      const r = await pool.query('SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN active=1 THEN 1 ELSE 0 END),0) AS active FROM cards');
      cards = { total: Number(r.rows[0].total), active: Number(r.rows[0].active) };
    } catch {
      /* pre-initial database */
    }

    const requiredColumns = ['place_id', 'source_url', 'resolution_status', 'resolution_method'];
    const ready = schemaVersion >= 6 && requiredColumns.every((column) => present.has(column));
    const report = {
      ok: ready,
      database: dbinfo.rows[0].database,
      schema: dbinfo.rows[0].schema,
      schemaVersion,
      requiredVersion: 6,
      provenanceColumns: Object.fromEntries(requiredColumns.map((column) => [column, present.has(column)])),
      cards,
      note: ready
        ? 'Provenance schema is ready. Google Places resolution remains disabled unless GOOGLE_PLACES_RESOLVER_ENABLED=1.'
        : 'Schema is NOT ready: back up the database and apply migrations with `npm run db:migrate` in an approved release step.',
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
