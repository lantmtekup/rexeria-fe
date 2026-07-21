// Verify HeroOverlay + HeroSplit mobile heights after the aspect fix.
import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const url = `${base}/canvas-templates/e3e3e3e3-0000-0000-0000-000000000002`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1100 },
});
const page = await ctx.newPage();

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Switch to Mobile device toggle
await page.getByRole('button', { name: 'Mobile' }).first().click();
await page.waitForTimeout(400);

// Click Hero Overlay tab (block 2)
const overlay = page
  .locator('span')
  .filter({ hasText: /^\d+\.\s*HERO OVERLAY/ })
  .last();
if (await overlay.count()) {
  const tabDiv = await overlay.evaluateHandle(s =>
    s.closest('[class*="flex"]')?.querySelector('.cursor-pointer')
  );
  await tabDiv.evaluate(el => el && el.click());
  await page.waitForTimeout(500);
}
await page.screenshot({
  path: 'scripts/visual-tests/out/hero-overlay-mobile-fixed.png',
  fullPage: true,
});
console.log('saved hero-overlay-mobile');

// Click Hero Split tab
const split = page
  .locator('span')
  .filter({ hasText: /^\d+\.\s*HERO SPLIT/ })
  .last();
if (await split.count()) {
  const tabDiv = await split.evaluateHandle(s =>
    s.closest('[class*="flex"]')?.querySelector('.cursor-pointer')
  );
  await tabDiv.evaluate(el => el && el.click());
  await page.waitForTimeout(500);
}
await page.screenshot({
  path: 'scripts/visual-tests/out/hero-split-mobile-fixed.png',
  fullPage: true,
});
console.log('saved hero-split-mobile');

await browser.close();
console.log('done');
