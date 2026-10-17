module.exports = [
(()=>{"use strict";return[
"[project]/src/app/c/[code]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "default",
    ()=>CardPage,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cards$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/cards.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$activation$2d$form$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/activation-form.tsx [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cards$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cards$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
const runtime = 'nodejs', dynamic = 'force-dynamic';
async function CardPage({ params, searchParams }) {
    const { code } = await params, query = await searchParams;
    const [card] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].query('SELECT id,code,active,demo,review_url FROM cards WHERE code=? LIMIT 1', [
        code
    ]);
    if (!card) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    const src = Array.isArray(query.src) ? query.src[0] : query.src;
    const source = src === 'nfc' ? 'nfc' : 'qr';
    if (source === 'nfc' && !card.active) await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cards$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["markNfcRegistered"])(Number(card.id));
    if (card.active) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cards$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["recordVisit"])(Number(card.id), source);
        if (card.demo === 1) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/demo-review?card=${encodeURIComponent(card.code)}&src=${source}`);
        if (!card.review_url) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(card.review_url);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$activation$2d$form$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ActivationForm"], {
        code: card.code,
        source: source
    }, void 0, false, {
        fileName: "[project]/src/app/c/[code]/page.tsx",
        lineNumber: 11,
        columnNumber: 9
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/components/activation-form.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ActivationForm",
    ()=>ActivationForm
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ActivationForm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ActivationForm() from the server but ActivationForm is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/activation-form.tsx", "ActivationForm");
}),
"[project]/src/components/activation-form.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$activation$2d$form$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/components/activation-form.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$activation$2d$form$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/src/lib/cards.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "listCards",
    ()=>listCards,
    "markNfcRegistered",
    ()=>markNfcRegistered,
    "recordVisit",
    ()=>recordVisit,
    "stats",
    ()=>stats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function recordVisit(cardId, source) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].execute('INSERT INTO visits(card_id,source) VALUES (?,?)', [
        cardId,
        source
    ]);
    if (source === 'nfc') await markNfcRegistered(cardId);
}
async function markNfcRegistered(cardId) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].execute('UPDATE cards SET nfc_registered_at=COALESCE(nfc_registered_at,CURRENT_TIMESTAMP) WHERE id=?', [
        cardId
    ]);
}
async function stats() {
    const [cards] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].query(`SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN active=1 THEN 1 ELSE 0 END),0) AS active FROM cards WHERE demo=?`, [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["demo"] ? 1 : 0
    ]);
    const events = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].query('SELECT v.source, COUNT(*) AS n FROM visits v JOIN cards c ON c.id=v.card_id WHERE c.demo=? GROUP BY v.source', [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["demo"] ? 1 : 0
    ]);
    const total = Number(cards?.total || 0), active = Number(cards?.active || 0);
    return {
        total,
        active,
        inactive: total - active,
        nfc: Number(events.find((v)=>v.source === 'nfc')?.n || 0),
        qr: Number(events.find((v)=>v.source === 'qr')?.n || 0)
    };
}
async function listCards() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].query(`SELECT c.code,c.active,c.demo,c.nfc_registered_at,TO_CHAR(c.activated_at,'YYYY-MM-DD HH24:MI:SS') AS activated_at,TO_CHAR(c.created_at,'YYYY-MM-DD HH24:MI:SS') AS created_at,
    (SELECT COUNT(*) FROM visits v WHERE v.card_id=c.id AND v.source='nfc') AS nfc,
    (SELECT COUNT(*) FROM visits v WHERE v.card_id=c.id AND v.source='qr') AS qr
    FROM cards c WHERE c.demo=? ORDER BY c.id DESC LIMIT 500`, [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["demo"] ? 1 : 0
    ]);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/db.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "closePool",
    ()=>closePool,
    "db",
    ()=>db,
    "demo",
    ()=>demo,
    "makeActivationCode",
    ()=>makeActivationCode,
    "makeCode",
    ()=>makeCode,
    "safeEqual",
    ()=>safeEqual,
    "sha256",
    ()=>sha256,
    "transaction",
    ()=>transaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const demo = process.env.DEMO_MODE === 'true';
let pool;
function getPool() {
    if (pool) return pool;
    const connectionString = process.env.DATABASE_URL?.trim();
    if (!connectionString) throw new Error('Supabase is not configured. Set DATABASE_URL in .env.');
    const poolSize = Number(process.env.PG_POOL_SIZE || 5);
    if (!Number.isInteger(poolSize) || poolSize < 1 || poolSize > 50) throw new Error('PG_POOL_SIZE must be an integer from 1 to 50.');
    pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["Pool"]({
        connectionString,
        max: poolSize,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 10_000,
        application_name: 'repiw-nextjs'
    });
    pool.on('error', (error)=>console.error('Unexpected idle PostgreSQL client error', error));
    return pool;
}
function pgSql(sql) {
    let index = 0;
    return sql.replace(/\?/g, ()=>`$${++index}`);
}
async function runQuery(executor, sql, params = []) {
    const result = await executor.query(pgSql(sql), params);
    return result.rows;
}
async function runExecute(executor, sql, params = []) {
    const result = await executor.query(pgSql(sql), params);
    return {
        affectedRows: result.rowCount || 0,
        insertId: Number(result.rows[0]?.id || 0),
        rows: result.rows
    };
}
const db = {
    query: (sql, params = [])=>runQuery(getPool(), sql, params),
    execute: (sql, params = [])=>runExecute(getPool(), sql, params)
};
async function transaction(fn) {
    const connection = await getPool().connect();
    try {
        await connection.query('BEGIN');
        const tx = {
            query: (sql, params = [])=>runQuery(connection, sql, params),
            execute: (sql, params = [])=>runExecute(connection, sql, params)
        };
        const result = await fn(tx);
        await connection.query('COMMIT');
        return result;
    } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
    } finally{
        connection.release();
    }
}
const closePool = async ()=>{
    if (pool) {
        const current = pool;
        pool = undefined;
        await current.end();
    }
};
const sha256 = (value)=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].createHash('sha256').update(value).digest('hex');
const safeEqual = (a, b)=>{
    const x = Buffer.from(a), y = Buffer.from(b);
    return x.length === y.length && __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].timingSafeEqual(x, y);
};
function makeCode() {
    return `RP-${__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomBytes(5).toString('hex').toUpperCase()}`;
}
function makeActivationCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({
        length: 4
    }, ()=>alphabet.charAt(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomInt(alphabet.length))).join('');
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
]})(),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/src/app/c/[code]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/c/[code]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0x0_go3_vb0yv._.js.map