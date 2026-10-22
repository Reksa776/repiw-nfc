// Place ID validation only. Google Place IDs are opaque strings; this module deliberately does
// not parse/scrape Maps HTML, payloads, coordinates, CIDs, or feature IDs into Place IDs.

export function isPlausiblePlaceId(value: string | null | undefined): boolean {
  if (!value) return false;
  const id = value.trim();
  if (id.length < 20 || id.length > 255) return false;
  if (!/^[A-Za-z0-9_-]+$/.test(id)) return false;
  if (/^\d+$/.test(id) || /^0x[0-9a-f]+:0x[0-9a-f]+$/i.test(id)) return false;
  return true;
}

export function buildReviewUrl(placeId: string): string {
  if (!isPlausiblePlaceId(placeId)) throw new Error('refusing to build a review URL from an implausible Place ID');
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}
