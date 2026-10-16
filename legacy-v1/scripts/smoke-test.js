#!/usr/bin/env node
/*
 * Smoke test end-to-end REPIW V1 (Test A-F).
 * Menjalankan server pada port & database sementara, lalu menguji alur.
 * HTTP menggunakan modul bawaan node:http karena header Cookie tidak boleh
 * dikirim lewat fetch() (forbidden header).
 *
 * Jalankan dengan: npm test
 */
const { spawn } = require('child_process');
const http = require('http');
const assert = require('assert');
const os = require('os');
const path = require('path');
const fs = require('fs');

const PORT = 4055;
const BASE = `http://127.0.0.1:${PORT}`;
const DB_PATH = path.join(os.tmpdir(), `repiw-test-${Date.now()}.sqlite`);
const ADMIN_PASSWORD = 'test-admin-password';

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); console.log(`  \x1b[32mPASS\x1b[0m  ${name}`); pass++; }
  catch (e) { console.log(`  \x1b[31mFAIL\x1b[0m  ${name}\n        ${e.message}`); fail++; }
}
function log(msg) { console.log(`\n\x1b[36m${msg}\x1b[0m`); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function req(method, urlPath, { body, cookie } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body != null ? Buffer.from(JSON.stringify(body)) : null;
    const headers = {};
    if (payload) { headers['Content-Type'] = 'application/json'; headers['Content-Length'] = payload.length; }
    if (cookie) headers['Cookie'] = cookie;
    const r = http.request({ host: '127.0.0.1', port: PORT, path: urlPath, method, headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try { json = JSON.parse(text); } catch {}
        resolve({ status: res.statusCode, headers: res.headers, text, json, setCookie: res.headers['set-cookie'] || [] });
      });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

const server = spawn(process.execPath, ['server.js'], {
  cwd: path.join(__dirname, '..'),
  env: {
    ...process.env,
    PORT: String(PORT),
    BASE_URL: BASE,
    ADMIN_PASSWORD,
    SESSION_SECRET: 'test-session-secret-value',
    DEMO_MODE: 'true',
    NODE_ENV: 'development',
    DB_PATH,
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
server.stdout.on('data', () => {});
server.stderr.on('data', (d) => process.stderr.write('[server] ' + d));

async function waitReady(tries = 50) {
  for (let i = 0; i < tries; i++) {
    try { const r = await req('GET', '/api/demo/config'); if (r.status === 200) return true; } catch {}
    await sleep(200);
  }
  throw new Error('Server tidak siap');
}

(async function main() {
  let cookie = '';
  try {
    await waitReady();
    console.log('Server uji siap di ' + BASE);

    // ---------- Test A : Generate Card ----------
    log('Test A — Generate Card');
    let r = await req('POST', '/api/login', { body: { password: ADMIN_PASSWORD } });
    cookie = r.setCookie[0] ? r.setCookie[0].split(';')[0] : '';
    check('Login admin berhasil', () => assert.strictEqual(r.status, 200));

    r = await req('POST', '/api/admin/generate', { body: { count: 10 }, cookie });
    const items = (r.json && r.json.items) || [];
    check('Membuat 10 kartu', () => assert.strictEqual(items.length, 10));
    check('10 Card ID unik', () => assert.strictEqual(new Set(items.map((i) => i.code)).size, 10));
    check('Setiap kartu punya Activation Code', () => assert.ok(items.every((i) => typeof i.activationCode === 'string' && i.activationCode.length >= 8)));
    check('URL QR sesuai format', () => assert.ok(items.every((i) => i.qrURL === `${BASE}/c/${i.code}?src=qr`)));
    check('URL NFC sesuai format', () => assert.ok(items.every((i) => i.nfcURL === `${BASE}/c/${i.code}?src=nfc`)));

    const card = items[0], card2 = items[1];

    // ---------- Test B : Scan kartu belum aktif ----------
    log('Test B — Scan Kartu Belum Aktif');
    r = await req('GET', `/c/${card.code}?src=qr`);
    check('QR scan kartu INACTIVE membuka halaman aktivasi (200)', () => assert.strictEqual(r.status, 200));
    check('Halaman menampilkan form aktivasi', () => assert.ok(/Aktivasi kartu/i.test(r.text)));

    // ---------- Test C : Aktivasi kartu ----------
    log('Test C — Aktivasi Kartu');
    r = await req('POST', '/api/activate', {
      body: { code: card.code, activationCode: card.activationCode, reviewURL: 'https://g.page/r/repiw-demo/review' },
    });
    check('Aktivasi dengan kode benar berhasil (200)', () => assert.strictEqual(r.status, 200));
    check('Respons {ok:true}', () => assert.strictEqual(r.json.ok, true));
    const info = (await req('GET', `/api/card/${card.code}`)).json;
    check('Status kartu menjadi ACTIVE', () => assert.strictEqual(info.active, true));
    check('Activation date tercatat', () => assert.ok(info.activated_at));

    // ---------- Test D : Scan kartu aktif ----------
    log('Test D — Scan Kartu Aktif');
    r = await req('GET', `/c/${card.code}?src=qr`);
    check('QR scan kartu aktif menghasilkan redirect (302)', () => assert.strictEqual(r.status, 302));
    check('Redirect menuju halaman review demo', () => assert.ok((r.headers.location || '').includes('/demo-review')));
    r = await req('GET', `/c/${card.code}?src=nfc`);
    check('NFC tap kartu aktif menghasilkan redirect (302)', () => assert.strictEqual(r.status, 302));

    // ---------- Test E : Dashboard update ----------
    log('Test E — Dashboard Update');
    r = await req('GET', '/api/admin/stats', { cookie });
    const s = r.json;
    check('Total = 10', () => assert.strictEqual(s.total, 10));
    check('Activated = 1', () => assert.strictEqual(s.activated, 1));
    check('Inactive = 9', () => assert.strictEqual(s.inactive, 9));
    check('QR scan tercatat = 1', () => assert.strictEqual(s.qr, 1));
    check('NFC tap tercatat = 1', () => assert.strictEqual(s.nfc, 1));

    // ---------- Test F : Error handling ----------
    log('Test F — Error Handling');
    r = await req('POST', '/api/activate', {
      body: { code: card2.code, activationCode: 'KODE-SALAH', reviewURL: 'https://g.page/r/repiw-demo/review' },
    });
    check('Activation Code salah → 401', () => assert.strictEqual(r.status, 401));

    r = await req('POST', '/api/activate', {
      body: { code: 'RP-TIDAK-ADA', activationCode: 'X', reviewURL: 'https://g.page/r/repiw-demo/review' },
    });
    check('Card ID tidak ditemukan → 404', () => assert.strictEqual(r.status, 404));

    r = await req('POST', '/api/activate', {
      body: { code: card.code, activationCode: 'X', reviewURL: 'https://g.page/r/repiw-demo/review' },
    });
    check('Kartu sudah aktif → 409', () => assert.strictEqual(r.status, 409));

    r = await req('POST', '/api/activate', {
      body: { code: card2.code, activationCode: card2.activationCode, reviewURL: 'http://bukan-google.com/x' },
    });
    check('URL tidak valid → 400', () => assert.strictEqual(r.status, 400));

    r = await req('GET', '/api/admin/stats');
    check('Akses admin tanpa login → 401', () => assert.strictEqual(r.status, 401));

    // ---------- Test G : Data demo (seed & reset) ----------
    log('Test G — Seed & Reset Data Demo');
    r = await req('POST', '/api/demo/seed', { cookie });
    check('Seed data demo berhasil', () => assert.strictEqual(r.status, 200));
    check('Seed membuat 16 kartu (10 aktif, 6 nonaktif)', () => {
      assert.strictEqual(r.json.total, 16);
      assert.strictEqual(r.json.active, 10);
      assert.strictEqual(r.json.inactive, 6);
    });
    check('Seed menghasilkan kunjungan', () => assert.ok(r.json.visits > 0));
    check('Seed menyertakan activation code untuk kartu nonaktif', () => assert.ok(r.json.inactiveCards.every((c) => c.code && c.activationCode)));
    const statsSeeded = (await req('GET', '/api/admin/stats', { cookie })).json;
    check('Stats mengikuti data seed', () => assert.strictEqual(statsSeeded.total, 16));

    r = await req('POST', '/api/demo/reset', { cookie });
    check('Reset data demo berhasil', () => assert.strictEqual(r.status, 200));
    const statsReset = (await req('GET', '/api/admin/stats', { cookie })).json;
    check('Setelah reset, total kartu = 0', () => assert.strictEqual(statsReset.total, 0));

    r = await req('GET', '/api/demo/data', { cookie });
    check('Endpoint /api/demo/data tersedia (demo)', () => assert.strictEqual(r.status, 200));

    // ---------- Halaman statis ----------
    log('Test tambahan — Halaman dapat diakses');
    for (const [p, needle] of [['/', 'repiw'], ['/admin', 'Admin'], ['/flow-preview', 'Flow Preview'], ['/demo', 'Flow Preview'], ['/demo-review?card=RP-X&src=qr', 'MODE DEMO']]) {
      r = await req('GET', p);
      check(`GET ${p} → 200 & konten benar`, () => { assert.strictEqual(r.status, 200); assert.ok(r.text.includes(needle)); });
    }

    console.log(`\n\x1b[1mHasil: ${pass} lulus, ${fail} gagal\x1b[0m`);
    process.exitCode = fail ? 1 : 0;
  } catch (e) {
    console.error('\nUji berhenti karena error:', e.message);
    process.exitCode = 1;
  } finally {
    server.kill();
    await sleep(300);
    for (const f of [DB_PATH, DB_PATH + '-wal', DB_PATH + '-shm']) {
      try { fs.unlinkSync(f); } catch {}
    }
  }
})();
