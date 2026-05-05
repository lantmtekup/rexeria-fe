// Verify F2: double-click text → inline edit + commit on blur.
import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const url = `${base}/canvas-templates/e3e3e3e3-0000-0000-0000-000000000002`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

page.on('pageerror', e => console.log('[pageerror]', e.message));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// 1) Click title once → just selects
await page.locator('[data-element-key="title"]').first().click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'scripts/visual-tests/out/inline-1-selected.png' });
console.log('saved 1-selected (single click → selection only)');

// 2) Double-click title → enter inline edit
await page.locator('[data-element-key="title"]').first().dblclick();
await page.waitForTimeout(300);
await page.screenshot({ path: 'scripts/visual-tests/out/inline-2-editing.png' });
console.log('saved 2-editing (double-click → contenteditable + outline)');

// 3) Type new content
await page.keyboard.type('Tiêu đề mới — gõ trực tiếp');
await page.waitForTimeout(200);
await page.screenshot({ path: 'scripts/visual-tests/out/inline-3-typing.png' });
console.log('saved 3-typing');

// 4) Commit via Enter
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
await page.screenshot({ path: 'scripts/visual-tests/out/inline-4-committed.png' });
console.log('saved 4-committed (Enter → commit, exit edit)');

// 5) Verify the new title persisted in DOM
const titleText = await page
  .locator('[data-element-key="title"]')
  .first()
  .textContent();
console.log('title now:', JSON.stringify(titleText));

await browser.close();
console.log('done');
