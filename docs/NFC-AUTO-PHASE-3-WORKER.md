# NFC Auto Phase 3 — Playwright Worker and External Host

| | |
|---|---|
| **Date** | 2026-10-17 |
| **Status** | **IMPLEMENTED AND VERIFIED LOCALLY; NOT DEPLOYED** |
| **Host inspected** | Fedora Linux 44, systemd 259, 8 vCPU, 7.0 GB RAM, 62 GB free on `/home` |
| **Decision** | systemd service on a dedicated host; **not** PM2, **not** Vercel Functions |

## 1. Host inspection and supervisor choice

| Check | Result | Consequence |
|---|---|---|
| `systemctl` | present (systemd 259) | systemd is the native supervisor |
| `pm2` | not installed | do not add a second process manager |
| Node | v24.21.0 via nvm; `/usr/bin/node` **absent** | unit must not hardcode `/usr/bin/node` |
| Chromium | `/usr/bin/google-chrome-stable` present | no Playwright download required on this host |
| Memory | 7.0 GB total, 2.7 GB available at inspection | enough for one job; 4 GB total is the practical minimum |
| Outbound HTTPS | available (DB and Google reachable) | worker can reach Google |
| `pg_dump` | **not installed** | backup prerequisite; install `postgresql-client` before production backup |

The worker is a single Node process. `npx`/`npm run` must not be used in `ExecStart`, because the
wrapper can swallow SIGTERM and leave the worker running (reproduced during testing). The unit uses
`node --import tsx scripts/resolver-worker.ts`, and `deploy/README.md` documents replacing
`/usr/bin/env node` with `command -v node` on nvm hosts.

## 2. Worker behaviour

| Requirement | Implementation |
|---|---|
| Dedicated long-running worker | `scripts/resolver-worker.ts`; never imported by a Next.js route |
| PostgreSQL job consumption | `claimNextJob` with `FOR UPDATE SKIP LOCKED` |
| Heartbeat | Upsert into `resolver_workers` every 10 s; considered live for 30 s |
| Safe retries | Bounded attempts (default 3) with 10/20/40 s backoff, capped at 300 s |
| Expiration | Job TTL 15 min; worker startup sweep + lazy expiry in the polling API |
| Crash recovery | Jobs stuck `running` > 5 min are requeued if not expired |
| Controlled concurrency | One job at a time; `RESOLVER_MAX_CONCURRENCY` clamped 1–4 and used as an in-process guard |
| Graceful shutdown | SIGTERM finishes the current job, retires the heartbeat row, closes the pool |
| Browser cleanup | One context per resolution; page → context → browser closed in `finally`; verified zero leftovers |
| Bounded execution | `RESOLVER_TIMEOUT_MS` (45 s default, 5–180 s), capped body reads, one page |
| No CAPTCHA bypass | Consent/sorry/captcha → `google_blocked`; no stealth/proxy rotation |
| No browser at tap time | `/c/[code]` is a DB read + redirect; never imports the resolver |

## 3. Health check bug found and fixed

Before: `--check` called `beat()` (writing a heartbeat for the **probe itself**), read health, then
deleted it. It therefore reported `ok: true` even when the real worker was dead.

After: the probe only reads `resolver_workers`. Verified:

```
# no worker running
$ npm run resolver:worker:check
{"ok": false, "enabled": true, "workers": 0, "lastSeenSecondsAgo": null}   exit 1

# real worker running
$ npm run resolver:worker:check
{"ok": true, "enabled": true, "workers": 1, "lastSeenSecondsAgo": 6}      exit 0

# SIGTERM to the worker
[resolver-worker] SIGTERM received, finishing current job then exiting.
[resolver-worker …] stopped.
$ npm run resolver:worker:check
{"ok": false, "workers": 0}                                               exit 1
```

This makes the health probe honest and safe to run from systemd or monitoring.

With the kill switch off, the worker exits **2** (not 0), and the unit sets
`RestartPreventExitStatus=2`, so a deliberately disabled resolver cannot become a 5-second
restart loop. Verified: `PLAYWRIGHT_RESOLVER_ENABLED=0 … resolver-worker.ts` exits 2.

## 4. Deployment artifacts

| File | Purpose |
|---|---|
| `deploy/resolver-worker.service` | Long-running worker; `/usr/bin/env node`; `MemoryMax=3G`, `MemoryHigh=2500M`; SIGTERM; restart |
| `deploy/repiw-resolver-health.service` | One-shot read-only heartbeat probe |
| `deploy/repiw-resolver-health.timer` | Runs the probe every 2 minutes |
| `deploy/resolver-worker.env.example` | Secret-free env template (names + placeholders) |
| `deploy/README.md` | Install, enable, operate, capacity, rollback |
| `scripts/db-status.js` | Read-only schema/heartbeat probe (`npm run db:status`) |
| `scripts/db-backup.js` | `pg_dump` streaming backup, 0600, no credentials in `ps` (`npm run db:backup`) |

The service is **not enabled or started** by any script; deployment remains a manual, approved step.

## 5. Capacity

Measured with the required share link:

| Metric | Run A (probe) | Run B (UI live test) |
|---|---|---|
| Duration | 11.5 s | 9.5 s worker / 23.1 s UI test |
| Peak Chromium RSS | 1.34 GB | — |
| Node RSS delta | 58 MB | — |
| Leftover browser processes | 0 | 0 |

Earlier measurements on this project recorded 1.55 GB peak. Keep concurrency at 1 and provide
≥ 4 GB total RAM. A 2 GB VPS is **not** sufficient. Raising concurrency requires a new measurement;
the worker processes one job at a time regardless.

## 6. Security posture

- Worker contacts only Google HTTPS endpoints (allow-list + per-hop redirect validation).
- No inbound port, no public “resolve now” endpoint; `/api/resolve` only enqueues.
- Worker authenticates to PostgreSQL with the server-side `DATABASE_URL`; no shared-secret hop.
- No credentials are logged. `--print-config` prints booleans/numbers only.
- Activation re-validates card code, job binding, job status, review URL, and expiry inside the
  activation transaction.
- Kill switch `PLAYWRIGHT_RESOLVER_ENABLED=0` prevents the API from queueing and the worker from
  starting.

## 7. Remaining operational blockers

1. No production worker has been provisioned or started (requires approval).
2. Production migrations 6–8 are not applied (schema v5).
3. Google Places API confirmation path is implemented but unexercised (optional, not required).
4. Concurrency > 1, soak/load, and real-host proxy timeouts are untested.
5. `pg_dump` must be installed on the host before the backup step.
