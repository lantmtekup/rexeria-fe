import { chromium } from 'playwright';
const OUT = process.argv[2];
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
await page.evaluate(() => {
  const root = document.querySelector(
    '[data-block="framer-realestate02-location"]'
  );
  let s = root.parentElement;
  while (s && s.scrollHeight <= s.clientHeight) s = s.parentElement;
  const t = s ?? document.scrollingElement;
  t.scrollTop += t.clientHeight * 0.42;
});
await page.waitForTimeout(2000);
await el.screenshot({ path: OUT });
await browser.close();
