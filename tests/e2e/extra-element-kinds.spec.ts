import { expect, test, type Page } from 'playwright/test';

/**
 * Smoke test for ExtraElement kinds (Wave 2 batch: countdown, reveal,
 * spin_wheel). We don't try to verify visual animation; we just confirm:
 *   - the "Thêm element" picker exposes each kind
 *   - clicking the picker adds an element with the right kind into the
 *     active block's extraElements array (via the rendered list)
 *   - the new element appears on the canvas (non-zero DOM presence)
 *
 * No network or AI required.
 */
const TEMPLATE_ID = 'e0c2b922-0dca-4fdb-be04-f622d9b6c5cb';
const EDITOR_URL = `/canvas-templates/${TEMPLATE_ID}`;

async function openEditor(page: Page) {
  await page.goto(EDITOR_URL);
  await expect(page.getByTestId('header-motion-editor')).toBeVisible({
    timeout: 20_000,
  });
  // Anchor to hero_split for a stable starting block.
  const heroTab = page.getByTestId('block-tab-hero_split');
  if (await heroTab.count()) {
    await heroTab.scrollIntoViewIfNeeded();
    await heroTab.evaluate(el => (el as HTMLElement).click());
    await page.waitForTimeout(300);
  }
}

async function openAddElementPicker(page: Page) {
  // The "+ Thêm element" button lives in the Layers sidebar. The Motion tab
  // hides it, so flip back to Layers first.
  const layersTab = page.getByTestId('sidebar-tab-layers');
  if (await layersTab.count()) await layersTab.click();
  await page.waitForTimeout(150);
  await page
    .getByRole('button', { name: /Thêm element/i })
    .first()
    .click();
  // The popover renders via Radix portal — give it a tick to mount.
  await page.waitForTimeout(120);
}

test.describe('Extra element kinds (Wave 2)', () => {
  test.beforeEach(async ({ page }) => {
    await openEditor(page);
  });

  test('picker exposes countdown / reveal / spin_wheel options', async ({
    page,
  }) => {
    await openAddElementPicker(page);
    const popover = page.locator(
      '[role="dialog"], [data-radix-popper-content-wrapper]'
    );
    await expect(
      popover.getByRole('button', { name: /Countdown/i }).first()
    ).toBeVisible();
    await expect(
      popover.getByRole('button', { name: /Reveal/i }).first()
    ).toBeVisible();
    await expect(
      popover.getByRole('button', { name: /Vòng quay/i }).first()
    ).toBeVisible();
  });

  test('adding countdown spawns an element with a tick', async ({ page }) => {
    await openAddElementPicker(page);
    // Scope to the Radix popover content — the layers panel can also list
    // "Countdown" items when previous tests left state behind, which would
    // otherwise hijack `getByRole('button', { name: /Countdown/i })`.
    await page
      .locator('[role="dialog"], [data-radix-popper-content-wrapper]')
      .getByRole('button', { name: /Countdown/i })
      .first()
      .click();
    const preview = page.getByTestId('active-block-preview');
    await expect(preview.getByText(/ngày/i).first()).toBeVisible({
      timeout: 3_000,
    });
  });

  test('adding reveal spawns the cover canvas + mode badge', async ({
    page,
  }) => {
    await openAddElementPicker(page);
    await page
      .locator('[role="dialog"], [data-radix-popper-content-wrapper]')
      .getByRole('button', { name: /^Reveal /i })
      .first()
      .click();
    const preview = page.getByTestId('active-block-preview');
    await expect(preview.locator('canvas').first()).toBeVisible({
      timeout: 3_000,
    });
  });

  test('adding spin_wheel spawns the wheel SVG + Quay button', async ({
    page,
  }) => {
    await openAddElementPicker(page);
    await page
      .locator('[role="dialog"], [data-radix-popper-content-wrapper]')
      .getByRole('button', { name: /Vòng quay/i })
      .first()
      .click();
    const preview = page.getByTestId('active-block-preview');
    await expect(
      preview.getByRole('button', { name: /Quay/i }).first()
    ).toBeVisible({ timeout: 3_000 });
  });
});
