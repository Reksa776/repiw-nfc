// Small client-safe helpers for the synchronous HTTP/Places resolver.
export type ResolutionPhase = 'idle' | 'resolving' | 'success' | 'inconclusive' | 'failed' | 'disabled' | 'unsupported' | 'timeout' | 'unavailable' | 'rate_limited';
export const REQUEST_TIMEOUT_MS = 15_000;

export function isDirectReviewUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) return false;
    if (url.hostname === 'search.google.com') return url.pathname === '/local/writereview' && Boolean(url.searchParams.get('placeid'));
    return url.hostname === 'g.page' && /^\/r\/[^/]+\/review\/?$/i.test(url.pathname);
  } catch { return false; }
}

export function phaseForResolveResponse(status: number, body: { code?: string | null } | null | undefined): Exclude<ResolutionPhase, 'idle'> {
  switch (body?.code) {
    case 'resolver_disabled': return 'disabled';
    case 'rate_limited': return 'rate_limited';
    case 'unsupported_url': case 'unsafe_redirect': return 'unsupported';
    case 'business_info_required': case 'no_results': case 'redirect_limit': return 'inconclusive';
    case 'resolver_timeout': return 'timeout';
  }
  if (status === 200) return 'success';
  if (status === 429) return 'rate_limited';
  if (status === 503) return 'disabled';
  if (status === 504) return 'timeout';
  if (status === 400) return 'unsupported';
  return 'failed';
}
