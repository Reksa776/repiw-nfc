module.exports = [
(()=>{"use strict";return[
"[project]/src/app/api/resolve/[token]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resolver/jobs.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$worker$2d$health$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resolver/worker-health.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const runtime = 'nodejs', dynamic = 'force-dynamic';
function fail(message, status, code) {
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
async function GET(_req, ctx) {
    const { token } = await ctx.params;
    if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return fail('Token tidak valid.', 400, 'invalid_token');
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expireJobIfOverdue"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"], token);
    } catch (error) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$worker$2d$health$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isMissingRelation"])(error)) {
            return fail('Layanan resolusi belum siap: migrasi database belum diterapkan di lingkungan ini.', 503, 'resolver_not_migrated');
        }
        throw error;
    }
    const job = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getJobByToken"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"], token);
    if (!job) return fail('Permintaan resolusi tidak ditemukan.', 404, 'job_not_found');
    const pending = job.status === 'pending';
    const health = pending ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resolver$2f$worker$2d$health$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readWorkerHealth"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"]).catch(()=>null) : null;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        status: job.status,
        cardCode: job.card_code,
        placeId: job.place_id,
        reviewUrl: job.review_url,
        businessName: job.business_name,
        businessAddress: job.business_address,
        method: job.method,
        errorCode: job.error_code,
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

//# sourceMappingURL=%5Broot-of-the-server%5D__1rb8ulmpba0ol._.js.map