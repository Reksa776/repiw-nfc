import 'server-only';
import { db, transaction } from '../db';
import type { JobsDb } from './jobs';

/**
 * Adapt the app's `pg` executor to the job store's `JobsDb` interface. Kept in its own module so
 * the job store itself stays free of the `server-only` db import and can be shared with the
 * standalone worker process.
 */
export const serverJobsDb: JobsDb = {
  query: <T = Record<string, unknown>>(sql: string, params?: unknown[]) => db.query<T>(sql, params),
  execute: (sql: string, params?: unknown[]) => db.execute(sql, params),
  transaction: <T>(fn: (tx: { query: JobsDb['query']; execute: JobsDb['execute'] }) => Promise<T>) =>
    transaction(async (tx) => fn({ query: (sql, params) => tx.query(sql, params), execute: (sql, params) => tx.execute(sql, params) })),
};
