import {loadEnvConfig} from '@next/env';
loadEnvConfig(process.cwd());
import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./e2e',fullyParallel:false,timeout:90_000,reporter:'list',
 use:{baseURL:'http://127.0.0.1:3182',trace:'retain-on-failure',launchOptions:{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']},...devices['Desktop Chrome']},
 webServer:{command:'node scripts/migrate-postgres.js && node scripts/seed-e2e-admin.js && npm run dev -- --hostname 127.0.0.1 --port 3182',url:'http://127.0.0.1:3182',reuseExistingServer:!process.env.CI,timeout:120_000,
  env:{NODE_ENV:'development',PORT:'3182',BASE_URL:'http://127.0.0.1:3182',SESSION_SECRET:'e2e-test-session-secret-never-use-in-prod-123456',DEMO_MODE:'true',DATABASE_URL:process.env.REPIW_TEST_DATABASE_URL||'',REPIW_TEST_DATABASE_URL:process.env.REPIW_TEST_DATABASE_URL||'',TRUST_PROXY:'false',REPIW_NEXT_DIST_DIR:'.next-e2e'}}
});
