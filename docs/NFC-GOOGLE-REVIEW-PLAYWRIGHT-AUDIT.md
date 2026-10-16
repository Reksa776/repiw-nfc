# NFC Google Review – Playwright Integration Audit

| | |
|---|---|
| **Document** | `docs/NFC-GOOGLE-REVIEW-PLAYWRIGHT-AUDIT.md` |
| **Phase** | Phase 1 — Read-only audit (no implementation) |
| **Status** | Audit complete. No application source code, database, or configuration was modified. |
| **Date** | 2026-10-16 |
| **Repository** | `repiw-app-v1` v2.0.0 (Next.js + Supabase PostgreSQL) |

## Method and evidence rules

This audit was performed by reading the repository source, migrations, configuration, tests, and the read-only legacy reference project (`legacy-v1/`). Every finding below is tagged:

- **[VERIFIED]** — confirmed directly from source/config in this repository.
- **[ASSUMPTION]** — inferred, not directly observable here.
- **[RECOMMENDATION]** — proposed action, not yet implemented.

Git metadata was not available to the audit host (`git log`/`git status` returned nothing), so no commit-level history could be reviewed. No tests, migrations, network calls, or Playwright runs were executed. Where a claim could only be proven by running the app against a live database or Google, it is marked as unverified.

---

## 1. Executive Summary

The application is a **Next.js 16 / React 19 app** on **Node.js ≥ 22.5** that manages NFC/QR review cards. An activated card redirects the customer to whatever URL an administrator stored in `cards.review_url` **[VERIFIED]**.

**The root cause of the reported conversion failure is that no conversion exists.** The system never resolves a Google Maps share link (`maps.app.goo.gl/...`) into a Google review URL and never extracts a Place ID. It only *validates that the host is on an allow-list* and then **stores the pasted URL verbatim** **[VERIFIED]**. A share link such as `https://maps.app.goo.gl/HihE1JQdDmzBDCVC8` passes validation and is saved unchanged, so tapping the card opens the **Maps place page, not the review form**.

The only path that currently produces a genuine `search.google.com/local/writereview?placeid=...` URL is **Google Places API (New) business-name search**, which is **optional and off by default** (requires `GOOGLE_MAPS_API_KEY`; returns HTTP 503 when unset) **[VERIFIED]**. The "Analyze Google link" server route attempts a plain `fetch`-based shortlink expansion but only *classifies* the result; it never extracts a Place ID or builds a review URL, and Google routinely blocks the automated fetch (acknowledged in a source comment) **[VERIFIED]**.

**Playwright feasibility:** technically possible — the Node runtime, a headless browser, and Playwright packages are already present in the dev environment — but integrating it **synchronously into the existing Next.js request path is unsafe**: ~21.7 s and ~823 MB peak per resolution against a shared server with a DB pool of only 5 and no worker/queue/hosting guarantees. The recommended architecture is an **isolated resolver (Option B)** or a **queue + background worker (Option C)**, executed at activation/configuration time only.

**Verdict: CONDITIONAL GO** — approve the Playwright resolver as a **separate, asynchronous, allow-listed service**, not inside the activation request handler. See §15.

---

## 2. Current Technology Stack

| Component | Value | Evidence |
|---|---|---|
| Framework | Next.js `^16.0.0` (App Router) **[VERIFIED]** | `package.json` |
| UI | React `^19.0.0`, React DOM 19 **[VERIFIED]** | `package.json` |
| Language | TypeScript `^5.9.0` **[VERIFIED]** | `package.json`, `tsconfig.json` |
| Node engine | `>=22.5.0`; local runtime `v24.21.0` **[VERIFIED]** | `package.json`, `node -v` |
| Package manager | npm (`package-lock.json` present) **[VERIFIED]** | repo root |
| Database | Supabase-hosted PostgreSQL via `pg ^8.23.1` **[VERIFIED]** | `src/lib/db.ts`, `scripts/migrate-postgres.js` |
| Validation | `zod ^4.0.0` **[VERIFIED]** | `src/lib/validation.ts` |
| QR | `qrcode ^1.5.4` **[VERIFIED]** | `package.json` |
| ZIP export | `archiver ^7.0.1` **[VERIFIED]** | `package.json` |
| Tests | Vitest (unit), Playwright (e2e, dev-only) **[VERIFIED]** | `tests/security.test.ts`, `e2e/flows.spec.ts` |
| Optional Google service | Places API (New) `searchText`, key-gated **[VERIFIED]** | `src/app/api/activate/route.ts` |

**Note on Playwright packages.** `@playwright/test@^1.55.0` is a **devDependency**; `playwright` and `playwright-core` exist in `node_modules` only as its transitive dev deps **[VERIFIED]**. A production install (`npm ci --omit=dev`) would **not** include them. Server-side Playwright therefore requires a **new runtime dependency** — which is out of scope for this read-only phase.

---

## 3. Repository Architecture

**Verified structure [VERIFIED]**

- `src/app/` — App Router pages (`/`, `/admin`, `/c/[code]`, `/demo-review`, `/flow-preview`, `/not-found`) and `src/app/api/**` route handlers.
- `src/lib/` — `db.ts` (pg pool + transaction + `server-only`), `auth.ts` (session auth), `http.ts` (CSRF/rate-limit helpers), `validation.ts` (zod + URL policy), `security.ts` (activation-code crypto), `cards.ts` (visit/stats queries).
- `src/components/` — client components (admin panel, activation form, NFC programmer, flow preview).
- `scripts/` — migration and import tooling (run manually).
- `tests/`, `e2e/` — Vitest unit tests and one Playwright e2e spec.
- `legacy-v1/` — the **previous Express + SQLite** implementation, kept as a read-only reference. **Not the running app.**

**Rendering & execution model [VERIFIED]**

- **Hybrid SSR + route handlers.** Pages are React Server Components; `/c/[code]` is `dynamic='force-dynamic'`. All API routes declare `export const runtime='nodejs'`.
- **No static export, no serverless config.** There is **no `vercel.json`, `Dockerfile`, `docker-compose.yml`, or `ecosystem.config.js`** **[VERIFIED]**. Deployment is generic `next start` behind a host-managed secret store (per `README.md`), i.e. **VPS/container-style, not a locked serverless target**.

**Backend / API surface [VERIFIED]**

- Public: `GET/POST /api/activate`, `GET /api/card/[code]`, `POST /api/login`, `POST /api/logout`, `/c/[code]` page.
- Admin (session-gated): `POST /api/admin/generate`, `GET/DELETE /api/admin/cards*`, `POST /api/admin/cards/[code]/reactivate`, `POST /api/admin/cards/[code]/activation-code`, `GET /api/admin/qr/[code]`, `GET /api/admin/qr-zip`, `GET /api/admin/stats`, `POST /api/admin/nfc/register`.
- Demo-only: `/api/demo/**`.

**Database access [VERIFIED]**

- Server-only `pg` pool, `PG_POOL_SIZE` default **5**, `application_name='repiw-nextjs'` (`src/lib/db.ts`).
- Parameterized queries with a `?`→`$n` shim; `transaction()` wraps `BEGIN/COMMIT/ROLLBACK`.
- **No ORM.** Raw SQL only.

**Authentication & authorization [VERIFIED]**

- Admin: scrypt password hashes, DB-backed sessions; cookie `repiw_session` is `httpOnly`, `sameSite=strict`, `secure` in production (`src/lib/auth.ts`).
- CSRF: `sameOrigin()` checks on all state-changing routes (`src/lib/http.ts`).
- Rate limiting: DB-backed `rate_events` buckets with `pg_advisory_xact_lock` (`enforceRateLimit`).
- Public activation additionally requires a one-time activation code (scrypt-hashed, AES-256-GCM-encrypted at rest).

**Background jobs / workers [VERIFIED]**

- **None.** There is no queue, cron, worker process, or job table. All work happens inside request handlers.

**Third-party integrations [VERIFIED]**

- Google Places API (New) `places:searchText` — optional, server-side, key-gated (`src/app/api/activate/route.ts`).
- Supabase (hosting + Postgres). No Redis, no object storage, no other external service.

**Classification:** **Hybrid server-rendered + node API, container/VPS-hosted, single-process, no background compute.** **[VERIFIED]**

---

## 4. Existing NFC Card Lifecycle

All steps below are **[VERIFIED]** from source.

1. **Registration / generation** — `POST /api/admin/generate` (`src/app/api/admin/generate/route.ts`) inserts rows into `cards` with `code` = `RP-` + 10 hex, a 4-char activation code (`makeCode`/`makeActivationCode` in `src/lib/db.ts`), scrypt `secret_hash`, and an encrypted copy of the code. Batch size 1–100.
2. **Identifier generation & storage** — `code` (unique, `VARCHAR(32)`), `secret_hash`, `activation_code_encrypted`; `active` defaults 0 (`0`/`1` smallint), `demo` 0/1.
3. **Assignment to client** — there is **no separate client/owner entity**. A card is "assigned" implicitly by activating it with the business's review URL. `cards.review_url` is the only business-specific field.
4. **Activation** — `POST /api/activate` (`src/app/api/activate/route.ts`): validates `code`, `activationCode`, `reviewURL`; runs a transaction with `SELECT ... FOR UPDATE`, verifies the code, then `UPDATE cards SET active=1, review_url=?, activated_at=..., secret_hash='consumed:<sha256>' , activation_code_encrypted=NULL WHERE id=? AND active=0`. **The `reviewURL` is stored verbatim.**
5. **Destination storage** — `cards.review_url` (`VARCHAR(2048)`), migration `initial_supabase_schema`.
6. **Updating an existing destination** — **there is no edit-destination endpoint.** Updating requires **reactivation**: `POST /api/admin/cards/[code]/reactivate` sets `active=0, review_url=NULL` and issues a new code; the admin then re-activates with the new URL.
7. **Redirect handling** — `src/app/c/[code]/page.tsx`: for an active card, records a visit, then `redirect(card.review_url)` (or to `/demo-review` in demo mode). Cards are **application-controlled redirect URLs**, not direct Google URLs, **unless** the admin later overwrites the physical tag via Web NFC (see below).
8. **Direct vs. controlled** — Two modes coexist:
   - **App redirect (default):** NFC/QR contains `…/c/<code>?src=nfc`, which 302s to `review_url`.
   - **Direct-write (post-activation):** `activation-form.tsx` `writeDirectLink()` writes `reviewTarget` **directly onto the tag** via Web NFC. A tag rewritten this way **bypasses the app entirely** — no analytics, and the stored `review_url` is irrelevant to that tag.
9. **Disable / reassign / delete** — reactivate = disable + clear URL; `DELETE /api/admin/cards/[code]` removes the row (and cascades `visits`), so the `/c/<code>` URL 404s. Physical tags are not touched by DB deletion.
10. **Legacy URL dependence** — Existing active cards may hold `g.page/r/...`, `maps.app.goo.gl/...`, or `www.google.com/maps/place/...` values; the demo seeder and `legacy-v1/server.js` both use exactly those shapes (`src/app/api/demo/seed/route.ts`, `legacy-v1/server.js` `DEMO_REVIEWS`). **[VERIFIED]**

**Breakage risk:** Because there is **no edit path**, any change to validation rules only affects *new activations*. Existing cards keep redirecting to their stored `review_url`. This is protective for compatibility but also means a conversion fix will **not** automatically repair already-activated cards.

---

## 5. Current Google Maps Conversion Flow

**Entry point:** the single smart field in `src/components/activation-form.tsx` accepts either a URL or a business name and calls `GET /api/activate?inspectURL=…` or `?businessSearch=…`.

**`GET /api/activate` (inspect / search) [VERIFIED]** — `src/app/api/activate/route.ts`:

- `businessSearch`: calls Places API (New) `searchText` and returns `places.googleMapsLinks.writeAReviewUri` as the review URL. **Requires `GOOGLE_MAPS_API_KEY`; returns 503 if unset.** This is the only path that yields a real review-form URL.
- `inspectURL`: validates via `validReviewURL`, then follows **up to 6 manual HTTP redirects** with a plain `fetch` (UA `REPIW-Link-Inspector/1.0`, `Range: bytes=0-0`, 3.5 s timeout), re-checking each hop against `GOOGLE_HOSTS`. It returns `{ kind, finalURL, resolved }`. `linkKind()` **only classifies** the link (`review` / `maps-place` / `maps-short` / `google-other`); **it never extracts a Place ID and never builds a `writereview` URL.**
- Source comment: *"Google may block automated requests; the UI reports that resolution was inconclusive."*

**`POST /api/activate` (persist) [VERIFIED]** — validates with `validReviewURL()` and stores `reviewURL` **unchanged**.

**URL policy [VERIFIED]** — `src/lib/validation.ts`:

```ts
const reviewHosts = new Set(['g.page','google.com','www.google.com','maps.google.com','maps.app.goo.gl']);
export function validReviewURL(value: string) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) return false;
  if (url.hostname === 'search.google.com')
    return url.pathname === '/local/writereview' && Boolean(url.searchParams.get('placeid'));
  return reviewHosts.has(url.hostname);
}
```

**When conversion runs:** never, in any of these forms. Inspect classifies; activate stores. There is **no** conversion at activation, at edit (no edit exists), or at tap time.

### Identity-type disambiguation **[VERIFIED concepts, VERIFIED absence in code]**

| Identifier | What it is | Present in repo? |
|---|---|---|
| **Place ID** | Google's stable place key, e.g. `ChIJ...`; used in `writereview?placeid=` | **Only** as `places.id` from Places API search; **never parsed from a Maps URL** |
| **CID** (`cid=` query) | Legacy numeric customer ID | **Not handled anywhere** |
| **Feature ID** (`ftid=`/`1s0x…:0x…`) | Encoded Maps feature reference, distinct from Place ID | **Not handled anywhere** |
| **Maps place URL** | `google.com/maps/place/…` | Accepted & stored as-is |
| **Short link** | `maps.app.goo.gl/…` | Accepted & stored as-is |
| **Official review URL** | `search.google.com/local/writereview?placeid=…` | Recognized when pasted directly; produced only by Places API search |

The codebase never substitutes CID or Feature ID for a Place ID (correct — it simply doesn't attempt conversion). **Any future resolver must extract the real Place ID only, never synthesize one.**

---

## 6. Root Cause of Conversion Failure

**Primary root cause [VERIFIED]:** `POST /api/activate` performs **host allow-listing only** and persists the submitted URL verbatim. `maps.app.goo.gl` is on the allow-list, so a share link is **accepted and stored unchanged**. The card then redirects customers to the **Maps place page**, which is not the review composer. There is **no Place ID extraction, no shortlink→place resolution, and no `writereview` URL construction** anywhere in `src/`.

**Contributing causes [VERIFIED]:**

1. **Shortlink expansion is unreliable by design.** `inspectURL` uses a plain server `fetch`; `maps.app.goo.gl` commonly bounces through `consent.google.com` (not on the allow-list) or returns a JS/consent page, so `resolved` stays `false` and `kind` remains `maps-short`. The code explicitly documents this.
2. **Even successful resolution lands on a place page, not a review URL.** `linkKind()` stops at classification; nothing maps the resolved place to its Place ID.
3. **The only reliable converter is optional and off by default.** Places API search requires a key and a *business name* query — not a way to translate an arbitrary share link.
4. **No persistence of provenance.** There is no column recording the original Maps link, resolved place, or Place ID, so a wrong conversion cannot be audited or re-run.

**Net effect:** admins must paste a *direct review URL* themselves, or run a business-name search with an API key. Pasting the Google Maps share link — the actual reported workflow — silently succeeds but stores the wrong destination.

---

## 7. Database and API Impact

### Database **[VERIFIED]** — `scripts/migrate-postgres.js`

Tables: `cards`, `visits`, `admins`, `sessions`, `rate_events`, `schema_migrations`, `data_imports`.

`cards` columns: `id, code, secret_hash, active, review_url, activated_at, demo, created_at, nfc_registered_at, activation_code_encrypted`.

**Relevant gaps for a resolver:**

- **No `place_id`**, **no `source_url` / `resolved_url`**, **no resolution status/timestamp**, **no `source_type`**. Provenance is lost the moment a card is activated.
- `review_url` is `VARCHAR(2048)` — ample. Adding nullable columns is **additive and non-breaking** (the migration runner is versioned and idempotent).

### API impact of the proposed feature

| Endpoint | Impact | Notes |
|---|---|---|
| `POST /api/activate` | **Behavior change (risky)**: would need to convert before storing | Currently synchronous; a 21.7 s inline resolve risks proxy/route timeouts |
| `GET /api/activate?inspectURL=` | Natural home for "resolve & return Place ID + review URL" | Already rate-limited (`20 / 15 min`) and Google-host allow-listed |
| `POST /api/admin/cards/[code]/reactivate` | Clears `review_url`; a re-activation would re-run conversion | No edit path exists today |
| `GET /c/[code]` | **No change desired** — must stay a fast pure redirect | Conversion must **not** run at tap time |
| New: resolver/queue API | Would be added for async resolution + polling/status | See §11 |

**[RECOMMENDATION]** Persist a resolution record (source URL, resolved URL, Place ID, status, timestamp) so admins can see and correct mistakes, and so existing cards can be backfilled safely.

---

## 8. Playwright Compatibility Assessment

### Verified environment facts

| Factor | Finding | Evidence |
|---|---|---|
| Node runtime | Node ≥ 22.5 required; **v24.21.0** present | `package.json`, `node -v` |
| API runtime | All routes `runtime='nodejs'` (not Edge) | `grep` across `src/app/api` |
| Playwright package | **dev-only** today (`@playwright/test`); `playwright`/`playwright-core` only transitively installed | `package.json`, `package-lock.json` |
| Browser binary | `/usr/bin/google-chrome` exists in **this dev workspace**; Playwright chromium cache present | `ls`, `playwright.config.ts` (`executablePath:'/usr/bin/google-chrome'`) |
| Hosting model | Generic `next start`; **no serverless lock**, no Dockerfile | repo root, `README.md` |
| Request timeouts | No `maxDuration` set; no evidence of a configured proxy timeout | `grep maxDuration` → none |
| Memory budget | Not configured; `PG_POOL_SIZE` default 5 | `src/lib/db.ts` |
| Background workers | **None** | §3 |
| Concurrency controls | Only DB rate-limit buckets; no semaphore/queue | `src/lib/http.ts` |
| Caching | None (no Redis/KV); every `GET` is `no-store` | route headers |
| Error handling | Uniform `jsonError()` + try/catch | `src/lib/http.ts` |
| Rate limiting | DB `rate_events` + advisory locks; `inspectURL` = 20/15 min | `src/lib/http.ts`, `activate/route.ts` |
| Security posture | Postgres uses `sslmode=require/verify-full` in prod | `scripts/check-production-env.js` |

### Comparison of integration options

**Option A — Directly in the existing backend (inside `POST /api/activate`).**
- ✔ Uses existing Node runtime, auth, and rate limiting.
- ✘ **~21.7 s / ~823 MB per resolution** (reference figures from the experimental project, **[ASSUMPTION]**, not measured here) blocks a request thread; risks gateway/route timeouts and, with concurrency, OOM on a small instance.
- ✘ Requires promoting Playwright to a **runtime dependency** and shipping browser binaries to the app host.
- ✘ Couples a heavy, brittle external-scraping step to the critical activation path.
- **Verdict: not recommended as the primary path.**

**Option B — Isolated resolver service.**
- ✔ Isolates memory/CPU, lets the resolver be scaled, restarted, or rate-limited independently; keeps the Next.js app lean.
- ✔ Fits the existing container/VPS deployment (no serverless constraint).
- ✔ Allows a strict outbound allow-list and per-IP/job concurrency cap **inside** the resolver.
- ✘ Adds a second deployable and an internal auth secret.
- **Verdict: recommended.**

**Option C — Existing background worker.**
- ✔ Would be ideal **if** a worker existed.
- ✘ **No worker/queue exists** in this repo; building one is a larger change than the feature itself.
- **Verdict: viable only after a queue is introduced; effectively a sub-case of B.**

### Reference metrics caveat

The figures **5/5 conversions, ~21.7 s average, ~823 MB peak** come from the experimental ReviewLink project and were **not reproduced in this audit**. They are treated as **[ASSUMPTION]** and must be re-measured against this stack before any capacity decision.

**Stability & terms [RECOMMENDATION]:** reading `maps.app.goo.gl` through a headless browser depends on Google's internal Maps UI, which changes without notice, and may conflict with Google Maps/Google Search terms. This is an inherent fragility of the whole approach, independent of where it runs. Where possible, prefer the **official Places API** path over scraping.

---

## 9. Security Findings

| # | Finding | Severity | Evidence | Notes |
|---|---|---|---|---|
| S1 | **SSRF surface via `inspectURL`** — server fetches admin-supplied URLs | **Low–Medium** | `activate/route.ts` GET | Mitigated: HTTPS-only, strict `GOOGLE_HOSTS` allow-list re-checked **on every hop**, ≤6 hops, 3.5 s timeout, `redirect:'manual'`. Redirect hops validated before following. Remaining risk is low. |
| S2 | **Redirect destination not re-validated at read time** — `/c/[code]` redirects to stored `review_url` without re-checking the policy | **Low** | `src/app/c/[code]/page.tsx:10` | Validation happens only on write. A tampered/legacy/modified row could redirect off-Google. Recommend re-validating at redirect time (defense in depth). |
| S3 | **Open redirect** | **Low** | same as S2 | Constrained by `validReviewURL` at activation; reactivation nulls the URL. Not a general open redirect today. |
| S4 | **Auth/authorization gaps** | **None found** | `src/lib/auth.ts`, `src/lib/http.ts` | All admin routes `requireAdmin()`; state-changing routes enforce `sameOrigin()`; sessions httpOnly + sameSite=strict. |
| S5 | **Race condition on activation** | **None found** | `activate/route.ts` | `SELECT ... FOR UPDATE` + conditional `UPDATE ... WHERE active=0` + affected-rows check. Correct. |
| S6 | **Unrestricted activation** | **Low** | `activate/route.ts` | Rate-limited 12/15 min; requires a one-time code; scrypt-verified. |
| S7 | **Sensitive data exposure** | **None found** | `.gitignore`, `server-only` | `.env` not tracked; secrets server-side; no `NEXT_PUBLIC_` DB/Google keys. |
| S8 | **Missing timeouts on outbound calls** | **None** | `activate/route.ts` | Places call has 7 s; inspect call 3.5 s/hop. Good. |
| S9 | **DB pool starvation under slow handlers** | **Medium (future)** | `src/lib/db.ts` (pool = 5) | A 21.7 s synchronous `POST /api/activate` holds a DB transaction/connection while Playwright runs → easily exhausts the pool. Reinforces async/isolated design. |
| S10 | **Browser-automation resource exhaustion** | **Medium (future)** | n/a today | No concurrency cap or memory guard exists; a resolver must add per-request timeout, max concurrent contexts, and a kill switch. |
| S11 | **Outbound DNS / allow-list by hostname literal** | **Low** | `activate/route.ts` | Host checks are literal strings; `google.com` is broad but the redirect loop re-validates each hop. Acceptable. |

**Effect on the proposal:** the *existing* code is disciplined (allow-lists, CSRF, rate limits, locking). The **new** risks are almost entirely about **resource exhaustion (S9, S10)** and **Google-terms/brittleness**, not classic injection — which the isolated-worker design directly addresses.

---

## 10. Existing Card Compatibility Risks

| Risk | Severity | Evidence | Mitigation |
|---|---|---|---|
| Existing active cards hold Maps share/place URLs → wrong destination | **High** | `activate/route.ts` stores verbatim; `legacy-v1/server.js` `DEMO_REVIEWS` uses those shapes | Backfill job to re-resolve + update `review_url`; requires admin review of the resolved target |
| **No edit endpoint** → can’t fix a card without losing its code | **Medium** | `reactivate/route.ts` nulls `review_url` | Add a safe "update destination" flow that re-resolves without forcing full reactivation |
| **Direct-written NFC tags bypass the app** | **Medium** | `activation-form.tsx` `writeDirectLink()` writes the raw URL to the tag | New conversion can’t retroactively fix physical tags; those need re-tagging. Document clearly. |
| Physical tags copied from `?src=nfc` URLs | **Low** | `admin/nfc/register/route.ts`, `generate/route.ts` | Unaffected — app-controlled redirect keeps working regardless of stored URL correctness |
| Re-pointing a card clears `activated_at` analytics continuity | **Low** | `reactivate/route.ts` | Prefer an in-place destination update over reactivation |
| Demo seed data uses fake/short links | **Low** | `demo/seed/route.ts` | Unaffected; demo mode redirects to `/demo-review` |

**Guiding constraint confirmed:** activation is a **one-way, code-consuming** operation today. Any conversion feature must **not** disturb already-active cards and must offer a **non-destructive** way to fix their destinations.

---

## 11. Recommended Integration Architecture

**[RECOMMENDATION] – Option B: isolated, asynchronous resolver, invoked at activation/configuration time only.**

```
Admin enters Google Maps URL
        │
        ▼
Next.js API  ──(enqueue / POST, allow-list check)──►  Resolver service (Node + Playwright)
        │                                                    │
        │  1. resolve shortlink (maps.app.goo.gl)            │  headless Chromium, 1 context/job
        │  2. read the REAL Place ID from Maps traffic       │  hard timeout, memory cap, concurrency 1–2
        │  3. verify place (name/address) vs. input          │  strict outbound allow-list
        │  4. build https://search.google.com/local/writereview?placeid=…  │
        ▼                                                    │
Store: review_url + place_id + source_url + resolved status ◄──┘  (never fabricate a Place ID)
        │
        ▼
Customer taps NFC → /c/[code] fast 302 → verified writereview URL   (NO browser at tap time)
```

**Design rules**

1. **Never run Playwright on the tap path or inside `POST /api/activate`.** Resolve asynchronously; the admin UI polls, or the card stays "pending" until resolved.
2. **Isolated service** (separate container/process) with its own memory limit, browser binaries, and outbound allow-list.
3. **Strict Place ID sourcing:** accept only a Place ID obtained from Google's own Maps traffic or the Places API. **Never synthesize.**
4. **Verification step [RECOMMENDATION]:** before storing, confirm the resolved place matches the input (name/address) and surface it to the admin for confirmation in the UI.
5. **Prefer the official API when available.** If `GOOGLE_MAPS_API_KEY` is set, use Places API to confirm/obtain the Place ID and fall back to Playwright only when the API cannot match. This reduces brittleness and terms exposure.
6. **Concurrency + timeout + memory caps**, plus a global kill switch, in the resolver.
7. **Persist provenance** (new nullable columns) and **re-validate the stored URL at redirect time** (closes S2).
8. **Cache** successful resolutions (source URL → Place ID) to avoid repeat browser runs.

**Alternative considered and rejected:** doing this purely with the Places API (no Playwright). It is **lower risk and preferred where it works**, but it cannot reliably turn an arbitrary `maps.app.goo.gl` share link into a Place ID without first resolving the link — which is exactly where a browser (or the Google shortlink→place redirect) is needed. The two should be combined, not either/or.

---

## 12. Proposed Implementation Phases

**[RECOMMENDATION]** — for the future implementation phase; none of this is executed now.

- **Phase 0 – Approval & guardrails.** Confirm hosting target is a container/VPS (not a locked serverless platform). Add a rollback plan and feature flag.
- **Phase 1 – Schema (additive only).** Add nullable `place_id`, `source_url`, `resolution_status`, `resolved_at` to `cards` (or a `card_resolutions` table). No changes to existing columns; no data rewrite.
- **Phase 2 – Resolver service.** Standalone Node + Playwright image with strict allow-list, timeout, memory cap, concurrency 1–2. Re-measure time/memory against **this** stack.
- **Phase 3 – App integration.** New admin-only endpoint to request resolution; extend `GET /api/activate?inspectURL=` to return a **verified** Place ID + review URL. Keep `POST /api/activate` fast by storing a resolved value, not resolving inline.
- **Phase 4 – UI.** Show resolved business name/address and the exact `writereview` URL for admin confirmation before saving. Handle "inconclusive" gracefully.
- **Phase 5 – Non-destructive destination update.** Update a card's URL without full reactivation (protects existing cards, fixes §10).
- **Phase 6 – Backfill (opt-in).** Batch re-resolve existing cards with per-card admin approval; never auto-overwrite silently.
- **Phase 7 – Observability & limits.** Metrics, alerts, kill switch, and load/soak tests.

**Explicit non-goals:** no conversion at tap time; no fabrication of Place IDs; no change to the activation-code security model; no coupling of the resolver to the public redirect route.

---

## 13. Required Environment Variables

Current (unchanged) **[VERIFIED]** — from `.env.example` / `scripts/check-production-env.js`: `NODE_ENV`, `PORT`, `BASE_URL`, `DATABASE_URL`, `PG_POOL_SIZE`, `SESSION_SECRET`, `ACTIVATION_CODE_ENCRYPTION_KEY`, `DEMO_MODE`, `TRUST_PROXY`, `REPIW_TEST_DATABASE_URL`, and optional `MYSQL_*` (importer only).

For the proposed resolver **[RECOMMENDATION]** (names are proposals, not implemented):

| Variable | Purpose | Notes |
|---|---|---|
| `RESOLVER_BASE_URL` | App → resolver address | Internal only; never exposed to the browser |
| `RESOLVER_SHARED_SECRET` | Auth between app and resolver | 32+ random bytes; keep server-side |
| `PLAYWRIGHT_BROWSER_PATH` | Chromium/Chrome executable | Optional if bundled |
| `RESOLVER_TIMEOUT_MS` | Hard per-job timeout | e.g. 45000; must exceed p99 |
| `RESOLVER_MAX_CONCURRENCY` | Concurrent browser contexts | Start at 1–2 |
| `RESOLVER_MAX_MEMORY_MB` | Memory guard | Align with container limit |
| `GOOGLE_MAPS_API_KEY` | **Already exists**; preferred confirmation path | Optional fallback to Playwright |

**No new Google API key is strictly required for scraping**, but using the Places API where possible is recommended for reliability and terms compliance. **Do not** prefix any of these with `NEXT_PUBLIC_`.

---

## 14. Deployment Considerations

**[VERIFIED] facts**

- Generic `next start` deployment; no serverless manifest, no Dockerfile, no process manager config.
- `npm start` runs `prestart` → `scripts/check-production-env.js`, which enforces `DEMO_MODE=false`, HTTPS `BASE_URL`, 32-byte `SESSION_SECRET`, Postgres `DATABASE_URL` with `sslmode=require|verify-full`, and `TRUST_PROXY=true`.
- DB pool default 5 (`PG_POOL_SIZE`).
- No `maxDuration`; no observed proxy timeout configuration.

**[RECOMMENDATION]**

1. **Hosting:** confirm the target can run a long-lived, memory-heavy process and store browser binaries. If the host is serverless, this design must change (e.g., a separate always-on render service) — treat as a precondition.
2. **Isolation:** deploy the resolver as its **own** service/container; do not co-locate browser runs with the Next.js process on a small instance.
3. **Resources:** budget for the measured peak (reference ~823 MB/job, **[ASSUMPTION]**) plus Chromium overhead; cap concurrency to 1–2 until real numbers are measured.
4. **Timeouts:** set an explicit job timeout below any gateway timeout; keep `POST /api/activate` short by resolving asynchronously.
5. **Networking:** resolver needs outbound HTTPS to `*.google.com` / `*.goo.gl` only; block everything else.
6. **Operations:** health/readiness endpoint, structured logs (no secrets), a kill switch, and a rollback that simply disables the resolver (cards fall back to their stored value).
7. **Compatibility:** ship **additive** migrations only; keep the tap-time redirect path untouched so live cards never break during rollout.

---

## 15. GO / CONDITIONAL GO / NO-GO Verdict

### **Verdict: CONDITIONAL GO** 🟡

**Go** for a **Phase 2 implementation of an isolated, asynchronous Playwright resolver** that produces verified Google Place IDs and `writereview` URLs, run **only at activation/configuration time**.

**Conditions (all must hold):**

1. **Not inline.** Playwright must not run inside `POST /api/activate` or on the `/c/[code]` tap path. Async + isolated only.
2. **Never fabricate a Place ID.** Only Google-derived IDs (Maps traffic or Places API). A verification/confirmation step is required.
3. **Compatibility first.** Additive schema only; no change to the redirect path; provide a **non-destructive** way to fix existing cards; never auto-overwrite silently.
4. **Resource guardrails.** Per-job timeout, memory cap, concurrency 1–2, and a kill switch, sized against **re-measured** numbers for this stack (the 21.7 s / 823 MB figures are unverified here).
5. **Prefer the official API.** Use Places API where it can obtain/confirm the Place ID; keep Playwright as fallback.
6. **Accept the inherent fragility.** Headless Maps reading depends on undocumented internals and may conflict with Google's terms; this risk is inherent and must be accepted explicitly.

**Why not a full "GO":** the resource profile of a browser resolve is fundamentally incompatible with the current synchronous, single-process, no-worker architecture; the safety of doing it inline is low.

**Why not "NO-GO":** the technical foundations are sound (Node 24, nodejs runtime, generic container hosting, existing allow-listing/rate-limiting discipline), and the isolated-service design is a well-scoped, low-blast-radius way to fix the confirmed root cause.

---

## Appendix A — Verified vs. Unverified

**Verified in this audit (from source/config):** stack and versions; PostgreSQL schema and all columns; every API route and its auth; NFC/activation lifecycle; the exact URL allow-list and validation logic; the absence of any conversion/Place-ID extraction; the absence of workers/queues; the absence of deployment manifests; the presence of Playwright only as a dev dependency; SSRF/CSRF/rate-limit/transaction handling.

**Not verified (would require running code / live services):** actual runtime behavior against a live Supabase database; whether Google blocks the `inspectURL` fetch in production; any Playwright timing/memory on this stack; proxy/timeout behavior of the real host; reproduction of the experimental project's 5/5, 21.7 s, 823 MB figures.

**Not performed (out of scope for a read-only audit):** installing Playwright, running it, changing the database, editing source, or deploying.

## Appendix B — Key Source References

| Concern | File |
|---|---|
| URL validation policy | `src/lib/validation.ts` |
| Activation + inspect + Places search | `src/app/api/activate/route.ts` |
| Card redirect (tap path) | `src/app/c/[code]/page.tsx` |
| DB pool / transactions / code gen | `src/lib/db.ts` |
| Rate limit / CSRF helpers | `src/lib/http.ts` |
| Session auth | `src/lib/auth.ts` |
| Activation-code crypto | `src/lib/security.ts` |
| Schema & migrations | `scripts/migrate-postgres.js` |
| Post-activation direct NFC write | `src/components/activation-form.tsx` |
| Reactivation (clears destination) | `src/app/api/admin/cards/[code]/reactivate/route.ts` |
| Framework/build config | `next.config.ts`, `package.json` |
| Deployment env checks | `scripts/check-production-env.js` |
| Legacy (reference only) | `legacy-v1/server.js` |

---

*End of audit. No application source code, database records, dependencies, environment variables, or deployment configuration were modified. Awaiting explicit approval before any implementation phase.*
