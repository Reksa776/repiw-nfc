# Phase 2A — Isolated Playwright Resolver

| | |
|---|---|
| **Document** | `docs/NFC-PHASE-2A-RESOLVER.md` |
| **Status** | Implemented and verified (unit + live) |
| **Date** | 2026-10-16 |
| **Phase status field for the roadmap** | `2A — COMPLETE` |
| **Baseline** | `docs/NFC-GOOGLE-REVIEW-PLAYWRIGHT-AUDIT.md` (unchanged, preserved) |

> Implementation note on provenance: this repository has **no git metadata** on the host used for
> this work (`git status`/`git log` fail: *not a git repository*), so no diff against a previous
> commit could be produced. The resolver modules listed below were already present in the working
> tree when this phase started; every item in this phase was **read, exercised and verified** here,
> and the gaps found were fixed (see `NFC-PHASE-2F-VERIFICATION.md` for the exact changes made).

---

## 1. What Phase 2A requires, and where it lives

The resolver is a **server-only module**, completely separate from the NFC redirect (tap) path.

| File | Role |
|---|---|
| `src/lib/resolver/index.ts` | Orchestrator: `resolveGoogleReviewUrl()` + HTTP shortlink expansion |
| `src/lib/resolver/browser.ts` | Headless Chromium launch, one isolated context per resolution, guaranteed cleanup |
| `src/lib/resolver/url-policy.ts` | Strict Google host allow-list, URL classification, Place-ID-from-review-URL |
| `src/lib/resolver/extract.ts` | Place-ID extraction/validation + business identity extraction (pure) |
| `src/lib/resolver/places.ts` | Google Places API (New) confirmation/enrichment (optional) |
| `src/lib/resolver/config.ts` | Environment configuration + kill switch |
| `src/lib/resolver/types.ts` | Structured result/error types |
| `src/lib/resolver/jobs.ts` | Durable job store (SQL only; Phase 2B) |
| `src/lib/resolver/pg-store.ts` | `pg` adapter for the worker/scripts |
| `src/lib/resolver/server-store.ts` | Next.js adapter (`server-only`) for the job store |
| `scripts/resolver-probe.ts` | Live measurement tool (duration, memory, leftover processes) |
| `scripts/resolver-worker.ts` | Standalone worker process (Phase 2B) |

Nothing in `src/app/c/[code]/page.tsx` (the tap path) imports the resolver. The tap path remains a
database read plus a `redirect()`.

## 2. Resolution strategy (implemented)

1. **Validate** — HTTPS only, no credentials, port 443, host on the Google allow-list. Non-Google or
   look-alike hosts are rejected with `host_not_allowed` / `not_https` / `invalid_url`.
2. **Recognize an official review URL** — `https://search.google.com/local/writereview?placeid=…`
   resolves immediately with `method: 'passthrough'` and no network work at all.
3. **Resolve supported Google Maps shortlinks** — `maps.app.goo.gl`, `goo.gl/maps…`, and legacy
   `g.page/r/.../review` links are first expanded over plain HTTP with **manual redirect handling**
   (max 6 hops, 4 s per hop, every hop re-validated against the allow-list).
4. **Navigate to the Maps location** — when the HTTP fast path does not yield a Place ID (the usual
   case: a `maps.app.goo.gl` share link redirects to a `/maps/place/...` URL that contains only a
   **Feature ID** such as `1s0x…:0x…`, never a Place ID), headless Chromium opens the resolved URL.
5. **Identify the genuine Place ID from Google-provided data** — the browser collects candidate
   Place IDs only from Google's own traffic:
   - request URLs (`place_id=`/`query_place_id=` parameters),
   - response bodies of Google's `maps/preview/place` / `maps/rpc` payloads and review-flow
     responses (`"place_id":"ChIJ…"`, `placeid=ChIJ…`, `ChIJ…` literals),
   - the final document URL/HTML.
   A bounded number (`MAX_BODY_READS = 40`, ≤3 MB per body) of interesting responses is inspected.
6. **Verify the Place ID corresponds to the resolved location** — `isPlausiblePlaceId()` rejects
   numeric CIDs, `0x…:0x…` Feature IDs and short tokens; when `GOOGLE_MAPS_API_KEY` is configured,
   the candidate is additionally confirmed with Places API (New) by exact `id` match, and an
   unconfirmable id is downgraded to `inconclusive` (`identity_mismatch`) rather than trusted.
7. **Capture the resolved business name and address** — from the live Maps panel, the document
   `<title>`/meta (generic values such as "Google Maps" are discarded) and the
   `maps/preview/place` address payload.
8. **Generate the direct review URL** — `https://search.google.com/local/writereview?placeid=<id>`
   via `buildReviewUrl()`, which refuses implausible ids.
9. **Return structured results** — `ResolveResult` with `status` (`success` | `inconclusive` |
   `failed`), `method` (`passthrough` | `http` | `places-api` | `playwright` | `playwright+places`),
   `inputUrl`, `resolvedUrl`, `placeId`, `reviewUrl`, `businessName`, `businessAddress`,
   `errorCode`, `errorMessage`, `durationMs`, `usedBrowser`.

**Why this shortlink needs the browser (measured, not assumed):** the HTTP fast path expands
`https://maps.app.goo.gl/HihE1JQdDmzBDCVC8` to
`https://www.google.com/maps/place/…!1s0x2e6f1dfa0caae141:0x3b66fb4b842e1140!…`, which contains
only a Feature ID. No Place ID can be derived from it, and the resolver **never** substitutes one.
The browser path then produced the genuine Place ID `ChIJQeGqDPodby4RQBEuhEv7Zjs` for that
location (see §6).

## 3. Isolation, resource limits and cleanup

- **Server-only.** The module imports Node builtins and dynamically imports Playwright
  (`playwright-core`, then `playwright`) with `webpackIgnore` so the driver never reaches the client
  bundle. `next.config.ts` lists `playwright`/`playwright-core` in `serverExternalPackages`.
- **One isolated browser context per resolution**, closed in a `finally` block: `page.close()` →
  `context.close()` → `browser.close()`, each wrapped so a failure cannot skip the rest.
  Verified: after a completed live resolution, the number of Chromium processes launched for the job
  returns to zero (probe + e2e assertions; see Phase 2F §4).
- **Concurrency default 1** (`RESOLVER_MAX_CONCURRENCY`, clamped 1–4) plus an in-process concurrency
  guard in `resolveGoogleReviewUrl` as belt-and-braces alongside the worker's DB claim.
- **Configurable hard timeout** (`RESOLVER_TIMEOUT_MS`, default 45 000 ms, clamped 5 000–180 000).
  The deadline covers navigation, the candidate wait and the review-flow reveal attempt.
- **Controlled memory** — Chromium is launched with `--disable-dev-shm-usage`, `--disable-gpu`,
  `--disable-background-networking`, `--no-first-run`, a fixed viewport and a single page; response
  bodies are capped. Measured peak is reported honestly in Phase 2F §4 (it is **higher** than the
  audit's 823 MB reference on this host).
- **No CAPTCHA bypass, stealth, proxy rotation or fabricated success.** A consent/sorry/captcha
  interception or an "unusual traffic" page is reported as `google_blocked` and stops the attempt.

## 4. Security controls

| Control | Implementation |
|---|---|
| SSRF protection | HTTPS-only, no credentials, port 443 only, host must match an anchored Google-domain regex or an explicit allow-list (`maps.app.goo.gl`, `goo.gl`, `g.page`, `maps.google.com`, `www.google.com`, `google.com`, `search.google.com`, `maps.googleapis.com`, `places.googleapis.com`). `google.com.attacker.example`, `notgoogle.com` and non-Google hosts are rejected. |
| Redirect-hop validation | Shortlink expansion uses `redirect: 'manual'` and re-validates **every** hop before following it (`expandShortlink`). |
| Outbound restriction | Only Google endpoints are contacted (Maps pages, `places.googleapis.com`, and Google's own redirect chain). |
| No internal endpoint exposure | The resolver is not an HTTP service. There is no public "run the resolver" endpoint; `/api/resolve` only **enqueues** a job (Phase 2B). |
| Server-to-server auth | Not required: the resolver runs in-process inside the trusted worker (`scripts/resolver-worker.ts`) that authenticates to PostgreSQL with `DATABASE_URL`. No shared-secret HTTP hop exists to secure. |
| Structured errors | `ResolveErrorCode` (`disabled`, `invalid_url`, `host_not_allowed`, `not_https`, `unsupported_url`, `google_blocked`, `no_place_id`, `identity_mismatch`, `timeout`, `browser_unavailable`, `internal_error`). Raw stack traces never leave the resolver. |

## 5. Feature flag and configuration

```
PLAYWRIGHT_RESOLVER_ENABLED=0     # default: DISABLED. 1/true enables. Also the global kill switch.
RESOLVER_TIMEOUT_MS=45000         # 5000–180000
RESOLVER_MAX_CONCURRENCY=1        # 1–4
RESOLVER_HEADLESS=true
PLAYWRIGHT_BROWSER_PATH=          # optional explicit Chromium path (CHROME_BIN also honoured)
RESOLVER_POLL_MS=2000             # worker idle poll interval (Phase 2B)
GOOGLE_MAPS_API_KEY=              # optional: official confirmation/enrichment path
```

Documented in `.env.example`. The default is **disabled**: with the flag off, `POST /api/resolve`
answers `503`, the worker refuses to start, and the backfill script refuses to run.

## 6. Verification and live results

Commands (all run from the project root):

```
npx tsc --noEmit                      # exit 0
npm test                              # 26 tests, 3 files, all passing (includes 15 resolver tests)
PLAYWRIGHT_RESOLVER_ENABLED=1 npx tsx scripts/resolver-probe.ts https://maps.app.goo.gl/HihE1JQdDmzBDCVC8
```

Live probe result (real network, real Chromium, this host — Fedora, Node v24.21.0):

```json
{ "status": "success", "method": "playwright",
  "placeId": "ChIJQeGqDPodby4RQBEuhEv7Zjs",
  "reviewUrl": "https://search.google.com/local/writereview?placeid=ChIJQeGqDPodby4RQBEuhEv7Zjs",
  "businessName": "Universitas Islam Negeri Siber Syekh Nurjati Cirebon (UINSSC)",
  "businessAddress": "Jl. Perjuangan, Sunyaragi, Kec. Kesambi, Kota Cirebon, Jawa Barat 45132",
  "durationMs": 8759, "nodeRssDeltaMB": "65.5", "peakBrowserRssMB": "1552.2",
  "browserRssAfterMB": "0.0", "leftOverBrowserProcesses": false }
```

The probe is a **live** tool and is deliberately not part of the automated suite. The automated
suites never hardcode this Place ID; the gated live e2e test asserts the *shape* and origin of
whatever Google returns (Phase 2F §3).

## 7. Chromium installation (host-specific, not Ubuntu-assumed)

The resolver uses an explicit executable when one is configured, and otherwise auto-detects in this
order: `/usr/bin/google-chrome`, `/usr/bin/google-chrome-stable`, `/usr/bin/chromium`,
`/usr/bin/chromium-browser`, `/snap/bin/chromium`. Playwright's own managed download
(`npx playwright install chromium`) is also honoured when those are absent.

Fedora / RHEL family (used here; Fedora has **no** `chromium` apt package):

```bash
sudo dnf install -y google-chrome-stable        # or: sudo dnf install -y chromium
# or a Playwright-managed browser:
npx playwright install --with-deps chromium
export PLAYWRIGHT_BROWSER_PATH=/usr/bin/google-chrome-stable   # optional override
```

Debian / Ubuntu:

```bash
sudo apt-get install -y google-chrome-stable    # or: sudo apt-get install -y chromium
npx playwright install --with-deps chromium
```

Containers: install the browser in the image and set `PLAYWRIGHT_BROWSER_PATH`, or bake
`npx playwright install --with-deps chromium` into the worker image. Launch flags already include
`--no-sandbox` and `--disable-dev-shm-usage` for restricted environments.

## 8. Known limitations of Phase 2A

1. **The Maps fallback depends on undocumented Google internals.** Response shapes change without
   notice; extraction is best-effort and returns `inconclusive` rather than guessing.
2. **Google Places API confirmation is implemented but unverified** — no `GOOGLE_MAPS_API_KEY` is
   configured in this environment, so the `places-api` / `playwright+places` paths were **not**
   exercised. They are covered by design review only, and are reported as unexercised in Phase 2F.
3. **Terms/anti-automation risk is inherent**, as the audit states. No bypass technique is used, so
   an interstitial legitimately degrades resolution to `inconclusive`.
4. **Peak browser memory is high** (measured 1.55 GB on this host). Concurrency must stay at 1 until
   measured on the target host — see Phase 2F §4 and §7.
5. Feature IDs and CIDs are intentionally **not** converted; a link that only exposes them stays
   `inconclusive`.
