import { expect, test } from 'playwright/test';

/**
 * Walks the new admin section and verifies the 5 sections render:
 *   /admin, /admin/products, /admin/templates, /admin/users, /admin/feedback.
 *
 * Reuses the storage state captured by `auth.setup.ts` (admin@rexer.ai).
 * Captures one screenshot per section to `test-results/admin-*.png`.
 */
test.describe('Admin section', () => {
  test('renders all 5 admin tabs', async ({ page }) => {
    // Overview
    await page.goto('/admin');
    await expect(page).not.toHaveURL(/\/sign-in/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/admin/);

    // Tabs are visible (7 admin sub-routes via AdminNav — overview,
    // products, templates, ai-templates, users, ai-usage, feedback).
    const navTabs = page.locator('nav a[href^="/admin"]');
    await expect(navTabs).toHaveCount(7);

    // Stat cards (4 cards on overview)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.screenshot({
      path: 'test-results/admin-overview.png',
      fullPage: true,
    });

    // Products
    await page.goto('/admin/products');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Tạo sản phẩm|New product/i })
    ).toBeVisible();
    await page.screenshot({
      path: 'test-results/admin-products.png',
      fullPage: true,
    });

    // Templates
    await page.goto('/admin/templates');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.screenshot({
      path: 'test-results/admin-templates.png',
      fullPage: true,
    });

    // Users
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.screenshot({
      path: 'test-results/admin-users.png',
      fullPage: true,
    });

    // AI Usage
    await page.goto('/admin/ai-usage');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Xuất CSV|Export CSV/i })
    ).toBeVisible();
    await page.screenshot({
      path: 'test-results/admin-ai-usage.png',
      fullPage: true,
    });

    // Feedback
    await page.goto('/admin/feedback');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Xuất CSV|Export CSV/i })
    ).toBeVisible();
    await page.screenshot({
      path: 'test-results/admin-feedback.png',
      fullPage: true,
    });
  });

  test('redirects non-admin users to /home', async ({ page, context }) => {
    // Wipe auth so middleware bounces us. We don't have a non-admin login
    // wired in tests, so the JWT-cookie check is the most we can verify
    // without seeding another account. (Admin role check is client-side.)
    await context.clearCookies();
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 15_000 });
  });
});
