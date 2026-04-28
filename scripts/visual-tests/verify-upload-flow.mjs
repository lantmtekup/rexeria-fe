// Deep-dive verify cho flow upload + bind media của Landing Media Manager.
//
// Mục tiêu: chạy thật end-to-end qua UI, capture từng request trong pipeline:
//   1. POST /v1/media/uploads/init       → upload_id + (optional presigned_url)
//   2. PUT  /v1/media/uploads/{id}/raw   (hoặc presigned PUT)
//   3. POST /v1/media/uploads/complete   → MediaAsset
//   4. POST /v1/projects/{id}/media/bind → ProjectMediaBinding
//
// Kế đến: refresh trang xem GET /v1/projects/{id}/media có asset vừa upload.
//
// Usage: node scripts/visual-tests/verify-upload-flow.mjs

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

// 1×1 transparent PNG.
const ONE_PX_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);
const TEST_FILE = join(OUT, 'verify-test.png');
await writeFile(TEST_FILE, ONE_PX_PNG);
log('test fixture file:', TEST_FILE, ONE_PX_PNG.length, 'bytes');

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  acceptDownloads: false,
});
const page = await ctx.newPage();

const events = [];
const pushEvent = (kind, data) =>
  events.push({ at: new Date().toISOString().slice(11, 19), kind, ...data });

page.on('console', m => {
  if (m.type() === 'error') pushEvent('console-error', { text: m.text() });
});
page.on('pageerror', e => pushEvent('pageerror', { text: e.message }));
page.on('requestfailed', r =>
  pushEvent('requestfailed', {
    method: r.method(),
    url: r.url(),
    error: r.failure()?.errorText,
  })
);

// Capture every request hitting the upload pipeline + bind + media list.
const watchedPatterns = [
  /\/api\/rexer\/media\/uploads\/init/,
  /\/api\/rexer\/media\/uploads\/[^/]+\/raw/,
  /\/api\/rexer\/media\/uploads\/complete/,
  /\/api\/rexer\/projects\/[^/]+\/media\/bind/,
  /\/api\/rexer\/projects\/[^/]+\/media(\?|$)/,
];

page.on('request', req => {
  const url = req.url();
  if (watchedPatterns.some(p => p.test(url))) {
    pushEvent('request', {
      method: req.method(),
      url,
      contentType: req.headers()['content-type'] ?? '',
      postSize: req.postData()?.length ?? 0,
    });
  }
});

page.on('response', async res => {
  const url = res.url();
  if (!watchedPatterns.some(p => p.test(url))) return;
  let body = '';
  try {
    body = await res.text();
  } catch {
    /* ignore */
  }
  pushEvent('response', {
    method: res.request().method(),
    url,
    status: res.status(),
    body: body.slice(0, 600),
  });
});

// 1) Sign in
log('→ sign in');
await page.goto(BASE + '/sign-in', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('input[type=email]');
await page.locator('form button[type=submit]').first().click();
await page.waitForURL(/\/home/, { timeout: 15000 });
log('   logged in, url=', page.url());

// 2) Pick first project (any will do — admin has access to all)
const projects = await page.evaluate(async () => {
  const r = await fetch('/api/rexer/projects', { credentials: 'include' });
  return r.json();
});
const projectId = projects.items?.[0]?.id;
if (!projectId) {
  log('NO PROJECT FOUND — abort');
  process.exit(1);
}
log('→ projectId =', projectId);

// 3) Pick a product id (for URL only — landing page requires both)
const products = await page.evaluate(async () => {
  const r = await fetch('/api/rexer/products?limit=1', { credentials: 'include' });
  return r.json();
});
const productId =
  products.items?.[0]?.id ?? '00000000-0000-0000-0000-000000000000';
log('→ productId =', productId);

// 4) Go to landing media page
const url = `${BASE}/product/${productId}/landing/${projectId}/media`;
log('→ GOTO', url);
await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(800);
await page.screenshot({ path: join(OUT, 'upload-01-before.png'), fullPage: false });

// 5) Capture how many media exist before upload
const beforeCount = await page
  .locator('img, [data-slot=card], h3:has-text("Landing media") ~ div')
  .count();
log('   asset tiles before:', beforeCount);

// 6) Find the hidden file input and set the file
const fileInput = page.locator('input[type=file]');
const inputCount = await fileInput.count();
log('   file input count =', inputCount);
if (inputCount === 0) {
  log('NO FILE INPUT FOUND on page — abort');
  process.exit(1);
}

log('→ setting file', TEST_FILE);
await fileInput.setInputFiles(TEST_FILE);

// 7) Wait for upload pipeline to complete (or fail)
log('→ waiting up to 25s for pipeline');
const startTs = Date.now();
let lastSeen = '';
while (Date.now() - startTs < 25000) {
  const completes = events.filter(
    e =>
      e.kind === 'response' &&
      /\/uploads\/complete/.test(e.url ?? '')
  );
  const binds = events.filter(
    e =>
      e.kind === 'response' && /\/media\/bind/.test(e.url ?? '')
  );
  const fails = events.filter(
    e =>
      e.kind === 'response' &&
      typeof e.status === 'number' &&
      e.status >= 400 &&
      watchedPatterns.some(p => p.test(e.url ?? ''))
  );
  const seen = `c=${completes.length} b=${binds.length} f=${fails.length}`;
  if (seen !== lastSeen) {
    log('   pipeline state:', seen);
    lastSeen = seen;
  }
  if (binds.length > 0 || fails.length >= 2) break;
  await page.waitForTimeout(500);
}

// 8) Wait for any toast to settle
await page.waitForTimeout(1500);
await page.screenshot({ path: join(OUT, 'upload-02-after.png'), fullPage: false });

// 9) Re-fetch GET /projects/{id}/media to confirm BE state
const mediaAfter = await page.evaluate(async pid => {
  const r = await fetch(`/api/rexer/projects/${pid}/media`, {
    credentials: 'include',
  });
  return { status: r.status, body: await r.text() };
}, projectId);
log('→ GET /projects/{id}/media after =', mediaAfter.status);

await browser.close();

// 10) Build report
const lines = [];
lines.push('# Upload pipeline verify');
lines.push(`Date: ${new Date().toISOString()}`);
lines.push(`Base: ${BASE}`);
lines.push(`Project: ${projectId}`);
lines.push(`Product: ${productId}`);
lines.push('');

lines.push('## Pipeline events (in order)');
let stepNo = 0;
for (const e of events) {
  stepNo++;
  if (e.kind === 'request') {
    lines.push(
      `\n[${stepNo}] ${e.at} REQ  ${e.method} ${e.url}  (CT=${e.contentType || '—'}, body=${e.postSize}B)`
    );
  } else if (e.kind === 'response') {
    lines.push(
      `[${stepNo}] ${e.at} RES  ${e.method} ${e.url}\n     status=${e.status}\n     body=${e.body?.replace(/\n/g, ' ')}`
    );
  } else if (e.kind === 'requestfailed') {
    lines.push(
      `[${stepNo}] ${e.at} FAIL ${e.method} ${e.url}  (${e.error})`
    );
  } else {
    lines.push(`[${stepNo}] ${e.at} ${e.kind.toUpperCase()} ${e.text}`);
  }
}

lines.push('');
lines.push('## Final state');
lines.push(`GET /projects/{id}/media → ${mediaAfter.status}`);
lines.push('  body: ' + mediaAfter.body.slice(0, 600));

// Verdict
const initOk = events.some(
  e =>
    e.kind === 'response' &&
    /\/uploads\/init/.test(e.url ?? '') &&
    e.status === 200
);
const rawOk = events.some(
  e =>
    e.kind === 'response' &&
    /\/uploads\/[^/]+\/raw/.test(e.url ?? '') &&
    e.status === 200
);
const completeOk = events.some(
  e =>
    e.kind === 'response' &&
    /\/uploads\/complete/.test(e.url ?? '') &&
    e.status === 200
);
const bindOk = events.some(
  e =>
    e.kind === 'response' &&
    /\/media\/bind/.test(e.url ?? '') &&
    [200, 201].includes(e.status)
);
lines.push('');
lines.push('## Verdict');
lines.push(`- init     : ${initOk ? '✅' : '❌'}`);
lines.push(`- raw PUT  : ${rawOk ? '✅' : '❌'}`);
lines.push(`- complete : ${completeOk ? '✅' : '❌'}`);
lines.push(`- bind     : ${bindOk ? '✅' : '❌'}`);
const allOk = initOk && rawOk && completeOk && bindOk;
lines.push('');
lines.push(allOk ? 'ALL STEPS OK ✅' : '⚠️  Pipeline incomplete — see events above');

const report = lines.join('\n');
await writeFile(join(OUT, 'verify-upload-report.md'), report);
console.log('\n' + report);
console.log('\nReport saved to', join(OUT, 'verify-upload-report.md'));
