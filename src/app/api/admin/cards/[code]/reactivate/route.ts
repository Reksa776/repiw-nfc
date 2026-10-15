import { NextRequest, NextResponse } from 'next/server';
import { db, demo, makeActivationCode, transaction } from '@/lib/db';
import { hashActivationCode } from '@/lib/security';
import { requireAdmin, jsonError, sameOrigin } from '@/lib/http';
import { safeBaseURL } from '@/lib/validation';
export const runtime = 'nodejs', dynamic = 'force-dynamic';

export async function POST(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  if (!sameOrigin(req)) return jsonError('Permintaan lintas situs ditolak.', 403);
  if (!await requireAdmin()) return jsonError('Silakan login admin.', 401);
  const { code } = await ctx.params;
  if (!/^RP-[A-F0-9]{10}$/.test(code)) return jsonError('ID kartu tidak valid.', 400);
  let base: string;
  try { base = safeBaseURL(); } catch { return jsonError('BASE_URL belum dikonfigurasi dengan benar.', 500); }
  const activationCode = makeActivationCode();
  const result = await transaction(async tx => {
    const [card] = await tx.query<{ id: number | string; active: number }>('SELECT id,active FROM cards WHERE code=? AND demo=? FOR UPDATE', [code, demo ? 1 : 0]);
    if (!card) return 'missing' as const;
    if (!card.active) return 'inactive' as const;
    await tx.execute('UPDATE cards SET active=0,review_url=NULL,activated_at=NULL,secret_hash=? WHERE id=?', [hashActivationCode(activationCode), card.id]);
    return 'ok' as const;
  });
  if (result === 'missing') return jsonError('Kartu tidak ditemukan.', 404);
  if (result === 'inactive') return jsonError('Kartu ini sudah nonaktif.', 409);
  return NextResponse.json({ code, activationCode, qrURL: `${base}/c/${code}?src=qr`, nfcURL: `${base}/c/${code}?src=nfc` }, { headers: { 'Cache-Control': 'no-store' } });
}
