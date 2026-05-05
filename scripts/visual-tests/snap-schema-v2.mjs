// Verify schema 2.0 wiring: device toggle = edit mode, mobile/desktop write
// to separate variants, tablet shows read-only banner.
import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const url = `${base}/canvas-templates/e3e3e3e3-0000-0000-0000-000000000002`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

page.on('pageerror', e => console.log('[pageerror]', e.message));
page.on('console', m => {
  if (m.type() === 'error') console.log('[console error]', m.text());
});

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// 1) Default desktop mode — empty toolbar shows "Đang chỉnh sửa Desktop"
await page.screenshot({
  path: 'scripts/visual-tests/out/v2-1-desktop-empty.png',
  clip: { x: 0, y: 56, width: 1280, height: 60 },
});
console.log('saved 1-desktop-empty');

// 2) Switch to Mobile → toolbar should say "Đang chỉnh sửa Mobile"
await page.getByRole('button', { name: 'Mobile' }).first().click();
await page.waitForTimeout(400);
await page.screenshot({
  path: 'scripts/visual-tests/out/v2-2-mobile-empty.png',
  clip: { x: 0, y: 56, width: 1280, height: 60 },
});
console.log('saved 2-mobile-empty');

// 3) Switch to Tablet → toolbar should show amber read-only banner
await page.getByRole('button', { name: 'Tablet' }).first().click();
await page.waitForTimeout(400);
await page.screenshot({
  path: 'scripts/visual-tests/out/v2-3-tablet-readonly.png',
  clip: { x: 0, y: 56, width: 1280, height: 60 },
});
console.log('saved 3-tablet-readonly');

// 4) Switch back to Desktop, click title, edit it
await page.getByRole('button', { name: 'Desktop' }).first().click();
await page.waitForTimeout(300);
const title = page.locator('[data-element-key="title"]').first();
if (await title.count()) {
  await title.click();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: 'scripts/visual-tests/out/v2-4-desktop-title-selected.png',
    clip: { x: 0, y: 56, width: 1280, height: 60 },
  });
  console.log('saved 4-desktop-title-selected');
}

// 5) Switch to Mobile while title is selected — toolbar shows mobile variant
await page.getByRole('button', { name: 'Mobile' }).first().click();
await page.waitForTimeout(400);
await page.screenshot({
  path: 'scripts/visual-tests/out/v2-5-mobile-title-selected.png',
  clip: { x: 0, y: 56, width: 1280, height: 60 },
});
console.log('saved 5-mobile-title-selected');

await browser.close();
console.log('done');
