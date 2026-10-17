(()=>{"use strict";module.exports = [
"[project]/src/components/activation-form.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ActivationForm",
    ()=>ActivationForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/i18n.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$client$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resolver/client-state.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
const TERMINAL_FAILURES = [
    'inconclusive',
    'failed',
    'timeout',
    'unavailable',
    'worker_unavailable',
    'expired',
    'rate_limited'
];
const MANUAL_FALLBACK_PHASES = [
    'disabled',
    'unavailable',
    'worker_unavailable',
    'expired',
    'rate_limited'
];
function sleep(ms) {
    return new Promise((resolve)=>window.setTimeout(resolve, ms));
}
function ActivationForm({ code, source }) {
    const { language, t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLanguage"])();
    const id = language === 'id';
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false), [writing, setWriting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false), [inspectBusy, setInspectBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(''), [done, setDone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false), [reviewTarget, setReviewTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(''), [writeMessage, setWriteMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [reviewInput, setReviewInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(''), [inspection, setInspection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null), [inspectError, setInspectError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [businesses, setBusinesses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [resolution, setResolution] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [verifiedUrl, setVerifiedUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(''), [verifiedToken, setVerifiedToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Identifies the current resolution attempt. Bumping it (start/retry/cancel) makes every older,
    // still-running poll loop exit, so no stale loop can ever overwrite the state again.
    const runRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    function resetVerification() {
        runRef.current += 1;
        setInspection(null);
        setInspectError('');
        setBusinesses([]);
        setResolution(null);
        setVerifiedUrl('');
        setVerifiedToken(null);
    }
    function cancelResolution() {
        runRef.current += 1;
        setResolution(null);
        setInspectBusy(false);
        setInspectError('');
    }
    async function submit(e) {
        e.preventDefault();
        if (!verifiedUrl) {
            setError(id ? 'Selesaikan tautan Google Review dulu.' : 'Resolve a Google Review link first.');
            return;
        }
        setBusy(true);
        setError('');
        const data = new FormData(e.currentTarget);
        try {
            const res = await fetch('/api/activate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code,
                    activationCode: data.get('activationCode'),
                    reviewURL: verifiedUrl,
                    resolutionJobToken: verifiedToken || undefined
                })
            });
            const body = await res.json();
            if (!res.ok) throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localizedMessage"])(body.error || t('activationFailed'), language));
            if (typeof body.reviewURL !== 'string' || !body.reviewURL.startsWith('https://')) throw new Error(id ? 'Tautan Google Review tidak valid.' : 'The Google Review URL is invalid.');
            setReviewTarget(body.reviewURL);
            setDone(true);
        } catch (err) {
            setError(err instanceof Error ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localizedMessage"])(err.message, language) : t('unexpectedError'));
        } finally{
            setBusy(false);
        }
    }
    async function searchBusiness(value) {
        // Bounded like every other request in this flow: a stalled Places lookup must not leave the
        // button in "Memproses…" forever.
        const res = await fetch(`/api/activate?businessSearch=${encodeURIComponent(value)}`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$client$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["REQUEST_TIMEOUT_MS"])
        });
        const body = await res.json().catch(()=>({}));
        if (!res.ok) throw new Error(body.error || (id ? 'Bisnis tidak bisa dicari.' : 'Could not search for this business.'));
        setBusinesses(body.places);
        setResolution(null);
    }
    function acceptOfficial(value) {
        setInspection({
            kind: 'review',
            finalURL: value,
            resolved: true
        });
        setVerifiedUrl(value);
        setVerifiedToken(null);
        setResolution(null);
        setBusinesses([]);
    }
    async function inspectLink() {
        const value = reviewInput.trim();
        setInspectBusy(true);
        setInspectError('');
        setInspection(null);
        setBusinesses([]);
        setResolution(null);
        setVerifiedUrl('');
        setVerifiedToken(null);
        try {
            if (!/^https?:\/\//i.test(value)) {
                await searchBusiness(value);
                return;
            }
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$client$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isDirectReviewUrl"])(value)) {
                acceptOfficial(value);
                return;
            }
            // The queue API binds the job to the card only after verifying the one-time code. Check it
            // client-side first, otherwise a missing code surfaces as the misleading "unsupported link"
            // message after a round trip.
            const activationCode = document.querySelector('input[name=activationCode]')?.value.trim() || '';
            if (activationCode.length < 4) {
                setInspectError(t('activationCodeRequired'));
                return;
            }
            await startResolution(value);
        } catch (err) {
            const timedOut = err instanceof DOMException && (err.name === 'TimeoutError' || err.name === 'AbortError');
            setInspectError(timedOut ? t('resolverTimeout') : err instanceof Error ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localizedMessage"])(err.message, language) : t('unexpectedError'));
        } finally{
            setInspectBusy(false);
        }
    }
    async function startResolution(url) {
        const run = ++runRef.current;
        const activationCode = document.querySelector('input[name=activationCode]')?.value || '';
        let res;
        let body;
        try {
            res = await fetch('/api/resolve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url,
                    code,
                    activationCode
                }),
                signal: AbortSignal.timeout(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$client$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["REQUEST_TIMEOUT_MS"])
            });
            body = await res.json().catch(()=>null);
        } catch  {
            if (run === runRef.current) setResolution({
                token: '',
                phase: 'unavailable'
            });
            return;
        }
        if (run !== runRef.current) return;
        // Every non-200 outcome is terminal: disabled, unsupported, rate limited, not migrated,
        // failed. The user gets copy plus the manual-activation fallback instead of a spinner.
        const phase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$client$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["phaseForResolveResponse"])(res.status, body);
        if (phase !== 'resolving') {
            setResolution({
                token: '',
                phase
            });
            if (body?.error && phase !== 'disabled' && phase !== 'rate_limited') setInspectError((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localizedMessage"])(body.error, language));
            return;
        }
        if (!body?.jobToken) {
            setResolution({
                token: '',
                phase: 'unavailable'
            });
            return;
        }
        const startedAt = Date.now();
        setResolution({
            token: body.jobToken,
            phase: 'resolving'
        });
        await pollResolution(body.jobToken, startedAt, run, body.workerAvailable ?? null);
    }
    async function pollResolution(token, startedAt, run, workerAvailable) {
        let consecutiveErrors = 0;
        while(Date.now() - startedAt < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$client$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MAX_POLL_MS"]){
            if (run !== runRef.current) return;
            await sleep(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$client$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["POLL_INTERVAL_MS"]);
            if (run !== runRef.current) return;
            let job;
            try {
                const res = await fetch(`/api/resolve/${encodeURIComponent(token)}`, {
                    cache: 'no-store',
                    signal: AbortSignal.timeout(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$client$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["POLL_REQUEST_TIMEOUT_MS"])
                });
                if (!res.ok) {
                    // A hard server error (e.g. the resolution tables are missing) is terminal, not a reason
                    // to keep polling for two minutes.
                    setResolution({
                        token,
                        phase: res.status === 503 ? 'unavailable' : 'failed'
                    });
                    return;
                }
                job = await res.json();
            } catch  {
                // A single timed-out or dropped poll is retried; three in a row end the attempt.
                consecutiveErrors += 1;
                if (run !== runRef.current) return;
                if (consecutiveErrors >= 3) {
                    setResolution({
                        token,
                        phase: 'unavailable'
                    });
                    return;
                }
                continue;
            }
            consecutiveErrors = 0;
            const phase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$client$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["phaseForJob"])({
                ...job,
                workerAvailable: job.workerAvailable ?? workerAvailable
            }, {
                elapsedMs: Date.now() - startedAt,
                consecutiveErrors
            });
            if (phase === 'resolving') continue;
            if (run !== runRef.current) return;
            if (phase === 'success') {
                setResolution({
                    token,
                    phase,
                    placeId: job.placeId,
                    reviewUrl: job.reviewUrl,
                    businessName: job.businessName,
                    businessAddress: job.businessAddress
                });
            } else {
                setResolution({
                    token,
                    phase
                });
            }
            return;
        }
        if (run === runRef.current) setResolution({
            token,
            phase: 'timeout'
        });
    }
    function confirmResolved() {
        if (!resolution?.reviewUrl || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$client$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isDirectReviewUrl"])(resolution.reviewUrl)) return;
        setVerifiedUrl(resolution.reviewUrl);
        setVerifiedToken(resolution.token);
        setReviewInput(resolution.reviewUrl);
    }
    async function writeDirectLink() {
        if (!reviewTarget) return;
        setWriting(true);
        setWriteMessage('');
        try {
            if (!('NDEFReader' in window)) {
                setWriteMessage(id ? 'Browser ini tidak mendukung penulisan NFC. Salin tautan di bawah dan tulis sebagai record URL memakai aplikasi penulis NFC.' : 'This browser cannot write NFC. Copy the link below and write it as a URL record with an NFC writer app.');
                return;
            }
            const writer = new NDEFReader();
            await writer.write({
                records: [
                    {
                        recordType: 'url',
                        data: reviewTarget
                    }
                ]
            }, {
                overwrite: true
            });
            setWriteMessage(id ? 'Tag NFC berhasil diubah. Tap berikutnya akan membuka Google Review langsung.' : 'NFC tag updated. The next tap will open Google Review directly.');
            window.location.assign(reviewTarget);
        } catch (err) {
            setWriteMessage(`${id ? 'Gagal menulis tag. Pastikan NFC aktif, gunakan HTTPS dan tag masih bisa ditulis.' : 'Could not write the tag. Make sure NFC is enabled, use HTTPS, and the tag is writable.'} ${err instanceof Error ? err.message : ''}`);
        } finally{
            setWriting(false);
        }
    }
    async function copyReviewLink() {
        try {
            await navigator.clipboard.writeText(reviewTarget);
            setWriteMessage(id ? 'Link disalin. Tempelkan sebagai record URL di aplikasi NFC writer.' : 'Link copied. Paste it as a URL record in an NFC writer app.');
        } catch  {
            setWriteMessage(id ? 'Gagal menyalin. Tekan lama link lalu pilih Salin.' : 'Copy failed. Long-press the link and choose Copy.');
        }
    }
    const resolutionMessage = {
        resolving: t('resolvingLink'),
        success: t('verifiedReady'),
        inconclusive: t('resolverInconclusive'),
        failed: t('resolverFailed'),
        disabled: t('resolverDisabled'),
        unsupported: t('resolverUnsupported'),
        timeout: t('resolverTimeout'),
        unavailable: t('resolverUnavailable'),
        worker_unavailable: t('resolverWorkerUnavailable'),
        expired: t('resolverExpired'),
        rate_limited: t('resolverRateLimited')
    };
    const resultText = inspection && (inspection.kind === 'review' ? id ? 'Tautan ini tampak menuju formulir penulisan ulasan Google.' : 'This appears to be a Google review-writing link.' : inspection.kind === 'maps-place' ? id ? 'Tautan ini tampak menuju lokasi atau profil di Google Maps. Belum tentu langsung ke formulir ulasan.' : 'This appears to lead to a Google Maps place or profile, not necessarily the review form.' : inspection.kind === 'maps-short' ? id ? 'Ini tautan pendek Google Maps. Tujuan akhirnya belum berhasil dibaca oleh server.' : 'This is a Google Maps short link. The server could not confirm its final destination.' : id ? 'Tautan Google terdeteksi, tetapi format formulir ulasan tidak dikenali.' : 'A Google link was detected, but its review-form format was not recognized.');
    const success = t('cardActivated').replace('{code}', code);
    const isUrl = /^https?:\/\//i.test(reviewInput.trim());
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "activation-shell",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "auth-language",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LanguageSwitcher"], {}, void 0, false, {
                    fileName: "[project]/src/components/activation-form.tsx",
                    lineNumber: 229,
                    columnNumber: 76
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/activation-form.tsx",
                lineNumber: 229,
                columnNumber: 45
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "activation-card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "brand-mark",
                        children: "R"
                    }, void 0, false, {
                        fileName: "[project]/src/components/activation-form.tsx",
                        lineNumber: 229,
                        columnNumber: 135
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "eyebrow",
                        children: [
                            t('cardLabel'),
                            " · ",
                            source.toUpperCase()
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/activation-form.tsx",
                        lineNumber: 229,
                        columnNumber: 170
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        children: t('activateCard')
                    }, void 0, false, {
                        fileName: "[project]/src/components/activation-form.tsx",
                        lineNumber: 229,
                        columnNumber: 238
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "muted",
                        children: t('activationInstructions')
                    }, void 0, false, {
                        fileName: "[project]/src/components/activation-form.tsx",
                        lineNumber: 229,
                        columnNumber: 266
                    }, this),
                    done ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "success",
                                role: "status",
                                children: success
                            }, void 0, false, {
                                fileName: "[project]/src/components/activation-form.tsx",
                                lineNumber: 230,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "muted activation-review-note",
                                children: id ? source === 'qr' ? 'Aktivasi lewat QR berhasil. Siapkan kartu NFC, tekan tombol di bawah, lalu tempelkan kartu ke bagian NFC ponsel dan tahan sampai selesai. Link Google Review akan ditulis ke chip.' : 'Tekan tombol di bawah, lalu tempelkan kartu NFC ke bagian NFC ponsel dan tahan sampai link Google Review selesai ditulis ke chip.' : source === 'qr' ? 'QR activation is complete. Get the NFC card ready, press the button below, then hold the card near the phone NFC area until writing finishes. The Google Review link will be saved to the chip.' : 'Press the button below, then hold the NFC card near the phone until the Google Review link has been written to the chip.'
                            }, void 0, false, {
                                fileName: "[project]/src/components/activation-form.tsx",
                                lineNumber: 230,
                                columnNumber: 69
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "button",
                                disabled: writing,
                                onClick: writeDirectLink,
                                children: writing ? id ? 'Menulis NFC…' : 'Writing NFC…' : id ? 'Tulis link Google Review ke chip NFC' : 'Write Google Review link to NFC chip'
                            }, void 0, false, {
                                fileName: "[project]/src/components/activation-form.tsx",
                                lineNumber: 230,
                                columnNumber: 799
                            }, this),
                            writeMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "success",
                                role: "status",
                                children: writeMessage
                            }, void 0, false, {
                                fileName: "[project]/src/components/activation-form.tsx",
                                lineNumber: 230,
                                columnNumber: 1050
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "field-hint",
                                children: [
                                    id ? 'Link tujuan Google Review' : 'Google Review destination',
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        readOnly: true,
                                        value: reviewTarget,
                                        onFocus: (e)=>e.currentTarget.select()
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/activation-form.tsx",
                                        lineNumber: 230,
                                        columnNumber: 1200
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/activation-form.tsx",
                                lineNumber: 230,
                                columnNumber: 1106
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "button button-outline",
                                onClick: copyReviewLink,
                                children: id ? 'Salin link untuk NFC writer' : 'Copy link for NFC writer'
                            }, void 0, false, {
                                fileName: "[project]/src/components/activation-form.tsx",
                                lineNumber: 230,
                                columnNumber: 1287
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                className: "button activation-review-link",
                                href: reviewTarget,
                                children: [
                                    id ? 'Buka Google Review' : 'Open Google Review',
                                    " ↗"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/activation-form.tsx",
                                lineNumber: 230,
                                columnNumber: 1442
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "fine-print",
                                children: id ? 'Di iPhone/Safari, Web NFC tidak tersedia: salin link lalu tulis ke tag memakai aplikasi NFC writer. Tag yang sudah ditulis ulang akan melewati REPIW; tap langsung ke Google dan tidak tercatat di analytics REPIW.' : 'On iPhone/Safari, Web NFC is unavailable: copy the URL and write it with an NFC writer app. A rewritten tag bypasses REPIW, opens Google directly, and will not be counted in REPIW analytics.'
                            }, void 0, false, {
                                fileName: "[project]/src/components/activation-form.tsx",
                                lineNumber: 230,
                                columnNumber: 1563
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/activation-form.tsx",
                        lineNumber: 230,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        onSubmit: submit,
                        className: "form-stack",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    t('cardId'),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: code,
                                        readOnly: true
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/activation-form.tsx",
                                        lineNumber: 231,
                                        columnNumber: 76
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/activation-form.tsx",
                                lineNumber: 231,
                                columnNumber: 56
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    id ? 'Kode aktivasi / sandi kartu' : t('activationCodeLabel'),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        name: "activationCode",
                                        autoComplete: "one-time-code",
                                        autoCapitalize: "characters",
                                        spellCheck: false,
                                        inputMode: "text",
                                        minLength: 4,
                                        maxLength: 12,
                                        required: true,
                                        placeholder: t('codePlaceholder')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/activation-form.tsx",
                                        lineNumber: 231,
                                        columnNumber: 185
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                        className: "field-hint",
                                        children: id ? 'Kode aktivasi baru terdiri dari 4 karakter dan ada di kartu atau CSV dashboard. Kode lama 12 karakter tetap bisa digunakan.' : 'New activation codes have 4 characters and come with the card or dashboard CSV. Previously issued 12-character codes still work.'
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/activation-form.tsx",
                                        lineNumber: 231,
                                        columnNumber: 382
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/activation-form.tsx",
                                lineNumber: 231,
                                columnNumber: 115
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    t('googleReviewUrl'),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        name: "reviewURL",
                                        type: "text",
                                        autoComplete: "url",
                                        required: true,
                                        placeholder: id ? 'Tempel link ulasan/Maps atau ketik nama bisnis' : 'Paste a review/Maps link or type a business name',
                                        value: reviewInput,
                                        onChange: (e)=>{
                                            setReviewInput(e.target.value);
                                            resetVerification();
                                            setError('');
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/activation-form.tsx",
                                        lineNumber: 231,
                                        columnNumber: 722
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                        className: "field-hint",
                                        children: t('pasteOrResolve')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/activation-form.tsx",
                                        lineNumber: 231,
                                        columnNumber: 1016
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/activation-form.tsx",
                                lineNumber: 231,
                                columnNumber: 693
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "button button-outline",
                                onClick: inspectLink,
                                disabled: inspectBusy || reviewInput.trim().length < 2,
                                children: inspectBusy ? id ? 'Memproses…' : 'Working…' : isUrl ? t('resolveMapsLink') : id ? 'Cari bisnis & buat link ulasan' : 'Find business & generate review link'
                            }, void 0, false, {
                                fileName: "[project]/src/components/activation-form.tsx",
                                lineNumber: 231,
                                columnNumber: 1083
                            }, this),
                            businesses.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "form-stack",
                                role: "list",
                                "aria-label": id ? 'Hasil bisnis Google' : 'Google business results',
                                children: businesses.map((place)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "button button-outline",
                                        onClick: ()=>{
                                            setReviewInput(place.reviewURL);
                                            acceptOfficial(place.reviewURL);
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: place.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/activation-form.tsx",
                                                lineNumber: 232,
                                                columnNumber: 323
                                            }, this),
                                            place.address && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                                className: "field-hint",
                                                children: place.address
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/activation-form.tsx",
                                                lineNumber: 232,
                                                columnNumber: 370
                                            }, this)
                                        ]
                                    }, place.id, true, {
                                        fileName: "[project]/src/components/activation-form.tsx",
                                        lineNumber: 232,
                                        columnNumber: 166
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/activation-form.tsx",
                                lineNumber: 232,
                                columnNumber: 33
                            }, this),
                            resolution && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: resolution.phase === 'success' ? 'success' : 'field-hint',
                                role: "status",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: resolutionMessage[resolution.phase]
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/activation-form.tsx",
                                        lineNumber: 233,
                                        columnNumber: 111
                                    }, this),
                                    resolution.phase === 'resolving' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "field-hint",
                                                children: t('resolverProgressHint')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/activation-form.tsx",
                                                lineNumber: 234,
                                                columnNumber: 48
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "button button-outline",
                                                onClick: cancelResolution,
                                                children: t('resolverCancel')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/activation-form.tsx",
                                                lineNumber: 234,
                                                columnNumber: 105
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/activation-form.tsx",
                                        lineNumber: 234,
                                        columnNumber: 46
                                    }, this),
                                    resolution.phase === 'success' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            resolution.businessName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: [
                                                    t('resolvedBusiness'),
                                                    ": ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                        children: resolution.businessName
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/activation-form.tsx",
                                                        lineNumber: 236,
                                                        columnNumber: 67
                                                    }, this),
                                                    resolution.businessAddress ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            " — ",
                                                            resolution.businessAddress
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/activation-form.tsx",
                                                        lineNumber: 236,
                                                        columnNumber: 129
                                                    }, this) : null
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/activation-form.tsx",
                                                lineNumber: 236,
                                                columnNumber: 39
                                            }, this),
                                            resolution.reviewUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: [
                                                    t('resolvedReviewLink'),
                                                    ": ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: resolution.reviewUrl,
                                                        target: "_blank",
                                                        rel: "noreferrer",
                                                        children: resolution.reviewUrl
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/activation-form.tsx",
                                                        lineNumber: 237,
                                                        columnNumber: 66
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/activation-form.tsx",
                                                lineNumber: 237,
                                                columnNumber: 36
                                            }, this),
                                            verifiedUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "success",
                                                role: "status",
                                                children: t('verifiedReady')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/activation-form.tsx",
                                                lineNumber: 238,
                                                columnNumber: 26
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "button",
                                                onClick: confirmResolved,
                                                children: t('confirmLocation')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/activation-form.tsx",
                                                lineNumber: 238,
                                                columnNumber: 90
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/activation-form.tsx",
                                        lineNumber: 235,
                                        columnNumber: 44
                                    }, this),
                                    TERMINAL_FAILURES.includes(resolution.phase) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "button button-outline",
                                        onClick: ()=>{
                                            void inspectLink();
                                        },
                                        children: t('retryResolution')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/activation-form.tsx",
                                        lineNumber: 240,
                                        columnNumber: 58
                                    }, this),
                                    MANUAL_FALLBACK_PHASES.includes(resolution.phase) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "field-hint",
                                        children: t('resolverManualFallback')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/activation-form.tsx",
                                        lineNumber: 241,
                                        columnNumber: 63
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/activation-form.tsx",
                                lineNumber: 233,
                                columnNumber: 22
                            }, this),
                            inspection && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "success",
                                role: "status",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: resultText
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/activation-form.tsx",
                                        lineNumber: 243,
                                        columnNumber: 61
                                    }, this),
                                    inspection.kind === 'review' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            t('officialReviewDetected'),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: inspection.finalURL,
                                                target: "_blank",
                                                rel: "noreferrer",
                                                children: inspection.finalURL
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/activation-form.tsx",
                                                lineNumber: 243,
                                                columnNumber: 156
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/activation-form.tsx",
                                        lineNumber: 243,
                                        columnNumber: 123
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                        children: id ? 'HP akan membuka aplikasi atau browser berdasarkan link dan pengaturan perangkat.' : 'Your phone opens the app or browser based on the link and device settings.'
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/activation-form.tsx",
                                        lineNumber: 243,
                                        columnNumber: 249
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "button button-outline",
                                        onClick: resetVerification,
                                        children: t('changeLink')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/activation-form.tsx",
                                        lineNumber: 243,
                                        columnNumber: 432
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/activation-form.tsx",
                                lineNumber: 243,
                                columnNumber: 22
                            }, this),
                            inspectError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "error",
                                role: "alert",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localizedMessage"])(inspectError, language)
                            }, void 0, false, {
                                fileName: "[project]/src/components/activation-form.tsx",
                                lineNumber: 244,
                                columnNumber: 24
                            }, this),
                            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "error",
                                children: error
                            }, void 0, false, {
                                fileName: "[project]/src/components/activation-form.tsx",
                                lineNumber: 244,
                                columnNumber: 115
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                disabled: busy || !verifiedUrl,
                                children: busy ? t('activating') : t('activate')
                            }, void 0, false, {
                                fileName: "[project]/src/components/activation-form.tsx",
                                lineNumber: 245,
                                columnNumber: 7
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/activation-form.tsx",
                        lineNumber: 231,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "fine-print",
                        children: t('httpsHint')
                    }, void 0, false, {
                        fileName: "[project]/src/components/activation-form.tsx",
                        lineNumber: 246,
                        columnNumber: 5
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/activation-form.tsx",
                lineNumber: 229,
                columnNumber: 102
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/activation-form.tsx",
        lineNumber: 229,
        columnNumber: 10
    }, this);
}
}),
"[project]/src/lib/resolver/client-state.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Client-side state machine for the Google Maps resolution flow.
//
// Pure module: no DOM, no React, no network. The activation form and the admin destination editor
// both use it, and it is unit-tested directly, because the production failure mode this hotfix
// fixes was a UI that could wait forever: the poll loop had no request timeout, no worker-liveness
// signal and no mapping for a job that had silently expired.
//
// Every failure maps to one explicit terminal phase, so the UI always leaves "Memproses…".
__turbopack_context__.s([
    "MAX_CONSECUTIVE_POLL_ERRORS",
    ()=>MAX_CONSECUTIVE_POLL_ERRORS,
    "MAX_POLL_MS",
    ()=>MAX_POLL_MS,
    "NO_WORKER_GRACE_MS",
    ()=>NO_WORKER_GRACE_MS,
    "POLL_INTERVAL_MS",
    ()=>POLL_INTERVAL_MS,
    "POLL_REQUEST_TIMEOUT_MS",
    ()=>POLL_REQUEST_TIMEOUT_MS,
    "REQUEST_TIMEOUT_MS",
    ()=>REQUEST_TIMEOUT_MS,
    "isDirectReviewUrl",
    ()=>isDirectReviewUrl,
    "isTerminalPhase",
    ()=>isTerminalPhase,
    "phaseForDeadline",
    ()=>phaseForDeadline,
    "phaseForJob",
    ()=>phaseForJob,
    "phaseForResolveResponse",
    ()=>phaseForResolveResponse
]);
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_MS = 120_000;
const REQUEST_TIMEOUT_MS = 15_000;
const POLL_REQUEST_TIMEOUT_MS = 10_000;
const NO_WORKER_GRACE_MS = 5_000;
const MAX_CONSECUTIVE_POLL_ERRORS = 3;
const TERMINAL = new Set([
    'success',
    'inconclusive',
    'failed',
    'disabled',
    'unsupported',
    'timeout',
    'unavailable',
    'worker_unavailable',
    'expired',
    'rate_limited'
]);
function isTerminalPhase(phase) {
    return TERMINAL.has(phase);
}
function isDirectReviewUrl(value) {
    if (!value) return false;
    try {
        const url = new URL(value);
        if (url.protocol !== 'https:' || url.username || url.password) return false;
        if (url.hostname === 'search.google.com') {
            return url.pathname === '/local/writereview' && Boolean(url.searchParams.get('placeid'));
        }
        if (url.hostname === 'g.page') return /^\/r\/[^/]+\/review\/?$/i.test(url.pathname);
    } catch  {
    /* not a URL */ }
    return false;
}
function phaseForResolveResponse(status, body) {
    if (status === 200) return 'resolving';
    const code = body?.code ?? null;
    // Stable codes are authoritative when present, because a proxy may rewrite the status.
    if (code === 'resolver_disabled') return 'disabled';
    if (code === 'resolver_not_migrated') return 'unavailable';
    if (code === 'rate_limited' || status === 429) return 'rate_limited';
    if (code === 'unsupported_url' || status === 400) return 'unsupported';
    if (status === 503) return 'disabled';
    if (status === 404) return 'failed';
    if (status === 401 || status === 403 || status === 409) return 'failed';
    return 'failed';
}
function phaseForJob(job, ctx) {
    if ((ctx.consecutiveErrors ?? 0) >= MAX_CONSECUTIVE_POLL_ERRORS) return 'unavailable';
    if (!job) return 'unavailable';
    switch(job.status){
        case 'success':
            // A "success" without a usable direct review URL must never unlock activation.
            return isDirectReviewUrl(job.reviewUrl) ? 'success' : 'failed';
        case 'inconclusive':
            return 'inconclusive';
        case 'failed':
            return job.errorCode === 'timeout' ? 'timeout' : 'failed';
        case 'expired':
            return 'expired';
        case 'pending':
            {
                if (job.expiresAt) {
                    const expiresAt = Date.parse(job.expiresAt);
                    if (Number.isFinite(expiresAt) && expiresAt <= (ctx.now ?? Date.now())) return 'expired';
                }
                // The API reports `workerAvailable: false` when no worker heartbeat is fresh. After a short
                // grace window (a worker may just be starting) the user is told nothing is consuming the
                // queue instead of waiting out the full client deadline.
                if (job.workerAvailable === false && ctx.elapsedMs >= NO_WORKER_GRACE_MS) return 'worker_unavailable';
                return 'resolving';
            }
        case 'running':
            return 'resolving';
        default:
            return 'unavailable';
    }
}
function phaseForDeadline(elapsedMs) {
    return elapsedMs >= MAX_POLL_MS ? 'timeout' : 'resolving';
}
}),
];})()

//# sourceMappingURL=src_0dkbrn1tvp_pc._.js.map