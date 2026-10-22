import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, demo, transaction } from '@/lib/db';
import { requireAdmin, jsonError, sameOrigin } from '@/lib/http';
import { isOfficialReviewUrl } from '@/lib/resolver/url-policy';
import { buildReviewUrl } from '@/lib/resolver/extract';
import { verifyConfirmationToken } from '@/lib/resolver/http-places';

export const runtime = 'nodejs', dynamic = 'force-dynamic';

const schema = z.object({
  reviewURL: z.string().url().max(2048).optional(),
  resolverConfirmationToken: z.string().max(4096).optional(),
  confirm: z.boolean().optional(),
}).refine((v) => Boolean(v.reviewURL || v.resolverConfirmationToken), { message: 'reviewURL or resolverConfirmationToken is required' });

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
  const { reviewURL, resolverConfirmationToken, confirm } = parsed.data;

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

  if (resolverConfirmationToken) {
    const candidate = verifyConfirmationToken(resolverConfirmationToken, code);
    if (!candidate) return jsonError('Konfirmasi bisnis tidak valid atau sudah kedaluwarsa. Cari ulang bisnis.', 409);
    newUrl = buildReviewUrl(candidate.placeId);
    placeId = candidate.placeId;
    method = 'google-places-ids-only';
    sourceUrl = candidate.sourceUrl;
    businessName = candidate.query;
    businessAddress = null;
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
    await tx.execute('INSERT INTO resolution_audit(actor,action,card_code,old_url,new_url,place_id,detail) VALUES(?,?,?,?,?,?,?)',
      ['admin', 'destination.update', code, card.review_url, newUrl, placeId, `method=${method}`]);
  });

  return NextResponse.json({ ok: true, cardCode: code, oldUrl: card.review_url, newUrl, placeId }, { headers: { 'Cache-Control': 'no-store' } });
}
