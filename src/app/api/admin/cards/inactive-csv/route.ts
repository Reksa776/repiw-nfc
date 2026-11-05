import { NextResponse } from 'next/server';
import { db, demo } from '@/lib/db';
import { decryptActivationCode } from '@/lib/security';
import { requireAdmin, jsonError } from '@/lib/http';
import { ensureDriveSchema } from '@/lib/google-drive';

export const runtime = 'nodejs', dynamic = 'force-dynamic';

function csvCell(value: string) {
  const safe = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export async function GET() {
  if (!await requireAdmin()) return jsonError('Silakan login admin.', 401);

  try {
    await ensureDriveSchema();
    const rows = await db.query<{
      code: string;
      drive_file_name: string | null;
      activation_code_encrypted: string | null;
    }>(
      'SELECT code,drive_file_name,activation_code_encrypted FROM cards WHERE demo=? AND active=0 ORDER BY id',
      [demo ? 1 : 0],
    );
    const lines = [
      ['File Drive', 'Kode Aktivasi', 'Kode ID Kartu', 'QR (gambar ada di Excel)'].map(csvCell).join(','),
      ...rows.map(row => [
        row.drive_file_name || '',
        row.activation_code_encrypted ? decryptActivationCode(row.activation_code_encrypted) : '',
        row.code,
        row.code ? 'QR tersedia di file Excel' : '',
      ].map(csvCell).join(',')),
    ];
    return new NextResponse(`\uFEFF${lines.join('\r\n')}`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="repiw-kartu-nonaktif.csv"',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Could not export inactive cards to CSV', error);
    return jsonError('File CSV kartu nonaktif tidak dapat dibuat. Periksa kunci enkripsi kode aktivasi.', 500);
  }
}
