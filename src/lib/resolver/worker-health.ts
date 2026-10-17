// Worker liveness, derived from a heartbeat table the standalone worker writes.
//
// The Next.js app never talks to the worker; it only reads `resolver_workers`. That lets the API
// tell the UI "no worker is consuming the queue" within seconds instead of leaving the user with a
// spinner until the client deadline. The table is created by migration 8 (Phase hotfix). When the
// migration has not been applied yet, every read degrades to `available: null` (unknown) instead of
// throwing, so a missing migration can never turn a status poll into a 500.

import type { JobTx } from './jobs';

/** A worker that has not written a heartbeat for this long is considered gone. */
export const WORKER_STALE_SECONDS = 30;
/** The worker writes a heartbeat at this interval (well under the stale window). */
export const WORKER_HEARTBEAT_MS = 10_000;

export interface WorkerHealth {
  /** true = a live worker is consuming the queue, false = none, null = cannot tell (table missing). */
  available: boolean | null;
  workers: number;
  /** Seconds since the most recent heartbeat, or null when no worker ever registered. */
  lastSeenSecondsAgo: number | null;
}

export const UNKNOWN_WORKER_HEALTH: WorkerHealth = { available: null, workers: 0, lastSeenSecondsAgo: null };

/** PostgreSQL `undefined_table`: the heartbeat migration has not been applied. */
export function isMissingRelation(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return code === '42P01';
}

export async function heartbeatWorker(
  db: JobTx,
  worker: { workerId: string; hostname: string; concurrency: number },
): Promise<void> {
  await db.execute(
    `INSERT INTO resolver_workers(worker_id,hostname,concurrency,started_at,last_seen_at)
     VALUES(?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
     ON CONFLICT(worker_id) DO UPDATE SET hostname=EXCLUDED.hostname,concurrency=EXCLUDED.concurrency,last_seen_at=CURRENT_TIMESTAMP`,
    [worker.workerId, worker.hostname, worker.concurrency],
  );
}

/** Remove this worker's heartbeat on graceful shutdown so a stopped worker is not reported alive. */
export async function retireWorker(db: JobTx, workerId: string): Promise<void> {
  await db.execute('DELETE FROM resolver_workers WHERE worker_id=?', [workerId]);
}

export async function readWorkerHealth(db: JobTx): Promise<WorkerHealth> {
  try {
    const [row] = await db.query<{ workers: number | string; last_seen_at: string | Date | null; age_seconds: number | string | null }>(
      `SELECT COUNT(*) AS workers,
              MAX(last_seen_at) AS last_seen_at,
              EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - MAX(last_seen_at))) AS age_seconds
       FROM resolver_workers`,
    );
    const workers = Number(row?.workers ?? 0);
    const age = row?.age_seconds === null || row?.age_seconds === undefined ? null : Number(row.age_seconds);
    return {
      available: workers > 0 && age !== null && age <= WORKER_STALE_SECONDS,
      workers,
      lastSeenSecondsAgo: age === null ? null : Math.max(0, Math.round(age)),
    };
  } catch (error) {
    if (isMissingRelation(error)) return UNKNOWN_WORKER_HEALTH;
    throw error;
  }
}
