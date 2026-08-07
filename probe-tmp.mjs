import { chromium } from 'playwright';
const label = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });
await page.goto(
  'http://localhost:1010/dev/blocks?type=framer_realestate02_location',
  { waitUntil: 'networkidle' }
);
await page.waitForSelector('[data-block="framer-realestate02-location"]', {
  timeout: 20000,
});
await page.evaluate(() => {
  document.querySelector('[data-device-frame]').style.width = '390px';
});
await page.waitForTimeout(400);
const el = page.locator('[data-block="framer-realestate02-location"]').first();
await el.scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
const scrollInfo = await page.evaluate(() => {
  const root = document.querySelector(
    '[data-block="framer-realestate02-location"]'
  );
  let s = root.parentElement;
  while (s && s.scrollHeight <= s.clientHeight) s = s.parentElement;
  const t = s ?? document.scrollingElement;
  t.scrollTop += t.clientHeight * 0.42;
  return { scrollTop: t.scrollTop, ch: t.clientHeight };
});
await page.waitForTimeout(2000);
const m = await page.evaluate(() => {
  const card = document.querySelector('.frel-card');
  const cb = card.getBoundingClientRect();
  const wins = [...card.children].filter(c => c.querySelector('img'));
  return wins.map(w => {
    const inner = w.firstElementChild;
    const img = w.querySelector('img');
    const r = e => {
      const b = e.getBoundingClientRect();
      return [
        +(b.left - cb.left).toFixed(2),
        +(b.top - cb.top).toFixed(2),
        +b.width.toFixed(2),
        +b.height.toFixed(2),
      ];
    };
    return {
      win: r(w),
      inner: r(inner),
      img: r(img),
      tf: getComputedStyle(inner).transform,
      complete: img.complete,
      nat: [img.naturalWidth, img.naturalHeight],
    };
  });
});
console.log(label, JSON.stringify({ scrollInfo, m }, null, 1));
await browser.close();
