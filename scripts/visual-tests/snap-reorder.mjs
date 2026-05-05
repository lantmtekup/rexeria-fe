// Verify F1: drag layer in LayersPanel → CSS order applied to canvas.
import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const url = `${base}/canvas-templates/e3e3e3e3-0000-0000-0000-000000000002`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

page.on('pageerror', e => console.log('[pageerror]', e.message));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// 1) Snapshot before reorder (default eyebrow → title → description order)
await page.screenshot({
  path: 'scripts/visual-tests/out/reorder-1-before.png',
});
console.log('saved 1-before');

// 2) Drag "Tiêu đề" layer above "Eyebrow" in the sidebar.
// Each layer row is a div[role=button]. We pick the row whose text
// contains the label.
const titleHandle = page
  .locator('aside [role=button]')
  .filter({ hasText: 'Tiêu đề' })
  .first();

const eyebrowHandle = page
  .locator('aside [role=button]')
  .filter({ hasText: 'Eyebrow' })
  .first();

if ((await titleHandle.count()) && (await eyebrowHandle.count())) {
  // Use Playwright's drag-to-element
  const titleBox = await titleHandle.boundingBox();
  const eyebrowBox = await eyebrowHandle.boundingBox();
  if (titleBox && eyebrowBox) {
    await page.mouse.move(
      titleBox.x + titleBox.width / 2,
      titleBox.y + titleBox.height / 2
    );
    await page.mouse.down();
    // dnd-kit needs a few intermediate moves
    await page.mouse.move(
      eyebrowBox.x + eyebrowBox.width / 2,
      eyebrowBox.y + eyebrowBox.height / 2 - 20,
      { steps: 8 }
    );
    await page.mouse.move(
      eyebrowBox.x + eyebrowBox.width / 2,
      eyebrowBox.y - 5,
      { steps: 8 }
    );
    await page.waitForTimeout(200);
    await page.mouse.up();
    await page.waitForTimeout(500);
    console.log('dragged title above eyebrow');
  }
}

await page.screenshot({
  path: 'scripts/visual-tests/out/reorder-2-after.png',
});
console.log('saved 2-after');

await browser.close();
console.log('done');
