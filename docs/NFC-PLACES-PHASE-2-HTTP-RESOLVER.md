# Phase 2 — HTTP-only Google Maps resolver

## Implemented

- `src/lib/resolver/http-places.ts` expands only HTTPS Google Maps URLs (`maps.app.goo.gl`, Maps paths on approved Google hosts, and `goo.gl/maps`). Each hop is manual, bounded to eight redirects, HTTPS/443 only, disallows credentials, and must remain on the Maps host allowlist. The fetch does not read response bodies; it cancels them.
- Per-request and overall timeouts bound network work. Unsupported URLs, unsafe redirects, redirect overflow, non-2xx shortlinks, and timeouts return structured errors.
- Business context is taken from a Maps query parameter or human-readable `/maps/place/` path segment. It never treats CIDs, coordinates, fragments, or opaque feature IDs as Place IDs.
- If no usable business hint exists, the API asks the operator to provide business information or use the manual direct-review URL flow.
- Resolver does not launch a browser, scrape page content, or promise every shortlink is resolvable by HTTP.

## Verification and limits

Live HTTP expansion was run 2026-10-19 for `https://maps.app.goo.gl/fWWYKH1dN7TCHQ8V9`: it followed HTTPS Google redirects to `www.google.com` and extracted a human-readable business hint for UIN Siber Syekh Nurjati Cirebon. It did not extract or assume a Place ID, and did not query Places because no key is configured. Google can change redirect behavior or refuse server-side requests. The implementation does not follow HTML meta-refresh or parse Maps response content by design.
