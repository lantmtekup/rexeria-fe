// Snap product information editor to verify FP-3 (color list with default + reorder).
import { chromium } from 'playwright';

const base = 'http://localhost:3000';
// Use a real product id (the one user shared earlier).
const url = `${base}/product/new/information`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Try to add a few colors via the dropdown so we can see the list UI.
// Click the "+" next to "Color" label.
const colorPlus = page
  .locator('text=Color')
  .locator('xpath=..')
  .locator('button[aria-label="Add color"]')
  .first();
if (await colorPlus.count()) {
  await colorPlus.click();
  await page.waitForTimeout(200);
  // Click first preset
  const presets = page.locator('button[title]').filter({ has: page.locator('span') });
  // Pick 3 presets
  for (let i = 0; i < 3; i++) {
    const btn = presets.nth(i);
    if (await btn.count()) {
      await btn.click();
      await page.waitForTimeout(150);
    }
  }
  // close dropdown
  await page.locator('body').click({ position: { x: 50, y: 50 } });
  await page.waitForTimeout(300);
}

await page.screenshot({
  path: 'scripts/visual-tests/out/product-color-editor.png',
  fullPage: false,
});
console.log('saved product-color-editor.png');

await browser.close();
