import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, demo } from '@/lib/db';
import { requireAdmin, jsonError, sameOrigin, enforceRateLimit } from '@/lib/http';
import { verifyActivationCode } from '@/lib/security';
import { candidatesFor, expandMapsUrl, ResolverError, searchPlaceIds } from '@/lib/resolver/http-places';
import { isOfficialReviewUrl } from '@/lib/resolver/url-policy';

export const runtime = 'nodejs', dynamic = 'force-dynamic';

const schema = z.object({
  input: z.string().trim().min(2).max(2048),
  code: z.string().regex(/^RP-[A-F0-9]{10}$/).optional(),
  activationCode: z.string().regex(/^(?:[A-HJ-NP-Z2-9]{4}|[A-Fa-f0-9]{12})$/i).optional(),
  cardCode: z.string().regex(/^RP-[A-F0-9]{10}$/).optional(),
});

function fail(code: string, message: string, status: number) {
  return NextResponse.json({ ok: false, code, error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

/** Serverless HTTP + Places IDs Only resolver. It stores no job and never launches a browser. */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonError('Permintaan lintas situs ditolak.', 403);
  if (process.env.GOOGLE_PLACES_RESOLVER_ENABLED !== '1') return fail('resolver_disabled', 'Resolusi otomatis belum diaktifkan di server. Tautan ulasan manual tetap bisa dipakai.', 503);
  const limited = await enforceRateLimit(req, 'google-places-resolve', 8, 15 * 60_000);
  if (limited) return limited;
  let raw: unknown;
  try { raw = await req.json(); } catch { return jsonError('Format permintaan tidak valid.', 400); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return fail('invalid_request', 'Masukkan URL Maps atau nama bisnis yang valid.', 400);
  const { input } = parsed.data;

  const admin = await requireAdmin();
  let cardCode = parsed.data.cardCode ?? parsed.data.code ?? null;
  if (admin) {
    if (cardCode) {
      const [card] = await db.query<{ code: string }>('SELECT code FROM cards WHERE code=? AND demo=? LIMIT 1', [cardCode, demo ? 1 : 0]);
      if (!card) return fail('card_not_found', 'Kartu tidak ditemukan.', 404);
    }
  } else {
    const code = parsed.data.code;
    if (!code || !parsed.data.activationCode) return fail('authentication_required', 'Kode kartu dan kode aktivasi diperlukan.', 401);
    const [card] = await db.query<{ active: number; secret_hash: string }>('SELECT active,secret_hash FROM cards WHERE code=? AND demo=? LIMIT 1', [code, demo ? 1 : 0]);
    if (!card) return fail('card_not_found', 'Kartu tidak ditemukan.', 404);
    if (card.active) return fail('card_active', 'Kartu sudah aktif.', 409);
    if (!verifyActivationCode(parsed.data.activationCode, card.secret_hash)) return fail('activation_code_invalid', 'Kode aktivasi salah.', 401);
    cardCode = code;
  }
  if (!cardCode) return fail('card_required', 'Pilih kartu sebelum mencari bisnis.', 400);

  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) return fail('places_not_configured', 'Google Places belum dikonfigurasi. Tempel tautan Google Review langsung untuk melanjutkan.', 503);

  try {
    let query = input;
    let sourceUrl: string | null = null;
    if (/^https?:\/\//i.test(input)) {
      if (isOfficialReviewUrl(input)) return fail('direct_review_url', 'Tautan ini sudah berupa link ulasan langsung; gunakan aktivasi manual.', 400);
      const expanded = await expandMapsUrl(input);
      sourceUrl = expanded.finalUrl;
      if (!expanded.businessHint) return fail('business_info_required', 'Nama bisnis tidak ditemukan di URL. Masukkan nama bisnis atau gunakan link ulasan langsung.', 422);
      query = expanded.businessHint;
    }
    query = query.trim().slice(0, 160);
    if (query.length < 2) return fail('business_info_required', 'Masukkan nama bisnis yang cukup jelas untuk dicari.', 422);
    const ids = await searchPlaceIds(query, apiKey);
    if (!ids.length) return fail('no_results', 'Google Places tidak menemukan kandidat. Perjelas nama bisnis atau gunakan link ulasan langsung.', 422);
    const candidates = candidatesFor(ids, query, sourceUrl, cardCode);
    return NextResponse.json({ ok: true, query, sourceUrl, candidates, requiresManualConfirmation: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof ResolverError) return fail(error.code, error.message, error.status);
    if (error instanceof DOMException && error.name === 'TimeoutError') return fail('resolver_timeout', 'Google Maps membutuhkan waktu terlalu lama. Coba lagi atau pakai link ulasan langsung.', 504);
    return fail('resolver_unavailable', 'Resolusi HTTP/Google Places tidak tersedia saat ini. Gunakan link ulasan langsung.', 502);
  }
}
