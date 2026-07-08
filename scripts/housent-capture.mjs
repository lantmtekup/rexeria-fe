// Capture live housent.webflow.io sections + our block previews for 1:1 compare.
// Run: node scripts/housent-capture.mjs
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '.tmp-recon',
  'housent-all'
);
await mkdir(OUT, { recursive: true });

const LIVE = 'https://housent.webflow.io/';
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

// block type → live section selector (class on the section element).
const MAP = [
  { type: 'housent_about', sel: '.who-we-are-section' },
  { type: 'housent_stats', sel: '.highlights-section' },
  { type: 'housent_excellence', sel: '.feature-circle-section' },
  { type: 'housent_solutions', sel: '.property-solution-section' },
  { type: 'housent_listings', sel: '.property-section.home-page' },
  { type: 'housent_values', sel: '.values-stack-section' },
  { type: 'housent_faq', sel: '.faq-sectrion' },
  { type: 'housent_testimonial', sel: '.testimonial-section' },
  { type: 'housent_blogs', sel: '.blogs-section.home-page' },
  { type: 'housent_cta', sel: '.cta-serction' },
  { type: 'housent_footer', sel: '.footer-section' },
];

const VIEWPORTS = [
  { name: 'desktop', w: 1440, h: 900 },
  { name: 'mobile', w: 390, h: 844 },
];

const browser = await chromium.launch();

// ── 1) Live site: one page per viewport, screenshot each section by selector.
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
  });
  const page = await ctx.newPage();
  await page.goto(LIVE, { waitUntil: 'networkidle', timeout: 60000 });
  // Trigger lazy content: scroll to bottom then back to top.
  await page.evaluate(async () => {
    const step = window.innerHeight;
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);

  for (const { type, sel } of MAP) {
    const el = page.locator(sel).first();
    try {
      await el.scrollIntoViewIfNeeded({ timeout: 5000 });
      await page.waitForTimeout(400);
      await el.screenshot({ path: join(OUT, `live-${type}-${vp.name}.png`) });
      console.log(`✓ live ${type} ${vp.name}`);
    } catch (e) {
      console.log(`✗ live ${type} ${vp.name}: ${e.message.split('\n')[0]}`);
    }
  }
  await ctx.close();
}

// ── 2) Our blocks: /dev/blocks?type=… (default content). Screenshot the block root.
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
  });
  const page = await ctx.newPage();
  for (const { type } of MAP) {
    const url = `${BASE}/dev/blocks?type=${type}`;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(900);
      // The block renders inside the scroller; capture the first data-block-ish root.
      const target = page
        .locator('.\\@container > *, [data-block-root]')
        .first();
      const box = await target.boundingBox().catch(() => null);
      if (box) {
        await target.screenshot({
          path: join(OUT, `block-${type}-${vp.name}.png`),
        });
      } else {
        await page.screenshot({
          path: join(OUT, `block-${type}-${vp.name}.png`),
          fullPage: false,
        });
      }
      console.log(`✓ block ${type} ${vp.name}`);
    } catch (e) {
      console.log(`✗ block ${type} ${vp.name}: ${e.message.split('\n')[0]}`);
    }
  }
  await ctx.close();
}

await browser.close();
console.log(`\nDone → ${OUT}`);
