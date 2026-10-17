# HOTFIX — NFC Google Review Resolver stuck on Vercel

| | |
|---|---|
| **Document** | `docs/NFC-HOTFIX-VERCEL-RESOLVER.md` |
| **Status** | Diagnosed, fixed, verified locally. **Nothing deployed. No production migration executed. Resolver NOT enabled in production.** |
| **Date** | 2026-10-17 |
| **Host used for verification** | Fedora Linux, Node **v24.21.0**, Google Chrome at `/usr/bin/google-chrome`, npm, Playwright |
| **Verdict** | **CONDITIONAL GO** — see §9 |

> Scope discipline: this work read the production database **read-only** (one `to_regclass` /
> `schema_migrations` metadata query) to confirm the schema state. No production row, migration,
> deployment, environment variable or secret was changed. No secret value appears in this document.

---

## 1. Confirmed root cause

**The failure is a deployment/configuration problem, not a bug in the browser automation.** Four
distinct blockers were confirmed with evidence; the last three are code defects that made the first
one unrecoverable (a spinner instead of an actionable message).

| # | Root cause | Evidence |
|---|---|---|
| **1** | **Migrations 6–7 were never applied to production.** The deployed database is at **schema version 5**; `resolution_jobs` and `resolution_audit` do not exist. | Read-only probe on the configured production connection: `{"cards":"cards","resolution_jobs":null,"resolution_audit":null,"rate_events":"rate_events","schema_version":5}`. Reproduced locally at exactly schema 5 → `POST /api/resolve` returns **HTTP 500 with an empty body**, server log: `relation "resolution_jobs" does not exist`. The browser receives non-JSON and shows the generic *"Resolusi gagal."* |
| **2** | **The resolver is disabled by default** (`PLAYWRIGHT_RESOLVER_ENABLED` unset ⇒ `isEnabled()` false ⇒ `POST /api/resolve` answers **503**). There is no `PLAYWRIGHT_RESOLVER_ENABLED` entry in the project `.env`; `.env.example` documents the default `0`. | `src/lib/resolver/config.ts` requires exactly `1`/`true`; the 503 is asserted by `e2e/resolver-disabled.spec.ts`. A Vercel environment variable cannot be read from this host — the code default is what applies unless somebody set it explicitly, and no documented deployment step does. |
| **3** | **No worker can run on Vercel.** The queue consumer is the separate process `scripts/resolver-worker.ts` (`npm run resolver:worker`). A Vercel deployment runs only the Next.js app, so nothing claims a job: it stays `pending` until it expires. | Architecturally proven: the worker is an npm script; `package.json` has no deployment hook for it; Vercel Functions cannot host a 45 s Chromium job plus a poll loop. Reproduced locally: with the flag on and no worker, the job remained `pending` for its entire lifetime. |
| **4** | **The UI could wait for ever.** (a) `GET /api/resolve/[token]` reported `status:"pending"` even when `expires_at` was already in the past — only the worker ever wrote `expired`, and on Vercel there is no worker; (b) no fetch in the activation form had a timeout, so the 120 s client deadline was only checked *between* polls and a stalled request hung the button indefinitely. | Verified locally: forced `expires_at` into the past → polling still returned `{"status":"pending"}`. `activation-form.tsx` had no `AbortSignal`/timeout on any `fetch`. |
| **5** | **An unswept overdue job permanently blocked retries** for the same card + URL. `createOrReuseJob` ignored in-flight jobs whose `expires_at` had passed, then inserted a new row, which the partial unique index `uq_resolution_jobs_active` rejected. | Reproduced: retry returned `{"code":"resolver_error"}` and the server log showed `duplicate key value violates unique constraint "uq_resolution_jobs_active"`. Pre-fix that same condition produced an HTML 500 page. |

### 1.1 What was **not** the cause

| Candidate | Finding |
|---|---|
| Authentication / CSRF | `sameOrigin()` is satisfied by Vercel's `origin`/`host` pair; the reproduction passed CSRF on the first attempt. Unauthenticated callers are rejected by design (`400`), which is correct. |
| Rate limiting | Only triggers after 10 resolve requests / 15 min per IP and answers a JSON `429` — it never hangs. **However** see §6: `TRUST_PROXY` must be `true` on Vercel or *all* visitors share one bucket. |
| Browser runtime incompatibility | The Next.js app never launches a browser in a request; `/api/resolve` imports no Playwright code and enqueues in <5 s (asserted in e2e). Chromium/Playwright are simply not exercised on Vercel. |
| Fabricated or wrong Place IDs | Not reached at all — no job ever ran. |
| Existing cards / analytics | Untouched; `/c/[code]` is unchanged and the regression suites pass. |

---

## 2. Code changes

| File | Change |
|---|---|
| `scripts/migrate-postgres.js` | **New additive migration 8** `resolver_worker_heartbeat` → `resolver_workers(worker_id PK, hostname, concurrency, started_at, last_seen_at)` + index. Idempotent (`IF NOT EXISTS`). Schema is now **8**. |
| `src/lib/resolver/worker-health.ts` *(new)* | `heartbeatWorker`, `retireWorker`, `readWorkerHealth`, `WORKER_STALE_SECONDS=30`. Degrades to `available: null` when the heartbeat table is missing (pg `42P01`) — a missing migration can never turn a status poll into a 500. |
| `src/lib/resolver/jobs.ts` | `expireJobIfOverdue(token)` for lazy server-side expiry; `createOrReuseJob` now retires overdue `pending`/`running` rows **for its binding before insert** (fixes root cause 5). |
| `src/app/api/resolve/route.ts` | Kill switch checked before any DB work; every rejection carries a stable `code` (`resolver_disabled`, `resolver_not_migrated`, `unsupported_url`, `invalid_request`, `resolver_error`); missing tables → JSON `503`; returns `workerAvailable`. |
| `src/app/api/resolve/[token]/route.ts` | Expires an overdue job before reading it (terminal `expired` without a worker); returns `workerAvailable` while `pending`; JSON `503`/`404` with codes instead of HTML 500s. |
| `scripts/resolver-worker.ts` | Publishes a heartbeat every 10 s and retires it on graceful shutdown; new `--check` (exit `0` healthy / `1` unhealthy / `2` kill switch on) and `--print-config` (no secrets) modes. |
| `src/lib/resolver/client-state.ts` *(new)* | Pure, unit-tested phase machine shared by both UIs. Explicit phases: `resolving`, `success`, `inconclusive`, `failed`, `disabled`, `unsupported`, `timeout`, `unavailable`, `worker_unavailable`, `expired`, `rate_limited`. Timeouts: enqueue 15 s, poll 10 s, deadline 120 s, 3 consecutive poll errors, 5 s no-worker grace. A `success` without a direct review URL is downgraded to `failed` — it can never unlock activation. |
| `src/components/activation-form.tsx` | Bounded fetches, cancellable poll loop (run-id generation guard) with a visible **Batalkan** action, terminal messages for every phase, retry affordance, and an explicit manual-activation fallback ("tempel tautan resmi Google Review"). Manual activation path itself is untouched. |
| `src/components/destination-editor.tsx` | Same state machine/timeouts; cancel action; new terminal messages. Preview-before-write and audit behaviour unchanged. |
| `src/lib/i18n.tsx` | New keys (id + en): `resolverWorkerUnavailable`, `resolverExpired`, `resolverRateLimited`, `resolverCancel`, `resolverManualFallback`; `resolverUnavailable` reworded. |
| `deploy/resolver-worker.service` *(new)* | systemd unit for a separate long-running host (single-process `node --import tsx`, `SIGTERM` handling, `MemoryMax=3G`, `Restart=always`). |
| `package.json` | `resolver:worker:check`, `resolver:worker:config`. |
| `.env.example` | Documents that the worker must run on a separate host, that migrations 6–8 are required, and that `TRUST_PROXY=true` is mandatory on Vercel. |

### 2.1 Behavioural contract after the fix

| Situation | API answer | UI (Indonesian) |
|---|---|---|
| Resolver disabled | `503 {"code":"resolver_disabled"}` | "Resolusi otomatis Google Maps belum aktif di server ini…" + manual-link hint |
| Migrations missing | `503 {"code":"resolver_not_migrated"}` | "Layanan resolusi belum siap…" + manual-link hint |
| No worker heartbeat | job queues, `workerAvailable:false` | after 5 s: "Layanan resolver belum berjalan (worker tidak aktif)…" + retry + manual-link hint |
| Job past its deadline | `status:"expired"` (lazily written by the GET) | "Permintaan resolusi kedaluwarsa…" |
| Google resolution failed | `status:"failed"` + `errorCode` | "Resolusi gagal." / "…Place ID asli…" (`inconclusive`) |
| Client deadline / stalled polls | — | "Resolusi memakan waktu terlalu lama…" / "…tidak dapat dihubungi…" |
| Rate limited | `429` | "Terlalu banyak percobaan resolusi…" |
| Verified | `status:"success"` + direct review URL | business + URL shown, activation unlocked only after confirmation |

---

## 3. Test results (all commands run from the project root)

| Check | Command | Result |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | **exit 0** |
| Unit + SQL integration | `npm test` | **42 passed / 4 files** (was 26/3): `resolver.test.ts` 15, `resolver-jobs.test.ts` 11, `resolver-client-state.test.ts` 12 (new), `security.test.ts` 4 |
| Production build | `npx next build` (built against a **local** test database) | **exit 0**; all routes compiled, including `/api/resolve` and `/api/resolve/[token]` |
| E2E (mocked, 2 servers) | `REPIW_TEST_DATABASE_URL=… npx playwright test` | **15 passed, 1 skipped** (the gated live spec), 1.4 min |
| E2E live (real Google + Chromium) | `REPIW_TEST_DATABASE_URL=… RESOLVER_LIVE=1 npx playwright test e2e/live-resolver.spec.ts` | **1 passed** (1.2 min) — shortlink → worker → genuine `ChIJ…` Place ID → direct review URL → activation |
| Migration to schema 8 on a clean database | `DATABASE_URL=… node scripts/migrate-postgres.js` | `{"ok":true,"schemaVersion":8}` |
| Worker health probe | `npm run resolver:worker:check` | flag off → **exit 2**; flag on + DB reachable → **exit 0** with `{"ok":true,"workers":1}` |
| Worker heartbeat lifecycle | live worker, then `SIGTERM` | `workerAvailable:false` before start → `true` while running → heartbeat row deleted on `SIGTERM` (`stopped.`) |
| Root-cause reproduction | local DB at schema 5, flag on | `POST /api/resolve` → **500**, log `relation "resolution_jobs" does not exist` |
| Retry-blocking bug reproduction | force job overdue, request again | before fix: `duplicate key value violates unique constraint "uq_resolution_jobs_active"`; after fix: new job, stale row `expired` |

### 3.1 Regression coverage added (the five required scenarios)

| Required scenario | Covered by |
|---|---|
| Worker unavailable | `tests/resolver-client-state.test.ts` ("escalates a pending job with no live worker…") + e2e *"a job nobody consumes reports worker availability…"* and *"the activation form stops waiting when no worker is running…"* (real browser, 10.5 s, asserts `active=0` after the failure) |
| Resolver disabled | e2e `resolver-disabled.spec.ts` (API `503` + `code`, plus a real-browser UI test asserting the message and that manual activation still unlocks) |
| Expired resolution job | unit (`status:"expired"`, and `expiresAt` in the past), SQL (`expireJobIfOverdue` idempotent, success untouched), e2e (lazy expiry of a job nobody consumes) |
| Failed Google Maps resolution | unit (`no_place_id`, `timeout`, `google_blocked`, `inconclusive`, success-without-URL ⇒ failed), SQL (retry/backoff/failure) |
| Successful resolution followed by activation | e2e *"verified resolution job activates a card exactly once and stores provenance"* (now also asserts the polled contract) and the live end-to-end spec |

---

## 4. Required Vercel settings

Vercel cannot run the worker. **This hotfix is intended to ship with the resolver disabled**, so the
app stays serverless-only and users are guided to manual activation.

| Variable | Value | Why |
|---|---|---|
| `PLAYWRIGHT_RESOLVER_ENABLED` | **`0`** | Keep the kill switch explicit. Do not enable until §7 is complete. |
| `TRUST_PROXY` | **`true`** | Vercel's edge overwrites `X-Forwarded-For`. Without it every visitor shares the `unknown` rate-limit bucket, so 10 resolve attempts (or 12 activation attempts) would block *everyone* for 15 minutes. |
| `DATABASE_URL` | Supabase pooler URI with `sslmode=require` | Same database as always; no change needed for this hotfix. |
| `SESSION_SECRET`, `BASE_URL` (https), `DEMO_MODE=false` | unchanged | Existing production contract. |
| `GOOGLE_MAPS_API_KEY` | optional | Only used by business-name search (`GET /api/activate?businessSearch=`). Without it that path returns `503` with a clear message; it is **not** required for manual or resolved activation. |
| Chromium / Playwright | **not installed** | The app never launches a browser; `serverExternalPackages` only affects the server bundle. No `maxDuration` change is needed. |

Note: `prestart` (`scripts/check-production-env.js`) does not run on Vercel, so these values are not
validated automatically — confirm them in the project settings.

---

## 5. Migration prerequisites

Migrations 6–8 are **additive and idempotent**: nullable columns on `cards`, two new tables
(`resolution_jobs`, `resolution_audit`) and one new heartbeat table (`resolver_workers`). No column is
dropped, renamed, narrowed or back-filled; existing cards, destinations and visits are untouched.

- Required for the resolver to work at all: **6** (`card_destination_provenance`) and **7**
  (`resolution_jobs_and_audit`).
- Required for the new "worker tidak berjalan" signal: **8** (`resolver_worker_heartbeat`). Without it
  the API still works and reports `workerAvailable: null` (unknown); nothing 500s.
- Target: `schemaVersion: 8`.
- **Not executed here.** Run it only as an approved deployment step (§8) and capture the output.

Verification SQL after migrating:

```sql
SELECT COALESCE(MAX(version),0) AS schema_version FROM schema_migrations;           -- 8
SELECT to_regclass('public.resolution_jobs'), to_regclass('public.resolution_audit'),
       to_regclass('public.resolver_workers');                                     -- all non-null
```

---

## 6. External worker requirements (only when the resolver is eventually enabled)

The worker is a long-running process that is the **only** thing allowed to start Chromium.

| Requirement | Detail |
|---|---|
| Runtime | Node ≥ 22.5, the repository + `npm ci` (or a prebuilt image), `tsx` from devDependencies |
| Browser | `npx playwright install --with-deps chromium`, or `google-chrome-stable`; optional `PLAYWRIGHT_BROWSER_PATH` |
| Memory | ≥ 2 GB free per concurrent job (measured peak **1.55 GB**), keep `RESOLVER_MAX_CONCURRENCY=1` |
| Network | outbound HTTPS to Google only |
| Database | same `DATABASE_URL` as the app (durable queue + heartbeat) |
| Flags | `PLAYWRIGHT_RESOLVER_ENABLED=1`, `RESOLVER_TIMEOUT_MS=45000`, `RESOLVER_MAX_CONCURRENCY=1` |
| Supervision | `deploy/resolver-worker.service` (systemd, `Restart=always`, `MemoryMax=3G`) or an equivalent container service with a restart policy |
| Readiness | `npm run resolver:worker:check` (exit 0), plus a fresh `resolver_workers.last_seen_at` (< 30 s) |
| Health semantics | no open port; the heartbeat row **is** the health signal, and the API reads it |
| Graceful shutdown | `SIGTERM` → finishes the current job → deletes its heartbeat row → exits |
| Scale | add worker processes, not concurrency (`FOR UPDATE SKIP LOCKED` + partial unique index) |

Container alternative (documented, not built here): base image with Node 22 + `npx playwright install
--with-deps chromium`, `CMD ["node","--import","tsx","scripts/resolver-worker.ts"]`, 2 GB memory
limit, restart policy `always`, the same environment file.

---

## 7. Exact deployment / rollback instructions

### 7.1 Deploying this hotfix (resolver stays disabled) — safe, recommended now

1. **Confirm the branch content** contains the files in §2; do not include a `.env`.
2. In Vercel → Project → Settings → Environment Variables, confirm:
   `PLAYWRIGHT_RESOLVER_ENABLED=0`, `TRUST_PROXY=true`, `DATABASE_URL` (pooler + `sslmode=require`),
   `SESSION_SECRET` (≥32 bytes), `BASE_URL` (https), `DEMO_MODE=false`.
3. Deploy the commit via the normal Vercel flow (this document does **not** push or deploy).
4. Smoke-test production (no secret is printed):

   ```bash
   # expects 503 + {"code":"resolver_disabled"} — the kill switch is explicit
   curl -sS -i -X POST https://<host>/api/resolve \
     -H 'Content-Type: application/json' -H "Origin: https://<host>" \
     --data '{"url":"https://maps.app.goo.gl/HihE1JQdDmzBDCVC8"}'

   # expects 400/404 JSON, never an HTML error page
   curl -sS -i https://<host>/api/resolve/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
   ```
5. Open one inactive card's activation page, paste a **direct** Google Review URL
   (`https://search.google.com/local/writereview?placeid=…` or `https://g.page/r/…/review`), confirm
   the card activates, and check a tap still redirects.
6. Paste a Maps shortlink instead: the form must show the Indonesian "belum aktif" message **and** the
   manual-link hint within a second — no spinner.
7. Apply migrations **only when approved** (§5): `DATABASE_URL=… npm run db:migrate` → `schemaVersion: 8`.
   This can be done before or after the app deploy; the app tolerates both states.

### 7.2 Enabling automated resolution later (separate approval, not part of this hotfix)

1. Provision the worker host (§6) and install Chromium.
2. Apply migrations 6–8 (if not already) and confirm `schemaVersion: 8`.
3. Start the worker with `PLAYWRIGHT_RESOLVER_ENABLED=1`; confirm `npm run resolver:worker:check`
   exits 0 and `resolver_workers.last_seen_at` is fresh.
4. Only then set `PLAYWRIGHT_RESOLVER_ENABLED=1` on Vercel (redeploy or re-deploy env).
5. Stage verification: one real shortlink resolves and activates, one kill-switch flip, one pending job
   left to expire, one worker restart mid-job.
6. Watch the `failed`/`inconclusive` rate, worker restarts, `resolution_jobs` growth and host RSS.

### 7.3 Rollback

| Scope | Action | Effect |
|---|---|---|
| Resolver behaviour | set `PLAYWRIGHT_RESOLVER_ENABLED=0` (both hosts) | API answers `503`, worker exits on its next check, backfill refuses; no redeploy required |
| App code | redeploy the previous Vercel build | instant; no data change |
| Worker host | `sudo systemctl stop repiw-resolver` | queue stops being consumed; jobs expire (and now report `expired` instead of hanging) |
| Database | **no rollback needed** | migrations 6–8 are additive (`IF NOT EXISTS`, nullable columns). Do **not** drop the columns/tables — existing rows are untouched and a drop would discard provenance. |
| A wrong destination was stored | re-point it with the admin destination editor (preview → confirm) | audit row recorded in `resolution_audit`; visits/analytics preserved |

**Never** roll back by deleting rows in `cards`, `visits` or `resolution_audit`.

---

## 8. Limitations / not verified here

1. **Vercel environment variables and runtime behaviour were not inspected** (no Vercel access from
   this host). The diagnosis of causes 2–4 is based on the code path, the repository defaults, and a
   local reproduction of the exact production schema state.
2. The production database was read **read-only** (metadata query only). Migrations were **not**
   applied and no row was modified.
3. `GOOGLE_MAPS_API_KEY` remains unconfigured in this environment, so the Places-API confirmation and
   business-name search paths are still only code-reviewed (unchanged from Phase 2F §6).
4. Concurrency > 1 and long soak tests were not measured; keep `RESOLVER_MAX_CONCURRENCY=1`.
5. The live resolution test depends on Google's undocumented Maps payloads; it passed on this host but
   can degrade to `inconclusive` at any time by design (never fabricated).
6. `resolution_jobs` still has no retention policy (§7 of `NFC-PHASE-2D-DATABASE-PERSISTENCE.md`).

---

## 9. Verdict

**CONDITIONAL GO — deploy the app hotfix now with the resolver disabled; NO-GO for enabling automated
resolution until the worker host and migrations exist.**

Why the app hotfix is safe to ship:

- The production failure is reproduced and fixed at its source: the missing-migration path now answers
  an actionable JSON `503` (and the same schema state is handled gracefully) instead of an HTML 500.
- The activation flow can always reach a terminal state: every failure has explicit Indonesian copy,
  a retry action, and a manual-activation fallback; the unbounded spinner and the expired-job/unique
  index deadlock are fixed.
- Manual activation with an already valid official Google Review URL is preserved and covered by
  automated tests; a card is still only marked active inside the activation transaction.
- Nothing was deployed, pushed, migrated in production, or enabled; all changes were verified against a
  local database, and the suites pass (`tsc` 0, 42 unit/integration, build 0, 15 mocked e2e, 1 live e2e).

Conditions before automated resolution is turned on:

1. Worker host provisioned and supervised per §6, with a fresh heartbeat.
2. Migrations 6–8 applied in an approved window → `schemaVersion: 8`.
3. `PLAYWRIGHT_RESOLVER_ENABLED=1` set on the worker **before** the Vercel app, and `TRUST_PROXY=true`
   confirmed on Vercel.
4. Staging checks in §7.2 step 5 completed; a rollback owner is named.
