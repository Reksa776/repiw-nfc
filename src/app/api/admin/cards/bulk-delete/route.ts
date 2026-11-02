import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, demo, transaction } from '@/lib/db';
import { jsonError, requireAdmin, sameOrigin } from '@/lib/http';

export const runtime = 'nodejs', dynamic = 'force-dynamic';

const schema = z.object({
  codes: z.array(z.string().regex(/^RP-[A-F0-9]{10}$/)).min(1).max(500),
}).refine(({ codes }) => new Set(codes).size === codes.length, { message: 'Daftar ID kartu duplikat.' });

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonError('Permintaan lintas situs ditolak.', 403);
  if (!await requireAdmin()) return jsonError('Silakan login admin.', 401);
  let raw: unknown;
  try { raw = await req.json(); } catch { return jsonError('Format permintaan tidak valid.', 400); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return jsonError('Pilih antara 1 sampai 500 kartu yang valid.', 400);

  const codes = parsed.data.codes;
  const removed = await transaction(async tx => {
    const placeholders = codes.map(() => '?').join(',');
    return tx.query<{ code: string }>(
      `DELETE FROM cards WHERE demo=? AND code IN (${placeholders}) RETURNING code`,
      [demo ? 1 : 0, ...codes],
    );
  });
  return NextResponse.json({ ok: true, removed: removed.map(card => card.code), count: removed.length }, { headers: { 'Cache-Control': 'no-store' } });
}
