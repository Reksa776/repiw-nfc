# NFC Auto Phase 5 — End-to-End Verification

| | |
|---|---|
| **Date** | 2026-10-17 |
| **Host** | Fedora Linux 44, Node v24.21.0, Chrome `/usr/bin/google-chrome-stable` |
| **Test database** | in-process PostgreSQL (PGlite) on `127.0.0.1:5433` — **never production** |
| **Production touches** | read-only schema/row-count queries only; no migration, no write, no deploy |
| **Verdict** | **CONDITIONAL GO** (see §7) |

## 1. Required real-world case

Input: `https://maps.app.goo.gl/fWWYKH1dN7TCHQ8V9`

| Step | Evidence | Result |
|---|---|---|
| Share link → real business | `Universitas Islam Negeri Siber Syekh Nurjati Cirebon (UINSSC)` | PASS |
| Genuine Place ID | `ChIJQeGqDPodby4RQBEuhEv7Zjs` | PASS |
| Direct review URL | `https://search.google.com/local/writereview?placeid=ChIJQeGqDPodby4RQBEuhEv7Zjs` | PASS |
| Independent identity check | `maps/place/?q=place_id:…` opened the same business and Feature ID | PASS |
| Admin confirmation in UI | “Bisnis terverifikasi” → “Ini bisnis yang benar” | PASS |
| Card activation | card `active=1`, `resolution_status=verified`, provenance stored | PASS |
| No leftover Chromium | 0 profile processes after each resolution | PASS |

Full UI live test runtime: 23.1 s; resolver worker time 9.5 s; probe peak Chromium RSS 1.34 GB.

## 2. Commands and results

All commands were run from `/home/reksa/repiw-nextjs-project`.

| Check | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | **exit 0**, no diagnostics |
| Unit + integration | `npm test` | **42 passed** (4 files: resolver, client-state, jobs/migrations, security) |
| Production build | `npm run build` | **exit 0**, all routes compiled |
| Mocked e2e | `REPIW_TEST_DATABASE_URL=… npx playwright test` | **15 passed, 2 skipped** (live tests gated) |
| Live e2e | `REPIW_TEST_DATABASE_URL=… npm run test:e2e:live` | **2 passed** (API path + full UI path) |
| Migrations, clean DB | `DATABASE_URL=… npm run db:migrate` | **schemaVersion 8** |
| Migrations, v5 upgrade | throwaway v5 DB with active card + visits, run twice | **exit 0 both runs**, card/visits unchanged |
| Worker health | `--check` with no/live/stopped worker | **1 / 0 / 1** as designed |
| Graceful shutdown | SIGTERM to worker | current job finished, heartbeat removed, process exited |
| DB readiness | `npm run db:status` | test DB `ok:true` (v8); production `ok:false` (v5) |

No lint script exists in this repository, so no lint result is claimed.

## 3. Required scenario matrix

| Scenario | Coverage | Result |
|---|---|---|
| Required Maps share URL | live probe + live API e2e + live UI e2e | PASS |
| Invalid Google Maps URL | `tests/resolver.test.ts`, `e2e/resolver.spec.ts` (look-alike, `http`, non-Maps) | PASS |
| Non-Google URL | resolver unit + e2e (`evil.example`, `google.com.attacker.example`) | PASS |
| Resolver disabled | `e2e/resolver-disabled.spec.ts` (API + UI + manual fallback) | PASS |
| Worker offline | e2e job expiry + UI short-circuit to “worker tidak aktif” | PASS |
| Expired job | unit job lifecycle + e2e polling terminal state | PASS |
| Duplicate resolution attempts | unit partial unique index + e2e `reused: true` | PASS |
| Repeated activation requests | e2e activate-once + 409 on second attempt | PASS |
| Existing active cards | e2e destination update preserves code/state/visits; v5 upgrade test | PASS |
| Manual official review URL | e2e manual activation path (`search.google.com/local/writereview`, `g.page/r/…/review`) | PASS |
| NFC tap without Chromium | e2e manual path asserts tap redirect; no resolver import in `/c/[code]` | PASS |
| Business name/URL/confirmation UI | new live UI test | PASS |
| Rate limiting | e2e resolve/activation rate-limit tests | PASS |
| Migration idempotency | throwaway v5 DB run twice | PASS |
| Production readiness | read-only status | **NOT READY** (v5; worker absent) |

## 4. What the live tests do **not** prove

1. Google Maps internals are undocumented and may change; a future change legitimately degrades to
   `inconclusive`. This is by design, not a hidden failure.
2. Google Places API confirmation (`playwright+places`) was not exercised (no key, not required).
3. Concurrency > 1, soak/load, and real-host proxy/timeout behaviour were not tested.
4. No production migration, Vercel deployment, or production worker was performed.
5. Review submission itself requires a Google login and was not attempted.
6. The worker host's outbound IP reputation can affect Google's anti-automation responses over time.

## 5. Regression safety

- Manual activation still works with direct review URLs (e2e).
- Active cards are never silently re-pointed: the destination editor previews old → new and requires
  confirmation (e2e).
- A Maps/share URL cannot be stored as a review destination; the API rejects it without a completed
  resolution job (e2e + activation code).
- The activation transaction still consumes the one-time code exactly once under a row lock and
  re-validates the job inside the transaction.

## 6. Artifacts

| Artifact | Location |
|---|---|
| Phase 1 audit | `docs/NFC-AUTO-PHASE-1-AUDIT.md` |
| Phase 2 resolution | `docs/NFC-AUTO-PHASE-2-RESOLUTION.md` |
| Phase 3 worker | `docs/NFC-AUTO-PHASE-3-WORKER.md` |
| Phase 4 deployment readiness | `docs/NFC-AUTO-PHASE-4-DEPLOYMENT-READINESS.md` |
| Release checklist | `docs/NFC-AUTO-RELEASE-CHECKLIST.md` |
| Worker deployment | `deploy/README.md` |
| Live acceptance tests | `e2e/live-resolver.spec.ts` |

## 7. Final verdict: CONDITIONAL GO

The application code, resolver, queue, worker, activation transaction, UI states and migration path
are verified locally and live. The feature is **not production-ready until the following conditions
are met and approved**:

| # | Blocker | Owner action |
|---|---|---|
| 1 | Production schema is **v5**; migrations 6–8 are not applied | Take a verified backup, run `npm run db:migrate` in an approved window, confirm `db:status` → v8 |
| 2 | No external worker is provisioned or running | Install per `deploy/README.md`, start the service, confirm `--check` exits 0 |
| 3 | Vercel production env connectivity not verified from here | Confirm `DATABASE_URL` points at the same database; keep `PLAYWRIGHT_RESOLVER_ENABLED=0` until 1–2 pass |
| 4 | `pg_dump` absent on the host | Install `postgresql-client` before the production backup |
| 5 | Explicit approval to enable the resolver | Set `PLAYWRIGHT_RESOLVER_ENABLED=1` in Vercel and on the host only after the checks above |

Once items 1–5 are complete and the production smoke test in the release checklist passes, the
verdict can move to **GO**.
