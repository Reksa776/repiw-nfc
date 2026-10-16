// DEV-ONLY: start an in-process PGlite database exposed over TCP so the app, worker and tests can
// run against a real PostgreSQL without touching any production database.
//
//   npx tsx scripts/dev-pglite-server.ts [port] [dataDir]
//
// Default: port 5433, ephemeral in-memory database (data is discarded on exit).

import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

const port = Number(process.argv[2] || 5433);
const dataDir = process.argv[3];

async function main() {
  const db = dataDir ? await PGlite.create({ dataDir }) : await PGlite.create();
  // PGlite is single-connection; the socket server multiplexes, but its concurrency defaults to
  // 1. Raise it so the app pool + worker can connect without being dropped.
  const server = new PGLiteSocketServer({ db, port, host: '127.0.0.1', maxConnections: 40 } as ConstructorParameters<typeof PGLiteSocketServer>[0]);
  await server.start();
  console.log(`[dev-pglite] listening on postgresql://postgres:postgres@127.0.0.1:${port}/postgres`);
  const shutdown = async () => {
    await server.stop();
    await db.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('[dev-pglite] failed:', error);
  process.exit(1);
});
