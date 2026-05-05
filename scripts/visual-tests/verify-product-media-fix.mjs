// Verify fix bug: tab Media trên /product/[id] đang load tên + dữ liệu của
// product khác do hard-code "Samba OG Shoes" + MOCK_MEDIA.
//
// Test flow:
//   1. Login
//   2. Lấy danh sách products thật từ BE
//   3. GOTO /product/{id1}/information — đọc productName từ top bar
//   4. Click tab Media — kiểm tra URL + productName + có render ProductMediaManager
//   5. Đối chiếu: tên Media phải = tên Information, KHÔNG được là "Samba OG Shoes"
//   6. Bonus: upload 1 file → verify pipeline + asset xuất hiện
//
// Usage: node scripts/visual-tests/verify-product-media-fix.mjs

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Buffer } from 'node:buffer';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'out');
await mkdir(OUT, { recursive: true });

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const log = (...a) =>
  console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

const ONE_PX_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);
const TEST_FILE = join(OUT, 'verify-product-media-test.png');
await writeFile(TEST_FILE, ONE_PX_PNG);

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();

const issues = [];
const note = (kind, msg) => {
  issues.push({ kind, msg });
  log(`   ${kind === 'PASS' ? '✅' : '❌'} ${msg}`);
};

const networkLog = [];
page.on('response', async res => {
  const url = res.url();
  if (
    /\/api\/rexer\/(products|media\/uploads|projects\/[^/]+\/media)/.test(url)
  ) {
    let body = '';
    try {
      body = (await res.text()).slice(0, 200);
    } catch {
      /* noop */
    }
    networkLog.push({
      method: res.request().method(),
      url: url.replace(BASE, ''),
      status: res.status(),
      body,
    });
  }
});

// 1) Login
log('1) sign in');
await page.goto(BASE + '/sign-in', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('input[type=email]');
await page.locator('form button[type=submit]').first().click();
await page.waitForURL(/\/home/, { timeout: 15000 });

// 2) Get a real product id
log('2) fetch products');
const productsResp = await page.evaluate(async () => {
  const r = await fetch('/api/rexer/products?limit=5', {
    credentials: 'include',
  });
  return r.json();
});
const product = productsResp.items?.[0];
if (!product) {
  console.error('NO PRODUCTS — abort');
  process.exit(1);
}
const expectedName = product.name;
log(`   expected product name = "${expectedName}" (id=${product.id})`);

// 3) GOTO /product/{id}/information
log('3) GOTO /product/{id}/information');
await page.goto(`${BASE}/product/${product.id}/information`, {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(1500);
await page.screenshot({
  path: join(OUT, 'pmfix-01-information.png'),
  fullPage: false,
});

// Read product name from the workspace top bar (rendered via WorkspaceTopBar `title` prop).
// The top bar wraps the title in a chip-like element near the top-left.
const topBarText = await page
  .locator('header, [data-slot=workspace-top-bar], div')
  .filter({ hasText: expectedName })
  .first()
  .textContent({ timeout: 3000 })
  .catch(() => null);
log('   top bar contains name?', topBarText ? 'yes' : 'no');

if (topBarText && topBarText.includes(expectedName)) {
  note('PASS', `Information page shows "${expectedName}"`);
} else {
  note('FAIL', `Information page does NOT show "${expectedName}"`);
}

// 4) Click Media sub-tab (it's a Link in SubTabBar)
log('4) click Media tab');
const mediaTab = page.getByRole('tab', { name: /^Media$/i }).first();
const tabCount = await mediaTab.count();
if (tabCount === 0) {
  note('FAIL', 'Could not find Media sub-tab on Information page');
} else {
  await mediaTab.click();
  await page.waitForURL(/\/media$/, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2500);
  log('   url after click =', page.url());
  await page.screenshot({
    path: join(OUT, 'pmfix-02-media.png'),
    fullPage: false,
  });

  if (page.url().includes(`/product/${product.id}/media`)) {
    note('PASS', `URL navigated to /product/${product.id}/media`);
  } else {
    note('FAIL', `URL did NOT navigate (currently ${page.url()})`);
  }

  // Check the page body for the OLD mock indicator "Samba OG Shoes"
  const sambaLeak = await page
    .getByText(/Samba OG Shoes/)
    .first()
    .isVisible({ timeout: 1000 })
    .catch(() => false);
  if (sambaLeak) {
    note(
      'FAIL',
      'Mock string "Samba OG Shoes" still visible — fix did NOT take effect'
    );
  } else {
    note('PASS', 'Mock string "Samba OG Shoes" no longer visible');
  }

  // Check the page now shows the real product name
  const realNameVisible = await page
    .getByText(expectedName)
    .first()
    .isVisible({ timeout: 1000 })
    .catch(() => false);
  if (realNameVisible) {
    note('PASS', `Real product name "${expectedName}" visible on Media page`);
  } else {
    note(
      'FAIL',
      `Real product name "${expectedName}" not visible on Media page`
    );
  }

  // Check that ProductMediaManager rendered (look for "Product media" header)
  const managerHeader = await page
    .getByText(/Product media/)
    .first()
    .isVisible({ timeout: 1000 })
    .catch(() => false);
  if (managerHeader) {
    note('PASS', 'ProductMediaManager rendered (header "Product media" found)');
  } else {
    note('FAIL', 'ProductMediaManager header not found');
  }

  // Check whether GET /products/{id} was called (should be, to load name + bindings)
  const productGetCalls = networkLog.filter(
    n =>
      n.method === 'GET' &&
      new RegExp(`/api/rexer/products/${product.id}$`).test(n.url)
  );
  if (productGetCalls.length >= 1) {
    note(
      'PASS',
      `BE called GET /products/${product.id} (${productGetCalls.length} time(s))`
    );
  } else {
    note('FAIL', `Did NOT call GET /products/${product.id}`);
  }
}

// 5) Bonus: upload a file and check pipeline
log('5) try upload pipeline');
const fileInput = page.locator('input[type=file]');
const fileInputCount = await fileInput.count();
if (fileInputCount === 0) {
  note('FAIL', 'No file input found on Media page (cannot test upload)');
} else {
  await fileInput.setInputFiles(TEST_FILE);
  log('   file set, waiting up to 20s for pipeline');

  const start = Date.now();
  while (Date.now() - start < 20000) {
    const bindCalls = networkLog.filter(
      n =>
        /\/api\/rexer\/products\/[^/]+\/media\/bind/.test(n.url) &&
        [200, 201].includes(n.status)
    );
    if (bindCalls.length > 0) break;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: join(OUT, 'pmfix-03-after-upload.png'),
    fullPage: false,
  });

  const initOk = networkLog.some(
    n => n.url.includes('/media/uploads/init') && n.status === 200
  );
  const completeOk = networkLog.some(
    n => n.url.includes('/media/uploads/complete') && n.status === 200
  );
  const bindOk = networkLog.some(
    n =>
      /\/products\/[^/]+\/media\/bind/.test(n.url) &&
      [200, 201].includes(n.status)
  );
  note(initOk ? 'PASS' : 'FAIL', `upload init → ${initOk ? 'OK' : 'FAIL'}`);
  note(
    completeOk ? 'PASS' : 'FAIL',
    `upload complete → ${completeOk ? 'OK' : 'FAIL'}`
  );
  note(
    bindOk ? 'PASS' : 'FAIL',
    `product media bind → ${bindOk ? 'OK' : 'FAIL'}`
  );
}

await browser.close();

// Build report
const lines = [];
lines.push('# Product /media fix verify');
lines.push(`Date: ${new Date().toISOString()}`);
lines.push(`Product: "${expectedName}" (${product.id})`);
lines.push('');
lines.push('## Checks');
issues.forEach(i =>
  lines.push(`- ${i.kind === 'PASS' ? '✅' : '❌'} ${i.msg}`)
);
const passCount = issues.filter(i => i.kind === 'PASS').length;
const failCount = issues.filter(i => i.kind === 'FAIL').length;
lines.push('');
lines.push(`Summary: ${passCount} pass · ${failCount} fail`);
lines.push('');
lines.push('## Network log (filtered)');
networkLog.forEach(n =>
  lines.push(`- [${n.status}] ${n.method} ${n.url}\n    ${n.body}`)
);

const report = lines.join('\n');
await writeFile(join(OUT, 'pmfix-report.md'), report);
console.log('\n' + report);
console.log('\nReport saved to', join(OUT, 'pmfix-report.md'));
