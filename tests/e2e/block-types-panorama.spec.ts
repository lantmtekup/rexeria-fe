import { expect, test, type Page } from 'playwright/test';

/**
 * Panorama BlockType — drag-to-rotate 360° viewer (Wave 4 lite — pure CSS,
 * no Three.js). Verify: picker exposes it, picking it spawns the block
 * with the seed image + hint badge, and the strip translates on drag.
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

async function addPanorama(page: Page) {
  await page
    .getByRole('button', { name: /Thêm block/i })
    .first()
    .click();
  await page.waitForTimeout(150);
  await page
    .getByRole('button', { name: /Panorama 360/i })
    .first()
    .click();
  await page.waitForTimeout(400);
}

test.describe('Panorama block type', () => {
  test.beforeEach(async ({ page }) => {
    await openEditor(page);
  });

  test('picker exposes Panorama 360°', async ({ page }) => {
    await page
      .getByRole('button', { name: /Thêm block/i })
      .first()
      .click();
    await page.waitForTimeout(150);
    await expect(
      page.getByRole('button', { name: /Panorama 360/i }).first()
    ).toBeVisible();
  });

  test('Panorama: tab appears + hint badge + 360° label visible', async ({
    page,
  }) => {
    await addPanorama(page);
    await expect(page.getByTestId('block-tab-panorama').first()).toBeVisible({
      timeout: 5_000,
    });
    const preview = page.getByTestId('active-block-preview');
    // Hint badge "Kéo để xoay"
    await expect(preview.getByText(/Kéo để xoay/i).first()).toBeVisible({
      timeout: 3_000,
    });
    // Compass label "360°"
    await expect(preview.getByText('360°').first()).toBeVisible();
  });

  test('Panorama: drag horizontally → image strip translates', async ({
    page,
  }) => {
    await addPanorama(page);
    const preview = page.getByTestId('active-block-preview');
    // The strip wrapper has translateX(0px) initially. After a drag it
    // becomes negative (we wrap into -stripWidth..0 range).
    const strip = preview.locator('div[style*="translateX"]').first();
    await expect(strip).toBeVisible();
    const initialTransform = await strip.evaluate(
      el => (el as HTMLElement).style.transform || ''
    );

    // Drag the pano horizontally.
    const box = await preview.boundingBox();
    if (!box) throw new Error('preview has no box');
    const sx = box.x + box.width / 2;
    const sy = box.y + box.height / 2;
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx - 120, sy, { steps: 10 });
    await page.waitForTimeout(80);
    await page.mouse.up();
    await page.waitForTimeout(150);

    const afterTransform = await strip.evaluate(
      el => (el as HTMLElement).style.transform || ''
    );
    expect(afterTransform).not.toBe(initialTransform);
    expect(afterTransform).toMatch(/translateX/);
  });
});
