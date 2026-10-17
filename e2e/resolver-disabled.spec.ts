import {test,expect} from '@playwright/test';

// Runs against the SECOND e2e server (port 3183), which is started WITHOUT
// PLAYWRIGHT_RESOLVER_ENABLED, i.e. the production default. This proves the global kill switch:
// with the flag off, no resolution can be requested and no browser work is possible.

const DISABLED_BASE='http://127.0.0.1:3183';

test('the resolver kill switch refuses new resolution requests',async({request})=>{
 const res=await request.post(`${DISABLED_BASE}/api/resolve`,{data:{url:'https://maps.app.goo.gl/HihE1JQdDmzBDCVC8'}});
 expect(res.status()).toBe(503);
 const body=await res.json();
 expect(body.error).toContain('belum aktif');
 // Machine-readable code: the UI maps this to "disabled" and points the user at manual activation
 // instead of polling a job that can never exist.
 expect(body.code).toBe('resolver_disabled');
});

test('the kill switch cannot be bypassed with an admin-shaped payload or an official URL',async({request})=>{
 const adminShaped=await request.post(`${DISABLED_BASE}/api/resolve`,{data:{url:'https://search.google.com/local/writereview?placeid=ChIJQeGqDPodby4RQBEuhEv7Zjs',cardCode:'RP-0000000000'}});
 expect(adminShaped.status()).toBe(503);
});

test('the activation form shows the disabled message and keeps manual activation available',async({page})=>{
 await page.setExtraHTTPHeaders({'x-forwarded-for':'198.51.100.231'});
 await page.goto(`${DISABLED_BASE}/admin`);
 await page.locator('input[autocomplete=username]').fill('admin');
 await page.locator('input[type=password]').fill('e2e-test-admin-password');
 await page.locator('button.login-submit').click();
 await expect(page.locator('.dashboard')).toBeVisible({timeout:30_000});
 const generated=await page.evaluate(async()=>{
  const res=await fetch('/api/admin/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({count:1})});
  return {status:res.status,body:await res.json()};
 });
 expect(generated.status).toBe(200);
 const card=generated.body.items[0] as {code:string;activationCode:string};

 await page.goto(`${DISABLED_BASE}/c/${card.code}?src=qr`);
 await page.locator('input[name=activationCode]').fill(card.activationCode);
 await page.locator('input[name=reviewURL]').fill('https://maps.app.goo.gl/HihE1JQdDmzBDCVC8');
 await page.locator('form.form-stack > button').first().click();

 // Terminal, explicit Indonesian message — not a spinner and not a generic failure.
 const status=page.locator('div.field-hint[role=status]').filter({hasText:'belum aktif'});
 await expect(status).toBeVisible({timeout:15_000});
 // The message tells the user manual activation still works.
 await expect(status).toContainText('tautan resmi Google Review');

 // Manual activation remains possible with an already valid official review URL.
 await page.locator('input[name=reviewURL]').fill('https://g.page/r/repiw-e2e/review');
 await page.locator('form.form-stack > button').first().click();
 await expect(page.locator('form.form-stack > button').last()).toBeEnabled({timeout:10_000});
});

test('resolution status lookups stay limited to well-formed tokens',async({request})=>{
 expect((await request.get(`${DISABLED_BASE}/api/resolve/short`)).status()).toBe(400);
 const unknown=await request.get(`${DISABLED_BASE}/api/resolve/${'a'.repeat(30)}`);
 expect(unknown.status()).toBe(404);
 expect((await unknown.json()).code).toBe('job_not_found');
});
