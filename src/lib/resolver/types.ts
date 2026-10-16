// Structured types for the Google Maps -> Google Review resolver.
// Pure module: no Node/browser APIs, safe to import from tests.

/** Terminal resolution status. `inconclusive` means we could not prove a genuine Place ID. */
export type ResolveStatus = 'success' | 'inconclusive' | 'failed';

/** How the review URL was obtained. */
export type ResolveMethod =
  | 'passthrough' // input was already an official review URL
  | 'http' // resolved by following redirects over HTTP (no browser)
  | 'places-api' // verified/derived via Google Places API (New)
  | 'playwright' // resolved from Google Maps browser traffic
  | 'playwright+places'; // browser found a candidate, Places API confirmed it

/** Stable machine-readable error codes surfaced to callers (never raw stack traces). */
export type ResolveErrorCode =
  | 'disabled'
  | 'invalid_url'
  | 'host_not_allowed'
  | 'not_https'
  | 'unsupported_url'
  | 'google_blocked'
  | 'no_place_id'
  | 'identity_mismatch'
  | 'timeout'
  | 'browser_unavailable'
  | 'internal_error';

export interface ResolveResult {
  status: ResolveStatus;
  method: ResolveMethod | null;
  inputUrl: string;
  /** Final URL after shortlink/redirect expansion, when known. */
  resolvedUrl: string | null;
  /** Genuine Google Place ID, or null. Never fabricated from a CID/Feature ID. */
  placeId: string | null;
  /** https://search.google.com/local/writereview?placeid=... when verified. */
  reviewUrl: string | null;
  businessName: string | null;
  businessAddress: string | null;
  errorCode: ResolveErrorCode | null;
  errorMessage: string | null;
  durationMs: number;
  /** True when a Chromium instance was launched for this resolution. */
  usedBrowser: boolean;
}

export interface ResolverConfig {
  enabled: boolean;
  timeoutMs: number;
  maxConcurrency: number;
  browserPath: string | null;
  headless: boolean;
  placesApiKey: string | null;
}

export const OFFICIAL_REVIEW_PREFIX = 'https://search.google.com/local/writereview';
