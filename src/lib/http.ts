import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { db, transaction } from './db';
import { hasSession } from './auth';

export function jsonError(message: string, status: number) { return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control':'no-store' } }); }
export async function requireAdmin() { return await hasSession(); }
export async function enforceRateLimit(req: NextRequest, scope: string, limit: number, windowMs: number) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = process.env.TRUST_PROXY === 'true' ? (forwarded?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown') : 'unknown';
  const bucket = `${scope}:${ip.slice(0, 80)}`;
  const now=Date.now(),cutoff=now-windowMs;
  return transaction(async(tx)=>{
    await tx.query('SELECT pg_advisory_xact_lock(hashtext(?))',[bucket]);
    await tx.execute('DELETE FROM rate_events WHERE at < ?', [cutoff-windowMs]);
    const [row] = await tx.query<{n:number|string}>('SELECT COUNT(*) AS n FROM rate_events WHERE bucket=? AND at>?',[bucket,cutoff]);
    if (Number(row?.n||0) >= limit) return jsonError('Terlalu banyak percobaan. Coba lagi nanti.',429);
    await tx.execute('INSERT INTO rate_events(bucket,at) VALUES(?,?)',[bucket,now]);
    return null;
  });
}
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.get('host'); } catch { return false; }
}
