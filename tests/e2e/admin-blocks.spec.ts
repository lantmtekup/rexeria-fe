import { expect, test } from 'playwright/test';

/**
 * Smoke test cho /admin/blocks page mới. Saved blocks là localStorage-based
 * (Phase 1), nên test seed dữ liệu trực tiếp vào `window.localStorage` rồi
 * reload — tránh phụ thuộc vào BE state hay flow editor.
 */

const STORAGE_KEY = 'rexer:saved-blocks';

function makeSavedBlock(name: string, blockType = 'hero_split') {
  const now = new Date().toISOString();
  return {
    id: `sb_${Math.random().toString(36).slice(2, 12)}`,
    name,
    createdAt: now,
    updatedAt: now,
    block: {
      id: `b_${Math.random().toString(36).slice(2, 10)}`,
      blockType,
      name,
      isVisible: true,
      contentVi: { desktop: {} },
      extraElements: [],
    },
  };
}

test.describe('Admin Blocks page', () => {
  test('redirect /admin/saved-blocks → /admin/blocks', async ({ page }) => {
    await page.goto('/admin/saved-blocks');
    await page.waitForURL('**/admin/blocks', { timeout: 10_000 });
    await expect(page).toHaveURL(/\/admin\/blocks$/);
  });

  test('empty state khi chưa có saved block', async ({ page }) => {
    await page.goto('/admin/blocks');
    await page.evaluate(
      key => window.localStorage.removeItem(key),
      STORAGE_KEY
    );
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Chưa có saved block' })
    ).toBeVisible();
  });

  test('list, search, filter, drawer flows', async ({ page }) => {
    await page.goto('/admin/blocks');
    // Seed 3 saved blocks vào localStorage
    await page.evaluate(
      ({ key, items }) =>
        window.localStorage.setItem(key, JSON.stringify(items)),
      {
        key: STORAGE_KEY,
        items: [
          makeSavedBlock('Hero Tết 2026', 'hero_split'),
          makeSavedBlock('Promo CTA', 'cta_section'),
          makeSavedBlock('Carousel campaign', 'image_carousel'),
        ],
      }
    );
    await page.reload();

    // Header count
    await expect(page.getByText('3 blocks')).toBeVisible();

    // Grid view default → 3 cards visible
    const cards = page.locator('button:has-text("Hero Tết 2026")');
    await expect(cards.first()).toBeVisible();

    // Search filter
    const searchBox = page.getByPlaceholder('Tìm theo tên / block type / tag…');
    await searchBox.fill('Carousel');
    await expect(page.locator('text=Carousel campaign')).toBeVisible();
    await expect(page.locator('text=Hero Tết 2026')).toHaveCount(0);
    await searchBox.fill('');

    // Click 1 card → drawer xuất hiện với tên block đó
    await cards.first().click();
    await expect(page.getByText('Sửa trong canvas')).toBeVisible();
    // Sửa tag
    const tagInput = page.getByPlaceholder('Thêm tag (Enter)…');
    await tagInput.fill('campaign');
    // Use exact match — the inner BlockMiniPreview can contain buttons whose
    // accessible name happens to include "Thêm" (eg. ImageCarousel placeholder).
    await page.getByRole('button', { name: 'Thêm', exact: true }).click();
    // Drawer chip có title 'Click để xoá tag' — unique selector cho chip tag
    await expect(page.getByTitle('Click để xoá tag')).toContainText('campaign');
  });

  test('cards render BlockMiniPreview (data-block-id-like content)', async ({
    page,
  }) => {
    await page.goto('/admin/blocks');
    await page.evaluate(
      ({ key, items }) =>
        window.localStorage.setItem(key, JSON.stringify(items)),
      {
        key: STORAGE_KEY,
        items: [makeSavedBlock('Hero Preview Test', 'hero_split')],
      }
    );
    await page.reload();
    // BlockMiniPreview applies `transform: scale(...)` on its inner wrapper.
    // We just need any element with a scale transform to confirm the preview
    // mounted (vs the old gradient placeholder which had none).
    const card = page.locator('button:has-text("Hero Preview Test")').first();
    await expect(card).toBeVisible();
    const hasScaled = await card.evaluate(node => {
      return Array.from(node.querySelectorAll<HTMLElement>('*')).some(el => {
        const t = el.style.transform;
        return t.includes('scale(');
      });
    });
    expect(hasScaled).toBe(true);
  });
});
