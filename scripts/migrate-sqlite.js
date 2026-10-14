const { loadEnvConfig } = require('@next/env');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

loadEnvConfig(process.cwd());
const demo = process.env.DEMO_MODE === 'true';
const configured = process.env.DB_PATH || (demo ? './data/repiw-demo.sqlite' : './data/repiw.sqlite');
const requested = process.argv[2] || configured;
if (requested === ':memory:') throw new Error('Migrations require a persistent SQLite file.');
const target = path.resolve(requested);
fs.mkdirSync(path.dirname(target), { recursive: true });
const existed = fs.existsSync(target) && fs.statSync(target).size > 0;
const db = new DatabaseSync(target);
let backup = null;
try {
  db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
  const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(x => x.name));
  const empty = tables.size === 0;
  if (!empty && (!tables.has('cards') || !tables.has('visits'))) {
    throw new Error('This database is not empty but is missing REPIW cards or visits tables; refusing to modify it.');
  }
  let before = { cards: 0, visits: 0 };
  if (!empty) before = {
    cards: db.prepare('SELECT COUNT(*) n FROM cards').get().n,
    visits: db.prepare('SELECT COUNT(*) n FROM visits').get().n,
  };
  if (existed) {
    const stamp = new Date().toISOString().replaceAll(':', '').replaceAll('.', '');
    backup = `${target}.backup-${stamp}-${process.pid}`;
    db.exec(`VACUUM INTO '${backup.replaceAll("'", "''")}'`);
  }
  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS cards(
        id INTEGER PRIMARY KEY, code TEXT UNIQUE NOT NULL, secret_hash TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 0, review_url TEXT, activated_at TEXT,
        demo INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS visits(
        id INTEGER PRIMARY KEY, card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
        source TEXT NOT NULL CHECK(source IN ('qr','nfc')), at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS admins(
        id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS sessions(id_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS rate_events(bucket TEXT NOT NULL, at INTEGER NOT NULL);
    `);
    const cardCols = db.prepare('PRAGMA table_info(cards)').all();
    if (!cardCols.some(c => c.name === 'demo')) db.exec('ALTER TABLE cards ADD COLUMN demo INTEGER NOT NULL DEFAULT 0');
    const sessionCols = db.prepare('PRAGMA table_info(sessions)').all();
    if (!sessionCols.some(c => c.name === 'admin_id')) db.exec('ALTER TABLE sessions ADD COLUMN admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE');
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rate_events_bucket_at ON rate_events(bucket, at);
      CREATE INDEX IF NOT EXISTS idx_sessions_admin ON sessions(admin_id);
      CREATE INDEX IF NOT EXISTS idx_visits_card_source ON visits(card_id,source);
      CREATE INDEX IF NOT EXISTS idx_cards_created ON cards(created_at);
      PRAGMA user_version=3;
    `);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  const integrity = db.prepare('PRAGMA integrity_check').get().integrity_check;
  const after = {
    cards: db.prepare('SELECT COUNT(*) n FROM cards').get().n,
    visits: db.prepare('SELECT COUNT(*) n FROM visits').get().n,
  };
  if (integrity !== 'ok' || before.cards !== after.cards || before.visits !== after.visits) {
    throw new Error('Post-migration verification failed. Keep the generated backup and restore it before starting the app.');
  }
  console.log(JSON.stringify({ ok:true, database:target, backup, userVersion:3, rows:after, integrity }, null, 2));
} finally {
  db.close();
}
