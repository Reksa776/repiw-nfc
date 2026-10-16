// Standalone resolution worker.
//
// Runs OUTSIDE the Next.js request path: it polls the PostgreSQL `resolution_jobs` table, claims
// one job at a time with FOR UPDATE SKIP LOCKED, runs the headless resolver, and records the
// outcome. Job state is entirely in the database, so the worker can be restarted or scaled and
// no job is lost if a Next.js instance restarts.
//
// Usage:
//   npm run resolver:worker            # long-running poll loop
//   npm run resolver:worker -- --once  # drain pending jobs, then exit (tests / backfill)
//
// The worker respects PLAYWRIGHT_RESOLVER_ENABLED as the global kill switch: with the resolver
// disabled it refuses to run.

import 'dotenv/config';
import os from 'node:os';
import { Pool } from 'pg';
import { resolverConfig } from '../src/lib/resolver/config';
import { resolveGoogleReviewUrl } from '../src/lib/resolver/index';
import { claimNextJob, completeJob, failJob, recoverStaleJobs } from '../src/lib/resolver/jobs';
import { createPgJobsDb } from '../src/lib/resolver/pg-store';

const ONCE = process.argv.includes('--once');
const POLL_MS = Number(process.env.RESOLVER_POLL_MS || 2000);
const WORKER_ID = `${os.hostname()}-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;

const config = resolverConfig();

if (!config.enabled) {
  console.error('[resolver-worker] PLAYWRIGHT_RESOLVER_ENABLED is not set to 1 — refusing to run (kill switch).');
  process.exit(0);
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

  if (ONCE) {
    let processed = 0;
    while (await processOne()) processed++;
    log(`--once complete: processed ${processed} job(s)`);
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
  await pool.end();
  log('stopped.');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch(async (error) => {
  console.error('[resolver-worker] fatal:', error instanceof Error ? error.message : error);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
