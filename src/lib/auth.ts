import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { db, demo, safeEqual } from './db';

const cookieName = 'repiw_session';
const ttl = 8 * 60 * 60 * 1000;
type Admin = { id: number; username: string; password_hash: string };
function secret() {
  const value = process.env.SESSION_SECRET || '';
  if (Buffer.byteLength(value) < 32) throw new Error('SESSION_SECRET must contain at least 32 bytes');
  return value;
}
function digest(value: string) { return crypto.createHmac('sha256', secret()).update(value).digest('hex'); }
function verifyHash(input: string, encoded: string) {
  const [kind, salt, expected] = encoded.split('$');
  if (kind !== 'scrypt' || !salt || !/^[a-f0-9]{128}$/i.test(expected || '')) return false;
  const actual = crypto.scryptSync(input, salt, 64).toString('hex');
  return safeEqual(actual, expected);
}
export async function authenticateAdmin(username: string, input: string): Promise<Pick<Admin, 'id'|'username'> | null> {
  const [admin] = await db.query<Admin>('SELECT id,username,password_hash FROM admins WHERE LOWER(username)=? LIMIT 1', [username.trim().toLowerCase()]);
  if (!admin || !verifyHash(input, admin.password_hash)) return null;
  return { id: Number(admin.id), username: admin.username };
}
export async function ensureDemoAdminId(): Promise<number> {
  if (!demo) throw new Error('Demo admin requested outside demo mode');
  const salt = crypto.randomBytes(16).toString('hex');
  const randomPassword = crypto.randomBytes(32).toString('hex');
  const passwordHash = `scrypt$${salt}$${crypto.scryptSync(randomPassword, salt, 64).toString('hex')}`;
  await db.execute("INSERT INTO admins(username,password_hash) VALUES('__demo__',?) ON CONFLICT(username) DO NOTHING", [passwordHash]);
  const [row] = await db.query<{id:number|string}>("SELECT id FROM admins WHERE username='__demo__' LIMIT 1");
  if (!row) throw new Error('Could not initialize the demo admin.');
  return Number(row.id);
}
export async function createSession(adminId: number) {
  const raw = crypto.randomBytes(32).toString('base64url');
  const expires = Date.now() + ttl;
  await db.execute('INSERT INTO sessions(id_hash,admin_id,expires_at,created_at) VALUES(?,?,?,?)', [digest(raw), adminId, expires, Date.now()]);
  const store = await cookies();
  store.set(cookieName, raw, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: ttl / 1000 });
}
export async function hasSession() {
  const raw = (await cookies()).get(cookieName)?.value;
  if (!raw || raw.length > 128) return false;
  const [row] = await db.query<{expires_at:number|string}>('SELECT s.expires_at FROM sessions s JOIN admins a ON a.id=s.admin_id WHERE s.id_hash=? LIMIT 1', [digest(raw)]);
  if (!row) return false;
  if (Number(row.expires_at) <= Date.now()) { await db.execute('DELETE FROM sessions WHERE id_hash=?', [digest(raw)]); return false; }
  return true;
}
export async function destroySession() {
  const store = await cookies();
  const raw = store.get(cookieName)?.value;
  if (raw) await db.execute('DELETE FROM sessions WHERE id_hash=?', [digest(raw)]);
  store.set(cookieName, '', { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'strict', path:'/', maxAge:0 });
}
