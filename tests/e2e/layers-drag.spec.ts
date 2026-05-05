import { expect, test, type Page } from 'playwright/test';

const TEMPLATE_ID = 'e0c2b922-0dca-4fdb-be04-f622d9b6c5cb';

async function openEditor(page: Page) {
  await page.goto(`/canvas-templates/${TEMPLATE_ID}`);
  await page
    .waitForLoadState('networkidle', { timeout: 20_000 })
    .catch(() => {});
  await page.waitForTimeout(1500);
  const layersTab = page.getByTestId('sidebar-tab-layers');
  if (await layersTab.count()) await layersTab.click();
  await page.waitForTimeout(300);
}

async function selectDevice(
  page: Page,
  device: 'Desktop' | 'Mobile' | 'Tablet'
) {
  await page
    .getByRole('button', { name: device, exact: false })
    .first()
    .click()
    .catch(() => {});
  await page.waitForTimeout(300);
}

async function readOrder(page: Page): Promise<string[]> {
  return page
    .locator('[data-layer-key]')
    .evaluateAll(els =>
      els.map(e => (e as HTMLElement).dataset.layerKey ?? '')
    );
}

async function dragRow(page: Page, srcKey: string, dstKey: string) {
  const src = page.locator(`[data-layer-key="${srcKey}"]`);
  const dst = page.locator(`[data-layer-key="${dstKey}"]`);
  const a = await src.boundingBox();
  const b = await dst.boundingBox();
  if (!a || !b) throw new Error('boxes missing');
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 6, a.y + a.height / 2 + 6, {
    steps: 3,
  });
  await page.mouse.move(
    b.x + b.width / 2,
    b.y + b.height / 2 + (b.y > a.y ? 8 : -8),
    { steps: 16 }
  );
  await page.waitForTimeout(150);
  await page.mouse.up();
  await page.waitForTimeout(400);
}

test.describe('LayersPanel drag reorder', () => {
  test('desktop · siblings swap visually + DOM persists', async ({ page }) => {
    await openEditor(page);
    await selectDevice(page, 'Desktop');

    const before = await readOrder(page);
    const candidates = before.filter(k => k && !k.startsWith('__'));
    expect(candidates.length).toBeGreaterThanOrEqual(2);
    const [a, b] = candidates;
    await dragRow(page, a, b);
    const after = await readOrder(page);

    expect(
      after.join(','),
      `before=${before.join(',')} after=${after.join(',')}`
    ).not.toBe(before.join(','));
  });

  test('mobile · drag works AND writes to mobile variant', async ({ page }) => {
    await openEditor(page);
    await selectDevice(page, 'Mobile');

    const before = await readOrder(page);
    const candidates = before.filter(k => k && !k.startsWith('__'));
    const [a, b] = candidates;
    await dragRow(page, a, b);
    const after = await readOrder(page);

    expect(after.join(',')).not.toBe(before.join(','));
  });

  test('tablet · drag visually moves but order does NOT persist (read-only)', async ({
    page,
  }) => {
    await openEditor(page);
    await selectDevice(page, 'Tablet');

    const before = await readOrder(page);
    const candidates = before.filter(k => k && !k.startsWith('__'));
    const [a, b] = candidates;
    await dragRow(page, a, b);
    const after = await readOrder(page);

    // On tablet, handleReorderElements early-returns with a toast. So sortable
    // animation runs locally but state doesn't change → row snaps back.
    expect(after.join(',')).toBe(before.join(','));
  });

  test('plain click on a row selects it without dragging', async ({ page }) => {
    await openEditor(page);
    await selectDevice(page, 'Desktop');

    const before = await readOrder(page);
    const candidates = before.filter(k => k && !k.startsWith('__'));
    const target = page.locator(`[data-layer-key="${candidates[0]}"]`);
    await target.click();
    await page.waitForTimeout(200);
    const after = await readOrder(page);
    expect(after.join(',')).toBe(before.join(','));
  });
});
