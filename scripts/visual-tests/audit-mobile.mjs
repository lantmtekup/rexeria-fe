// Mobile responsive audit. Visits key pages at 375x812 (iPhone 13 mini),
// detects horizontal overflow, and snapshots full-page screenshots so we can
// review what breaks.
//
// Usage: BASE_URL=http://localhost:3003 node scripts/visual-tests/audit-mobile.mjs

import { chromium, devices } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'out', 'mobile');
await mkdir(OUT, { recursive: true });
const BASE = process.env.BASE_URL ?? 'http://localhost:3003';
const log = (...a) =>
  console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

const PAGES = [
  { slug: 'sign-in', path: '/sign-in', requiresAuth: false },
  { slug: 'home', path: '/home', requiresAuth: true },
  { slug: 'template', path: '/template', requiresAuth: true },
  { slug: 'product-list', path: '/product', requiresAuth: true },
  {
    slug: 'product-information',
    path: '/product/66666666-0000-0000-0000-000000000006/information',
    requiresAuth: true,
  },
  {
    slug: 'product-landing',
    path: '/product/66666666-0000-0000-0000-000000000006/landing',
    requiresAuth: true,
  },
  {
    slug: 'product-marketing',
    path: '/product/66666666-0000-0000-0000-000000000006/marketing',
    requiresAuth: true,
  },
  { slug: 'marketing', path: '/marketing', requiresAuth: true },
  { slug: 'ai-agents', path: '/ai-agents', requiresAuth: true },
  { slug: 'setting', path: '/setting', requiresAuth: true },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  ...devices['iPhone 13 Mini'],
  // Reduce noise from sticky header — we want a clean full-page shot.
  viewport: { width: 375, height: 812 },
  deviceScaleFactor: 2,
  hasTouch: true,
  isMobile: true,
});
const page = await ctx.newPage();
page.on('pageerror', e => log('[pageerror]', e.message?.slice(0, 200)));

log('sign in once to share auth across requests');
await page.goto(BASE + '/sign-in', { waitUntil: 'load' });
await page.waitForSelector('input[type=email]', { timeout: 20000 });
await page.locator('form button[type=submit]').first().click();
await page.waitForURL(/\/home/, { timeout: 20000 });

const findings = [];

for (const p of PAGES) {
  log(`→ ${p.path}`);
  try {
    await page.goto(BASE + p.path, { waitUntil: 'load' });
    await page.waitForTimeout(1500);

    const overflow = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = document.documentElement.clientWidth;
      const horiz = docW - winW;
      // Find offenders.
      const offenders = [];
      const all = document.querySelectorAll('body *');
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.right > winW + 1 && r.width < winW * 1.5 && r.width > 50) {
          offenders.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className?.toString?.() ?? '').slice(0, 100),
            right: Math.round(r.right),
            width: Math.round(r.width),
            text: (el.textContent ?? '').trim().slice(0, 40),
          });
          if (offenders.length >= 8) break;
        }
      }
      return { docW, winW, horiz, offenders };
    });

    findings.push({ slug: p.slug, path: p.path, ...overflow });

    await page.screenshot({
      path: join(OUT, `${p.slug}.png`),
      fullPage: true,
    });
    log(
      `   docW=${overflow.docW} winW=${overflow.winW} horiz=${overflow.horiz} offenders=${overflow.offenders.length}`
    );
  } catch (e) {
    log(`   ERROR ${e.message?.slice(0, 150)}`);
    findings.push({ slug: p.slug, path: p.path, error: e.message });
  }
}

await browser.close();

console.log('\n══════ MOBILE AUDIT RESULT ══════');
for (const f of findings) {
  if (f.error) {
    console.log(`❌ ${f.slug}  ERROR: ${f.error}`);
    continue;
  }
  if (f.horiz > 1) {
    console.log(`❌ ${f.slug}  overflow ${f.horiz}px`);
    for (const o of f.offenders) {
      console.log(
        `     ${o.tag}.${o.cls.split(' ').slice(0, 3).join('.')} ` +
          `right=${o.right} w=${o.width} "${o.text}"`
      );
    }
  } else {
    console.log(`✅ ${f.slug}`);
  }
}
const failing = findings.filter(f => !f.error && f.horiz > 1).length;
process.exit(failing === 0 ? 0 : 1);
