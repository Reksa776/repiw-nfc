import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expireJobIfOverdue, getJobByToken } from '@/lib/resolver/jobs';
import { isMissingRelation, readWorkerHealth } from '@/lib/resolver/worker-health';

export const runtime = 'nodejs', dynamic = 'force-dynamic';

function fail(message: string, status: number, code: string) {
  return NextResponse.json({ error: message, code }, { status, headers: { 'Cache-Control': 'no-store' } });
}

/**
 * Poll the status of a resolution job by its opaque token. No authentication is required because
 * the token is a 32-byte random secret, but we deliberately return only resolution output and
 * never internal identifiers, stack traces, or worker details.
 *
 * Two production behaviours are handled here because a serverless deployment has no worker to do
 * them for us:
 *  - an overdue job is expired lazily, so polling always reaches a terminal state (`expired`)
 *    instead of returning `pending` forever;
 *  - `workerAvailable` reports whether any worker heartbeat is fresh, so the UI can stop waiting
 *    and show "worker tidak berjalan" early. `null` means unknown (heartbeat table not migrated).
 */
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return fail('Token tidak valid.', 400, 'invalid_token');

  try {
    await expireJobIfOverdue(db, token);
  } catch (error) {
    if (isMissingRelation(error)) {
      return fail('Layanan resolusi belum siap: migrasi database belum diterapkan di lingkungan ini.', 503, 'resolver_not_migrated');
    }
    throw error;
  }

  const job = await getJobByToken(db, token);
  if (!job) return fail('Permintaan resolusi tidak ditemukan.', 404, 'job_not_found');

  const pending = job.status === 'pending';
  const health = pending ? await readWorkerHealth(db).catch(() => null) : null;

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
      workerAvailable: health?.available ?? null,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
