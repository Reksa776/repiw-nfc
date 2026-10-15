import { NextRequest, NextResponse } from 'next/server';
import { db, demo, makeActivationCode, transaction } from '@/lib/db';
import { encryptActivationCode, hashActivationCode } from '@/lib/security';
import { requireAdmin, jsonError, sameOrigin } from '@/lib/http';
export const runtime = 'nodejs', dynamic = 'force-dynamic';

export async function POST(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  if (!sameOrigin(req)) return jsonError('Permintaan lintas situs ditolak.', 403);
  if (!await requireAdmin()) return jsonError('Silakan login admin.', 401);
  const { code } = await ctx.params;
  if (!/^RP-[A-F0-9]{10}$/.test(code)) return jsonError('ID kartu tidak valid.', 400);
  const activationCode = makeActivationCode();
  const outcome = await transaction(async tx => {
    const [card] = await tx.query<{ id: number | string; active: number }>('SELECT id,active FROM cards WHERE code=? AND demo=? FOR UPDATE', [code, demo ? 1 : 0]);
    if (!card) return 'missing' as const;
    if (card.active) return 'active' as const;
    await tx.execute('UPDATE cards SET secret_hash=?,activation_code_encrypted=? WHERE id=?', [hashActivationCode(activationCode), encryptActivationCode(activationCode), card.id]);
    return 'ok' as const;
  });
  if (outcome === 'missing') return jsonError('Kartu tidak ditemukan.', 404);
  if (outcome === 'active') return jsonError('Kartu sudah aktif.', 409);
  return NextResponse.json({ code, activationCode }, { headers: { 'Cache-Control': 'no-store' } });
}
