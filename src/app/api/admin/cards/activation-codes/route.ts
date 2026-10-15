import { NextResponse } from 'next/server';
import { db, demo } from '@/lib/db';
import { decryptActivationCode } from '@/lib/security';
import { requireAdmin, jsonError } from '@/lib/http';
export const runtime = 'nodejs', dynamic = 'force-dynamic';

export async function GET() {
  if (!await requireAdmin()) return jsonError('Silakan login admin.', 401);
  try {
    const rows = await db.query<{ code: string; activation_code_encrypted: string }>(
      'SELECT code,activation_code_encrypted FROM cards WHERE demo=? AND active=0 AND activation_code_encrypted IS NOT NULL ORDER BY id DESC',
      [demo ? 1 : 0],
    );
    const codes = Object.fromEntries(rows.map(row => [row.code, decryptActivationCode(row.activation_code_encrypted)]));
    return NextResponse.json(codes, { headers: { 'Cache-Control': 'no-store, private' } });
  } catch (error) {
    console.error('Could not decrypt activation codes', error);
    return jsonError('Kode aktivasi tersimpan tidak dapat dibuka. Periksa kunci enkripsi.', 500);
  }
}
