# REPIW V1

REPIW manages NFC and QR Google Review cards, one-time activation codes, scan tracking, CSV/QR exports, and an admin dashboard built with Next.js App Router, React, and TypeScript.

## Requirements

- Node.js 22.5 or newer
- MySQL 8.0+ (or a compatible MySQL service)
- A MySQL user with access to both the production and demo databases

## Configure MySQL

Copy `.env.example` to `.env` and fill in the MySQL host, port, username, password, and database names. The app chooses `MYSQL_DEMO_DATABASE` when `DEMO_MODE=true` and `MYSQL_DATABASE` when `DEMO_MODE=false`. Keep those databases separate.

Create the two databases and grant the app user rights to create/alter tables and read/write data in both. Example for a local MySQL server (replace the password before running):

```sql
CREATE DATABASE repiw CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE repiw_demo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'repiw_app'@'%' IDENTIFIED BY 'set-a-strong-password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES ON repiw.* TO 'repiw_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES ON repiw_demo.* TO 'repiw_app'@'%';
FLUSH PRIVILEGES;
```

The sample SQL is guidance; restrict the account host and network access for the actual deployment. Set `SESSION_SECRET` to a random value with at least 32 bytes. Use TLS (`MYSQL_SSL=true`) when your MySQL host provides a certificate trusted by Node.js.

## Initialize and run

```sh
npm install
npm run db:migrate
npm run db:seed -- admin
npm run dev
```

`db:migrate` initializes the selected MySQL database schema (schema version 1). Apply future schema changes with the migration scripts shipped with their app release. `db:seed` securely prompts for a username and an admin password (minimum 8 characters), stores a scrypt hash in the database selected by `DEMO_MODE`, and revokes sessions there. To seed the production account, set `DEMO_MODE=false` first and run it against `MYSQL_DATABASE`. For production, set `DEMO_MODE=false`, configure `BASE_URL` with HTTPS, and use a strong session secret.

## Import an existing SQLite database

Take a backup of the SQLite file first. On a copy of an older SQLite database, run `npm run migrate:sqlite -- /absolute/path/to/copy.sqlite` to bring it to the current SQLite source schema; this creates an additional backup. Configure `.env` so `DEMO_MODE` selects the matching destination database, then initialize MySQL and import the matching SQLite file:

```sh
npm run db:migrate
npm run db:import-sqlite -- /absolute/path/to/repiw.sqlite
```

For demo data, set `DEMO_MODE=true` and import the demo SQLite file into `MYSQL_DEMO_DATABASE`. For production data, set `DEMO_MODE=false` and import into `MYSQL_DATABASE`. Import is intended for a fresh MySQL destination. It preserves card, visit, admin, and session rows; ephemeral rate-limit counters are intentionally skipped. Duplicate primary/unique keys are ignored. Keep both source files and backups until counts and a staged login/activation/scan flow have been verified. Existing sessions can be invalidated by changing `SESSION_SECRET` or re-seeding an admin.

The old SQLite schema migration is still available as `npm run migrate:sqlite -- /path/to/source.sqlite`; it does not configure or migrate MySQL.

## App behavior and deployment

- Each card has a unique ID and a hashed, one-time activation code. Download the CSV after generation because raw activation codes are shown only once.
- QR links use `?src=qr`; encode the corresponding `?src=nfc` URL on NFC cards. Active scans record their source and redirect to the configured Google Review destination.
- MySQL transactions protect activation and batch generation. Rate-limit events are stored in the selected database and shared across app instances using that database.
- Use a persistent managed MySQL service, TLS, automated backups, and a tested restore procedure. Apply schema migrations before deploying new application versions.
- Keep demo and production data in separate databases. Do not grant the app access to unrelated schemas.

## Environment variables

See `.env.example`. `.env` contains credentials and must not be committed. Never commit exported card CSVs or activation codes.
# repiw-nfc
