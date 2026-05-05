// Verify /product/:id/landing only shows landings whose product_id matches.
//
// Flow:
//   1. Sign in
//   2. Probe /api/rexer/projects → count total + count where product_id === ID
//   3. Goto /product/<ID>/landing → count rendered cards
//   4. Expect rendered count === filtered count (and < total)
//
// Usage: BASE_URL=http://localhost:3003 PRODUCT_ID=66666666-0000-0000-0000-000000000006 \
//          node scripts/visual-tests/verify-product-landing-filter.mjs

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'out');
await mkdir(OUT, { recursive: true });
const BASE = process.env.BASE_URL ?? 'http://localhost:3003';
const PRODUCT_ID =
  process.env.PRODUCT_ID ?? '66666666-0000-0000-0000-000000000006';
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

  log('2) probe /api/rexer/projects');
  const probe = await page.evaluate(async PID => {
    const r = await fetch('/api/rexer/projects', { credentials: 'include' });
    const body = await r.json();
    const items = body.items ?? [];
    return {
      total: items.length,
      forProduct: items.filter(p => p.product_id === PID).length,
    };
  }, PRODUCT_ID);
  log(`   total=${probe.total}, forProduct=${probe.forProduct}`);

  log('3) goto /product/<id>/landing');
  await page.goto(`${BASE}/product/${PRODUCT_ID}/landing`, {
    waitUntil: 'load',
  });
  await page.waitForTimeout(1500);

  // Each LandingCard renders an h3 with the project name.
  const renderedCards = await page
    .locator('h3.truncate.text-base.font-semibold')
    .count();
  log(`   rendered cards = ${renderedCards}`);

  if (renderedCards === probe.forProduct) {
    note('PASS', `Rendered count matches filtered (${renderedCards})`);
  } else {
    note(
      'FAIL',
      `Rendered ${renderedCards} ≠ filtered ${probe.forProduct} (total ${probe.total})`
    );
  }

  if (probe.total > probe.forProduct && renderedCards === probe.forProduct) {
    note(
      'PASS',
      `Filter is doing real work (hides ${probe.total - probe.forProduct} unrelated)`
    );
  } else if (probe.total === probe.forProduct) {
    note('·', `All projects already match this product — no extra hidden`);
  }

  await page.screenshot({
    path: join(OUT, 'product-landing-filter.png'),
    fullPage: true,
  });
} finally {
  await browser.close();
}

const passed = checks.filter(c => c.kind === 'PASS').length;
const failed = checks.filter(c => c.kind === 'FAIL').length;
log(`\nDone — ${passed} pass / ${failed} fail`);
process.exit(failed === 0 ? 0 : 1);
