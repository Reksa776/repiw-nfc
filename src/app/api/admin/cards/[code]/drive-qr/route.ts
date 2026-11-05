import { NextRequest, NextResponse } from 'next/server';
import { db, demo } from '@/lib/db';
import { requireAdmin, jsonError, sameOrigin } from '@/lib/http';
import { safeBaseURL } from '@/lib/validation';
import QRCode from 'qrcode';
import { reserveCardImageNumbers, uploadCardQrImage } from '@/lib/google-drive';

export const runtime = 'nodejs', dynamic = 'force-dynamic';

export async function POST(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  if (!sameOrigin(req)) return jsonError('Permintaan lintas situs ditolak.', 403);
  if (!await requireAdmin()) return jsonError('Silakan login admin.', 401);
  const { code } = await ctx.params;
  if (!/^RP-[A-F0-9]{10}$/.test(code)) return jsonError('ID kartu tidak valid.', 400);
  try {
    const [card] = await db.query<{ code: string; active: number }>('SELECT code,active FROM cards WHERE code=? AND demo=? LIMIT 1', [code, demo ? 1 : 0]);
    if (!card) return jsonError('Kartu tidak ditemukan.', 404);
    if (Number(card.active) !== 0) return jsonError('QR Drive untuk kartu ini hanya tersedia selama kartu belum aktif.', 409);
    const url = `${safeBaseURL()}/c/${card.code}?src=qr`;
    const image = await QRCode.toBuffer(url,{type:'png',width:600,margin:2,errorCorrectionLevel:'H'});
    const [fileNumber] = await reserveCardImageNumbers(1);
    const uploaded = await uploadCardQrImage(fileNumber, image);
    const driveFileName = String(fileNumber);
    await db.execute('UPDATE cards SET drive_file_name=? WHERE code=? AND demo=?',[driveFileName,card.code,demo?1:0]);
    return NextResponse.json({ ok: true, code: card.code, driveUrl: uploaded.webViewLink, driveFileName }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error(`Could not upload QR image for ${code} to Google Drive`, error);
    return jsonError(error instanceof Error ? error.message.slice(0, 180) : 'Upload gambar QR ke Google Drive gagal.', 502);
  }
}
