# Resolver worker deployment (external Linux host)

The Vercel deployment runs the Next.js app only. Chromium never runs inside a Vercel request.
This directory contains the production configuration for the separate, long-running worker that
consumes `resolution_jobs` from the same PostgreSQL database.

## 1. Supervisor choice: systemd, not PM2

Inspected on this host (Fedora 44, 2026-10-17):

| Item | Result |
|---|---|
| `systemctl` | present — systemd 259 |
| `pm2` | **not installed** |
| Node | v24.21.0 via **nvm**, `/usr/bin/node` does **not** exist |
| Chromium | `/usr/bin/google-chrome-stable` present |
| RAM / CPU | 7.0 GB total (2.7 GB available at inspection), 8 vCPU |
| Free disk | 62 GB on `/home` |

Systemd is already the host's init and needs no extra dependency, so the worker is deployed as a
systemd service. If the target host has no systemd (container), run the same `ExecStart` command
under the container runtime's supervisor — do not run it inside Vercel.

Because Node may come from nvm, the unit uses `/usr/bin/env node`. If the service user's `PATH`
does not include Node, replace the executable with the absolute path:

```bash
NODE_BIN="$(command -v node)"          # run as the user that will own the service
sudo sed -i "s|/usr/bin/env node|${NODE_BIN}|" /etc/systemd/system/repiw-resolver.service
sudo sed -i "s|/usr/bin/env node|${NODE_BIN}|" /etc/systemd/system/repiw-resolver-health.service
sudo systemctl daemon-reload
```

## 2. Prerequisites

- Linux host with systemd, ≥ 4 GB RAM for a single resolution, 2 vCPU, 10 GB free disk.
- Node.js ≥ 22.5 (24.x tested) and `npm`.
- The repository at a fixed path (examples use `/srv/repiw-app`).
- Chromium: `sudo dnf install -y google-chrome-stable` (Fedora/RHEL) or
  `sudo apt-get install -y google-chrome-stable` (Debian/Ubuntu), **or**
  `npx playwright install --with-deps chromium`.
- Outbound HTTPS (443) to Google only. No inbound port is opened.
- The **same** `DATABASE_URL` as the Vercel app, using a persistent or session-pooled connection.
  Do not use a transaction pooler: the worker holds a connection and uses `FOR UPDATE SKIP LOCKED`.
- `tsx` is a devDependency, so install with devDependencies (default `npm ci`). Do not use
  `npm ci --omit=dev`.

## 3. Install

```bash
sudo useradd --system --home /srv/repiw-app --shell /usr/sbin/nologin repiw || true
sudo mkdir -p /srv/repiw-app
sudo chown -R repiw:repiw /srv/repiw-app
# deploy the repository into /srv/repiw-app (git clone / release archive), then:
cd /srv/repiw-app
sudo -u repiw npm ci
sudo -u repiw npx playwright install --with-deps chromium     # or install google-chrome-stable

# private environment file (never commit it, never print its contents)
sudo install -m 600 deploy/resolver-worker.env.example /srv/repiw-app/.env
sudoedit /srv/repiw-app/.env      # set DATABASE_URL; keep PLAYWRIGHT_RESOLVER_ENABLED=0 for now

# units
sudo cp deploy/resolver-worker.service /etc/systemd/system/repiw-resolver.service
sudo cp deploy/repiw-resolver-health.service /etc/systemd/system/
sudo cp deploy/repiw-resolver-health.timer /etc/systemd/system/
sudo systemctl daemon-reload
```

Do **not** start the service until migrations 6–8 are applied and the kill switch is approved.

## 4. Enable (after explicit approval only)

```bash
# 1. verify the schema is version 8 (read-only)
npm run db:status

# 2. confirm config without printing secrets (values never appear in argv/ps)
sudo -u repiw sh -c 'set -a; . /srv/repiw-app/.env; set +a; exec node --import tsx scripts/resolver-worker.ts --print-config'

# 3. set PLAYWRIGHT_RESOLVER_ENABLED=1 in /srv/repiw-app/.env AND in Vercel, redeploy the app,
#    then start the worker
sudo systemctl enable --now repiw-resolver

# 4. health: the probe must see the worker's own heartbeat (never its own)
sleep 15
sudo systemctl start repiw-resolver-health.service
sudo systemctl status repiw-resolver-health.service
sudo systemctl enable --now repiw-resolver-health.timer
```

## 5. Operations

```bash
systemctl status repiw-resolver
journalctl -u repiw-resolver -f
journalctl -u repiw-resolver-health.service -n 20
systemctl restart repiw-resolver          # drains the current job first (SIGTERM)
npm run resolver:worker:check             # manual probe, same env as the service
```

- Logs must never contain the database URL. The worker prints job ids, status codes and timings only.
- `--check` exits 0 only when **another** process has a heartbeat younger than 30 s.
- With `PLAYWRIGHT_RESOLVER_ENABLED=0`, the worker exits 2 and the unit does not restart it
  (`RestartPreventExitStatus=2`).
- A worker that dies leaves its last job `running`; `recoverStaleJobs` requeues it after 5 minutes.
- Jobs expire after 15 minutes; an unconsumed job is expired by the polling API, so the UI always
  reaches a terminal state.

## 6. Capacity

Measured on the development host with the required share link (2026-10-17):

| Metric | Value |
|---|---|
| Resolution duration | ~11.5 s |
| Peak Chromium RSS | 1.34 GB (previous runs: 1.55 GB) |
| Node RSS delta | 58 MB |
| Leftover browser processes | none |

Keep `RESOLVER_MAX_CONCURRENCY=1` and `MemoryMax=3G`. The worker deliberately processes one job at a
time even if a higher value is configured in-process; raising concurrency on a small VPS will OOM.
A host with 2.7 GB *available* RAM can run one job but leaves little headroom; 4 GB total is the
practical minimum.

## 7. Rollback

```bash
# stop consuming the queue immediately
sudo systemctl disable --now repiw-resolver repiw-resolver-health.timer

# global kill switch: set PLAYWRIGHT_RESOLVER_ENABLED=0 in Vercel (and on the host), then redeploy
```

The new tables (`resolution_jobs`, `resolution_audit`, `resolver_workers`) and the nullable
`cards` provenance columns are additive. Rollback does **not** require dropping them, and existing
active cards, destinations and analytics must be left untouched. To revert only the app code,
redeploy the previous Vercel build; the old code ignores the new columns/tables.
