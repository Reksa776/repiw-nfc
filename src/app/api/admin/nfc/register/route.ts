import { NextRequest, NextResponse } from 'next/server';
import { db, demo } from '@/lib/db';
import { requireAdmin, jsonError, sameOrigin } from '@/lib/http';
import { safeBaseURL } from '@/lib/validation';
import { z } from 'zod';

export const runtime = 'nodejs', dynamic = 'force-dynamic';
const schema = z.object({ code: z.string().regex(/^RP-[A-F0-9]{10}$/) });

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonError('Permintaan lintas situs ditolak.', 403);
  if (!await requireAdmin()) return jsonError('Silakan login admin.', 401);
  let body: unknown;
  try { body = await req.json(); } catch { return jsonError('Format permintaan tidak valid.', 400); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError('Data kartu NFC tidak valid.', 400);
  const { code } = parsed.data;
  let target: string;
  try { target = `${safeBaseURL()}/c/${code}?src=nfc`; }
  catch { return jsonError('BASE_URL belum dikonfigurasi dengan benar.', 500); }
  const [card] = await db.query<{ code: string }>('SELECT code FROM cards WHERE code=? AND demo=? LIMIT 1', [code, demo ? 1 : 0]);
  if (!card) return jsonError('Kartu tidak ditemukan di lingkungan ini.', 404);
  return NextResponse.json({ url: target }, { headers: { 'Cache-Control': 'no-store' } });
}
