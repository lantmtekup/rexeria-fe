/**
 * E2E: Brand detail page — verifies `unwrapBrand` adapter tolerates the
 * post-cutover BE response shape (raw `Brand` or `{brand: Brand}`). Page must
 * render the brand header instead of the "Không load được khách hàng" fallback.
 *
 * (Block-type admin feature removed 2026-06-19 — types now live in the FE
 * registry BLOCK_TYPE_META, no admin CRUD UI. Test dropped with it.)
 */

import { expect, test } from 'playwright/test';

const BRAND_ID = '8dd7494e-f97a-4be9-9d74-7e8f68d1688e';

test.describe('admin brand detail (post-canonical-cutover)', () => {
  test('page renders brand info, no load-failed banner', async ({ page }) => {
    const apiErrors: string[] = [];
    page.on('response', resp => {
      const url = resp.url();
      if (url.includes('/api/rexer/brands/') && !resp.ok()) {
        apiErrors.push(`${resp.status()} ${url}`);
      }
    });

    await page.goto(`/admin/users/${BRAND_ID}`);

    // The "load failed" banner is the only thing we explicitly want to NOT see.
    await expect(page.getByText(/không load được khách hàng/i)).not.toBeVisible(
      { timeout: 8_000 }
    );

    // Tabs strip is the canonical brand-detail signature — workspaces tab is
    // always there regardless of brand content.
    await expect(page.getByRole('button', { name: /workspaces/i })).toBeVisible(
      { timeout: 10_000 }
    );

    // Header h1 with a non-empty brand name.
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const name = (await h1.textContent())?.trim() ?? '';
    expect(name.length, `brand name h1 should not be empty`).toBeGreaterThan(0);

    // BE call itself should have succeeded (not 4xx/5xx).
    expect(apiErrors, `unexpected non-2xx /api/rexer/brands/* calls`).toEqual(
      []
    );
  });
});
