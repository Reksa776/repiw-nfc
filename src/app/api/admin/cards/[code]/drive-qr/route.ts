import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { db, demo } from '@/lib/db';
import { requireAdmin, jsonError, sameOrigin } from '@/lib/http';
import { safeBaseURL } from '@/lib/validation';
import { uploadCardQr } from '@/lib/google-drive';

export const runtime = 'nodejs', dynamic = 'force-dynamic';

export async function POST(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  if (!sameOrigin(req)) return jsonError('Permintaan lintas situs ditolak.', 403);
  if (!await requireAdmin()) return jsonError('Silakan login admin.', 401);
  const { code } = await ctx.params;
  if (!/^RP-[A-F0-9]{10}$/.test(code)) return jsonError('ID kartu tidak valid.', 400);
  try {
    const [card] = await db.query<{ code: string }>('SELECT code FROM cards WHERE code=? AND demo=? LIMIT 1', [code, demo ? 1 : 0]);
    if (!card) return jsonError('Kartu tidak ditemukan.', 404);
    const url = `${safeBaseURL()}/c/${card.code}?src=qr`;
    const png = await QRCode.toBuffer(url, { width: 1000, margin: 3, errorCorrectionLevel: 'H' });
    const uploaded = await uploadCardQr(card.code, png);
    return NextResponse.json({ ok: true, code: card.code, driveUrl: uploaded.webViewLink }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error(`Could not upload QR for ${code} to Google Drive`, error);
    return jsonError(error instanceof Error ? error.message.slice(0, 180) : 'Upload QR ke Google Drive gagal.', 502);
  }
}
