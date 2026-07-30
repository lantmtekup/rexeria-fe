import { chromium } from 'playwright';

const base = 'https://portal.rexerstudio.com';
const url = `${base}/canvas-templates/e3e3e3e3-0000-0000-0000-000000000002`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();

const reqFails = [];
page.on('requestfailed', r =>
  reqFails.push({ url: r.url(), err: r.failure()?.errorText })
);
const consoleMsgs = [];
page.on('console', m => {
  const t = m.type();
  if (t === 'error' || t === 'warning') consoleMsgs.push(`[${t}] ${m.text()}`);
});
page.on('pageerror', e => consoleMsgs.push(`[pageerror] ${e.message}`));

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(8000);
await page.screenshot({ path: 'scripts/visual-tests/out/img-editor.png' });

// Inspect images
const images = await page.evaluate(() => {
  const out = [];
  for (const img of document.images) {
    out.push({
      src: img.currentSrc || img.src,
      naturalW: img.naturalWidth,
      naturalH: img.naturalHeight,
      complete: img.complete,
      visible:
        img.offsetWidth > 0 &&
        img.offsetHeight > 0 &&
        getComputedStyle(img).visibility !== 'hidden',
    });
  }
  // Also collect background-image divs
  for (const el of document.querySelectorAll('[style*="background-image"]')) {
    const bg = getComputedStyle(el).backgroundImage;
    out.push({
      src: bg,
      asBg: true,
      visible:
        el.offsetWidth > 0 &&
        el.offsetHeight > 0 &&
        getComputedStyle(el).visibility !== 'hidden',
    });
  }
  return out;
});

console.log('--- IMAGES ON PAGE ---');
console.log(JSON.stringify(images, null, 2));

console.log('\n--- REQUEST FAILURES ---');
console.log(JSON.stringify(reqFails, null, 2));

console.log('\n--- CONSOLE ---');
console.log(consoleMsgs.join('\n'));

await browser.close();
