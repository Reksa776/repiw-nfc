import {test,expect} from '@playwright/test';

// End-to-end regression spec for the existing card lifecycle (admin generation, activation, NFC/QR
// tracking, demo flow, mobile layout).
//
// Selectors are deliberately language-agnostic (class/structure based) instead of matching English
// copy: the UI ships in Indonesian and English, and the default depends on the browser's stored
// language, so asserting on translated strings made this spec fail whenever the UI was Indonesian.

test('admin generation, activation, NFC tracking, demo, and mobile layout',async({page})=>{
 // One dedicated rate-limit bucket for this spec so rate-limit assertions stay isolated.
 await page.setExtraHTTPHeaders({'x-forwarded-for':'198.51.100.250'});
 await page.goto('/admin');
 await page.locator('input[autocomplete=username]').fill('admin');
 await page.locator('input[type=password]').fill('e2e-test-admin-password');
 await page.locator('button.login-submit').click();
 await expect(page.locator('.dash-heading h1')).toBeVisible();
 await page.locator('.generate-form select').selectOption('10');
 await page.locator('.generate-form button').click();
 await expect(page.locator('.panel.generated h2')).toContainText('10');
 const csvDownload=page.waitForEvent('download');await page.locator('.panel.generated button').click();
 const download=await csvDownload;expect(download.suggestedFilename()).toContain('.csv');
 const generated=await page.evaluate(async()=>{const r=await fetch('/api/admin/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({count:1})});return {status:r.status,body:await r.json()}});
 expect(generated.status).toBe(200);expect(generated.body.items).toHaveLength(1);
 const item=generated.body.items[0];expect(item.qrURL).toContain('?src=qr');expect(item.nfcURL).toContain('?src=nfc');
 const png=await page.request.get(`/api/admin/qr/${item.code}`);expect(png.status()).toBe(200);expect(png.headers()['content-type']).toContain('image/png');
 const zip=await page.request.get('/api/admin/qr-zip');expect(zip.status()).toBe(200);expect((await zip.body()).subarray(0,2).toString()).toBe('PK');
 const invalidCode=await page.request.post('/api/activate',{data:{code:'RP-0000000000',activationCode:'1234567890AB',reviewURL:'https://g.page/r/example/review'}});expect(invalidCode.status()).toBe(404);
 const unsafeUrl=await page.request.post('/api/activate',{data:{code:item.code,activationCode:item.activationCode,reviewURL:'https://attacker.example/review'}});expect(unsafeUrl.status()).toBe(400);
 const wrongSecret=await page.request.post('/api/activate',{data:{code:item.code,activationCode:'000000000000',reviewURL:'https://g.page/r/repiw-e2e/review'}});expect(wrongSecret.status()).toBe(401);
 await page.goto(`/c/${item.code}?src=qr`);await page.locator('input[name=activationCode]').fill(item.activationCode);await page.locator('input[name=reviewURL]').fill('https://g.page/r/repiw-e2e/review');
 // A direct Google review link is verified in the browser (no server call) and only then does the
 // activation button unlock; the submit button is the form's last direct-child button.
 await page.locator('form.form-stack > button').first().click();
 const submitButton=page.locator('form.form-stack > button').last();await expect(submitButton).toBeEnabled();await submitButton.click();
 await expect(page.locator('.success').filter({hasText:item.code}).first()).toBeVisible();
 const repeated=await page.request.post('/api/activate',{data:{code:item.code,activationCode:item.activationCode,reviewURL:'https://g.page/r/repiw-e2e/review'}});expect(repeated.status()).toBe(409);
 await page.goto(`/c/${item.code}?src=qr`);await expect(page).toHaveURL(new RegExp(`/demo-review\\?card=${item.code}&src=qr`));
 await page.goto(`/c/${item.code}?src=nfc`);await expect(page).toHaveURL(new RegExp(`/demo-review\\?card=${item.code}&src=nfc`));
 const stats=await page.request.get('/api/admin/stats').then(r=>r.json());expect(stats.qr).toBeGreaterThanOrEqual(1);expect(stats.nfc).toBeGreaterThanOrEqual(1);expect(stats.active).toBeGreaterThanOrEqual(1);
 const noCard=await page.request.get('/api/card/RP-0000000000');expect(noCard.status()).toBe(404);
 await page.goto('/flow-preview');await page.locator('.flow-intro button').click();await expect(page.locator('.success.banner')).toBeVisible();
 await page.goto('/admin');await page.locator('.side-bottom .icon-button').click();await expect(page.locator('input[type=password]')).toBeVisible();expect((await page.request.get('/api/admin/stats')).status()).toBe(401);
 await page.setViewportSize({width:390,height:844});await page.goto('/admin');await expect(page.locator('body')).toBeVisible();const width=await page.evaluate(()=>document.documentElement.scrollWidth);expect(width).toBeLessThanOrEqual(390);
});
