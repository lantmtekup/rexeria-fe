/**
 * E2E verification of the "Lưu thành của tôi" duplicate flow.
 *
 *   1. Login via /sign-in (RexerSignInForm has dev defaults).
 *   2. Open canvas editor for the seed template.
 *   3. Click "Lưu thành của tôi" → fill name → Save.
 *   4. Verify URL changes to /canvas-templates/{newId} (different from seed).
 *   5. Hit /template list and confirm the new template is in the grid.
 *   6. Click "My Template" filter pill and confirm it stays visible
 *      (because we set is_template: false on duplicate).
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:3003';
const SEED_ID = 'e3e3e3e3-0000-0000-0000-000000000003';
const OUT = 'scripts/visual-tests/out';

const log = (...a) => console.log(...a);
const fail = msg => {
  console.error(`❌ ${msg}`);
  process.exitCode = 1;
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();
page.on('pageerror', e => log('[pageerror]', e.message));
page.on('console', m => {
  if (m.type() === 'error') log('[console.error]', m.text());
});

// 1) Login
log('▶ 1) goto /sign-in');
await page.goto(BASE + '/sign-in', { waitUntil: 'load' });
await page.waitForSelector('input[type=email]', { timeout: 15000 });
await page.locator('form button[type=submit]').first().click();
await page
  .waitForURL(/\/home/, { timeout: 20000 })
  .catch(e => log('  [waitURL]', e.message));
log('  ✓ logged in, url=', page.url());

// 2) Open seed canvas
log('▶ 2) open canvas editor');
await page.goto(`${BASE}/canvas-templates/${SEED_ID}`, { waitUntil: 'load' });
// Wait for editor block list (post-canvas-fetch). BE GAP-18 is slow ~10s.
await page.waitForSelector('[data-element-key]', { timeout: 25000 });
log('  ✓ editor loaded');
await page.screenshot({ path: `${OUT}/dup-01-editor.png`, fullPage: false });

// 3) Click "Lưu thành của tôi"
log('▶ 3) click "Lưu thành của tôi"');
const saveBtn = page.locator('button:has-text("Lưu thành của tôi")');
if ((await saveBtn.count()) === 0) fail('Save button not found');
await saveBtn.first().click();
await page.waitForSelector('input#dup-name', { timeout: 5000 });
log('  ✓ duplicate dialog opened');

const newName = `E2E test ${new Date().toISOString().slice(0, 19)}`;
await page.fill('input#dup-name', newName);
log(`  ▶ filling name = "${newName}"`);
await page.screenshot({ path: `${OUT}/dup-02-dialog.png`, fullPage: false });

// 4) Submit
const beforeUrl = page.url();
await page.locator('button[type=submit]:has-text("Lưu")').click();
await page
  .waitForURL(u => !u.toString().endsWith(SEED_ID), { timeout: 25000 })
  .catch(e => fail(`URL did not change after save: ${e.message}`));
const afterUrl = page.url();
const newId = afterUrl.match(/canvas-templates\/([^/?#]+)/)?.[1];
if (!newId || newId === SEED_ID) {
  fail(`Expected new template id, got url=${afterUrl}`);
} else {
  log('  ✓ landed on new editor:', newId, '(was', beforeUrl, ')');
}
await page.waitForTimeout(800);
await page.screenshot({
  path: `${OUT}/dup-03-after-save.png`,
  fullPage: false,
});

// 5) Go to /template list and check
log('▶ 5) verify new template appears in /template list');
await page.goto(BASE + '/template', { waitUntil: 'load' });
await page.waitForSelector('article', { timeout: 15000 });
await page.waitForTimeout(800);

const allCardCount = await page.locator('article').count();
const newTplCard = page.locator(`article:has-text("${newName}")`);
const inAllTab = await newTplCard.count();
log(`  · cards in "All": ${allCardCount}, matched-by-name: ${inAllTab}`);
if (inAllTab === 0) fail('New template not visible in default list');

await page.screenshot({ path: `${OUT}/dup-04-list-all.png`, fullPage: false });

// 6) Click "My Template" filter
log('▶ 6) click "My Template" filter');
const myPill = page.locator('button:has-text("My Template")');
if ((await myPill.count()) === 0) fail('My Template filter pill not found');
await myPill.first().click();
await page.waitForTimeout(500);

const inMyTab = await page.locator(`article:has-text("${newName}")`).count();
const myCount = await page.locator('article').count();
log(`  · cards in "My Template": ${myCount}, matched-by-name: ${inMyTab}`);
if (inMyTab === 0)
  fail(
    'New template missing from "My Template" filter (is_template flag may not be respected)'
  );

await page.screenshot({ path: `${OUT}/dup-05-list-my.png`, fullPage: false });

log('');
if (process.exitCode) {
  log('🔴 FAILED — see screenshots in', OUT);
} else {
  log('✅ duplicate flow verified end-to-end');
  log(`   new template: ${newName}`);
  log(`   id:           ${newId}`);
  log(`   list-all hit: ${inAllTab} card(s)`);
  log(`   list-my hit:  ${inMyTab} card(s)`);
}

await browser.close();
