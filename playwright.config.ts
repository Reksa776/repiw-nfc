import {loadEnvConfig} from '@next/env';
loadEnvConfig(process.cwd());
import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./e2e',fullyParallel:false,timeout:90_000,reporter:'list',
 use:{baseURL:'http://127.0.0.1:3182',trace:'retain-on-failure',launchOptions:{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']},...devices['Desktop Chrome']},
 webServer:{command:'node scripts/migrate-mysql.js && node scripts/seed-e2e-admin.js && npm run dev -- --hostname 127.0.0.1 --port 3182',url:'http://127.0.0.1:3182',reuseExistingServer:!process.env.CI,timeout:120_000,
  env:{NODE_ENV:'development',PORT:'3182',BASE_URL:'http://127.0.0.1:3182',SESSION_SECRET:'e2e-test-session-secret-never-use-in-prod-123456',DEMO_MODE:'true',MYSQL_HOST:process.env.MYSQL_HOST||'127.0.0.1',MYSQL_PORT:process.env.MYSQL_PORT||'3306',MYSQL_USER:process.env.MYSQL_USER||'root',MYSQL_PASSWORD:process.env.MYSQL_PASSWORD||'',MYSQL_DATABASE:'repiw_e2e_prod',MYSQL_DEMO_DATABASE:'repiw_e2e_demo',MYSQL_SSL:process.env.MYSQL_SSL||'false',TRUST_PROXY:'false',REPIW_NEXT_DIST_DIR:'.next-e2e'}}
});
