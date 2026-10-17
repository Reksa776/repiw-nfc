# NFC Auto Phase 1 — Existing Implementation Audit

| | |
|---|---|
| **Date** | 2026-10-17 |
| **Repository** | `/home/reksa/repiw-nextjs-project` (branch `feature/nfc-google-review-resolver`) |
| **Scope** | Read-only audit of the automatic Google Maps → Google Review flow before changes |
| **Result** | Existing implementation is substantially complete and was reused, not rebuilt |

## 1. Method

Every item was read in the working tree and exercised where possible: unit tests, mocked e2e,
and one live resolution of the required input (`https://maps.app.goo.gl/fWWYKH1dN7TCHQ8V9`).
No competing resolver, queue, or activation path was introduced.

## 2. What already existed

| # | Required capability | Where | Audit result |
|---|---|---|---|
| 1 | Google Maps URL validation | `src/lib/resolver/url-policy.ts`, `src/lib/validation.ts` | **Working.** HTTPS-only, Google host allow-list, rejects look-alikes, classifies review/Maps/short/other |
| 2 | Shortlink redirect handling | `expandShortlink()` in `src/lib/resolver/index.ts`, legacy inspector in `src/app/api/activate/route.ts` | **Working.** Manual redirects, max 6 hops, per-hop allow-list re-validation |
| 3 | Chromium Place ID extraction | `src/lib/resolver/browser.ts`, `extract.ts` | **Working live.** Reads only Google's own request URLs/response bodies/HTML; rejects CIDs and Feature IDs |
| 4 | PostgreSQL resolution queue | `src/lib/resolver/jobs.ts`, migrations 6–8 | **Working on a migrated DB.** `FOR UPDATE SKIP LOCKED`, partial unique index, retries, expiry, audit |
| 5 | Worker lifecycle and heartbeat | `scripts/resolver-worker.ts`, `worker-health.ts` | **Working, with one real defect found:** `--check` wrote its own heartbeat and always reported healthy (fixed) |
| 6 | Resolver API endpoints | `src/app/api/resolve/route.ts`, `src/app/api/resolve/[token]/route.ts` | **Working.** Enqueue-only, opaque token polling, kill switch, rate limit, worker availability, lazy expiry |
| 7 | Activation UI | `src/components/activation-form.tsx`, `client-state.ts`, `i18n.tsx` | **Working.** Resolution states, business/URL display, explicit confirmation, cancel, retry, manual fallback |
| 8 | Activation transaction and destination persistence | `src/app/api/activate/route.ts` | **Working.** Row lock, one-time code consumed once, job re-validated inside the transaction, provenance stored |
| 9 | Database migrations 6–8 | `scripts/migrate-postgres.js` | **Present.** 8 migrations total; 6 = provenance, 7 = jobs/audit, 8 = worker heartbeat |
| 10 | Vercel compatibility | `next.config.ts`, API route constraints | **Working.** No Chromium in any request path; build succeeds; worker is a separate process |
| 11 | Manual activation fallback | `src/app/api/activate/route.ts`, activation form | **Working.** Direct official review URL and legacy `g.page/r/…/review` still accepted |
| 12 | Active-card compatibility | `card_destination_provenance` columns nullable; destination editor | **Working.** Additive columns; destination editor preserves code, active state, visits |

## 3. Production state discovered

A read-only probe (`npm run db:status`) against the configured production database returned:

```
schemaVersion: 5
requiredVersion: 8
resolution_jobs: false   resolution_audit: false   resolver_workers: false
cards: 10 total / 4 active
```

This confirms the previous audit: **migrations 6–8 are not applied in production** and the
auto-resolver cannot operate there yet. No migration was executed and no production row was written.

## 4. Defects and gaps found, and what was done

| # | Finding | Impact | Action |
|---|---|---|---|
| 1 | `resolver-worker --check` inserted its own heartbeat before reading health | Health checks reported a dead worker as healthy | Fixed: probe is now read-only; verified exit 1 with no worker, 0 with a live worker, 1 after graceful stop |
| 2 | systemd unit hardcoded `/usr/bin/node`; this host runs Node via nvm and has no `/usr/bin/node` | Unit would fail on this host | Unit now uses `/usr/bin/env node`, with an exact substitution command in `deploy/README.md` |
| 3 | No health timer, no deployment runbook | Worker health was manual only | Added `deploy/repiw-resolver-health.{service,timer}` and `deploy/README.md` |
| 4 | Activation copy still implied a review URL must be known; no Maps-first guidance | Administrator might not realise a Maps share link is enough | Indonesian-first copy updated (§ Phase 2 report) |
| 5 | A missing activation code surfaced as “unsupported link” after a round trip | Misleading state | Client-side precheck with explicit Indonesian message |
| 6 | Automated/live test used an older share link and only the API path | Required acceptance case not covered through the UI | Live spec now uses the required link and drives the real activation form |
| 7 | `pg_dump` is absent on this host | Backup procedure could not be executed here | `npm run db:backup` added; prerequisite documented; fails clearly instead of writing an empty file |
| 8 | Production schema v5, worker not provisioned | Deployment gate | Documented as blockers; not actioned without approval |

## 5. Architecture decision

The audit found a single, coherent architecture already in place:

```
Browser form → POST /api/resolve (Vercel, enqueue only)
            → PostgreSQL resolution_jobs
            → external worker (Chromium) → Google Maps traffic
            → job row (verified Place ID + review URL)
            → GET /api/resolve/[token] (poll)
            → admin confirmation
            → POST /api/activate (row lock + job re-validation)
```

**No second resolver was added.** The work in later phases was limited to verification, one worker
health bug, UX copy/state hardening, deployment operations, and the reports.

## 6. Remaining work handed to the later phases

1. Verify the required real-world link through resolver, queue, worker, UI and activation.
2. Prove the v5 → v8 migration path is additive and idempotent on a throwaway database.
3. Prepare the external-host worker deployment and health procedure.
4. Run typecheck, unit, integration, build, mocked e2e and live e2e.
5. Document the release verdict and blockers.
