import { chromium } from 'playwright';

const base = 'http://localhost:3001';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();

await page.goto(`${base}/sign-in`, { waitUntil: 'load' });
await page.waitForTimeout(800);
await page.locator('form button[type=submit]').first().click();
await page.waitForURL(/\/home/, { timeout: 20000 }).catch(() => {});
await page.waitForTimeout(800);

await page.goto(`${base}/template`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

await page.screenshot({
  path: 'scripts/visual-tests/out/template-list.png',
  fullPage: true,
});

await browser.close();
console.log('saved');
