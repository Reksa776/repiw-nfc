// Standalone resolution worker.
//
// Runs OUTSIDE the Next.js request path. This process is the ONLY place Chromium is ever started,
// so it must be deployed on a host that allows a long-running process (VPS, container, Railway,
// Fly.io, Render worker, ...). It is deliberately NOT a Vercel Function: serverless invocations are
// time-bounded and cannot host a browser, a poll loop, or a durable queue consumer.
//
// It polls the PostgreSQL `resolution_jobs` table, claims one job at a time with FOR UPDATE SKIP
// LOCKED, runs the headless resolver, records the outcome, and writes a liveness heartbeat to
// `resolver_workers` (read by the Next.js API to answer "is a worker consuming the queue?").
//
// Usage:
//   npm run resolver:worker            # long-running poll loop (supervise this)
//   npm run resolver:worker -- --once  # drain pending jobs, then exit (tests / backfill)
//   npm run resolver:worker:check      # health probe, exit 0 when healthy (systemd/Docker)
//   npm run resolver:worker -- --print-config   # print effective config (no secrets)

import 'dotenv/config';
import os from 'node:os';
import { Pool } from 'pg';
import { resolverConfig } from '../src/lib/resolver/config';
import { resolveGoogleReviewUrl } from '../src/lib/resolver/index';
import { claimNextJob, completeJob, failJob, recoverStaleJobs } from '../src/lib/resolver/jobs';
import { createPgJobsDb } from '../src/lib/resolver/pg-store';
import { WORKER_HEARTBEAT_MS, WORKER_STALE_SECONDS, heartbeatWorker, readWorkerHealth, retireWorker } from '../src/lib/resolver/worker-health';

const ONCE = process.argv.includes('--once');
const CHECK = process.argv.includes('--check');
const PRINT_CONFIG = process.argv.includes('--print-config');
const POLL_MS = Number(process.env.RESOLVER_POLL_MS || 2000);
const WORKER_ID = `${os.hostname()}-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;

const config = resolverConfig();

if (PRINT_CONFIG) {
  // No secrets are printed: only booleans and numbers the operator needs to verify the host.
  console.log(JSON.stringify({
    enabled: config.enabled,
    timeoutMs: config.timeoutMs,
    maxConcurrency: config.maxConcurrency,
    headless: config.headless,
    browserPath: config.browserPath,
    placesApiKeyConfigured: Boolean(config.placesApiKey),
    databaseUrlConfigured: Boolean(process.env.DATABASE_URL?.trim()),
    pollMs: POLL_MS,
    workerHeartbeatMs: WORKER_HEARTBEAT_MS,
    workerStaleSeconds: WORKER_STALE_SECONDS,
  }, null, 2));
  process.exit(0);
}

if (!config.enabled) {
  console.error('[resolver-worker] PLAYWRIGHT_RESOLVER_ENABLED is not set to 1 — refusing to run (kill switch).');
  // --check reports "not healthy" so a supervisor/healthcheck can see the kill switch explicitly.
  process.exit(CHECK ? 2 : 0);
}

const DATABASE_URL = process.env.DATABASE_URL?.trim();
if (!DATABASE_URL) {
  console.error('[resolver-worker] DATABASE_URL is not set.');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL, max: 2, application_name: 'repiw-resolver-worker' });

const db = createPgJobsDb(pool);

let running = true;
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    console.log(`[resolver-worker] ${signal} received, finishing current job then exiting.`);
    running = false;
  });
}

function log(...args: unknown[]) {
  console.log(`[resolver-worker ${WORKER_ID}]`, ...args);
}

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let heartbeatWarningLogged = false;

/** Publish liveness. Failures are logged once and never stop resolution work. */
async function beat(): Promise<void> {
  try {
    await heartbeatWorker(db, { workerId: WORKER_ID, hostname: os.hostname(), concurrency: config.maxConcurrency });
  } catch (error) {
    if (!heartbeatWarningLogged) {
      heartbeatWarningLogged = true;
      const message = error instanceof Error ? error.message : String(error);
      // The most common cause is the heartbeat migration not being applied yet. Resolution still
      // works; only the API's "worker availability" hint degrades to `null`.
      console.error(`[resolver-worker] heartbeat failed (${message}). Is migration 8 (resolver_worker_heartbeat) applied?`);
    }
  }
}

function startHeartbeat(): void {
  void beat();
  if (!heartbeatTimer) heartbeatTimer = setInterval(() => { void beat(); }, WORKER_HEARTBEAT_MS);
}

async function stopHeartbeat(): Promise<void> {
  if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
  await retireWorker(db, WORKER_ID).catch(() => undefined);
}

async function processOne(): Promise<boolean> {
  const job = await claimNextJob(db, WORKER_ID);
  if (!job) return false;
  const started = Date.now();
  log(`claim job #${job.id} (attempt ${job.attempts}/${job.max_attempts}) url=${job.input_url}`);
  try {
    const result = await resolveGoogleReviewUrl(job.input_url, { ...config, enabled: true });
    if (result.status === 'success') {
      await completeJob(db, job.id, result);
      log(`job #${job.id} success placeId=${result.placeId} method=${result.method} ${Date.now() - started}ms`);
    } else {
      const outcome = await failJob(db, job, result.errorCode || 'no_place_id', result.errorMessage || 'Resolution was inconclusive.');
      // Terminal-but-not-failed (inconclusive) is recorded as success-less without retrying forever.
      if (result.status === 'inconclusive') {
        await completeJob(db, job.id, result);
        log(`job #${job.id} inconclusive code=${result.errorCode}`);
      } else {
        log(`job #${job.id} ${outcome} code=${result.errorCode}`);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected resolver error.';
    const outcome = await failJob(db, job, 'internal_error', message);
    log(`job #${job.id} errored (${outcome}): ${message}`);
  }
  return true;
}

async function main() {
  const recovered = await recoverStaleJobs(db);
  log(`startup: expired=${recovered.expired} requeued=${recovered.requeued} concurrency=${config.maxConcurrency} timeoutMs=${config.timeoutMs}`);

  if (CHECK) {
    // Exit codes: 0 = healthy (a fresh heartbeat is visible), 1 = not healthy, 2 = kill switch on.
    await beat();
    const health = await readWorkerHealth(db);
    const healthy = health.available === true;
    console.log(JSON.stringify({ ok: healthy, enabled: config.enabled, workers: health.workers, lastSeenSecondsAgo: health.lastSeenSecondsAgo, workerId: WORKER_ID }, null, 2));
    await stopHeartbeat();
    await pool.end();
    process.exit(healthy ? 0 : 1);
  }

  startHeartbeat();

  if (ONCE) {
    let processed = 0;
    while (await processOne()) processed++;
    log(`--once complete: processed ${processed} job(s)`);
    await stopHeartbeat();
    await pool.end();
    return;
  }

  while (running) {
    let didWork = false;
    try {
      didWork = await processOne();
    } catch (error) {
      log('poll error:', error instanceof Error ? error.message : error);
    }
    if (!didWork) await sleep(POLL_MS);
  }
  await stopHeartbeat();
  await pool.end();
  log('stopped.');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch(async (error) => {
  console.error('[resolver-worker] fatal:', error instanceof Error ? error.message : error);
  await stopHeartbeat().catch(() => undefined);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
