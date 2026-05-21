import { expect, test, type Page } from 'playwright/test';

/**
 * Smoke test for Wave 3 block types: stories / split_screen / quiz.
 * Each test verifies:
 *   - AddBlockDialog exposes the new type as a card
 *   - clicking the card appends a block of that type to the canvas
 *   - the block component renders without throwing (key UI lands)
 */
const TEMPLATE_ID = 'e0c2b922-0dca-4fdb-be04-f622d9b6c5cb';
const EDITOR_URL = `/canvas-templates/${TEMPLATE_ID}`;

async function openEditor(page: Page) {
  await page.goto(EDITOR_URL);
  await expect(page.getByTestId('header-motion-editor')).toBeVisible({
    timeout: 20_000,
  });
  page.on('dialog', d => d.accept().catch(() => undefined));
}

async function openAddBlockDialog(page: Page) {
  // Plus button in the BlockTabBar (bottom of canvas).
  await page
    .getByRole('button', { name: /Thêm block/i })
    .first()
    .click();
  await page.waitForTimeout(150);
}

async function pickType(page: Page, label: RegExp) {
  await page.getByRole('button', { name: label }).first().click();
  await page.waitForTimeout(400);
}

test.describe('Wave 3 block types (stories / split_screen / quiz)', () => {
  test.beforeEach(async ({ page }) => {
    await openEditor(page);
  });

  test('AddBlockDialog exposes Stories, Split screen, Quiz', async ({
    page,
  }) => {
    await openAddBlockDialog(page);
    await expect(
      page.getByRole('button', { name: /Stories/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Split screen/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^Quiz/i }).first()
    ).toBeVisible();
  });

  test('Stories: tab appears + slides container visible', async ({ page }) => {
    await openAddBlockDialog(page);
    await pickType(page, /Stories/i);
    // The new block's tab appears in BlockTabBar.
    await expect(page.getByTestId('block-tab-stories').first()).toBeVisible({
      timeout: 5_000,
    });
    // The canvas should show a slides container with default seed content
    // (title "Mặt tiền sang trọng").
    const preview = page.getByTestId('active-block-preview');
    await expect(preview.getByText(/sang trọng/i).first()).toBeVisible({
      timeout: 3_000,
    });
  });

  test('Split screen: tab appears + two view labels visible', async ({
    page,
  }) => {
    await openAddBlockDialog(page);
    await pickType(page, /Split screen/i);
    await expect(
      page.getByTestId('block-tab-split_screen').first()
    ).toBeVisible({ timeout: 5_000 });
    const preview = page.getByTestId('active-block-preview');
    // Seed defaults two views: "Căn duplex" + "Căn studio"
    await expect(preview.getByText(/duplex/i).first()).toBeVisible({
      timeout: 3_000,
    });
    await expect(preview.getByText(/studio/i).first()).toBeVisible();
  });

  test('Quiz: tab appears + first question option visible', async ({
    page,
  }) => {
    await openAddBlockDialog(page);
    await pickType(page, /^Quiz/i);
    await expect(page.getByTestId('block-tab-quiz').first()).toBeVisible({
      timeout: 5_000,
    });
    const preview = page.getByTestId('active-block-preview');
    // Seed quiz has question "Gia đình bạn có bao nhiêu người?" with options
    // including "1-2 người"
    await expect(preview.getByText(/1-2 người/i).first()).toBeVisible({
      timeout: 3_000,
    });
  });

  test('Quiz: clicking an option enables the Next button', async ({ page }) => {
    await openAddBlockDialog(page);
    await pickType(page, /^Quiz/i);
    const preview = page.getByTestId('active-block-preview');
    const nextBtn = preview.getByRole('button', { name: /^Tiếp$/i }).first();
    await expect(nextBtn).toBeDisabled();
    // Pick first option
    await preview
      .getByRole('button', { name: /3-4 người/i })
      .first()
      .click();
    await expect(nextBtn).toBeEnabled();
  });
});
