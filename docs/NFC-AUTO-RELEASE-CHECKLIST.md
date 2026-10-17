# NFC Auto — Final Release Checklist

| | |
|---|---|
| **Date** | 2026-10-17 |
| **Feature** | Paste a normal Google Maps link → verified Place ID → direct review URL → secure NFC card activation |
| **Verdict** | **CONDITIONAL GO** — code complete and verified; production prerequisites below are outstanding |

## A. Required Vercel settings

- [ ] `DATABASE_URL` — the same PostgreSQL database the worker will use (server-only).
- [ ] `SESSION_SECRET` — ≥ 32 random bytes (unchanged).
- [ ] `BASE_URL` — production HTTPS origin (unchanged).
- [ ] `PLAYWRIGHT_RESOLVER_ENABLED=0` — keep off until step D/ E pass. Set to `1` only with approval.
- [ ] `RESOLVER_TIMEOUT_MS=45000` (optional), `RESOLVER_MAX_CONCURRENCY=1` (optional).
- [ ] `PG_POOL_SIZE`, `DEMO_MODE`, `TRUST_PROXY` — existing values, unchanged.
- [ ] **No** `PLAYWRIGHT_BROWSER_PATH` and **no** Chromium on Vercel.
- [ ] `GOOGLE_MAPS_API_KEY` is **not** required; do not add it as a release condition.
- [ ] Redeploy the app after any env change (server components read env at runtime, but redeploy keeps
      the release auditable).

## B. Worker environment (names only — never record values)

`DATABASE_URL`, `PLAYWRIGHT_RESOLVER_ENABLED`, `RESOLVER_TIMEOUT_MS`,
`RESOLVER_MAX_CONCURRENCY`, `RESOLVER_HEADLESS`, `RESOLVER_POLL_MS`,
`PLAYWRIGHT_BROWSER_PATH` (optional), `NODE_ENV`, optional `GOOGLE_MAPS_API_KEY`.

Use a persistent/session connection, not a transaction pooler. Keep the file mode `0600`.

## C. Database migration prerequisites

- [ ] Confirm current schema read-only: `npm run db:status` → expect `schemaVersion: 5`.
- [ ] Install `pg_dump` (`postgresql-client`) — currently missing on the host.
- [ ] Take a verified backup: `npm run db:backup`, copy off-host, `gunzip -t` it.
- [ ] Take/confirm a provider snapshot or PITR backup.
- [ ] Announce a maintenance window.
- [ ] **Explicit approval received** to run production migrations.
- [ ] Run `npm run db:migrate` → expect `schemaVersion: 8`, no errors.
- [ ] Rerun `npm run db:status` → expect `ok: true`, all three resolver tables `true`.
- [ ] Verify card counts and active-card destinations are unchanged from before the migration.

The v5 → v8 path was verified on a throwaway database: upgrade exit 0, second run idempotent,
existing active card and visits unchanged, new provenance columns `NULL`.

## D. Worker installation (external Linux host)

- [ ] Host has systemd, Node ≥ 22.5, Chromium, ≥ 4 GB RAM, outbound HTTPS.
- [ ] Repository deployed to a fixed path (e.g. `/srv/repiw-app`); `npm ci` **with devDependencies**
      (`tsx` is required).
- [ ] Private env file installed from `deploy/resolver-worker.env.example`; `DATABASE_URL` set;
      `PLAYWRIGHT_RESOLVER_ENABLED=0`.
- [ ] `command -v node` recorded; if it is not `/usr/bin/node`, substitute it in both units
      (`deploy/README.md` has the exact `sed` command).
- [ ] Units installed: `repiw-resolver.service`, `repiw-resolver-health.service`,
      `repiw-resolver-health.timer`; `systemctl daemon-reload` done.
- [ ] Service is **not** enabled yet (resolver stays off until approval).

## E. Worker health-check procedure

- [ ] Start only after migrations + approval: `sudo systemctl enable --now repiw-resolver`.
- [ ] Wait ≥ 15 s; `npm run resolver:worker:check` exits **0** and shows a fresh heartbeat.
- [ ] Stop the worker; the same probe exits **1** (proves it does not self-heartbeat).
- [ ] `journalctl -u repiw-resolver -f` shows startup, no database URL in logs.
- [ ] `sudo systemctl restart repiw-resolver` prints “SIGTERM received… stopped.” and exits cleanly.
- [ ] `ps` shows no leftover Chromium profile processes after a resolution.
- [ ] Enable the 2-minute timer: `systemctl enable --now repiw-resolver-health.timer`.

## F. Staging verification

- [ ] Apply migrations to staging; `npm run db:status` → `ok: true`.
- [ ] Deploy the app to a staging URL with `PLAYWRIGHT_RESOLVER_ENABLED=1` and a worker.
- [ ] Paste `https://maps.app.goo.gl/fWWYKH1dN7TCHQ8V9`.
- [ ] Confirm the business shown is `Universitas Islam Negeri Siber Syekh Nurjati Cirebon (UINSSC)`.
- [ ] Confirm the generated URL is
      `https://search.google.com/local/writereview?placeid=ChIJQeGqDPodby4RQBEuhEv7Zjs`.
- [ ] Confirm, activate a test card, tap it, and verify the redirect and analytics.
- [ ] Test a non-Google URL, an invalid URL, resolver disabled, worker stopped, and manual
      review-URL activation.

## G. Production smoke tests (after explicit approval)

- [ ] `PLAYWRIGHT_RESOLVER_ENABLED=1` set in Vercel; app redeployed; worker running.
- [ ] Resolve the required share link on a **test** card in production.
- [ ] Business name and Place ID match the staging result.
- [ ] Activate the test card; confirm `active=1`, `resolution_status=verified`, and the exact review
      URL in the database.
- [ ] Tap the card: redirect opens Google Review, no Chromium is launched, analytics recorded.
- [ ] Manual activation with a direct official review URL still works.
- [ ] No `pending`/`running` job is left behind; no Chromium process remains.
- [ ] Monitor for 24 h: job failures, worker heartbeat, Google block rate.

## H. Rollback

- [ ] Immediate kill switch: `PLAYWRIGHT_RESOLVER_ENABLED=0` in Vercel and on the host; redeploy.
- [ ] Stop the worker and timer: `systemctl disable --now repiw-resolver repiw-resolver-health.timer`.
- [ ] Revert only the app code by redeploying the previous Vercel build; old code ignores the new
      additive columns/tables.
- [ ] Do **not** drop `resolution_jobs`, `resolution_audit`, `resolver_workers`, or the provenance
      columns as a shortcut.
- [ ] Restore data only from the verified backup, into a new database first, then switch
      `DATABASE_URL`.
- [ ] Preserve existing active-card destinations and analytics throughout.

## I. Remaining blockers (must stay open until cleared)

| # | Blocker | Status |
|---|---|---|
| 1 | Production schema is v5; migrations 6–8 not applied | **OPEN** |
| 2 | No production resolver worker provisioned/running | **OPEN** |
| 3 | Vercel ↔ production DB connectivity not verified from this environment | **OPEN** |
| 4 | `pg_dump` missing on the host | **OPEN** |
| 5 | Explicit approval to migrate/enable not yet given | **OPEN** |
| 6 | Places API confirmation path unexercised (optional) | accepted gap |
| 7 | Concurrency > 1 / soak not measured | accepted constraint (keep 1) |
| 8 | Direct-written NFC tags cannot be fixed remotely | inherent limitation |

## J. Verdict

**CONDITIONAL GO.** The feature is functionally complete, strictly non-fabricating, secure, and
verified live on the required input through the real UI and worker. It must not be enabled in
production until blockers 1–5 are cleared. Once staging and the production smoke test pass, the
verdict becomes **GO**.
