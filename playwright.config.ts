import {loadEnvConfig} from '@next/env';
loadEnvConfig(process.cwd());
import {defineConfig,devices} from '@playwright/test';

// The e2e database is a dedicated test database (REPIW_TEST_DATABASE_URL), never production.
const TEST_DB=process.env.REPIW_TEST_DATABASE_URL||'';

// TRUST_PROXY is enabled for the test servers only so individual specs can isolate rate-limit
// buckets with a per-test X-Forwarded-For header. No proxy is involved; nothing in production
// changes. See docs/NFC-PHASE-2F-VERIFICATION.md.
const commonEnv={
 NODE_ENV:'development',
 SESSION_SECRET:'e2e-test-session-secret-never-use-in-prod-123456',
 DEMO_MODE:'true',
 DATABASE_URL:TEST_DB,
 REPIW_TEST_DATABASE_URL:TEST_DB,
 TRUST_PROXY:'true',
};

export default defineConfig({
 testDir:'./e2e',fullyParallel:false,timeout:90_000,reporter:'list',
 // One worker: the e2e database is a single-session in-process PostgreSQL (PGlite), so specs must
 // not run concurrently against it.
 workers:1,
 use:{baseURL:'http://127.0.0.1:3182',trace:'retain-on-failure',launchOptions:{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']},...devices['Desktop Chrome']},
 // Two app servers:
 //  3182 - resolver ENABLED, runs the migrations, serves the main flows + resolver API specs.
 //  3183 - resolver DISABLED (the production default), serves the kill-switch behaviour spec.
 // Both point at the same test database; only 3182 migrates so the two never race DDL.
 webServer:[
  {command:'node scripts/migrate-postgres.js && node scripts/seed-e2e-admin.js && npm run dev -- --hostname 127.0.0.1 --port 3182',url:'http://127.0.0.1:3182',reuseExistingServer:!process.env.CI,timeout:120_000,
   env:{...commonEnv,PORT:'3182',BASE_URL:'http://127.0.0.1:3182',REPIW_NEXT_DIST_DIR:'.next-e2e',PLAYWRIGHT_RESOLVER_ENABLED:'1',RESOLVER_TIMEOUT_MS:'45000',RESOLVER_MAX_CONCURRENCY:'1',RESOLVER_HEADLESS:'true'}},
  {command:'node scripts/wait-for-db.js && npm run dev -- --hostname 127.0.0.1 --port 3183',url:'http://127.0.0.1:3183',reuseExistingServer:!process.env.CI,timeout:120_000,
   env:{...commonEnv,PORT:'3183',BASE_URL:'http://127.0.0.1:3183',REPIW_NEXT_DIST_DIR:'.next-e2e-disabled'}},
 ]
});
