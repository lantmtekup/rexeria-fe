// Verify save flow with schema 2.0 wire format — authed via JWT cookie.
// Captures network request body to confirm exact JSON sent to BE,
// then reloads the page to confirm the edit persists.
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { SignJWT } from 'jose';

const base = 'http://localhost:3000';
const tplId = 'e3e3e3e3-2000-0000-0000-000000000001';
const url = `${base}/canvas-templates/${tplId}`;

// Build JWT for auth (same pattern as capture.mjs).
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
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
await ctx.addCookies([
  { name: '_access_token', value: token, domain: 'localhost', path: '/' },
]);

const page = await ctx.newPage();

let lastSaveBody = null;
let lastSaveStatus = null;
let lastSaveResponseBody = null;

page.on('request', req => {
  if (req.method() === 'PATCH' && req.url().includes('/canvas-templates/')) {
    lastSaveBody = req.postData();
    console.log('[req] PATCH', req.url().split('/').slice(-2).join('/'));
  }
});
page.on('response', async resp => {
  if (
    resp.request().method() === 'PATCH' &&
    resp.url().includes('/canvas-templates/')
  ) {
    lastSaveStatus = resp.status();
    try {
      lastSaveResponseBody = await resp.text();
    } catch {}
  }
});
page.on('pageerror', e => console.log('[pageerror]', e.message));
page.on('console', m => {
  if (m.type() === 'error')
    console.log('[console error]', m.text().slice(0, 200));
});

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Capture title BEFORE edit (so we can verify it changed after reload)
const titleBefore = await page
  .locator('[data-element-key="title"]')
  .first()
  .textContent();
console.log('title BEFORE edit =', JSON.stringify(titleBefore));

const stamp = Date.now().toString().slice(-6);
const newTitle = `Test save ${stamp}`;

// Edit title via inline edit
await page.locator('[data-element-key="title"]').first().dblclick();
await page.waitForTimeout(300);
// Select all + replace
await page.keyboard.press('Control+A');
await page.keyboard.press('Meta+A');
await page.keyboard.type(newTitle);
await page.keyboard.press('Enter');
await page.waitForTimeout(500);

const titleAfterEdit = await page
  .locator('[data-element-key="title"]')
  .first()
  .textContent();
console.log('title AFTER edit (in DOM) =', JSON.stringify(titleAfterEdit));

// Wait long enough for autosave (1.5s debounce + save round-trip)
await page.waitForTimeout(4000);

console.log('\n=== SAVE REQUEST ===');
if (lastSaveBody) {
  try {
    const parsed = JSON.parse(lastSaveBody);
    const cd = parsed.canvas_data;
    if (cd) {
      console.log('schema_version =', JSON.stringify(cd.schema_version));
      console.log('active_block_id =', JSON.stringify(cd.active_block_id));
      console.log('blocks count =', cd.blocks?.length);
      const b0 = cd.blocks?.[0];
      if (b0) {
        console.log('blocks[0] keys =', Object.keys(b0).join(', '));
        if (b0.contentVi?.desktop) {
          console.log(
            'blocks[0].contentVi.desktop.title =',
            JSON.stringify(b0.contentVi.desktop.title)
          );
        }
      }
    }
  } catch (e) {
    console.log('(could not parse body)', e.message);
  }
} else {
  console.log('(no save request captured — check autosave logic / dirty flag)');
}

console.log('\n=== SAVE RESPONSE ===');
console.log('status =', lastSaveStatus);
if (lastSaveStatus && lastSaveStatus >= 400) {
  console.log('body =', lastSaveResponseBody?.slice(0, 500));
}

// ── RELOAD and verify persistence ───────────────────────────────────────────
console.log('\n=== RELOADING TO VERIFY PERSISTENCE ===');
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

const titleAfterReload = await page
  .locator('[data-element-key="title"]')
  .first()
  .textContent();
console.log('title AFTER reload =', JSON.stringify(titleAfterReload));
console.log(
  'persisted? =',
  titleAfterReload?.includes(stamp) ? '✅ YES' : '❌ NO'
);

await browser.close();
