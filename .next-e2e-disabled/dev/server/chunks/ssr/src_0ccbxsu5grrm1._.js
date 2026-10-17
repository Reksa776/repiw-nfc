(()=>{"use strict";module.exports = [
"[project]/src/components/admin-panel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdminPanel",
    ()=>AdminPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/i18n.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$loading$2d$screen$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/loading-screen.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$nfc$2d$programmer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/nfc-programmer.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$destination$2d$editor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/destination-editor.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
const tabs = [
    'overview',
    'cards',
    'analytics',
    'flowPreview',
    'settings'
];
function AdminPanel() {
    const { language, t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLanguage"])();
    const [username, setUsername] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(''), [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(''), [showPassword, setShowPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false), [postLoginLoading, setPostLoginLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false), [logged, setLogged] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false), [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false), [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(''), [stats, setStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null), [cards, setCards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]), [activationCodes, setActivationCodes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({}), [count, setCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(10), [generated, setGenerated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]), [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('overview'), [demo, setDemo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false), [notice, setNotice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(''), [editDestination, setEditDestination] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const refresh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        const [s, c, d, a] = await Promise.all([
            fetch('/api/admin/stats'),
            fetch('/api/admin/cards'),
            fetch('/api/demo/config'),
            fetch('/api/admin/cards/activation-codes')
        ]);
        if (s.status === 401 || c.status === 401) {
            setLogged(false);
            return;
        }
        if (!c.ok) throw new Error(t('dashboardLoadError'));
        setCards(await c.json());
        if (a.ok) setActivationCodes(await a.json());
        else setActivationCodes({});
        if (s.ok) {
            setStats(await s.json());
            setError('');
        } else {
            setStats(null);
            setError(t('dashboardLoadError'));
        }
        if (d.ok) setDemo((await d.json()).demo);
        setLogged(true);
    }, [
        t
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        refresh().catch((e)=>setError(e.message));
    }, [
        refresh
    ]);
    async function login(e) {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            const r = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });
            const x = await r.json();
            if (!r.ok) throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localizedMessage"])(x.error || t('loginFailed'), language));
            setPassword('');
            setUsername('');
            setPostLoginLoading(true);
            await Promise.all([
                refresh(),
                new Promise((resolve)=>window.setTimeout(resolve, 700))
            ]);
        } catch (e) {
            setError(e instanceof Error ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localizedMessage"])(e.message, language) : t('loginFailed'));
        } finally{
            setPostLoginLoading(false);
            setBusy(false);
        }
    }
    async function generate(e) {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            const r = await fetch('/api/admin/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    count
                })
            });
            const x = await r.json();
            if (!r.ok) throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localizedMessage"])(x.error || t('dashboardLoadError'), language));
            setGenerated(x.items);
            setNotice(x.notice);
            setTab('cards');
            await refresh();
        } catch (e) {
            setError(e instanceof Error ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localizedMessage"])(e.message, language) : t('dashboardLoadError'));
        } finally{
            setBusy(false);
        }
    }
    async function reactivateCard(code) {
        const prompt = language === 'id' ? `Aktivasi ulang ${code}? Kartu kembali nonaktif, review lama dilepas, dan kode aktivasi baru diterbitkan.` : `Reactivate ${code}? It returns to inactive, clears the old review URL, and issues a new activation code.`;
        if (!window.confirm(prompt)) return;
        setBusy(true);
        setError('');
        try {
            const r = await fetch(`/api/admin/cards/${code}/reactivate`, {
                method: 'POST'
            }), x = await r.json();
            if (!r.ok) throw new Error(x.error || t('dashboardLoadError'));
            setGenerated([]);
            setActivationCodes((prev)=>({
                    ...prev,
                    [code]: x.activationCode
                }));
            setNotice(language === 'id' ? `Kode baru untuk ${code} tersimpan dan tampil di tabel. Salin/cetak ulang untuk kartu.` : `A new code for ${code} is saved and shown in the table. Copy/reprint it for the card.`);
            await refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : t('dashboardLoadError'));
        } finally{
            setBusy(false);
        }
    }
    async function issueActivationCode(code) {
        const prompt = language === 'id' ? `Buat sandi baru untuk ${code}? Kode lama menjadi tidak berlaku. Jika kode lama sudah dicetak, kartu perlu diberi sandi baru ini.` : `Issue a new code for ${code}? The old code becomes invalid. If it was printed, replace it with this new code.`;
        if (!window.confirm(prompt)) return;
        setBusy(true);
        setError('');
        try {
            const r = await fetch(`/api/admin/cards/${code}/activation-code`, {
                method: 'POST'
            }), x = await r.json();
            if (!r.ok) throw new Error(x.error || t('dashboardLoadError'));
            setActivationCodes((prev)=>({
                    ...prev,
                    [code]: x.activationCode
                }));
            setNotice(language === 'id' ? `Sandi baru untuk ${code} tersimpan dan tampil di kolom kode aktivasi.` : `The new code for ${code} is saved and shown in the activation-code column.`);
            await refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : t('dashboardLoadError'));
        } finally{
            setBusy(false);
        }
    }
    async function deleteCard(code) {
        const prompt = language === 'id' ? `Hapus ${code} dari database? URL QR/NFC kartu akan berhenti berfungsi dan seluruh riwayat kunjungannya ikut dihapus.` : `Delete ${code} from the database? Its QR/NFC URL will stop working and all visit history will be deleted.`;
        if (!window.confirm(prompt)) return;
        setBusy(true);
        setError('');
        try {
            const r = await fetch(`/api/admin/cards/${code}`, {
                method: 'DELETE'
            }), x = await r.json();
            if (!r.ok) throw new Error(x.error || t('dashboardLoadError'));
            setGenerated([]);
            setNotice(language === 'id' ? `${code} dan riwayat kunjungannya telah dihapus dari database.` : `${code} and its visit history were deleted from the database.`);
            await refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : t('dashboardLoadError'));
        } finally{
            setBusy(false);
        }
    }
    const csv = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!generated.length) return '';
        const rows = [
            [
                t('cardId'),
                t('activationCode'),
                t('qrUrl'),
                t('nfcUrl')
            ],
            ...generated.map((x)=>[
                    x.code,
                    x.activationCode,
                    x.qrURL,
                    x.nfcURL
                ])
        ];
        return rows.map((row)=>row.map((v)=>{
                const safe = /^[=+@-]/.test(v) ? `'${v}` : v;
                return `"${safe.replaceAll('"', '""')}"`;
            }).join(',')).join('\r\n');
    }, [
        generated,
        t
    ]);
    function downloadCsv() {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([
            csv
        ], {
            type: 'text/csv;charset=utf-8'
        }));
        a.download = 'repiw-cards.csv';
        a.click();
        URL.revokeObjectURL(a.href);
    }
    async function doLogout() {
        await fetch('/api/logout', {
            method: 'POST'
        });
        setLogged(false);
        setStats(null);
        setActivationCodes({});
        setGenerated([]);
    }
    async function demoAction(action) {
        setBusy(true);
        setError('');
        try {
            const r = await fetch(`/api/demo/${action}`, {
                method: 'POST'
            }), x = await r.json();
            if (!r.ok) throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localizedMessage"])(x.error || t('startDemoError'), language));
            if (action === 'seed') {
                setGenerated(x.inactiveCards.map((c)=>({
                        code: c.code,
                        activationCode: c.activationCode,
                        qrURL: `${location.origin}/c/${c.code}?src=qr`,
                        nfcURL: `${location.origin}/c/${c.code}?src=nfc`
                    })));
                setNotice(t('demoReady'));
            } else {
                setGenerated([]);
                setNotice(t('demoReset'));
            }
            await refresh();
        } catch (e) {
            setError(e instanceof Error ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localizedMessage"])(e.message, language) : t('startDemoError'));
        } finally{
            setBusy(false);
        }
    }
    if (postLoginLoading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$loading$2d$screen$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LoadingScreen"], {
        message: t('loadingDashboard')
    }, void 0, false, {
        fileName: "[project]/src/components/admin-panel.tsx",
        lineNumber: 27,
        columnNumber: 29
    }, this);
    if (!logged) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "activation-shell login-shell",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "auth-language",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LanguageSwitcher"], {}, void 0, false, {
                    fileName: "[project]/src/components/admin-panel.tsx",
                    lineNumber: 28,
                    columnNumber: 98
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/admin-panel.tsx",
                lineNumber: 28,
                columnNumber: 67
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "login-story",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        className: "brand login-brand",
                        href: "/",
                        children: [
                            "repiw",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "."
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 28,
                                columnNumber: 203
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 28,
                        columnNumber: 156
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "eyebrow",
                        children: t('featureChannels')
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 28,
                        columnNumber: 221
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: t('heroTitle')
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 28,
                        columnNumber: 270
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "login-story-copy",
                        children: t('heroDescription')
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 28,
                        columnNumber: 295
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "login-points",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                        children: "01"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 28,
                                        columnNumber: 388
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: t('featureActivation')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 28,
                                        columnNumber: 397
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 28,
                                columnNumber: 383
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                        children: "02"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 28,
                                        columnNumber: 445
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: t('featureChannels')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 28,
                                        columnNumber: 454
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 28,
                                columnNumber: 440
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                        children: "03"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 28,
                                        columnNumber: 500
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: t('featureInsights')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 28,
                                        columnNumber: 509
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 28,
                                columnNumber: 495
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 28,
                        columnNumber: 353
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "login-art",
                        "aria-hidden": "true",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "login-art-ring ring-a"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 28,
                                columnNumber: 602
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "login-art-ring ring-b"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 28,
                                columnNumber: 642
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "login-art-card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            "repiw",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 28,
                                                columnNumber: 725
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 28,
                                        columnNumber: 714
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                        children: ")))"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 28,
                                        columnNumber: 746
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                        children: "REVIEW CARD"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 28,
                                        columnNumber: 756
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 28,
                                columnNumber: 682
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 28,
                        columnNumber: 556
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin-panel.tsx",
                lineNumber: 28,
                columnNumber: 123
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                className: "activation-card login-card",
                onSubmit: login,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "brand-mark",
                        children: "R"
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 28,
                        columnNumber: 858
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "eyebrow",
                        children: t('secureAccess')
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 28,
                        columnNumber: 893
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        children: t('welcome')
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 28,
                        columnNumber: 939
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "muted",
                        children: t('signInDescription')
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 28,
                        columnNumber: 962
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        children: [
                            t('username'),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                autoFocus: true,
                                type: "text",
                                value: username,
                                onChange: (e)=>setUsername(e.target.value),
                                autoComplete: "username",
                                required: true
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 28,
                                columnNumber: 1033
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 28,
                        columnNumber: 1011
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        children: [
                            t('adminPassword'),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "password-field",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: showPassword ? 'text' : 'password',
                                        value: password,
                                        onChange: (e)=>setPassword(e.target.value),
                                        autoComplete: "current-password",
                                        required: true
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 28,
                                        columnNumber: 1223
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "password-toggle",
                                        "aria-label": t(showPassword ? 'hidePassword' : 'showPassword'),
                                        onClick: ()=>setShowPassword((v)=>!v),
                                        children: showPassword ? '◉' : '◎'
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 28,
                                        columnNumber: 1369
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 28,
                                columnNumber: 1190
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 28,
                        columnNumber: 1163
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "error login-error",
                        role: "alert",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 28,
                        columnNumber: 1569
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "login-submit",
                        disabled: busy,
                        children: [
                            busy ? t('signingIn') : t('signIn'),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "aria-hidden": "true",
                                children: "→"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 28,
                                columnNumber: 1709
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 28,
                        columnNumber: 1627
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        className: "text-link centered",
                        href: "/flow-preview",
                        children: t('exploreFlow')
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 28,
                        columnNumber: 1751
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "login-footnote",
                        children: t('privateWorkspace')
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 28,
                        columnNumber: 1828
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin-panel.tsx",
                lineNumber: 28,
                columnNumber: 796
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin-panel.tsx",
        lineNumber: 28,
        columnNumber: 20
    }, this);
    const icons = {
        overview: '◫',
        cards: '▣',
        analytics: '⌁',
        flowPreview: '▷',
        settings: '⚙'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "dashboard",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "sidebar",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        className: "brand",
                        href: "/",
                        children: [
                            "repiw",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "."
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 30,
                                columnNumber: 98
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 30,
                        columnNumber: 63
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "side-label",
                        children: t('workspace')
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 30,
                        columnNumber: 116
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        children: tabs.map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: tab === n ? 'nav-item selected' : 'nav-item',
                                onClick: ()=>n === 'flowPreview' ? location.assign('/flow-preview') : setTab(n),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                        children: icons[n]
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 30,
                                        columnNumber: 322
                                    }, this),
                                    t(n)
                                ]
                            }, n, true, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 30,
                                columnNumber: 180
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 30,
                        columnNumber: 162
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "side-bottom",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "avatar",
                                children: "A"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 30,
                                columnNumber: 391
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                        children: "Admin"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 30,
                                        columnNumber: 427
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                        children: demo ? t('demoWorkspace') : 'REPIW'
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 30,
                                        columnNumber: 439
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 30,
                                columnNumber: 422
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "icon-button",
                                onClick: doLogout,
                                "aria-label": t('signOut'),
                                children: "↗"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 30,
                                columnNumber: 493
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 30,
                        columnNumber: 362
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin-panel.tsx",
                lineNumber: 30,
                columnNumber: 36
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "dash-content",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "dash-top",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mobile-brand brand",
                                children: [
                                    "repiw",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 30,
                                        columnNumber: 695
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 30,
                                columnNumber: 654
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "dash-heading",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "eyebrow",
                                        children: demo ? t('demoWorkspace').toUpperCase() : t('cardManagement')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 30,
                                        columnNumber: 745
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        children: tab === 'overview' ? t('goodToSeeYou') : t(tab)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 30,
                                        columnNumber: 831
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 30,
                                columnNumber: 715
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "dash-actions",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LanguageSwitcher"], {}, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 30,
                                        columnNumber: 919
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "button button-outline",
                                        onClick: ()=>refresh().catch((e)=>setError(e.message)),
                                        children: [
                                            "↻ ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "desktop-only",
                                                children: t('refresh')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 30,
                                                columnNumber: 1036
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 30,
                                        columnNumber: 938
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "button button-outline mobile-logout",
                                        onClick: doLogout,
                                        children: t('signOut')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 30,
                                        columnNumber: 1097
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 30,
                                columnNumber: 889
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 30,
                        columnNumber: 625
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "mobile-nav",
                        "aria-label": t('workspace'),
                        children: tabs.map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: tab === n ? 'mobile-nav-item selected' : 'mobile-nav-item',
                                "aria-current": tab === n ? 'page' : undefined,
                                onClick: ()=>n === 'flowPreview' ? location.assign('/flow-preview') : setTab(n),
                                children: t(n)
                            }, n, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 30,
                                columnNumber: 1279
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 30,
                        columnNumber: 1210
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "error banner",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 30,
                        columnNumber: 1506
                    }, this),
                    notice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "success banner",
                        children: [
                            notice,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "dismiss",
                                onClick: ()=>setNotice(''),
                                children: "×"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 30,
                                columnNumber: 1593
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 30,
                        columnNumber: 1555
                    }, this),
                    tab === 'overview' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "muted intro",
                                children: t('happening')
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 31,
                                columnNumber: 23
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "metrics",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metric, {
                                        title: t('totalCards'),
                                        value: stats?.total
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 31,
                                        columnNumber: 99
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metric, {
                                        title: t('activeCards'),
                                        value: stats?.active,
                                        tone: "green"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 31,
                                        columnNumber: 153
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metric, {
                                        title: t('inactiveCards'),
                                        value: stats?.inactive
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 31,
                                        columnNumber: 222
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metric, {
                                        title: t('nfcTaps'),
                                        value: stats?.nfc,
                                        tone: "violet"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 31,
                                        columnNumber: 282
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metric, {
                                        title: t('qrScans'),
                                        value: stats?.qr,
                                        tone: "blue"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 31,
                                        columnNumber: 345
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 31,
                                columnNumber: 70
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "dash-grid",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                        className: "panel",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "panel-head",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "eyebrow",
                                                                children: t('recentActivity')
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                                lineNumber: 31,
                                                                columnNumber: 502
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                                children: t('latestCards')
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                                lineNumber: 31,
                                                                columnNumber: 550
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/admin-panel.tsx",
                                                        lineNumber: 31,
                                                        columnNumber: 497
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "text-link",
                                                        onClick: ()=>setTab('cards'),
                                                        children: t('viewAll')
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin-panel.tsx",
                                                        lineNumber: 31,
                                                        columnNumber: 583
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 31,
                                                columnNumber: 469
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CardTable, {
                                                cards: cards.slice(0, 6),
                                                t: t,
                                                language: language,
                                                activationCodes: activationCodes
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 31,
                                                columnNumber: 672
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 31,
                                        columnNumber: 442
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                        className: "panel generate-panel",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "eyebrow",
                                                children: t('getStarted')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 31,
                                                columnNumber: 821
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                children: t('generateCards')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 31,
                                                columnNumber: 865
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "muted",
                                                children: t('createUnique')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 31,
                                                columnNumber: 894
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(GenerateForm, {
                                                count: count,
                                                setCount: setCount,
                                                busy: busy,
                                                onSubmit: generate,
                                                t: t
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 31,
                                                columnNumber: 938
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                className: "text-link",
                                                href: "/flow-preview",
                                                children: t('previewEveryStep')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 31,
                                                columnNumber: 1025
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 31,
                                        columnNumber: 779
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 31,
                                columnNumber: 415
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 31,
                        columnNumber: 21
                    }, this),
                    tab === 'cards' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "panel toolbar",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "eyebrow",
                                                children: t('cardLibrary')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 32,
                                                columnNumber: 56
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                children: [
                                                    cards.length,
                                                    " ",
                                                    t('cards').toLowerCase()
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 32,
                                                columnNumber: 101
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 32,
                                        columnNumber: 51
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "toolbar-actions",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                className: "button button-outline",
                                                href: "/api/admin/qr-zip",
                                                children: t('downloadQrZip')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 32,
                                                columnNumber: 190
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "button",
                                                onClick: ()=>setTab('overview'),
                                                children: t('generateMore')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 32,
                                                columnNumber: 276
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 32,
                                        columnNumber: 157
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 32,
                                columnNumber: 20
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$nfc$2d$programmer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NfcProgrammer"], {
                                cards: cards,
                                onComplete: refresh,
                                language: language
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 32,
                                columnNumber: 376
                            }, this),
                            generated.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(GeneratedTable, {
                                items: generated,
                                csv: downloadCsv,
                                t: t
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 32,
                                columnNumber: 468
                            }, this),
                            editDestination && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$destination$2d$editor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DestinationEditor"], {
                                code: editDestination,
                                onSaved: (msg)=>{
                                    setNotice(msg);
                                    setEditDestination(null);
                                    refresh().catch((e)=>setError(e.message));
                                },
                                onClose: ()=>setEditDestination(null)
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 32,
                                columnNumber: 546
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "panel",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CardTable, {
                                    cards: cards,
                                    t: t,
                                    language: language,
                                    activationCodes: activationCodes,
                                    allowActions: true,
                                    onReactivate: reactivateCard,
                                    onDelete: deleteCard,
                                    onIssueCode: issueActivationCode,
                                    onEditDestination: setEditDestination,
                                    busy: busy
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin-panel.tsx",
                                    lineNumber: 32,
                                    columnNumber: 753
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 32,
                                columnNumber: 726
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 32,
                        columnNumber: 18
                    }, this),
                    tab === 'analytics' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "metrics analytics-metrics",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metric, {
                                title: t('totalCards'),
                                value: stats?.total
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 33,
                                columnNumber: 69
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metric, {
                                title: t('activeCards'),
                                value: stats?.active,
                                tone: "green"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 33,
                                columnNumber: 123
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metric, {
                                title: t('inactiveCards'),
                                value: stats?.inactive
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 33,
                                columnNumber: 192
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metric, {
                                title: t('visitsNfc'),
                                value: stats?.nfc,
                                tone: "violet"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 33,
                                columnNumber: 252
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metric, {
                                title: t('visitsQr'),
                                value: stats?.qr,
                                tone: "blue"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 33,
                                columnNumber: 317
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 33,
                        columnNumber: 22
                    }, this),
                    tab === 'settings' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "panel settings-panel",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "eyebrow",
                                children: t('workspaceSettings')
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 34,
                                columnNumber: 63
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: t('environment')
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 34,
                                columnNumber: 114
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "muted",
                                children: demo ? t('demoModeOn') : t('productionMode')
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 34,
                                columnNumber: 141
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "language-setting",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                        children: t('languageSetting')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 34,
                                        columnNumber: 242
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LanguageSwitcher"], {}, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 34,
                                        columnNumber: 271
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 34,
                                columnNumber: 208
                            }, this),
                            demo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "settings-actions",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "button",
                                        disabled: busy,
                                        onClick: ()=>demoAction('seed'),
                                        children: t('seedDemo')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 34,
                                        columnNumber: 337
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "button button-outline",
                                        disabled: busy,
                                        onClick: ()=>demoAction('reset'),
                                        children: t('resetDemo')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 34,
                                        columnNumber: 437
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 34,
                                columnNumber: 303
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "/flow-preview",
                                className: "text-link",
                                children: t('openFlow')
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 34,
                                columnNumber: 561
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 34,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin-panel.tsx",
                lineNumber: 30,
                columnNumber: 594
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin-panel.tsx",
        lineNumber: 30,
        columnNumber: 9
    }, this);
}
function Metric({ title, value, tone = '' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: "metric",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `metric-icon ${tone}`,
                children: "◦"
            }, void 0, false, {
                fileName: "[project]/src/components/admin-panel.tsx",
                lineNumber: 37,
                columnNumber: 117
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: title
            }, void 0, false, {
                fileName: "[project]/src/components/admin-panel.tsx",
                lineNumber: 37,
                columnNumber: 163
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                children: (value ?? 0).toLocaleString()
            }, void 0, false, {
                fileName: "[project]/src/components/admin-panel.tsx",
                lineNumber: 37,
                columnNumber: 177
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin-panel.tsx",
        lineNumber: 37,
        columnNumber: 89
    }, this);
}
function GenerateForm({ count, setCount, busy, onSubmit, t }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        className: "generate-form",
        onSubmit: onSubmit,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                children: [
                    t('numberOfCards'),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: count,
                        onChange: (e)=>setCount(Number(e.target.value)),
                        children: [
                            10,
                            25,
                            50,
                            100
                        ].map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                children: n
                            }, n, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 38,
                                columnNumber: 330
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 38,
                        columnNumber: 238
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin-panel.tsx",
                lineNumber: 38,
                columnNumber: 211
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                disabled: busy,
                children: [
                    t('generateCardsButton'),
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "→"
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 38,
                        columnNumber: 428
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin-panel.tsx",
                lineNumber: 38,
                columnNumber: 377
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin-panel.tsx",
        lineNumber: 38,
        columnNumber: 159
    }, this);
}
function CardTable({ cards, t, language, activationCodes, allowActions = false, onReactivate, onDelete, onIssueCode, onEditDestination, busy = false }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "table-wrap",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    children: t('cardId')
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin-panel.tsx",
                                    lineNumber: 39,
                                    columnNumber: 441
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    children: language === 'id' ? 'Kode Aktivasi' : 'Activation Code'
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin-panel.tsx",
                                    lineNumber: 39,
                                    columnNumber: 463
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    children: "Status"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin-panel.tsx",
                                    lineNumber: 39,
                                    columnNumber: 523
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    children: t('activatedDate')
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin-panel.tsx",
                                    lineNumber: 39,
                                    columnNumber: 538
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    children: "NFC"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin-panel.tsx",
                                    lineNumber: 39,
                                    columnNumber: 567
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    children: "QR"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin-panel.tsx",
                                    lineNumber: 39,
                                    columnNumber: 579
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    children: t('qrFile')
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin-panel.tsx",
                                    lineNumber: 39,
                                    columnNumber: 590
                                }, this),
                                allowActions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    children: language === 'id' ? 'Aksi' : 'Actions'
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin-panel.tsx",
                                    lineNumber: 39,
                                    columnNumber: 627
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin-panel.tsx",
                            lineNumber: 39,
                            columnNumber: 437
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 39,
                        columnNumber: 430
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                        children: cards.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                children: c.code
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 39,
                                                columnNumber: 726
                                            }, this),
                                            c.demo === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                                className: "demo-tag",
                                                children: "DEMO"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 39,
                                                columnNumber: 754
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 39,
                                        columnNumber: 722
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        children: !c.active && activationCodes[c.code] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            className: "activation-code-cell",
                                            children: activationCodes[c.code]
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin-panel.tsx",
                                            lineNumber: 39,
                                            columnNumber: 840
                                        }, this) : !c.active ? '—' : '—'
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 39,
                                        columnNumber: 800
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: c.active ? 'status active' : 'status inactive',
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                                                    fileName: "[project]/src/components/admin-panel.tsx",
                                                    lineNumber: 39,
                                                    columnNumber: 1000
                                                }, this),
                                                c.active ? t('activated') : t('inactiveCards')
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/admin-panel.tsx",
                                            lineNumber: 39,
                                            columnNumber: 939
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 39,
                                        columnNumber: 935
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        children: c.activated_at ? new Date(c.activated_at + 'Z').toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US') : '—'
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 39,
                                        columnNumber: 1060
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        children: c.nfc
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 39,
                                        columnNumber: 1170
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        children: c.qr
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 39,
                                        columnNumber: 1186
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            className: "download-link",
                                            href: `/api/admin/qr/${c.code}`,
                                            children: t('downloadPng')
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin-panel.tsx",
                                            lineNumber: 39,
                                            columnNumber: 1205
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 39,
                                        columnNumber: 1201
                                    }, this),
                                    allowActions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "card-actions",
                                            children: [
                                                c.active && onEditDestination && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "button button-outline destination-edit",
                                                    disabled: busy,
                                                    onClick: ()=>onEditDestination(c.code),
                                                    children: language === 'id' ? 'Ubah tujuan' : 'Change destination'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin-panel.tsx",
                                                    lineNumber: 39,
                                                    columnNumber: 1373
                                                }, this),
                                                c.active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "button button-outline",
                                                    disabled: busy,
                                                    onClick: ()=>onReactivate?.(c.code),
                                                    children: language === 'id' ? 'Aktifkan ulang' : 'Reactivate'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin-panel.tsx",
                                                    lineNumber: 39,
                                                    columnNumber: 1561
                                                }, this),
                                                !c.active && !activationCodes[c.code] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "button button-outline",
                                                    disabled: busy,
                                                    onClick: ()=>onIssueCode?.(c.code),
                                                    children: language === 'id' ? 'Buat sandi' : 'Issue code'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin-panel.tsx",
                                                    lineNumber: 39,
                                                    columnNumber: 1751
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "button button-danger",
                                                    disabled: busy,
                                                    onClick: ()=>onDelete?.(c.code),
                                                    children: language === 'id' ? 'Hapus' : 'Delete'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin-panel.tsx",
                                                    lineNumber: 39,
                                                    columnNumber: 1898
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/admin-panel.tsx",
                                            lineNumber: 39,
                                            columnNumber: 1313
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 39,
                                        columnNumber: 1309
                                    }, this)
                                ]
                            }, c.code, true, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 39,
                                columnNumber: 705
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 39,
                        columnNumber: 684
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin-panel.tsx",
                lineNumber: 39,
                columnNumber: 423
            }, this),
            !cards.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "empty",
                children: t('noCards')
            }, void 0, false, {
                fileName: "[project]/src/components/admin-panel.tsx",
                lineNumber: 39,
                columnNumber: 2082
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin-panel.tsx",
        lineNumber: 39,
        columnNumber: 395
    }, this);
}
function GeneratedTable({ items, csv, t }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "panel generated",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "panel-head",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "eyebrow",
                                children: t('newBatch')
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 40,
                                columnNumber: 162
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: [
                                    items.length,
                                    " ",
                                    t('cardsGenerated')
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 40,
                                columnNumber: 204
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "warning",
                                children: t('activationCodesOnce')
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 40,
                                columnNumber: 249
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 40,
                        columnNumber: 157
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "button",
                        onClick: csv,
                        children: t('downloadCsv')
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin-panel.tsx",
                        lineNumber: 40,
                        columnNumber: 308
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin-panel.tsx",
                lineNumber: 40,
                columnNumber: 129
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "table-wrap",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: t('cardId')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 40,
                                        columnNumber: 428
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: t('activationCode')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 40,
                                        columnNumber: 450
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: t('qrUrl')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 40,
                                        columnNumber: 480
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: t('nfcUrl')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin-panel.tsx",
                                        lineNumber: 40,
                                        columnNumber: 501
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin-panel.tsx",
                                lineNumber: 40,
                                columnNumber: 424
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin-panel.tsx",
                            lineNumber: 40,
                            columnNumber: 417
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: items.map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                children: i.code
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 40,
                                                columnNumber: 578
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin-panel.tsx",
                                            lineNumber: 40,
                                            columnNumber: 574
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                children: i.activationCode
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 40,
                                                columnNumber: 602
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin-panel.tsx",
                                            lineNumber: 40,
                                            columnNumber: 598
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: i.qrURL,
                                                target: "_blank",
                                                children: t('qrLink')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 40,
                                                columnNumber: 642
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin-panel.tsx",
                                            lineNumber: 40,
                                            columnNumber: 638
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: i.nfcURL,
                                                target: "_blank",
                                                children: t('nfcLink')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin-panel.tsx",
                                                lineNumber: 40,
                                                columnNumber: 702
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin-panel.tsx",
                                            lineNumber: 40,
                                            columnNumber: 698
                                        }, this)
                                    ]
                                }, i.code, true, {
                                    fileName: "[project]/src/components/admin-panel.tsx",
                                    lineNumber: 40,
                                    columnNumber: 557
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin-panel.tsx",
                            lineNumber: 40,
                            columnNumber: 536
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin-panel.tsx",
                    lineNumber: 40,
                    columnNumber: 410
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/admin-panel.tsx",
                lineNumber: 40,
                columnNumber: 382
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin-panel.tsx",
        lineNumber: 40,
        columnNumber: 92
    }, this);
}
}),
"[project]/src/components/destination-editor.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DestinationEditor",
    ()=>DestinationEditor
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
const RETRY_PHASES = [
    'inconclusive',
    'failed',
    'timeout',
    'unavailable',
    'worker_unavailable',
    'expired',
    'rate_limited'
];
const FALLBACK_PHASES = [
    'disabled',
    'unavailable',
    'worker_unavailable',
    'expired',
    'rate_limited'
];
function sleep(ms) {
    return new Promise((done)=>window.setTimeout(done, ms));
}
function DestinationEditor({ code, onSaved, onClose }) {
    const { language, t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLanguage"])();
    const id = language === 'id';
    const [current, setCurrent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [phase, setPhase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('idle');
    const [jobToken, setJobToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [resolvedUrl, setResolvedUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [businessName, setBusinessName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [businessAddress, setBusinessAddress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [preview, setPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const runRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let active = true;
        fetch(`/api/admin/cards/${code}/destination`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$client$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["REQUEST_TIMEOUT_MS"])
        }).then(async (res)=>res.ok ? (await res.json()).card : null).then((card)=>{
            if (active && card) setCurrent(card);
        }).catch(()=>undefined);
        return ()=>{
            active = false;
        };
    }, [
        code
    ]);
    const currentUrl = current?.review_url ?? null;
    function resetVerification() {
        runRef.current += 1;
        setPhase('idle');
        setJobToken(null);
        setResolvedUrl('');
        setBusinessName(null);
        setBusinessAddress(null);
        setPreview(null);
        setMessage('');
    }
    function cancelResolution() {
        runRef.current += 1;
        setPhase('idle');
        setMessage('');
    }
    async function resolve() {
        const value = input.trim();
        setMessage('');
        setPreview(null);
        if (!value) return;
        const run = ++runRef.current;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$client$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isDirectReviewUrl"])(value)) {
            // A direct review link needs no server resolution; it still goes through the same preview.
            setResolvedUrl(value);
            setJobToken(null);
            setPhase('verified');
            await requestPreview({
                reviewURL: value
            });
            return;
        }
        setPhase('resolving');
        setBusy(true);
        try {
            let res;
            try {
                res = await fetch('/api/resolve', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        url: value,
                        cardCode: code
                    }),
                    signal: AbortSignal.timeout(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$client$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["REQUEST_TIMEOUT_MS"])
                });
            } catch  {
                if (run === runRef.current) setPhase('unavailable');
                return;
            }
            const body = await res.json().catch(()=>null);
            if (run !== runRef.current) return;
            const nextPhase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$client$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["phaseForResolveResponse"])(res.status, body);
            if (nextPhase !== 'resolving') {
                setPhase(nextPhase);
                if (body?.error && nextPhase !== 'disabled' && nextPhase !== 'rate_limited') setMessage((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localizedMessage"])(body.error, language));
                return;
            }
            if (!body?.jobToken) {
                setPhase('unavailable');
                return;
            }
            await poll(body.jobToken, Date.now(), run, body.workerAvailable ?? null);
        } finally{
            setBusy(false);
        }
    }
    async function poll(token, startedAt, run, workerAvailable) {
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
                    setPhase(res.status === 503 ? 'unavailable' : 'failed');
                    return;
                }
                job = await res.json();
            } catch  {
                consecutiveErrors += 1;
                if (run !== runRef.current) return;
                if (consecutiveErrors >= 3) {
                    setPhase('unavailable');
                    return;
                }
                continue;
            }
            consecutiveErrors = 0;
            const nextPhase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$client$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["phaseForJob"])({
                ...job,
                workerAvailable: job.workerAvailable ?? workerAvailable
            }, {
                elapsedMs: Date.now() - startedAt,
                consecutiveErrors
            });
            if (nextPhase === 'resolving') continue;
            if (run !== runRef.current) return;
            if (nextPhase === 'success') {
                setJobToken(token);
                setResolvedUrl(job.reviewUrl ?? '');
                setBusinessName(job.businessName ?? null);
                setBusinessAddress(job.businessAddress ?? null);
                setPhase('verified');
                await requestPreview({
                    resolutionJobToken: token
                });
                return;
            }
            setPhase(nextPhase);
            return;
        }
        if (run === runRef.current) setPhase('timeout');
    }
    async function requestPreview(body) {
        setBusy(true);
        setMessage('');
        try {
            const res = await fetch(`/api/admin/cards/${code}/destination`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$client$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["REQUEST_TIMEOUT_MS"])
            });
            const data = await res.json().catch(()=>({}));
            if (!res.ok) {
                setMessage((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localizedMessage"])(data.error || t('dashboardLoadError'), language));
                return false;
            }
            setPreview({
                oldUrl: data.oldUrl ?? null,
                newUrl: data.newUrl,
                placeId: data.placeId ?? null,
                method: data.method,
                businessName: data.businessName ?? null,
                businessAddress: data.businessAddress ?? null
            });
            return true;
        } catch (err) {
            setMessage(err instanceof Error ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localizedMessage"])(err.message, language) : t('unexpectedError'));
            return false;
        } finally{
            setBusy(false);
        }
    }
    async function confirmSave() {
        if (!preview) return;
        setBusy(true);
        setMessage('');
        try {
            const res = await fetch(`/api/admin/cards/${code}/destination`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jobToken ? {
                    resolutionJobToken: jobToken,
                    confirm: true
                } : {
                    reviewURL: preview.newUrl,
                    confirm: true
                }),
                signal: AbortSignal.timeout(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$client$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["REQUEST_TIMEOUT_MS"])
            });
            const data = await res.json().catch(()=>({}));
            if (!res.ok) {
                setMessage((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localizedMessage"])(data.error || t('dashboardLoadError'), language));
                return;
            }
            onSaved(t('destSaved'));
        } catch (err) {
            setMessage(err instanceof Error ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localizedMessage"])(err.message, language) : t('unexpectedError'));
        } finally{
            setBusy(false);
        }
    }
    const phaseMessage = {
        idle: '',
        verified: t('verifiedReady'),
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
    const canResolve = !busy && phase !== 'resolving' && input.trim().length >= 2;
    const canConfirm = Boolean(preview) && preview?.newUrl !== currentUrl;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "panel destination-editor",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "panel-head",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "eyebrow",
                                children: t('destEditor')
                            }, void 0, false, {
                                fileName: "[project]/src/components/destination-editor.tsx",
                                lineNumber: 205,
                                columnNumber: 38
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: code
                            }, void 0, false, {
                                fileName: "[project]/src/components/destination-editor.tsx",
                                lineNumber: 205,
                                columnNumber: 82
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/destination-editor.tsx",
                        lineNumber: 205,
                        columnNumber: 33
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "text-link",
                        onClick: onClose,
                        children: [
                            t('destClose'),
                            " ×"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/destination-editor.tsx",
                        lineNumber: 205,
                        columnNumber: 103
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/destination-editor.tsx",
                lineNumber: 205,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "muted",
                children: t('destEditorHint')
            }, void 0, false, {
                fileName: "[project]/src/components/destination-editor.tsx",
                lineNumber: 206,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "field-hint",
                children: [
                    t('destCurrent'),
                    ": ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        children: currentUrl || '—'
                    }, void 0, false, {
                        fileName: "[project]/src/components/destination-editor.tsx",
                        lineNumber: 207,
                        columnNumber: 51
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/destination-editor.tsx",
                lineNumber: 207,
                columnNumber: 5
            }, this),
            current?.resolved_business_name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "fine-print",
                children: [
                    t('resolvedBusiness'),
                    ": ",
                    current.resolved_business_name,
                    current.resolved_business_address ? ` — ${current.resolved_business_address}` : '',
                    " (",
                    current.resolution_method || 'legacy',
                    ")"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/destination-editor.tsx",
                lineNumber: 208,
                columnNumber: 41
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                children: [
                    t('googleReviewUrl'),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: input,
                        placeholder: id ? 'Tempel tautan Maps atau tautan ulasan Google' : 'Paste a Maps link or a Google review link',
                        onChange: (e)=>{
                            setInput(e.target.value);
                            resetVerification();
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/destination-editor.tsx",
                        lineNumber: 209,
                        columnNumber: 34
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/destination-editor.tsx",
                lineNumber: 209,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "fine-print",
                children: t('destManualHint')
            }, void 0, false, {
                fileName: "[project]/src/components/destination-editor.tsx",
                lineNumber: 210,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: "button button-outline destination-resolve",
                disabled: !canResolve,
                onClick: ()=>{
                    void resolve();
                },
                children: busy && phase === 'resolving' ? id ? 'Memproses…' : 'Working…' : t('resolveMapsLink')
            }, void 0, false, {
                fileName: "[project]/src/components/destination-editor.tsx",
                lineNumber: 211,
                columnNumber: 5
            }, this),
            phase !== 'idle' && phase !== 'resolving' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: phase === 'verified' ? 'success' : 'field-hint',
                role: "status",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: phaseMessage[phase]
                    }, void 0, false, {
                        fileName: "[project]/src/components/destination-editor.tsx",
                        lineNumber: 212,
                        columnNumber: 130
                    }, this),
                    phase === 'verified' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            businessName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    t('resolvedBusiness'),
                                    ": ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                        children: businessName
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/destination-editor.tsx",
                                        lineNumber: 214,
                                        columnNumber: 54
                                    }, this),
                                    businessAddress ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            " — ",
                                            businessAddress
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/destination-editor.tsx",
                                        lineNumber: 214,
                                        columnNumber: 94
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/destination-editor.tsx",
                                lineNumber: 214,
                                columnNumber: 26
                            }, this),
                            resolvedUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    t('resolvedReviewLink'),
                                    ": ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: resolvedUrl,
                                        target: "_blank",
                                        rel: "noreferrer",
                                        children: resolvedUrl
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/destination-editor.tsx",
                                        lineNumber: 215,
                                        columnNumber: 55
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/destination-editor.tsx",
                                lineNumber: 215,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/destination-editor.tsx",
                        lineNumber: 213,
                        columnNumber: 32
                    }, this),
                    RETRY_PHASES.includes(phase) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "button button-outline",
                        onClick: ()=>{
                            void resolve();
                        },
                        children: t('retryResolution')
                    }, void 0, false, {
                        fileName: "[project]/src/components/destination-editor.tsx",
                        lineNumber: 217,
                        columnNumber: 40
                    }, this),
                    FALLBACK_PHASES.includes(phase) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "field-hint",
                        children: t('resolverManualFallback')
                    }, void 0, false, {
                        fileName: "[project]/src/components/destination-editor.tsx",
                        lineNumber: 218,
                        columnNumber: 43
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/destination-editor.tsx",
                lineNumber: 212,
                columnNumber: 51
            }, this),
            phase === 'resolving' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "field-hint",
                role: "status",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: t('resolvingLink')
                    }, void 0, false, {
                        fileName: "[project]/src/components/destination-editor.tsx",
                        lineNumber: 220,
                        columnNumber: 73
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "button button-outline",
                        onClick: cancelResolution,
                        children: t('resolverCancel')
                    }, void 0, false, {
                        fileName: "[project]/src/components/destination-editor.tsx",
                        lineNumber: 220,
                        columnNumber: 110
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/destination-editor.tsx",
                lineNumber: 220,
                columnNumber: 31
            }, this),
            preview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "panel destination-preview",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "eyebrow",
                        children: t('destPreview')
                    }, void 0, false, {
                        fileName: "[project]/src/components/destination-editor.tsx",
                        lineNumber: 222,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "field-hint",
                        children: [
                            id ? 'Tujuan lama' : 'Old destination',
                            ": ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                children: preview.oldUrl || '—'
                            }, void 0, false, {
                                fileName: "[project]/src/components/destination-editor.tsx",
                                lineNumber: 223,
                                columnNumber: 75
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/destination-editor.tsx",
                        lineNumber: 223,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "field-hint",
                        children: [
                            id ? 'Tujuan baru' : 'New destination',
                            ": ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                children: preview.newUrl
                            }, void 0, false, {
                                fileName: "[project]/src/components/destination-editor.tsx",
                                lineNumber: 224,
                                columnNumber: 75
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/destination-editor.tsx",
                        lineNumber: 224,
                        columnNumber: 7
                    }, this),
                    preview.placeId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "field-hint",
                        children: [
                            "Place ID: ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                children: preview.placeId
                            }, void 0, false, {
                                fileName: "[project]/src/components/destination-editor.tsx",
                                lineNumber: 225,
                                columnNumber: 63
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/destination-editor.tsx",
                        lineNumber: 225,
                        columnNumber: 27
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "fine-print",
                        children: preview.newUrl === currentUrl ? t('destUnchanged') : t('destExplain')
                    }, void 0, false, {
                        fileName: "[project]/src/components/destination-editor.tsx",
                        lineNumber: 226,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "button destination-confirm",
                        disabled: busy || !canConfirm,
                        onClick: ()=>{
                            void confirmSave();
                        },
                        children: t('destConfirm')
                    }, void 0, false, {
                        fileName: "[project]/src/components/destination-editor.tsx",
                        lineNumber: 227,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/destination-editor.tsx",
                lineNumber: 221,
                columnNumber: 17
            }, this),
            message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "error",
                role: "alert",
                children: message
            }, void 0, false, {
                fileName: "[project]/src/components/destination-editor.tsx",
                lineNumber: 229,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/destination-editor.tsx",
        lineNumber: 204,
        columnNumber: 10
    }, this);
}
}),
"[project]/src/components/loading-screen.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LoadingScreen",
    ()=>LoadingScreen
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function LoadingScreen({ message }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "loading-screen",
        role: "status",
        "aria-live": "polite",
        "aria-label": message,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "loading-emblem",
                "aria-hidden": "true",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "R"
                    }, void 0, false, {
                        fileName: "[project]/src/components/loading-screen.tsx",
                        lineNumber: 4,
                        columnNumber: 58
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                        fileName: "[project]/src/components/loading-screen.tsx",
                        lineNumber: 4,
                        columnNumber: 72
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {}, void 0, false, {
                        fileName: "[project]/src/components/loading-screen.tsx",
                        lineNumber: 4,
                        columnNumber: 77
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/loading-screen.tsx",
                lineNumber: 4,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                children: [
                    "repiw",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "."
                    }, void 0, false, {
                        fileName: "[project]/src/components/loading-screen.tsx",
                        lineNumber: 5,
                        columnNumber: 20
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/loading-screen.tsx",
                lineNumber: 5,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: message
            }, void 0, false, {
                fileName: "[project]/src/components/loading-screen.tsx",
                lineNumber: 6,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "loading-track",
                "aria-hidden": "true",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                    fileName: "[project]/src/components/loading-screen.tsx",
                    lineNumber: 7,
                    columnNumber: 57
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/loading-screen.tsx",
                lineNumber: 7,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/loading-screen.tsx",
        lineNumber: 3,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/nfc-programmer.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NfcProgrammer",
    ()=>NfcProgrammer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function NfcProgrammer({ cards, onComplete, language }) {
    const [code, setCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [fallbackUrl, setFallbackUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const id = language === 'id';
    async function program() {
        setBusy(true);
        setMessage('');
        setError(false);
        let cancelWriteIfNeeded = ()=>{};
        try {
            if (!code) throw new Error(id ? 'Pilih ID kartu terlebih dahulu.' : 'Select a card ID first.');
            const targetUrl = new URL(`/c/${encodeURIComponent(code)}?src=nfc`, window.location.origin).toString();
            setFallbackUrl(targetUrl);
            if (!('NDEFReader' in window)) {
                setMessage(id ? 'Browser ini tidak menyediakan Web NFC. Salin URL ini ke aplikasi penulis NFC bawaan/native, tulis sebagai record URL, lalu ketuk tag untuk menguji. Database akan menandai kartu saat URL NFC dibuka.' : 'This browser does not expose Web NFC. Copy this URL into a native NFC writer app, write it as a URL record, then tap the tag to test it. The database marks the card when its NFC URL is opened.');
                return;
            }
            const reader = new NDEFReader();
            const writeTask = new Promise((resolve, reject)=>{
                const timer = window.setTimeout(()=>{
                    cleanup();
                    reject(new Error(id ? 'Tag belum terdeteksi. Tempelkan tag NDEF kosong ke bagian NFC ponsel, lalu coba lagi.' : 'No tag detected. Hold a blank NDEF tag near the phone NFC area and try again.'));
                }, 30_000);
                const cleanup = ()=>{
                    window.clearTimeout(timer);
                    reader.removeEventListener('reading', onReading);
                    reader.removeEventListener('readingerror', onReadingError);
                };
                const onReading = ()=>{
                    reader.write({
                        records: [
                            {
                                recordType: 'url',
                                data: targetUrl
                            }
                        ]
                    }).then(()=>{
                        cleanup();
                        resolve();
                    }, (error)=>{
                        cleanup();
                        reject(error);
                    });
                };
                const onReadingError = ()=>{
                    cleanup();
                    reject(new Error(id ? 'Tag terdeteksi tetapi tidak dapat dibaca. Pastikan tag mendukung NDEF dan tidak terkunci.' : 'Tag detected but could not be read. Make sure it supports NDEF and is not locked.'));
                };
                cancelWriteIfNeeded = cleanup;
                reader.addEventListener('reading', onReading, {
                    once: true
                });
                reader.addEventListener('readingerror', onReadingError, {
                    once: true
                });
            });
            await reader.scan();
            setMessage(id ? 'NFC siap. Tempelkan tag kosong ke bagian belakang ponsel…' : 'NFC is ready. Hold a blank tag near the back of your phone…');
            await writeTask;
            await onComplete();
            setFallbackUrl('');
            setMessage(id ? `Kartu ${code} berhasil diprogram. Tempelkan lagi ke ponsel untuk menguji URL dan menyelesaikan pendaftaran.` : `Card ${code} is programmed. Tap it again to verify the URL and complete registration.`);
        } catch (e) {
            cancelWriteIfNeeded();
            setError(true);
            setMessage(e instanceof Error ? `${e.message}${id ? ' URL cadangan tersedia di bawah.' : ' A fallback URL is available below.'}` : id ? 'Pemrograman NFC gagal.' : 'NFC programming failed.');
        } finally{
            setBusy(false);
        }
    }
    async function copyUrl() {
        try {
            await navigator.clipboard.writeText(fallbackUrl);
            setMessage(id ? 'URL NFC disalin. Tempelkan ke aplikasi penulis NFC.' : 'NFC URL copied. Paste it into your NFC writer app.');
            setError(false);
        } catch  {
            setError(true);
            setMessage(id ? 'Gagal menyalin otomatis. Tekan lama URL lalu pilih Salin.' : 'Could not copy automatically. Long-press the URL and choose Copy.');
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "panel nfc-programmer",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "eyebrow",
                children: "NFC"
            }, void 0, false, {
                fileName: "[project]/src/components/nfc-programmer.tsx",
                lineNumber: 47,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                children: id ? 'Program kartu NFC' : 'Program an NFC card'
            }, void 0, false, {
                fileName: "[project]/src/components/nfc-programmer.tsx",
                lineNumber: 47,
                columnNumber: 35
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "muted",
                children: id ? 'Pilih kartu yang sudah dibuat. Browser yang mendukung Web NFC dapat menulis langsung; browser lain akan memberi URL untuk ditulis lewat aplikasi NFC native.' : 'Select a generated card. Web NFC browsers can write directly; other browsers will provide a URL to write with a native NFC app.'
            }, void 0, false, {
                fileName: "[project]/src/components/nfc-programmer.tsx",
                lineNumber: 48,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "nfc-controls",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        children: [
                            id ? 'ID kartu' : 'Card ID',
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: code,
                                onChange: (e)=>{
                                    setCode(e.target.value);
                                    setFallbackUrl('');
                                    setMessage('');
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: id ? 'Pilih kartu…' : 'Choose a card…'
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/nfc-programmer.tsx",
                                        lineNumber: 49,
                                        columnNumber: 173
                                    }, this),
                                    cards.map((card)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: card.code,
                                            children: [
                                                card.code,
                                                card.nfc_registered_at ? id ? ' · sudah terdeteksi' : ' · detected' : ''
                                            ]
                                        }, card.code, true, {
                                            fileName: "[project]/src/components/nfc-programmer.tsx",
                                            lineNumber: 49,
                                            columnNumber: 258
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/nfc-programmer.tsx",
                                lineNumber: 49,
                                columnNumber: 71
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/nfc-programmer.tsx",
                        lineNumber: 49,
                        columnNumber: 35
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "button",
                        disabled: busy || !cards.length,
                        onClick: program,
                        children: busy ? id ? 'Menyiapkan…' : 'Preparing…' : id ? 'Siapkan / tulis NFC' : 'Prepare / write NFC'
                    }, void 0, false, {
                        fileName: "[project]/src/components/nfc-programmer.tsx",
                        lineNumber: 49,
                        columnNumber: 415
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/nfc-programmer.tsx",
                lineNumber: 49,
                columnNumber: 5
            }, this),
            fallbackUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "nfc-url-box",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        children: [
                            id ? 'URL NFC untuk ditulis ke tag' : 'NFC URL to write to the tag',
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                readOnly: true,
                                value: fallbackUrl,
                                onFocus: (e)=>e.currentTarget.select()
                            }, void 0, false, {
                                fileName: "[project]/src/components/nfc-programmer.tsx",
                                lineNumber: 50,
                                columnNumber: 126
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/nfc-programmer.tsx",
                        lineNumber: 50,
                        columnNumber: 50
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "button button-outline",
                        onClick: copyUrl,
                        children: id ? 'Salin URL' : 'Copy URL'
                    }, void 0, false, {
                        fileName: "[project]/src/components/nfc-programmer.tsx",
                        lineNumber: 50,
                        columnNumber: 212
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/nfc-programmer.tsx",
                lineNumber: 50,
                columnNumber: 21
            }, this),
            message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: error ? 'error nfc-message' : 'success nfc-message',
                role: "status",
                children: message
            }, void 0, false, {
                fileName: "[project]/src/components/nfc-programmer.tsx",
                lineNumber: 51,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "fine-print",
                children: id ? 'Tulis URL sebagai record NDEF URL menggunakan Web NFC atau aplikasi NFC native di iOS/Android. Setelah URL tag dibuka, kartu otomatis ditandai terdeteksi. Browser tidak mengungkap UID/nomor seri tag.' : 'Write the URL as an NDEF URL record using Web NFC or a native iOS/Android NFC app. Opening the tag URL automatically marks the card as detected. Browsers do not expose tag UID/serial.'
            }, void 0, false, {
                fileName: "[project]/src/components/nfc-programmer.tsx",
                lineNumber: 52,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/nfc-programmer.tsx",
        lineNumber: 46,
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

//# sourceMappingURL=src_0ccbxsu5grrm1._.js.map