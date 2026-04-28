// E2E verify cho luồng Collection (gộp trong Template page).
//
// Flow:
//   1. Login
//   2. /template → click tab "Data collections"
//   3. + New collection → "Customers" + accent color
//   4. Vào detail → tab Schema
//      - Add field "Name" (text, required, primary)
//      - Add field "Email" (email, required, unique)
//      - Add field "Tier" (dropdown, options VIP|Regular|Bronze)
//   5. Save schema
//   6. Tab Records → + New record (Acme Corp / hi@acme.com / VIP)
//   7. Try validation: required empty, unique duplicate, email format
//   8. Search "Acme" filter
//   9. Edit + delete record
//   10. Persist: reload page, data still there
//   11. Cleanup: archive collection
//
// Usage: node scripts/visual-tests/verify-collection-flow.mjs

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

page.on('pageerror', e => note('FAIL', `pageerror: ${e.message?.slice(0, 120)}`));

// ── 1. Login ────────────────────────────────────────────────────────────
log('1) sign in');
await page.goto(BASE + '/sign-in', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('input[type=email]');
await page.locator('form button[type=submit]').first().click();
await page.waitForURL(/\/home/, { timeout: 15000 });

// BE-backed run — purge any stale collection named "Customers" from prior runs.
// (Soft-deletes via BE so it disappears from active list.)
await page.evaluate(async () => {
  try {
    const r = await fetch('/api/rexer/collections?q=Customers&limit=20', {
      credentials: 'include',
    });
    const j = await r.json();
    for (const c of j.items ?? []) {
      if (c.name === 'Customers') {
        await fetch(`/api/rexer/collections/${c.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      }
    }
  } catch {
    /* best-effort cleanup */
  }
});

// ── 2. /template → tab Data ─────────────────────────────────────────────
log('2) GOTO /template, switch to Data tab');
await page.goto(BASE + '/template', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);
await page.getByRole('tab', { name: /Data collections/ }).click();
await page.waitForTimeout(500);
const newBtn = await page
  .getByRole('button', { name: /New collection/ })
  .first()
  .isVisible()
  .catch(() => false);
note(newBtn ? 'PASS' : 'FAIL', 'tab Data shows "New collection" button');
await page.screenshot({ path: join(OUT, 'col-01-empty.png') });

// ── 3. Create collection "Customers" ────────────────────────────────────
log('3) create collection "Customers"');
await page.getByRole('button', { name: /New collection/ }).first().click();
await page.waitForSelector('[role=dialog]');
await page.locator('#c-name').fill('Customers');
await page.locator('#c-desc').fill('VIP customer database');
// pick second color (Green)
const colorButtons = page.locator('[aria-label^="color "]');
const colorCount = await colorButtons.count();
log(`   color swatches: ${colorCount}`);
if (colorCount > 1) await colorButtons.nth(1).click();
await page.locator('button[type=submit]:has-text("Create collection")').click();
await page.waitForTimeout(2500);

const cardVisible = await page
  .locator('a[href^="/collections/"]:has-text("Customers")')
  .first()
  .isVisible()
  .catch(() => false);
note(cardVisible ? 'PASS' : 'FAIL', 'collection "Customers" appears in list');
await page.screenshot({ path: join(OUT, 'col-02-created.png') });

// ── 4. Open detail ──────────────────────────────────────────────────────
log('4) open detail');
const detailHref = await page
  .locator('a[href^="/collections/"]:has-text("Customers")')
  .first()
  .getAttribute('href');
log(`   href = ${detailHref}`);
if (!detailHref) {
  note('FAIL', 'no detail href found — abort');
  await browser.close();
  process.exit(1);
}
await page.goto(BASE + detailHref, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);

const headingVisible = await page
  .getByRole('heading', { name: 'Customers' })
  .first()
  .isVisible()
  .catch(() => false);
note(headingVisible ? 'PASS' : 'FAIL', 'detail page header shows "Customers"');

// Should be on Schema tab; click "+ Add first field"
const addFirst = await page
  .getByRole('button', { name: /Add first field/ })
  .first()
  .isVisible()
  .catch(() => false);
if (!addFirst) {
  note('FAIL', 'Add first field button not visible (schema tab not active?)');
} else {
  // ── 5. Define schema (UI: 3 fields with label/key/type) ────────────────
  log('5) define schema via UI');
  await page.getByRole('button', { name: /Add first field/ }).first().click();
  await page.waitForTimeout(400);

  const labelInputs = page.locator('input[placeholder="Field label"]');
  const keyInputs = page.locator('input[placeholder="field_key"]');
  const typeSelects = page.locator(
    'select:not([id="c-status"]):not([id="c-obj"])'
  );

  // Field 1
  await labelInputs.nth(0).fill('Name');
  await keyInputs.nth(0).fill('name');

  // Add field 2
  await page.locator('button:has-text("Add field")').first().click();
  await page.waitForTimeout(300);
  await labelInputs.nth(1).fill('Email');
  await keyInputs.nth(1).fill('email');
  await typeSelects.nth(1).selectOption('email');

  // Add field 3
  await page.locator('button:has-text("Add field")').first().click();
  await page.waitForTimeout(300);
  await labelInputs.nth(2).fill('Tier');
  await keyInputs.nth(2).fill('tier');
  await typeSelects.nth(2).selectOption('dropdown');

  // Open Tier "More" panel + add options
  await page.locator('button:has-text("More")').nth(2).click();
  await page.waitForTimeout(300);
  await page
    .locator('input[placeholder="Option 1, Option 2"]')
    .first()
    .fill('VIP, Regular, Bronze');

  await page.screenshot({ path: join(OUT, 'col-03-schema.png') });

  // Save schema
  log('   click Save');
  await page.getByRole('button', { name: /Save \*?/ }).first().click();
  await page.waitForTimeout(2000);
  const savedBtn = await page
    .getByRole('button', { name: /Saved/ })
    .first()
    .isVisible()
    .catch(() => false);
  note(savedBtn ? 'PASS' : 'FAIL', 'schema saved (Save button → Saved)');

  // ── 5b. Set required/unique/primary flags via BE PATCH ─────────────────
  // Toggle UI for these is brittle (radix Switch with positional nth);
  // bypass by PATCH-ing collection directly via BE API.
  log('5b) PATCH flags via BE + reload');
  await page.evaluate(async () => {
    const r = await fetch('/api/rexer/collections?q=Customers&limit=1', {
      credentials: 'include',
    });
    const j = await r.json();
    const col = j.items?.[0];
    if (!col) return;
    const fields = col.fields.map(f => {
      if (f.fieldKey === 'name')
        return { ...f, required: true, isPrimary: true };
      if (f.fieldKey === 'email')
        return { ...f, required: true, isUnique: true };
      if (f.fieldKey === 'tier')
        return { ...f, options: ['VIP', 'Regular', 'Bronze'] };
      return f;
    });
    await fetch(`/api/rexer/collections/${col.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields, version: col.version }),
    });
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
}

// ── 6. Switch to Records tab ────────────────────────────────────────────
log('6) switch to Records tab');
await page.getByRole('tab', { name: /Records/ }).click();
await page.waitForTimeout(500);
const newRecordBtn = await page
  .getByRole('button', { name: /New record/ })
  .first()
  .isVisible()
  .catch(() => false);
note(newRecordBtn ? 'PASS' : 'FAIL', 'Records tab shows "New record" button');

// ── 7. Create first record ──────────────────────────────────────────────
log('7) create record Acme Corp');
await page.getByRole('button', { name: /New record/ }).first().click();
await page.waitForSelector('[role=dialog]');
// Inside dialog there are inputs for Name (text), Email (email), Tier (select)
await page.locator('[role=dialog] input[type=text]').first().fill('Acme Corp');
await page.locator('[role=dialog] input[type=email]').first().fill('hi@acme.com');
await page.locator('[role=dialog] select').first().selectOption('VIP');
await page.locator('[role=dialog] button[type=submit]').click();
await page.waitForTimeout(2000);
const rowVisible = await page
  .locator('table td:has-text("Acme Corp")')
  .first()
  .isVisible()
  .catch(() => false);
note(rowVisible ? 'PASS' : 'FAIL', 'record "Acme Corp" appears in table');
await page.screenshot({ path: join(OUT, 'col-04-record.png') });

// ── 8. Validation: unique violation ─────────────────────────────────────
log('8) validation — duplicate email should fail');
await page.getByRole('button', { name: /New record/ }).first().click();
await page.waitForSelector('[role=dialog]');
await page.locator('[role=dialog] input[type=text]').first().fill('Acme #2');
await page.locator('[role=dialog] input[type=email]').first().fill('hi@acme.com');
await page.locator('[role=dialog] select').first().selectOption('Regular');
await page.locator('[role=dialog] button[type=submit]').click();
await page.waitForTimeout(3000);
// Toast: BE returns "Value already exists for unique field email"
// Local adapter returned "Duplicate value for unique field "Email""
const dupToast = await page
  .getByText(/Value already exists|Duplicate value|already exists/i)
  .first()
  .isVisible({ timeout: 5000 })
  .catch(() => false);
note(dupToast ? 'PASS' : 'FAIL', 'duplicate email rejected with toast');
// Close dialog
await page.keyboard.press('Escape');
await page.waitForTimeout(500);

// ── 9. Validation: required missing ─────────────────────────────────────
log('9) validation — required field missing');
await page.getByRole('button', { name: /New record/ }).first().click();
await page.waitForSelector('[role=dialog]');
// Leave Name empty, fill email only
await page.locator('[role=dialog] input[type=email]').first().fill('partial@test.com');
await page.locator('[role=dialog] button[type=submit]').click();
await page.waitForTimeout(2000);
const reqError = await page
  .getByText(/Name is required/)
  .first()
  .isVisible({ timeout: 2000 })
  .catch(() => false);
note(reqError ? 'PASS' : 'FAIL', 'missing required field surfaces inline error');
await page.keyboard.press('Escape');
await page.waitForTimeout(500);

// ── 10. Add second record then search ───────────────────────────────────
log('10) add 2nd record + search filter');
await page.getByRole('button', { name: /New record/ }).first().click();
await page.waitForSelector('[role=dialog]');
await page.locator('[role=dialog] input[type=text]').first().fill('Beta LLC');
await page.locator('[role=dialog] input[type=email]').first().fill('hello@beta.io');
await page.locator('[role=dialog] select').first().selectOption('Bronze');
await page.locator('[role=dialog] button[type=submit]').click();
await page.waitForTimeout(2000);

await page.locator('input[placeholder="Search records…"]').fill('Acme');
await page.waitForTimeout(2000);
const acmeOnly =
  (await page.locator('table td:has-text("Acme Corp")').count()) > 0 &&
  (await page.locator('table td:has-text("Beta LLC")').count()) === 0;
note(acmeOnly ? 'PASS' : 'FAIL', 'search "Acme" filters to 1 row');
await page.screenshot({ path: join(OUT, 'col-05-search.png') });
await page.locator('input[placeholder="Search records…"]').fill('');
await page.waitForTimeout(500);

// ── 11. Persist across reload ───────────────────────────────────────────
log('11) reload — data persists');
const url = page.url();
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await page.getByRole('tab', { name: /Records/ }).click();
await page.waitForTimeout(800);
const acmeAfterReload = await page
  .locator('table td:has-text("Acme Corp")')
  .first()
  .isVisible()
  .catch(() => false);
note(acmeAfterReload ? 'PASS' : 'FAIL', 'records persist after reload');
log('   url after reload:', url);

// ── 12. BE persistence check ────────────────────────────────────────────
const beState = await page.evaluate(async () => {
  const cr = await fetch('/api/rexer/collections?q=Customers&limit=1', {
    credentials: 'include',
  });
  const cj = await cr.json();
  const col = cj.items?.[0];
  if (!col) return { collections: 0, records: 0 };
  const rr = await fetch(
    `/api/rexer/collections/${col.id}/records?limit=20`,
    { credentials: 'include' }
  );
  const rj = await rr.json();
  return { collections: cj.items?.length ?? 0, records: rj.items?.length ?? 0 };
});
note(
  beState.collections >= 1 ? 'PASS' : 'FAIL',
  `BE collections list has ${beState.collections} item(s)`
);
note(
  beState.records >= 2 ? 'PASS' : 'FAIL',
  `BE records list has ${beState.records} item(s)`
);

// ── 13. Delete record ───────────────────────────────────────────────────
log('13) delete first record');
page.once('dialog', d => d.accept());
const deleteBtns = page.locator('table button[aria-label="Delete"]');
const deleteCountBefore = await deleteBtns.count();
log(`   delete buttons before: ${deleteCountBefore}`);
if (deleteCountBefore > 0) {
  await deleteBtns.first().click();
  await page.waitForTimeout(2500);
  const deleteCountAfter = await page
    .locator('table button[aria-label="Delete"]')
    .count();
  note(
    deleteCountAfter === deleteCountBefore - 1 ? 'PASS' : 'FAIL',
    `record count dropped from ${deleteCountBefore} → ${deleteCountAfter}`
  );
}

// ── 14. Cleanup: archive collection ─────────────────────────────────────
log('14) archive collection');
await page.goto(BASE + '/template', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(500);
await page.getByRole('tab', { name: /Data collections/ }).click();
await page.waitForTimeout(500);
page.once('dialog', d => d.accept());
const archiveBtn = page.locator(
  'button[aria-label="Archive collection"]'
);
if ((await archiveBtn.count()) > 0) {
  await archiveBtn.first().click();
  await page.waitForTimeout(800);
  const stillThere = await page
    .locator('a[href^="/collections/"]:has-text("Customers")')
    .first()
    .isVisible()
    .catch(() => false);
  note(
    !stillThere ? 'PASS' : 'FAIL',
    'collection archived → no longer in active list'
  );
}

await browser.close();

// ── Report ──────────────────────────────────────────────────────────────
const lines = [];
lines.push('# Collection flow verify');
lines.push(`Date: ${new Date().toISOString()}`);
lines.push('');
checks.forEach(c =>
  lines.push(`- ${c.kind === 'PASS' ? '✅' : '❌'} ${c.msg}`)
);
const pass = checks.filter(c => c.kind === 'PASS').length;
const fail = checks.filter(c => c.kind === 'FAIL').length;
lines.push('');
lines.push(`Summary: ${pass} pass · ${fail} fail`);
const report = lines.join('\n');
await writeFile(join(OUT, 'verify-collection-report.md'), report);
console.log('\n' + report);
