// Adapter that backs the job store with a standalone `pg` pool. Used by the worker and the
// backfill scripts, which run outside the Next.js server and must not import `server-only`.

import type { Pool } from 'pg';
import type { JobsDb, JobTx } from './jobs';

/**
 * The job store uses the app-wide `?` placeholder convention; the `pg` driver needs `$n`.
 * This mirrors the shim in `src/lib/db.ts` so identical SQL works in both contexts.
 */
function pgSql(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

type Runner = { query(sql: string, params?: unknown[]): Promise<{ rows: unknown[]; rowCount: number | null }> };

function txFrom(runner: Runner): JobTx {
  return {
    query: <T = Record<string, unknown>>(sql: string, params?: unknown[]) => runner.query(pgSql(sql), params).then((r) => r.rows as T[]),
    execute: (sql: string, params?: unknown[]) => runner.query(pgSql(sql), params).then((r) => ({ affectedRows: r.rowCount ?? 0, rows: r.rows })),
  };
}

export function createPgJobsDb(pool: Pool): JobsDb {
  return {
    query: <T = Record<string, unknown>>(sql: string, params?: unknown[]) => pool.query(pgSql(sql), params).then((r) => r.rows as T[]),
    execute: (sql: string, params?: unknown[]) => pool.query(pgSql(sql), params).then((r) => ({ affectedRows: r.rowCount ?? 0, rows: r.rows })),
    transaction: async <T>(fn: (tx: JobTx) => Promise<T>) => {
      const conn = await pool.connect();
      try {
        await conn.query('BEGIN');
        const out = await fn(txFrom(conn));
        await conn.query('COMMIT');
        return out;
      } catch (error) {
        await conn.query('ROLLBACK');
        throw error;
      } finally {
        conn.release();
      }
    },
  };
}
