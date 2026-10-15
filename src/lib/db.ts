import 'server-only';
import crypto from 'node:crypto';
import { Pool, type PoolClient, type QueryResultRow } from 'pg';

export const demo = process.env.DEMO_MODE === 'true';
type SqlParams = unknown[];
export type DbResult = { affectedRows: number; insertId: number; rows: QueryResultRow[] };
export type DbExecutor = {
  query<T = Record<string, unknown>>(sql: string, params?: SqlParams): Promise<T[]>;
  execute(sql: string, params?: SqlParams): Promise<DbResult>;
};
let pool: Pool | undefined;
function getPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) throw new Error('Supabase is not configured. Set DATABASE_URL in .env.');
  const poolSize = Number(process.env.PG_POOL_SIZE || 5);
  if (!Number.isInteger(poolSize) || poolSize < 1 || poolSize > 50) throw new Error('PG_POOL_SIZE must be an integer from 1 to 50.');
  pool = new Pool({ connectionString, max: poolSize, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 10_000, application_name: 'repiw-nextjs' });
  pool.on('error', (error) => console.error('Unexpected idle PostgreSQL client error', error));
  return pool;
}
function pgSql(sql: string) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}
async function runQuery<T>(executor: Pool | PoolClient, sql: string, params: SqlParams = []): Promise<T[]> {
  const result = await executor.query<T & QueryResultRow>(pgSql(sql), params);
  return result.rows as T[];
}
async function runExecute(executor: Pool | PoolClient, sql: string, params: SqlParams = []): Promise<DbResult> {
  const result = await executor.query(pgSql(sql), params);
  return { affectedRows: result.rowCount || 0, insertId: Number(result.rows[0]?.id || 0), rows: result.rows };
}
export const db: DbExecutor = {
  query: <T = Record<string, unknown>>(sql: string, params: SqlParams = []) => runQuery<T>(getPool(), sql, params),
  execute: (sql: string, params: SqlParams = []) => runExecute(getPool(), sql, params),
};
export async function transaction<T>(fn: (tx: DbExecutor) => Promise<T>): Promise<T> {
  const connection = await getPool().connect();
  try {
    await connection.query('BEGIN');
    const tx: DbExecutor = {
      query: <R = Record<string, unknown>>(sql: string, params: SqlParams = []) => runQuery<R>(connection, sql, params),
      execute: (sql: string, params: SqlParams = []) => runExecute(connection, sql, params),
    };
    const result = await fn(tx);
    await connection.query('COMMIT');
    return result;
  } catch (error) {
    await connection.query('ROLLBACK');
    throw error;
  } finally { connection.release(); }
}
export const closePool = async () => { if (pool) { const current = pool; pool = undefined; await current.end(); } };
export const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
export const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
export function makeCode() { return `RP-${crypto.randomBytes(5).toString('hex').toUpperCase()}`; }
export function makeActivationCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => alphabet.charAt(crypto.randomInt(alphabet.length))).join('');
}
