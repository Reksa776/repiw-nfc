import {test,expect,type Page} from '@playwright/test';
import {execSync} from 'node:child_process';
import crypto from 'node:crypto';
import {Pool} from 'pg';

// API integration spec (mocked / no network to Google).
// The resolution jobs it consumes are seeded directly in the database, so the assertions cover the
// server-side contract — job binding, expiry, tampering, one-time activation — without depending on
// live Google scraping. The live counterpart lives in e2e/live-resolver.spec.ts.

const TEST_DB=process.env.REPIW_TEST_DATABASE_URL||'';
const SHORT_LINK='https://maps.app.goo.gl/HihE1JQdDmzBDCVC8';
// A plausible-place-id fixture. It is NOT asserted to be the real Place ID of the shortlink above.
const PLACE_ID='ChIJQeGqDPodby4RQBEuhEv7Zjs';
const REVIEW_URL=`https://search.google.com/local/writereview?placeid=${PLACE_ID}`;
const OTHER_REVIEW_URL='https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4';
const TOKEN_PATTERN=/^[A-Za-z0-9_-]{20,64}$/;

let ipCounter=0;
/** Unique rate-limit bucket per request; the test servers trust X-Forwarded-For. */
function nextIp(){ipCounter+=1;return `198.51.100.${ipCounter%250}`;}
function ip(){return {'x-forwarded-for':nextIp()};}

function pool(){return new Pool({connectionString:TEST_DB,max:2,application_name:'repiw-e2e-resolver'});}

/** Insert a terminal resolution job exactly as the worker would leave it. */
async function seedJob(job:{cardCode:string|null;inputUrl:string;status?:string;reviewUrl?:string|null;placeId?:string|null;expiresInterval?:string;businessName?:string|null}){
 const db=pool();
 try{
  const token=crypto.randomBytes(32).toString('base64url');
  const binding=crypto.createHash('sha256').update(`${job.cardCode??'*'}|${job.inputUrl.trim()}`).digest('hex');
  const {rows}=await db.query(
   `INSERT INTO resolution_jobs(job_token,status,input_url,binding_hash,card_code,created_by,place_id,review_url,business_name,business_address,method,attempts,started_at,finished_at,expires_at)
    VALUES($1,$2,$3,$4,$5,'test',$6,$7,$8,'Jl. Test No. 1, Kota Test 12345','playwright',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP + $9::interval)
    RETURNING job_token`,
   // A job only counts as successful when it carries a Google review URL and its Place ID, so the
   // helper defaults to those and callers override them to build deliberately broken fixtures.
   [token,job.status??'success',job.inputUrl,binding,job.cardCode,job.placeId===undefined?PLACE_ID:job.placeId,job.reviewUrl===undefined?REVIEW_URL:job.reviewUrl,job.businessName??null,job.expiresInterval??'15 minutes']);
  return rows[0].job_token as string;
 }finally{await db.end();}
}

async function cardRow(code:string){
 const db=pool();
 try{
  const {rows}=await db.query('SELECT id,code,active,review_url,place_id,source_url,resolution_status,resolution_method,resolved_business_name FROM cards WHERE code=$1',[code]);
  return rows[0];
 }finally{await db.end();}
}

async function visitCount(code:string){
 const db=pool();
 try{
  const {rows}=await db.query('SELECT COUNT(*)::int AS n FROM visits v JOIN cards c ON c.id=v.card_id WHERE c.code=$1',[code]);
  return rows[0].n as number;
 }finally{await db.end();}
}

async function auditCount(code:string){
 const db=pool();
 try{
  const {rows}=await db.query('SELECT COUNT(*)::int AS n FROM resolution_audit WHERE card_code=$1 AND action=$2',[code,'destination.update']);
  return rows[0].n as number;
 }finally{await db.end();}
}

async function login(page:Page){
 // Each test logs in from its own rate-limit bucket so the login limiter is never the thing under
 // test here (it has its own dedicated coverage).
 await page.setExtraHTTPHeaders({'x-forwarded-for':nextIp()});
 // Language-agnostic selectors: the UI can be in Indonesian or English.
 await page.goto('/admin');
 await page.locator('input[autocomplete=username]').fill('admin');
 await page.locator('input[type=password]').fill('e2e-test-admin-password');
 await page.locator('button.login-submit').click();
 await expect(page.locator('.dashboard')).toBeVisible({timeout:30_000});
}

/** Generate `count` inactive demo cards and return their codes + one-time activation codes. */
async function generate(page:Page,count:number){
 const res=await page.request.post('/api/admin/generate',{data:{count}});
 expect(res.status()).toBe(200);
 const {items}=await res.json();
 expect(items).toHaveLength(count);
 return items as Array<{code:string;activationCode:string}>;
}

function chromiumProcesses():number{
 try{
  const out=execSync('ps -eo args=',{encoding:'utf8'});
  return out.split('\n').filter(line=>line.includes('playwright_chromiumdev_profile')).length;
 }catch{return 0;}
}

test.describe.configure({mode:'serial'});
test.skip(!TEST_DB,'REPIW_TEST_DATABASE_URL is required for the resolver integration spec');

test('async resolution request is queued without running a browser, and duplicates are reused',async({page})=>{
 await login(page);
 const [card]=await generate(page,1);

 const started=Date.now();
 const res=await page.request.post('/api/resolve',{headers:ip(),data:{url:SHORT_LINK,code:card.code,activationCode:card.activationCode}});
 const elapsed=Date.now()-started;
 expect(res.status()).toBe(200);
 const body=await res.json();
 expect(body.jobToken).toMatch(TOKEN_PATTERN);
 expect(body.reused).toBe(false);
 expect(body.cardCode).toBe(card.code);
 // Chromium must never run inside the request path: enqueueing is a pure database write.
 expect(elapsed).toBeLessThan(5000);

 const status=await page.request.get(`/api/resolve/${encodeURIComponent(body.jobToken)}`);
 expect(status.status()).toBe(200);
 const job=await status.json();
 expect(['pending','running']).toContain(job.status);
 expect(job.placeId).toBeNull();
 expect(job.reviewUrl).toBeNull();

 // A second request for the same card + URL must reuse the in-flight job.
 const again=await page.request.post('/api/resolve',{headers:ip(),data:{url:SHORT_LINK,code:card.code,activationCode:card.activationCode}});
 expect(again.status()).toBe(200);
 const againBody=await again.json();
 expect(againBody.reused).toBe(true);
 expect(againBody.jobToken).toBe(body.jobToken);

 // Expiry is exposed to the caller so the UI can time out.
 expect(new Date(againBody.expiresAt).getTime()).toBeGreaterThan(Date.now());
});

test('resolution requests reject non-Google and unauthenticated callers',async({page,request})=>{
 await login(page);
 const [card]=await generate(page,1);

 const lookalike=await page.request.post('/api/resolve',{headers:ip(),data:{url:'https://google.com.attacker.example/maps/place/x'}});
 expect(lookalike.status()).toBe(400);
 const foreign=await page.request.post('/api/resolve',{headers:ip(),data:{url:'https://evil.example/maps/place/x'}});
 expect(foreign.status()).toBe(400);
 const insecure=await page.request.post('/api/resolve',{headers:ip(),data:{url:'http://maps.app.goo.gl/HihE1JQdDmzBDCVC8'}});
 expect(insecure.status()).toBe(400);

 // Without an admin session the resolver requires the card code AND its one-time activation code.
 const unauthenticated=await request.post('/api/resolve',{headers:ip(),data:{url:SHORT_LINK}});
 expect(unauthenticated.status()).toBe(400);
 const wrongCode=await request.post('/api/resolve',{headers:ip(),data:{url:SHORT_LINK,code:card.code,activationCode:'ZZZZ'}});
 expect(wrongCode.status()).toBe(401);
});

test('rate limiting bounds repeated resolve requests',async({page})=>{
 await login(page);
 const [card]=await generate(page,1);
 const headers=ip();
 let limited=0;
 for(let i=0;i<11;i++){
  const res=await page.request.post('/api/resolve',{headers,data:{url:SHORT_LINK,code:card.code,activationCode:card.activationCode}});
  if(res.status()===429)limited++;
 }
 // Limit is 10 per 15 minutes for the same IP bucket.
 expect(limited).toBeGreaterThanOrEqual(1);
});

test('verified resolution job activates a card exactly once and stores provenance',async({page})=>{
 await login(page);
 const [card]=await generate(page,1);
 const token=await seedJob({cardCode:card.code,inputUrl:SHORT_LINK,businessName:'Universitas Islam Negeri Siber Syekh Nurjati Cirebon (UINSSC)'});

 const res=await page.request.post('/api/activate',{headers:ip(),data:{code:card.code,activationCode:card.activationCode,reviewURL:REVIEW_URL,resolutionJobToken:token}});
 const raw=await res.text();
 expect(res.status(),`activation rejected: ${raw}`).toBe(200);
 expect(JSON.parse(raw).reviewURL).toBe(REVIEW_URL);

 const row=await cardRow(card.code);
 expect(row.active).toBe(1);
 expect(row.review_url).toBe(REVIEW_URL);
 expect(row.place_id).toBe(PLACE_ID);
 expect(row.source_url).toBe(SHORT_LINK);
 expect(row.resolution_status).toBe('verified');
 expect(row.resolution_method).toBe('playwright');
 expect(row.resolved_business_name).toContain('Nurjati');

 // The one-time code is consumed: replaying the exact same request must fail.
 const replay=await page.request.post('/api/activate',{headers:ip(),data:{code:card.code,activationCode:card.activationCode,reviewURL:REVIEW_URL,resolutionJobToken:token}});
 expect(replay.status()).toBe(409);

 // The client-visible destination endpoint reports the verified destination + provenance.
 const destination=await page.request.get(`/api/admin/cards/${card.code}/destination`);
 expect(destination.status()).toBe(200);
 const {card:reported}=await destination.json();
 expect(reported.review_url).toBe(REVIEW_URL);
 expect(reported.place_id).toBe(PLACE_ID);
});

test('a resolution job cannot be reused for another card, another URL, or after expiry',async({page})=>{
 await login(page);
 const [owner,other,expired,unverified,raw]=await generate(page,5);

 // Bound to a different card.
 const otherToken=await seedJob({cardCode:owner.code,inputUrl:SHORT_LINK});
 const wrongCard=await page.request.post('/api/activate',{headers:ip(),data:{code:other.code,activationCode:other.activationCode,reviewURL:REVIEW_URL,resolutionJobToken:otherToken}});
 expect(wrongCard.status()).toBe(403);

 // Tampered destination: the submitted URL must equal the job's verified URL.
 const tampered=await page.request.post('/api/activate',{headers:ip(),data:{code:owner.code,activationCode:owner.activationCode,reviewURL:OTHER_REVIEW_URL,resolutionJobToken:otherToken}});
 expect(tampered.status()).toBe(400);

 // Expired job.
 const expiredToken=await seedJob({cardCode:expired.code,inputUrl:SHORT_LINK,expiresInterval:'-1 minute'});
 const stale=await page.request.post('/api/activate',{headers:ip(),data:{code:expired.code,activationCode:expired.activationCode,reviewURL:REVIEW_URL,resolutionJobToken:expiredToken}});
 expect(stale.status()).toBe(409);

 // A job that claims success but carries a Maps link is never accepted as a verified review URL.
 const unverifiedToken=await seedJob({cardCode:unverified.code,inputUrl:SHORT_LINK,reviewUrl:SHORT_LINK,placeId:null});
 const notVerified=await page.request.post('/api/activate',{headers:ip(),data:{code:unverified.code,activationCode:unverified.activationCode,reviewURL:SHORT_LINK,resolutionJobToken:unverifiedToken}});
 expect(notVerified.status()).toBe(409);

 // A raw Google Maps share link can never be stored as the card destination.
 const mapsLink=await page.request.post('/api/activate',{headers:ip(),data:{code:raw.code,activationCode:raw.activationCode,reviewURL:SHORT_LINK}});
 expect(mapsLink.status()).toBe(400);
 expect((await cardRow(raw.code)).active).toBe(0);

 // Unknown / forged job tokens are rejected, never trusted from the client.
 const forged=await page.request.post('/api/activate',{headers:ip(),data:{code:raw.code,activationCode:raw.activationCode,reviewURL:REVIEW_URL,resolutionJobToken:crypto.randomBytes(32).toString('base64url')}});
 expect(forged.status()).toBe(400);
 expect((await cardRow(raw.code)).active).toBe(0);
});

test('manual official review URLs still activate, and the tap path stays browser-free',async({page})=>{
 await login(page);
 const [card]=await generate(page,1);

 const manual=await page.request.post('/api/activate',{headers:ip(),data:{code:card.code,activationCode:card.activationCode,reviewURL:REVIEW_URL}});
 expect(manual.status()).toBe(200);
 expect((await cardRow(card.code)).resolution_method).toBe('manual');

 const before=chromiumProcesses();
 const started=Date.now();
 await page.goto(`/c/${card.code}?src=nfc`);
 const elapsed=Date.now()-started;
 // Demo mode redirects active cards to the local simulation page; production redirects to the
 // stored review URL. Either way the tap path is a plain redirect with no browser automation.
 await expect(page).toHaveURL(new RegExp(`/demo-review\\?card=${card.code}&src=nfc`));
 expect(elapsed).toBeLessThan(10_000);
 expect(chromiumProcesses()).toBe(before);
 expect(await visitCount(card.code)).toBeGreaterThanOrEqual(1);
});

test('the admin destination editor previews and saves a new destination through the UI',async({page})=>{
 await login(page);
 const [card]=await generate(page,1);
 expect((await page.request.post('/api/activate',{headers:ip(),data:{code:card.code,activationCode:card.activationCode,reviewURL:REVIEW_URL}})).status()).toBe(200);

 await page.goto('/admin');
 await page.locator('aside .nav-item').nth(1).click();
 const editButton=page.locator('.card-actions button.destination-edit').first();
 await expect(editButton).toBeVisible({timeout:30_000});
 await editButton.click();

 const editor=page.locator('section.destination-editor');
 await expect(editor).toBeVisible();
 await expect(editor).toContainText(REVIEW_URL);
 await editor.locator('input[type=text]').fill(OTHER_REVIEW_URL);
 await editor.locator('button.destination-resolve').click();

 // Preview shows the old and the new destination, and nothing is written yet.
 const preview=editor.locator('.destination-preview');
 await expect(preview).toBeVisible({timeout:30_000});
 await expect(preview).toContainText(REVIEW_URL);
 await expect(preview).toContainText(OTHER_REVIEW_URL);
 expect((await cardRow(card.code)).review_url).toBe(REVIEW_URL);

 await preview.locator('button.destination-confirm').click();
 await expect(page.locator('.success.banner')).toBeVisible({timeout:30_000});
 expect((await cardRow(card.code)).review_url).toBe(OTHER_REVIEW_URL);
 expect((await cardRow(card.code)).code).toBe(card.code);
});

test('destination update previews before writing and preserves code, activation and analytics',async({page})=>{
 await login(page);
 const [card]=await generate(page,1);
 const token=await seedJob({cardCode:card.code,inputUrl:SHORT_LINK,businessName:'A Business'});
 expect((await page.request.post('/api/activate',{headers:ip(),data:{code:card.code,activationCode:card.activationCode,reviewURL:REVIEW_URL,resolutionJobToken:token}})).status()).toBe(200);

 // A tap so the card has visit analytics that must survive the destination change.
 await page.goto(`/c/${card.code}?src=qr`);
 const visitsBefore=await visitCount(card.code);
 expect(visitsBefore).toBeGreaterThanOrEqual(1);

 // Preview only: nothing is written without confirmation.
 const preview=await page.request.post(`/api/admin/cards/${card.code}/destination`,{headers:ip(),data:{reviewURL:OTHER_REVIEW_URL}});
 expect(preview.status()).toBe(200);
 const previewBody=await preview.json();
 expect(previewBody.preview).toBe(true);
 expect(previewBody.oldUrl).toBe(REVIEW_URL);
 expect(previewBody.newUrl).toBe(OTHER_REVIEW_URL);
 expect((await cardRow(card.code)).review_url).toBe(REVIEW_URL);

 // A Maps link can never be set as a destination through this endpoint.
 const rejected=await page.request.post(`/api/admin/cards/${card.code}/destination`,{headers:ip(),data:{reviewURL:SHORT_LINK}});
 expect(rejected.status()).toBe(400);

 // A job bound to another card may not be applied here.
 const otherToken=await seedJob({cardCode:'RP-0000000000',inputUrl:SHORT_LINK});
 expect((await page.request.post(`/api/admin/cards/${card.code}/destination`,{headers:ip(),data:{resolutionJobToken:otherToken}})).status()).toBe(403);

 // Confirmed update: destination replaced in place.
 const applied=await page.request.post(`/api/admin/cards/${card.code}/destination`,{headers:ip(),data:{reviewURL:OTHER_REVIEW_URL,confirm:true}});
 expect(applied.status()).toBe(200);

 const row=await cardRow(card.code);
 expect(row.review_url).toBe(OTHER_REVIEW_URL);
 expect(row.code).toBe(card.code);
 expect(row.active).toBe(1);
 expect(await visitCount(card.code)).toBe(visitsBefore);
 expect(await auditCount(card.code)).toBe(1);
});
