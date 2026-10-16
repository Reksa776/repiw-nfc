// Place ID extraction & validation. Pure module (no Node/browser APIs).
//
// Google Place IDs are opaque strings. We MUST NOT invent one, and MUST NOT substitute a
// CID (all digits), a Feature ID (0x...:0x...) or a maps share token for a real Place ID.

/** Guard against substituting non-Place-ID identifiers. */
export function isPlausiblePlaceId(value: string | null | undefined): boolean {
  if (!value) return false;
  const id = value.trim();
  if (id.length < 20 || id.length > 255) return false;
  if (!/^[A-Za-z0-9_-]+$/.test(id)) return false;
  if (/^\d+$/.test(id)) return false; // CID (numeric customer id)
  if (/^0x[0-9a-f]+:0x[0-9a-f]+$/i.test(id)) return false; // Feature ID (ftid)
  return true;
}

export function buildReviewUrl(placeId: string): string {
  if (!isPlausiblePlaceId(placeId)) throw new Error('refusing to build a review URL from an implausible Place ID');
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}

/** Extract a placeid/place_id/query_place_id query parameter from any URL string. */
export function placeIdFromUrlCandidates(value: string): string | null {
  const patterns = [/[?&]place_?id=([A-Za-z0-9_-]+)/gi, /[?&]query_place_id=([A-Za-z0-9_-]+)/gi];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(value))) {
      if (isPlausiblePlaceId(m[1])) return m[1];
    }
  }
  return null;
}

/**
 * Extract a genuine Place ID from raw HTML/JSON that Google returned for a Maps place.
 * Only matches Google's own `place_id` fields and classic `ChIJ...` identifiers.
 */
export function placeIdsFromText(text: string): string[] {
  const found = new Set<string>();
  const patterns = [
    /"place_id":"([A-Za-z0-9_-]{20,255})"/g,
    /\\"place_id\\":\\"([A-Za-z0-9_-]{20,255})\\"/g,
    /\bplaceid=([A-Za-z0-9_-]{20,255})/g,
    /\b(ChIJ[A-Za-z0-9_-]{15,250})\b/g,
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      if (isPlausiblePlaceId(m[1])) found.add(m[1]);
    }
  }
  return [...found];
}

/** Best single candidate from a blob of text, preferring classic ChIJ identifiers. */
export function bestPlaceIdFromText(text: string): string | null {
  const ids = placeIdsFromText(text);
  if (!ids.length) return null;
  return ids.find((id) => id.startsWith('ChIJ')) ?? ids[0];
}

export interface ResolvedIdentity {
  name: string | null;
  address: string | null;
}

/**
 * Extract a business address from Google's `/maps/preview/place` payload. This payload embeds the
 * address as a small JSON string array such as
 * `["Jl. Perjuangan","Sunyaragi","Kec. Kesambi","Kota Cirebon, Jawa Barat 45132"]`.
 * Best-effort: returns null when nothing plausible is found.
 */
export function addressFromMapsPayload(text: string): string | null {
  if (!text) return null;
  const arrayRe = /\[((?:"(?:[^"\\]|\\.)*")(?:,"(?:[^"\\]|\\.)*"){2,6})\]/g;
  let match: RegExpExecArray | null;
  while ((match = arrayRe.exec(text))) {
    const parts = match[1]
      .split(/","/)
      .map((part) => decodeEntities(part.replace(/^"|"$/g, '').replace(/\\u003d/g, '=').replace(/\\/g, '')).trim())
      .filter(Boolean);
    if (parts.length < 3) continue;
    const joined = parts.join(', ');
    if (joined.length > 240) continue;
    // Require a postal-code-like token to avoid matching unrelated arrays.
    if (!/\b\d{4,5}\b/.test(joined)) continue;
    return joined;
  }
  return null;
}

/**
 * Extract a business name/address from a Maps document. Best-effort and non-fatal.
 * The `<title>` tag is usually the specific business name, while `og:title` is often the
 * generic "Google Maps", so the title is preferred and generic values are discarded.
 */
export function identityFromHtml(html: string): ResolvedIdentity {
  const metaTitle = matchFirst(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']{1,200})["']/i);
  const ogSiteName = matchFirst(html, /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']{1,200})["']/i);
  const titleTag = matchFirst(html, /<title>([^<]{1,200})<\/title>/i);
  const metaName = metaTitle ? decodeEntities(metaTitle).trim() : null;
  const titleName = titleTag ? cleanMapsTitle(titleTag, ogSiteName) : null;
  const name = firstMeaningfulName([titleName, metaName]);

  const addrMeta = matchFirst(
    html,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{1,300})["']/i,
  );
  const address = addrMeta ? decodeEntities(addrMeta).trim() : null;
  return { name, address: address && address.length < 300 ? address : null };
}

const GENERIC_NAMES = new Set(['google maps', 'google', 'maps', 'google maps platform']);

/** Return the first candidate that is a real business name rather than a generic page title. */
export function firstMeaningfulName(candidates: Array<string | null | undefined>): string | null {
  for (const candidate of candidates) {
    const value = (candidate ?? '').trim();
    if (!value) continue;
    if (GENERIC_NAMES.has(value.toLowerCase())) continue;
    return value;
  }
  return null;
}

function matchFirst(text: string, re: RegExp): string | null {
  const m = re.exec(text);
  return m ? decodeEntities(m[1]) : null;
}

function cleanMapsTitle(title: string, siteName: string | null): string {
  let t = title.trim();
  const suffix = siteName || 'Google Maps';
  for (const sep of [' - ', ' · ', ' – ']) {
    const idx = t.lastIndexOf(sep);
    if (idx > 0 && t.slice(idx + sep.length).toLowerCase().includes('google maps')) t = t.slice(0, idx);
  }
  if (t.toLowerCase().endsWith(' - google maps')) t = t.slice(0, -' - google maps'.length);
  if (t.toLowerCase().endsWith(' - google')) t = t.slice(0, -' - google'.length);
  void suffix;
  return t.trim() || title.trim();
}

export function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}
