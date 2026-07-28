// Measure delay between clicking Continue on the AI-Agents marketing/assets
// page and the destination URL becoming interactive. Distinguishes:
//   - dev-time route compilation (Turbopack)
//   - network requests fired by the destination
//   - client-side render time
//
// Usage:
//   BASE_URL=http://localhost:3003 \
//   PRODUCT_ID=c2c2c2c2-0000-0000-0000-000000000010 \
//   node scripts/visual-tests/measure-continue-delay.mjs

import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3003';
const PID = process.env.PRODUCT_ID ?? 'c2c2c2c2-0000-0000-0000-000000000010';
const log = (...a) =>
  console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();

// Network log — only meaningful entries.
const reqs = [];
page.on('request', r => reqs.push({ t: Date.now(), url: r.url() }));
page.on('requestfinished', async r => {
  const e = reqs.find(x => x.url === r.url() && !x.done);
  if (e) {
    e.done = Date.now();
    e.dur = e.done - e.t;
    e.status = r.response() ? (await r.response()).status() : null;
  }
});
page.on('pageerror', e => log('[pageerror]', e.message?.slice(0, 200)));

try {
  log('1) sign in');
  await page.goto(BASE + '/sign-in', { waitUntil: 'load' });
  await page.waitForSelector('input[type=email]', { timeout: 20000 });
  await page.locator('form button[type=submit]').first().click();
  await page.waitForURL(/\/home/, { timeout: 20000 });

  const startUrl = `${BASE}/ai-agents/${PID}/marketing/m1/assets`;
  log('2) goto', startUrl);
  await page.goto(startUrl, { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  // Reset network log starting from the click.
  reqs.length = 0;

  log('3) click Continue and measure');
  const t0 = Date.now();
  const continueBtn = page.locator('button:has-text("Continue")').first();
  await continueBtn.click();

  // Wait until URL changes (router.push completes) — this is the
  // "navigation committed" moment.
  await page.waitForURL(/\/campaign$/, { timeout: 30000 });
  const tNav = Date.now();

  // Wait for the destination's network to settle.
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  const tIdle = Date.now();

  log(`   click → URL change : ${tNav - t0}ms`);
  log(`   URL change → idle  : ${tIdle - tNav}ms`);
  log(`   total              : ${tIdle - t0}ms`);

  // List all network requests > 100ms during the window.
  const slow = reqs
    .filter(r => r.dur && r.dur >= 100)
    .map(r => ({ url: r.url, dur: r.dur, status: r.status }))
    .sort((a, b) => b.dur - a.dur)
    .slice(0, 12);

  console.log('\nNetwork requests ≥ 100ms after click:');
  for (const r of slow) {
    console.log(
      `   ${String(r.dur).padStart(5)}ms ${String(r.status ?? '').padStart(3)} ${r.url.replace(BASE, '')}`
    );
  }

  // ── Second click cycle (warm cache) ────────────────────────────────
  log('\n4) navigate back to assets and measure WARM continue');
  await page.goto(startUrl, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  reqs.length = 0;
  const w0 = Date.now();
  await page.locator('button:has-text("Continue")').first().click();
  await page.waitForURL(/\/campaign$/, { timeout: 15000 });
  const wNav = Date.now();
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  const wIdle = Date.now();
  log(`   warm click → URL : ${wNav - w0}ms`);
  log(`   warm URL → idle  : ${wIdle - wNav}ms`);
} finally {
  await browser.close();
}
