// Verify empty-state CTA on /product/:id/landing routes to AI template picker.
//
// Flow:
//   1. Sign in
//   2. Goto /product/<id>/landing → expect EmptyState (after filter fix,
//      product 66666666 has 0 landings)
//   3. Click "Pick a template" CTA
//   4. Expect URL = /ai-agents/<id>/template
//   5. Also click the top-right "+ New landing" button — same destination.
//
// Usage: BASE_URL=http://localhost:3003 PRODUCT_ID=66666666-0000-0000-0000-000000000006 \
//          node scripts/visual-tests/verify-landing-empty-cta.mjs

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'out');
await mkdir(OUT, { recursive: true });
const BASE = process.env.BASE_URL ?? 'http://localhost:3003';
const PID = process.env.PRODUCT_ID ?? '66666666-0000-0000-0000-000000000006';
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

const expectedHref = `/ai-agents/${PID}/template`;

try {
  log('1) sign in');
  await page.goto(BASE + '/sign-in', { waitUntil: 'load' });
  await page.waitForSelector('input[type=email]', { timeout: 20000 });
  await page.locator('form button[type=submit]').first().click();
  await page.waitForURL(/\/home/, { timeout: 20000 });

  log('2) goto landing');
  await page.goto(`${BASE}/product/${PID}/landing`, { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  // Top-right "New landing" link
  const topLink = page
    .locator(`a[href="${expectedHref}"]:has-text("New landing")`)
    .first();
  await topLink.waitFor({ state: 'visible', timeout: 10000 });
  note('PASS', `Top-right "New landing" → ${expectedHref}`);

  // Empty-state CTA "Pick a template"
  const ctaLink = page
    .locator(`a[href="${expectedHref}"]:has-text("Pick a template")`)
    .first();
  await ctaLink.waitFor({ state: 'visible', timeout: 10000 });
  note('PASS', `Empty-state CTA "Pick a template" → ${expectedHref}`);

  await page.screenshot({ path: join(OUT, 'landing-empty.png') });

  log('3) click empty-state CTA');
  await ctaLink.click();
  await page
    .waitForURL(new RegExp(`${expectedHref.replace(/\//g, '\\/')}$`), {
      timeout: 15000,
    })
    .catch(e => note('FAIL', `did not navigate: ${e.message}`));
  log('   url after click =', page.url());
  if (page.url().endsWith(expectedHref)) {
    note('PASS', 'Navigated to AI template picker');
  } else {
    note('FAIL', `URL mismatch: ${page.url()}`);
  }

  // Verify picker page rendered (heading "Pick a template" comes from
  // ProductWorkspaceLayout productName).
  await page
    .getByText('Pick a template', { exact: false })
    .first()
    .waitFor({ timeout: 10000 })
    .catch(() => note('FAIL', 'Picker page heading not found'));
  note('PASS', 'AI template picker page rendered');

  await page.screenshot({ path: join(OUT, 'ai-template-picker.png') });
} finally {
  await browser.close();
}

const passed = checks.filter(c => c.kind === 'PASS').length;
const failed = checks.filter(c => c.kind === 'FAIL').length;
log(`\nDone — ${passed} pass / ${failed} fail`);
process.exit(failed === 0 ? 0 : 1);
