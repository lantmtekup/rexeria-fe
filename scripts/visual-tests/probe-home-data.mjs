import { chromium } from 'playwright';

const base = 'http://localhost:3001';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();

page.on('console', m => {
  const t = m.type();
  if (t === 'error' || t === 'warning') console.log('[console]', t, m.text());
});

// 1. Login (form has dev defaults pre-filled)
await page.goto(`${base}/sign-in`, { waitUntil: 'load' });
await page.waitForTimeout(800);
await page.locator('form button[type=submit]').first().click();
await page.waitForURL(/\/home/, { timeout: 20000 }).catch(() => {});
await page.waitForTimeout(2000);

// 2. Probe each list endpoint with the now-authed cookie
const urls = [
  '/api/rexer/templates?limit=3',
  '/api/rexer/projects?limit=3',
  '/api/rexer/products?limit=3',
  '/api/rexer/dashboard/summary',
];

for (const u of urls) {
  const resp = await page.request.get(`${base}${u}`);
  const status = resp.status();
  const body = await resp.text();
  console.log(`\n=== ${u} (${status}) ===`);
  console.log(body.slice(0, 1500));
}

// 3. Take screenshot of /home
await page.goto(`${base}/home`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({
  path: 'scripts/visual-tests/out/home-current.png',
  fullPage: true,
});

await browser.close();
