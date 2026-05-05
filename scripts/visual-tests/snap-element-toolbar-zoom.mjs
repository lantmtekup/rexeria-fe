// Capture only the toolbar area (clipped) so it's easier to inspect visually.
import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const url = `${base}/canvas-templates/e3e3e3e3-0000-0000-0000-000000000002`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 820 },
});
const page = await ctx.newPage();

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Helper: find toolbar bbox = the element containing the "TIÊU ĐỀ"/"NỀN"/etc badge.
// Toolbar is the only element with "Click vào element..." or the colored badge.
async function clipToolbar(name) {
  // The toolbar is between header (h-14) and canvas. Clip top 56-110px region of full width.
  await page.screenshot({
    path: `scripts/visual-tests/out/zoom-${name}.png`,
    clip: { x: 0, y: 56, width: 1280, height: 60 },
  });
  console.log('saved zoom-' + name);
}

// 1) empty state
await clipToolbar('1-empty');

// 2) click title text
const title = page.locator('[data-element-key="title"]').first();
if (await title.count()) {
  await title.click();
  await page.waitForTimeout(400);
  await clipToolbar('2-text');
}

// 3) click background layer (sidebar)
const bgLayer = page.locator('aside button').filter({ hasText: 'Nền' }).first();
if (await bgLayer.count()) {
  await bgLayer.click();
  await page.waitForTimeout(400);
  await clipToolbar('3-background');
}

// 4) click stats (HeroSplit has stats list)
const statsLayer = page
  .locator('aside button')
  .filter({ hasText: 'Thống kê' })
  .first();
if (await statsLayer.count()) {
  await statsLayer.click();
  await page.waitForTimeout(400);
  await clipToolbar('4-stats');
}

// 5) click image (HeroSplit has imageUrl)
const imgLayer = page
  .locator('aside button')
  .filter({ hasText: 'Ảnh hero' })
  .first();
if (await imgLayer.count()) {
  await imgLayer.click();
  await page.waitForTimeout(400);
  await clipToolbar('5-image');
}

await browser.close();
console.log('done');
