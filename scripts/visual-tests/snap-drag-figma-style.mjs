// Capture the new Figma-style drag UX: ghost overlay + drop indicator line +
// faded source row.
import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const url = `${base}/canvas-templates/e3e3e3e3-2000-0000-0000-000000000001`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const titleHandle = page
  .locator('aside button[aria-label*="Tiêu đề"][aria-label*="Kéo"]')
  .first();
const eyebrowHandle = page
  .locator('aside button[aria-label*="Eyebrow"][aria-label*="Kéo"]')
  .first();

// 1) Idle state
await page.screenshot({
  path: 'scripts/visual-tests/out/drag-figma-1-idle.png',
  clip: { x: 1140, y: 80, width: 280, height: 360 },
});

// 2) Hover handle — should show sky bg
await titleHandle.hover();
await page.waitForTimeout(150);
await page.screenshot({
  path: 'scripts/visual-tests/out/drag-figma-2-hover-handle.png',
  clip: { x: 1140, y: 80, width: 280, height: 360 },
});

// 3) Mid-drag — show ghost + faded source + drop indicator
const titleBox = await titleHandle.boundingBox();
const eyebrowBox = await eyebrowHandle.boundingBox();
if (!titleBox || !eyebrowBox) {
  console.log('!! could not locate handles');
  process.exit(1);
}

await page.mouse.move(
  titleBox.x + titleBox.width / 2,
  titleBox.y + titleBox.height / 2
);
await page.mouse.down();
// Move incrementally so dnd-kit picks up + over events fire.
await page.mouse.move(titleBox.x + 4, titleBox.y - 10, { steps: 4 });
await page.mouse.move(eyebrowBox.x + eyebrowBox.width / 2, eyebrowBox.y - 5, {
  steps: 8,
});
await page.waitForTimeout(300);

await page.screenshot({
  path: 'scripts/visual-tests/out/drag-figma-3-dragging.png',
  clip: { x: 1100, y: 60, width: 340, height: 400 },
});
console.log('saved 3-dragging — should show ghost + drop line + faded source');

await page.mouse.up();
await page.waitForTimeout(500);

// 4) After drop — success state
await page.screenshot({
  path: 'scripts/visual-tests/out/drag-figma-4-after.png',
  clip: { x: 1140, y: 80, width: 280, height: 360 },
});

await browser.close();
console.log('done');
