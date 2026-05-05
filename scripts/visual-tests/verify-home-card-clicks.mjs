// Verify click navigation on /home cards.
//
// Flow:
//   1. Sign in → /home
//   2. Click first Template card  → expect /canvas-templates/:id
//   3. Back → click first Product card → expect /product/:id/information
//
// Usage: BASE_URL=http://localhost:3003 node scripts/visual-tests/verify-home-card-clicks.mjs

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'out');
await mkdir(OUT, { recursive: true });
const BASE = process.env.BASE_URL ?? 'http://localhost:3003';
const log = (...a) =>
  console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

const checks = [];
const note = (kind, msg) => {
  checks.push({ kind, msg });
  log(`   ${kind === 'PASS' ? '✅' : kind === 'FAIL' ? '❌' : '·'} ${msg}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();
page.on('pageerror', e =>
  note('FAIL', `pageerror: ${e.message?.slice(0, 200)}`)
);

try {
  log('1) sign in');
  await page.goto(BASE + '/sign-in', { waitUntil: 'load' });
  await page.waitForSelector('input[type=email]', { timeout: 20000 });
  await page.locator('form button[type=submit]').first().click();
  await page.waitForURL(/\/home/, { timeout: 20000 });
  await page.waitForTimeout(1500);
  log('   url =', page.url());

  // ── Template card click ─────────────────────────────────────────────
  log('2) click first Template card');
  const tplSection = page
    .locator('section', { has: page.locator('text=/^Template$/') })
    .first();
  const firstTplLink = tplSection
    .locator('a[href^="/canvas-templates/"]')
    .first();
  await firstTplLink.waitFor({ state: 'visible', timeout: 10000 });
  const tplHref = await firstTplLink.getAttribute('href');
  log('   first template href =', tplHref);
  if (tplHref && /^\/canvas-templates\/[^/]+$/.test(tplHref)) {
    note('PASS', `Template card has correct href shape: ${tplHref}`);
  } else {
    note('FAIL', `Template href not /canvas-templates/:id — got "${tplHref}"`);
  }

  await firstTplLink.click();
  await page
    .waitForURL(new RegExp(`${tplHref?.replace(/\//g, '\\/')}$`), {
      timeout: 15000,
    })
    .catch(e =>
      note('FAIL', `did not navigate to template detail: ${e.message}`)
    );
  log('   url after click =', page.url());
  if (page.url().endsWith(tplHref ?? '__nope__')) {
    note('PASS', 'Navigated to template detail');
  } else {
    note('FAIL', `URL mismatch: ${page.url()}`);
  }
  await page.screenshot({ path: join(OUT, 'home-tpl-detail.png') });

  // ── Back to /home then Product card click ───────────────────────────
  log('3) back to /home');
  await page.goto(BASE + '/home', { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  log('4) click first Product card');
  const prdSection = page
    .locator('section', { has: page.locator('text=/^Product$/') })
    .first();
  const firstPrdLink = prdSection.locator('a[href^="/product/"]').first();
  await firstPrdLink.waitFor({ state: 'visible', timeout: 10000 });
  const prdHref = await firstPrdLink.getAttribute('href');
  log('   first product href =', prdHref);
  if (prdHref && /^\/product\/[^/]+\/information$/.test(prdHref)) {
    note('PASS', `Product card has correct href shape: ${prdHref}`);
  } else {
    note(
      'FAIL',
      `Product href not /product/:id/information — got "${prdHref}"`
    );
  }

  await firstPrdLink.click();
  await page
    .waitForURL(new RegExp(`${prdHref?.replace(/\//g, '\\/')}$`), {
      timeout: 15000,
    })
    .catch(e =>
      note('FAIL', `did not navigate to product information: ${e.message}`)
    );
  log('   url after click =', page.url());
  if (page.url().endsWith(prdHref ?? '__nope__')) {
    note('PASS', 'Navigated to product information');
  } else {
    note('FAIL', `URL mismatch: ${page.url()}`);
  }
  await page.screenshot({ path: join(OUT, 'home-prd-detail.png') });
} finally {
  await browser.close();
}

const passed = checks.filter(c => c.kind === 'PASS').length;
const failed = checks.filter(c => c.kind === 'FAIL').length;
log(`\nDone — ${passed} pass / ${failed} fail`);
process.exit(failed === 0 ? 0 : 1);
