import { NextRequest, NextResponse } from 'next/server';
import { db, demo } from '@/lib/db';
import { requireAdmin, jsonError, sameOrigin } from '@/lib/http';
export const runtime = 'nodejs', dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  if (!sameOrigin(req)) return jsonError('Permintaan lintas situs ditolak.', 403);
  if (!await requireAdmin()) return jsonError('Silakan login admin.', 401);
  const { code } = await ctx.params;
  if (!/^RP-[A-F0-9]{10}$/.test(code)) return jsonError('ID kartu tidak valid.', 400);
  const removed = await db.query<{ code: string }>('DELETE FROM cards WHERE code=? AND demo=? RETURNING code', [code, demo ? 1 : 0]);
  if (!removed.length) return jsonError('Kartu tidak ditemukan.', 404);
  return NextResponse.json({ ok: true, code }, { headers: { 'Cache-Control': 'no-store' } });
}
