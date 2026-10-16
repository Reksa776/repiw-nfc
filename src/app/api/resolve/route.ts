import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, demo } from '@/lib/db';
import { requireAdmin, jsonError, sameOrigin, enforceRateLimit } from '@/lib/http';
import { verifyActivationCode } from '@/lib/security';
import { isEnabled } from '@/lib/resolver/config';
import { serverJobsDb } from '@/lib/resolver/server-store';
import { createOrReuseJob } from '@/lib/resolver/jobs';
import { classifyGoogleUrl } from '@/lib/resolver/url-policy';

export const runtime = 'nodejs', dynamic = 'force-dynamic';

const schema = z.object({
  url: z.string().url().max(2048),
  code: z.string().regex(/^RP-[A-F0-9]{10}$/).optional(),
  activationCode: z.string().regex(/^(?:[A-HJ-NP-Z2-9]{4}|[A-Fa-f0-9]{12})$/i).optional(),
  cardCode: z.string().regex(/^RP-[A-F0-9]{10}$/).optional(),
});

/**
 * Request an asynchronous Google Maps -> Google Review resolution.
 *
 * Chromium NEVER runs here: we only validate, bind the job to the card + URL, and persist it.
 * A separate worker (scripts/resolver-worker.ts) performs the browser work. The caller receives
 * an opaque job token to poll at GET /api/resolve/[token].
 */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonError('Permintaan lintas situs ditolak.', 403);
  const limited = await enforceRateLimit(req, 'resolve-request', 10, 15 * 60_000);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('Format permintaan tidak valid.', 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError('Data permintaan resolusi tidak valid.', 400);
  const { url, code, activationCode, cardCode } = parsed.data;

  if (!isEnabled()) {
    return jsonError('Fitur resolusi otomatis belum aktif di lingkungan ini.', 503);
  }

  const klass = classifyGoogleUrl(url);
  if (klass === 'invalid') return jsonError('Hanya tautan Google HTTPS resmi yang didukung.', 400);
  if (klass === 'google-other') return jsonError('Tautan Google ini bukan tautan lokasi atau ulasan.', 400);

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
    if (!code || !activationCode) return jsonError('Kode kartu dan kode aktivasi diperlukan.', 400);
    const [card] = await db.query<{ active: number; secret_hash: string }>('SELECT active,secret_hash FROM cards WHERE code=? LIMIT 1', [code]);
    if (!card) return jsonError('Kartu tidak ditemukan.', 404);
    if (card.active) return jsonError('Kartu sudah aktif.', 409);
    if (!verifyActivationCode(activationCode, card.secret_hash)) return jsonError('Kode aktivasi salah.', 401);
    boundCard = code;
  }

  const { job, reused } = await createOrReuseJob(serverJobsDb, {
    inputUrl: url,
    cardCode: boundCard,
    createdBy,
  });

  return NextResponse.json(
    { ok: true, jobToken: job.job_token, status: job.status, reused, cardCode: job.card_code, expiresAt: job.expires_at },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
