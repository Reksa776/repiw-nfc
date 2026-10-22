import { test, expect, type Page } from '@playwright/test';

const TEST_DB = process.env.REPIW_TEST_DATABASE_URL || '';
let ipCounter = 0;
function ip() { ipCounter += 1; return { 'x-forwarded-for': `198.51.100.${ipCounter % 250}` }; }

async function login(page: Page) {
  await page.setExtraHTTPHeaders(ip());
  await page.goto('/admin');
  await page.locator('input[autocomplete=username]').fill('admin');
  await page.locator('input[type=password]').fill('e2e-test-admin-password');
  await page.locator('button.login-submit').click();
  await expect(page.locator('.dashboard')).toBeVisible({ timeout: 30_000 });
}

test.skip(!TEST_DB, 'REPIW_TEST_DATABASE_URL is required; do not use production database for E2E.');

test('Places resolver returns actionable configuration error without an API key', async ({ page }) => {
  await login(page);
  const gen = await page.request.post('/api/admin/generate', { data: { count: 1 } });
  expect(gen.status()).toBe(200);
  const [{ code, activationCode }] = (await gen.json()).items as Array<{ code: string; activationCode: string }>;
  const response = await page.request.post('/api/resolve', {
    headers: ip(), data: { input: 'Kopi Pagi Jakarta', code, activationCode },
  });
  expect(response.status()).toBe(503);
  expect((await response.json()).code).toBe('places_not_configured');
});

test('resolver rejects unsafe URLs before any Places API request', async ({ page }) => {
  await login(page);
  const gen = await page.request.post('/api/admin/generate', { data: { count: 1 } });
  const [{ code, activationCode }] = (await gen.json()).items as Array<{ code: string; activationCode: string }>;
  const response = await page.request.post('/api/resolve', {
    headers: ip(), data: { input: 'https://google.com.attacker.example/maps/place/Fake', code, activationCode },
  });
  expect(response.status()).toBe(400);
  expect((await response.json()).code).toBe('unsupported_url');
});
