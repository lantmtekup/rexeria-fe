import { expect, test } from 'playwright/test';

const TEMPLATE_ID = 'e0c2b922-0dca-4fdb-be04-f622d9b6c5cb';
const EDITOR_URL = `/canvas-templates/${TEMPLATE_ID}`;

test.describe('Motion subsystem · canvas editor', () => {
  test('header motion button is rendered', async ({ page }) => {
    await page.goto(EDITOR_URL);
    const btn = page.getByTestId('header-motion-button');
    await expect(btn).toBeVisible({ timeout: 20_000 });
    await expect(btn).toContainText('Motion');
  });

  test('motion popover opens with preset gallery and categories', async ({
    page,
  }) => {
    await page.goto(EDITOR_URL);
    await page.getByTestId('header-motion-button').click();

    const popover = page.getByTestId('motion-popover');
    await expect(popover).toBeVisible();

    // hero block defaults — entrance category should appear with cards
    await expect(popover.getByTestId('motion-category-entrance')).toBeVisible();
    await expect(
      popover.getByTestId('motion-preset-hero.fade-up-stagger')
    ).toBeVisible();

    // Apply button initially disabled (no preset selected)
    await expect(popover.getByTestId('motion-popover-apply')).toBeDisabled();
  });

  test('selecting a preset enables apply, persists to header label', async ({
    page,
  }) => {
    await page.goto(EDITOR_URL);
    await page.getByTestId('header-motion-button').click();

    const popover = page.getByTestId('motion-popover');
    await popover.getByTestId('motion-preset-hero.fade-up-stagger').click();

    // active flag flips on the card
    await expect(
      popover.getByTestId('motion-preset-hero.fade-up-stagger')
    ).toHaveAttribute('data-active', 'true');

    // knobs panel surfaces — match the role group, not the card text.
    await expect(
      popover.getByRole('radiogroup', { name: 'Tốc độ' })
    ).toBeVisible();
    await expect(
      popover.getByRole('radiogroup', { name: 'Cường độ' })
    ).toBeVisible();
    await expect(
      popover.getByRole('radiogroup', { name: 'Cascade' })
    ).toBeVisible();

    const apply = popover.getByTestId('motion-popover-apply');
    await expect(apply).toBeEnabled();
    await apply.click();

    // popover closed
    await expect(popover).toBeHidden();

    // header reflects the applied preset name
    const btn = page.getByTestId('header-motion-button');
    await expect(btn).toContainText('Hiện lên + cascade');
  });

  test('disable motion via popover footer clears header label', async ({
    page,
  }) => {
    await page.goto(EDITOR_URL);

    // First apply a preset
    await page.getByTestId('header-motion-button').click();
    let popover = page.getByTestId('motion-popover');
    await popover.getByTestId('motion-preset-hero.scale-in').click();
    await popover.getByTestId('motion-popover-apply').click();

    // Reopen and disable
    await page.getByTestId('header-motion-button').click();
    popover = page.getByTestId('motion-popover');
    await popover.getByTestId('motion-popover-disable').click();

    // header should fall back to 'Motion'
    const btn = page.getByTestId('header-motion-button');
    await expect(btn).toHaveText(/Motion/i);
  });

  test('sidebar Motion tab renders empty-state when no element selected', async ({
    page,
  }) => {
    await page.goto(EDITOR_URL);
    // BlockEditorSidebar already mounts with Lớp tab active.
    await page.getByTestId('sidebar-tab-motion').click();
    await expect(page.getByTestId('motion-panel-empty')).toBeVisible();
  });

  test('preview button toggles preview state', async ({ page }) => {
    await page.goto(EDITOR_URL);
    const previewBtn = page.getByTestId('header-motion-preview');
    await expect(previewBtn).toBeVisible();
    await previewBtn.click();
    // Visual state: button gets indigo bg class (we verify via class name match)
    await expect(previewBtn).toHaveClass(/indigo/);
  });

  test('Space key triggers motion preview', async ({ page }) => {
    await page.goto(EDITOR_URL);
    const previewBtn = page.getByTestId('header-motion-preview');
    await page.locator('body').focus();
    await page.keyboard.press('Space');
    await expect(previewBtn).toHaveClass(/indigo/);
  });

  test('?testMotion= URL param applies a hero motion (visible animation)', async ({
    page,
  }) => {
    await page.goto(`${EDITOR_URL}?testMotion=hero.fade-up-stagger`);

    // Wait for canvas to render — at least 1 element-key target should exist.
    const firstTarget = page
      .locator('[data-element-key]:not([data-element-key^="__"])')
      .first();
    await expect(firstTarget).toBeAttached({ timeout: 20_000 });

    // GSAP applies inline transform/opacity on `from` tweens. Verify within
    // a reasonable window that at least one targeted element has a non-empty
    // inline style.
    await expect
      .poll(
        async () => {
          return await firstTarget.evaluate(el => {
            const inline = (el as HTMLElement).style;
            return Boolean(
              inline.transform || inline.opacity || inline.visibility
            );
          });
        },
        { timeout: 5_000, intervals: [100, 200, 400] }
      )
      .toBe(true);
  });
});
