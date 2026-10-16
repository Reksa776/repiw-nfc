require('dotenv').config();

const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('crypto');
const QR = require('qrcode');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const { rateLimit } = require('express-rate-limit');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const BASE = (process.env.BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const DEMO_MODE = String(process.env.DEMO_MODE || 'false').toLowerCase() === 'true';

if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
  console.error('\n[REPIW] Konfigurasi .env belum lengkap.');
  console.error('  1. Salin .env.example menjadi .env');
  console.error('  2. Isi ADMIN_PASSWORD dan SESSION_SECRET dengan nilai acak panjang.');
  console.error('  3. Jalankan ulang: npm start\n');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Database (SQLite via Node.js built-in module - tidak perlu kompilasi native)
// Mode demo memakai file database TERPISAH agar tidak mencampur data produksi.
// ---------------------------------------------------------------------------
const DEFAULT_DB = DEMO_MODE ? path.join('data', 'repiw-demo.sqlite') : path.join('data', 'repiw.sqlite');
const DB_PATH = process.env.DB_PATH || DEFAULT_DB;
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec(`CREATE TABLE IF NOT EXISTS cards(
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  secret_hash TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 0,
  review_url TEXT,
  activated_at TEXT,
  demo INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS visits(
  id INTEGER PRIMARY KEY,
  card_id INTEGER NOT NULL,
  source TEXT NOT NULL,
  at TEXT DEFAULT CURRENT_TIMESTAMP
);`);

// Migrasi ringan: tambah kolom demo bila database lama belum memilikinya.
const cardCols = db.prepare('PRAGMA table_info(cards)').all().map((c) => c.name);
if (!cardCols.includes('demo')) db.exec('ALTER TABLE cards ADD COLUMN demo INTEGER NOT NULL DEFAULT 0');

function tx(fn) {
  db.exec('BEGIN');
  try {
    const out = fn();
    db.exec('COMMIT');
    return out;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
app.use(express.static('public'));

const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const safeEqual = (a, b) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
const cardURL = (code, src) => `${BASE}/c/${encodeURIComponent(code)}?src=${src}`;
const cookies = (req) =>
  Object.fromEntries(
    (req.headers.cookie || '')
      .split(';')
      .map((x) => x.trim().split('=').map(decodeURIComponent))
      .filter((x) => x.length === 2)
  );

function signedSession() {
  const expiry = Date.now() + 86400000;
  const body = String(expiry);
  return `${body}.${crypto.createHmac('sha256', process.env.SESSION_SECRET).update(body).digest('hex')}`;
}
function admin(req, res, next) {
  const v = cookies(req).repiw_session || '';
  const [expiry, sig] = v.split('.');
  if (
    !expiry || !sig || Number(expiry) < Date.now() ||
    !safeEqual(sig, crypto.createHmac('sha256', process.env.SESSION_SECRET).update(expiry).digest('hex'))
  ) return res.status(401).json({ error: 'Silakan login admin.' });
  next();
}
function sessionCookie(res) {
  return { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', maxAge: 86400000, path: '/' };
}

const limit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });

function stats() {
  const x = db.prepare('SELECT COUNT(*) total, COALESCE(SUM(active),0) activated FROM cards').get();
  const y = db.prepare('SELECT source, COUNT(*) n FROM visits GROUP BY source').all();
  return {
    total: x.total,
    activated: x.activated,
    inactive: x.total - x.activated,
    nfc: y.find((v) => v.source === 'nfc')?.n || 0,
    qr: y.find((v) => v.source === 'qr')?.n || 0,
  };
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
app.post('/api/login', limit, (req, res) => {
  if (!safeEqual(String(req.body.password || ''), process.env.ADMIN_PASSWORD))
    return res.status(401).json({ error: 'Password salah' });
  res.cookie('repiw_session', signedSession(), sessionCookie(res)).json({ ok: true });
});
app.post('/api/logout', admin, (req, res) => res.clearCookie('repiw_session', { path: '/' }).json({ ok: true }));

// Demo-only convenience login: hanya aktif bila DEMO_MODE=true.
app.post('/api/demo/login', (req, res) => {
  if (!DEMO_MODE) return res.status(404).json({ error: 'Mode demo tidak aktif' });
  res.cookie('repiw_session', signedSession(), sessionCookie(res)).json({ ok: true, demo: true });
});
app.get('/api/demo/config', (req, res) =>
  res.json({
    demo: DEMO_MODE,
    base: BASE,
    dbFile: path.basename(DB_PATH),
    adminURL: `${BASE}/admin`,
    flowURL: `${BASE}/flow-preview`,
  }));

// ---------------------------------------------------------------------------
// Data demo (hanya aktif bila DEMO_MODE=true). Tidak menyentuh baris non-demo.
// ---------------------------------------------------------------------------
const DEMO_REVIEWS = [
  'https://g.page/r/repiw-demo-kopi/review',
  'https://maps.app.goo.gl/repiwDemoCafe',
  'https://www.google.com/maps/place/Repiw+Demo+Barbershop',
  'https://g.page/r/repiw-demo-laundry/review',
  'https://maps.app.goo.gl/repiwDemoBakery',
  'https://g.page/r/repiw-demo-salon/review',
];
const fmtDate = (d) => d.toISOString().slice(0, 19).replace('T', ' ');

function resetDemo() {
  tx(() => {
    db.prepare('DELETE FROM visits WHERE card_id IN (SELECT id FROM cards WHERE demo=1)').run();
    db.prepare('DELETE FROM cards WHERE demo=1').run();
  });
}

function seedDemo() {
  const now = Date.now();
  return tx(() => {
    db.prepare('DELETE FROM visits WHERE card_id IN (SELECT id FROM cards WHERE demo=1)').run();
    db.prepare('DELETE FROM cards WHERE demo=1').run();
    const insertCard = db.prepare(
      'INSERT INTO cards(code,secret_hash,active,review_url,activated_at,demo,created_at) VALUES (?,?,?,?,?,1,?)'
    );
    const insertVisit = db.prepare('INSERT INTO visits(card_id,source,at) VALUES (?,?,?)');
    const TOTAL = 16, ACTIVE = 10;
    const inactiveCards = [];
    let activeCount = 0, visitCount = 0;
    for (let i = 0; i < TOTAL; i++) {
      const code = 'RP-' + crypto.randomBytes(5).toString('hex').toUpperCase();
      const secret = crypto.randomBytes(6).toString('hex').toUpperCase();
      const created = new Date(now - (5 + Math.floor(Math.random() * 45)) * 86400000);
      const isActive = i < ACTIVE;
      let reviewUrl = null, activatedAt = null;
      if (isActive) {
        reviewUrl = DEMO_REVIEWS[i % DEMO_REVIEWS.length];
        activatedAt = new Date(Math.min(created.getTime() + (1 + Math.floor(Math.random() * 8)) * 86400000, now - 3600000));
      }
      insertCard.run(code, sha(secret), isActive ? 1 : 0, reviewUrl, activatedAt ? fmtDate(activatedAt) : null, fmtDate(created));
      const { id } = db.prepare('SELECT id FROM cards WHERE code=?').get(code);
      if (isActive) {
        activeCount++;
        const nfc = Math.floor(Math.random() * 35) + 3;
        const qr = Math.floor(Math.random() * 55) + 5;
        const start = activatedAt.getTime();
        const span = Math.max(now - start, 3600000);
        for (let k = 0; k < nfc; k++) insertVisit.run(id, 'nfc', fmtDate(new Date(start + Math.random() * span)));
        for (let k = 0; k < qr; k++) insertVisit.run(id, 'qr', fmtDate(new Date(start + Math.random() * span)));
        visitCount += nfc + qr;
      } else {
        inactiveCards.push({ code, activationCode: secret });
      }
    }
    return { total: TOTAL, active: activeCount, inactive: inactiveCards.length, visits: visitCount, inactiveCards };
  });
}

app.post('/api/demo/seed', admin, (req, res) => {
  if (!DEMO_MODE) return res.status(404).json({ error: 'Mode demo tidak aktif' });
  res.json({ ok: true, ...seedDemo() });
});
app.post('/api/demo/reset', admin, (req, res) => {
  if (!DEMO_MODE) return res.status(404).json({ error: 'Mode demo tidak aktif' });
  resetDemo();
  res.json({ ok: true });
});
app.get('/api/demo/data', admin, (req, res) => {
  if (!DEMO_MODE) return res.status(404).json({ error: 'Mode demo tidak aktif' });
  const inactiveCodes = db.prepare('SELECT code FROM cards WHERE demo=1 AND active=0').all().map((c) => c.code);
  res.json({ demo: true, inactiveCodes });
});

// ---------------------------------------------------------------------------
// Admin API
// ---------------------------------------------------------------------------
app.get('/api/admin/stats', admin, (req, res) => res.json(stats()));

app.get('/api/admin/cards', admin, (req, res) =>
  res.json(
    db.prepare(`SELECT c.code, c.active, c.demo, c.activated_at, c.created_at,
      (SELECT COUNT(*) FROM visits v WHERE v.card_id=c.id AND v.source='nfc') nfc,
      (SELECT COUNT(*) FROM visits v WHERE v.card_id=c.id AND v.source='qr') qr
      FROM cards c ORDER BY c.id DESC`).all()
  )
);

app.post('/api/admin/generate', admin, (req, res) => {
  const n = Number(req.body.count);
  if (!Number.isInteger(n) || n < 1 || n > 100)
    return res.status(400).json({ error: 'Jumlah 1–100 per batch' });
  const insert = db.prepare('INSERT INTO cards(code,secret_hash,demo) VALUES (?,?,?)');
  const items = [];
  tx(() => {
    for (let i = 0; i < n; i++) {
      const code = 'RP-' + crypto.randomBytes(5).toString('hex').toUpperCase();
      const secret = crypto.randomBytes(6).toString('hex').toUpperCase();
      insert.run(code, sha(secret), DEMO_MODE ? 1 : 0);
      items.push({ code, activationCode: secret, qrURL: cardURL(code, 'qr'), nfcURL: cardURL(code, 'nfc') });
    }
  });
  res.json({ items, notice: 'Simpan CSV sekarang. Activation code tidak dapat dilihat ulang.' });
});

app.get('/api/admin/qr/:code', admin, async (req, res) => {
  const c = db.prepare('SELECT code FROM cards WHERE code=?').get(req.params.code);
  if (!c) return res.sendStatus(404);
  res.type('png').send(await QR.toBuffer(cardURL(c.code, 'qr'), { width: 1000, margin: 3, errorCorrectionLevel: 'H' }));
});

app.get('/api/admin/qr-zip', admin, async (req, res) => {
  const cards = db.prepare('SELECT code FROM cards ORDER BY id').all();
  res.attachment('repiw-qr.zip');
  const z = archiver('zip');
  z.on('error', () => res.destroy());
  z.pipe(res);
  for (const c of cards)
    z.append(await QR.toBuffer(cardURL(c.code, 'qr'), { width: 1000, margin: 3, errorCorrectionLevel: 'H' }), {
      name: c.code + '.png',
    });
  await z.finalize();
});

// Info kartu publik (tanpa data sensitif) untuk keperluan preview/demo.
app.get('/api/card/:code', (req, res) => {
  const c = db.prepare('SELECT code, active, demo, activated_at FROM cards WHERE code=?').get(req.params.code);
  if (!c) return res.status(404).json({ error: 'Kartu tidak ditemukan' });
  res.json({ code: c.code, active: !!c.active, demo: !!c.demo, activated_at: c.activated_at });
});

// ---------------------------------------------------------------------------
// Alur kartu (scan QR / tap NFC)
// ---------------------------------------------------------------------------
app.get('/c/:code', (req, res) => {
  const c = db.prepare('SELECT * FROM cards WHERE code=?').get(req.params.code);
  if (!c) return res.status(404).send('Kartu tidak ditemukan');
  const source = req.query.src === 'nfc' ? 'nfc' : 'qr';
  if (c.active) {
    db.prepare('INSERT INTO visits(card_id,source) VALUES (?,?)').run(c.id, source);
    if (DEMO_MODE) return res.redirect(302, `/demo-review?card=${encodeURIComponent(c.code)}&src=${source}`);
    return res.redirect(302, c.review_url);
  }
  res.sendFile(path.join(__dirname, 'public', 'activate.html'));
});

function validReview(s) {
  try {
    const u = new URL(s);
    return (
      u.protocol === 'https:' &&
      ['g.page', 'google.com', 'www.google.com', 'maps.google.com', 'maps.app.goo.gl'].includes(u.hostname) &&
      !u.username && !u.password
    );
  } catch {
    return false;
  }
}

app.post('/api/activate', limit, (req, res) => {
  const { code, activationCode, reviewURL } = req.body || {};
  const c = db.prepare('SELECT * FROM cards WHERE code=?').get(String(code || ''));
  if (!c) return res.status(404).json({ error: 'Kartu tidak ditemukan' });
  if (c.active) return res.status(409).json({ error: 'Kartu sudah aktif' });
  if (!safeEqual(c.secret_hash, sha(String(activationCode || '').toUpperCase())))
    return res.status(401).json({ error: 'Kode aktivasi salah' });
  if (!validReview(String(reviewURL || '')))
    return res.status(400).json({ error: 'Gunakan link Google Review HTTPS yang valid' });
  db.prepare('UPDATE cards SET active=1,review_url=?,activated_at=CURRENT_TIMESTAMP WHERE id=? AND active=0')
    .run(reviewURL, c.id);
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Halaman statis
// ---------------------------------------------------------------------------
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get(['/flow-preview', '/demo'], (req, res) => res.sendFile(path.join(__dirname, 'public', 'flow-preview.html')));
app.get('/demo-review', (req, res) => res.sendFile(path.join(__dirname, 'public', 'demo-review.html')));

app.listen(PORT, () => {
  console.log('Repiw ready: ' + BASE);
  console.log(`  Dashboard    : ${BASE}/admin`);
  console.log(`  Flow Preview : ${BASE}/flow-preview`);
  console.log(`  DEMO_MODE    : ${DEMO_MODE}`);
});
