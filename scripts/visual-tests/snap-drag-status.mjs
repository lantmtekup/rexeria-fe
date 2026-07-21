// Verify drag status banner + visual hover/dragging states.
import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const url = `${base}/canvas-templates/e3e3e3e3-2000-0000-0000-000000000001`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// 1) Idle state — banner shows "Sẵn sàng — kéo lớp..."
await page.screenshot({
  path: 'scripts/visual-tests/out/drag-1-idle.png',
  clip: { x: 1160, y: 100, width: 280, height: 320 },
});
console.log('saved 1-idle');

// 2) Hover — sky-blue tint on row
const titleRow = page
  .locator('aside [role=button]')
  .filter({ hasText: 'Tiêu đề' })
  .first();
await titleRow.hover();
await page.waitForTimeout(200);
await page.screenshot({
  path: 'scripts/visual-tests/out/drag-2-hover.png',
  clip: { x: 1160, y: 100, width: 280, height: 320 },
});
console.log('saved 2-hover');

// 3) Mid-drag — banner shows "Đang kéo..." + row has lifted shadow
const titleBox = await titleRow.boundingBox();
const eyebrowRow = page
  .locator('aside [role=button]')
  .filter({ hasText: 'Eyebrow' })
  .first();
const eyebrowBox = await eyebrowRow.boundingBox();

await page.mouse.move(
  titleBox.x + titleBox.width / 2,
  titleBox.y + titleBox.height / 2
);
await page.mouse.down();
await page.mouse.move(
  titleBox.x + titleBox.width / 2,
  titleBox.y + titleBox.height / 2 - 20,
  { steps: 6 }
);
await page.waitForTimeout(300);
await page.screenshot({
  path: 'scripts/visual-tests/out/drag-3-dragging.png',
  clip: { x: 1160, y: 100, width: 280, height: 320 },
});
console.log('saved 3-dragging');

// Drop above eyebrow
await page.mouse.move(eyebrowBox.x + eyebrowBox.width / 2, eyebrowBox.y, {
  steps: 6,
});
await page.waitForTimeout(200);
await page.mouse.up();
await page.waitForTimeout(400);

// 4) After drop — banner shows "✓ Đã đổi thứ tự" (emerald)
await page.screenshot({
  path: 'scripts/visual-tests/out/drag-4-success.png',
  clip: { x: 1160, y: 100, width: 280, height: 320 },
});
console.log('saved 4-success');

await browser.close();
