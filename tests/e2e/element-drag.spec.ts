import { expect, test, type Page } from 'playwright/test';

/**
 * Free-form element repositioning (Figma-style).
 *
 * Interaction:
 *   - first click selects an element on the canvas
 *   - pointer-down on the SELECTED element + drag → element moves
 *   - pointer-up commits the offset to `block.elementPositions[device][key]`
 *
 * We verify the round-trip via inline `style.transform` on the data-element
 * since BlockPreview applies the position as `translate(Xpx, Ypx)`.
 */
const TEMPLATE_ID = 'e0c2b922-0dca-4fdb-be04-f622d9b6c5cb';
const EDITOR_URL = `/canvas-templates/${TEMPLATE_ID}`;

async function openEditor(page: Page) {
  await page.goto(EDITOR_URL);
  await expect(page.getByTestId('header-motion-editor')).toBeVisible({
    timeout: 20_000,
  });
  // Anchor to hero_split so the element keys are predictable.
  const tab = page.getByTestId('block-tab-hero_split');
  if (await tab.count()) {
    await tab.scrollIntoViewIfNeeded();
    await tab.evaluate(el => (el as HTMLElement).click());
    await expect(tab).toHaveAttribute('data-active', 'true', {
      timeout: 5_000,
    });
  }
  await page.waitForTimeout(300);
}

// Target `eyebrow` rather than `title` because previous test files spawn
// `extraElements` at (80, 80) which can overlap the title's typical
// position. Eyebrow sits at the very top of the text column → safe.
function activeTitle(page: Page) {
  return page
    .getByTestId('active-block-preview')
    .locator('[data-element-key="eyebrow"]')
    .first();
}

async function selectTitle(page: Page) {
  const target = activeTitle(page);
  const box = await target.boundingBox();
  if (!box) throw new Error('eyebrow element not visible');
  await page.mouse.click(box.x + 4, box.y + 4);
  await page.waitForTimeout(100);
}

async function clearExtraElements(page: Page) {
  // Other tests (extra-element-kinds, etc.) spawn extras at position
  // (80, 80) which overlap the title's natural location → click goes to
  // the extra, not the title. Trash every extra-element row in the Layers
  // panel via the canvas's `[data-extra-element-id]` mutation watchers —
  // we scope to the SIDEBAR list (not the toolbar) by selecting buttons
  // inside the `block-editor-sidebar` container.
  const layersTab = page.getByTestId('sidebar-tab-layers');
  if (await layersTab.count()) {
    await layersTab.click();
    await page.waitForTimeout(150);
  }
  const sidebar = page.getByTestId('block-editor-sidebar');
  for (let i = 0; i < 30; i++) {
    const trash = sidebar.getByRole('button', { name: /Xoá element/i }).first();
    if ((await trash.count()) === 0) break;
    await trash.click();
    await page.waitForTimeout(150);
  }
}

test.describe('Element drag (free-form position)', () => {
  test.beforeEach(async ({ page }) => {
    await openEditor(page);
    // Strip out anything previous tests left lying on top of the title.
    page.on('dialog', d => d.accept().catch(() => undefined));
    await clearExtraElements(page);
    await page.waitForTimeout(250);
  });

  test('drag a selected element commits transform offset', async ({ page }) => {
    await selectTitle(page);

    const target = activeTitle(page);
    const before = await target.boundingBox();
    if (!before) throw new Error('no box before drag');

    // Start the drag from the CENTER of the title element. Move down + right
    // beyond the 4px activation threshold so handlePointerMove flips active.
    const sx = before.x + before.width / 2;
    const sy = before.y + before.height / 2;
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx + 8, sy + 8, { steps: 3 });
    await page.mouse.move(sx + 60, sy + 40, { steps: 12 });
    await page.waitForTimeout(50);
    await page.mouse.up();
    await page.waitForTimeout(200);

    const transform = await target.evaluate(
      el => (el as HTMLElement).style.transform || ''
    );
    expect(transform).toMatch(/translate\(/);
    // Sanity: non-zero offset on both axes.
    const m = transform.match(
      /translate\((-?\d+(?:\.\d+)?)px, (-?\d+(?:\.\d+)?)px\)/
    );
    expect(m, `unexpected transform: ${transform}`).not.toBeNull();
    expect(Math.abs(Number(m![1]))).toBeGreaterThan(10);
    expect(Math.abs(Number(m![2]))).toBeGreaterThan(10);
  });

  test('clicking an UNSELECTED element only selects, no drag', async ({
    page,
  }) => {
    // Don't pre-select. First pointerdown on a non-selected element should
    // NOT move it — only select.
    const target = activeTitle(page);
    const before = await target.boundingBox();
    if (!before) throw new Error('no box before');
    const initialTransform = await target.evaluate(
      el => (el as HTMLElement).style.transform || ''
    );

    const sx = before.x + before.width / 2;
    const sy = before.y + before.height / 2;
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx + 60, sy + 40, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(200);

    const after = await target.evaluate(
      el => (el as HTMLElement).style.transform || ''
    );
    expect(after).toBe(initialTransform);
  });
});
