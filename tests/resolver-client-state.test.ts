import { describe, expect, it } from 'vitest';
import { isDirectReviewUrl, phaseForResolveResponse } from '../src/lib/resolver/client-state';

describe('direct review URL validation', () => {
  it('accepts supported Google review formats and rejects Maps or unsafe links', () => {
    expect(isDirectReviewUrl('https://search.google.com/local/writereview?placeid=ChIJQeGqDPodby4RQBEuhEv7Zjs')).toBe(true);
    expect(isDirectReviewUrl('https://g.page/r/repiw-e2e/review')).toBe(true);
    expect(isDirectReviewUrl('https://maps.app.goo.gl/example')).toBe(false);
    expect(isDirectReviewUrl('http://g.page/r/repiw-e2e/review')).toBe(false);
  });
});

describe('synchronous resolver states', () => {
  it('maps success and expected API errors to terminal UI states', () => {
    expect(phaseForResolveResponse(200, { code: undefined })).toBe('success');
    expect(phaseForResolveResponse(503, { code: 'resolver_disabled' })).toBe('disabled');
    expect(phaseForResolveResponse(429, { code: 'rate_limited' })).toBe('rate_limited');
    expect(phaseForResolveResponse(422, { code: 'business_info_required' })).toBe('inconclusive');
    expect(phaseForResolveResponse(504, { code: 'resolver_timeout' })).toBe('timeout');
    expect(phaseForResolveResponse(400, { code: 'unsupported_url' })).toBe('unsupported');
    expect(phaseForResolveResponse(502, { code: 'places_upstream' })).toBe('failed');
  });
});
