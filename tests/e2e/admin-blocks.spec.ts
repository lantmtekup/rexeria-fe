import { expect, test } from 'playwright/test';

/**
 * Smoke test cho /admin/blocks page mới. Saved blocks là localStorage-based
 * (Phase 1), nên test seed dữ liệu trực tiếp vào `window.localStorage` rồi
 * reload — tránh phụ thuộc vào BE state hay flow editor.
 */

const STORAGE_KEY = 'rexer:saved-blocks';

/**
 * Minimal-but-valid HeroSplit content. The canvas editor's RenderBlock
 * reads `stats.length`, `imageUrl`, etc. — passing `{}` crashes on first
 * render. Anything that satisfies HeroSplitContent (`types.ts:82`) is fine.
 */
const MINIMAL_HERO_SPLIT_CONTENT = {
  eyebrow: 'Test',
  title: 'Test title',
  description: 'Test description',
  imageUrl: '',
  stats: [] as Array<{ value: string; label: string }>,
  ctaText: 'Click',
  ctaLink: '#',
};

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
      contentVi: { desktop: MINIMAL_HERO_SPLIT_CONTENT },
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

  test('duplicate clones the saved block with (copy) suffix', async ({
    page,
  }) => {
    await page.goto('/admin/blocks');
    await page.evaluate(
      ({ key, items }) =>
        window.localStorage.setItem(key, JSON.stringify(items)),
      {
        key: STORAGE_KEY,
        items: [makeSavedBlock('Hero Tết 2026', 'hero_split')],
      }
    );
    await page.reload();
    // Open drawer
    await page.locator('button:has-text("Hero Tết 2026")').first().click();
    // Click Duplicate inside drawer
    await page.getByRole('button', { name: 'Duplicate', exact: true }).click();
    // Header count goes 1 → 2
    await expect(page.getByText('2 blocks')).toBeVisible();
    // Source of truth = localStorage. Avoids strict-mode collisions with
    // the same text appearing in card + drawer + toast.
    const items = await page.evaluate(
      key => JSON.parse(window.localStorage.getItem(key) ?? '[]'),
      STORAGE_KEY
    );
    expect(items.length).toBe(2);
    expect(
      items.some((i: { name: string }) => i.name === 'Hero Tết 2026 (copy)')
    ).toBe(true);
  });

  test('delete removes block + clears drawer', async ({ page }) => {
    await page.goto('/admin/blocks');
    await page.evaluate(
      ({ key, items }) =>
        window.localStorage.setItem(key, JSON.stringify(items)),
      {
        key: STORAGE_KEY,
        items: [
          makeSavedBlock('Will be deleted', 'hero_split'),
          makeSavedBlock('Will stay', 'cta_section'),
        ],
      }
    );
    await page.reload();
    // Auto-accept the confirm() dialog the delete handler pops
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("Will be deleted")').first().click();
    await page.getByRole('button', { name: 'Xoá', exact: true }).click();
    await expect(page.getByText('1 blocks')).toBeVisible();
    await expect(page.locator('text=Will be deleted')).toHaveCount(0);
    // Drawer should auto-close
    await expect(page.getByText('Sửa trong canvas')).toHaveCount(0);
  });

  test('Edit flow opens canvas editor with ?saved_block_id query', async ({
    page,
    baseURL,
  }) => {
    const base = baseURL ?? 'http://localhost:3000';
    await page.goto('/admin/blocks');

    // Capture the canvas-templates POST so we know what scratch id the BE
    // hands back, then verify the FE redirects to it with the query param.
    const createPromise = page.waitForResponse(
      r =>
        r.url().includes('/api/rexer/canvas-templates') &&
        r.request().method() === 'POST',
      { timeout: 15_000 }
    );

    const savedId = `sb_test_${Date.now().toString(36)}`;
    await page.evaluate(
      ({ key, items }) =>
        window.localStorage.setItem(key, JSON.stringify(items)),
      {
        key: STORAGE_KEY,
        items: [
          {
            id: savedId,
            name: 'Edit Flow Test',
            createdAt: new Date().toISOString(),
            block: {
              id: 'b_test',
              blockType: 'hero_split',
              name: 'Edit Flow Test',
              isVisible: true,
              contentVi: { desktop: MINIMAL_HERO_SPLIT_CONTENT },
              extraElements: [],
            },
          },
        ],
      }
    );
    await page.reload();

    let scratchId: string | undefined;
    try {
      await page.locator('button:has-text("Edit Flow Test")').first().click();
      await page
        .getByRole('button', { name: 'Sửa trong canvas', exact: true })
        .click();

      const resp = await createPromise;
      expect(resp.status()).toBeLessThan(400);
      const body = await resp.json();
      scratchId =
        body?.canvas_template?.id ?? body?.id ?? body?.canvasTemplate?.id;
      expect(scratchId, 'BE should return a canvas template id').toBeTruthy();
      // Wait for navigation to the new canvas editor with our query param.
      await page.waitForURL(
        new RegExp(
          `/canvas-templates/${scratchId}\\?saved_block_id=${savedId}`
        ),
        { timeout: 15_000 }
      );
    } finally {
      // Always purge the scratch canvas — leaving it pollutes the
      // canvas-templates list and breaks the stats-overlay tests that pick
      // the first template with blocks. Best-effort: ignore errors.
      if (scratchId) {
        await page.request
          .delete(`${base}/api/rexer/canvas-templates/${scratchId}`)
          .catch(() => undefined);
      }
    }
  });

  test('Cập nhật bản gốc end-to-end: dialog overwrite + scratch cleanup', async ({
    page,
    baseURL,
  }) => {
    test.setTimeout(60_000); // canvas editor load + autosave can be slow
    const base = baseURL ?? 'http://localhost:3000';
    await page.goto('/admin/blocks');

    // Seed a saved block with a recognisable name so we can later confirm
    // overwrite preserved the ID.
    const savedId = `sb_overwrite_${Date.now().toString(36)}`;
    const originalCreatedAt = '2026-01-01T00:00:00.000Z';
    await page.evaluate(
      ({ key, items }) =>
        window.localStorage.setItem(key, JSON.stringify(items)),
      {
        key: STORAGE_KEY,
        items: [
          {
            id: savedId,
            name: 'Overwrite Test Block',
            createdAt: originalCreatedAt,
            block: {
              id: 'b_overwrite',
              blockType: 'hero_split',
              name: 'Overwrite Test Block',
              isVisible: true,
              contentVi: { desktop: MINIMAL_HERO_SPLIT_CONTENT },
              extraElements: [],
            },
          },
        ],
      }
    );
    await page.reload();

    // Capture the scratch canvas POST so we can later assert it gets deleted.
    const createPromise = page.waitForResponse(
      r =>
        r.url().includes('/api/rexer/canvas-templates') &&
        r.request().method() === 'POST',
      { timeout: 15_000 }
    );

    await page
      .locator('button:has-text("Overwrite Test Block")')
      .first()
      .click();
    await page
      .getByRole('button', { name: 'Sửa trong canvas', exact: true })
      .click();

    const createResp = await createPromise;
    const createBody = await createResp.json();
    const scratchId: string = createBody?.canvas_template?.id ?? createBody?.id;
    expect(scratchId, 'scratch canvas id should be returned').toBeTruthy();

    // Wait for canvas editor to fully mount — bookmark button only appears
    // after activeBlock is hydrated from the canvas API.
    const bookmarkBtn = page.getByRole('button', {
      name: 'Lưu block vào thư viện',
    });
    await expect(bookmarkBtn).toBeVisible({ timeout: 20_000 });
    await bookmarkBtn.click();

    // Save-block dialog should open in OVERWRITE mode because the URL has
    // ?saved_block_id=<id>. Verify the title + the description showing the ID.
    await expect(
      page.getByRole('heading', { name: 'Cập nhật block trong thư viện' })
    ).toBeVisible();
    await expect(page.locator(`code:has-text("${savedId}")`)).toBeVisible();
    // Both CTAs should be present.
    await expect(
      page.getByRole('button', { name: 'Cập nhật bản gốc', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Lưu bản mới', exact: true })
    ).toBeVisible();

    // Click "Cập nhật bản gốc" → overwrite + cleanup + redirect.
    await page
      .getByRole('button', { name: 'Cập nhật bản gốc', exact: true })
      .click();

    // FE redirects to /admin/blocks after success.
    await page.waitForURL('**/admin/blocks', { timeout: 15_000 });

    // localStorage: original ID + createdAt preserved, updatedAt bumped.
    const items = await page.evaluate(
      key => JSON.parse(window.localStorage.getItem(key) ?? '[]'),
      STORAGE_KEY
    );
    expect(items.length, 'should still have exactly 1 saved block').toBe(1);
    const updated = items[0];
    expect(updated.id, 'ID preserved').toBe(savedId);
    expect(updated.createdAt, 'createdAt preserved').toBe(originalCreatedAt);
    expect(
      updated.updatedAt,
      'updatedAt is bumped to a recent ISO'
    ).toBeTruthy();
    expect(
      new Date(updated.updatedAt).getTime(),
      'updatedAt > createdAt'
    ).toBeGreaterThan(new Date(originalCreatedAt).getTime());

    // Scratch canvas should be archived by the FE post-save hook. Manually
    // probe — soft-delete may return 200 on subsequent DELETE (idempotent)
    // or 404 if BE archives + hides. Either is acceptable; we just want to
    // confirm the canvas no longer appears in the active list.
    const listRes = await page.request.get(
      `${base}/api/rexer/canvas-templates?is_active=true&limit=50`
    );
    expect(listRes.ok()).toBeTruthy();
    const listBody = (await listRes.json()) as {
      items: Array<{ id: string }>;
    };
    const stillThere = listBody.items.some(it => it.id === scratchId);
    expect(stillThere, 'scratch canvas should not be in active list').toBe(
      false
    );
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
