import { createHmac, timingSafeEqual } from 'node:crypto';
import { buildReviewUrl, isPlausiblePlaceId } from './extract';

const PLACES_ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';
const SHORT_HOSTS = new Set(['maps.app.goo.gl', 'goo.gl']);
const MAP_HOSTS = new Set(['google.com', 'www.google.com', 'maps.google.com', 'maps.google.co.id', 'maps.app.goo.gl', 'goo.gl']);
const MAX_REDIRECTS = 8;
const RESOLVE_TIMEOUT_MS = 10_000;

export type ResolvedCandidate = { placeId: string; reviewURL: string; mapsURL: string; confirmationToken: string };
export type ResolveInput = { input: string; code: string; activationCode?: string; cardCode?: string };
type SignedCandidate = { placeId: string; sourceUrl: string | null; query: string; cardCode: string; exp: number };

function allowedMapsUrl(value: string): URL | null {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443') || !MAP_HOSTS.has(u.hostname.toLowerCase())) return null;
    if (u.hostname === 'goo.gl' && !u.pathname.startsWith('/maps')) return null;
    return u;
  } catch { return null; }
}

/** Expand Google Maps redirects only. No arbitrary host, content scraping, or browser execution. */
export async function expandMapsUrl(value: string): Promise<{ finalUrl: string; businessHint: string | null }> {
  const first = allowedMapsUrl(value);
  if (!first) throw new ResolverError('unsupported_url', 400, 'Tautan Google Maps tidak didukung.');
  let current = first;
  const deadline = Date.now() + RESOLVE_TIMEOUT_MS;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await fetch(current, {
      method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(Math.max(1, Math.min(3500, deadline - Date.now()))),
      headers: { 'User-Agent': 'REPIW-Maps-Link-Resolver/1.0', 'Accept': 'text/html' },
    });
    const location = response.headers.get('location');
    await response.body?.cancel();
    if (response.status >= 300 && response.status < 400 && location) {
      if (hop === MAX_REDIRECTS) throw new ResolverError('redirect_limit', 422, 'Tautan terlalu banyak pengalihan.');
      const next = allowedMapsUrl(new URL(location, current).href);
      if (!next) throw new ResolverError('unsafe_redirect', 422, 'Pengalihan tautan keluar dari domain Google Maps yang diizinkan.');
      current = next;
      continue;
    }
    if (!response.ok) throw new ResolverError('shortlink_unavailable', 422, 'Google tidak mengembalikan tujuan tautan yang bisa dibaca lewat HTTP. Masukkan nama bisnis atau gunakan tautan ulasan langsung.');
    return { finalUrl: current.href, businessHint: businessHint(current) };
  }
  throw new ResolverError('redirect_limit', 422, 'Tautan terlalu banyak pengalihan.');
}

function businessHint(url: URL): string | null {
  const query = url.searchParams.get('query') || url.searchParams.get('q');
  if (query?.trim()) return query.trim().slice(0, 160);
  const match = url.pathname.match(/\/maps\/place\/([^/]+)/i);
  if (match?.[1]) {
    const name = decodeURIComponent(match[1].replaceAll('+', ' ')).replace(/\s+/g, ' ').trim();
    if (name && !/^\d/.test(name) && !/^-?\d+(?:\.\d+)?,-?\d/.test(name)) return name.slice(0, 160);
  }
  return null;
}

export class ResolverError extends Error {
  constructor(public code: string, public status: number, message: string) { super(message); }
}

export function createConfirmationToken(data: SignedCandidate): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) throw new ResolverError('server_config', 503, 'Konfigurasi keamanan server belum siap.');
  const encoded = Buffer.from(JSON.stringify(data)).toString('base64url');
  const sig = createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyConfirmationToken(token: string, cardCode: string): SignedCandidate | null {
  try {
    if (token.length > 4096) return null;
    const [encoded, supplied, extra] = token.split('.');
    if (!encoded || !supplied || extra) return null;
    const secret = process.env.SESSION_SECRET;
    if (!secret || Buffer.byteLength(secret) < 32) return null;
    const expected = createHmac('sha256', secret).update(encoded).digest();
    const actual = Buffer.from(supplied, 'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const data = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SignedCandidate;
    if (data.cardCode !== cardCode || data.exp < Date.now() || !isPlausiblePlaceId(data.placeId) || typeof data.query !== 'string' || data.query.length > 160) return null;
    if (data.sourceUrl !== null && !allowedMapsUrl(data.sourceUrl)) return null;
    return data;
  } catch { return null; }
}

export async function searchPlaceIds(query: string, apiKey: string): Promise<string[]> {
  const res = await fetch(PLACES_ENDPOINT, {
    method: 'POST', signal: AbortSignal.timeout(7000),
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': 'places.id' },
    body: JSON.stringify({ textQuery: query, maxResultCount: 5 }),
  });
  if (res.status === 429) throw new ResolverError('places_quota', 503, 'Kuota Google Places tidak tersedia saat ini. Gunakan tautan ulasan manual.');
  if (res.status === 401 || res.status === 403) throw new ResolverError('places_permission', 503, 'Google Places API belum diaktifkan atau API key tidak memiliki izin.');
  if (!res.ok) throw new ResolverError('places_upstream', 502, 'Google Places gagal mencari bisnis saat ini.');
  const data = await res.json() as { places?: Array<{ id?: string }> };
  return [...new Set((data.places ?? []).map(p => p.id).filter((id): id is string => Boolean(id && isPlausiblePlaceId(id))))];
}

export function candidatesFor(ids: string[], query: string, sourceUrl: string | null, cardCode: string): ResolvedCandidate[] {
  return ids.map(placeId => ({
    placeId,
    reviewURL: buildReviewUrl(placeId),
    mapsURL: `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}`,
    confirmationToken: createConfirmationToken({ placeId, sourceUrl, query, cardCode, exp: Date.now() + 10 * 60_000 }),
  }));
}
