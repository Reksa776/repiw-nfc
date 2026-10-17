module.exports = [
(()=>{"use strict";return[
"[project]/src/app/api/resolve/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z .object>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z .string>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/http.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/security.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resolver/config.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$server$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resolver/server-store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resolver/jobs.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$url$2d$policy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resolver/url-policy.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$worker$2d$health$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resolver/worker-health.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$server$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$server$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
const runtime = 'nodejs', dynamic = 'force-dynamic';
const schema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
    url: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().url().max(2048),
    code: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().regex(/^RP-[A-F0-9]{10}$/).optional(),
    activationCode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().regex(/^(?:[A-HJ-NP-Z2-9]{4}|[A-Fa-f0-9]{12})$/i).optional(),
    cardCode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().regex(/^RP-[A-F0-9]{10}$/).optional()
});
/**
 * Machine-readable failure shapes. The browser cannot rely on the status code alone (a proxy can
 * rewrite it), so every rejection carries a stable `code` the UI maps to Indonesian copy instead of
 * showing a generic message or spinning forever.
 */ function fail(message, status, code) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: message,
        code
    }, {
        status,
        headers: {
            'Cache-Control': 'no-store'
        }
    });
}
async function POST(req) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sameOrigin"])(req)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonError"])('Permintaan lintas situs ditolak.', 403);
    // The kill switch is checked before anything touches the database. With the resolver disabled
    // (the production default for this hotfix) the request costs nothing and the user is told to
    // paste a direct Google Review URL, which still activates a card normally.
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isEnabled"])()) {
        return fail('Fitur resolusi otomatis belum aktif di lingkungan ini.', 503, 'resolver_disabled');
    }
    const limited = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enforceRateLimit"])(req, 'resolve-request', 10, 15 * 60_000);
    if (limited) return limited;
    let body;
    try {
        body = await req.json();
    } catch  {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonError"])('Format permintaan tidak valid.', 400);
    }
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fail('Data permintaan resolusi tidak valid.', 400, 'invalid_request');
    const { url, code, activationCode, cardCode } = parsed.data;
    const klass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$url$2d$policy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["classifyGoogleUrl"])(url);
    if (klass === 'invalid') return fail('Hanya tautan Google HTTPS resmi yang didukung.', 400, 'unsupported_url');
    if (klass === 'google-other') return fail('Tautan Google ini bukan tautan lokasi atau ulasan.', 400, 'unsupported_url');
    const admin = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireAdmin"])();
    let boundCard = null;
    let createdBy = 'public';
    if (admin) {
        // Privileged path (admin): used by the dashboard to fix or prepare a destination, and by an
        // administrator who happens to be signed in while using the public activation form. In that
        // case the card code is in `code`, so bind to whichever the caller supplied — a job must never
        // end up unbound when the card is known, or activation would later be rejected as a mismatch.
        createdBy = 'admin';
        boundCard = cardCode ?? code ?? null;
        if (boundCard) {
            const [card] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query('SELECT code FROM cards WHERE code=? AND demo=? LIMIT 1', [
                boundCard,
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["demo"] ? 1 : 0
            ]);
            if (!card) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonError"])('Kartu tidak ditemukan.', 404);
        }
    } else {
        // Public activation context: bind the job to an existing inactive card whose one-time code
        // is correct. The code is NOT consumed here — only verified.
        if (!code || !activationCode) return fail('Kode kartu dan kode aktivasi diperlukan.', 400, 'invalid_request');
        const [card] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query('SELECT active,secret_hash FROM cards WHERE code=? LIMIT 1', [
            code
        ]);
        if (!card) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonError"])('Kartu tidak ditemukan.', 404);
        if (card.active) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonError"])('Kartu sudah aktif.', 409);
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyActivationCode"])(activationCode, card.secret_hash)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonError"])('Kode aktivasi salah.', 401);
        boundCard = code;
    }
    let created;
    try {
        created = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createOrReuseJob"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$server$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serverJobsDb"], {
            inputUrl: url,
            cardCode: boundCard,
            createdBy
        });
    } catch (error) {
        // The most likely production cause: migrations 6–7 (resolution_jobs) were never applied to the
        // deployed database. Answer with an actionable JSON error instead of an opaque 500.
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$worker$2d$health$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isMissingRelation"])(error)) {
            return fail('Layanan resolusi belum siap: migrasi database (versi 6–8) belum diterapkan di lingkungan ini.', 503, 'resolver_not_migrated');
        }
        console.error('[api/resolve] enqueue failed', error instanceof Error ? error.message : error);
        return fail('Permintaan resolusi gagal dibuat. Coba lagi atau tempel tautan Google Review langsung.', 500, 'resolver_error');
    }
    const { job, reused } = created;
    // Tell the caller up-front whether anything is consuming the queue, so the UI can escalate to
    // "worker tidak berjalan" in seconds instead of waiting for its full polling deadline.
    const health = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$worker$2d$health$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readWorkerHealth"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$server$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serverJobsDb"]).catch(()=>null);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        jobToken: job.job_token,
        status: job.status,
        reused,
        cardCode: job.card_code,
        expiresAt: job.expires_at,
        workerAvailable: health?.available ?? null
    }, {
        headers: {
            'Cache-Control': 'no-store'
        }
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "authenticateAdmin",
    ()=>authenticateAdmin,
    "createSession",
    ()=>createSession,
    "destroySession",
    ()=>destroySession,
    "ensureDemoAdminId",
    ()=>ensureDemoAdminId,
    "hasSession",
    ()=>hasSession
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const cookieName = 'repiw_session';
const ttl = 8 * 60 * 60 * 1000;
function secret() {
    const value = process.env.SESSION_SECRET || '';
    if (Buffer.byteLength(value) < 32) throw new Error('SESSION_SECRET must contain at least 32 bytes');
    return value;
}
function digest(value) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].createHmac('sha256', secret()).update(value).digest('hex');
}
function verifyHash(input, encoded) {
    const [kind, salt, expected] = encoded.split('$');
    if (kind !== 'scrypt' || !salt || !/^[a-f0-9]{128}$/i.test(expected || '')) return false;
    const actual = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].scryptSync(input, salt, 64).toString('hex');
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeEqual"])(actual, expected);
}
async function authenticateAdmin(username, input) {
    const [admin] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query('SELECT id,username,password_hash FROM admins WHERE LOWER(username)=? LIMIT 1', [
        username.trim().toLowerCase()
    ]);
    if (!admin || !verifyHash(input, admin.password_hash)) return null;
    return {
        id: Number(admin.id),
        username: admin.username
    };
}
async function ensureDemoAdminId() {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["demo"]) throw new Error('Demo admin requested outside demo mode');
    const salt = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomBytes(16).toString('hex');
    const randomPassword = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString('hex');
    const passwordHash = `scrypt$${salt}$${__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].scryptSync(randomPassword, salt, 64).toString('hex')}`;
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].execute("INSERT INTO admins(username,password_hash) VALUES('__demo__',?) ON CONFLICT(username) DO NOTHING", [
        passwordHash
    ]);
    const [row] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query("SELECT id FROM admins WHERE username='__demo__' LIMIT 1");
    if (!row) throw new Error('Could not initialize the demo admin.');
    return Number(row.id);
}
async function createSession(adminId) {
    const raw = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString('base64url');
    const expires = Date.now() + ttl;
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].execute('INSERT INTO sessions(id_hash,admin_id,expires_at,created_at) VALUES(?,?,?,?)', [
        digest(raw),
        adminId,
        expires,
        Date.now()
    ]);
    const store = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    store.set(cookieName, raw, {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: ttl / 1000
    });
}
async function hasSession() {
    const raw = (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])()).get(cookieName)?.value;
    if (!raw || raw.length > 128) return false;
    const [row] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query('SELECT s.expires_at FROM sessions s JOIN admins a ON a.id=s.admin_id WHERE s.id_hash=? LIMIT 1', [
        digest(raw)
    ]);
    if (!row) return false;
    if (Number(row.expires_at) <= Date.now()) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].execute('DELETE FROM sessions WHERE id_hash=?', [
            digest(raw)
        ]);
        return false;
    }
    return true;
}
async function destroySession() {
    const store = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const raw = store.get(cookieName)?.value;
    if (raw) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].execute('DELETE FROM sessions WHERE id_hash=?', [
        digest(raw)
    ]);
    store.set(cookieName, '', {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/http.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "enforceRateLimit",
    ()=>enforceRateLimit,
    "jsonError",
    ()=>jsonError,
    "requireAdmin",
    ()=>requireAdmin,
    "sameOrigin",
    ()=>sameOrigin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function jsonError(message, status) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: message
    }, {
        status,
        headers: {
            'Cache-Control': 'no-store'
        }
    });
}
async function requireAdmin() {
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasSession"])();
}
async function enforceRateLimit(req, scope, limit, windowMs) {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = process.env.TRUST_PROXY === 'true' ? forwarded?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown' : 'unknown';
    const bucket = `${scope}:${ip.slice(0, 80)}`;
    const now = Date.now(), cutoff = now - windowMs;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transaction"])(async (tx)=>{
        await tx.query('SELECT pg_advisory_xact_lock(hashtext(?))', [
            bucket
        ]);
        await tx.execute('DELETE FROM rate_events WHERE at < ?', [
            cutoff - windowMs
        ]);
        const [row] = await tx.query('SELECT COUNT(*) AS n FROM rate_events WHERE bucket=? AND at>?', [
            bucket,
            cutoff
        ]);
        if (Number(row?.n || 0) >= limit) return jsonError('Terlalu banyak percobaan. Coba lagi nanti.', 429);
        await tx.execute('INSERT INTO rate_events(bucket,at) VALUES(?,?)', [
            bucket,
            now
        ]);
        return null;
    });
}
function sameOrigin(req) {
    const origin = req.headers.get('origin');
    if (!origin) return true;
    try {
        return new URL(origin).host === req.headers.get('host');
    } catch  {
        return false;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/resolver/config.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isEnabled",
    ()=>isEnabled,
    "isPlacesApiConfigured",
    ()=>isPlacesApiConfigured,
    "resolverConfig",
    ()=>resolverConfig
]);
function resolverConfig() {
    const enabled = isEnabled();
    const timeoutMs = clampInt(process.env.RESOLVER_TIMEOUT_MS, 45_000, 5_000, 180_000);
    const maxConcurrency = clampInt(process.env.RESOLVER_MAX_CONCURRENCY, 1, 1, 4);
    const browserPath = (process.env.PLAYWRIGHT_BROWSER_PATH || process.env.CHROME_BIN || '').trim() || null;
    const headless = process.env.RESOLVER_HEADLESS !== 'false';
    const placesApiKey = (process.env.GOOGLE_MAPS_API_KEY || '').trim() || null;
    return {
        enabled,
        timeoutMs,
        maxConcurrency,
        browserPath,
        headless,
        placesApiKey
    };
}
function isEnabled() {
    return process.env.PLAYWRIGHT_RESOLVER_ENABLED === '1' || process.env.PLAYWRIGHT_RESOLVER_ENABLED === 'true';
}
function isPlacesApiConfigured() {
    return Boolean((process.env.GOOGLE_MAPS_API_KEY || '').trim());
}
function clampInt(value, fallback, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n) || !Number.isInteger(n)) return fallback;
    return Math.min(max, Math.max(min, n));
}
}),
"[project]/src/lib/resolver/extract.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Place ID extraction & validation. Pure module (no Node/browser APIs).
//
// Google Place IDs are opaque strings. We MUST NOT invent one, and MUST NOT substitute a
// CID (all digits), a Feature ID (0x...:0x...) or a maps share token for a real Place ID.
/** Guard against substituting non-Place-ID identifiers. */ __turbopack_context__.s([
    "addressFromMapsPayload",
    ()=>addressFromMapsPayload,
    "bestPlaceIdFromText",
    ()=>bestPlaceIdFromText,
    "buildReviewUrl",
    ()=>buildReviewUrl,
    "decodeEntities",
    ()=>decodeEntities,
    "firstMeaningfulName",
    ()=>firstMeaningfulName,
    "identityFromHtml",
    ()=>identityFromHtml,
    "isPlausiblePlaceId",
    ()=>isPlausiblePlaceId,
    "placeIdFromUrlCandidates",
    ()=>placeIdFromUrlCandidates,
    "placeIdsFromText",
    ()=>placeIdsFromText
]);
function isPlausiblePlaceId(value) {
    if (!value) return false;
    const id = value.trim();
    if (id.length < 20 || id.length > 255) return false;
    if (!/^[A-Za-z0-9_-]+$/.test(id)) return false;
    if (/^\d+$/.test(id)) return false; // CID (numeric customer id)
    if (/^0x[0-9a-f]+:0x[0-9a-f]+$/i.test(id)) return false; // Feature ID (ftid)
    return true;
}
function buildReviewUrl(placeId) {
    if (!isPlausiblePlaceId(placeId)) throw new Error('refusing to build a review URL from an implausible Place ID');
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}
function placeIdFromUrlCandidates(value) {
    const patterns = [
        /[?&]place_?id=([A-Za-z0-9_-]+)/gi,
        /[?&]query_place_id=([A-Za-z0-9_-]+)/gi
    ];
    for (const re of patterns){
        let m;
        while(m = re.exec(value)){
            if (isPlausiblePlaceId(m[1])) return m[1];
        }
    }
    return null;
}
function placeIdsFromText(text) {
    const found = new Set();
    const patterns = [
        /"place_id":"([A-Za-z0-9_-]{20,255})"/g,
        /\\"place_id\\":\\"([A-Za-z0-9_-]{20,255})\\"/g,
        /\bplaceid=([A-Za-z0-9_-]{20,255})/g,
        /\b(ChIJ[A-Za-z0-9_-]{15,250})\b/g
    ];
    for (const re of patterns){
        let m;
        while(m = re.exec(text)){
            if (isPlausiblePlaceId(m[1])) found.add(m[1]);
        }
    }
    return [
        ...found
    ];
}
function bestPlaceIdFromText(text) {
    const ids = placeIdsFromText(text);
    if (!ids.length) return null;
    return ids.find((id)=>id.startsWith('ChIJ')) ?? ids[0];
}
function addressFromMapsPayload(text) {
    if (!text) return null;
    const arrayRe = /\[((?:"(?:[^"\\]|\\.)*")(?:,"(?:[^"\\]|\\.)*"){2,6})\]/g;
    let match;
    while(match = arrayRe.exec(text)){
        const parts = match[1].split(/","/).map((part)=>decodeEntities(part.replace(/^"|"$/g, '').replace(/\\u003d/g, '=').replace(/\\/g, '')).trim()).filter(Boolean);
        if (parts.length < 3) continue;
        const joined = parts.join(', ');
        if (joined.length > 240) continue;
        // Require a postal-code-like token to avoid matching unrelated arrays.
        if (!/\b\d{4,5}\b/.test(joined)) continue;
        return joined;
    }
    return null;
}
function identityFromHtml(html) {
    const metaTitle = matchFirst(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']{1,200})["']/i);
    const ogSiteName = matchFirst(html, /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']{1,200})["']/i);
    const titleTag = matchFirst(html, /<title>([^<]{1,200})<\/title>/i);
    const metaName = metaTitle ? decodeEntities(metaTitle).trim() : null;
    const titleName = titleTag ? cleanMapsTitle(titleTag, ogSiteName) : null;
    const name = firstMeaningfulName([
        titleName,
        metaName
    ]);
    const addrMeta = matchFirst(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{1,300})["']/i);
    const address = addrMeta ? decodeEntities(addrMeta).trim() : null;
    return {
        name,
        address: address && address.length < 300 ? address : null
    };
}
const GENERIC_NAMES = new Set([
    'google maps',
    'google',
    'maps',
    'google maps platform'
]);
function firstMeaningfulName(candidates) {
    for (const candidate of candidates){
        const value = (candidate ?? '').trim();
        if (!value) continue;
        if (GENERIC_NAMES.has(value.toLowerCase())) continue;
        return value;
    }
    return null;
}
function matchFirst(text, re) {
    const m = re.exec(text);
    return m ? decodeEntities(m[1]) : null;
}
function cleanMapsTitle(title, siteName) {
    let t = title.trim();
    const suffix = siteName || 'Google Maps';
    for (const sep of [
        ' - ',
        ' · ',
        ' – '
    ]){
        const idx = t.lastIndexOf(sep);
        if (idx > 0 && t.slice(idx + sep.length).toLowerCase().includes('google maps')) t = t.slice(0, idx);
    }
    if (t.toLowerCase().endsWith(' - google maps')) t = t.slice(0, -' - google maps'.length);
    if (t.toLowerCase().endsWith(' - google')) t = t.slice(0, -' - google'.length);
    void suffix;
    return t.trim() || title.trim();
}
function decodeEntities(value) {
    return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
}
}),
"[project]/src/lib/resolver/jobs.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_JOB_TTL_MS",
    ()=>DEFAULT_JOB_TTL_MS,
    "DEFAULT_MAX_ATTEMPTS",
    ()=>DEFAULT_MAX_ATTEMPTS,
    "STALE_RUNNING_SECONDS",
    ()=>STALE_RUNNING_SECONDS,
    "backoffSeconds",
    ()=>backoffSeconds,
    "bindingHash",
    ()=>bindingHash,
    "claimNextJob",
    ()=>claimNextJob,
    "completeJob",
    ()=>completeJob,
    "createOrReuseJob",
    ()=>createOrReuseJob,
    "expireJobIfOverdue",
    ()=>expireJobIfOverdue,
    "failJob",
    ()=>failJob,
    "generateJobToken",
    ()=>generateJobToken,
    "getJobById",
    ()=>getJobById,
    "getJobByToken",
    ()=>getJobByToken,
    "isTerminal",
    ()=>isTerminal,
    "recoverStaleJobs",
    ()=>recoverStaleJobs,
    "statusForResult",
    ()=>statusForResult,
    "writeAudit",
    ()=>writeAudit
]);
// Durable, PostgreSQL-backed resolution job store.
//
// This module contains ONLY SQL logic plus pure helpers, so it can be shared by the Next.js
// route handlers and by the standalone worker process (which supplies its own `pg` pool).
// All job state lives in the database: jobs survive Next.js restarts and multiple instances.
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const DEFAULT_JOB_TTL_MS = 15 * 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 3;
const STALE_RUNNING_SECONDS = 5 * 60;
function generateJobToken() {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString('base64url');
}
function bindingHash(cardCode, inputUrl) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].createHash('sha256').update(`${cardCode.trim()}|${inputUrl.trim()}`).digest('hex');
}
function backoffSeconds(attempts) {
    return Math.min(300, 10 * 2 ** Math.max(0, attempts - 1));
}
function isTerminal(status) {
    return status === 'success' || status === 'failed' || status === 'expired' || status === 'inconclusive';
}
function statusForResult(result) {
    if (result.status === 'success') return 'success';
    if (result.status === 'inconclusive') return 'inconclusive';
    return 'failed';
}
async function createOrReuseJob(db, params) {
    const binding = bindingHash(params.cardCode ?? '*', params.inputUrl);
    const ttlMs = params.ttlMs ?? DEFAULT_JOB_TTL_MS;
    const maxAttempts = params.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
    return db.transaction(async (tx)=>{
        // Serialize per binding so two concurrent requests cannot both create an active job.
        await tx.query('SELECT pg_advisory_xact_lock(hashtext(?))', [
            binding
        ]);
        // Retire overdue in-flight jobs for this binding FIRST.
        //
        // `uq_resolution_jobs_active` is a partial unique index over (binding_hash) for
        // pending/running rows, and it does not consider `expires_at`. Without this sweep, an overdue
        // job that nobody polls again (the usual case when no worker is running) keeps the index slot
        // occupied and every retry for the same card + URL fails with a 23505 unique violation —
        // observed in production as a permanently stuck resolver.
        await tx.execute(`UPDATE resolution_jobs SET status='expired', finished_at=CURRENT_TIMESTAMP, worker_id=NULL, locked_at=NULL, updated_at=CURRENT_TIMESTAMP
       WHERE binding_hash=? AND status IN ('pending','running') AND expires_at <= CURRENT_TIMESTAMP`, [
            binding
        ]);
        const [existing] = await tx.query(`SELECT * FROM resolution_jobs WHERE binding_hash=? AND status IN ('pending','running') AND expires_at > CURRENT_TIMESTAMP ORDER BY id DESC LIMIT 1`, [
            binding
        ]);
        if (existing) return {
            job: existing,
            reused: true
        };
        const token = generateJobToken();
        const inserted = await tx.query(`INSERT INTO resolution_jobs(job_token,status,input_url,binding_hash,card_code,created_by,max_attempts,expires_at)
       VALUES(?,'pending',?,?,?,?,?, CURRENT_TIMESTAMP + (?::double precision * INTERVAL '1 millisecond'))
       RETURNING *`, [
            token,
            params.inputUrl.trim(),
            binding,
            params.cardCode,
            params.createdBy,
            maxAttempts,
            ttlMs
        ]);
        return {
            job: inserted[0],
            reused: false
        };
    });
}
async function getJobByToken(db, token) {
    const [row] = await db.query('SELECT * FROM resolution_jobs WHERE job_token=? LIMIT 1', [
        token
    ]);
    return row ?? null;
}
async function expireJobIfOverdue(db, token) {
    const result = await db.execute(`UPDATE resolution_jobs SET status='expired', finished_at=CURRENT_TIMESTAMP, worker_id=NULL, locked_at=NULL, updated_at=CURRENT_TIMESTAMP
     WHERE job_token=? AND status IN ('pending','running') AND expires_at <= CURRENT_TIMESTAMP`, [
        token
    ]);
    return result.affectedRows > 0;
}
async function getJobById(db, id) {
    const [row] = await db.query('SELECT * FROM resolution_jobs WHERE id=? LIMIT 1', [
        id
    ]);
    return row ?? null;
}
async function recoverStaleJobs(db) {
    const expired = await db.execute(`UPDATE resolution_jobs SET status='expired', finished_at=CURRENT_TIMESTAMP, worker_id=NULL, locked_at=NULL, updated_at=CURRENT_TIMESTAMP
     WHERE status IN ('pending','running') AND expires_at <= CURRENT_TIMESTAMP`);
    const requeued = await db.execute(`UPDATE resolution_jobs SET status='pending', worker_id=NULL, locked_at=NULL, next_attempt_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP
     WHERE status='running' AND locked_at IS NOT NULL AND locked_at < CURRENT_TIMESTAMP - (?::int * INTERVAL '1 second') AND expires_at > CURRENT_TIMESTAMP`, [
        STALE_RUNNING_SECONDS
    ]);
    return {
        expired: expired.affectedRows,
        requeued: requeued.affectedRows
    };
}
async function claimNextJob(db, workerId) {
    await recoverStaleJobs(db);
    return db.transaction(async (tx)=>{
        const [row] = await tx.query(`SELECT id FROM resolution_jobs
       WHERE status='pending'
         AND expires_at > CURRENT_TIMESTAMP
         AND (next_attempt_at IS NULL OR next_attempt_at <= CURRENT_TIMESTAMP)
       ORDER BY created_at ASC
       FOR UPDATE SKIP LOCKED
       LIMIT 1`);
        if (!row) return null;
        const updated = await tx.query(`UPDATE resolution_jobs SET status='running', worker_id=?, locked_at=CURRENT_TIMESTAMP, started_at=COALESCE(started_at,CURRENT_TIMESTAMP), attempts=attempts+1, updated_at=CURRENT_TIMESTAMP
       WHERE id=? RETURNING *`, [
            workerId,
            row.id
        ]);
        return updated[0] ?? null;
    });
}
async function finish(db, id, status, fields, nextAttemptAtSql = 'NULL') {
    await db.execute(`UPDATE resolution_jobs SET status=?, place_id=?, review_url=?, business_name=?, business_address=?, method=?, error_code=?, error_message=?, finished_at=CURRENT_TIMESTAMP, locked_at=NULL, worker_id=NULL, next_attempt_at=${nextAttemptAtSql}, updated_at=CURRENT_TIMESTAMP WHERE id=?`, [
        status,
        fields.placeId ?? null,
        fields.reviewUrl ?? null,
        fields.businessName ?? null,
        fields.businessAddress ?? null,
        fields.method ?? null,
        fields.errorCode ?? null,
        fields.errorMessage ?? null,
        id
    ]);
}
async function completeJob(db, id, result) {
    await finish(db, id, statusForResult(result), {
        placeId: result.placeId,
        reviewUrl: result.reviewUrl,
        businessName: result.businessName,
        businessAddress: result.businessAddress,
        method: result.method,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage
    });
}
async function failJob(db, job, code, message) {
    const attempts = Number(job.attempts);
    const maxAttempts = Number(job.max_attempts);
    if (attempts < maxAttempts) {
        const delay = backoffSeconds(attempts);
        await db.execute(`UPDATE resolution_jobs SET status='pending', error_code=?, error_message=?, next_attempt_at=CURRENT_TIMESTAMP + (?::int * INTERVAL '1 second'), locked_at=NULL, worker_id=NULL, updated_at=CURRENT_TIMESTAMP WHERE id=?`, [
            code,
            message.slice(0, 500),
            delay,
            job.id
        ]);
        return 'retry';
    }
    await finish(db, job.id, 'failed', {
        errorCode: code,
        errorMessage: message
    });
    return 'failed';
}
async function writeAudit(db, entry) {
    await db.execute(`INSERT INTO resolution_audit(actor,action,card_code,old_url,new_url,place_id,detail) VALUES(?,?,?,?,?,?,?)`, [
        entry.actor,
        entry.action,
        entry.cardCode ?? null,
        entry.oldUrl ?? null,
        entry.newUrl ?? null,
        entry.placeId ?? null,
        entry.detail ?? null
    ]);
}
}),
"[project]/src/lib/resolver/server-store.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "serverJobsDb",
    ()=>serverJobsDb
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const serverJobsDb = {
    query: (sql, params)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query(sql, params),
    execute: (sql, params)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].execute(sql, params),
    transaction: (fn)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transaction"])(async (tx)=>fn({
                query: (sql, params)=>tx.query(sql, params),
                execute: (sql, params)=>tx.execute(sql, params)
            }))
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/resolver/url-policy.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "classifyGoogleUrl",
    ()=>classifyGoogleUrl,
    "isAllowedGoogleHost",
    ()=>isAllowedGoogleHost,
    "isOfficialReviewUrl",
    ()=>isOfficialReviewUrl,
    "placeIdFromReviewUrl",
    ()=>placeIdFromReviewUrl
]);
// Strict Google URL policy. Pure module (no Node/browser APIs) so it is unit-testable.
//
// We only ever accept HTTPS URLs on Google-operated hostnames. This is the SSRF boundary for
// the resolver: the browser, the HTTP expander and the Places API client all depend on it.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$extract$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resolver/extract.ts [app-route] (ecmascript)");
;
/** Hosts that are explicitly allowed in addition to the Google-domain pattern. */ const EXPLICIT_HOSTS = new Set([
    'maps.app.goo.gl',
    'goo.gl',
    'g.page',
    'maps.google.com',
    'www.google.com',
    'google.com',
    'search.google.com',
    'maps.googleapis.com',
    'places.googleapis.com'
]);
/**
 * Matches Google-owned domains, including country TLDs (google.com, google.co.id, google.co.uk).
 * Anchored at both ends so look-alikes such as `google.com.attacker.example` are rejected.
 */ const GOOGLE_DOMAIN = /^(?:[a-z0-9-]+\.)*google\.(?:com|[a-z]{2}(?:\.[a-z]{2})?)$/;
function isAllowedGoogleHost(hostname) {
    const host = hostname.toLowerCase();
    if (EXPLICIT_HOSTS.has(host)) return true;
    return GOOGLE_DOMAIN.test(host);
}
function isOfficialReviewUrl(value) {
    const c = classifyGoogleUrl(value);
    return c === 'official-review' || c === 'gpage-review';
}
function classifyGoogleUrl(value) {
    let url;
    try {
        url = new URL(value);
    } catch  {
        return 'invalid';
    }
    if (url.protocol !== 'https:') return 'invalid';
    if (url.username || url.password) return 'invalid';
    if (url.port && url.port !== '443') return 'invalid';
    if (!isAllowedGoogleHost(url.hostname)) return 'invalid';
    const host = url.hostname.toLowerCase();
    if (host === 'search.google.com') {
        if (url.pathname === '/local/writereview' && url.searchParams.get('placeid')) return 'official-review';
        return 'google-other';
    }
    if (host === 'g.page') {
        return /^\/r\/[^/]+\/review\/?$/i.test(url.pathname) ? 'gpage-review' : 'google-other';
    }
    if (host === 'maps.app.goo.gl' || host === 'goo.gl') {
        // goo.gl is a general shortener; only treat known maps/maps.app paths as maps shortlinks.
        if (host === 'goo.gl' && !/^\/maps/.test(url.pathname)) return 'google-other';
        return 'maps-short';
    }
    if (host === 'maps.google.com' || host === 'www.google.com' || host === 'google.com') {
        if (url.pathname.startsWith('/maps') || url.searchParams.has('ftid') || url.searchParams.has('cid')) return 'maps-place';
        return 'google-other';
    }
    return 'google-other';
}
function placeIdFromReviewUrl(value) {
    try {
        const url = new URL(value);
        const id = url.searchParams.get('placeid') || url.searchParams.get('place_id') || url.searchParams.get('query_place_id');
        return id && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$extract$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isPlausiblePlaceId"])(id) ? id : null;
    } catch  {
        return null;
    }
}
}),
"[project]/src/lib/resolver/worker-health.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Worker liveness, derived from a heartbeat table the standalone worker writes.
//
// The Next.js app never talks to the worker; it only reads `resolver_workers`. That lets the API
// tell the UI "no worker is consuming the queue" within seconds instead of leaving the user with a
// spinner until the client deadline. The table is created by migration 8 (Phase hotfix). When the
// migration has not been applied yet, every read degrades to `available: null` (unknown) instead of
// throwing, so a missing migration can never turn a status poll into a 500.
__turbopack_context__.s([
    "UNKNOWN_WORKER_HEALTH",
    ()=>UNKNOWN_WORKER_HEALTH,
    "WORKER_HEARTBEAT_MS",
    ()=>WORKER_HEARTBEAT_MS,
    "WORKER_STALE_SECONDS",
    ()=>WORKER_STALE_SECONDS,
    "heartbeatWorker",
    ()=>heartbeatWorker,
    "isMissingRelation",
    ()=>isMissingRelation,
    "readWorkerHealth",
    ()=>readWorkerHealth,
    "retireWorker",
    ()=>retireWorker
]);
const WORKER_STALE_SECONDS = 30;
const WORKER_HEARTBEAT_MS = 10_000;
const UNKNOWN_WORKER_HEALTH = {
    available: null,
    workers: 0,
    lastSeenSecondsAgo: null
};
function isMissingRelation(error) {
    const code = error?.code;
    return code === '42P01';
}
async function heartbeatWorker(db, worker) {
    await db.execute(`INSERT INTO resolver_workers(worker_id,hostname,concurrency,started_at,last_seen_at)
     VALUES(?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
     ON CONFLICT(worker_id) DO UPDATE SET hostname=EXCLUDED.hostname,concurrency=EXCLUDED.concurrency,last_seen_at=CURRENT_TIMESTAMP`, [
        worker.workerId,
        worker.hostname,
        worker.concurrency
    ]);
}
async function retireWorker(db, workerId) {
    await db.execute('DELETE FROM resolver_workers WHERE worker_id=?', [
        workerId
    ]);
}
async function readWorkerHealth(db) {
    try {
        const [row] = await db.query(`SELECT COUNT(*) AS workers,
              MAX(last_seen_at) AS last_seen_at,
              EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - MAX(last_seen_at))) AS age_seconds
       FROM resolver_workers`);
        const workers = Number(row?.workers ?? 0);
        const age = row?.age_seconds === null || row?.age_seconds === undefined ? null : Number(row.age_seconds);
        return {
            available: workers > 0 && age !== null && age <= WORKER_STALE_SECONDS,
            workers,
            lastSeenSecondsAgo: age === null ? null : Math.max(0, Math.round(age))
        };
    } catch (error) {
        if (isMissingRelation(error)) return UNKNOWN_WORKER_HEALTH;
        throw error;
    }
}
}),
"[project]/src/lib/security.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decryptActivationCode",
    ()=>decryptActivationCode,
    "encryptActivationCode",
    ()=>encryptActivationCode,
    "hashActivationCode",
    ()=>hashActivationCode,
    "verifyActivationCode",
    ()=>verifyActivationCode
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const sha256 = (value)=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].createHash('sha256').update(value).digest('hex');
const safeEqual = (a, b)=>{
    const x = Buffer.from(a), y = Buffer.from(b);
    return x.length === y.length && __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].timingSafeEqual(x, y);
};
function activationEncryptionKey() {
    const secret = process.env.ACTIVATION_CODE_ENCRYPTION_KEY || process.env.SESSION_SECRET;
    if (!secret || Buffer.byteLength(secret) < 32) throw new Error('Set ACTIVATION_CODE_ENCRYPTION_KEY or a 32-byte SESSION_SECRET to protect stored activation codes.');
    return Buffer.from(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].hkdfSync('sha256', Buffer.from(secret), 'repiw-activation-codes-v1', 'card-code-encryption', 32));
}
function encryptActivationCode(code) {
    const iv = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomBytes(12), cipher = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].createCipheriv('aes-256-gcm', activationEncryptionKey(), iv);
    const encrypted = Buffer.concat([
        cipher.update(code.toUpperCase(), 'utf8'),
        cipher.final()
    ]);
    return `v1:${iv.toString('base64url')}:${cipher.getAuthTag().toString('base64url')}:${encrypted.toString('base64url')}`;
}
function decryptActivationCode(value) {
    const [version, iv, tag, payload] = value.split(':');
    if (version !== 'v1' || !iv || !tag || !payload) throw new Error('Stored activation code has an unsupported format.');
    const decipher = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].createDecipheriv('aes-256-gcm', activationEncryptionKey(), Buffer.from(iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([
        decipher.update(Buffer.from(payload, 'base64url')),
        decipher.final()
    ]).toString('utf8');
}
function hashActivationCode(code) {
    const salt = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomBytes(16).toString('hex');
    return `scrypt$${salt}$${__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].scryptSync(code.toUpperCase(), salt, 64).toString('hex')}`;
}
function verifyActivationCode(code, stored) {
    if (stored.startsWith('scrypt$')) {
        const [, salt, expected] = stored.split('$');
        if (!salt || !expected) return false;
        return safeEqual(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].scryptSync(code.toUpperCase(), salt, 64).toString('hex'), expected);
    }
    // Existing cards used an unsalted SHA-256 digest; activation consumes the code and replaces this value.
    if (/^[a-f0-9]{64}$/i.test(stored)) return safeEqual(stored, sha256(code.toUpperCase()));
    return false;
}
}),
]})(),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0ub1a0105j00-._.js.map