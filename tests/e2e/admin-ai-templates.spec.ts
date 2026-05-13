import { expect, test } from 'playwright/test';

/**
 * E2E for the admin AI Template builder. Validates that the list page
 * renders, navigation to /new works, and the 3 sections (Basic / Input
 * Schema / Blocks) are present with their core controls.
 *
 * Uses the storage state from `auth.setup.ts` (admin@rexer.ai).
 */
test.describe('Admin — AI Templates', () => {
  test('list renders + nav links to new', async ({ page }) => {
    await page.goto('/admin/ai-templates');
    await expect(page).not.toHaveURL(/\/sign-in/);

    await expect(
      page.getByRole('heading', { name: 'AI Templates' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /Tạo mới/i })).toBeVisible();

    // Filter chips.
    await expect(page.getByRole('button', { name: /Tất cả/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Đang bật/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Đã tắt/i })).toBeVisible();

    await page.screenshot({
      path: 'test-results/admin-ai-templates-list.png',
      fullPage: true,
    });
  });

  test('builder shows 3 sections + 10 block skeleton', async ({ page }) => {
    await page.goto('/admin/ai-templates/new');
    await expect(page).not.toHaveURL(/\/sign-in/);

    await expect(
      page.getByRole('heading', { name: 'Tạo AI Template' })
    ).toBeVisible();

    // Basic section.
    await expect(
      page.locator('h2', { hasText: 'Thông tin cơ bản' })
    ).toBeVisible();
    // Labels aren't htmlFor-wired, so anchor on a unique placeholder.
    await expect(
      page.getByPlaceholder('Giới thiệu sản phẩm mới')
    ).toBeVisible();

    // Schema section.
    await expect(page.locator('h2', { hasText: 'Input Schema' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Thêm field/i })
    ).toBeVisible();

    // Blocks section — 10 fixed roles seeded.
    await expect(
      page.locator('h2', { hasText: 'Blocks & AI Prompt Context' })
    ).toBeVisible();
    const blockRows = page.locator('details');
    await expect(blockRows).toHaveCount(10);

    await page.screenshot({
      path: 'test-results/admin-ai-templates-new.png',
      fullPage: true,
    });
  });

  test('add field row works', async ({ page }) => {
    await page.goto('/admin/ai-templates/new');
    await page.getByRole('button', { name: /Thêm field/i }).click();

    // After clicking, a field row appears with the field_key input.
    // Strict mode: there are textareas with placeholders that include the
    // string "product_name" (block prompt examples), so use exact match.
    await expect(
      page.getByPlaceholder('product_name', { exact: true })
    ).toBeVisible();
  });
});
