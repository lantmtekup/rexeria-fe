// E2E verify Canvas Designer flow.
//
// Flow:
//   1. Login
//   2. /template → tab "Canvas designs"
//   3. + New canvas → "Hero Test" 800×500
//   4. Editor opens, canvas mounted
//   5. Add text + rect + circle (toolbar buttons)
//   6. Save → verify version bumped + etag updated via BE
//   7. Reload editor → BE returns 304 (etag match) → canvas re-rendered
//   8. Verify BE actually persisted via curl /canvas-templates/:id/canvas
//   9. Archive canvas
//
// Usage: node scripts/visual-tests/verify-canvas-flow.mjs

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'out');
await mkdir(OUT, { recursive: true });
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const log = (...a) =>
  console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

const checks = [];
const note = (kind, msg) => {
  checks.push({ kind, msg });
  log(`   ${kind === 'PASS' ? '✅' : kind === 'FAIL' ? '❌' : '·'} ${msg}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

page.on('pageerror', e => note('FAIL', `pageerror: ${e.message?.slice(0, 200)}`));
page.on('console', msg => {
  const text = msg.text();
  if (
    text.includes('[canvas-save]') ||
    text.includes('[canvas-load]') ||
    text.includes('[canvas-add]')
  ) {
    log(`[browser]`, text.slice(0, 200));
  }
});

// Track network for canvas endpoints
const netLog = [];
page.on('request', req => {
  const url = req.url();
  if (
    /\/api\/rexer\/canvas-templates/.test(url) &&
    req.method() === 'PATCH'
  ) {
    const body = req.postData() ?? '';
    log(`[REQ PATCH body] ${body.slice(0, 400)}`);
  }
});
page.on('response', async res => {
  const url = res.url();
  if (/\/api\/rexer\/canvas-templates/.test(url)) {
    let body = '';
    try {
      body = (await res.text()).slice(0, 400);
    } catch {
      /* ignore */
    }
    netLog.push({
      method: res.request().method(),
      url: url.replace(BASE, ''),
      status: res.status(),
      etag: res.headers()['etag'] ?? null,
      body,
    });
  }
});

// ── 1. Login ────────────────────────────────────────────────────────────
log('1) sign in');
await page.goto(BASE + '/sign-in', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('input[type=email]');
await page.locator('form button[type=submit]').first().click();
await page.waitForURL(/\/home/, { timeout: 15000 });

// Cleanup any prior "Hero Test" via BE
await page.evaluate(async () => {
  try {
    const r = await fetch('/api/rexer/canvas-templates?q=Hero+Test&limit=20', {
      credentials: 'include',
    });
    const j = await r.json();
    for (const t of j.items ?? []) {
      if (t.name === 'Hero Test') {
        await fetch(`/api/rexer/canvas-templates/${t.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      }
    }
  } catch {
    /* best-effort */
  }
});

// ── 2. /template → tab Canvas designs ─────────────────────────────────
log('2) GOTO /template, switch to Canvas designs tab');
await page.goto(BASE + '/template', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);
await page.getByRole('tab', { name: /Canvas designs/ }).click();
await page.waitForTimeout(2000);

const newBtn = await page
  .getByRole('button', { name: /New canvas/ })
  .first()
  .isVisible()
  .catch(() => false);
note(newBtn ? 'PASS' : 'FAIL', 'tab Canvas shows "New canvas" button');
await page.screenshot({ path: join(OUT, 'cv-01-list.png') });

// ── 3. Create canvas ────────────────────────────────────────────────────
log('3) create canvas "Hero Test" 800x500');
await page.getByRole('button', { name: /New canvas/ }).first().click();
await page.waitForSelector('[role=dialog]');
await page.locator('#ct-name').fill('Hero Test');
await page.locator('#ct-w').fill('800');
await page.locator('#ct-h').fill('500');
await page.locator('button[type=submit]:has-text("Create")').click();

// Auto-redirects to editor.
await page.waitForURL(/\/canvas-templates\/[a-f0-9-]+/, { timeout: 10000 });
await page.waitForTimeout(2500);
const editorUrl = page.url();
const canvasId = editorUrl.match(/canvas-templates\/([a-f0-9-]+)/)?.[1];
log(`   editor opened, id=${canvasId}`);

note(
  await page
    .getByText(/Hero Test/)
    .first()
    .isVisible()
    .catch(() => false)
    ? 'PASS'
    : 'FAIL',
  'editor header shows "Hero Test"'
);

// HTML <canvas> element should be mounted
const canvasMounted =
  (await page.locator('canvas').count()) > 0;
note(canvasMounted ? 'PASS' : 'FAIL', '<canvas> element mounted in DOM');
await page.screenshot({ path: join(OUT, 'cv-02-empty-editor.png') });

// ── 4. Add objects via toolbar ──────────────────────────────────────────
log('4) wait for fabric to initialize Canvas instance');
// Poll until fabric Canvas is attached (canvas-container wrapper added).
for (let i = 0; i < 30; i++) {
  const ready = await page.evaluate(() => {
    // Fabric wraps the <canvas> in a `.canvas-container` div on init.
    return document.querySelector('.canvas-container') != null;
  });
  if (ready) {
    log(`   fabric ready after ${i * 200}ms`);
    break;
  }
  await page.waitForTimeout(200);
}
await page.waitForTimeout(500);
log('4b) add Text + Rect + Circle');
await page.getByRole('button', { name: /Add text/ }).click();
await page.waitForTimeout(2000);
await page.getByRole('button', { name: /Add rectangle/ }).click();
await page.waitForTimeout(1500);
await page.getByRole('button', { name: /Add circle/ }).click();
await page.waitForTimeout(1500);

// Save button should now show "Save *" (dirty)
const dirtyBtn = await page
  .getByRole('button', { name: /Save \*/ })
  .first()
  .isVisible({ timeout: 3000 })
  .catch(() => false);
note(dirtyBtn ? 'PASS' : 'FAIL', 'Save button shows dirty marker (Save *)');

await page.screenshot({ path: join(OUT, 'cv-03-objects.png') });

// ── 5. Save canvas ──────────────────────────────────────────────────────
log('5) click Save');
await page.getByRole('button', { name: /Save \*/ }).first().click();
await page.waitForTimeout(2500);

const savedBtn = await page
  .getByRole('button', { name: /Saved/ })
  .first()
  .isVisible()
  .catch(() => false);
note(savedBtn ? 'PASS' : 'FAIL', 'Save button → "Saved" after PATCH');

const patchHit = netLog.some(
  n =>
    n.method === 'PATCH' &&
    new RegExp(`/canvas-templates/${canvasId}$`).test(n.url) &&
    n.status === 200
);
note(patchHit ? 'PASS' : 'FAIL', 'BE PATCH /canvas-templates/{id} → 200');

// ── 6. Verify BE persisted via curl-equivalent ──────────────────────────
log('6) verify BE state — fetch canvas data (cache:no-store)');
const beState = await page.evaluate(async id => {
  // BE sets `Cache-Control: max-age=86400` → browser will return cached
  // response for the same URL. Bypass cache to see actual BE state.
  const r = await fetch(`/api/rexer/canvas-templates/${id}/canvas`, {
    credentials: 'include',
    cache: 'no-store',
  });
  const j = await r.json();
  return {
    status: r.status,
    objectCount: (j.canvas_data?.objects ?? []).length,
    etag: j.canvas_etag,
    version: j.version,
  };
}, canvasId);
log(
  `   BE: status=${beState.status} objects=${beState.objectCount} version=${beState.version}`
);
note(
  beState.status === 200 ? 'PASS' : 'FAIL',
  `BE GET /canvas returns 200 (got ${beState.status})`
);
note(
  beState.objectCount >= 3 ? 'PASS' : 'FAIL',
  `BE persisted ${beState.objectCount} objects (expect ≥ 3)`
);
note(
  beState.version >= 2 ? 'PASS' : 'FAIL',
  `version bumped to ${beState.version} (expect ≥ 2)`
);
note(
  /^sha256:/.test(beState.etag ?? '') ? 'PASS' : 'FAIL',
  `etag is sha256 hash: ${(beState.etag ?? '').slice(0, 24)}…`
);

// ── 7. ETag 304 handshake ───────────────────────────────────────────────
log('7) re-fetch with If-None-Match → expect 304');
const condResp = await page.evaluate(
  async ({ id, etag }) => {
    const r = await fetch(`/api/rexer/canvas-templates/${id}/canvas`, {
      credentials: 'include',
      cache: 'no-store',
      headers: { 'If-None-Match': etag },
    });
    return { status: r.status };
  },
  { id: canvasId, etag: beState.etag }
);
note(
  condResp.status === 304 ? 'PASS' : 'FAIL',
  `If-None-Match returns 304 (got ${condResp.status})`
);

// ── 8. Reload editor — objects should persist ───────────────────────────
log('8) reload editor → objects re-render');
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
const stillVisible = await page
  .locator('canvas')
  .first()
  .isVisible()
  .catch(() => false);
note(stillVisible ? 'PASS' : 'FAIL', 'canvas re-mounted after reload');

await page.screenshot({ path: join(OUT, 'cv-04-after-reload.png') });

// Verify list page still shows the canvas
log('9) back to list — canvas in card grid');
await page.goto(BASE + '/template', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);
await page.getByRole('tab', { name: /Canvas designs/ }).click();
await page.waitForTimeout(2500);

const cardVisible = await page
  .locator('article:has-text("Hero Test")')
  .first()
  .isVisible()
  .catch(() => false);
note(cardVisible ? 'PASS' : 'FAIL', '"Hero Test" card visible in list');
await page.screenshot({ path: join(OUT, 'cv-05-list-after.png') });

// ── 10. Verify list endpoint does NOT include canvas_data ───────────────
log('10) list endpoint omits canvas_data');
const listResp = await page.evaluate(async () => {
  const r = await fetch('/api/rexer/canvas-templates?q=Hero+Test&limit=5', {
    credentials: 'include',
  });
  const j = await r.json();
  return j.items ?? [];
});
const heroItem = listResp.find(i => i.name === 'Hero Test');
const noCanvasInList =
  heroItem != null &&
  (heroItem.canvas_data == null ||
    Object.keys(heroItem.canvas_data ?? {}).length === 0);
note(
  noCanvasInList ? 'PASS' : 'FAIL',
  'list endpoint omits canvas_data field (lazy-load enforced)'
);
note(
  heroItem?.canvas_size_bytes && heroItem.canvas_size_bytes > 0
    ? 'PASS'
    : 'FAIL',
  `canvas_size_bytes reported: ${heroItem?.canvas_size_bytes}`
);

// ── 11. Archive canvas ──────────────────────────────────────────────────
log('11) archive canvas');
page.once('dialog', d => d.accept());
const archiveBtn = page
  .locator('article:has-text("Hero Test") button[aria-label="Archive canvas"]')
  .first();
if ((await archiveBtn.count()) > 0) {
  await archiveBtn.click();
  await page.waitForTimeout(2500);
  const stillThere = await page
    .locator('article:has-text("Hero Test")')
    .first()
    .isVisible()
    .catch(() => false);
  note(!stillThere ? 'PASS' : 'FAIL', 'canvas archived → no longer in list');
} else {
  note('FAIL', 'archive button not found');
}

await browser.close();

// ── Report ──────────────────────────────────────────────────────────────
const lines = [];
lines.push('# Canvas Designer flow verify');
lines.push(`Date: ${new Date().toISOString()}`);
lines.push('');
checks.forEach(c =>
  lines.push(`- ${c.kind === 'PASS' ? '✅' : '❌'} ${c.msg}`)
);
const pass = checks.filter(c => c.kind === 'PASS').length;
const fail = checks.filter(c => c.kind === 'FAIL').length;
lines.push('');
lines.push(`Summary: ${pass} pass · ${fail} fail`);
lines.push('');
lines.push('## Network log (canvas endpoints)');
netLog.forEach(n =>
  lines.push(
    `- [${n.status}] ${n.method} ${n.url}${n.etag ? ` etag=${n.etag.slice(0, 24)}…` : ''}`
  )
);
const report = lines.join('\n');
await writeFile(join(OUT, 'verify-canvas-report.md'), report);
console.log('\n' + report);
