// Mockup verification for the new ElementToolbar (sticky top contextual bar).
// Run dev server first: `npm run dev` (port 3000), then `node scripts/visual-tests/snap-element-toolbar.mjs`.
import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const url = `${base}/canvas-templates/e3e3e3e3-0000-0000-0000-000000000002`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 820 },
});
const page = await ctx.newPage();

page.on('console', m => {
  const t = m.type();
  if (t === 'error') console.log('[console error]', m.text());
});
page.on('pageerror', e => console.log('[pageerror]', e.message));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// 1) Empty state — nothing selected
await page.screenshot({
  path: 'scripts/visual-tests/out/toolbar-1-empty.png',
});
console.log('saved 1-empty');

// 2) Click on title text element
const title = page.locator('[data-element-key="title"]').first();
if (await title.count()) {
  await title.click();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: 'scripts/visual-tests/out/toolbar-2-text.png',
  });
  console.log('saved 2-text');
}

// 3) Click on background layer in right sidebar
const bgLayer = page.locator('text=/Nền.*\\(màu/').first();
if (await bgLayer.count()) {
  await bgLayer.click();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: 'scripts/visual-tests/out/toolbar-3-background.png',
  });
  console.log('saved 3-background');
}

// 4) Click on backgroundUrl image
const bgImg = page.locator('[data-element-key="backgroundUrl"]').first();
if (await bgImg.count()) {
  await bgImg.click();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: 'scripts/visual-tests/out/toolbar-4-image.png',
  });
  console.log('saved 4-image');
}

// 5) Open AI popover (click AI button on toolbar)
const aiBtn = page.getByRole('button', { name: 'AI tạo nội dung' }).first();
if (await aiBtn.count()) {
  await aiBtn.click();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: 'scripts/visual-tests/out/toolbar-5-ai-popover.png',
  });
  console.log('saved 5-ai-popover');
}

await browser.close();
console.log('done');
