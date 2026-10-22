import { NextResponse } from 'next/server';

export const runtime = 'nodejs', dynamic = 'force-dynamic';

/** Legacy polling endpoint retained briefly for stale clients; the serverless resolver has no job queue. */
export async function GET() {
  return NextResponse.json(
    { ok: false, code: 'resolver_retired', error: 'Resolver lama sudah dihentikan. Kirim ulang pencarian dari halaman aktivasi.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  );
}
