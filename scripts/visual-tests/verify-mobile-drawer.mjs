// Verify the mobile sidebar drawer.
//
// Flow:
//   1. Sign in (mobile viewport 375x812)
//   2. /home: sidebar should be hidden by default (translated off-screen)
//   3. Tap hamburger → drawer slides into view (translateX = 0)
//   4. Backdrop is visible
//   5. Tap a nav item ("Template") → URL changes, drawer auto-closes
//   6. Tap hamburger again, then tap backdrop → drawer closes
//
// Usage: BASE_URL=http://localhost:3003 node scripts/visual-tests/verify-mobile-drawer.mjs

import { chromium, devices } from 'playwright';
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
  ...devices['iPhone 13 Mini'],
  viewport: { width: 375, height: 812 },
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();
page.on('pageerror', e =>
  note('FAIL', `pageerror: ${e.message?.slice(0, 200)}`)
);

const aside = page.locator('aside[aria-label]').first();
// Top-bar toggle — aria-label flips between "Mở menu" / "Đóng menu".
// Scope to the sticky <main> top bar so we don't also match the drawer's
// internal close button (also "Đóng menu").
const toggle = page
  .locator(
    'main button[aria-label="Mở menu"], main button[aria-label="Đóng menu"]'
  )
  .first();
const backdrop = page.locator('div[aria-hidden].fixed.inset-0.z-40').first();

const isOnscreen = async loc => {
  const x = await loc.evaluate(el =>
    Math.round(el.getBoundingClientRect().left)
  );
  return x >= -1; // translated to 0 means visible
};

try {
  log('1) sign in');
  await page.goto(BASE + '/sign-in', { waitUntil: 'load' });
  await page.waitForSelector('input[type=email]', { timeout: 20000 });
  await page.locator('form button[type=submit]').first().click();
  await page.waitForURL(/\/home/, { timeout: 20000 });
  await page.waitForTimeout(800);

  log('2) sidebar hidden by default');
  const closedX = await aside.evaluate(el =>
    Math.round(el.getBoundingClientRect().left)
  );
  log('   closed left =', closedX);
  if (closedX < 0) note('PASS', `Drawer off-screen at start (left=${closedX})`);
  else note('FAIL', `Drawer not hidden — left=${closedX}`);

  log('3) tap hamburger → drawer opens');
  await toggle.click();
  await page.waitForTimeout(350);
  if (await isOnscreen(aside)) note('PASS', 'Drawer slides in');
  else note('FAIL', 'Drawer did not open');

  // Backdrop should be visible (opacity 1 / pointer-events auto)
  const backdropVisible = await backdrop.evaluate(
    el => getComputedStyle(el).opacity === '1'
  );
  if (backdropVisible) note('PASS', 'Backdrop is visible');
  else note('FAIL', 'Backdrop hidden while drawer open');

  await page.screenshot({ path: join(OUT, 'mobile/drawer-open.png') });

  log('4) tap "Template" nav → drawer auto-closes + URL changes');
  await page.locator('aside a[href="/template"]').first().click();
  await page.waitForURL(/\/template$/, { timeout: 10000 });
  await page.waitForTimeout(400);
  const afterNavX = await aside.evaluate(el =>
    Math.round(el.getBoundingClientRect().left)
  );
  if (afterNavX < 0)
    note('PASS', `Drawer closed after nav (left=${afterNavX})`);
  else note('FAIL', `Drawer still open after nav (left=${afterNavX})`);

  log('5) re-open then tap backdrop → closes');
  await toggle.click();
  await page.waitForTimeout(350);
  if (await isOnscreen(aside)) note('PASS', 'Re-opened');
  else note('FAIL', 'Did not re-open');

  // Click on backdrop (outside the aside).
  await backdrop.click({ position: { x: 350, y: 400 } });
  await page.waitForTimeout(350);
  const afterBackdropX = await aside.evaluate(el =>
    Math.round(el.getBoundingClientRect().left)
  );
  if (afterBackdropX < 0)
    note('PASS', `Closed via backdrop (left=${afterBackdropX})`);
  else note('FAIL', `Backdrop click did not close (left=${afterBackdropX})`);

  log('6) close via X button inside drawer header');
  await toggle.click();
  await page.waitForTimeout(350);
  if (await isOnscreen(aside)) note('PASS', 'Re-opened via toggle');
  else note('FAIL', 'Re-open via toggle failed');

  // The main toggle's aria-label flips while open.
  const labelWhenOpen = await toggle.getAttribute('aria-label');
  if (labelWhenOpen === 'Đóng menu')
    note('PASS', 'Toggle aria-label flips to "Đóng menu" when open');
  else
    note(
      'FAIL',
      `Expected aria-label "Đóng menu" while open, got "${labelWhenOpen}"`
    );

  // The drawer renders its own close button so the user can close it from
  // inside (the main top bar's hamburger gets covered on narrow phones).
  const drawerClose = page
    .locator('aside button[aria-label="Đóng menu"]')
    .first();
  await drawerClose.click();
  await page.waitForTimeout(350);
  const afterDrawerCloseX = await aside.evaluate(el =>
    Math.round(el.getBoundingClientRect().left)
  );
  if (afterDrawerCloseX < 0)
    note('PASS', `Drawer X closed it (left=${afterDrawerCloseX})`);
  else note('FAIL', `Drawer X did not close (left=${afterDrawerCloseX})`);

  await page.screenshot({ path: join(OUT, 'mobile/drawer-closed.png') });
} finally {
  await browser.close();
}

const passed = checks.filter(c => c.kind === 'PASS').length;
const failed = checks.filter(c => c.kind === 'FAIL').length;
log(`\nDone — ${passed} pass / ${failed} fail`);
process.exit(failed === 0 ? 0 : 1);
