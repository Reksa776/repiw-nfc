# NFC Auto Phase 2 — Automatic Link Conversion

| | |
|---|---|
| **Date** | 2026-10-17 |
| **Status** | **COMPLETE (local + live)** |
| **Required input** | `https://maps.app.goo.gl/fWWYKH1dN7TCHQ8V9` |
| **Verified output** | `https://search.google.com/local/writereview?placeid=ChIJQeGqDPodby4RQBEuhEv7Zjs` |
| **Business** | Universitas Islam Negeri Siber Syekh Nurjati Cirebon (UINSSC) |

## 1. Accepted inputs

| Input | Behaviour |
|---|---|
| `https://maps.app.goo.gl/…` | Queued for resolution (HTTP expansion, then Chromium if no Place ID) |
| `https://goo.gl/maps/…` | Same as above |
| `https://www.google.com/maps/place/…`, `maps.google.com/…` | Accepted, resolved by browser when no Place ID is present |
| `https://search.google.com/local/writereview?placeid=…` | Accepted immediately as a direct review URL (`passthrough`, no browser) |
| `https://g.page/r/…/review` | Accepted; expanded once and accepted as a legacy review URL |
| Non-Google, look-alike host, `http://`, port ≠ 443, credentials in URL | Rejected before any queue or network work |
| An active card | Rejected by the activation transaction; no silent re-activation |

A raw Maps/share URL is **never** stored as a card destination. Only a verified direct review URL
(or an explicitly pasted official review URL in the manual fallback) can be persisted.

## 2. Verified resolution of the required link

Live probe (real network, real Chromium, separate process from the app):

```json
{
  "status": "success",
  "method": "playwright",
  "placeId": "ChIJQeGqDPodby4RQBEuhEv7Zjs",
  "reviewUrl": "https://search.google.com/local/writereview?placeid=ChIJQeGqDPodby4RQBEuhEv7Zjs",
  "businessName": "Universitas Islam Negeri Siber Syekh Nurjati Cirebon (UINSSC)",
  "businessAddress": "Jl. Perjuangan, Sunyaragi, Kec. Kesambi, Kota Cirebon, Jawa Barat 45132",
  "durationMs": 11475,
  "peakBrowserRssMB": "1337.9",
  "browserRssAfterMB": "0.0",
  "leftOverBrowserProcesses": false
}
```

**Independent confirmation that the Place ID belongs to that business** (not merely a value seen in
traffic): opening `https://www.google.com/maps/place/?q=place_id:ChIJQeGqDPodby4RQBEuhEv7Zjs`
landed on

```
Universitas Islam Negeri Siber Syekh Nurjati Cirebon (UINSSC)
0x2e6f1dfa0caae141:0x3b66fb4b842e1140
```

The same business name and the same Feature ID as the share link's resolved Maps URL. Opening the
generated `/local/writereview?placeid=…` URL redirected to Google Sign-In with
`continue=https://search.google.com/local/writereview?placeid=ChIJ…` (expected: writing a review
requires a signed-in Google account; it proves the review endpoint accepts the id).

## 3. Full path evidence (queue → worker → UI → activation)

The live UI test (`e2e/live-resolver.spec.ts`, `RESOLVER_LIVE=1`) drives the actual form:
paste share link → **Cari Bisnis dan Link Ulasan** → verified business shown → **Ini bisnis yang
benar** → **Aktifkan Kartu**. It passed in 23.1 s.

Database row after that test:

```json
{
  "job": {
    "status": "success",
    "input_url": "https://maps.app.goo.gl/fWWYKH1dN7TCHQ8V9",
    "place_id": "ChIJQeGqDPodby4RQBEuhEv7Zjs",
    "review_url": "https://search.google.com/local/writereview?placeid=ChIJQeGqDPodby4RQBEuhEv7Zjs",
    "business_name": "Universitas Islam Negeri Siber Syekh Nurjati Cirebon (UINSSC)",
    "method": "playwright",
    "attempts": 1
  },
  "card": {
    "active": 1,
    "review_url": "https://search.google.com/local/writereview?placeid=ChIJQeGqDPodby4RQBEuhEv7Zjs",
    "place_id": "ChIJQeGqDPodby4RQBEuhEv7Zjs",
    "resolution_status": "verified",
    "resolution_method": "playwright",
    "resolved_business_name": "Universitas Islam Negeri Siber Syekh Nurjati Cirebon (UINSSC)",
    "source_url": "https://maps.app.goo.gl/fWWYKH1dN7TCHQ8V9"
  }
}
```

## 4. Extraction rules (no fabrication)

- Place IDs are collected only from **Google's own** data: request URLs (`place_id`,
  `query_place_id`), `maps/preview/place` / `maps/rpc` response bodies, review-flow responses, final
  URL and document HTML.
- `isPlausiblePlaceId()` rejects numeric CIDs, `0x…:0x…` Feature IDs, and short tokens.
- `buildReviewUrl()` refuses to build a URL from an implausible id.
- If no genuine id is found, the job is `inconclusive` (`no_place_id`, `google_blocked`, `timeout`,
  `browser_unavailable`). No CID/Feature ID substitution, no guessed id, no fabricated business.
- CAPTCHA/consent/“unusual traffic” pages stop the attempt as `google_blocked`. There is no
  stealth, proxy rotation, or CAPTCHA bypass.

## 5. Result states in the activation UI

| Condition | UI state (Indonesian primary) | Activation possible? |
|---|---|---|
| Resolver kill switch off | “belum aktif di server ini” + manual fallback | Yes, with a direct review URL |
| No worker heartbeat | “worker tidak aktif” after a short grace window | Yes, manual fallback |
| Invalid / non-Google / insecure URL | explicit unsupported message | No |
| Missing activation code | “Masukkan kode aktivasi 4 karakter…” | No |
| Resolving | “Menyelesaikan tautan Google…” + timing hint + Cancel | No |
| Business found | “Bisnis terverifikasi”, name/address, direct link, **Ini bisnis yang benar** | Only after confirmation |
| Inconclusive | “Tidak bisa memverifikasi Place ID asli…” + retry | No (no silent fallback) |
| Expired | “Permintaan resolusi kedaluwarsa…” + retry | No |
| Timeout | “Resolusi memakan waktu terlalu lama…” + retry | No |
| Failed / unavailable | explicit message + retry | No |
| Rate limited | explicit message + manual fallback | Yes, manual |
| Activation success | “Kartu {code} sudah aktif…” | Done |

The client has a 120 s hard deadline, 2 s polling, per-request timeouts, a three-error cutoff, and a
worker-availability short circuit. There is no infinite spinner. Both cancel and retry are present;
cancelling bumps a run id so no stale poll can overwrite newer state.

## 6. Changes made in this phase

| File | Change |
|---|---|
| `src/lib/i18n.tsx` | Indonesian-first Maps guidance; label “Tautan Google Maps atau Google Review”; placeholder `https://maps.app.goo.gl/...`; primary action “Cari Bisnis dan Link Ulasan”; “Aktifkan Kartu”; progress hint; missing-code message |
| `src/components/activation-form.tsx` | Client-side activation-code precheck; visible resolving hint |
| `e2e/live-resolver.spec.ts` | Required share link; new full-UI acceptance test with real worker and confirmation |
| `e2e/resolver.spec.ts` | Asserts the required Indonesian primary actions |

No resolver logic was rewritten; the existing strict extraction and verification were retained.

## 7. Known limitations

1. Extraction depends on Google Maps' undocumented internal payloads; Google can change them.
   The design deliberately degrades to `inconclusive`.
2. Google Places API confirmation remains **optional and unexercised** (no API key in this
   environment). It is not required for the verified path.
3. Automated access to Google Maps carries inherent terms/anti-bot risk. No bypass is used.
4. A login is required by Google to actually submit a review; that is outside this flow.
5. Live results depend on Google's current behaviour and the worker host's network.
