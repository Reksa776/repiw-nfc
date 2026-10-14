# REPIW · Supabase database migration plan

## Project baseline

`~/repiw-nextjs-project` is the baseline for the current UI and flows. Its bilingual responsive design, login page, loading transitions, dashboard, QR/NFC card flow, analytics, and demo tour are retained. This change replaces the MySQL runtime with Supabase PostgreSQL and does not intentionally redesign those pages.

## Database implementation

- `DATABASE_URL` connects to Supabase using the server-only `pg` package.
- `npm run db:migrate` applies the versioned initial schema for `cards`, `visits`, `admins`, `sessions`, `rate_events`, `schema_migrations`, and `data_imports`.
- `npm run db:seed -- <username>` interactively stores an scrypt password hash in `admins` and revokes current sessions.
- Cards use the existing 0/1 active and demo flags. In Supabase, demo and production rows coexist in one project and dashboard/query/export operations scope by `DEMO_MODE`.
- Transactions protect activation, generation batches, demo seed/reset, and rate-limit counters. Existing activation validation and redirects remain.
- `npm run db:import-mysql -- <demo|production>` transfers existing MySQL card and visit data; `mysql2` is development-only for this one-off importer. `npm run db:import-sqlite -- <path>` supports older SQLite files. Both importers remap visits by card code and skip sessions/rate-limit history.

## Cutover

1. Copy the Supabase PostgreSQL URI from the project's Connect panel into a private `.env` as `DATABASE_URL`.
2. Run `npm run db:migrate`, then import the existing MySQL sources (or SQLite backups) once, if applicable. Seed with `npm run db:seed -- admin`.
3. Compare card and visit counts in Supabase Table Editor.
4. On staging, verify login/logout, generation and CSV, QR PNG/ZIP, inactive activation, active QR/NFC redirects, dashboard counts, demo reset, and mobile layout.
5. Keep the original database and backups until the new deployment and restoration path are accepted.

## Limitation

No Supabase project credentials were supplied. The schema migration, database seed, data import, live login, runtime SQL, and deployment have not been run against a real Supabase project. E2E requires a dedicated `REPIW_TEST_DATABASE_URL`; never use production for those tests. Stop writes to a MySQL source and import once; importing again after new visits have arrived would append those visits again.
