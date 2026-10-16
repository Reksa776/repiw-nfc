// Strict Google URL policy. Pure module (no Node/browser APIs) so it is unit-testable.
//
// We only ever accept HTTPS URLs on Google-operated hostnames. This is the SSRF boundary for
// the resolver: the browser, the HTTP expander and the Places API client all depend on it.

import { isPlausiblePlaceId } from './extract';

/** Hosts that are explicitly allowed in addition to the Google-domain pattern. */
const EXPLICIT_HOSTS = new Set([
  'maps.app.goo.gl',
  'goo.gl',
  'g.page',
  'maps.google.com',
  'www.google.com',
  'google.com',
  'search.google.com',
  'maps.googleapis.com',
  'places.googleapis.com',
]);

/**
 * Matches Google-owned domains, including country TLDs (google.com, google.co.id, google.co.uk).
 * Anchored at both ends so look-alikes such as `google.com.attacker.example` are rejected.
 */
const GOOGLE_DOMAIN = /^(?:[a-z0-9-]+\.)*google\.(?:com|[a-z]{2}(?:\.[a-z]{2})?)$/;

export function isAllowedGoogleHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (EXPLICIT_HOSTS.has(host)) return true;
  return GOOGLE_DOMAIN.test(host);
}

export type UrlClass =
  | 'official-review' // search.google.com/local/writereview?placeid=... (a real review URL)
  | 'gpage-review' // legacy g.page/r/<id>/review short review link
  | 'maps-short' // maps.app.goo.gl / goo.gl/maps shortlink
  | 'maps-place' // google.com/maps/place/... or maps.google.com place link
  | 'google-other' // an allowed Google host, unrecognized path
  | 'invalid'; // not https, not allowed host, or malformed

/**
 * The only URLs that may be stored as a card destination without running the resolver.
 * These are direct Google review destinations, not Maps place pages.
 */
export function isOfficialReviewUrl(value: string): boolean {
  const c = classifyGoogleUrl(value);
  return c === 'official-review' || c === 'gpage-review';
}

export function classifyGoogleUrl(value: string): UrlClass {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return 'invalid';
  }
  if (url.protocol !== 'https:') return 'invalid';
  if (url.username || url.password) return 'invalid';
  if (url.port && url.port !== '443') return 'invalid';
  if (!isAllowedGoogleHost(url.hostname)) return 'invalid';

  const host = url.hostname.toLowerCase();
  if (host === 'search.google.com') {
    if (url.pathname === '/local/writereview' && url.searchParams.get('placeid')) return 'official-review';
    return 'google-other';
  }
  if (host === 'g.page') {
    return /^\/r\/[^/]+\/review\/?$/i.test(url.pathname) ? 'gpage-review' : 'google-other';
  }
  if (host === 'maps.app.goo.gl' || host === 'goo.gl') {
    // goo.gl is a general shortener; only treat known maps/maps.app paths as maps shortlinks.
    if (host === 'goo.gl' && !/^\/maps/.test(url.pathname)) return 'google-other';
    return 'maps-short';
  }
  if (host === 'maps.google.com' || host === 'www.google.com' || host === 'google.com') {
    if (url.pathname.startsWith('/maps') || url.searchParams.has('ftid') || url.searchParams.has('cid')) return 'maps-place';
    return 'google-other';
  }
  return 'google-other';
}

/**
 * Extract the Place ID from an official review URL, if present. Used to recognize a pasted
 * review URL without any network work.
 */
export function placeIdFromReviewUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const id = url.searchParams.get('placeid') || url.searchParams.get('place_id') || url.searchParams.get('query_place_id');
    return id && isPlausiblePlaceId(id) ? id : null;
  } catch {
    return null;
  }
}
