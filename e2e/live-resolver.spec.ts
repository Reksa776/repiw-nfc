import {test,expect,type Page} from '@playwright/test';
import {execFile,execSync} from 'node:child_process';
import {promisify} from 'node:util';
import {Pool} from 'pg';

// LIVE spec — it performs real network calls to Google and launches headless Chromium, so it is
// explicitly separated from the mocked suites and skipped unless RESOLVER_LIVE=1 is set:
//
//   RESOLVER_LIVE=1 npx playwright test e2e/live-resolver.spec.ts
//
// It does not hardcode an expected Place ID: it asserts the SHAPE and the Google-derived origin of
// whatever the resolver returns, and that the returned review URL is built from that same id.

const run=promisify(execFile);
const TEST_DB=process.env.REPIW_TEST_DATABASE_URL||'';
const SHORT_LINK='https://maps.app.goo.gl/HihE1JQdDmzBDCVC8';
let ipCounter=0;
function nextIp(){ipCounter+=1;return `203.0.113.${ipCounter%250}`;}
function ip(){return {'x-forwarded-for':nextIp()};}

async function login(page:Page){
 await page.setExtraHTTPHeaders({'x-forwarded-for':nextIp()});
 // Language-agnostic selectors: the UI can be in Indonesian or English.
 await page.goto('/admin');
 await page.locator('input[autocomplete=username]').fill('admin');
 await page.locator('input[type=password]').fill('e2e-test-admin-password');
 await page.locator('button.login-submit').click();
 await expect(page.locator('.dashboard')).toBeVisible({timeout:30_000});
}

/**
 * The set of Chromium profile directories currently in use. Each Playwright launch creates its own
 * /tmp/playwright_chromiumdev_profile-XXXX, so comparing the set before and after the worker runs
 * distinguishes the worker's browser from the test runner's own browser (which is always running).
 */
function chromiumProfileDirs():string[]{
 try{
  const dirs=new Set<string>();
  for(const line of execSync('ps -eo args=',{encoding:'utf8'}).split('\n')){
   const match=line.match(/\/tmp\/playwright_chromiumdev_profile-[A-Za-z0-9]+/);
   if(match)dirs.add(match[0]);
  }
  return [...dirs].sort();
 }catch{return [];}
}

test.describe.configure({mode:'serial'});
test.skip(process.env.RESOLVER_LIVE!=='1','Live Google resolution test — set RESOLVER_LIVE=1 to run');

test('a Google Maps share link resolves to a genuine Place ID and activates the card',async({page})=>{
 test.setTimeout(300_000);
 await login(page);
 const generated=await page.request.post('/api/admin/generate',{data:{count:1}});
 const [card]=await generated.json().then(b=>b.items as Array<{code:string;activationCode:string}>);

 const queued=await page.request.post('/api/resolve',{headers:ip(),data:{url:SHORT_LINK,code:card.code,activationCode:card.activationCode}});
 expect(queued.status()).toBe(200);
 const {jobToken}=await queued.json();
 // Snapshot the browsers already running (this test's own) before the worker launches its own.
 const browserProfilesBefore=chromiumProfileDirs();
 expect(browserProfilesBefore.length).toBeGreaterThan(0);

 // Drive the worker exactly like production does: a separate process over the shared database.
 // DATABASE_URL is pinned to the TEST database so the worker can never touch production.
 const worker=await run('npx',['--no-install','tsx','scripts/resolver-worker.ts','--once'],{
  cwd:process.cwd(),
  timeout:240_000,
  env:{...process.env,DATABASE_URL:TEST_DB,PLAYWRIGHT_RESOLVER_ENABLED:'1',RESOLVER_TIMEOUT_MS:'60000',RESOLVER_MAX_CONCURRENCY:'1'},
 });
 expect(worker.stdout).toContain('--once complete');

 const job=await (await page.request.get(`/api/resolve/${encodeURIComponent(jobToken)}`)).json();
 expect(job.status).toBe('success');
 expect(job.placeId).toMatch(/^[A-Za-z0-9_-]{20,255}$/);
 expect(job.placeId.startsWith('ChIJ')).toBe(true);
 expect(job.reviewUrl).toBe(`https://search.google.com/local/writereview?placeid=${job.placeId}`);
 expect(job.businessName).toBeTruthy();
 expect(job.method).toBe('playwright');

 // End-to-end: activate the card with the verified destination.
 const activated=await page.request.post('/api/activate',{headers:ip(),data:{code:card.code,activationCode:card.activationCode,reviewURL:job.reviewUrl,resolutionJobToken:jobToken}});
 expect(activated.status()).toBe(200);

 const db=new Pool({connectionString:TEST_DB,max:1});
 try{
  const {rows}=await db.query('SELECT active,review_url,place_id,resolution_status,resolved_business_name FROM cards WHERE code=$1',[card.code]);
  expect(rows[0].active).toBe(1);
  expect(rows[0].review_url).toBe(job.reviewUrl);
  expect(rows[0].place_id).toBe(job.placeId);
  expect(rows[0].resolution_status).toBe('verified');
  expect(rows[0].resolved_business_name).toBeTruthy();
 }finally{await db.end();}

 // Cleanup guarantee: the worker launched its own Chromium and left no process behind. Only the
 // test runner's pre-existing browser profile may still be present.
 await new Promise((resolve)=>setTimeout(resolve,2000));
 expect(chromiumProfileDirs()).toEqual(browserProfilesBefore);
});
