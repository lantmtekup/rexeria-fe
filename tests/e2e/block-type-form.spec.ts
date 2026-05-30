/**
 * E2E for the 2026-05-26 changes:
 *
 *  1. Block-type create form editor — replaces the toast stub at
 *     `AdminBlockTypesPage` header. Opens a dialog, creates a block via
 *     POST /v1/admin/block-types, and the new card appears in the grid.
 *
 *  2. Brand detail page — verifies `unwrapBrand` adapter tolerates the
 *     post-cutover BE response shape (raw `Brand` or `{brand: Brand}`).
 *     Page must render the brand header instead of the "Không load được
 *     khách hàng" fallback.
 */

import { expect, test } from 'playwright/test';

const BRAND_ID = '8dd7494e-f97a-4be9-9d74-7e8f68d1688e';

test.describe('block-types: create form', () => {
  test('dialog opens, submits, new card appears', async ({ page }) => {
    // Unique snake_case code so the test is idempotent across runs.
    const code = `e2e_blk_${Date.now().toString(36)}`;

    await page.goto('/admin/block-types');
    await expect(
      page.getByRole('heading', { name: /catalog blocks hệ thống/i })
    ).toBeVisible();

    await page.getByRole('button', { name: /tạo block type/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/tạo block type/i).first()).toBeVisible();

    await dialog.getByLabel(/type \(code\)/i).fill(code);
    await dialog.getByLabel(/label vi/i).fill('E2E test block');
    await dialog.getByLabel(/mô tả vi/i).fill('Created by Playwright');

    // The dialog footer button is the one with `Tạo block type` label INSIDE
    // the dialog (not the header trigger which is now hidden behind overlay).
    await dialog.getByRole('button', { name: /tạo block type/i }).click();

    // Success toast (sonner) then dialog closes.
    await expect(
      page.getByText(new RegExp(`đã tạo block type.*${code}`, 'i'))
    ).toBeVisible({ timeout: 10_000 });
    await expect(dialog).not.toBeVisible({ timeout: 5_000 });

    // New card surfaces in the grid (list reloaded after onSaved).
    await expect(page.getByText(code, { exact: true })).toBeVisible({
      timeout: 10_000,
    });

    // ── Cleanup: open the card, hit Xoá. confirm() must auto-accept. ──
    page.once('dialog', d => d.accept());
    await page.getByText(code, { exact: true }).first().click();
    const drawer = page.locator('aside').filter({ hasText: code });
    await expect(drawer).toBeVisible();
    await drawer.getByRole('button', { name: /xoá/i }).click();
    await expect(page.getByText(new RegExp(`đã xoá ${code}`, 'i'))).toBeVisible(
      { timeout: 10_000 }
    );
  });
});

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
