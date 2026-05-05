import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const url = `${base}/canvas-templates/e3e3e3e3-0000-0000-0000-000000000002`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();
page.on('pageerror', e => console.log('[pageerror]', e.message));

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(7500);
await page.screenshot({ path: 'scripts/visual-tests/out/p7-initial.png' });

// Open preview to see all blocks stacked
await page.getByRole('button', { name: 'Xem trước', exact: true }).click();
await page.waitForTimeout(700);
await page.screenshot({
  path: 'scripts/visual-tests/out/p7-preview-all.png',
  fullPage: true,
});

console.log('done');
await browser.close();
