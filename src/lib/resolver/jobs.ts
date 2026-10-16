// Durable, PostgreSQL-backed resolution job store.
//
// This module contains ONLY SQL logic plus pure helpers, so it can be shared by the Next.js
// route handlers and by the standalone worker process (which supplies its own `pg` pool).
// All job state lives in the database: jobs survive Next.js restarts and multiple instances.

import crypto from 'node:crypto';
import type { ResolveResult, ResolveStatus } from './types';

export type JobStatus = 'pending' | 'running' | 'success' | 'failed' | 'expired' | 'inconclusive';

export interface JobTx {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<{ affectedRows: number; rows?: unknown[] }>;
}
export interface JobsDb extends JobTx {
  transaction<T>(fn: (tx: JobTx) => Promise<T>): Promise<T>;
}

export interface ResolutionJob {
  id: number | string;
  job_token: string;
  status: JobStatus;
  input_url: string;
  card_code: string | null;
  created_by: string;
  place_id: string | null;
  review_url: string | null;
  business_name: string | null;
  business_address: string | null;
  method: string | null;
  attempts: number | string;
  max_attempts: number | string;
  error_code: string | null;
  error_message: string | null;
  expires_at: string | Date;
  created_at: string | Date;
}

/** Human-safe default lifetime for a resolution job. */
export const DEFAULT_JOB_TTL_MS = 15 * 60 * 1000;
export const DEFAULT_MAX_ATTEMPTS = 3;
/** A job stuck in `running` longer than this is presumed dead and requeued. */
export const STALE_RUNNING_SECONDS = 5 * 60;

export function generateJobToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/** Bind a job to the exact card + URL so a job cannot be reused for another card or URL. */
export function bindingHash(cardCode: string, inputUrl: string): string {
  return crypto.createHash('sha256').update(`${cardCode.trim()}|${inputUrl.trim()}`).digest('hex');
}

/** Bounded exponential backoff in seconds (10, 20, 40, ... capped at 300). */
export function backoffSeconds(attempts: number): number {
  return Math.min(300, 10 * 2 ** Math.max(0, attempts - 1));
}

export function isTerminal(status: JobStatus): boolean {
  return status === 'success' || status === 'failed' || status === 'expired' || status === 'inconclusive';
}

/** Map a resolver result to the terminal job status it should record. */
export function statusForResult(result: ResolveResult): JobStatus {
  if (result.status === 'success') return 'success';
  if (result.status === 'inconclusive') return 'inconclusive';
  return 'failed';
}

export async function createOrReuseJob(
  db: JobsDb,
  params: { inputUrl: string; cardCode: string | null; createdBy: string; ttlMs?: number; maxAttempts?: number },
): Promise<{ job: ResolutionJob; reused: boolean }> {
  const binding = bindingHash(params.cardCode ?? '*', params.inputUrl);
  const ttlMs = params.ttlMs ?? DEFAULT_JOB_TTL_MS;
  const maxAttempts = params.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;

  return db.transaction(async (tx) => {
    // Serialize per binding so two concurrent requests cannot both create an active job.
    await tx.query('SELECT pg_advisory_xact_lock(hashtext(?))', [binding]);

    const [existing] = await tx.query<ResolutionJob>(
      `SELECT * FROM resolution_jobs WHERE binding_hash=? AND status IN ('pending','running') AND expires_at > CURRENT_TIMESTAMP ORDER BY id DESC LIMIT 1`,
      [binding],
    );
    if (existing) return { job: existing, reused: true };

    const token = generateJobToken();
    const inserted = await tx.query<ResolutionJob>(
      `INSERT INTO resolution_jobs(job_token,status,input_url,binding_hash,card_code,created_by,max_attempts,expires_at)
       VALUES(?,'pending',?,?,?,?,?, CURRENT_TIMESTAMP + (?::double precision * INTERVAL '1 millisecond'))
       RETURNING *`,
      [token, params.inputUrl.trim(), binding, params.cardCode, params.createdBy, maxAttempts, ttlMs],
    );
    return { job: inserted[0], reused: false };
  });
}

export async function getJobByToken(db: JobTx, token: string): Promise<ResolutionJob | null> {
  const [row] = await db.query<ResolutionJob>('SELECT * FROM resolution_jobs WHERE job_token=? LIMIT 1', [token]);
  return row ?? null;
}

export async function getJobById(db: JobTx, id: number | string): Promise<ResolutionJob | null> {
  const [row] = await db.query<ResolutionJob>('SELECT * FROM resolution_jobs WHERE id=? LIMIT 1', [id]);
  return row ?? null;
}

/** Expire overdue jobs and requeue jobs stuck in `running` (e.g. after a worker crash). */
export async function recoverStaleJobs(db: JobTx): Promise<{ expired: number; requeued: number }> {
  const expired = await db.execute(
    `UPDATE resolution_jobs SET status='expired', finished_at=CURRENT_TIMESTAMP, worker_id=NULL, locked_at=NULL, updated_at=CURRENT_TIMESTAMP
     WHERE status IN ('pending','running') AND expires_at <= CURRENT_TIMESTAMP`,
  );
  const requeued = await db.execute(
    `UPDATE resolution_jobs SET status='pending', worker_id=NULL, locked_at=NULL, next_attempt_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP
     WHERE status='running' AND locked_at IS NOT NULL AND locked_at < CURRENT_TIMESTAMP - (?::int * INTERVAL '1 second') AND expires_at > CURRENT_TIMESTAMP`,
    [STALE_RUNNING_SECONDS],
  );
  return { expired: expired.affectedRows, requeued: requeued.affectedRows };
}

/**
 * Atomically claim the next runnable job with `FOR UPDATE SKIP LOCKED`, so multiple workers
 * never process the same job and a crashed worker's job is reclaimed by stale recovery.
 */
export async function claimNextJob(db: JobsDb, workerId: string): Promise<ResolutionJob | null> {
  await recoverStaleJobs(db);
  return db.transaction(async (tx) => {
    const [row] = await tx.query<{ id: number | string }>(
      `SELECT id FROM resolution_jobs
       WHERE status='pending'
         AND expires_at > CURRENT_TIMESTAMP
         AND (next_attempt_at IS NULL OR next_attempt_at <= CURRENT_TIMESTAMP)
       ORDER BY created_at ASC
       FOR UPDATE SKIP LOCKED
       LIMIT 1`,
    );
    if (!row) return null;
    const updated = await tx.query<ResolutionJob>(
      `UPDATE resolution_jobs SET status='running', worker_id=?, locked_at=CURRENT_TIMESTAMP, started_at=COALESCE(started_at,CURRENT_TIMESTAMP), attempts=attempts+1, updated_at=CURRENT_TIMESTAMP
       WHERE id=? RETURNING *`,
      [workerId, row.id],
    );
    return updated[0] ?? null;
  });
}

export interface JobOutcomeFields {
  placeId?: string | null;
  reviewUrl?: string | null;
  businessName?: string | null;
  businessAddress?: string | null;
  method?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
}

async function finish(db: JobTx, id: number | string, status: JobStatus, fields: JobOutcomeFields, nextAttemptAtSql = 'NULL'): Promise<void> {
  await db.execute(
    `UPDATE resolution_jobs SET status=?, place_id=?, review_url=?, business_name=?, business_address=?, method=?, error_code=?, error_message=?, finished_at=CURRENT_TIMESTAMP, locked_at=NULL, worker_id=NULL, next_attempt_at=${nextAttemptAtSql}, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [
      status,
      fields.placeId ?? null,
      fields.reviewUrl ?? null,
      fields.businessName ?? null,
      fields.businessAddress ?? null,
      fields.method ?? null,
      fields.errorCode ?? null,
      fields.errorMessage ?? null,
      id,
    ],
  );
}

export async function completeJob(db: JobTx, id: number | string, result: ResolveResult): Promise<void> {
  await finish(db, id, statusForResult(result), {
    placeId: result.placeId,
    reviewUrl: result.reviewUrl,
    businessName: result.businessName,
    businessAddress: result.businessAddress,
    method: result.method,
    errorCode: result.errorCode,
    errorMessage: result.errorMessage,
  });
}

/** Record a failure. Retries (bounded) while attempts remain and the job has not expired. */
export async function failJob(
  db: JobTx,
  job: ResolutionJob,
  code: string,
  message: string,
): Promise<'retry' | 'failed'> {
  const attempts = Number(job.attempts);
  const maxAttempts = Number(job.max_attempts);
  if (attempts < maxAttempts) {
    const delay = backoffSeconds(attempts);
    await db.execute(
      `UPDATE resolution_jobs SET status='pending', error_code=?, error_message=?, next_attempt_at=CURRENT_TIMESTAMP + (?::int * INTERVAL '1 second'), locked_at=NULL, worker_id=NULL, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [code, message.slice(0, 500), delay, job.id],
    );
    return 'retry';
  }
  await finish(db, job.id, 'failed', { errorCode: code, errorMessage: message });
  return 'failed';
}

export async function writeAudit(
  db: JobTx,
  entry: { actor: string; action: string; cardCode?: string | null; oldUrl?: string | null; newUrl?: string | null; placeId?: string | null; detail?: string | null },
): Promise<void> {
  await db.execute(
    `INSERT INTO resolution_audit(actor,action,card_code,old_url,new_url,place_id,detail) VALUES(?,?,?,?,?,?,?)`,
    [entry.actor, entry.action, entry.cardCode ?? null, entry.oldUrl ?? null, entry.newUrl ?? null, entry.placeId ?? null, entry.detail ?? null],
  );
}

export type { ResolveStatus };
