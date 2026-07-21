// Capture toolbar + editor at 3 viewports to audit mobile/tablet/desktop.
import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const url = `${base}/canvas-templates/e3e3e3e3-0000-0000-0000-000000000002`;

const browser = await chromium.launch();

const VIEWPORTS = [
  { name: 'mobile-390', w: 390, h: 844 },
  { name: 'tablet-768', w: 768, h: 1024 },
  { name: 'desktop-1280', w: 1280, h: 800 },
];

for (const v of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: v.w, height: v.h },
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // Empty state
  await page.screenshot({
    path: `scripts/visual-tests/out/resp-${v.name}-1empty.png`,
    fullPage: false,
  });

  // Click title to show toolbar
  const title = page.locator('[data-element-key="title"]').first();
  if (await title.count()) {
    await title.click();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: `scripts/visual-tests/out/resp-${v.name}-2text.png`,
      fullPage: false,
    });
  }

  await ctx.close();
  console.log('done', v.name);
}

await browser.close();
