import 'server-only';
import crypto from 'node:crypto';
import { createPool, type Pool, type PoolConnection, type ResultSetHeader } from 'mysql2/promise';

export const demo = process.env.DEMO_MODE === 'true';
type SqlParams = unknown[];
export type DbExecutor = {
  query<T = Record<string, unknown>>(sql: string, params?: SqlParams): Promise<T[]>;
  execute(sql: string, params?: SqlParams): Promise<ResultSetHeader>;
};
let pool: Pool | undefined;
function getPool(): Pool {
  if (pool) return pool;
  const host = process.env.MYSQL_HOST?.trim();
  const user = process.env.MYSQL_USER?.trim();
  const database = (demo ? process.env.MYSQL_DEMO_DATABASE : process.env.MYSQL_DATABASE)?.trim();
  if (!host || !user || !database) {
    throw new Error(`MySQL is not configured. Set MYSQL_HOST, MYSQL_USER, and ${demo ? 'MYSQL_DEMO_DATABASE' : 'MYSQL_DATABASE'} in .env.`);
  }
  const port = Number(process.env.MYSQL_PORT || 3306);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('MYSQL_PORT must be a valid TCP port.');
  const poolSize=Number(process.env.MYSQL_POOL_SIZE||10);
  if(!Number.isInteger(poolSize)||poolSize<1||poolSize>50)throw new Error('MYSQL_POOL_SIZE must be an integer from 1 to 50.');
  pool = createPool({
    host, port, user, password: process.env.MYSQL_PASSWORD || '', database,
    waitForConnections: true, connectionLimit: poolSize,
    queueLimit: 0, charset: 'utf8mb4', timezone: 'Z', dateStrings: true,
    supportBigNumbers: true, bigNumberStrings: false,
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  });
  return pool;
}
async function runQuery<T>(executor: Pool | PoolConnection, sql: string, params: SqlParams = []): Promise<T[]> {
  const [rows] = await executor.execute(sql, params as never[]);
  return rows as T[];
}
async function runExecute(executor: Pool | PoolConnection, sql: string, params: SqlParams = []): Promise<ResultSetHeader> {
  const [result] = await executor.execute(sql, params as never[]);
  return result as ResultSetHeader;
}
export const db: DbExecutor = {
  query: <T = Record<string, unknown>>(sql: string, params: SqlParams = []) => runQuery<T>(getPool(), sql, params),
  execute: (sql: string, params: SqlParams = []) => runExecute(getPool(), sql, params),
};
export async function transaction<T>(fn: (tx: DbExecutor) => Promise<T>): Promise<T> {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const tx: DbExecutor = {
      query: <R = Record<string, unknown>>(sql: string, params: SqlParams = []) => runQuery<R>(connection, sql, params),
      execute: (sql: string, params: SqlParams = []) => runExecute(connection, sql, params),
    };
    const result = await fn(tx);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export const closePool = async () => { if (pool) { const current = pool; pool = undefined; await current.end(); } };
export const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
export const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
export function makeCode() { return `RP-${crypto.randomBytes(5).toString('hex').toUpperCase()}`; }
export function makeActivationCode() { return crypto.randomBytes(6).toString('hex').toUpperCase(); }
