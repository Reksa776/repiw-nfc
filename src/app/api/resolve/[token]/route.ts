import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getJobByToken } from '@/lib/resolver/jobs';

export const runtime = 'nodejs', dynamic = 'force-dynamic';

/**
 * Poll the status of a resolution job by its opaque token. No authentication is required because
 * the token is a 32-byte random secret, but we deliberately return only resolution output and
 * never internal identifiers, stack traces, or worker details.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return NextResponse.json({ error: 'Token tidak valid.' }, { status: 400 });

  const job = await getJobByToken(db, token);
  if (!job) return NextResponse.json({ error: 'Permintaan resolusi tidak ditemukan.' }, { status: 404 });

  return NextResponse.json(
    {
      ok: true,
      status: job.status,
      cardCode: job.card_code,
      placeId: job.place_id,
      reviewUrl: job.review_url,
      businessName: job.business_name,
      businessAddress: job.business_address,
      method: job.method,
      errorCode: job.error_code,
      expiresAt: job.expires_at,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
