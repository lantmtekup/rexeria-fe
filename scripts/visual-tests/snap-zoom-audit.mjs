// Comprehensive zoom audit: viewport × device × sidebar state.
// Goal: catch every overflow/scroll case to understand what user sees.
import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const url = `${base}/canvas-templates/e3e3e3e3-2000-0000-0000-000000000001`;

const VIEWPORTS = [
  { name: 'macbook-1280', w: 1280, h: 800 },
  { name: 'fhd-1440', w: 1440, h: 900 },
  { name: 'fhd-1920', w: 1920, h: 1080 },
];

const browser = await chromium.launch();

for (const v of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: v.w, height: v.h },
  });
  const page = await ctx.newPage();

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  for (const dev of ['Desktop', 'Tablet', 'Mobile']) {
    await page.getByRole('button', { name: dev }).first().click();
    await page.waitForTimeout(400);

    const info = await page.evaluate(() => {
      // Surface = the <div className='relative flex flex-1 ... overflow-auto bg-[#f3f1ec] p-8'>
      // Find by class match.
      const surface = Array.from(document.querySelectorAll('div')).find(
        d =>
          d.className.includes('overflow-auto') &&
          d.className.includes('p-8') &&
          d.className.includes('bg-[#f3f1ec]')
      );
      const inner = surface?.querySelector(':scope > .\\@container');
      const innerStyle = inner ? getComputedStyle(inner) : null;
      const innerRect = inner?.getBoundingClientRect();
      const surfaceRect = surface?.getBoundingClientRect();
      // Zoom % shown in tab bar
      const zoomLabel = Array.from(document.querySelectorAll('span'))
        .map(s => s.textContent?.trim())
        .find(t => t && /^\d{2,3}%$/.test(t));
      return {
        surface: surfaceRect
          ? {
              w: Math.round(surfaceRect.width),
              h: Math.round(surfaceRect.height),
            }
          : null,
        inner: innerRect
          ? { w: Math.round(innerRect.width), h: Math.round(innerRect.height) }
          : null,
        innerDeclaredWidth: innerStyle?.width,
        innerTransform: innerStyle?.transform,
        scrollWidth: surface?.scrollWidth ?? null,
        clientWidth: surface?.clientWidth ?? null,
        overflows: surface
          ? surface.scrollWidth > surface.clientWidth ||
            surface.scrollHeight > surface.clientHeight
          : null,
        zoomLabel,
      };
    });

    console.log(`\n=== ${v.name} (${v.w}×${v.h}) · ${dev} ===`);
    console.log('zoom shown =', info.zoomLabel);
    console.log('surface (visible)  =', info.surface);
    console.log(
      'surface scrollW    =',
      info.scrollWidth,
      '/ clientW=',
      info.clientWidth
    );
    console.log('inner declared w   =', info.innerDeclaredWidth);
    console.log('inner rendered     =', info.inner);
    console.log(
      'overflowing?       =',
      info.overflows ? '⚠️ YES (scroll)' : '✓ no'
    );
  }

  await page.screenshot({
    path: `scripts/visual-tests/out/zoom-${v.name}.png`,
  });

  await ctx.close();
}

await browser.close();
console.log('\ndone');
