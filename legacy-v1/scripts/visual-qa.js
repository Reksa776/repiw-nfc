#!/usr/bin/env node
/*
 * Visual QA + UX audit memakai browser sungguhan (Google Chrome headless).
 * Memerlukan: npm i -D puppeteer-core  (atau `npm i --no-save puppeteer-core`) + Google Chrome.
 *
 * Jalankan: node scripts/visual-qa.js
 * Screenshot disimpan ke folder qa-screenshots/.
 */
let puppeteer;
try { puppeteer = require('puppeteer-core'); }
catch { console.error('puppeteer-core tidak terpasang. Jalankan: npm i --no-save puppeteer-core'); process.exit(2); }

const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const CHROME = ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium'].find((p) => fs.existsSync(p));
const PORT = 4077;
const BASE = `http://127.0.0.1:${PORT}`;
const DB_PATH = path.join(os.tmpdir(), `repiw-qa-${Date.now()}.sqlite`);
const OUT = path.join(process.cwd(), 'qa-screenshots');
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  ${name}${detail ? ' — ' + detail : ''}`);
}

const server = spawn(process.execPath, ['server.js'], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(PORT), BASE_URL: BASE, ADMIN_PASSWORD: 'repiw-demo', SESSION_SECRET: 'qa-secret', DEMO_MODE: 'true', DB_PATH },
  stdio: ['ignore', 'pipe', 'pipe'],
});
server.stderr.on('data', (d) => process.stderr.write('[server] ' + d));

async function waitReady() {
  for (let i = 0; i < 60; i++) {
    try { await new Promise((res, rej) => { const r = http.get(BASE + '/api/demo/config', (x) => { x.resume(); x.statusCode === 200 ? res() : rej(); }); r.on('error', rej); }); return; } catch { await sleep(200); }
  }
  throw new Error('server tidak siap');
}
function httpPost(pathname, cookie) {
  return new Promise((resolve) => {
    const r = http.request({ host: '127.0.0.1', port: PORT, path: pathname, method: 'POST', headers: cookie ? { Cookie: cookie } : {} }, (res) => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
    r.on('error', () => resolve(0)); r.end();
  });
}

(async function main() {
  if (!CHROME) { console.error('Chrome tidak ditemukan.'); process.exit(2); }
  await waitReady();

  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  const consoleErrors = [];
  const pageErrors = [];

  async function newPage(viewport) {
    const p = await browser.newPage();
    await p.setViewport(viewport);
    p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    p.on('pageerror', (e) => pageErrors.push(e.message));
    return p;
  }
  async function newContextPage(viewport) {
    const ctx = browser.createBrowserContext ? await browser.createBrowserContext() : await browser.createIncognitoBrowserContext();
    const p = await ctx.newPage();
    await p.setViewport(viewport);
    p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    p.on('pageerror', (e) => pageErrors.push(e.message));
    return p;
  }
  const shot = async (p, name) => { await p.screenshot({ path: path.join(OUT, name), fullPage: true }); };

  try {
    // ================= DESKTOP =================
    console.log('\n\x1b[36mDesktop 1440x900 — /admin\x1b[0m');
    const admin = await newPage({ width: 1440, height: 900 });
    await admin.goto(BASE + '/admin', { waitUntil: 'networkidle0' });
    await admin.waitForSelector('#loginForm input');
    record('Halaman login admin tampil', true);
    await shot(admin, '01-admin-login.png');

    // login salah dulu
    await admin.type('#password', 'password-salah');
    await admin.click('#loginForm button');
    await sleep(500);
    const errTxt = await admin.$eval('#loginError', (e) => e.textContent).catch(() => '');
    record('Login salah menampilkan pesan error', /salah/i.test(errTxt), errTxt);

    // login benar
    await admin.$eval('#password', (el) => (el.value = ''));
    await admin.type('#password', 'repiw-demo');
    await admin.click('#loginForm button');
    await admin.waitForSelector('#app:not(.hidden)', { timeout: 5000 });
    record('Login benar membuka dashboard', true);
    await sleep(400);
    await shot(admin, '02-admin-dashboard.png');

    // seed data demo lewat sidebar Settings
    await admin.evaluate(() => [...document.querySelectorAll('.navlink')].find((b) => b.dataset.view === 'settings').click());
    await admin.waitForSelector('#demoPanel:not(.hidden)', { timeout: 4000 });
    record('Panel Data Demo tampil di Settings (DEMO_MODE)', true);
    await admin.click('#seedBtn');
    await sleep(800);
    await admin.evaluate(() => [...document.querySelectorAll('.navlink')].find((b) => b.dataset.view === 'dashboard').click());
    await sleep(600);
    const totalTxt = await admin.$eval('#total', (e) => e.textContent);
    record('Seed mengisi dashboard (Total > 0)', Number(totalTxt) > 0, 'total=' + totalTxt);
    await shot(admin, '03-admin-dashboard-seeded.png');

    // pindah Cards
    await admin.evaluate(() => [...document.querySelectorAll('.navlink')].find((b) => b.dataset.view === 'cards').click());
    await sleep(400);
    const rowCount = await admin.$$eval('#rows tr', (r) => r.length);
    record('Card Management menampilkan baris kartu', rowCount > 0, rowCount + ' baris');
    await shot(admin, '04-admin-cards.png');

    // generate cards via UI
    await admin.$eval('#count', (el) => (el.value = '10'));
    await admin.click('#generate');
    await sleep(800);
    const exportVisible = await admin.$eval('#export', (e) => !e.classList.contains('hidden'));
    record('Generate Cards menampilkan panel export CSV', exportVisible);
    const tableRows = await admin.$$eval('#rows tr', (r) => r.length);
    record('Generate menambah kartu ke tabel', tableRows > rowCount, tableRows + ' baris');

    // format desktop tidak overflow horizontal
    let overflow = await admin.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    record('Desktop: tidak ada overflow horizontal', overflow <= 2, 'delta=' + overflow);

    // ================= FLOW PREVIEW DESKTOP =================
    console.log('\n\x1b[36mDesktop 1440x900 — /flow-preview\x1b[0m');
    const flow = await newPage({ width: 1440, height: 900 });
    await flow.goto(BASE + '/flow-preview', { waitUntil: 'networkidle0' });
    await flow.waitForSelector('#demoBadge');
    await sleep(900);
    const badge = await flow.$eval('#demoBadge', (e) => e.textContent);
    record('Badge DEMO aktif', /AKTIF/i.test(badge), badge);
    record('Login demo otomatis berhasil', /berhasil/i.test(await flow.$eval('#loginState', (e) => e.textContent)));
    await shot(flow, '05-flow-admin.png');

    // seed dari flow preview
    await flow.click('#seedBtn');
    await sleep(1000);
    const sTotal = await flow.$eval('#sTotal', (e) => e.textContent);
    record('Seed di Flow Preview mengisi statistik', Number(sTotal) > 0, 'total=' + sTotal);

    // tab Pembeli
    await flow.click('.tab[data-tab="pembeli"]');
    await sleep(500);
    await flow.waitForFunction(() => document.querySelectorAll('#pickInactive option').length > 1, { timeout: 4000 });
    record('Tab Pembeli: daftar kartu INACTIVE terisi', true);
    await flow.select('#pickInactive', await flow.$eval('#pickInactive option:nth-child(1)', (o) => o.value));
    await sleep(300);
    const secretFilled = await flow.$eval('#actSecret', (e) => e.value.length > 0);
    record('Pilih kartu INACTIVE mengisi Activation Code otomatis', secretFilled);
    await flow.click('#scanInactiveQr');
    await sleep(900);
    const s1 = await flow.$eval('#screen1url', (e) => e.textContent);
    record('Simulasi QR scan menampilkan halaman aktivasi di frame', s1.includes('?src=qr'), s1);
    await shot(flow, '06-flow-pembeli.png');
    await flow.click('#activateBtn');
    await sleep(1000);
    const okMsg = await flow.$eval('#activateMsg', (e) => e.textContent);
    record('Aktivasi via UI berhasil (kartu ACTIVE)', /ACTIVE/i.test(okMsg), okMsg.trim());

    // tab Pelanggan
    await flow.click('.tab[data-tab="pelanggan"]');
    await sleep(500);
    const qrBefore = Number(await flow.$eval('#sQr', (e) => e.textContent));
    await flow.select('#pickActive', await flow.$eval('#pickActive option:nth-child(1)', (o) => o.value));
    await sleep(200);
    await flow.click('#scanActiveQr');
    await sleep(1400);
    const s2 = await flow.$eval('#screen2url', (e) => e.textContent);
    record('Simulasi QR scan kartu aktif memuat tujuan review', s2.includes('?src=qr'), s2);
    const qrAfter = Number(await flow.$eval('#sQr', (e) => e.textContent));
    record('Kunjungan QR bertambah di statistik', qrAfter > qrBefore, `${qrBefore} -> ${qrAfter}`);
    await shot(flow, '07-flow-pelanggan.png');

    // tab Analytics
    await flow.click('.tab[data-tab="analytics"]');
    await sleep(400);
    record('Tab Analytics tampil & terisi', Number(await flow.$eval('#aTotal', (e) => e.textContent)) > 0);
    await shot(flow, '08-flow-analytics.png');

    // tab Errors
    await flow.click('.tab[data-tab="errors"]');
    await sleep(300);
    await flow.click('button[data-test="wrongCode"]');
    await sleep(600);
    const errLog = await flow.$eval('#errLog', (e) => e.textContent);
    record('Error Handling: kode salah → 401 tercatat', /HTTP 401/.test(errLog));
    await flow.click('button[data-test="notFound"]');
    await flow.click('button[data-test="active"]');
    await flow.click('button[data-test="badUrl"]');
    await sleep(700);
    const errLog2 = await flow.$eval('#errLog', (e) => e.textContent);
    record('Error Handling: 404/409/400 tercatat', /HTTP 404/.test(errLog2) && /HTTP 409/.test(errLog2) && /HTTP 400/.test(errLog2));
    await shot(flow, '09-flow-errors.png');

    // ================= MOBILE =================
    console.log('\n\x1b[36mMobile 390x844\x1b[0m');
    const mAdmin = await newContextPage({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await mAdmin.goto(BASE + '/admin', { waitUntil: 'networkidle0' });
    await sleep(600);
    await mAdmin.waitForSelector('#password', { timeout: 4000 });
    await mAdmin.type('#password', 'repiw-demo');
    await mAdmin.click('#loginForm button');
    await sleep(1000);
    await mAdmin.waitForSelector('#app:not(.hidden)', { timeout: 5000 });
    let mOverflow = await mAdmin.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    record('Mobile /admin: tidak overflow horizontal', mOverflow <= 2, 'delta=' + mOverflow);
    const burgerVisible = await mAdmin.$eval('#burger', (e) => getComputedStyle(e).display !== 'none');
    record('Mobile /admin: tombol menu (burger) tampil', burgerVisible);
    await mAdmin.click('#burger'); await sleep(400);
    const sbOpen = await mAdmin.$eval('#sidebar', (e) => e.classList.contains('open'));
    record('Mobile /admin: sidebar dapat dibuka', sbOpen);
    await shot(mAdmin, '10-mobile-admin.png');

    const mFlow = await newContextPage({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await mFlow.goto(BASE + '/flow-preview', { waitUntil: 'networkidle0' });
    await sleep(1000);
    mOverflow = await mFlow.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    record('Mobile /flow-preview: tidak overflow horizontal', mOverflow <= 2, 'delta=' + mOverflow);
    await mFlow.click('.tab[data-tab="pembeli"]'); await sleep(400);
    await mFlow.click('.tab[data-tab="pelanggan"]'); await sleep(400);
    record('Mobile /flow-preview: tab dapat berganti', true);
    await shot(mFlow, '11-mobile-flow.png');

    // ================= CONSOLE HEALTH =================
    console.log('\n\x1b[36mConsole & error JS\x1b[0m');
    record('Tidak ada error JS di halaman (pageerror)', pageErrors.length === 0, pageErrors.join(' | ').slice(0, 200));
    // 401/404/409/400 adalah respons yang memang diuji (error handling & cek sesi), bukan bug.
    const realConsole = consoleErrors.filter((e) => !/favicon/.test(e) && !/Failed to load resource: the server responded with a status of (400|401|404|409)/.test(e));
    record('Tidak ada console.error tak terduga (5xx/JS)', realConsole.length === 0, realConsole.join(' | ').slice(0, 200));

    await browser.close();
  } catch (e) {
    console.error('\nQA berhenti karena error:', e.message);
    record('QA selesai tanpa error tak terduga', false, e.message);
    try { await browser.close(); } catch {}
  } finally {
    server.kill();
    await sleep(300);
    for (const f of [DB_PATH, DB_PATH + '-wal', DB_PATH + '-shm']) { try { fs.unlinkSync(f); } catch {} }
    const failed = results.filter((x) => !x.ok).length;
    console.log(`\n\x1b[1mVisual QA: ${results.length - failed} lulus, ${failed} gagal\x1b[0m`);
    console.log('Screenshot: ' + OUT);
    process.exitCode = failed ? 1 : 0;
  }
})();
