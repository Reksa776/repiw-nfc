import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, demo, transaction } from '@/lib/db';
import { requireAdmin, jsonError, sameOrigin } from '@/lib/http';
import { getJobByToken, writeAudit } from '@/lib/resolver/jobs';
import { isOfficialReviewUrl } from '@/lib/resolver/url-policy';

export const runtime = 'nodejs', dynamic = 'force-dynamic';

const schema = z.object({
  reviewURL: z.string().url().max(2048).optional(),
  resolutionJobToken: z.string().regex(/^[A-Za-z0-9_-]{20,64}$/).optional(),
  confirm: z.boolean().optional(),
}).refine((v) => Boolean(v.reviewURL || v.resolutionJobToken), { message: 'reviewURL or resolutionJobToken is required' });

/** Read the current destination and its provenance for a card. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  if (!await requireAdmin()) return jsonError('Silakan login admin.', 401);
  const { code } = await ctx.params;
  if (!/^RP-[A-F0-9]{10}$/.test(code)) return jsonError('ID kartu tidak valid.', 400);
  const [card] = await db.query(
    `SELECT code,active,review_url,place_id,source_url,resolution_status,resolution_method,resolved_at,resolved_business_name,resolved_business_address
     FROM cards WHERE code=? AND demo=? LIMIT 1`,
    [code, demo ? 1 : 0],
  );
  if (!card) return jsonError('Kartu tidak ditemukan.', 404);
  return NextResponse.json({ ok: true, card }, { headers: { 'Cache-Control': 'no-store' } });
}

/**
 * Non-destructively update an existing card's review destination.
 *
 * Unlike reactivation, this keeps the card's public code, its active state, its activation
 * history, and its visit analytics intact. It requires explicit confirmation: without
 * `confirm: true` it returns a preview of the old and new destinations and writes nothing.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  if (!sameOrigin(req)) return jsonError('Permintaan lintas situs ditolak.', 403);
  if (!await requireAdmin()) return jsonError('Silakan login admin.', 401);
  const { code } = await ctx.params;
  if (!/^RP-[A-F0-9]{10}$/.test(code)) return jsonError('ID kartu tidak valid.', 400);

  let body: unknown;
  try { body = await req.json(); } catch { return jsonError('Format permintaan tidak valid.', 400); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError('Data tujuan tidak valid.', 400);
  const { reviewURL, resolutionJobToken, confirm } = parsed.data;

  const [card] = await db.query<{ id: number | string; review_url: string | null; active: number }>(
    'SELECT id,review_url,active FROM cards WHERE code=? AND demo=? LIMIT 1',
    [code, demo ? 1 : 0],
  );
  if (!card) return jsonError('Kartu tidak ditemukan.', 404);

  let newUrl = reviewURL ?? '';
  let placeId: string | null = null;
  let method = 'manual';
  let sourceUrl: string | null = null;
  let businessName: string | null = null;
  let businessAddress: string | null = null;

  if (resolutionJobToken) {
    const job = await getJobByToken(db, resolutionJobToken);
    if (!job) return jsonError('Hasil resolusi tidak ditemukan.', 400);
    if (job.status !== 'success' || !job.review_url || !isOfficialReviewUrl(job.review_url)) return jsonError('Hasil resolusi belum berhasil.', 409);
    if (job.card_code && job.card_code !== code) return jsonError('Hasil resolusi bukan untuk kartu ini.', 403);
    newUrl = job.review_url;
    placeId = job.place_id;
    method = job.method || 'playwright';
    sourceUrl = job.input_url;
    businessName = job.business_name;
    businessAddress = job.business_address;
  } else if (!isOfficialReviewUrl(newUrl)) {
    return jsonError('Gunakan tautan Google Review langsung atau hasil resolusi otomatis.', 400);
  }

  if (!confirm) {
    return NextResponse.json(
      { ok: true, preview: true, cardCode: code, oldUrl: card.review_url, newUrl, placeId, method, businessName, businessAddress },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  await transaction(async (tx) => {
    await tx.execute(
      `UPDATE cards SET review_url=?,place_id=?,source_url=?,resolution_status='verified',resolution_method=?,resolved_at=CURRENT_TIMESTAMP,resolved_business_name=?,resolved_business_address=? WHERE id=?`,
      [newUrl, placeId, sourceUrl, method, businessName, businessAddress, card.id],
    );
    await writeAudit(tx, {
      actor: 'admin',
      action: 'destination.update',
      cardCode: code,
      oldUrl: card.review_url,
      newUrl,
      placeId,
      detail: `method=${method}`,
    });
  });

  return NextResponse.json({ ok: true, cardCode: code, oldUrl: card.review_url, newUrl, placeId }, { headers: { 'Cache-Control': 'no-store' } });
}
