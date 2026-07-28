// Smoke test against the deployed Cloudflare Workers build.
// Production sign-in form is NOT pre-filled — we have to type credentials.
//
// Covers:
//   1. /sign-in renders + login works (or surface auth error early)
//   2. /home loads without page errors
//   3. Mobile viewport: ☰ opens drawer, X / backdrop close it
//   4. Network errors and console errors are surfaced
//   5. Full-page mobile + desktop screenshots saved for visual review
//
// Usage:
//   BASE_URL=https://portal.rexerstudio.com \
//   USER_EMAIL=admin@rexer.ai USER_PASSWORD=Admin1234 \
//   node scripts/visual-tests/smoke-prod.mjs

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'out', 'prod');
await mkdir(OUT, { recursive: true });
const BASE = process.env.BASE_URL ?? 'https://portal.rexerstudio.com';
const EMAIL = process.env.USER_EMAIL ?? 'admin@rexer.ai';
const PASSWORD = process.env.USER_PASSWORD ?? 'Admin1234';
const log = (...a) =>
  console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

const checks = [];
const note = (kind, msg) => {
  checks.push({ kind, msg });
  log(`   ${kind === 'PASS' ? '✅' : kind === 'FAIL' ? '❌' : '·'} ${msg}`);
};

const browser = await chromium.launch();

const collect = (page, label) => {
  const errs = [];
  page.on('pageerror', e =>
    errs.push(`[pageerror:${label}] ${e.message?.slice(0, 200)}`)
  );
  page.on('console', m => {
    if (m.type() === 'error')
      errs.push(`[console:${label}] ${m.text().slice(0, 200)}`);
  });
  page.on('requestfailed', r =>
    errs.push(
      `[reqfailed:${label}] ${r.url().replace(BASE, '')} ${r.failure()?.errorText ?? ''}`
    )
  );
  return errs;
};

const signIn = async page => {
  await page.goto(BASE + '/sign-in', { waitUntil: 'load' });
  await page.waitForSelector('input[type=email]', { timeout: 30000 });
  await page.fill('input[type=email]', EMAIL);
  await page.fill('input[type=password]', PASSWORD);
  await page.locator('form button[type=submit]').first().click();
  await page.waitForURL(/\/home/, { timeout: 30000 });
};

// ── 1. DESKTOP smoke ────────────────────────────────────────────────
{
  log('═══ Desktop 1440×900 ═══');
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  const errs = collect(page, 'desktop');

  try {
    await page.goto(BASE + '/sign-in', { waitUntil: 'load' });
    await page.waitForSelector('input[type=email]', { timeout: 30000 });
    note('PASS', '/sign-in renders');

    await page.fill('input[type=email]', EMAIL);
    await page.fill('input[type=password]', PASSWORD);
    await page.locator('form button[type=submit]').first().click();
    try {
      await page.waitForURL(/\/home/, { timeout: 30000 });
      note('PASS', `Login succeeds → ${page.url()}`);
    } catch {
      note('FAIL', `Login did not redirect to /home (current=${page.url()})`);
      await page.screenshot({ path: join(OUT, 'desktop-signin-fail.png') });
      throw new Error('Login failed — aborting downstream desktop checks');
    }

    await page.waitForTimeout(1500);
    const greeting = await page.locator('h1').first().textContent();
    note(
      greeting?.includes('Hi') || greeting?.includes('Welcome')
        ? 'PASS'
        : 'FAIL',
      `Greeting on /home: "${greeting?.slice(0, 60)}"`
    );

    // Spot-check key API responses
    const probe = await page.evaluate(async () => {
      const r = await fetch('/api/rexer/auth/me', { credentials: 'include' });
      const me = await r.text();
      const rT = await fetch(
        '/api/rexer/canvas-templates?is_active=true&limit=6',
        {
          credentials: 'include',
        }
      );
      const rP = await fetch('/api/rexer/products?limit=6', {
        credentials: 'include',
      });
      return {
        meStatus: r.status,
        tplStatus: rT.status,
        prdStatus: rP.status,
        meBody: me.slice(0, 200),
      };
    });
    note(
      probe.meStatus === 200 ? 'PASS' : 'FAIL',
      `/auth/me → ${probe.meStatus}`
    );
    note(
      probe.tplStatus === 200 ? 'PASS' : 'FAIL',
      `/canvas-templates → ${probe.tplStatus}`
    );
    note(
      probe.prdStatus === 200 ? 'PASS' : 'FAIL',
      `/products → ${probe.prdStatus}`
    );

    await page.screenshot({
      path: join(OUT, 'desktop-home.png'),
      fullPage: true,
    });

    // Click first template card
    const tplLink = page.locator('a[href^="/canvas-templates/"]').first();
    if ((await tplLink.count()) > 0) {
      const href = await tplLink.getAttribute('href');
      await tplLink.click();
      await page.waitForURL(new RegExp(href.replace(/\//g, '\\/') + '$'), {
        timeout: 20000,
      });
      note('PASS', `Template click → ${href}`);
      await page.screenshot({ path: join(OUT, 'desktop-canvas-detail.png') });
    } else {
      note('·', 'No template cards on home (BE empty)');
    }
  } catch (e) {
    note('FAIL', `desktop flow error: ${e.message?.slice(0, 200)}`);
  } finally {
    if (errs.length) {
      log('Desktop runtime errors:');
      errs.slice(0, 8).forEach(e => log('   ' + e));
    }
    await ctx.close();
  }
}

// ── 2. MOBILE smoke ─────────────────────────────────────────────────
{
  log('\n═══ Mobile 375×812 ═══');
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  const errs = collect(page, 'mobile');

  try {
    await signIn(page);
    note('PASS', 'Mobile login succeeds');
    await page.waitForTimeout(1500);

    // Horizontal overflow check on /home
    const overflow = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = document.documentElement.clientWidth;
      return { docW, winW, horiz: docW - winW };
    });
    if (overflow.horiz <= 1)
      note('PASS', `No horizontal overflow on /home (docW=${overflow.docW})`);
    else note('FAIL', `Horizontal overflow ${overflow.horiz}px on /home`);
    await page.screenshot({
      path: join(OUT, 'mobile-home.png'),
      fullPage: true,
    });

    // Drawer flow
    const aside = page.locator('aside[aria-label]').first();
    const toggle = page
      .locator(
        'main button[aria-label="Mở menu"], main button[aria-label="Đóng menu"]'
      )
      .first();
    const closedX = await aside.evaluate(el =>
      Math.round(el.getBoundingClientRect().left)
    );
    if (closedX < 0) note('PASS', `Drawer hidden at start (left=${closedX})`);
    else note('FAIL', `Drawer visible at start (left=${closedX})`);

    if ((await toggle.count()) > 0) {
      await toggle.click();
      await page.waitForTimeout(400);
      const openX = await aside.evaluate(el =>
        Math.round(el.getBoundingClientRect().left)
      );
      if (openX >= -1) note('PASS', `Drawer opens (left=${openX})`);
      else note('FAIL', `Drawer did not open (left=${openX})`);
      await page.screenshot({ path: join(OUT, 'mobile-drawer-open.png') });

      const drawerClose = page
        .locator('aside button[aria-label="Đóng menu"]')
        .first();
      if ((await drawerClose.count()) > 0) {
        await drawerClose.click();
        await page.waitForTimeout(400);
        const reClosedX = await aside.evaluate(el =>
          Math.round(el.getBoundingClientRect().left)
        );
        if (reClosedX < 0) note('PASS', `Drawer X closes (left=${reClosedX})`);
        else note('FAIL', `Drawer X did not close (left=${reClosedX})`);
      } else {
        note('FAIL', 'Drawer header has no close button (regression)');
      }
    } else {
      note('FAIL', 'Mobile top-bar toggle button not found');
    }

    // Visit /product list and /marketing for overflow checks
    for (const slug of ['/product', '/marketing', '/template']) {
      await page.goto(BASE + slug, { waitUntil: 'load' });
      await page.waitForTimeout(1500);
      const ov = await page.evaluate(() => {
        const docW = document.documentElement.scrollWidth;
        const winW = document.documentElement.clientWidth;
        return docW - winW;
      });
      const filename = `mobile${slug.replace(/\//g, '-')}.png`;
      await page.screenshot({ path: join(OUT, filename), fullPage: true });
      if (ov <= 1) note('PASS', `${slug} no horizontal overflow`);
      else note('FAIL', `${slug} overflow ${ov}px`);
    }
  } catch (e) {
    note('FAIL', `mobile flow error: ${e.message?.slice(0, 200)}`);
  } finally {
    if (errs.length) {
      log('Mobile runtime errors:');
      errs.slice(0, 8).forEach(e => log('   ' + e));
    }
    await ctx.close();
  }
}

await browser.close();

const passed = checks.filter(c => c.kind === 'PASS').length;
const failed = checks.filter(c => c.kind === 'FAIL').length;
log(`\n══════ SMOKE PROD RESULT ══════`);
log(`${passed} pass / ${failed} fail (${BASE})`);
process.exit(failed === 0 ? 0 : 1);
