# REPIW V1 · Next.js

REPIW manages Google Review cards that customers reach through a QR code or NFC tap. This version uses Next.js App Router, React, TypeScript, route handlers, and SQLite.

## Migration status

The current Next.js implementation is a migration from the Express source formerly in this folder. It preserves the existing card and visit tables and adds session/rate-limit tables. Existing SHA-256 activation-code hashes remain usable once, then are replaced when the card is activated. New activation codes use salted scrypt hashes.

This is a verified migration candidate, not a blanket production-readiness claim. See `MIGRATION-PLAN.md` for audit notes, acceptance criteria, deployment constraints, and cutover steps. Check the test results from the environment where this app is built and deployed.

## Requirements and local setup

- Node.js 22.5 or newer (Node 24 recommended).
- npm 10 or newer.

```sh
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`. With the sample development settings, admin password is `local-demo-password`; change it before sharing the machine or enabling a public network interface. Demo mode writes only to `data/repiw-demo.sqlite`.

## Main routes and flows

| Page or endpoint | Purpose |
| --- | --- |
| `/` | Product landing page |
| `/admin` | Admin login, dashboard, card management, analytics, exports, and demo settings |
| `/flow-preview` (`/demo`) | Interactive admin, buyer activation, customer scan, analytics, and error walkthrough |
| `/c/RP-...?...` | Public QR/NFC card resolution; `src=qr` or `src=nfc` |
| `/demo-review` | Local demo destination for active demo cards |
| `/api/admin/generate` | Generate up to 100 unique Card IDs and one-time activation codes |
| `/api/admin/qr/:code`, `/api/admin/qr-zip` | Download a QR PNG or a ZIP of QR PNGs |
| `/api/activate` | Validate and consume a one-time activation code |

New card codes, activation codes, and QR/NFC URLs appear after card generation. Download the CSV immediately: activation codes are intentionally never retrievable from the database. QR images encode the `?src=qr` URL; write the matching `?src=nfc` URL to the NFC chip. Activation accepts any valid HTTP or HTTPS destination link and saves it to the card. Each active scan records its source and redirects to that URL. Demo cards redirect to the local simulation.

## Production configuration

Set secrets through the hosting platform's secret manager, not a committed `.env` file.

- `NODE_ENV=production`
- `DEMO_MODE=false` (the app refuses to start in production with demo mode enabled)
- `BASE_URL=https://your-final-domain.example` (must be HTTPS; do not change after printing cards)
- `SESSION_SECRET`: at least 32 random bytes. Generate one with `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`.
- `ADMIN_PASSWORD_HASH`: use `npm run password:hash` in a private terminal and set the resulting `scrypt$...` value. Passwords must be at least 14 characters. Plain `ADMIN_PASSWORD` works only outside production.
- `DB_PATH`: path on a durable, backed-up disk. Use a different file for demo and production.
- `TRUST_PROXY=true` behind a trusted reverse proxy which overwrites client IP headers. `npm start` enforces this in production so rate limiting has a trustworthy client address.

Run `npm run build`, then `npm start` on a Node.js host with a persistent writable volume. `npm start` validates production secrets, HTTPS, disabled demo mode, and trusted proxy configuration before launching Next.js. SQLite WAL requires durable local storage and one app instance. It is suitable for a single-instance VM/container with attached persistent disk and tested backups. Do not deploy this SQLite configuration on ephemeral serverless storage or scale it across instances. For serverless, multiple instances, or higher concurrent writes, use managed PostgreSQL and migrate the repository/data adapter to a PostgreSQL driver before deployment; that adapter is not included in this SQLite migration.

Terminate HTTPS at a trusted reverse proxy or platform edge, enable its security headers, restrict access to admin endpoints as appropriate, and monitor backups and rate-limit behavior. The application stores session IDs only as HMAC hashes, revokes sessions at logout, sets HTTP-only/SameSite cookies, checks Origin on state-changing requests, hashes new activation codes with scrypt, and rate-limits login, demo login, and activation attempts in SQLite. Rate limits are shared by instances only when they share the same SQLite database; production deployment therefore follows the single-instance constraint above.

## Data migration from Express V1

The source V1 schema uses `cards` and `visits`. This app retains those records and adds `sessions`, `rate_events`, indexes, and SQLite `user_version=2`. It does not export activation-code secrets from their stored hashes. Legacy SHA-256 codes are accepted for activation and then consumed. No review URL or visit data is intentionally rewritten.

1. Stop the old app and make a separate copy of both production and demo DB files. Preserve the originals untouched.
2. Copy the intended database into this app's durable data directory. Keep production and demo databases separate. Inspect with `sqlite3` or a read-only database viewer and record card/visit counts.
3. Run `npm run migrate:sqlite -- /absolute/path/to/repiw.sqlite`. The command creates a timestamped `VACUUM INTO` backup, adds the new tables/indexes and schema version, and checks integrity and row counts. Run it against the demo DB separately if retaining demo fixtures.
4. Point `DB_PATH` at the migrated file and start the Next.js app with `DEMO_MODE=false` for production records. Test login, dashboard counts, representative active/inactive scans, and QR/NFC sources on a staging host.
5. Compare card and visit counts plus dashboard aggregates with the old app. Keep the original DB and generated backup until cutover is accepted and a restore has been rehearsed.
6. Roll back by stopping the new app and restoring the original DB copy and old app. Never copy a live SQLite file without a consistent backup/checkpoint process.

Test data before migration: run `npm run migrate:sqlite -- /path/to/a-copy.sqlite`, not on the only production copy. The utility does not merge databases or move rows between demo and production.

## Tests and verification

```sh
npm test
npm run build
npm run test:e2e
```

Unit tests cover review URL policy and activation-code hash verification. Playwright checks the real sign-in, generation/CSV, activation, QR/NFC redirect tracking, dashboard aggregates, demo path, and responsive layout when a supported browser is installed. Tests use their own temporary database. A passing local build and test suite are necessary checks, not a guarantee of production readiness: hosting persistence, TLS/proxy headers, backup/restore, secrets, and operational monitoring must also be checked for the actual deployment.

Migration-run results: `npm test` passed 4/4; `npx tsc --noEmit` passed; `npm run build` passed; `npm run test:e2e` passed 1/1 in Chrome; `npm audit` reported 0 vulnerabilities. The SQLite migration script passed integrity and row-count checks on copies of both source databases (production copy: 0 cards/0 visits; demo copy: 16 cards/479 visits). These checks do not validate a hosting provider or a production cutover.

## Environment variables

See `.env.example`. Never commit `.env`, SQLite database files, backups, exported card CSVs, or activation codes.
