// Server-only module (imports node: builtins and Playwright); never import from client code.
import { resolverConfig } from './config';
import { classifyGoogleUrl, placeIdFromReviewUrl } from './url-policy';
import { placeIdFromUrlCandidates, buildReviewUrl, isPlausiblePlaceId } from './extract';
import { fetchPlaceDetails, preferReviewUrl } from './places';
import { resolveWithBrowser } from './browser';
import type { ResolveResult, ResolverConfig } from './types';

const GOOGLE_ONLY = /^(?:[a-z0-9-]+\.)*google\.(?:com|[a-z]{2}(?:\.[a-z]{2})?)$/;
const SHORT_HOSTS = new Set(['maps.app.goo.gl', 'goo.gl', 'g.page']);

/** Follow at most `maxHops` manual redirects, keepig every hop on an allowed Google host. */
export async function expandShortlink(input: string, maxHops = 6): Promise<string> {
  let current = input;
  try {
    for (let hop = 0; hop < maxHops; hop++) {
      const res = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(4000),
        headers: { 'User-Agent': 'REPIW-Link-Inspector/1.0', Range: 'bytes=0-0', Accept: 'text/html' },
      });
      const status = res.status;
      const location = res.headers.get('location');
      if (location) {
        try {
          await res.body?.cancel();
        } catch {
          /* ignore */
        }
      }
      if (status < 300 || status >= 400 || !location) break;
      let next: URL;
      try {
        next = new URL(location, current);
      } catch {
        break;
      }
      const allowed = next.protocol === 'https:' && !next.username && !next.password && (!next.port || next.port === '443') && (GOOGLE_ONLY.test(next.hostname.toLowerCase()) || SHORT_HOSTS.has(next.hostname.toLowerCase()));
      if (!allowed) break;
      current = next.href;
    }
  } catch {
    /* shortlink expansion is best-effort; the browser is the fallback */
  }
  return current;
}

/**
 * Resolve a Google Maps sharing URL (or an already-official review URL) into a verified
 * Google Review URL. Never fabricates a Place ID; returns `inconclusive` when it cannot prove one.
 */
export async function resolveGoogleReviewUrl(input: string, overrides?: Partial<ResolverConfig>): Promise<ResolveResult> {
  const config: ResolverConfig = { ...resolverConfig(), ...overrides };
  const started = Date.now();
  const base: ResolveResult = {
    status: 'failed',
    method: null,
    inputUrl: input,
    resolvedUrl: null,
    placeId: null,
    reviewUrl: null,
    businessName: null,
    businessAddress: null,
    errorCode: null,
    errorMessage: null,
    durationMs: 0,
    usedBrowser: false,
  };
  const done = (patch: Partial<ResolveResult>): ResolveResult => ({ ...base, ...patch, durationMs: Date.now() - started });

  if (!config.enabled) {
    return done({ status: 'failed', errorCode: 'disabled', errorMessage: 'The Playwright resolver is disabled.' });
  }

  const trimmed = (input || '').trim();
  if (!trimmed) return done({ status: 'failed', errorCode: 'invalid_url', errorMessage: 'No URL supplied.' });

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return done({ status: 'failed', errorCode: 'invalid_url', errorMessage: 'Not a valid URL.' });
  }
  if (parsed.protocol !== 'https:') return done({ status: 'failed', errorCode: 'not_https', errorMessage: 'Only HTTPS Google links are supported.' });

  const klass = classifyGoogleUrl(trimmed);
  if (klass === 'invalid') return done({ status: 'failed', errorCode: 'host_not_allowed', errorMessage: 'Only official Google HTTPS links are supported.' });

  // 1) Already an official review URL: no network work required.
  if (klass === 'official-review') {
    const placeId = placeIdFromReviewUrl(trimmed);
    return done({ status: 'success', method: 'passthrough', resolvedUrl: trimmed, placeId, reviewUrl: trimmed });
  }
  if (klass === 'gpage-review') {
    // A legacy g.page review link: follow it once to reach the canonical writereview URL.
    const expanded = await expandShortlink(trimmed, 4);
    const id = placeIdFromUrlCandidates(expanded) ?? (classifyGoogleUrl(expanded) === 'official-review' ? placeIdFromReviewUrl(expanded) : null);
    if (classifyGoogleUrl(expanded) === 'official-review') {
      return done({ status: 'success', method: 'passthrough', resolvedUrl: expanded, placeId: id, reviewUrl: expanded });
    }
    if (id) return done({ status: 'success', method: 'http', resolvedUrl: expanded, placeId: id, reviewUrl: buildReviewUrl(id) });
    // Fall back to the browser path below using the original link.
  }
  if (klass === 'google-other') {
    return done({ status: 'failed', errorCode: 'unsupported_url', errorMessage: 'This Google link is not a Maps place or review link.' });
  }

  // 2) Fast path: expand shortlinks over HTTP and look for a Place ID in the redirect chain.
  const expanded = await expandShortlink(trimmed);
  let placeId = placeIdFromUrlCandidates(expanded);
  let resolvedUrl: string | null = expanded !== trimmed ? expanded : null;

  // 3) Browser fallback: read the genuine Place ID from Google Maps traffic.
  let usedBrowser = false;
  let businessName: string | null = null;
  let businessAddress: string | null = null;

  if (!placeId && config.enabled) {
    usedBrowser = true;
    const outcome = await withConcurrency(config.maxConcurrency, () => resolveWithBrowser(expanded || trimmed, config));
    if (outcome.finalUrl) resolvedUrl = outcome.finalUrl;
    placeId = outcome.placeId;
    businessName = outcome.identity.name;
    businessAddress = outcome.identity.address;
    if (!placeId) {
      return done({
        status: 'inconclusive',
        method: 'playwright',
        resolvedUrl,
        usedBrowser,
        businessName,
        businessAddress,
        errorCode: outcome.errorCode === 'browser_unavailable' ? 'browser_unavailable' : outcome.errorCode === 'timeout' ? 'timeout' : 'no_place_id',
        errorMessage: 'Google did not expose a verifiable Place ID for this link.',
      });
    }
  }

  if (!placeId || !isPlausiblePlaceId(placeId)) {
    return done({
      status: 'inconclusive',
      method: usedBrowser ? 'playwright' : null,
      resolvedUrl,
      usedBrowser,
      businessName,
      businessAddress,
      errorCode: 'no_place_id',
      errorMessage: 'Could not determine a genuine Place ID.',
    });
  }

  // 4) Confirm/enrich with the official Places API when configured.
  let reviewUrl = buildReviewUrl(placeId);
  if (config.placesApiKey) {
    const details = await fetchPlaceDetails(placeId, config.placesApiKey);
    if (!details) {
      // The API could not confirm the id we saw in Maps traffic — do not trust it.
      return done({
        status: 'inconclusive',
        method: usedBrowser ? 'playwright' : 'places-api',
        resolvedUrl,
        placeId: null,
        usedBrowser,
        businessName,
        businessAddress,
        errorCode: 'identity_mismatch',
        errorMessage: 'Google Places could not confirm this Place ID.',
      });
    }
    businessName = details.name ?? businessName;
    businessAddress = details.address ?? businessAddress;
    reviewUrl = preferReviewUrl(placeId, details.writeAReviewUri);
  }

  return done({
    status: 'success',
    method: usedBrowser ? (config.placesApiKey ? 'playwright+places' : 'playwright') : 'places-api',
    resolvedUrl,
    placeId,
    reviewUrl,
    businessName,
    businessAddress,
    usedBrowser,
  });
}

/* --- tiny in-process concurrency guard (belt-and-braces alongside the worker) --- */
let active = 0;
const waiters: Array<() => void> = [];
async function withConcurrency<T>(limit: number, fn: () => Promise<T>): Promise<T> {
  if (active >= limit) await new Promise<void>((resolve) => waiters.push(resolve));
  active++;
  try {
    return await fn();
  } finally {
    active--;
    const next = waiters.shift();
    if (next) next();
  }
}
