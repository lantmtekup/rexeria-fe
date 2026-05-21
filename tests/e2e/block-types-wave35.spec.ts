import { expect, test, type Page } from 'playwright/test';

/**
 * Smoke tests for Wave 3.5 + Wave 4 lite block types:
 *   - poll        (single-question vote)
 *   - carousel_3d (3D coverflow image carousel)
 *   - flipbook    (page-turn catalog)
 *
 * Each test verifies:
 *   - AddBlockDialog exposes the type
 *   - Picking it appends a block (tab shows up)
 *   - Key seed UI is present (option label / first slide caption / first page)
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

test.describe('Block types Wave 3.5 / 4 lite', () => {
  test.beforeEach(async ({ page }) => {
    await openEditor(page);
  });

  test('AddBlockDialog exposes Poll, Coverflow 3D, Flipbook', async ({
    page,
  }) => {
    await openAddBlockDialog(page);
    await expect(
      page.getByRole('button', { name: /^Poll/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Coverflow 3D/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^Flipbook/i }).first()
    ).toBeVisible();
  });

  test('Poll: tab appears + option visible + click reveals results', async ({
    page,
  }) => {
    await openAddBlockDialog(page);
    await pickType(page, /^Poll/i);
    await expect(page.getByTestId('block-tab-poll').first()).toBeVisible({
      timeout: 5_000,
    });
    const preview = page.getByTestId('active-block-preview');
    // Seed option "Hồ bơi vô cực"
    const opt = preview.getByRole('button', { name: /Hồ bơi vô cực/i }).first();
    await expect(opt).toBeVisible();
    await opt.click();
    // After voting, thank-you text appears
    await expect(preview.getByText(/Cảm ơn bạn/i)).toBeVisible({
      timeout: 3_000,
    });
  });

  test('Coverflow 3D: tab appears + slides container renders', async ({
    page,
  }) => {
    await openAddBlockDialog(page);
    await pickType(page, /Coverflow 3D/i);
    await expect(page.getByTestId('block-tab-carousel_3d').first()).toBeVisible(
      { timeout: 5_000 }
    );
    const preview = page.getByTestId('active-block-preview');
    // The 3d-coverflow renderer uses an <img> per slide; verify at least 1.
    await expect(preview.locator('img').first()).toBeVisible({
      timeout: 3_000,
    });
  });

  test('Flipbook: tab appears + page indicator visible', async ({ page }) => {
    await openAddBlockDialog(page);
    await pickType(page, /^Flipbook/i);
    await expect(page.getByTestId('block-tab-flipbook').first()).toBeVisible({
      timeout: 5_000,
    });
    const preview = page.getByTestId('active-block-preview');
    // Seed: 5 pages → indicator reads "1 / 5"
    await expect(preview.getByText(/^1\s*\/\s*5$/i).first()).toBeVisible({
      timeout: 3_000,
    });
  });
});
