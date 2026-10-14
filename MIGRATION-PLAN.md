# REPIW V1 · MySQL Migration

## Source and target

The application began on SQLite and now uses MySQL through `mysql2`. App queries and transaction-sensitive flows are asynchronous. The same card, visit, admin, session, and rate-limit records are represented in MySQL. `MYSQL_DATABASE` is selected when `DEMO_MODE=false`; `MYSQL_DEMO_DATABASE` is selected when it is true.

The UI flows remain: admin sign-in, card metrics and library, unique ID and one-time activation-code generation, QR PNG/ZIP and CSV, QR/NFC attribution, activation, visit tracking, active redirects, demo flow/review, and validation/error responses.

## Schema

`npm run db:migrate` initializes the selected MySQL schema: `cards`, `visits`, `admins`, `sessions`, `rate_events`, and `schema_migrations`. Tables use InnoDB, utf8mb4, foreign keys, and indexes for dashboard counts and lookups. Run the command once for the production database and once for the demo database by setting `DEMO_MODE` accordingly. The app account must have the privileges described in README.

## Existing SQLite data

1. Stop writes to the source app and take separate backups of production and demo SQLite databases.
2. For an older SQLite file, first run `npm run migrate:sqlite -- /absolute/path/to/a/copy.sqlite` on a copy. This is the legacy SQLite schema migration and creates a timestamped backup.
3. Set `DEMO_MODE=false`, initialize MySQL, then run `npm run db:import-sqlite -- /absolute/path/to/production.sqlite`.
4. Set `DEMO_MODE=true`, initialize the separate demo MySQL database, then import the demo SQLite file.
5. Compare card/visit/admin counts and verify sign-in, activation, QR/NFC visit recording, exports, and redirects on staging before cutover. Preserve the SQLite originals until the MySQL backup and rollback procedure are verified.

The importer is intended for an empty destination. It uses `INSERT IGNORE` to make repeated imports idempotent for matching primary/unique keys; do not use it to merge unrelated databases. Existing sessions are imported, but can be safely revoked by changing `SESSION_SECRET` or running `npm run db:seed -- admin`. Legacy unsalted SHA-256 activation digests remain verifiable for the one-time activation and are replaced with scrypt hashes after use.

## Configuration and status

Copy `.env.example` to `.env`; fill in MySQL host, port, username, password, and both database names. Never put real credentials in `.env.example`. `MYSQL_SSL=true` requires a certificate trusted by Node.js. Configure a random `SESSION_SECRET` of at least 32 bytes and HTTPS `BASE_URL` for production.

`npm run build` and TypeScript compilation pass after the MySQL refactor. A live migration, credential check, and end-to-end database verification still require the MySQL connection values and database privileges from the deployment environment. No production-readiness claim is made until those have been verified.
