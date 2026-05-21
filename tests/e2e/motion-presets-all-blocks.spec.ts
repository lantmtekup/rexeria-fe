import { expect, test, type Page } from 'playwright/test';

/**
 * Smoke test for the motion preset panel across every block type in the
 * canvas template. For each block:
 *   - switch to its tab
 *   - clear any prior motion (via Advanced timeline)
 *   - apply Stagger all → fades up all rows
 *   - hit Phát preview
 *   - assert that every visible [data-element-key] inside the active
 *     preview ends up with a non-identity computed transform (i.e. GSAP
 *     really animated it, not just wrote inline styles overridden by CSS)
 *
 * Lives in a separate file so it can be run on its own:
 *   npx playwright test motion-presets-all-blocks
 */

const TEMPLATE_ID = 'e0c2b922-0dca-4fdb-be04-f622d9b6c5cb';
const EDITOR_URL = `/canvas-templates/${TEMPLATE_ID}`;

/** Every block type the test template is known to contain. */
const BLOCK_TYPES = [
  'hero_split',
  'hero_overlay',
  'feature_section',
  'photo_gallery',
  'booking_form',
  'cta_section',
] as const;

async function openEditor(page: Page) {
  await page.goto(EDITOR_URL);
  await expect(page.getByTestId('header-motion-editor')).toBeVisible({
    timeout: 20_000,
  });
}

async function selectBlock(page: Page, blockType: string) {
  // `.first()` guards against templates that ended up with multiple blocks
  // of the same type from prior test runs / duplications.
  const tab = page.getByTestId(`block-tab-${blockType}`).first();
  if ((await tab.count()) === 0) {
    test.skip(true, `block type "${blockType}" not in this template`);
  }
  await tab.scrollIntoViewIfNeeded();
  // Bypass dnd-kit's sortable listeners (which can swallow the first click
  // as a potential drag-start) by dispatching the click event directly via
  // JS. We retry the active-check in case React's state update is delayed.
  for (let attempt = 0; attempt < 3; attempt++) {
    await tab.evaluate(el => (el as HTMLElement).click());
    try {
      await expect(tab).toHaveAttribute('data-active', 'true', {
        timeout: 2_000,
      });
      break;
    } catch {
      if (attempt === 2) throw new Error(`Could not activate ${blockType}`);
      await page.waitForTimeout(200);
    }
  }
  await page.waitForTimeout(200);
}

async function clearMotion(page: Page) {
  await page.getByTestId('header-motion-editor').click();
  await expect(page.getByTestId('motion-modal')).toBeVisible();
  for (let i = 0; i < 20; i++) {
    const remaining = await page.getByLabel('Xóa track').count();
    if (remaining === 0) break;
    await page.getByLabel('Xóa track').first().click();
  }
  await page.getByTestId('motion-modal-close').click();
  await expect(page.getByTestId('motion-modal')).toBeHidden();
}

/** Read the computed transform's tx + |ty| sum. 0 = identity / no anim. */
async function transformMagnitude(
  page: Page,
  selector: string
): Promise<number> {
  return page
    .getByTestId('active-block-preview')
    .locator(selector)
    .first()
    .evaluate(el => {
      const t = getComputedStyle(el).transform;
      if (!t || t === 'none') return 0;
      const m = t.match(/matrix\(([^)]+)\)/);
      if (!m) return 0;
      const parts = m[1]!.split(',').map(s => Number(s.trim()));
      return Math.abs(parts[4] ?? 0) + Math.abs(parts[5] ?? 0);
    });
}

test.describe('Motion presets on every block type', () => {
  test.beforeEach(async ({ page }) => {
    await openEditor(page);
  });

  for (const blockType of BLOCK_TYPES) {
    test(`${blockType}: Stagger all + Play preview animates every visible element`, async ({
      page,
    }) => {
      await selectBlock(page, blockType);

      // Make sure the sidebar Motion tab is open AFTER block switch (the
      // panel re-renders to pick up this block's element list).
      await page.getByTestId('sidebar-tab-motion').click();
      await clearMotion(page);
      await page.getByTestId('sidebar-tab-motion').click();

      // Some blocks may not have any animatable rows (unlikely but guard).
      const rowCount = await page
        .locator('[data-testid^="motion-row-"]')
        .count();
      test.skip(rowCount === 0, `${blockType} exposes no animatable elements`);

      await page.getByRole('button', { name: /Stagger all/i }).click();

      // Collect element keys from the panel — these are the GSAP targets
      // the runtime will try to resolve in the DOM.
      const keys = (
        await page
          .locator('[data-testid^="motion-row-"]')
          .evaluateAll(els =>
            els.map(el => (el as HTMLElement).dataset.testid ?? '')
          )
      )
        .map(t => t.replace('motion-row-', ''))
        .filter(Boolean);

      await page.getByTestId('sidebar-play-motion-preview').click();

      const preview = page.getByTestId('active-block-preview');
      const missing: string[] = [];
      let animated = 0;
      for (const key of keys) {
        const target = preview.locator(`[data-element-key="${key}"]`).first();
        if ((await target.count()) === 0) continue; // not rendered
        const visible = await target.evaluate(el => {
          const h = el as HTMLElement;
          return h.offsetWidth > 0 && h.offsetHeight > 0;
        });
        if (!visible) continue;
        try {
          await expect
            .poll(
              () => transformMagnitude(page, `[data-element-key="${key}"]`),
              { timeout: 2_000 }
            )
            .toBeGreaterThan(0.5);
          animated++;
        } catch {
          missing.push(key);
        }
      }
      expect(
        missing,
        `${blockType}: elements without computed transform → ${missing.join(', ')}`
      ).toEqual([]);
      expect(
        animated,
        `${blockType}: no element animated`
      ).toBeGreaterThanOrEqual(1);
    });
  }
});
