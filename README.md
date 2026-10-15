# REPIW V1 · Next.js + Supabase

REPIW manages Google Review NFC/QR cards, one-time activation codes, scan tracking, exports, and an admin workspace. The current responsive UI, Indonesian/English setting, loading transitions, dashboard, and demo flow are kept. The app now connects to Supabase PostgreSQL from server-side code through `pg`.

## Connect Supabase

1. In Supabase, create or open your project, click **Connect**, and copy the PostgreSQL connection URI. Use the connection mode that matches your host. Do not construct the host or username manually; copy the complete URI. See the [Supabase connection guide](https://supabase.com/docs/guides/database/connecting-to-postgres).
2. Copy `.env.example` to `.env`. Paste the URI into `DATABASE_URL`, replace the password placeholder if present, and URL-encode special characters in the password. Keep it private; never prefix it with `NEXT_PUBLIC_`.
3. Set `SESSION_SECRET` to at least 32 random bytes. For local use, keep `BASE_URL=http://localhost:3000` and `DEMO_MODE=true`.
4. Run these from the project directory:

   ```sh
   npm install
   npm run db:migrate
   npm run db:seed -- admin
   npm run dev
   ```

The seed asks for the admin password twice without displaying it; use at least 8 characters. Open `http://localhost:3000/admin` and sign in as `admin`. To use a different username, pass it after `--`, for example `npm run db:seed -- reksa`.

`npm run db:migrate` is versioned and safe to rerun. It upgrades older Supabase schemas by adding the admin reference to `sessions`, normalizing a legacy boolean `cards.active` column, and adding NFC registration timestamps. Existing sessions without an admin link are cleared, so sign in again after that upgrade. Admin accounts all have the same dashboard access; this app does not apply per-role feature restrictions.

## View data

Open **Table Editor** in the Supabase dashboard. The migration creates `cards`, `visits`, `admins`, `sessions`, `rate_events`, `schema_migrations`, and `data_imports` in `public`. Demo and production cards share the database but are separated by the `demo` field; dashboard data and QR export follow `DEMO_MODE`. Use separate Supabase projects if you need stronger isolation.

The project uses the server-side `pg` driver and `DATABASE_URL`; it does not use `@supabase/supabase-js` or expose database credentials in the browser.

## Existing flows

- `/`: landing page with language switcher and loading animation.
- `/admin`: database-backed login, card counts, card library, QR downloads, analytics, settings, and demo controls.
- `/flow-preview` (`/demo`): interactive admin, buyer, customer, analytics, and error walkthrough.
- `/c/RP-...?src=qr` or `?src=nfc`: activation for inactive cards; active cards record the source and redirect. Demo cards open `/demo-review`.
- `/api/admin/generate`: unique card IDs and one-time activation codes; QR PNG/ZIP and CSV export.
- In the admin card list, **Reactivate** rotates the activation code and returns the card to inactive status; save the new code CSV because it is shown once. **Delete** removes the card and its visits, so its QR/NFC URL stops working. Deleting a database record does not erase the physical NFC tag; overwrite it separately if reusing it.
- Dashboard → **Cards** → **Program an NFC card**: choose a generated card. Android Chrome can write directly to a writable NDEF tag over HTTPS. Other phones get the card's NFC URL to paste into a native NFC writer app. The database marks the card as detected when the tag URL is first opened; browsers cannot read the tag's hardware UID.
- `/api/activate`: validates and consumes a one-time activation code.
- Activation codes come from the generated card batch CSV and should be printed with the physical card. After activation, the business review link is shown as a direct button. Customers choose their own genuine rating on Google; the app does not preselect or submit a five-star review.

Download the generated CSV right away. Codes appear once; the database stores only hashes. Put the `?src=qr` URL in the QR code and the matching `?src=nfc` URL on the NFC chip.

## Import existing MySQL or SQLite data

Back up the source and stop writes before importing. Run `npm run db:migrate` first. To transfer the old MySQL databases, keep their existing `MYSQL_*` source settings in `.env` and run each source exactly once:

```sh
npm run db:import-mysql -- demo
npm run db:import-mysql -- production
```

The MySQL importer maps visits by card code, so the demo and production databases can go into one Supabase project. It preserves card state, review URLs, activation hashes, and visit history; it skips admin records, sessions, and rate-limit history. Run the seed command to create a fresh admin in Supabase. `mysql2` is a development-only dependency for this one-time importer; the app runtime uses PostgreSQL only. Stop writes and import once. The fingerprint prevents an identical import from being repeated, but new source visits after an import would be appended again.

For older SQLite sources, use `npm run db:import-sqlite -- /absolute/path/to/repiw.sqlite`. It also maps visits by card code and skips sessions and rate-limit history. Keep source copies and verify totals in Table Editor before cutover. Do not use the SQLite importer against a MySQL database.

## Production notes

Set production secrets through the host's secret manager: `NODE_ENV=production`, `DEMO_MODE=false`, an HTTPS `BASE_URL`, `DATABASE_URL`, a random `SESSION_SECRET`, and `TRUST_PROXY=true` only behind a trusted proxy. Keep `PG_POOL_SIZE` within the connection budget across all app instances.

`npm start` checks configuration but does not test the Supabase connection or prove production readiness. Verify connection mode, TLS, backups/restore, database permissions, proxy headers, and monitoring in the deployed environment. The server database role, not browser RLS, authorizes these SQL queries.

## Verification

```sh
npm test
npx tsc --noEmit
npm run build
```

End-to-end tests need `REPIW_TEST_DATABASE_URL` set to an isolated test database. No Supabase credentials were available in this workspace, so database connection, migration, seed, import, and deployment have not yet been verified.
