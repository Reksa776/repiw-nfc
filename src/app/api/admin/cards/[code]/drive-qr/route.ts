import { NextRequest, NextResponse } from 'next/server';
import { db, demo } from '@/lib/db';
import { requireAdmin, jsonError, sameOrigin } from '@/lib/http';
import { safeBaseURL } from '@/lib/validation';
import { uploadCardPdf } from '@/lib/google-drive';
import { createCardActivationPdf } from '@/lib/card-pdf';
import { decryptActivationCode } from '@/lib/security';

export const runtime = 'nodejs', dynamic = 'force-dynamic';

export async function POST(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  if (!sameOrigin(req)) return jsonError('Permintaan lintas situs ditolak.', 403);
  if (!await requireAdmin()) return jsonError('Silakan login admin.', 401);
  const { code } = await ctx.params;
  if (!/^RP-[A-F0-9]{10}$/.test(code)) return jsonError('ID kartu tidak valid.', 400);
  try {
    const [card] = await db.query<{ code: string; active: number; activation_code_encrypted: string | null }>('SELECT code,active,activation_code_encrypted FROM cards WHERE code=? AND demo=? LIMIT 1', [code, demo ? 1 : 0]);
    if (!card) return jsonError('Kartu tidak ditemukan.', 404);
    if (Number(card.active) !== 0 || !card.activation_code_encrypted) return jsonError('PDF kode aktivasi hanya tersedia selama kartu belum aktif.', 409);
    const url = `${safeBaseURL()}/c/${card.code}?src=qr`;
    const activationCode = decryptActivationCode(card.activation_code_encrypted);
    const pdf = createCardActivationPdf(card.code, activationCode, url);
    const uploaded = await uploadCardPdf(card.code, pdf);
    return NextResponse.json({ ok: true, code: card.code, driveUrl: uploaded.webViewLink }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error(`Could not upload activation PDF for ${code} to Google Drive`, error);
    return jsonError(error instanceof Error ? error.message.slice(0, 180) : 'Upload PDF ke Google Drive gagal.', 502);
  }
}
