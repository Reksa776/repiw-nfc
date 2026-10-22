# Phase 4 — Activation integration

The NFC activation UI now sends either a Maps URL or business-name query to `POST /api/resolve`. The endpoint requires same-origin requests, an opt-in feature flag, rate limiting, and either an authenticated admin session with Card ID or a valid inactive card plus one-time activation code. Candidates require an explicit manual check in Maps and a confirmation click. Direct official Google Review URLs still use the manual path.

`POST /api/activate` continues to consume the one-time code under a row lock and transaction. The signed candidate is bound to the same Card ID, expires after ten minutes, and yields the review URL from the real Place ID. Stored destination/provenance supports the existing active-card redirect; NFC taps do not invoke Maps resolution or Places.

The admin destination editor uses the same candidate flow and keeps its preview/explicit save. No schema columns were added because migration v6 already provides the required provenance fields. Existing active URLs are not rewritten.

Unit, DB integration, regression, and browser tests are described in Phase 7; successful implementation checks are not claimed until they run.
