import { chromium } from 'playwright';

const OUT =
  '/private/tmp/claude-501/-Users-ttcenter-Documents-TEKUP-2026-arexws/99b64a0b-a843-4ce9-835c-3f26806b9d14/scratchpad';
const URL =
  'http://localhost:1010/dev/blocks?type=framer_realestate02_location';

const WIDTHS = [390, 671, 672, 834, 1280, 1440];

const browser = await chromium.launch();
for (const w of WIDTHS) {
  const page = await browser.newPage({
    viewport: { width: Math.max(w + 80, 900), height: 1000 },
  });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-block="framer-realestate02-location"]', {
    timeout: 20000,
  });
  // `/dev/blocks` khoá bề ngang theo DEVICE_FRAME_WIDTH; ép thẳng để test
  // các mốc container tuỳ ý (672 / 1280 …) mà switcher không có.
  await page.evaluate(width => {
    const frame = document.querySelector('[data-device-frame]');
    frame.style.width = `${width}px`;
  }, w);
  await page.waitForTimeout(500);
  const el = page
    .locator('[data-block="framer-realestate02-location"]')
    .first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  // Đẩy thêm để block vượt mốc `top 15%` của scroller → heading tween chạy.
  await page.evaluate(() => {
    const root = document.querySelector(
      '[data-block="framer-realestate02-location"]'
    );
    let s = root.parentElement;
    while (s && s.scrollHeight <= s.clientHeight) s = s.parentElement;
    const target = s ?? document.scrollingElement;
    target.scrollTop += target.clientHeight * 0.42;
  });
  await page.waitForTimeout(1800);

  // Measure geometry of card + 3 photo windows + heading.
  const geo = await page.evaluate(() => {
    const root = document.querySelector(
      '[data-block="framer-realestate02-location"]'
    );
    const card = root.querySelector('.frel-card');
    const cb = card.getBoundingClientRect();
    const rel = r => ({
      x: +(r.left - cb.left).toFixed(1),
      y: +(r.top - cb.top).toFixed(1),
      w: +r.width.toFixed(1),
      h: +r.height.toFixed(1),
      right: +(r.right - cb.left).toFixed(1),
      bottom: +(r.bottom - cb.top).toFixed(1),
    });
    const windows = [...card.children]
      .filter(c => c.querySelector('img'))
      .map(c => rel(c.getBoundingClientRect()));
    const heading = card.querySelector('.frel-heading');
    return {
      card: { w: +cb.width.toFixed(1), h: +cb.height.toFixed(1) },
      windows,
      heading: rel(heading.getBoundingClientRect()),
      headingFont: getComputedStyle(heading).fontSize,
      headingWrapX: +(
        heading.parentElement.getBoundingClientRect().left - cb.left
      ).toFixed(1),
      innerTransforms: [...card.querySelectorAll('.frel-card > div > div')].map(
        d => getComputedStyle(d).transform
      ),
    };
  });
  console.log(`\n=== ${w}px ===`);
  console.log(JSON.stringify(geo, null, 1));

  await el.screenshot({ path: `${OUT}/loc-${w}.png` });
  await page.close();
}
await browser.close();
