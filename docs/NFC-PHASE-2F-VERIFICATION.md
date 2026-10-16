# Phase 2F — Security, Testing and Deployment Readiness

| | |
|---|---|
| **Document** | `docs/NFC-PHASE-2F-VERIFICATION.md` |
| **Status** | Executed. All automated suites pass; live resolution verified. No production change was made. |
| **Date** | 2026-10-16 |
| **Host** | Fedora Linux, Node **v24.21.0**, Chromium `/usr/bin/google-chrome` (Google Chrome), npm |
| **Phase status field for the roadmap** | `2F — COMPLETE (local verification). Production rollout NOT executed.` |

Environment note: this repository has **no git metadata** on this host (`git status` → *not a git
repository*), so no commit-level diff exists. Files were identified by direct inspection; the
"changed in this session" lists below are authoritative for this session's edits.

---

## 1. Commands run and their actual results

| Command | Purpose | Result |
|---|---|---|
| `npx tsc --noEmit` | typecheck (no `typecheck` script exists; this is the compiler the build uses) | **exit 0** |
| `npm test` (`vitest run tests`) | unit + SQL integration | **26 passed / 3 files** (15 resolver, 4 security, 7 resolver-jobs) |
| `npm test` — no lint alternative | `package.json` has **no `lint` script** (no ESLint config in the repo) | **not applicable** — reported as such, not as a pass |
| `npx next build` | production build | **exit 0**; `/api/resolve`, `/api/resolve/[token]` and `/api/admin/cards/[code]/destination` compiled |
| `npx playwright test` | full e2e suite (2 servers, 1 worker) | **12 passed, 1 skipped** (the skipped one is the gated live test) |
| `RESOLVER_LIVE=1 npx playwright test e2e/live-resolver.spec.ts` | live end-to-end | **1 passed** |
| `DATABASE_URL=… node scripts/migrate-postgres.js` | apply migrations to a **clean local** PostgreSQL (PGlite over TCP) | `{"ok":true,"schemaVersion":7}` |
| `PLAYWRIGHT_RESOLVER_ENABLED=1 npx tsx scripts/resolver-probe.ts <shortlink>` | live measurement | success in **8 759 ms**, no leftover browser process |
| `npx tsx scripts/resolver-worker.ts --once` (flag off / on) | kill switch then live worker run | refused when off; `success` when on |
| `npx tsx scripts/backfill-destinations.ts` | backfill **dry run** | `mode=DRY-RUN candidates=5`, `resolved 0/5`, **no writes** |
| build env | `DATABASE_URL` was pointed at the local test database for the build so a build-time page/route could never touch production | — |

**No production database, migration, deployment or external account was touched at any point.**

## 2. Security review (implemented controls)

| # | Control | Where | Verified by |
|---|---|---|---|
| 1 | SSRF protection: HTTPS-only, port 443, no credentials, anchored Google-domain allow-list | `src/lib/resolver/url-policy.ts`, `src/lib/resolver/index.ts` | `tests/resolver.test.ts` (look-alike hosts `google.com.attacker.example`, `notgoogle.com`, `http://`, `user:pass@` all rejected); e2e `400`s for `https://evil.example/…`, `https://google.com.attacker.example/…`, `http://maps.app.goo.gl/…` |
| 2 | Redirect-hop validation (`redirect: 'manual'`, ≤6 hops, every hop re-checked) | `expandShortlink` | covered by the URL-policy tests; live run followed the real Google redirect chain legally |
| 3 | DNS/IP safety | Not applicable at this layer: the browser and `fetch` resolve DNS normally, but the allow-list is applied to the hostname **of every hop and of the final URL**, so no internal/loopback/metadata endpoint can be reached through the resolver. No user-supplied host is ever fetched directly | design + tests above |
| 4 | Strict destination allow-list | `isOfficialReviewUrl` (server) and `looksOfficialReview` (client) | A raw Maps/short link can never be stored: e2e `POST /api/activate` with a shortlink → `400`; a job claiming success but carrying a Maps URL → `409`; destination endpoint with a Maps URL → `400` |
| 5 | Resolver authentication | The resolver is **not** an HTTP service; `/api/resolve` requires either an admin session or a valid one-time activation code; unauthenticated callers get `400`; a wrong activation code gets `401` | `e2e/resolver.spec.ts` |
| 6 | CSRF | `sameOrigin()` on `POST /api/resolve`, `POST /api/activate`, `POST /api/admin/cards/[code]/destination` (unchanged helper) | `tests/security.test.ts`, existing `flows.spec.ts` |
| 7 | Rate limiting | DB-backed buckets: `resolve-request` 10/15 min, `activation` 12/15 min, `login` 8/15 min, `review-link-inspect` 20/15 min | e2e asserts `429` after the 10th resolve request from one IP bucket |
| 8 | Resource-exhaustion prevention | concurrency 1–4, hard timeout 5–180 s, one context/page per job, ≤40 response bodies, ≤3 MB per body, worker pool max 2 | measured in §4 |
| 9 | Request timeout | `AbortSignal.timeout` on every outbound HTTP call (4 s per shortlink hop, 8 s Places) and a deadline for the browser | `src/lib/resolver/*` |
| 10 | Browser cleanup | `finally`-block page→context→browser close | §4.4 (profile-set comparison, zero leftovers) |
| 11 | Job ownership and expiry | `binding_hash`, `card_code`, `job_token`, `expires_at`, `created_by`; the activation transaction re-checks token + card + status + URL + expiry | e2e `403`/`400`/`409` matrix |
| 12 | Race-condition protection | activation: `SELECT … FOR UPDATE` + `UPDATE … WHERE active=0` + affected-rows check (pre-existing, preserved); jobs: advisory lock + partial unique index + `FOR UPDATE SKIP LOCKED` | `tests/resolver-jobs.test.ts`, `e2e` replay `409` |
| 13 | Sensitive-data protection | No new secrets in client code; `resolverConfig` is server-only; job tokens are 32-byte random secrets; polling returns only resolution output (never `worker_id`, `locked_at`, `attempts`, SQL or stack traces); `.env.example` documents the new variables (no real values) | code review + `e2e/resolver-disabled.spec.ts` asserts the malformed-token `400` / unknown-token `404` behaviour |
| 14 | Safe error handling | Structured `ResolveErrorCode`; API responses are the app's existing generic messages | code review; UI maps codes to user copy |
| 15 | Resolver kill switch | `PLAYWRIGHT_RESOLVER_ENABLED` gates the API (`503`), the worker (refuses to start) and the backfill script (refuses to run) | `e2e/resolver-disabled.spec.ts` (2 servers) + worker refusal logged |

Notable deliberate decisions: no CAPTCHA solving, no stealth patching, no proxy rotation, no
fabricated Place IDs and no "success" fabricated from a failure. `inconclusive` exists precisely so a
failure is never dressed up as a verification.

## 3. Test matrix (the 12 required categories)

| # | Required test | Where | Mocked or live | Result |
|---|---|---|---|---|
| 1 | Unit tests | `tests/resolver.test.ts` (URL policy, Place-ID validation, identity extraction, backoff/binding/status helpers, kill-switch config), `tests/security.test.ts` | mocked | 19 tests pass |
| 2 | API integration tests | `e2e/resolver.spec.ts` (7 tests: enqueue, dedupe, poll, rejections, auth, rate limit, activation binding), `e2e/resolver-disabled.spec.ts` (3) | mocked / DB-seeded | 10 pass |
| 3 | Resolver integration tests | `tests/resolver-jobs.test.ts` (real PostgreSQL via PGlite: queue, claim, expiry, requeue, audit) | mocked (no Google) | 7 pass |
| 4 | NFC activation E2E tests | `e2e/flows.spec.ts` (generate → activate via UI → tap QR/NFC → demo → logout), `e2e/resolver.spec.ts` verified-job activation | mocked + 1 live | pass |
| 5 | Existing active-card regression tests | `e2e/flows.spec.ts` (active card redirect, stats, replay `409`, `/api/card` 404), destination-update preservation test | mocked | pass |
| 6 | Direct-write compatibility tests | `/c/[code]?src=nfc` tap redirect asserted in `flows.spec.ts` and in `resolver.spec.ts` ("tap path stays browser-free"); `activation-form.tsx` direct-write path unchanged | mocked | pass (see the physical-tag caveat in Phase 2E §4) |
| 7 | Worker restart / recovery tests | `tests/resolver-jobs.test.ts` (expire + requeue) **and** a live crash simulation: a `running` job with a 10-minute-old lock was requeued on worker start and completed on `attempts=2` | mocked + live | pass |
| 8 | Duplicate-job tests | dedupe on repeat request (`reused:true`, same token, e2e), `FOR UPDATE SKIP LOCKED` single-claim test, raw-`INSERT` blocked by the partial unique index | mocked | pass |
| 9 | Incorrect Place-ID rejection tests | `tests/resolver.test.ts` (numeric CID, `0x…:0x…` Feature ID, `ChIJ` too short, `buildReviewUrl` refusal), `e2e/resolver.spec.ts` (job with a Maps URL → `409`) | mocked | pass |
| 10 | Timeout and cleanup tests | `tests/resolver.test.ts` (backoff/clamps), live cleanup measurement §4.4, worker `--once` exit with no leftovers | mocked + live | pass |
| 11 | Resolver-disabled behaviour | `e2e/resolver-disabled.spec.ts` on a second server started **without** the flag: `503` for a shortlink and for an official URL with an admin-shaped payload; token lookups still bounded | mocked | pass |
| 12 | Database migration compatibility tests | `tests/resolver-jobs.test.ts` applies the **real** migration list to PGlite and asserts existing `cards` columns survive plus new tables/indexes; the e2e webServer re-runs `migrate-postgres.js` on every suite start (idempotency) | mocked (real PostgreSQL engine) | pass |

### 3.1 Pre-existing defect found and repaired

`e2e/flows.spec.ts` (not written in this session) asserted **translated English strings** (`'Sign in'`,
`'Good to see you, Admin'`, `'Generate cards'`, `'Aktifkan kartu'`, …) while the UI's default language
is **Indonesian**. It therefore failed at its first click both before and after this session's feature
work — a genuine, reproducible failure of the repository's own E2E suite. It was repaired with
language-agnostic selectors (`button.login-submit`, `.dash-heading h1`, `.generate-form select`,
`form.form-stack > button`, `.side-bottom .icon-button`, …) and the new two-step activation sequence
(resolve → confirm → submit). **No assertion was weakened, removed or skipped**; the resulting spec
passes (25.5 s).

### 3.2 Live tests are explicitly separated

- Mocked/DB-seeded: everything under `npm test` and `npm run test:e2e` (no network to Google).
- **Live:** `scripts/resolver-probe.ts` and `npm run test:e2e:live`
  (`RESOLVER_LIVE=1 npx playwright test e2e/live-resolver.spec.ts`). The live spec is skipped by
  default and pinned to `REPIW_TEST_DATABASE_URL` so its spawned worker can never reach production.

### 3.3 Live results (real network, real Chromium)

Input, exactly as specified and **not** hardcoded to an expected Place ID:

```
https://maps.app.goo.gl/HihE1JQdDmzBDCVC8
```

| Run | Path | Status | Place ID | Duration |
|---|---|---|---|---|
| `resolver-probe.ts` | in-process resolver | `success` / `playwright` | `ChIJQeGqDPodby4RQBEuhEv7Zjs` | 8 759 ms |
| worker `--once` (job #1) | queue → worker | `success` / `playwright` | same | 10 443 ms |
| worker `--once` (stale-recovery replay) | queue → worker | `success` / `playwright` | same | 7 543 ms |
| `e2e/live-resolver.spec.ts` | API → worker (separate process) → activation | `success` / `playwright` | same | 9 762 ms (job `started_at`→`finished_at`); 21–46 s spec wall time incl. worker start (varies with how many queued jobs the `--once` worker drains) |

```json
{ "input": "https://maps.app.goo.gl/HihE1JQdDmzBDCVC8",
  "status": "success", "method": "playwright",
  "placeId": "ChIJQeGqDPodby4RQBEuhEv7Zjs",
  "reviewUrl": "https://search.google.com/local/writereview?placeid=ChIJQeGqDPodby4RQBEuhEv7Zjs",
  "businessName": "Universitas Islam Negeri Siber Syekh Nurjati Cirebon (UINSSC)",
  "businessAddress": "Jl. Perjuangan, Sunyaragi, Kec. Kesambi, Kota Cirebon, Jawa Barat 45132" }
```

Corroboration that this is the **right** place: the HTTP fast path resolves the same shortlink to
`https://www.google.com/maps/place/Universitas+Islam+Negeri+Siber+Syekh+Nurjati+Cirebon+(UINSSC)/…`,
i.e. the independent Maps URL and the browser-derived business name/address agree.

**Failure-path evidence (no fabrication).** The backfill dry run resolved five **fake** demo Maps
URLs (`maps.app.goo.gl/repiwDemoCafe`, `www.google.com/maps/place/Repiw+Demo+Barbershop`,
`g.page/r/…`) and returned `INCONCLUSIVE / no_place_id` for all five, leaving every card unchanged:
`[backfill] resolved 0/5; no writes`. A resolver that guessed would have "succeeded" here; this one
refused.

### 3.4 Measured resource behaviour

| Metric | Measurement |
|---|---|
| Average resolution duration (4 successful live runs) | **~9.1 s** (7.5 s – 10.4 s; median 9.5 s). The audit's 21.7 s reference was not reproduced — this host is faster. |
| Browser startup cost | included in the above; the worker logs a full job in one line, and ~2–4 s of the `--once` wall time is process/tsx/pool startup |
| Peak browser memory | **1 552 MB** RSS summed across the job's Chromium processes (`ps -eo rss,args` filtered to `playwright_chromiumdev_profile`). **This is ~1.9× the audit's 823 MB reference** and is the real capacity input. |
| Node process memory | **+65.5 MB** RSS across a resolution |
| Chromium after completion | **0 MB / 0 processes** — `browserRssAfterMB: 0.0`, `leftOverBrowserProcesses: false`; independently re-checked in the live e2e by comparing the set of `playwright_chromiumdev_profile-*` directories before and after the worker (identical ⇒ the worker left nothing behind) |
| Success/failure rate | live: **4/4 success** on the real shortlink; **5/5 correctly inconclusive** on the fake demo URLs (0 false positives) |
| Concurrency behaviour | Verified only at the default **1** (in-process guard + DB claim). Concurrency >1 was **not** load-tested — see §6. |
| E2E suite duration | full mocked suite **~1.1 min** (2 servers, 1 worker, 12 passing tests) |

## 4. Changes made in this session

**Added**

- `src/components/destination-editor.tsx` — admin destination-update UI (preview → confirm).
- `e2e/resolver.spec.ts`, `e2e/resolver-disabled.spec.ts`, `e2e/live-resolver.spec.ts` — API
  integration, admin-UI, kill-switch and live e2e coverage (11 tests: 10 mocked + 1 gated live).
- `scripts/wait-for-db.js` — readiness helper so the second e2e server never races migrations.
- `docs/NFC-PHASE-2A…2F`, `docs/NFC-GOOGLE-REVIEW-ROADMAP.md`.

**Modified**

- `src/app/api/resolve/route.ts` — **functional fix**: an authenticated admin posting the public
  activation payload (`code` + `activationCode`) produced an **unbound** job, which then failed the
  activation binding check (`403`). The admin path now binds to `cardCode ?? code` and verifies the
  card exists in the current demo/production scope (`404` otherwise).
- `src/components/admin-panel.tsx` — *"Ubah tujuan / Change destination"* action + editor wiring.
- `src/lib/i18n.tsx` — 10 new keys × 2 languages for the destination editor.
- `.env.example` — documented `PLAYWRIGHT_RESOLVER_ENABLED`, `RESOLVER_TIMEOUT_MS`,
  `RESOLVER_MAX_CONCURRENCY`, `RESOLVER_HEADLESS`, `PLAYWRIGHT_BROWSER_PATH`, `RESOLVER_POLL_MS`.
- `playwright.config.ts` — two servers (3182 resolver **enabled**, 3183 resolver **disabled** on the
  production default), `workers: 1` (single-session PGlite), `TRUST_PROXY=true` for test-only
  per-spec rate-limit buckets.
- `scripts/dev-pglite-server.ts` — connection ceiling 10 → 40 (two app pools + worker + specs).
- `package.json` — `test:e2e:live`, `db:dev` scripts.
- `e2e/flows.spec.ts` — language-agnostic repair (§3.1).

**Present in the working tree and verified (not modified in this session):** `src/lib/resolver/*`,
`src/app/api/resolve/**`, `src/app/api/admin/cards/[code]/destination/route.ts`,
`scripts/resolver-worker.ts`, `scripts/resolver-probe.ts`, `scripts/backfill-destinations.ts`,
`tests/resolver.test.ts`, `tests/resolver-jobs.test.ts`, migration entries 6–7, the activation-route
job binding, the activation-form resolver states, `next.config.ts` externals.

## 5. Acceptance criteria check

| Criterion | Verdict |
|---|---|
| Google Maps sharing URLs enter the resolution workflow | ✅ live-verified |
| Genuine verified Place IDs obtained | ✅ `ChIJ…` from Google's own Maps traffic (never from a CID/Feature ID) |
| Correct direct review URLs generated | ✅ `…writereview?placeid=<same id>` asserted in unit, worker and e2e tests |
| Resolved business identity shown before confirmation | ✅ activation form + destination editor; asserted in the UI e2e test |
| Activation secure, code consumed exactly once | ✅ row lock + `active=0` guard; replay `409` |
| Failed resolution never silently stores the Maps URL | ✅ `400`/`409` matrix; backfill left 5 cards unchanged |
| Existing active cards keep working | ✅ regression suite passes; `/c/[code]` untouched |
| NFC tap redirects fast and browser-free | ✅ no resolver import on the tap path; tap asserted with no new browser process |
| Resolver jobs isolated and resource-bounded | ✅ separate worker process, concurrency/timeout/expiry caps |
| Existing auth and CSRF intact | ✅ unchanged helpers, suites pass |
| Database migrations additive | ✅ nullable columns + new tables only; verified on a clean PostgreSQL |
| Existing cards not automatically overwritten | ✅ dry-run backfill; preview-then-confirm API/UI |
| Automated tests pass | ✅ 26 unit/integration + 12 mocked e2e (+1 gated live e2e passing when enabled) |
| No browser left running after a job | ✅ measured 0 leftovers |
| No production deployment | ✅ nothing deployed; migrations **not** applied to production |

## 6. Known limitations / open risks

1. **Peak memory 1.55 GB per resolution.** Size the resolver host for ≥2 GB headroom per concurrent
   job, keep `RESOLVER_MAX_CONCURRENCY=1`, and re-measure on the target host before raising it.
2. **Places API confirmation path is unexercised** — no `GOOGLE_MAPS_API_KEY` was configured, so
   `places-api` / `playwright+places` and the `identity_mismatch` downgrade are code-reviewed only.
   With no key, verification relies on Google's own Maps payloads plus strict Place-ID shape checks.
3. **Concurrency > 1 and soak/load behaviour were not measured.** No queue-depth, latency-under-load or
   long-running soak test was performed.
4. **No gateway/proxy timeout validation on the real host.** The design avoids the issue (the app never
   runs a browser in a request; the UI polls), but the production reverse proxy must still allow the
   polling endpoints.
5. **Google's instability is inherent.** A Maps UI change or an anti-automation interstitial degrades
   resolution to `inconclusive`; the resolver will not bypass either.
6. **Physical direct-written tags cannot be fixed remotely** (Phase 2E §4).
7. **No lint script exists** in the repository, so linting was neither run nor claimed.
8. **`resolution_jobs` has no retention policy yet** (Phase 2D §7).
9. The e2e suite needs an external PostgreSQL (`REPIW_TEST_DATABASE_URL`) and a local Chromium; it is
   not part of `npm test`. Two app servers are started, so the suite takes ~1 minute.

## 7. Deployment readiness (target architecture, not executed)

**Do not deploy to Vercel-style serverless for the worker.** Compatibility was **not** validated on
Vercel and must not be claimed. The analysis is:

- the **Next.js app** (including `/api/resolve`) never launches a browser and only does short DB
  operations, so it stays compatible with the existing `next start` deployment model;
- the **resolver worker** needs a long-lived process with Chromium and therefore requires the existing
  VPS/container model (or a second small worker host). Serverless functions cannot satisfy that.

Steps for a real rollout (each requires separate approval):

1. **Provision the resolver host**: Node ≥22.5, Chromium installed (`dnf install -y
   google-chrome-stable` on Fedora, or `npx playwright install --with-deps chromium`), ≥2 GB free RAM
   per concurrent job, outbound HTTPS to Google only.
2. **Apply migrations** (additive, idempotent) in a maintenance window:
   `npm run db:migrate` → expect `schemaVersion: 7`. Record the rollback plan (the new columns/tables
   are additive; a rollback is "revert the code"; no data rewrite occurs).
3. **Configure environment** on the app host: `PLAYWRIGHT_RESOLVER_ENABLED=1`,
   `RESOLVER_TIMEOUT_MS=45000`, `RESOLVER_MAX_CONCURRENCY=1`, `PLAYWRIGHT_BROWSER_PATH`, and
   `GOOGLE_MAPS_API_KEY` if available (recommended: official confirmation).
4. **Supervise the worker** on the resolver host, e.g.:

   ```ini
   # /etc/systemd/system/repiw-resolver.service
   [Service]
   WorkingDirectory=/srv/repiw-app-v1
   EnvironmentFile=/srv/repiw-app-v1/.env
   ExecStart=/usr/bin/npm run resolver:worker
   Restart=always
   RestartSec=5
   # memory guard: the resolver is the only process allowed to run Chromium
   MemoryMax=3G
   [Install]
   WantedBy=multi-user.target
   ```

   Readiness: `systemctl is-active repiw-resolver`, plus the worker's startup log line and the absence
   of `running` rows older than `STALE_RUNNING_SECONDS`.
5. **Verify on staging** before production traffic: one live resolution end to end, one kill-switch
   flip, one `pending` job left to expire, and one crash-recovery cycle.
6. **Operate**: watch job `failed`/`inconclusive` rates, worker restarts, `resolution_jobs` row growth
   and host RSS. **Kill switch / rollback:** set `PLAYWRIGHT_RESOLVER_ENABLED=0` (API answers `503`,
   worker exits, backfill refuses) — cards fall back to their stored destinations, and the tap path is
   unaffected. No redeploy is needed.
7. **Prefer application-controlled redirects** for all future NFC programming (Phase 2E §4).

## 8. Verdict

**Phase 2A–2F: code complete and verified locally (`CONDITIONAL GO`).**

All six subphases are implemented, all automated suites pass, and the required input
(`https://maps.app.goo.gl/HihE1JQdDmzBDCVC8`) resolves live to a genuine Place ID and a correct direct
review URL, with the verified business identity shown before activation and with zero leftover browser
processes.

The remaining conditions are **deployment/operational, not code**: size and supervise the resolver host
(1.55 GB peak measured), decide on the Places API key (that path is unexercised), and run the additive
migrations and staging checks in §7 under separate approval. Nothing was deployed and no production
database was migrated.
