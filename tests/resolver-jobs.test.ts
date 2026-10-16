import { describe, expect, it, beforeAll, beforeEach } from 'vitest';
import { createRequire } from 'node:module';
import { PGlite } from '@electric-sql/pglite';
import { createOrReuseJob, claimNextJob, completeJob, failJob, recoverStaleJobs, getJobByToken, writeAudit, type JobsDb, type JobTx } from '../src/lib/resolver/jobs';

const require = createRequire(import.meta.url);
const { migrations } = require('../scripts/migrate-postgres.js') as { migrations: Array<{ name: string; sql: string[] }> };

// A real in-process PostgreSQL (WASM) so migration and job SQL are exercised for real, without
// touching any production database.
const pg = new PGlite();

function shim(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

const tx: JobTx = {
  query: async <T = Record<string, unknown>>(sql: string, params: unknown[] = []) => {
    const res = await pg.query<T>(shim(sql), params);
    return res.rows as T[];
  },
  execute: async (sql: string, params: unknown[] = []) => {
    const res = await pg.query(shim(sql), params);
    return { affectedRows: (res.affectedRows as number | undefined) ?? res.rows.length, rows: res.rows };
  },
};

const db: JobsDb = {
  ...tx,
  transaction: async <T>(fn: (t: JobTx) => Promise<T>) => {
    await pg.query('BEGIN');
    try {
      const out = await fn(tx);
      await pg.query('COMMIT');
      return out;
    } catch (error) {
      await pg.query('ROLLBACK');
      throw error;
    }
  },
};

async function columnsOf(table: string): Promise<string[]> {
  const rows = await tx.query<{ column_name: string }>(
    'SELECT column_name FROM information_schema.columns WHERE table_name=$1',
    [table],
  );
  return rows.map((r) => r.column_name);
}

beforeAll(async () => {
  for (const migration of migrations) {
    for (const statement of migration.sql) {
      await pg.exec(statement);
    }
  }
});

describe('migration compatibility (additive)', () => {
  it('creates the resolution tables and indexes', async () => {
    const tables = await tx.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'",
    );
    const names = tables.map((t) => t.table_name);
    expect(names).toContain('cards');
    expect(names).toContain('visits');
    expect(names).toContain('resolution_jobs');
    expect(names).toContain('resolution_audit');
  });

  it('adds destination provenance columns to cards without removing existing ones', async () => {
    const cols = await columnsOf('cards');
    for (const c of ['code', 'review_url', 'active', 'review_url', 'place_id', 'source_url', 'resolution_status', 'resolution_method', 'resolved_at', 'resolved_business_name', 'resolved_business_address']) {
      expect(cols).toContain(c);
    }
  });
});

describe('resolution job lifecycle', () => {
  beforeEach(async () => {
    await tx.execute('DELETE FROM resolution_jobs');
    await tx.execute('DELETE FROM resolution_audit');
  });

  it('creates a job, dedupes concurrent requests for the same binding, claims it exactly once', async () => {
    const a = await createOrReuseJob(db, { inputUrl: 'https://maps.app.goo.gl/A', cardCode: 'RP-0000000001', createdBy: 'public' });
    const b = await createOrReuseJob(db, { inputUrl: 'https://maps.app.goo.gl/A', cardCode: 'RP-0000000001', createdBy: 'public' });
    expect(a.reused).toBe(false);
    expect(b.reused).toBe(true);
    expect(b.job.job_token).toBe(a.job.job_token);

    const claimed = await claimNextJob(db, 'worker-1');
    expect(claimed?.job_token).toBe(a.job.job_token);
    expect(claimed?.status).toBe('running');
    expect(Number(claimed?.attempts)).toBe(1);

    // No other runnable job remains, and the same job is not handed out twice.
    const again = await claimNextJob(db, 'worker-2');
    expect(again === null || again.job_token !== a.job.job_token).toBe(true);

    const done = await completeJob(db, a.job.id, {
      status: 'success', method: 'playwright', inputUrl: '', resolvedUrl: null, placeId: 'ChIJQeGqDPodby4RQBEuhEv7Zjs',
      reviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJQeGqDPodby4RQBEuhEv7Zjs', businessName: 'Biz', businessAddress: null,
      errorCode: null, errorMessage: null, durationMs: 1, usedBrowser: true,
    });
    void done;
    const stored = await getJobByToken(db, a.job.job_token);
    expect(stored?.status).toBe('success');
    expect(stored?.place_id).toBe('ChIJQeGqDPodby4RQBEuhEv7Zjs');
  });

  it('blocks a duplicate active job at the database level (partial unique index)', async () => {
    const { job } = await createOrReuseJob(db, { inputUrl: 'https://maps.app.goo.gl/DUP', cardCode: 'RP-0000000002', createdBy: 'public' });
    const [row] = await tx.query<{ binding_hash: string }>('SELECT binding_hash FROM resolution_jobs WHERE job_token=$1', [job.job_token]);
    await expect(
      tx.execute(
        `INSERT INTO resolution_jobs(job_token,status,input_url,binding_hash,card_code,created_by,expires_at) VALUES('tokdup','pending','u',?, 'RP-0000000002','public',CURRENT_TIMESTAMP + INTERVAL '1 hour')`,
        [row.binding_hash],
      ),
    ).rejects.toBeTruthy();
  });

  it('retries with backoff then gives up after max attempts', async () => {
    const { job } = await createOrReuseJob(db, { inputUrl: 'https://maps.app.goo.gl/RETRY', cardCode: 'RP-0000000003', createdBy: 'public', maxAttempts: 2 });
    const claimed = await claimNextJob(db, 'w');
    expect(claimed?.job_token).toBe(job.job_token);
    const first = await failJob(db, claimed!, 'no_place_id', 'nope');
    expect(first).toBe('retry');
    // Backoff schedules next_attempt_at in the future, so it is not immediately claimable.
    const immediate = await claimNextJob(db, 'w');
    expect(immediate?.job_token ?? null).not.toBe(job.job_token);

    // Force it runnable and exhaust the remaining attempt.
    await tx.execute("UPDATE resolution_jobs SET next_attempt_at=CURRENT_TIMESTAMP, attempts=2 WHERE job_token=$1", [job.job_token]);
    const second = await claimNextJob(db, 'w');
    expect(second?.job_token).toBe(job.job_token);
    const final = await failJob(db, second!, 'no_place_id', 'nope');
    expect(final).toBe('failed');
    const stored = await getJobByToken(db, job.job_token);
    expect(stored?.status).toBe('failed');
  });

  it('expires overdue jobs and requeues stale running jobs', async () => {
    const expiredToken = 'tokexpire';
    await tx.execute(
      `INSERT INTO resolution_jobs(job_token,status,input_url,binding_hash,created_by,expires_at) VALUES(?, 'pending','u','hashexp','public', CURRENT_TIMESTAMP - INTERVAL '1 minute')`,
      [expiredToken],
    );
    const staleToken = 'tokstale';
    await tx.execute(
      `INSERT INTO resolution_jobs(job_token,status,input_url,binding_hash,created_by,expires_at,locked_at) VALUES(?, 'running','u','hashstale','public', CURRENT_TIMESTAMP + INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '10 minutes')`,
      [staleToken],
    );
    const result = await recoverStaleJobs(tx);
    expect(result.expired).toBeGreaterThanOrEqual(1);
    expect(result.requeued).toBeGreaterThanOrEqual(1);
    expect((await getJobByToken(db, expiredToken))?.status).toBe('expired');
    expect((await getJobByToken(db, staleToken))?.status).toBe('pending');
  });

  it('records an audit row', async () => {
    await writeAudit(tx, { actor: 'admin', action: 'destination.update', cardCode: 'RP-0000000001', oldUrl: 'old', newUrl: 'new', placeId: 'ChIJQeGqDPodby4RQBEuhEv7Zjs', detail: 'test' });
    const rows = await tx.query<{ action: string }>("SELECT action FROM resolution_audit WHERE card_code='RP-0000000001'");
    expect(rows.some((r) => r.action === 'destination.update')).toBe(true);
  });
});
