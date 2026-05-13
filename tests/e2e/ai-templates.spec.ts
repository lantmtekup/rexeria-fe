import { expect, test } from 'playwright/test';

/**
 * E2E for the user-facing AI Templates flow.
 *
 * Runs against the mock fixture (NEXT_PUBLIC_AI_TEMPLATE_MOCK=1) so the
 * test is deterministic without requiring BE to seed an AI template. If
 * mock is off and BE has no templates seeded, the list assertion will
 * fail — that is the intended "BE not ready" signal.
 *
 * The mock template "Giới thiệu sản phẩm mới" (spec §7) has 5 required
 * fields and 5 optional ones with ai_can_infer=true.
 */
test.describe('AI Templates — user flow', () => {
  test('list → form → submit → review', async ({ page }) => {
    await page.goto('/ai-templates');
    await expect(
      page.getByRole('heading', { name: 'AI Templates' })
    ).toBeVisible();

    // Card click opens input form dialog.
    const card = page.locator('button', { hasText: 'Giới thiệu sản phẩm mới' });
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.click();

    // Dialog title (vi).
    await expect(
      page.getByRole('heading', { name: /Nhập thông tin/i })
    ).toBeVisible();

    // Field badges — required vs ai-infer.
    await expect(
      page.locator('span', { hasText: 'Bắt buộc' }).first()
    ).toBeVisible();
    await expect(
      page.locator('span', { hasText: 'AI có thể tự suy luận' }).first()
    ).toBeVisible();

    // Fill 5 required fields by label.
    await page.getByLabel('Tên sản phẩm').fill('GreenBoost');
    await page.getByLabel('Danh mục').fill('Đồ uống healthy');
    await page.getByLabel('Đối tượng mục tiêu').fill('Dân văn phòng');
    await page.getByLabel('Tính năng chính').fill('Tự nhiên 100%, ít calo');
    await page.getByLabel('Mức giá').fill('35.000 – 45.000 VND/chai');

    // Submit.
    await page.getByRole('button', { name: 'Tạo nội dung' }).click();

    // Land on review page; URL contains session_id query.
    await page.waitForURL(/\/ai-templates\/.+\/review\?session=/, {
      timeout: 20_000,
    });
    await expect(
      page.getByRole('heading', { name: 'Xem trước nội dung AI tạo' })
    ).toBeVisible();

    // 10 blocks rendered (one article per block).
    const blocks = page.locator('article');
    await expect(blocks).toHaveCount(10, { timeout: 10_000 });

    // Regenerate counter shows 0/10 used.
    await expect(page.locator('span', { hasText: /0\/10/ })).toBeVisible();

    await page.screenshot({
      path: 'test-results/ai-templates-review.png',
      fullPage: true,
    });
  });

  test('regenerate dialog opens for a block', async ({ page }) => {
    // Go straight through the form so we're on a review page with a session.
    await page.goto('/ai-templates');
    await page
      .locator('button', { hasText: 'Giới thiệu sản phẩm mới' })
      .click();
    await page.getByLabel('Tên sản phẩm').fill('GreenBoost');
    await page.getByLabel('Danh mục').fill('Đồ uống healthy');
    await page.getByLabel('Đối tượng mục tiêu').fill('Dân văn phòng');
    await page.getByLabel('Tính năng chính').fill('Tự nhiên 100%, ít calo');
    await page.getByLabel('Mức giá').fill('35.000 – 45.000 VND/chai');
    await page.getByRole('button', { name: 'Tạo nội dung' }).click();
    await page.waitForURL(/\/review\?session=/, { timeout: 20_000 });

    // Click the first Regenerate button on a block card.
    await page
      .locator('article')
      .first()
      .getByRole('button', { name: 'Tạo lại' })
      .click();

    // Dialog opens with hint textarea.
    await expect(page.getByLabel('Gợi ý cho AI (tuỳ chọn)')).toBeVisible();
  });

  test('version history drawer opens', async ({ page }) => {
    await page.goto('/ai-templates');
    await page
      .locator('button', { hasText: 'Giới thiệu sản phẩm mới' })
      .click();
    await page.getByLabel('Tên sản phẩm').fill('GreenBoost');
    await page.getByLabel('Danh mục').fill('Đồ uống healthy');
    await page.getByLabel('Đối tượng mục tiêu').fill('Dân văn phòng');
    await page.getByLabel('Tính năng chính').fill('Tự nhiên 100%, ít calo');
    await page.getByLabel('Mức giá').fill('35.000 – 45.000 VND/chai');
    await page.getByRole('button', { name: 'Tạo nội dung' }).click();
    await page.waitForURL(/\/review\?session=/, { timeout: 20_000 });

    await page.getByRole('button', { name: /Lịch sử phiên bản/i }).click();

    // Drawer header should appear.
    await expect(
      page.locator('aside h2', { hasText: /Lịch sử phiên bản/i })
    ).toBeVisible();
  });
});
