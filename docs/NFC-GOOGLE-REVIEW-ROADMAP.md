# NFC Google Review Automation — Roadmap and Phase Index

| | |
|---|---|
| **Document** | `docs/NFC-GOOGLE-REVIEW-ROADMAP.md` (master index) |
| **Feature** | Google Maps sharing URL → verified Google Place ID → direct Google Review URL on an NFC card |
| **Baseline audit** | `docs/NFC-GOOGLE-REVIEW-PLAYWRIGHT-AUDIT.md` (**preserved, unmodified**) |
| **Last updated** | 2026-10-16 |
| **Overall status** | **CONDITIONAL GO** — all phases implemented and verified locally; **nothing deployed**, **no production migration applied** |

This file is intentionally short: status, one-line summaries, blockers, links. Full detail lives in
the individual phase reports.

---

## Phase status

| Phase | Scope | Status | Report |
|---|---|---|---|
| 1 | Read-only audit (pre-existing) | complete | [audit](NFC-GOOGLE-REVIEW-PLAYWRIGHT-AUDIT.md) |
| 2A | Isolated Playwright resolver (verified Place ID, strict allow-list, kill switch) | **COMPLETE** — unit + live verified | [2A](NFC-PHASE-2A-RESOLVER.md) |
| 2B | Asynchronous API + durable PostgreSQL job queue + worker | **COMPLETE** — API/worker verified, incl. crash recovery | [2B](NFC-PHASE-2B-ASYNC-API.md) |
| 2C | Activation UI integration (states, confirmation, no browser at tap time) | **COMPLETE** — browser-driven e2e | [2C](NFC-PHASE-2C-ACTIVATION-UI.md) |
| 2D | Additive migrations, verified destination provenance, one-time code integrity | **COMPLETE** — migrations validated on a clean PostgreSQL | [2D](NFC-PHASE-2D-DATABASE-PERSISTENCE.md) |
| 2E | Non-destructive destination update + dry-run backfill + legacy/direct-write handling | **COMPLETE** — API, UI, dry-run verified | [2E](NFC-PHASE-2E-CARD-COMPATIBILITY.md) |
| 2F | Security, testing, metrics, deployment readiness | **COMPLETE (local)** — all suites green, live run measured | [2F](NFC-PHASE-2F-VERIFICATION.md) |

## One-line summaries

- **2A** — Server-only resolver: HTTPS/Google-allow-listed input → HTTP shortlink expansion → headless
  Chromium reads the **genuine** Place ID from Google's own Maps traffic → optional Places API
  confirmation → `https://search.google.com/local/writereview?placeid=<id>`. CID/Feature IDs are never
  substituted; `inconclusive` is returned instead of guessing. Disabled by default
  (`PLAYWRIGHT_RESOLVER_ENABLED=0` = global kill switch).
- **2B** — `POST /api/resolve` only **queues**; a separate worker claims jobs with
  `FOR UPDATE SKIP LOCKED`, retries with bounded backoff, expires stale jobs and requeues crashed ones.
  All state is in PostgreSQL, so jobs survive restarts and are safe across instances. No Redis.
- **2C** — The existing activation form now resolves, polls, shows the verified business and the
  generated review URL, and requires an explicit *"this is the correct business"* confirmation before
  the card can be activated. Manual official review URLs still work unchanged.
- **2D** — Two additive, idempotent migrations (`card_destination_provenance`,
  `resolution_jobs_and_audit`): nullable provenance columns on `cards`, a job table with a partial
  unique index, and an audit table. Activation still consumes the one-time code exactly once under a
  row lock, and **re-validates the job inside the transaction**.
- **2E** — An authorised destination-update endpoint + admin UI that re-points a card **in place**
  (code, active state, activation history and visit analytics preserved), with an old→new preview and
  explicit confirmation. A dry-run-first, per-card, audited backfill fixes legacy cards. Direct-written
  physical tags cannot be changed remotely — documented explicitly.
- **2F** — Typecheck, migrations, build, 26 unit/integration tests and the full e2e suite pass; the
  required shortlink was resolved live (genuine `ChIJ…` Place ID, ~9 s, 1.55 GB peak, zero leftover
  browser processes). No lint script exists in the repo. Live tests are separated from mocked tests.

## Blockers and open items

| # | Item | Type | Impact |
|---|---|---|---|
| 1 | Production migrations **not applied** (`npm run db:migrate` → expect `schemaVersion: 7`) | deployment gate | feature cannot work in production until run |
| 2 | Resolver worker is **not provisioned/supervised anywhere** yet | deployment gate | jobs stay `pending` and expire without a running worker |
| 3 | Peak browser memory **1.55 GB** per resolution (higher than the 823 MB audit reference) | capacity decision | size the worker host (≥2 GB headroom/job), keep concurrency 1 |
| 4 | Google Places API confirmation path **unexercised** (no `GOOGLE_MAPS_API_KEY`) | verification gap | official confirmation/enrichment unproven; Maps-payload path verified live |
| 5 | Concurrency > 1, soak/load and real-host proxy timeouts **not tested** | verification gap | do not raise `RESOLVER_MAX_CONCURRENCY` without measuring |
| 6 | Direct-written NFC tags (mode B) cannot be fixed remotely | inherent limitation | requires re-tagging; prefer app-controlled `/c/[code]` for new programming |
| 7 | `resolution_jobs` has no retention/cleanup policy | operations | add a retention job before high volume |
| 8 | E2E requires an external PostgreSQL (`REPIW_TEST_DATABASE_URL`) + Chromium | test infrastructure | `npm test` alone does not cover the e2e layer |

## Quick reference

```bash
# local/test database (dev only)
npm run db:dev                              # PGlite over TCP on 127.0.0.1:5433

# migrations (additive, idempotent)
npm run db:migrate                          # expect schemaVersion: 7

# resolver
PLAYWRIGHT_RESOLVER_ENABLED=1 npm run resolver:probe -- https://maps.app.goo.gl/HihE1JQdDmzBDCVC8
npm run resolver:worker                     # supervised, long-running
npm run resolver:worker -- --once           # drain then exit
npm run resolver:backfill                   # dry run (default, no writes)
npm run resolver:backfill -- --apply --yes  # requires explicit approval

# verification
npx tsc --noEmit && npm test && npx next build
REPIW_TEST_DATABASE_URL=… npx playwright test          # mocked e2e
REPIW_TEST_DATABASE_URL=… npm run test:e2e:live        # live Google e2e (gated)
```

## Session checkpoint (for continuation)

If this work is resumed in a new session: phases **2A–2F are complete and verified in this working
tree** on 2026-10-16 (Fedora, Node v24.21.0). No phase is half-applied — the migrations are
idempotent and the resolver is disabled by default, so the tree is safe to leave as-is. Resume at
"Blockers" items 1–5: they are deployment/verification tasks, not code. Re-run
`npx tsc --noEmit && npm test` plus the e2e suites before trusting any of the figures in the phase
reports, since the live numbers depend on Google's current Maps behaviour and the host.
