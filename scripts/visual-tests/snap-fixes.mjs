import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const url = `${base}/canvas-templates/e3e3e3e3-0000-0000-0000-000000000002`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 820 },
});
const page = await ctx.newPage();

page.on('pageerror', e => console.log('[pageerror]', e.message));

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(8000);

await page.screenshot({ path: 'scripts/visual-tests/out/fix-initial.png' });

// Click "Lớp" tab in sidebar
const layerTab = page.getByRole('button', { name: 'Lớp', exact: true });
if (await layerTab.count()) {
  await layerTab.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'scripts/visual-tests/out/fix-layers.png' });
}

// Open preview
const preview = page.getByRole('button', { name: 'Xem trước', exact: true });
if (await preview.count()) {
  await preview.click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'scripts/visual-tests/out/fix-preview.png' });
}

console.log('done');
await browser.close();
