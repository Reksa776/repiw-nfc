import { describe, expect, it } from 'vitest';
import { classifyGoogleUrl, isOfficialReviewUrl, isAllowedGoogleHost } from '../src/lib/resolver/url-policy';
import { isPlausiblePlaceId, buildReviewUrl } from '../src/lib/resolver/extract';

describe('Google URL policy', () => {
  it('recognizes direct review and supported Maps links while rejecting lookalikes', () => {
    expect(classifyGoogleUrl('https://search.google.com/local/writereview?placeid=ChIJabc123')).toBe('official-review');
    expect(classifyGoogleUrl('https://g.page/r/abc/review')).toBe('gpage-review');
    expect(classifyGoogleUrl('https://maps.app.goo.gl/HihE1JQdDmzBDCVC8')).toBe('maps-short');
    expect(classifyGoogleUrl('https://www.google.com/maps/place/Foo')).toBe('maps-place');
    expect(classifyGoogleUrl('https://google.com.attacker.example/review')).toBe('invalid');
    expect(classifyGoogleUrl('http://google.com/maps')).toBe('invalid');
    expect(classifyGoogleUrl('https://evil.example/maps')).toBe('invalid');
  });
  it('accepts only direct review URL shapes for manual activation', () => {
    expect(isOfficialReviewUrl('https://search.google.com/local/writereview?placeid=ChIJabc123')).toBe(true);
    expect(isOfficialReviewUrl('https://search.google.com/local/writereview')).toBe(false);
    expect(isOfficialReviewUrl('https://maps.app.goo.gl/xyz')).toBe(false);
    expect(isOfficialReviewUrl('https://g.page/r/abc/review')).toBe(true);
  });
  it('allows Google country domains but not lookalikes', () => {
    expect(isAllowedGoogleHost('maps.google.com')).toBe(true);
    expect(isAllowedGoogleHost('www.google.co.id')).toBe(true);
    expect(isAllowedGoogleHost('google.com.attacker.example')).toBe(false);
  });
});

describe('Place ID safety', () => {
  it('rejects numeric CIDs, feature IDs, and malformed IDs', () => {
    expect(isPlausiblePlaceId('12345678901234567890')).toBe(false);
    expect(isPlausiblePlaceId('0x2e6f1dfa0caae141:0x3b66fb4b842e1140')).toBe(false);
    expect(isPlausiblePlaceId('short')).toBe(false);
    expect(isPlausiblePlaceId('ChIJQeGqDPodby4RQBEuhEv7Zjs')).toBe(true);
  });
  it('builds only a review URL from a validated ID', () => {
    expect(() => buildReviewUrl('123')).toThrow();
    expect(buildReviewUrl('ChIJQeGqDPodby4RQBEuhEv7Zjs')).toBe('https://search.google.com/local/writereview?placeid=ChIJQeGqDPodby4RQBEuhEv7Zjs');
  });
});
