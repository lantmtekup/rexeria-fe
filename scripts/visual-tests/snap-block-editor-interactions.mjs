import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const url = `${base}/canvas-templates/e3e3e3e3-0000-0000-0000-000000000002`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 820 },
});
const page = await ctx.newPage();

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

// 1) Click EN to verify lang switch
await page.getByRole('button', { name: 'EN', exact: true }).click();
await page.waitForTimeout(300);
await page.screenshot({
  path: 'scripts/visual-tests/out/block-editor-en.png',
});

// 2) Switch back to VI, then open add-block dialog
await page.getByRole('button', { name: 'VI', exact: true }).click();
await page.waitForTimeout(200);
await page.getByRole('button', { name: 'Thêm block' }).first().click();
await page.waitForTimeout(400);
await page.screenshot({
  path: 'scripts/visual-tests/out/block-editor-add.png',
});

// 3) Pick Hero Overlay
await page.getByRole('button', { name: 'Hero Overlay' }).first().click();
await page.waitForTimeout(400);
await page.screenshot({
  path: 'scripts/visual-tests/out/block-editor-after-add.png',
});

console.log('saved 3 screenshots');
await browser.close();
