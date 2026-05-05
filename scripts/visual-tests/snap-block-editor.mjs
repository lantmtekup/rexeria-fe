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
  if (t === 'error' || t === 'warning') console.log('[console]', t, m.text());
});
page.on('pageerror', e => console.log('[pageerror]', e.message));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

await page.screenshot({
  path: 'scripts/visual-tests/out/block-editor.png',
  fullPage: false,
});

console.log('saved scripts/visual-tests/out/block-editor.png');
await browser.close();
