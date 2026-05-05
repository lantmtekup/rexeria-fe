// Visual regression: snap each of 6 block types at 3 device frames (mobile/tablet/desktop)
// after container-query refactor. Total 18 screenshots.
import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const url = `${base}/canvas-templates/e3e3e3e3-0000-0000-0000-000000000002`;

const BLOCK_LABELS = [
  { type: 'hero_split', dialog: 'Hero Split', tab: 'HERO SPLIT' },
  { type: 'hero_overlay', dialog: 'Hero Overlay', tab: 'HERO OVERLAY' },
  { type: 'feature_section', dialog: 'Feature', tab: 'TIỆN ÍCH NỔI BẬT' },
  { type: 'photo_gallery', dialog: 'Gallery', tab: 'THƯ VIỆN ẢNH' },
  { type: 'booking_form', dialog: 'Booking', tab: 'ĐẶT CHỖ' },
  { type: 'cta_section', dialog: 'CTA', tab: 'CTA' },
];

const DEVICES = [
  { name: 'mobile', label: 'Mobile' },
  { name: 'tablet', label: 'Tablet' },
  { name: 'desktop', label: 'Desktop' },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Step 1 — wipe existing tabs (delete all blocks if any) — too hard via UI.
// Instead, we'll just clear localStorage and inject 6 fresh blocks via window.
// Simplest: just add 6 blocks to whatever exists, then iterate the 6 LATEST tabs
// (we know they are at the END of the tab list).

// Add all 6 block types
for (const { dialog: dialogLabel } of BLOCK_LABELS) {
  const addBtn = page.locator('button[aria-label="Thêm block"]').first();
  await addBtn.click();
  await page.waitForTimeout(300);
  // Click the card with exact label
  // Scope to the dialog content
  const dialog = page.locator('[role="dialog"]');
  await dialog
    .locator('button')
    .filter({ has: page.locator(`span:has-text("${dialogLabel}")`) })
    .first()
    .click({ force: true });
  await page.waitForTimeout(500);
}
console.log('all 6 blocks added');

// Step 2 — count total tabs to know which indices are the 6 we just added
const tabCount = await page.locator('[data-block-tab-index]').count();
let startIndex = tabCount - BLOCK_LABELS.length;
if (startIndex < 0) {
  // Fallback — count differently, use block name span
  const spans = await page.locator('span').filter({ hasText: /^\d+\./ }).count();
  startIndex = Math.max(0, spans - BLOCK_LABELS.length);
}
console.log('total tabs:', tabCount, 'starting from index', startIndex);

// Step 3 — for each block tab, click it then snap each device
for (let bi = 0; bi < BLOCK_LABELS.length; bi++) {
  const { type, tab: tabLabel } = BLOCK_LABELS[bi];

  // Use DOM API directly because @dnd-kit listeners on the tab swallow
  // Playwright pointer events. Find span text matching, walk to the
  // closest cursor-pointer div, dispatch a real click.
  const clicked = await page.evaluate(label => {
    const spans = Array.from(document.querySelectorAll('span'));
    const matched = spans
      .filter(s => /^\d+\.\s*/.test(s.textContent || ''))
      .filter(s =>
        (s.textContent || '').toUpperCase().includes(label.toUpperCase())
      );
    const target = matched[matched.length - 1];
    if (!target) return false;
    const tabDiv = target
      .closest('[class*="flex"]')
      ?.querySelector('.cursor-pointer');
    if (!tabDiv) return false;
    tabDiv.click();
    return true;
  }, tabLabel);
  if (!clicked) {
    console.warn('tab click failed:', tabLabel);
    continue;
  }
  await page.waitForTimeout(500);

  for (const { name, label: deviceLabel } of DEVICES) {
    const deviceBtn = page.getByRole('button', { name: deviceLabel }).first();
    await deviceBtn.click();
    await page.waitForTimeout(500);

    // Clip just the canvas preview area (between header h-14 and tab bar h-32)
    // Header = top 56px. ElementToolbar = 48px. So canvas starts at ~104px.
    // Right sidebar starts at viewport_w - 280px = 1160px.
    await page.screenshot({
      path: `scripts/visual-tests/out/blocks-${type}-${name}.png`,
      clip: { x: 0, y: 56, width: 1160, height: 700 },
    });
    console.log('snap', type, name);
  }
}

await browser.close();
console.log('done');
