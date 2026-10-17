import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, demo } from '@/lib/db';
import { requireAdmin, jsonError, sameOrigin, enforceRateLimit } from '@/lib/http';
import { verifyActivationCode } from '@/lib/security';
import { isEnabled } from '@/lib/resolver/config';
import { serverJobsDb } from '@/lib/resolver/server-store';
import { createOrReuseJob } from '@/lib/resolver/jobs';
import { classifyGoogleUrl } from '@/lib/resolver/url-policy';
import { isMissingRelation, readWorkerHealth } from '@/lib/resolver/worker-health';

export const runtime = 'nodejs', dynamic = 'force-dynamic';

const schema = z.object({
  url: z.string().url().max(2048),
  code: z.string().regex(/^RP-[A-F0-9]{10}$/).optional(),
  activationCode: z.string().regex(/^(?:[A-HJ-NP-Z2-9]{4}|[A-Fa-f0-9]{12})$/i).optional(),
  cardCode: z.string().regex(/^RP-[A-F0-9]{10}$/).optional(),
});

/**
 * Machine-readable failure shapes. The browser cannot rely on the status code alone (a proxy can
 * rewrite it), so every rejection carries a stable `code` the UI maps to Indonesian copy instead of
 * showing a generic message or spinning forever.
 */
function fail(message: string, status: number, code: string) {
  return NextResponse.json({ error: message, code }, { status, headers: { 'Cache-Control': 'no-store' } });
}

/**
 * Request an asynchronous Google Maps -> Google Review resolution.
 *
 * Chromium NEVER runs here: we only validate, bind the job to the card + URL, and persist it.
 * A separate worker (scripts/resolver-worker.ts) performs the browser work. The caller receives
 * an opaque job token to poll at GET /api/resolve/[token].
 *
 * This route must stay cheap and serverless-safe: constant-time-ish work, no browser, and a JSON
 * answer for every failure (never an HTML 500, which the browser would show as a generic error).
 */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonError('Permintaan lintas situs ditolak.', 403);

  // The kill switch is checked before anything touches the database. With the resolver disabled
  // (the production default for this hotfix) the request costs nothing and the user is told to
  // paste a direct Google Review URL, which still activates a card normally.
  if (!isEnabled()) {
    return fail('Fitur resolusi otomatis belum aktif di lingkungan ini.', 503, 'resolver_disabled');
  }

  const limited = await enforceRateLimit(req, 'resolve-request', 10, 15 * 60_000);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('Format permintaan tidak valid.', 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Data permintaan resolusi tidak valid.', 400, 'invalid_request');
  const { url, code, activationCode, cardCode } = parsed.data;

  const klass = classifyGoogleUrl(url);
  if (klass === 'invalid') return fail('Hanya tautan Google HTTPS resmi yang didukung.', 400, 'unsupported_url');
  if (klass === 'google-other') return fail('Tautan Google ini bukan tautan lokasi atau ulasan.', 400, 'unsupported_url');

  const admin = await requireAdmin();

  let boundCard: string | null = null;
  let createdBy = 'public';
  if (admin) {
    // Privileged path (admin): used by the dashboard to fix or prepare a destination, and by an
    // administrator who happens to be signed in while using the public activation form. In that
    // case the card code is in `code`, so bind to whichever the caller supplied — a job must never
    // end up unbound when the card is known, or activation would later be rejected as a mismatch.
    createdBy = 'admin';
    boundCard = cardCode ?? code ?? null;
    if (boundCard) {
      const [card] = await db.query<{ code: string }>('SELECT code FROM cards WHERE code=? AND demo=? LIMIT 1', [boundCard, demo ? 1 : 0]);
      if (!card) return jsonError('Kartu tidak ditemukan.', 404);
    }
  } else {
    // Public activation context: bind the job to an existing inactive card whose one-time code
    // is correct. The code is NOT consumed here — only verified.
    if (!code || !activationCode) return fail('Kode kartu dan kode aktivasi diperlukan.', 400, 'invalid_request');
    const [card] = await db.query<{ active: number; secret_hash: string }>('SELECT active,secret_hash FROM cards WHERE code=? LIMIT 1', [code]);
    if (!card) return jsonError('Kartu tidak ditemukan.', 404);
    if (card.active) return jsonError('Kartu sudah aktif.', 409);
    if (!verifyActivationCode(activationCode, card.secret_hash)) return jsonError('Kode aktivasi salah.', 401);
    boundCard = code;
  }

  let created: Awaited<ReturnType<typeof createOrReuseJob>>;
  try {
    created = await createOrReuseJob(serverJobsDb, {
      inputUrl: url,
      cardCode: boundCard,
      createdBy,
    });
  } catch (error) {
    // The most likely production cause: migrations 6–7 (resolution_jobs) were never applied to the
    // deployed database. Answer with an actionable JSON error instead of an opaque 500.
    if (isMissingRelation(error)) {
      return fail('Layanan resolusi belum siap: migrasi database (versi 6–8) belum diterapkan di lingkungan ini.', 503, 'resolver_not_migrated');
    }
    console.error('[api/resolve] enqueue failed', error instanceof Error ? error.message : error);
    return fail('Permintaan resolusi gagal dibuat. Coba lagi atau tempel tautan Google Review langsung.', 500, 'resolver_error');
  }

  const { job, reused } = created;

  // Tell the caller up-front whether anything is consuming the queue, so the UI can escalate to
  // "worker tidak berjalan" in seconds instead of waiting for its full polling deadline.
  const health = await readWorkerHealth(serverJobsDb).catch(() => null);

  return NextResponse.json(
    {
      ok: true,
      jobToken: job.job_token,
      status: job.status,
      reused,
      cardCode: job.card_code,
      expiresAt: job.expires_at,
      workerAvailable: health?.available ?? null,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
