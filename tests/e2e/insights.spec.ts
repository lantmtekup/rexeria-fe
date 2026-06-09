import { expect, test } from 'playwright/test';

/**
 * E2E happy path cho wizard AI-Insights: setup → generating → blueprint.
 *
 * Yêu cầu môi trường: dev server (:3000) + tunnel BE live (theo cấu hình E2E
 * của repo). Dùng lại phiên admin từ `auth.setup.ts` (admin@rexer.ai) qua
 * storageState của project chromium.
 *
 * Selector bám đúng markup thật của `SetupStep`:
 * - Workspace là <select> (label "Không gian làm việc"), KHÔNG phải text input
 *   → chọn bằng `selectOption`, không `fill`.
 * - Các field "còn thiếu" (gap) chỉ render khi BE prefill báo missing; mỗi field
 *   là <input> có label tiếng Việt từ namespace i18n `insights.fields.*`.
 *
 * Cần `E2E_WORKSPACE_ID` trỏ tới một workspace mà phiên admin truy cập được;
 * thiếu biến này thì skip để test không chạy sai trên markup <select>.
 */
test.describe('AI-Insights', () => {
  test('setup → generate → blueprint', async ({ page }) => {
    const workspaceId = process.env.E2E_WORKSPACE_ID;
    test.skip(
      !workspaceId,
      'Cần E2E_WORKSPACE_ID (workspace admin truy cập được) để chạy happy path'
    );

    await page.goto('/admin/insights');
    await expect(page).not.toHaveURL(/\/sign-in/);

    // Màn setup hiện ra với tiêu đề wizard.
    await expect(
      page.getByRole('heading', { name: 'AI-Insights' })
    ).toBeVisible();

    // Chọn workspace qua <select> (label "Không gian làm việc").
    await page
      .getByLabel('Không gian làm việc')
      .selectOption(workspaceId as string);

    // Bổ sung mọi gap field đang hiển thị (chỉ điền field nào BE báo thiếu).
    for (const label of [
      'Đối tượng mục tiêu',
      'Pain point',
      'Bối cảnh thị trường',
      'Mục tiêu chiến dịch',
    ]) {
      const field = page.getByLabel(label);
      if (await field.count()) await field.fill('test');
    }

    // Chạy phân tích — nút bật khi workspace đã chọn + gap field đã điền đủ.
    const runButton = page.getByRole('button', { name: /Chạy phân tích/ });
    await expect(runButton).toBeEnabled();
    await runButton.click();

    // Màn generating: loading state thật trong lúc engine chạy 5 bước.
    await expect(page.getByText(/AI đang phân tích/)).toBeVisible();

    // Màn blueprint (polling; chừa thời gian cho lượt chạy 5 bước).
    await expect(
      page.getByRole('heading', { name: 'Experience Goal' })
    ).toBeVisible({ timeout: 60_000 });
    await expect(
      page.getByRole('heading', { name: 'Templates đề xuất' })
    ).toBeVisible();
  });
});
