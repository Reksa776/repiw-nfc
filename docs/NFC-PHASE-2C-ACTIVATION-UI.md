# Phase 2C — NFC Activation UI Integration

| | |
|---|---|
| **Document** | `docs/NFC-PHASE-2C-ACTIVATION-UI.md` |
| **Status** | Implemented and verified (browser-driven e2e) |
| **Date** | 2026-10-16 |
| **Phase status field for the roadmap** | `2C — COMPLETE` |

---

## 1. Scope and approach

The existing activation interface was **extended, not rebuilt**. The original design (single smart
field, one-time code, NFC write / copy-link / open-link steps, Indonesian + English copy) is intact;
the resolver flow is layered onto the same component.

| File | Change |
|---|---|
| `src/components/activation-form.tsx` | Pre-existing resolver integration: request → poll → show verified business → explicit confirmation before activation |
| `src/lib/i18n.tsx` | Resolver state strings (id + en) |
| `src/app/api/activate/route.ts` | Accepts the verified result of a completed job instead of a raw URL |
| `src/lib/validation.ts` | `activationSchema` accepts an optional `resolutionJobToken` |

## 2. Required flow (as implemented)

1. **User enters a Google Maps URL** (or a business name, or a direct review URL) in the existing
   `reviewURL` field.
2. **UI validates the input** — a URL must be `https://…`; a direct Google review link
   (`search.google.com/local/writereview?placeid=…`, `g.page/r/…/review`) is recognised **in the
   browser** and needs no server round trip.
3. **UI requests asynchronous resolution** — `POST /api/resolve` with the card code and the entered
   activation code (both already on the page).
4. **UI displays pending/progress status** — the request returns immediately with a job token; the
   button shows *Memproses… / Working…*.
5. **UI polls for completion** — `GET /api/resolve/[token]` every 2 s, up to a 120 s client deadline.
6. **UI displays the resolved business name and address** — `t('resolvedBusiness')` with the name and
   address exactly as returned by the server.
7. **UI displays the generated direct Google Review URL** — rendered as a link
   (`t('resolvedReviewLink')`).
8. **User confirms that the resolved location is correct** — an explicit
   *"Ini bisnis yang benar / This is the correct business"* button. Until it is pressed, activation is
   impossible (`verifiedUrl` stays empty).
9. **Only then can activation proceed** — the submit button is `disabled={busy || !verifiedUrl}`, and
   the POST includes `resolutionJobToken`, which the server re-validates (Phase 2D §4).

## 3. States presented to the user

| State | Trigger | Message key |
|---|---|---|
| Resolving | job queued / polling | `resolvingLink` |
| Verified | job `success` + business shown | `verifiedReady` |
| Inconclusive | job `inconclusive` (no provable Place ID) | `resolverInconclusive` |
| Timeout | local 120 s deadline, or job `failed`/`expired` with `errorCode='timeout'` | `resolverTimeout` |
| Unsupported URL | `400` from `/api/resolve` | `resolverUnsupported` |
| Google temporarily unavailable | polling/network failure, or blocked/unavailable | `resolverUnavailable` |
| Resolver disabled | `503` from `/api/resolve` | `resolverDisabled` (tells the user to paste a direct review link) |
| Incorrect business | the admin/recipient does not press *confirm*, or presses *Change link* (`changeLink`) | — |
| Retry | any terminal failure state renders a retry button (`retryResolution`) | — |
| Failed | any other terminal failure | `resolverFailed` |

All strings exist in **both** Indonesian and English (`src/lib/i18n.tsx`, keys `resolver*`,
`resolved*`, `confirmLocation`, `changeLink`, `retryResolution`, `verifiedReady`,
`officialReviewDetected`, `pasteOrResolve`, `resolveMapsLink`).

## 4. Safety properties of the UI

- **No technical detail is exposed.** The UI only ever renders a mapped human message; API errors are
  passed through `localizedMessage()` and unknown server text is shown as-is only for the small set
  of already-user-safe API messages (the same behaviour the existing form had). Stack traces, SQL,
  tokens and worker details are never rendered — the polling endpoint returns none of them.
- **The existing activation-code workflow is preserved.** The activation code is still entered in the
  same field, still required, still consumed exactly once server-side.
- **Duplicate submissions are prevented.** The submit button is disabled while the request is in
  flight (`busy`), and the server's one-time-code consumption returns `409` on a replay.
- **A card is never marked active because a job started.** Resolution and activation are separate
  calls; the card row is only updated by `POST /api/activate` after a successful, verified,
  non-expired result. Status `pending`/`running` never writes to `cards`.
- **Manually supplied official Google Review URLs still work.** They bypass resolution entirely in the
  UI and are accepted by the API (`method='manual'`), exactly as before.

## 5. Verification

| Check | Evidence |
|---|---|
| Manual review URL still activates | `e2e/flows.spec.ts` (regression suite) — activates a card with `https://g.page/r/repiw-e2e/review` through the UI; `e2e/resolver.spec.ts` asserts `resolution_method='manual'` |
| Verified job → UI → activation | `e2e/resolver.spec.ts` ("verified resolution job activates a card exactly once…") |
| Resolver disabled state is reachable | `e2e/resolver-disabled.spec.ts` — the API returns `503`, which the form maps to `resolverDisabled` |
| Direct review link needs no server work | UI path exercised by `e2e/flows.spec.ts` (resolve button → confirm → submit, no network call to `/api/resolve`) |
| Wrong/incomplete input never activates | `e2e/flows.spec.ts` — unsafe host `400`, wrong code `401`, replay `409`, unknown card `404` |
| Admin-side destination editing UI | `e2e/resolver.spec.ts` ("the admin destination editor previews and saves a new destination through the UI") |

Note: the pre-existing `e2e/flows.spec.ts` asserted translated English strings while the UI defaults
to Indonesian, so it could not find its buttons ("Sign in", "Good to see you, Admin"). It was
repaired with language-agnostic selectors **without weakening any assertion** — see Phase 2F §3.1.

## 6. Admin destination editor (UI part of Phase 2E)

`src/components/destination-editor.tsx` (new) is rendered from the admin card table when the
administrator clicks *"Ubah tujuan / Change destination"* on an active card. It:

1. loads the card's current destination + provenance (`GET /api/admin/cards/[code]/destination`),
2. accepts a Maps link (server resolution) **or** a direct review URL (verified in the browser),
3. resolves, polls and shows the verified business + generated review URL, using the same state
   vocabulary as the activation form,
4. shows an **old → new preview** (plus Place ID) and writes nothing until *"Simpan tujuan baru /
   Save new destination"* is pressed,
5. reports a success banner and refreshes the dashboard.

New i18n keys: `destEditor`, `destEditorHint`, `destCurrent`, `destPreview`, `destConfirm`,
`destSaved`, `destManualHint`, `destClose`, `destUnchanged`, `destExplain`.

## 7. Limitations

1. Polling is client-side (2 s); no SSE/websocket. Long resolutions therefore show a progress state
   without a percentage — acceptable for a 10–20 s operation.
2. The client polls for at most 120 s, while a job lives 15 minutes. After a client timeout the job
   may still complete; pressing *Retry* re-binds and reuses the same in-flight job (dedupe by
   binding), so no duplicate browser work is performed.
3. The activation form reads the activation code from the DOM input at resolve time; if the user
   edits the code afterwards, the job stays bound to the same card and the final activation still
   verifies the (updated) code server-side. A wrong code yields `401` at activation, as before.
