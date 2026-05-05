import { expect, test, type Page } from 'playwright/test';

const TEMPLATE_ID = 'e0c2b922-0dca-4fdb-be04-f622d9b6c5cb';

async function openEditor(page: Page) {
  await page.goto(`/canvas-templates/${TEMPLATE_ID}`);
  await page
    .waitForLoadState('networkidle', { timeout: 20_000 })
    .catch(() => {});
  await page.waitForTimeout(1500);
}

async function selectDevice(
  page: Page,
  device: 'Desktop' | 'Mobile' | 'Tablet'
) {
  await page
    .getByRole('button', { name: device, exact: false })
    .first()
    .click();
  await page.waitForTimeout(400);
}

/**
 * Scope queries to the MAIN @container (BlockPreview frame), not the
 * thumbnail mini-previews inside BlockTabBar.
 */
const MAIN_FRAME = '.\\@container';

async function frameInfo(page: Page) {
  return page.evaluate(sel => {
    const el = document.querySelector(sel) as HTMLElement | null;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      styleWidth: parseFloat(el.style.width) || 0,
      visualWidth: rect.width,
      visualHeight: rect.height,
    };
  }, MAIN_FRAME);
}

async function elementMetricsInFrame(
  page: Page,
  key: string
): Promise<{
  found: boolean;
  fontSize: number;
  baseFontSize: number;
  width: number;
  height: number;
  minHeight: number;
}> {
  return page.evaluate(
    args => {
      const root = document.querySelector(args.frame) as HTMLElement | null;
      if (!root)
        return {
          found: false,
          fontSize: 0,
          baseFontSize: 0,
          width: 0,
          height: 0,
          minHeight: 0,
        };
      const el = root.querySelector(
        `[data-element-key="${args.key}"]`
      ) as HTMLElement | null;
      if (!el)
        return {
          found: false,
          fontSize: 0,
          baseFontSize: 0,
          width: 0,
          height: 0,
          minHeight: 0,
        };
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();

      // Compute the BASE font-size (what Tailwind classes alone would set,
      // ignoring any inline `style.fontSize` override). We do this by
      // probing a sibling clone with the inline style stripped.
      const clone = el.cloneNode(false) as HTMLElement;
      clone.removeAttribute('style');
      // Strip data-element-key to avoid duplicate query-side effects.
      clone.removeAttribute('data-element-key');
      // Mount ephemerally next to the source so it inherits same context.
      el.parentElement?.appendChild(clone);
      const baseFs = parseFloat(getComputedStyle(clone).fontSize);
      clone.remove();

      return {
        found: true,
        fontSize: parseFloat(cs.fontSize),
        baseFontSize: baseFs,
        width: rect.width,
        height: rect.height,
        minHeight: parseFloat(cs.minHeight) || 0,
      };
    },
    { frame: MAIN_FRAME, key }
  );
}

test.describe('Block responsive output (per device frame)', () => {
  test('mobile frame · width 390 + base styles use mobile-first text scale', async ({
    page,
  }) => {
    await openEditor(page);
    await selectDevice(page, 'Mobile');

    const info = await frameInfo(page);
    expect(info?.styleWidth).toBe(390);

    const title = await elementMetricsInFrame(page, 'title');
    if (!title.found) test.skip(true, 'no title element');
    // Mobile baseline: text-2xl ≈ 24px (allow up to 30 in case of small variant overrides).
    expect(
      title.baseFontSize,
      `mobile baseline title font ≤ 30 (got ${title.baseFontSize})`
    ).toBeLessThanOrEqual(30);
  });

  test('tablet frame · width 834 + tablet text scale (text-4xl class fires)', async ({
    page,
  }) => {
    await openEditor(page);
    await selectDevice(page, 'Tablet');

    const info = await frameInfo(page);
    expect(info?.styleWidth).toBe(834);

    const title = await elementMetricsInFrame(page, 'title');
    if (!title.found) test.skip(true, 'no title element');
    // Tablet container ≥ 672px → @2xl:text-4xl (36px) should fire.
    expect(
      title.baseFontSize,
      `tablet baseline title font ≥ 30 (got ${title.baseFontSize})`
    ).toBeGreaterThanOrEqual(30);
  });

  test('desktop frame · width 1280 + desktop text scale (text-5xl/6xl fires)', async ({
    page,
  }) => {
    await openEditor(page);
    await selectDevice(page, 'Desktop');

    const info = await frameInfo(page);
    expect(info?.styleWidth).toBe(1280);

    const title = await elementMetricsInFrame(page, 'title');
    if (!title.found) test.skip(true, 'no title element');
    // Desktop container ≥ 896px → @4xl:text-5xl/6xl (≥ 48px) should fire.
    expect(
      title.baseFontSize,
      `desktop baseline title font ≥ 44 (got ${title.baseFontSize})`
    ).toBeGreaterThanOrEqual(44);
  });

  test('mobile frame · CTA touch target ≥ 44px', async ({ page }) => {
    await openEditor(page);
    await selectDevice(page, 'Mobile');

    let foundAny = false;
    for (const key of ['ctaText', 'primaryText', 'submitText'] as const) {
      const m = await elementMetricsInFrame(page, key);
      if (!m.found) continue;
      foundAny = true;
      const reach = Math.max(m.height, m.minHeight);
      expect(
        reach,
        `CTA "${key}" must reach ≥ 44px on mobile (got h=${m.height} minH=${m.minHeight})`
      ).toBeGreaterThanOrEqual(44);
    }
    expect(foundAny, 'should find at least one CTA').toBe(true);
  });

  test('mobile frame · no horizontal overflow inside frame', async ({
    page,
  }) => {
    await openEditor(page);
    await selectDevice(page, 'Mobile');
    const ok = await page.evaluate(() => {
      const el = document.querySelector('.\\@container') as HTMLElement | null;
      if (!el) return true;
      return el.scrollWidth <= el.clientWidth + 1;
    });
    expect(ok).toBe(true);
  });

  test('container queries fire — text-2xl mobile vs text-4xl+ tablet+', async ({
    page,
  }) => {
    await openEditor(page);

    await selectDevice(page, 'Mobile');
    const mTitle = await elementMetricsInFrame(page, 'title');
    if (!mTitle.found) test.skip(true, 'no title');

    await selectDevice(page, 'Desktop');
    const dTitle = await elementMetricsInFrame(page, 'title');

    // Same DOM element across device toggles (BlockPreview re-renders with
    // device prop, but className tokens stay the same — only the @container
    // width changes which gates @2xl/@4xl variants).
    expect(
      dTitle.baseFontSize,
      `desktop base font (${dTitle.baseFontSize}) should exceed mobile (${mTitle.baseFontSize})`
    ).toBeGreaterThan(mTitle.baseFontSize);
  });
});
