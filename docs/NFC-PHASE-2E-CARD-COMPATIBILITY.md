# Phase 2E — Non-Destructive Card Update and Legacy Compatibility

| | |
|---|---|
| **Document** | `docs/NFC-PHASE-2E-CARD-COMPATIBILITY.md` |
| **Status** | Implemented and verified (API + admin UI + backfill dry run) |
| **Date** | 2026-10-16 |
| **Phase status field for the roadmap** | `2E — COMPLETE` |

---

## 1. The problem

Before this phase, the only way to change an active card's destination was
`POST /api/admin/cards/[code]/reactivate`, which **clears `review_url`, resets `activated_at`, issues
a new activation code and forces a full re-activation**. Neither the card code, the analytics, nor
the customer experience survived that.

## 2. The authorised destination-update workflow

### Endpoint — `src/app/api/admin/cards/[code]/destination/route.ts`

`GET` returns the card's current destination **and its provenance** (`review_url`, `place_id`,
`source_url`, `resolution_status`, `resolution_method`, `resolved_at`,
`resolved_business_name`, `resolved_business_address`).

`POST` body: `{ reviewURL?: string(2048), resolutionJobToken?: string, confirm?: boolean }` (at least
one of the first two).

| Step | Requires | Behaviour |
|---|---|---|
| Authorisation | admin session (`requireAdmin`) | `401` otherwise; `403` on cross-site (CSRF) |
| Validation | card code `RP-[A-F0-9]{10}`, demo scope match | `400` / `404` |
| Source of the new URL | either `resolutionJobToken` (must be `success`, must be bound to **this** card — `403` otherwise, must be an official review URL — `409` otherwise) **or** a direct official review URL | a Maps link submitted as `reviewURL` is rejected `400` |
| **Preview (default)** | no `confirm` | returns `{ ok, preview:true, oldUrl, newUrl, placeId, method, businessName, businessAddress }` and **writes nothing** |
| **Apply** | `confirm: true` | one transaction: `UPDATE cards SET review_url, place_id, source_url, resolution_status='verified', resolution_method, resolved_at, resolved_business_name, resolved_business_address WHERE id=?` + a `resolution_audit` row |

### What is preserved (verified in tests)

- the card **is not deleted**;
- the public **card code is unchanged** (`/c/<code>` keeps working, the physical tag does not need
  rewriting);
- **active state is unchanged** (never flipped to inactive);
- **activation history** (`activated_at`, consumed `secret_hash`) is untouched — no new activation code
  is issued;
- **visit analytics are untouched** (`visits` rows and their aggregates are preserved; asserted by
  counting visits before/after the update);
- **`resolution_audit`** records `actor`, `action='destination.update'`, `card_code`, `old_url`,
  `new_url`, `place_id`, `detail` for every applied change.

Confirmation is required: without `confirm`, the response is a preview of the **old and the new URL**
(plus the resolved business and Place ID) and the database is not modified. Asserted by
`e2e/resolver.spec.ts`.

### Admin UI — `src/components/destination-editor.tsx` (new)

Rendered from the admin card table via the new *"Ubah tujuan / Change destination"* action button on
active cards (button class `destination-edit`). It loads the current destination, accepts a Maps link
(server resolution) or a direct review URL, shows the verified business and generated review URL,
then renders an **old → new preview** and only writes when *"Simpan tujuan baru / Save new
destination"* is pressed. Success shows a banner and refreshes the dashboard. A Maps link can never
be saved through it (the server rejects it).

## 3. Backfill — `scripts/backfill-destinations.ts`

```
npm run resolver:backfill                                   # dry run (default): plan only, no writes
npm run resolver:backfill -- --apply                        # shows what WOULD change, still no writes
npm run resolver:backfill -- --apply --yes                  # performs the updates (explicit approval)
npm run resolver:backfill -- --card=RP-XXXXXXXXXX --apply --yes
npm run resolver:backfill -- --limit=25 --apply --yes
```

- **Selection:** `demo=? AND active=1 AND review_url IS NOT NULL` and the stored URL is *not* already
  an official review URL (`search.google.com/local/writereview…` or `g.page/r/…/review`) — i.e. exactly
  the cards the audit identified as broken.
- **Dry-run is the default**; `--apply` alone still writes nothing and tells the operator to add
  `--yes`. **No silent overwrites**, ever.
- **Per-card status** is printed (`OK` / `INCONCLUSIVE` / `FAILED` / `ERROR` plus the error code) with
  old and new destination for each card.
- **Failure isolation:** each card is resolved and updated independently; one failure never aborts the
  run, and unresolved cards are left **unchanged**.
- **Audit logging:** each applied update writes a `resolution_audit` row (`actor='backfill'`,
  `action='destination.backfill'`) inside the same transaction as the card update.
- **Kill switch:** refuses to run unless `PLAYWRIGHT_RESOLVER_ENABLED=1`.
- **No automatic bulk updates:** the script is never invoked by the app, a cron, or a request path.

## 4. The two NFC modes, and why physical tags matter

| Mode | How it works | Can a database change fix it? |
|---|---|---|
| **A. Application-controlled `/c/[code]` redirect** (recommended, the app default) | The tag contains `https://<host>/c/<code>?src=nfc`; `/c/[code]` records the visit and 302-redirects to the stored `review_url` | **Yes.** Re-pointing the card (Phase 2E endpoint/UI/backfill) instantly changes where the customer lands; the tag itself is untouched |
| **B. Direct-written Google URL on the tag** | After activation, `activation-form.tsx` `writeDirectLink()` (Web NFC) can write the **resolved review URL straight onto the chip** | **No.** That tag no longer contacts the application: no redirect, no analytics, and no server-side change can reach it |

**This is a hard physical limitation, not a bug.** For any card whose tag was written in direct mode,
changing the database has **zero** effect — the chip must be re-written (Web NFC or an NFC writer app)
or replaced. Practically:

- cards whose customers were sending to the wrong *Maps page* because the tag holds a
  `maps.app.goo.gl/…` or `google.com/maps/place/…` URL directly on the chip **cannot be fixed
  remotely**; they need re-tagging with the verified review URL (the activation screen's *"Write
  Google Review link to NFC chip"* button does exactly this once the card is activated with a verified
  destination);
- cards using mode A (the app redirect, including everything generated by the current admin UI) are
  fully repairable in place with no customer-visible disruption.

Prior to fixing a card, verify *which* mode its tag uses. If the customer's phone never hits
`/c/<code>`, the tag is in direct mode — check `/api/admin/stats` / the `nfc` column of the card
table: a card with no NFC visits but many reviews is almost certainly direct-written.

**Recommendation for future NFC programming:** keep the application-controlled redirect (mode A) as
the default. It preserves analytics, keeps destinations fixable, and is the only mode where a
resolution fix reaches an already-deployed tag.

## 5. Verification

| Check | Command / evidence | Result |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Build | `npx next build` | exit 0 (`/api/admin/cards/[code]/destination` present) |
| Preview writes nothing | `e2e/resolver.spec.ts` → POST without `confirm` returns `preview:true`, DB still holds the old URL | pass |
| Confirmed update replaces the destination | same test → DB `review_url` = new URL | pass |
| Code / active state / analytics preserved | same test → `code` unchanged, `active=1`, visit count identical | pass |
| Audit row written | same test → exactly 1 `destination.update` audit row | pass |
| Maps link rejected | same test → `400` | pass |
| Job bound to another card rejected | same test → `403` | pass |
| Admin UI end-to-end | `e2e/resolver.spec.ts` ("the admin destination editor previews and saves a new destination through the UI") → clicks the real button, sees the old→new preview, confirms, banner appears, DB updated | pass |
| Backfill dry run | `npm run resolver:backfill` (without `--yes`) | prints candidates and writes nothing (see Phase 2F §3.3) |
| Reactivation still works and still clears the destination | unchanged code path; `e2e/flows.spec.ts` covers the surrounding lifecycle | pass |

## 6. Limitations

1. Direct-written physical tags (mode B) cannot be updated remotely — see §4. There is no API that can
   change what a chip contains without a reader/writer session initiated by a device.
2. Backfill requires network access to Google and runs one browser resolution per card (10–20 s each);
   run it in batches (`--limit`) during a maintenance window.
3. The backfill's `resolved_business_address` is written as `NULL` (address enrichment during backfill
   is not attempted); the review URL and Place ID — the fields that matter — are always written, and
   the audit row records the old URL for rollback.
4. Destination updates are admin-only and single-card; there is deliberately no bulk API endpoint (bulk
   changes go through the audited, dry-run-first script).
5. Reverting means applying another destination update (the audit table keeps the previous URL, so a
   manual rollback is possible).
