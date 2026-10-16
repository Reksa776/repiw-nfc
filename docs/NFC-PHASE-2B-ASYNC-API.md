# Phase 2B — Asynchronous API Integration

| | |
|---|---|
| **Document** | `docs/NFC-PHASE-2B-ASYNC-API.md` |
| **Status** | Implemented and verified (API + worker, live) |
| **Date** | 2026-10-16 |
| **Phase status field for the roadmap** | `2B — COMPLETE` |

---

## 1. Design: durable PostgreSQL queue + separate worker, no Redis

Chromium is **never** started inside a Next.js request. `POST /api/resolve` performs validation,
authorization, rate limiting and a single `INSERT`, then returns an opaque job token.

```
browser/UI ──POST /api/resolve──► Next.js route ──INSERT──► PostgreSQL resolution_jobs (status=pending)
                                        ▲                              │
                GET /api/resolve/:token ┘                              │ claim (FOR UPDATE SKIP LOCKED)
                                                                       ▼
                                          scripts/resolver-worker.ts (separate process)
                                                    │  resolveGoogleReviewUrl()  → Chromium
                                                    └─ UPDATE … success | inconclusive | failed | pending(retry)
```

Redis was **not** introduced: the existing architecture already has PostgreSQL, and a durable queue
table gives the same guarantees (durability, visibility, atomic claim, multi-instance safety) with
no new operational dependency.

**No in-memory state is used for correctness.** All job state lives in `resolution_jobs`, so jobs
survive Next.js restarts, multiple app instances and worker crashes.

### Files

| File | Role |
|---|---|
| `src/app/api/resolve/route.ts` | `POST` — request/queue a resolution (never runs a browser) |
| `src/app/api/resolve/[token]/route.ts` | `GET` — poll status by opaque token |
| `src/lib/resolver/jobs.ts` | Job store: create/dedupe, claim, complete, fail+backoff, stale recovery, audit |
| `src/lib/resolver/pg-store.ts` | `pg` adapter (worker/scripts) |
| `src/lib/resolver/server-store.ts` | Next.js `server-only` adapter |
| `scripts/resolver-worker.ts` | Long-running or `--once` worker |

## 2. API surface

### `POST /api/resolve`

Request body (zod): `{ url: string(2048), code?: RP-XXXXXXXXXX, activationCode?: string, cardCode?: RP-XXXXXXXXXX }`

| Caller | Requirement | Result |
|---|---|---|
| Admin session | `cardCode` **or** `code`; the card must exist in the current demo/production scope | job bound to that card, `created_by='admin'` |
| No session (public activation) | `code` **and** a correct `activationCode` for a **non-active** card. The code is *verified, not consumed* | job bound to that card, `created_by='public'` |
| No session, no codes | — | `400` (an unbound job can never be created for an anonymous caller) |
| Wrong activation code | — | `401` |
| Already-active card (public path) | — | `409` |

Response `200`: `{ ok, jobToken, status, reused, cardCode, expiresAt }` with `Cache-Control: no-store`.
Rejections: `400` malformed/invalid body, non-Google or unsupported host; `403` cross-site;
`429` rate limited; `503` **resolver disabled (kill switch)**.

Rate limit: `resolve-request`, **10 per 15 minutes per IP bucket** (DB-backed, same helper as the
rest of the app). CSRF: `sameOrigin(req)` is enforced on the state-changing `POST`.

### `GET /api/resolve/[token]`

Returns `{ ok, status, cardCode, placeId, reviewUrl, businessName, businessAddress, method, errorCode, expiresAt }`.
The token is a 32-byte random secret (`base64url`), so no session is needed; malformed tokens are
`400`, unknown tokens `404`. Only resolution output is exposed — never worker ids, locks, attempts,
SQL or stack traces.

### Job states

`pending` → `running` → `success` | `failed` | `expired` | `inconclusive`

`inconclusive` is a first-class terminal state: the resolver could not *prove* a genuine Place ID, so
the result is an explicit "we don't know" instead of a wrong destination.

## 3. Guarantees implemented

| Requirement | Implementation |
|---|---|
| Prevent duplicate concurrent jobs | `binding_hash = sha256(cardCode \| inputUrl)`; creation takes `pg_advisory_xact_lock(hashtext(binding))` and reuses an existing `pending`/`running`, unexpired job. Backed by a **partial unique index** `uq_resolution_jobs_active ON (binding_hash) WHERE status IN ('pending','running')`. |
| Bounded retries with backoff | `failJob` retries while `attempts < max_attempts` (default 3) scheduling `next_attempt_at = now() + backoffSeconds(attempts)` → 10 s, 20 s, 40 s… capped at 300 s. |
| Stale-job recovery | `recoverStaleJobs()` on worker start and on every claim: `running` jobs whose `locked_at` is older than 5 minutes are requeued; expired jobs become `expired`. |
| Jobs cannot run forever | Every job carries `expires_at` (default 15 min). The claim query requires `expires_at > now()`, and the activation path re-checks expiry inside its transaction. |
| Atomic claim, safe for N workers | `SELECT … WHERE status='pending' AND expires_at > now() AND (next_attempt_at IS NULL OR next_attempt_at <= now()) ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1`, then `UPDATE … status='running', worker_id, locked_at, attempts=attempts+1` inside one transaction. |
| No DB transaction held during browser work | The transaction only claims; the resolver runs **outside** it; a second short transaction records the outcome. |
| Bounded resource usage | `RESOLVER_MAX_CONCURRENCY` (1–4), worker pool `max: 2`, hard per-job timeout, one browser context per job. |
| Granular failure isolation | A crash inside `processOne()` is caught, recorded via `failJob`, and the worker keeps polling. |
| Graceful shutdown | `SIGINT`/`SIGTERM` flip the loop flag: the current job finishes, then the pool closes. |

## 4. Worker lifecycle

```
npm run resolver:worker            # long-running poll loop (default poll 2000 ms)
npm run resolver:worker -- --once   # drain all runnable jobs, then exit (backfill/tests)
```

- **Startup:** refuses to start with `PLAYWRIGHT_RESOLVER_ENABLED` unset/0 (kill switch), requires
  `DATABASE_URL`, logs `workerId`, `concurrency` and `timeoutMs`, then runs `recoverStaleJobs()`.
- **Health:** the worker writes no files and exposes no port. Liveness is observable from the data
  plane — every reported job keeps `worker_id`/`locked_at` while running and clears them on
  completion, and the worker logs one line per claim/outcome. A `running` job older than
  `STALE_RUNNING_SECONDS` is itself the crash signal, and is recovered automatically on the next
  worker start or claim. (A dedicated HTTP health endpoint is intentionally **not** added: it would
  be a new exposed surface for no operational gain.)
- **Shutdown:** `SIGTERM` → finish current job → `pool.end()`.
- **Scaling:** safe to run multiple processes/instances; `FOR UPDATE SKIP LOCKED` + the partial
  unique index guarantee one claim per job. Concurrency per process is capped, so scale by adding
  processes, not by raising `RESOLVER_MAX_CONCURRENCY` blindly.
- **No separate HTTP service means no shared secret to manage.** If the resolver is ever extracted
  into its own service, `RESOLVER_SHARED_SECRET` + an internal-only bind address would be required;
  that is deliberately **not** implemented here (nothing to secure today).

## 5. Verification

All commands below were executed and their exit codes checked.

| Check | Command | Result |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Job-store unit/integration (real PostgreSQL via PGlite) | `npm test` → `tests/resolver-jobs.test.ts` | 7/7 pass: create+dedupe, single claim, DB-level duplicate block, retry-then-give-up, expire+requeue, audit row |
| Kill switch (worker) | `npx tsx scripts/resolver-worker.ts --once` with the flag off | stderr `refusing to run (kill switch)`, exit 0, no job touched |
| Kill switch (API) | e2e `e2e/resolver-disabled.spec.ts` against a server started **without** the flag | `503` for both payload shapes (3/3 pass) |
| Worker end-to-end (live) | seed a `pending` job, `--once` with the flag on | job `success`, `attempts=1`, `place_id`/`review_url`/business captured, `worker_id`/`locked_at` cleared, 10 443 ms |
| Crash recovery (live) | force a job to `running` with `locked_at = now() - 10 min`, plus an expired job | worker startup logged `expired=1 requeued=1`; the reclaimed job completed on `attempts=2`; the expired job became `expired` |
| No leftover browser | `playwright_chromiumdev_profile*` process/profile-dir set before vs. after the worker | identical set (worker's Chromium fully gone) |
| API integration (mocked) | `e2e/resolver.spec.ts` | 8/8 pass: enqueue latency, dedupe/reuse, pending status, rejections, unauthenticated rejection, rate limit `429`, job→activation binding |
| Live end-to-end | `RESOLVER_LIVE=1 playwright test e2e/live-resolver.spec.ts` | 1/1 pass (see Phase 2F §4) |

Observed live job row:

```json
{ "status": "success", "input_url": "https://maps.app.goo.gl/HihE1JQdDmzBDCVC8",
  "place_id": "ChIJQeGqDPodby4RQBEuhEv7Zjs",
  "review_url": "https://search.google.com/local/writereview?placeid=ChIJQeGqDPodby4RQBEuhEv7Zjs",
  "business_name": "Universitas Islam Negeri Siber Syekh Nurjati Cirebon (UINSSC)",
  "method": "playwright", "attempts": 1,
  "started_at": "2026-10-16T08:03:11.899Z", "finished_at": "2026-10-16T08:03:21.661Z", "seconds": 9.762 }
```

## 6. Limitations

1. **A worker must actually be running** for a job to reach a terminal state. With the flag on and no
   worker, jobs stay `pending` and expire after 15 minutes; the UI times out and offers a retry.
   Deployment MUST supervise the worker (see Phase 2F §7).
2. `attempts` counts claims, not time; a job that keeps being reclaimed after worker crashes could
   exhaust `max_attempts` and surface as `failed`. That is intentional (bounded work).
3. The queue is polled (2 s default), not event-driven — a deliberate simplicity choice for a single
   low-volume feature.
4. `next_attempt_at` uses database time; host clock skew is therefore irrelevant, but the DB must be
   reachable with a synchronous connection (the app already requires this).
