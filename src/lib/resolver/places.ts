// Server-only module (calls the Google Places API); never import from client code.
import { isPlausiblePlaceId, buildReviewUrl } from './extract';

const PLACES_HOST = 'places.googleapis.com';
const FIELD_MASK = 'id,displayName,formattedAddress,googleMapsLinks.writeAReviewUri';

export interface PlaceDetails {
  placeId: string;
  name: string | null;
  address: string | null;
  /** Google's own review URI (may or may not be the writereview?placeid= form). */
  writeAReviewUri: string | null;
}

/**
 * Confirm a candidate Place ID with the official Google Places API (New) and enrich it with the
 * business identity. Returns null when the API is not configured, the place is unknown, or the
 * call fails. Never invents a Place ID.
 */
export async function fetchPlaceDetails(placeId: string, apiKey: string | null): Promise<PlaceDetails | null> {
  if (!apiKey || !isPlausiblePlaceId(placeId)) return null;
  try {
    const res = await fetch(`https://${PLACES_HOST}/v1/places/${encodeURIComponent(placeId)}?languageCode=en`, {
      method: 'GET',
      signal: AbortSignal.timeout(8000),
      headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': FIELD_MASK },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      id?: string;
      displayName?: { text?: string };
      formattedAddress?: string;
      googleMapsLinks?: { writeAReviewUri?: string };
    };
    if (!data.id || data.id !== placeId) return null;
    return {
      placeId: data.id,
      name: data.displayName?.text ?? null,
      address: data.formattedAddress ?? null,
      writeAReviewUri: data.googleMapsLinks?.writeAReviewUri ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Resolve a business by free-text query. Used only when an administrator supplies a business
 * name (not a Maps URL). Returns candidates with Google's own review URI.
 */
export async function searchPlacesByText(query: string, apiKey: string | null): Promise<PlaceDetails[]> {
  if (!apiKey) return [];
  try {
    const res = await fetch(`https://${PLACES_HOST}/v1/places:searchText`, {
      method: 'POST',
      signal: AbortSignal.timeout(8000),
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': `places.${FIELD_MASK.replace(/,/g, ',places.')}` },
      body: JSON.stringify({ textQuery: query, maxResultCount: 5 }),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      places?: Array<{ id?: string; displayName?: { text?: string }; formattedAddress?: string; googleMapsLinks?: { writeAReviewUri?: string } }>;
    };
    return (data.places ?? [])
      .filter((p) => p.id && isPlausiblePlaceId(p.id))
      .map((p) => ({
        placeId: p.id as string,
        name: p.displayName?.text ?? null,
        address: p.formattedAddress ?? null,
        writeAReviewUri: p.googleMapsLinks?.writeAReviewUri ?? null,
      }));
  } catch {
    return [];
  }
}

/** Prefer the canonical writereview URL; fall back to Google's own URI when it is safe. */
export function preferReviewUrl(placeId: string, writeAReviewUri: string | null): string {
  try {
    if (writeAReviewUri) {
      const u = new URL(writeAReviewUri);
      if (u.protocol === 'https:' && (u.hostname === 'search.google.com' || u.hostname.endsWith('.google.com'))) {
        return writeAReviewUri;
      }
    }
  } catch {
    /* ignore */
  }
  return buildReviewUrl(placeId);
}
