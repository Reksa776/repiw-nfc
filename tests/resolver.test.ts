import { describe, expect, it, vi } from 'vitest';
import { classifyGoogleUrl, isOfficialReviewUrl, isAllowedGoogleHost, placeIdFromReviewUrl } from '../src/lib/resolver/url-policy';
import { isPlausiblePlaceId, buildReviewUrl, placeIdsFromText, bestPlaceIdFromText, placeIdFromUrlCandidates, addressFromMapsPayload, identityFromHtml, firstMeaningfulName } from '../src/lib/resolver/extract';
import { backoffSeconds, bindingHash, statusForResult, isTerminal, generateJobToken } from '../src/lib/resolver/jobs';
import { resolverConfig, isEnabled } from '../src/lib/resolver/config';

describe('google url policy', () => {
  it('accepts official review URLs and rejects lookalike hosts', () => {
    expect(classifyGoogleUrl('https://search.google.com/local/writereview?placeid=ChIJabc123')).toBe('official-review');
    expect(classifyGoogleUrl('https://g.page/r/abc/review')).toBe('gpage-review');
    expect(classifyGoogleUrl('https://maps.app.goo.gl/HihE1JQdDmzBDCVC8')).toBe('maps-short');
    expect(classifyGoogleUrl('https://www.google.com/maps/place/Foo')).toBe('maps-place');
    expect(classifyGoogleUrl('https://google.com.attacker.example/review')).toBe('invalid');
    expect(classifyGoogleUrl('http://google.com/maps')).toBe('invalid');
    expect(classifyGoogleUrl('https://user:pass@google.com/maps')).toBe('invalid');
    expect(classifyGoogleUrl('https://evil.example/maps')).toBe('invalid');
  });

  it('requires placeid for an official review URL', () => {
    expect(isOfficialReviewUrl('https://search.google.com/local/writereview?placeid=ChIJabc123')).toBe(true);
    expect(isOfficialReviewUrl('https://search.google.com/local/writereview')).toBe(false);
    expect(isOfficialReviewUrl('https://maps.app.goo.gl/xyz')).toBe(false);
    expect(isOfficialReviewUrl('https://g.page/r/abc/review')).toBe(true);
  });

  it('allows google country domains but not lookalikes', () => {
    expect(isAllowedGoogleHost('maps.google.com')).toBe(true);
    expect(isAllowedGoogleHost('www.google.co.id')).toBe(true);
    expect(isAllowedGoogleHost('google.com.attacker.example')).toBe(false);
    expect(isAllowedGoogleHost('notgoogle.com')).toBe(false);
  });

  it('reads a place id from a review URL', () => {
    expect(placeIdFromReviewUrl('https://search.google.com/local/writereview?placeid=ChIJQeGqDPodby4RQBEuhEv7Zjs')).toBe('ChIJQeGqDPodby4RQBEuhEv7Zjs');
    expect(placeIdFromReviewUrl('https://search.google.com/local/writereview')).toBe(null);
  });
});

describe('place id validation never accepts non Place IDs', () => {
  it('rejects CIDs, feature ids and short tokens', () => {
    expect(isPlausiblePlaceId('12345678901234567890')).toBe(false); // numeric CID
    expect(isPlausiblePlaceId('0x2e6f1dfa0caae141:0x3b66fb4b842e1140')).toBe(false); // ftid
    expect(isPlausiblePlaceId('ChIJ')).toBe(false); // too short
    expect(isPlausiblePlaceId('')).toBe(false);
    expect(isPlausiblePlaceId(null)).toBe(false);
    expect(isPlausiblePlaceId('ChIJQeGqDPodby4RQBEuhEv7Zjs')).toBe(true);
  });

  it('refuses to build a review URL from an implausible id', () => {
    expect(() => buildReviewUrl('123')).toThrow();
    expect(buildReviewUrl('ChIJQeGqDPodby4RQBEuhEv7Zjs')).toBe('https://search.google.com/local/writereview?placeid=ChIJQeGqDPodby4RQBEuhEv7Zjs');
  });

  it('extracts only genuine ids from maps payloads', () => {
    const payload = '...{"place_id":"ChIJQeGqDPodby4RQBEuhEv7Zjs"}...ftid 0x2e6f1dfa0caae141:0x3b66fb4b842e1140 cid=4286672331695538496';
    expect(placeIdsFromText(payload)).toContain('ChIJQeGqDPodby4RQBEuhEv7Zjs');
    expect(bestPlaceIdFromText(payload)).toBe('ChIJQeGqDPodby4RQBEuhEv7Zjs');
    expect(placeIdFromUrlCandidates('https://x/?placeid=ChIJQeGqDPodby4RQBEuhEv7Zjs')).toBe('ChIJQeGqDPodby4RQBEuhEv7Zjs');
  });
});

describe('identity extraction', () => {
  it('prefers a specific title over a generic og:title', () => {
    const html = '<meta property="og:title" content="Google Maps"><title>Warung Kopi - Google Maps</title>';
    expect(identityFromHtml(html).name).toBe('Warung Kopi');
  });
  it('skips generic names', () => {
    expect(firstMeaningfulName(['Google Maps', 'Google', 'Real Biz'])).toBe('Real Biz');
    expect(firstMeaningfulName(['Google Maps', null])).toBe(null);
  });
  it('reads an address array from a maps payload', () => {
    const payload = 'x,["Jl. Perjuangan","Sunyaragi","Kec. Kesambi","Kota Cirebon, Jawa Barat 45132"],y';
    expect(addressFromMapsPayload(payload)).toBe('Jl. Perjuangan, Sunyaragi, Kec. Kesambi, Kota Cirebon, Jawa Barat 45132');
  });
});

describe('job helpers', () => {
  it('hashes bindings deterministically and binds card + url', () => {
    expect(bindingHash('RP-AAAA', 'https://x')).toBe(bindingHash('RP-AAAA', 'https://x'));
    expect(bindingHash('RP-AAAA', 'https://x')).not.toBe(bindingHash('RP-BBBB', 'https://x'));
    expect(bindingHash('RP-AAAA', 'https://x')).not.toBe(bindingHash('RP-AAAA', 'https://y'));
  });
  it('computes bounded exponential backoff', () => {
    expect(backoffSeconds(1)).toBe(10);
    expect(backoffSeconds(2)).toBe(20);
    expect(backoffSeconds(3)).toBe(40);
    expect(backoffSeconds(20)).toBe(300);
  });
  it('maps resolver results to terminal job status', () => {
    expect(statusForResult({ status: 'success' } as never)).toBe('success');
    expect(statusForResult({ status: 'inconclusive' } as never)).toBe('inconclusive');
    expect(statusForResult({ status: 'failed' } as never)).toBe('failed');
    expect(isTerminal('success')).toBe(true);
    expect(isTerminal('pending')).toBe(false);
  });
  it('generates opaque unique tokens', () => {
    const a = generateJobToken(), b = generateJobToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]{20,64}$/);
  });
});

describe('resolver kill switch', () => {
  it('is disabled by default and enabled only when explicitly set', () => {
    vi.stubEnv('PLAYWRIGHT_RESOLVER_ENABLED', '');
    expect(isEnabled()).toBe(false);
    expect(resolverConfig().enabled).toBe(false);
    vi.stubEnv('PLAYWRIGHT_RESOLVER_ENABLED', '1');
    expect(isEnabled()).toBe(true);
    expect(resolverConfig().enabled).toBe(true);
    vi.unstubAllEnvs();
  });
});
