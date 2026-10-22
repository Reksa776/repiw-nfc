# Phase 3 — Google Places API (New)

The active resolver calls `POST https://places.googleapis.com/v1/places:searchText` from the server with `X-Goog-FieldMask: places.id` exactly. It uses only `GOOGLE_PLACES_API_KEY`, never includes it in a response, and has a seven-second timeout. Request bodies ask for at most five candidates. Permission, quota, missing-key, empty result, and upstream errors have explicit response codes. No candidate is selected automatically.

## SKU and billing

The request is intended to trigger **Places API Text Search Essentials (IDs Only)** (global SKU `635D-A9DD-C520`; India SKU `9C44-5A2D-4E06`), since it requests `places.id` only. The current Google global pricing table lists an unlimited free usage cap for that SKU. Google still requires Cloud billing to be enabled; operators must verify current regional price, SKU mapping, account eligibility, and terms before enabling. [Google pricing](https://developers.google.com/maps/billing-and-pricing/pricing), [usage and billing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing).

## Trust model

IDs Only supplies no business name/address. The UI displays candidate Place IDs and Google Maps links. An administrator must independently inspect the candidate and explicitly confirm it. The server issues a 10-minute HMAC confirmation token bound to the Card ID; activation validates it and stores the actual Place ID, source URL, query text, and `google-places-ids-only` provenance. No Places re-query is needed at activation. The query text is recorded as supplied search context, not represented as Google-verified identity.

No live Places API call was made because no credential was available. Never substitute guessed IDs or paid display fields to make the UI look verified.
