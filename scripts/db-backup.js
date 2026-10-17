// Create a compressed logical backup with pg_dump.
//
//   npm run db:backup
//
// The connection string is passed via PGDATABASE (never on the command line), so it cannot be
// seen in `ps`, and it is never printed. The output file is created with mode 0600.
//
// This script only reads the database. It never drops, migrates or restores anything.
// Requiring pg_dump: Fedora `sudo dnf install postgresql`, Debian `sudo apt-get install postgresql-client`.

require('dotenv').config();
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');
const { createGzip } = require('node:zlib');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set. Nothing to back up.');
    process.exit(2);
  }

  const outDir = path.join(process.cwd(), 'backups');
  fs.mkdirSync(outDir, { recursive: true, mode: 0o700 });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outFile = path.join(outDir, `repiw-${stamp}.sql.gz`);

  const child = spawn('pg_dump', ['--no-owner', '--no-privileges', '--format=plain'], {
    env: { ...process.env, PGDATABASE: databaseUrl },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stderr = '';
  child.stderr.on('data', (chunk) => {
    stderr += String(chunk);
    if (stderr.length > 4000) stderr = stderr.slice(-4000);
  });

  // `pid` is undefined synchronously when the executable does not exist (ENOENT), so this
  // fails fast instead of writing an empty backup that looks successful.
  if (child.pid === undefined) {
    fs.rmSync(outFile, { force: true });
    console.error('Backup not started: pg_dump is not installed. Install postgresql-client and retry.');
    process.exit(1);
  }

  // Attach close BEFORE piping: a fast failure can emit `close` while the pipeline is running,
  // and a listener attached afterwards would never fire.
  const closed = new Promise((resolve) => child.on('close', (code) => resolve(code)));

  const output = fs.createWriteStream(outFile, { mode: 0o600 });

  try {
    await pipeline(child.stdout, createGzip({ level: 9 }), output);
  } catch (error) {
    fs.rmSync(outFile, { force: true });
    console.error(`Backup failed while writing: ${error.message}`);
    process.exit(1);
  }

  const code = await closed;
  const size = fs.existsSync(outFile) ? fs.statSync(outFile).size : 0;
  if (code !== 0 || size === 0) {
    fs.rmSync(outFile, { force: true });
    console.error(`pg_dump exited with code ${code}. ${stderr.trim().split('\n').slice(-3).join(' | ')}`);
    process.exit(1);
  }

  console.log(JSON.stringify({ ok: true, file: path.relative(process.cwd(), outFile), bytes: size }, null, 2));
  console.log('Store this file off-host and verify it with: gunzip -t <file>');
}

main().catch((error) => {
  console.error(`Backup failed: ${error.message}`);
  process.exit(1);
});
