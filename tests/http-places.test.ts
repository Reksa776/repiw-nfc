import { afterEach, describe, expect, it, vi } from 'vitest';
import { candidatesFor, expandMapsUrl, ResolverError, searchPlaceIds, verifyConfirmationToken } from '../src/lib/resolver/http-places';

const placeId = 'ChIJQeGqDPodby4RQBEuhEv7Zjs';
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('HTTP-only Maps expansion', () => {
  it('follows Google shortlink redirects and extracts a business hint from a full Maps URL', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: 'https://www.google.com/maps/place/Kopi+Pagi' } }))
      .mockResolvedValueOnce(new Response('unused body', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const result = await expandMapsUrl('https://maps.app.goo.gl/abc123');
    expect(result.finalUrl).toBe('https://www.google.com/maps/place/Kopi+Pagi');
    expect(result.businessHint).toBe('Kopi Pagi');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ redirect: 'manual', method: 'GET' });
  });

  it('rejects a redirect to a non-Google host', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/admin' } })));
    await expect(expandMapsUrl('https://maps.app.goo.gl/abc123')).rejects.toMatchObject({ code: 'unsafe_redirect' });
  });

  it('does not accept non-Maps Google short URLs or lookalike domains', async () => {
    await expect(expandMapsUrl('https://google.com.attacker.example/maps')).rejects.toBeInstanceOf(ResolverError);
    await expect(expandMapsUrl('https://goo.gl/short')).rejects.toMatchObject({ code: 'unsupported_url' });
  });
});

describe('Places IDs Only search', () => {
  it('requests exactly places.id and returns IDs without identity fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ places: [{ id: placeId }, { id: '0x1234:0xabcd' }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await searchPlaceIds('Kopi Pagi Jakarta', 'secret-api-key')).toEqual([placeId]);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://places.googleapis.com/v1/places:searchText');
    expect(new Headers(init.headers).get('X-Goog-FieldMask')).toBe('places.id');
    expect(init.body).toBe(JSON.stringify({ textQuery: 'Kopi Pagi Jakarta', maxResultCount: 5 }));
    expect(JSON.stringify(init)).not.toMatch(/displayName|formattedAddress|googleMapsLinks/);
  });

  it('maps quota, permission, and upstream errors to explicit resolver errors', async () => {
    for (const [status, code] of [[429, 'places_quota'], [403, 'places_permission'], [500, 'places_upstream']] as const) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status })));
      await expect(searchPlaceIds('Kopi Pagi', 'key')).rejects.toMatchObject({ code });
    }
  });
});

describe('signed administrator confirmation', () => {
  it('binds confirmation to the card, expires it, and refuses tampering', () => {
    vi.stubEnv('SESSION_SECRET', 'unit-test-secret-that-is-long-enough-123456');
    const [candidate] = candidatesFor([placeId], 'Kopi Pagi', 'https://www.google.com/maps/place/Kopi+Pagi', 'RP-0123456789');
    expect(verifyConfirmationToken(candidate.confirmationToken, 'RP-0123456789')?.placeId).toBe(placeId);
    expect(verifyConfirmationToken(candidate.confirmationToken, 'RP-9876543210')).toBeNull();
    expect(verifyConfirmationToken(`${candidate.confirmationToken}x`, 'RP-0123456789')).toBeNull();
  });
});
