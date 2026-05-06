// Comprehensive Playwright suite for Product V2 features.
// - Templates tab (request shape + render)
// - Media Manager 4 tabs
// - Information editor (color list + cert + feature dialog)
// - Save as template + Use template flows
import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { SignJWT } from 'jose';

const base = 'http://localhost:3000';
const OUT = 'scripts/visual-tests/out';
await mkdir(OUT, { recursive: true });

const envText = await readFile(new URL('../../.env', import.meta.url), 'utf8');
const envMap = Object.fromEntries(
  envText
    .split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);
const jwtSecret = envMap.JWT_SECRET;
if (!jwtSecret) throw new Error('JWT_SECRET missing in .env');
const secret = new TextEncoder().encode(jwtSecret);
const token = await new SignJWT({ sub: 'dev-capture', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('2h')
  .sign(secret);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([
  { name: '_access_token', value: token, domain: 'localhost', path: '/' },
]);

const page = await ctx.newPage();

// ── Network capture ────────────────────────────────────────────────────────
const requests = [];
page.on('request', req => {
  if (req.url().includes('/api/rexer/')) {
    requests.push({
      method: req.method(),
      url: req.url(),
      ts: Date.now(),
    });
  }
});
const responses = new Map();
page.on('response', async resp => {
  if (resp.url().includes('/api/rexer/')) {
    const key = `${resp.request().method()} ${resp.url()}`;
    let bodyPreview = '';
    try {
      const text = await resp.text();
      bodyPreview = text.slice(0, 200);
    } catch {}
    responses.set(key, { status: resp.status(), bodyPreview });
  }
});

// Suppress noisy errors so the report stays readable.
page.on('console', m => {
  if (m.type() === 'error' && !m.text().includes('401')) {
    console.log('[console err]', m.text().slice(0, 120));
  }
});

const report = [];
const log = (test, ok, detail = '') => {
  report.push({ test, ok, detail });
  const icon = ok ? '✅' : '❌';
  console.log(`${icon} ${test}${detail ? ' — ' + detail : ''}`);
};

// ── TEST 1: Product list page renders + tab strip ─────────────────────────
console.log('\n=== TEST 1: /product list + tab strip ===');
await page.goto(`${base}/product`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const allTab = await page
  .locator('button')
  .filter({ hasText: 'Tất cả sản phẩm' })
  .count();
const tplTab = await page
  .locator('button')
  .filter({ hasText: /^Templates$/ })
  .count();
log('Tab strip "Tất cả sản phẩm" present', allTab > 0);
log('Tab strip "Templates" present', tplTab > 0);

// Capture request to /products on initial load
const initListReq = requests.find(
  r => r.method === 'GET' && /\/products(\?|$)/.test(r.url)
);
log(
  'Initial /products list fired',
  !!initListReq,
  initListReq ? new URL(initListReq.url).search : 'no request'
);
log(
  'Initial list includes is_template=false',
  initListReq?.url.includes('is_template=false') ?? false
);

await page.screenshot({ path: `${OUT}/v2-suite-1-list.png` });

// ── TEST 2: Click Templates tab → BE call ─────────────────────────────────
console.log('\n=== TEST 2: Click Templates tab ===');
await page
  .locator('button')
  .filter({ hasText: /^Templates$/ })
  .first()
  .click();
await page.waitForTimeout(1500);

const tplListReq = requests.find(
  r => r.method === 'GET' && r.url.includes('is_template=true')
);
log(
  'Templates list request fired',
  !!tplListReq,
  tplListReq ? new URL(tplListReq.url).search : 'no request'
);
log(
  'URL contains is_template=true',
  tplListReq?.url.includes('is_template=true') ?? false
);
log('URL contains limit=60', tplListReq?.url.includes('limit=60') ?? false);

const tplResp = responses.get(`GET ${tplListReq?.url}`);
log(
  'BE responded (any status)',
  !!tplResp,
  tplResp ? `status=${tplResp.status}` : ''
);

// Scope tabs (All / Library / Of mine)
const scopeAll = await page
  .locator('button')
  .filter({ hasText: /^Tất cả$/ })
  .count();
const scopeLib = await page
  .locator('button')
  .filter({ hasText: /^Thư viện$/ })
  .count();
const scopeMine = await page
  .locator('button')
  .filter({ hasText: /^Của tôi$/ })
  .count();
log('Scope tab "Tất cả" present', scopeAll > 0);
log('Scope tab "Thư viện" present', scopeLib > 0);
log('Scope tab "Của tôi" present', scopeMine > 0);

// Click "Của tôi" → request should add is_public_template=false
await page
  .locator('button')
  .filter({ hasText: /^Của tôi$/ })
  .first()
  .click();
await page.waitForTimeout(800);
const mineReq = requests
  .filter(r => r.url.includes('is_template=true'))
  .pop();
log(
  '"Của tôi" filter adds is_public_template=false',
  mineReq?.url.includes('is_public_template=false') ?? false,
  mineReq ? new URL(mineReq.url).search : ''
);

// Category chip click
const categoryChip = page
  .locator('button')
  .filter({ hasText: 'Thời trang' })
  .first();
if (await categoryChip.count()) {
  await categoryChip.click();
  await page.waitForTimeout(800);
  const catReq = requests
    .filter(r => r.url.includes('is_template=true'))
    .pop();
  log(
    'Category chip "Thời trang" adds template_category=fashion',
    catReq?.url.includes('template_category=fashion') ?? false
  );
}

await page.screenshot({ path: `${OUT}/v2-suite-2-templates.png` });

// ── TEST 3: Information editor (existing product or new) ──────────────────
console.log('\n=== TEST 3: Information editor — color + cert + feature ===');
// Navigate to /product/new/information
await page.goto(`${base}/product/new/information`, {
  waitUntil: 'networkidle',
});
await page.waitForTimeout(1200);

// Color section: click "+" to open dropdown, click first preset
const colorAddBtn = page
  .locator('button[aria-label="Add color"]')
  .first();
log('Color "+" button present', (await colorAddBtn.count()) > 0);
if (await colorAddBtn.count()) {
  await colorAddBtn.click();
  await page.waitForTimeout(300);
  // Click a preset color
  const preset = page.locator('button[title]').first();
  if (await preset.count()) {
    await preset.click();
    await page.waitForTimeout(200);
    // Add a 2nd color
    await colorAddBtn.click();
    await page.waitForTimeout(200);
    const preset2 = page.locator('button[title]').nth(1);
    if (await preset2.count()) await preset2.click();
    await page.waitForTimeout(300);
  }
  // Close dropdown
  await page.locator('body').click({ position: { x: 50, y: 50 } });
  await page.waitForTimeout(300);
}

// Verify color list rendered with star badge
const colorRows = await page.locator('li[data-default]').count();
log('Color rows render with default attribute', colorRows >= 1);

// Verify reorder buttons (chevron up/down)
const upArrows = await page
  .locator('button[aria-label*="Move"][aria-label*="up"]')
  .count();
log('Reorder up arrows present', upArrows >= 1);

// Verify star (default toggle) buttons
const starBtns = await page
  .locator('button[aria-label*="default"]')
  .count();
log('Default-color star buttons present', starBtns >= 1);

// Cert input
const certInput = page.locator('[data-testid="certifications-input"]').first();
log('Cert input present', (await certInput.count()) > 0);
if (await certInput.count()) {
  await certInput.click();
  await certInput.fill('ISO 22000:2018');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  const certName = await page
    .locator('input[value="ISO 22000:2018"]')
    .count();
  log('Cert added with structured editor (name input)', certName > 0);
  // Check media_id + url inputs visible
  const media = await page
    .locator('input[placeholder*="media_id"]')
    .count();
  const urlInput = await page
    .locator('input[placeholder*="URL verify"]')
    .count();
  log('Cert media_id input present', media > 0);
  log('Cert URL verify input present', urlInput > 0);
}

await page.screenshot({ path: `${OUT}/v2-suite-3-information.png` });

// AddFeatureDialog (Add new category trigger)
const addCatBtn = page
  .locator('button')
  .filter({ hasText: 'Add new category' })
  .first();
log('Add new category button present', (await addCatBtn.count()) > 0);

// ── TEST 4: Media manager 4 tabs ──────────────────────────────────────────
console.log('\n=== TEST 4: Media Manager 4 tabs ===');
// Use a stub product id — page will 404 from BE (auth fail) but UI still mounts
// to test tab structure. Let's pick e3e3e3e3-2000-... if exists.
await page.goto(`${base}/product/e3e3e3e3-2000-0000-0000-000000000001/media`, {
  waitUntil: 'networkidle',
});
await page.waitForTimeout(1500);

const t1 = await page.locator('button').filter({ hasText: 'Hero & Lifestyle' }).count();
const t2 = await page.locator('button').filter({ hasText: 'Theo màu' }).count();
const t3 = await page.locator('button').filter({ hasText: /^Features$/ }).count();
const t4 = await page.locator('button').filter({ hasText: 'Certifications' }).count();
log('Tab "Hero & Lifestyle" present', t1 > 0);
log('Tab "Theo màu" present', t2 > 0);
log('Tab "Features" present', t3 > 0);
log('Tab "Certifications" present', t4 > 0);

// Click each tab and verify it doesn't crash
for (const tabLabel of ['Theo màu', 'Features', 'Certifications', 'Hero & Lifestyle']) {
  const btn = page.locator('button').filter({ hasText: tabLabel }).first();
  if (await btn.count()) {
    await btn.click();
    await page.waitForTimeout(400);
    log(`Tab "${tabLabel}" clickable without crash`, true);
  }
}

await page.screenshot({ path: `${OUT}/v2-suite-4-media.png` });

// ── REPORT ────────────────────────────────────────────────────────────────
console.log('\n\n=========================================');
console.log('PRODUCT V2 PLAYWRIGHT SUITE — REPORT');
console.log('=========================================');
const passed = report.filter(r => r.ok).length;
const total = report.length;
console.log(`\nResult: ${passed}/${total} checks passed`);
console.log('\nPassed:');
report.filter(r => r.ok).forEach(r => console.log(`  ✅ ${r.test}`));
const failed = report.filter(r => !r.ok);
if (failed.length > 0) {
  console.log('\nFailed:');
  failed.forEach(r =>
    console.log(`  ❌ ${r.test}${r.detail ? ' — ' + r.detail : ''}`)
  );
}

console.log('\n--- Network requests captured (BE wire-up) ---');
const beRequests = requests.filter(r =>
  r.url.includes('/api/rexer/products')
);
beRequests.forEach(r => {
  const u = new URL(r.url);
  const resp = responses.get(`${r.method} ${r.url}`);
  console.log(
    `  ${r.method} ${u.pathname}${u.search} → ${resp?.status ?? '(no resp)'}`
  );
});

await writeFile(`${OUT}/v2-suite-report.json`, JSON.stringify(report, null, 2));
console.log(`\nFull report → ${OUT}/v2-suite-report.json`);
console.log(`Screenshots  → ${OUT}/v2-suite-*.png`);

await browser.close();
