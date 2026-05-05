// Verify add/remove Member chips in Create Marketing dialog.
//
// Flow:
//   1. Sign in → /marketing
//   2. Open Create Marketing dialog
//   3. Count default member chips (4)
//   4. Click X on first chip → expect 3 chips remaining
//   5. Click "+ Add" → type a new name → Enter → expect 4 chips again,
//      including the typed name
//
// Usage: BASE_URL=http://localhost:3003 node scripts/visual-tests/verify-marketing-member.mjs

import { chromium } from 'playwright';
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
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();
page.on('pageerror', e =>
  note('FAIL', `pageerror: ${e.message?.slice(0, 200)}`)
);

try {
  log('1) sign in');
  await page.goto(BASE + '/sign-in', { waitUntil: 'load' });
  await page.waitForSelector('input[type=email]', { timeout: 20000 });
  await page.locator('form button[type=submit]').first().click();
  await page.waitForURL(/\/home/, { timeout: 20000 });

  log('2) goto /marketing');
  await page.goto(BASE + '/marketing', { waitUntil: 'load' });
  await page.waitForTimeout(1200);

  log('3) open Create Marketing dialog');
  // Top-right "+ Add more Marketing" or empty-state "+ Create Marketing".
  const openBtn = page
    .locator(
      'button:has-text("Add more Marketing"), button:has-text("Create Marketing")'
    )
    .first();
  await openBtn.waitFor({ state: 'visible', timeout: 10000 });
  await openBtn.click();
  // Dialog title appears
  await page
    .getByRole('dialog')
    .getByText('Create Marketing', { exact: true })
    .waitFor({ timeout: 10000 });

  const dialog = page.getByRole('dialog');

  // ── Initial chips ───────────────────────────────────────────────────
  const chips = dialog.locator('[data-testid="member-chip"]');
  const initialCount = await chips.count();
  log('   initial chips =', initialCount);
  if (initialCount === 4) note('PASS', 'Default 4 member chips present');
  else note('FAIL', `Expected 4 default chips, got ${initialCount}`);

  // ── Remove first chip ───────────────────────────────────────────────
  log('4) remove first chip');
  const firstChipName = (await chips.first().innerText()).trim();
  log('   removing =', firstChipName);
  await chips.first().locator('button[aria-label^="Bỏ"]').click();
  await page.waitForTimeout(300);
  const afterRemove = await chips.count();
  if (afterRemove === 3)
    note('PASS', `Chip removed (${initialCount} → ${afterRemove})`);
  else note('FAIL', `Remove did not work: ${initialCount} → ${afterRemove}`);

  // ── Add a new member ────────────────────────────────────────────────
  log('5) click + Add and type new member');
  const addBtn = dialog.locator('button[aria-label="Thêm thành viên"]');
  await addBtn.waitFor({ state: 'visible', timeout: 5000 });
  await addBtn.click();
  const memberInput = dialog.locator('input[aria-label="Tên thành viên"]');
  await memberInput.waitFor({ state: 'visible', timeout: 5000 });
  const newName = 'Quincy Test';
  await memberInput.fill(newName);
  await memberInput.press('Enter');
  await page.waitForTimeout(300);

  const afterAdd = await chips.count();
  if (afterAdd === 4) note('PASS', `Chip added (${afterRemove} → ${afterAdd})`);
  else note('FAIL', `Add did not work: ${afterRemove} → ${afterAdd}`);

  const lastChipText = (await chips.last().innerText()).trim();
  if (lastChipText.includes(newName))
    note('PASS', `Last chip contains "${newName}"`);
  else note('FAIL', `Last chip = "${lastChipText}", expected "${newName}"`);

  await page.screenshot({ path: join(OUT, 'marketing-member.png') });
} finally {
  await browser.close();
}

const passed = checks.filter(c => c.kind === 'PASS').length;
const failed = checks.filter(c => c.kind === 'FAIL').length;
log(`\nDone — ${passed} pass / ${failed} fail`);
process.exit(failed === 0 ? 0 : 1);
