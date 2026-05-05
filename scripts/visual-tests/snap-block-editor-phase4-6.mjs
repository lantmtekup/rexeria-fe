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
  if (t === 'error') console.log('[console]', t, m.text());
});
page.on('pageerror', e => console.log('[pageerror]', e.message));

await page.goto(url, { waitUntil: 'load' });
await page
  .getByRole('button', { name: 'Thêm block' })
  .first()
  .waitFor({ timeout: 30000 });
await page.waitForTimeout(500);
await page.screenshot({
  path: 'scripts/visual-tests/out/p4-initial.png',
});

// 1) Add Hero Overlay block then click into it
await page
  .getByRole('button', { name: 'Thêm block' })
  .first()
  .click({ timeout: 8000 });
await page.waitForTimeout(300);
await page.getByRole('button', { name: 'Hero Overlay' }).first().click();
await page.waitForTimeout(500);
await page.screenshot({
  path: 'scripts/visual-tests/out/p4-hero-overlay.png',
});

// 2) Trigger AI generate
await page
  .getByPlaceholder(/Mô tả ý tưởng/)
  .fill('Biệt thự ven sông, view sân golf, 4PN');
await page.getByRole('button', { name: 'Tạo nội dung AI' }).click();
await page.waitForTimeout(900);
await page.screenshot({
  path: 'scripts/visual-tests/out/p5-ai-generated.png',
});

console.log('saved 2 screenshots');
await browser.close();
