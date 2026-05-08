// Debug F1 reorder: drag Title above Eyebrow, then read DOM to verify
// (a) elementOrder state was updated
// (b) CSS `order` style applied to actual DOM nodes
// (c) browser visually rendered in new order
import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const url = `${base}/canvas-templates/e3e3e3e3-2000-0000-0000-000000000001`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

page.on('pageerror', e => console.log('[pageerror]', e.message));
page.on('console', m => {
  if (m.type() === 'error') console.log('[err]', m.text().slice(0, 150));
});

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// === BEFORE drag ===
const before = await page.evaluate(() => {
  const eb = document.querySelector('[data-element-key="eyebrow"]');
  const ti = document.querySelector('[data-element-key="title"]');
  return {
    eyebrow: {
      order: eb ? getComputedStyle(eb).order : null,
      rectTop: eb?.getBoundingClientRect().top,
      text: eb?.textContent?.trim().slice(0, 30),
    },
    title: {
      order: ti ? getComputedStyle(ti).order : null,
      rectTop: ti?.getBoundingClientRect().top,
      text: ti?.textContent?.trim().slice(0, 30),
    },
  };
});
console.log('=== BEFORE drag ===');
console.log('eyebrow order=' + before.eyebrow.order, '| top=' + Math.round(before.eyebrow.rectTop), '| text=' + before.eyebrow.text);
console.log('title   order=' + before.title.order, '| top=' + Math.round(before.title.rectTop), '| text=' + before.title.text);

// === Drag Title row above Eyebrow row in layers sidebar ===
// New design: dedicated drag handle button (aria-label="Kéo để sắp xếp <label>").
const titleRow = page
  .locator('aside button[aria-label*="Tiêu đề"][aria-label*="Kéo"]')
  .first();
const eyebrowRow = page
  .locator('aside button[aria-label*="Eyebrow"][aria-label*="Kéo"]')
  .first();

const titleBox = await titleRow.boundingBox();
const eyebrowBox = await eyebrowRow.boundingBox();
if (!titleBox || !eyebrowBox) {
  console.log('!! could not find rows');
  await browser.close();
  process.exit(1);
}

console.log('\n=== DRAG ===');
console.log('Tiêu đề row at y=' + Math.round(titleBox.y));
console.log('Eyebrow row at y=' + Math.round(eyebrowBox.y));

await page.mouse.move(titleBox.x + titleBox.width / 2, titleBox.y + titleBox.height / 2);
await page.mouse.down();
await page.mouse.move(titleBox.x + titleBox.width / 2, titleBox.y + titleBox.height / 2 - 10, { steps: 4 });
await page.mouse.move(eyebrowBox.x + eyebrowBox.width / 2, eyebrowBox.y + eyebrowBox.height / 2, { steps: 8 });
await page.mouse.move(eyebrowBox.x + eyebrowBox.width / 2, eyebrowBox.y - 5, { steps: 6 });
await page.waitForTimeout(200);
await page.mouse.up();
await page.waitForTimeout(800);

// === AFTER drag ===
const after = await page.evaluate(() => {
  const eb = document.querySelector('[data-element-key="eyebrow"]');
  const ti = document.querySelector('[data-element-key="title"]');
  return {
    eyebrow: {
      order: eb ? getComputedStyle(eb).order : null,
      rectTop: eb?.getBoundingClientRect().top,
      text: eb?.textContent?.trim().slice(0, 30),
    },
    title: {
      order: ti ? getComputedStyle(ti).order : null,
      rectTop: ti?.getBoundingClientRect().top,
      text: ti?.textContent?.trim().slice(0, 30),
    },
  };
});
console.log('\n=== AFTER drag ===');
console.log('eyebrow order=' + after.eyebrow.order, '| top=' + Math.round(after.eyebrow.rectTop), '| text=' + after.eyebrow.text);
console.log('title   order=' + after.title.order, '| top=' + Math.round(after.title.rectTop), '| text=' + after.title.text);

// === SIDEBAR order ===
const sidebarOrder = await page.evaluate(() => {
  const rows = document.querySelectorAll('aside [role=button]');
  return Array.from(rows).map(r => r.textContent?.trim().slice(0, 20));
});
console.log('\n=== SIDEBAR row order after drag ===');
sidebarOrder.forEach((s, i) => console.log(`  ${i}. ${s}`));

// === DIAGNOSTIC ===
console.log('\n=== DIAGNOSTIC ===');
const orderApplied = before.eyebrow.order !== after.eyebrow.order || before.title.order !== after.title.order;
const visualSwap = (before.eyebrow.rectTop < before.title.rectTop) !== (after.eyebrow.rectTop < after.title.rectTop);
console.log('CSS order changed?  ', orderApplied ? '✅ YES' : '❌ NO');
console.log('Visual position swapped on canvas?', visualSwap ? '✅ YES' : '❌ NO');

await browser.close();
