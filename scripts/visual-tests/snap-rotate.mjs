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
await page.screenshot({ path: 'scripts/visual-tests/out/rot-initial.png' });

// Drag the rotation slider
const rotation = page.getByRole('slider', { name: 'Góc xoay' });
if (await rotation.count()) {
  await rotation.fill('30');
  await page.waitForTimeout(300);
}
const scale = page.getByRole('slider', { name: 'Phóng to' });
if (await scale.count()) {
  await scale.fill('1.4');
  await page.waitForTimeout(300);
}

await page.screenshot({ path: 'scripts/visual-tests/out/rot-applied.png' });

console.log('done');
await browser.close();
