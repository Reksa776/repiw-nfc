# Phase 1 — Repository audit

Audit performed 2026-10-19 on `feature/nfc-google-review-resolver` at `dcebbcf` (`origin/feature/nfc-google-review-resolver`). This repository is the actual project named by the request; no checkout or branch switch was made.

## Working tree and history

- The branch is clean relative to its upstream except for one pre-existing untracked file whose literal name resembles a malformed `.gitignore` pattern: `|.next|.tmp|test-results|.(db|sqlite|pem|key)$' `. It was not opened, modified, or removed.
- `.env` is present and deliberately was not read or printed. No secrets were copied into this report.
- Recent history contains the resolver feature and Vercel worker health hotfix. The branch is based on current `origin/main` history; resolver commits are on this feature branch.
- Generated `.next*` directories and installed dependencies exist locally. They are not source-of-truth and were excluded from audit searches.

## Current activation and resolver architecture

- `src/components/activation-form.tsx` supports direct review URL fallback, free-text business search, plus a queued Maps URL resolver with polling, worker states, business confirmation, then activation.
- `src/app/api/resolve/route.ts` authenticates admin requests or validates public card activation codes, enqueues work in PostgreSQL, and reports worker heartbeat.
- `src/app/api/resolve/[token]/route.ts` polls queue status and lazily expires jobs.
- `scripts/resolver-worker.ts` consumes the PostgreSQL queue and calls `src/lib/resolver/index.ts`; the resolver dynamically loads Playwright/Chromium and also has a Places API path.
- `src/app/api/activate/route.ts` keeps manual official review URL activation and accepts only successful, card-bound queued resolution results. It writes card destination and provenance transactionally. `src/app/api/card/[code]/route.ts` only reports public card state; active destination redirects happen in the card page flow and do not call Places.
- Admin destination editing at `src/app/api/admin/cards/[code]/destination/route.ts` also depends on queued resolution and stores provenance.
- Free-text search currently lives in `GET /api/activate?businessSearch=` and requests paid display fields plus Google review URI; it is not the IDs Only approach.

## Schema and migrations

`scripts/migrate-postgres.js` applies eight ordered migrations recorded in `schema_migrations`: initial schema, sessions-admin binding, active flag normalization, NFC registration, encrypted activation codes, destination provenance (v6), resolution queue/audit (v7), worker heartbeat (v8). These are additive except migration 2's deliberate orphan-session cleanup. Resolver reports mention deployed databases at v5; the actual production migration state was not inspected, and no database connection or mutation was attempted. The new plan must tolerate v5, v6, v7, and v8; do not assume v6–v8 have been applied.

Resolver tables have historical data value and must not be dropped. Any retirement should stop application usage and leave old tables/migration history intact.

## Dependencies, flags, operational components

- Runtime `playwright-core` in `package.json`; dev `@playwright/test`; Playwright test scripts and live resolver E2E.
- Worker/probe/backfill scripts: `scripts/resolver-worker.ts`, `resolver-probe.ts`, `backfill-destinations.ts`; `tsx` and PGlite are primarily worker/test infrastructure.
- Runtime resolver imports/config/browser/queue/worker health modules under `src/lib/resolver/`.
- `next.config.ts` explicitly externalizes Playwright packages.
- `PLAYWRIGHT_RESOLVER_ENABLED`, browser path/headless/timeout/concurrency settings and `GOOGLE_MAPS_API_KEY` are present in code/docs/config templates. There are systemd unit/timer/env examples under `deploy/` and old worker-focused operational documentation.
- Playwright also runs general E2E coverage and should remain as a development test tool unless tests are replaced; no runtime browser dependency should remain after migration.

## Test and deployment surface

Unit tests exist for resolver, queue, client polling, security; E2E includes manual flows, worker-backed resolution, live resolver, and disabled-resolver behavior. Deployment instructions include Vercel hotfix guidance and worker provisioning. No live credentials, production DB access, deployment access, or Vercel setting changes were used.

## Implementation implications

Replace the queued Playwright path in the activation form and admin destination editor with a synchronous, bounded server-side HTTP shortlink resolver and authenticated/rate-limited Places API calls using exactly `places.id` for Text Search. Since IDs Only does not identify a business, confirmation must be based on user-entered business context plus administrator review; never choose the first result blindly. Keep direct official review links as fallback. Add only additive schema changes and retain queue tables/history. Deployment must remain opt-in via a new feature flag and require no worker.
