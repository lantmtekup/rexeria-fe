import { expect, test, type Locator, type Page } from 'playwright/test';

/**
 * MotionLayersPanel — the new "simple mode" sidebar panel that replaces the
 * old Motion tab CTA. Rows are collapsed by default and expand on click; the
 * preset dropdown / delay / duration controls only render inside an expanded
 * row. These tests exercise:
 *   - panel renders block-level controls + collapsed element rows
 *   - clicking a row chevron expands it; clicking again collapses it
 *   - "Mở rộng tất cả" / "Thu gọn tất cả" toggle works
 *   - picking a preset persists, survives tab switching, round-trips to
 *     the advanced timeline as a real track
 *   - the collapsed-summary chip reflects the current preset state
 *
 * Reuses the same admin-templates fixture as motion.spec.ts.
 */
const TEMPLATE_ID = 'e0c2b922-0dca-4fdb-be04-f622d9b6c5cb';
const EDITOR_URL = `/canvas-templates/${TEMPLATE_ID}`;

async function openEditor(page: Page) {
  await page.goto(EDITOR_URL);
  await expect(page.getByTestId('header-motion-editor')).toBeVisible({
    timeout: 20_000,
  });
}

async function firstRowKey(page: Page): Promise<string> {
  const handle = await page
    .locator('[data-testid^="motion-row-"]')
    .first()
    .getAttribute('data-testid');
  expect(handle, 'expected at least one motion row').not.toBeNull();
  return handle!.replace('motion-row-', '');
}

function row(page: Page, key: string): Locator {
  return page.getByTestId(`motion-row-${key}`);
}

async function expandRow(page: Page, key: string) {
  const r = row(page, key);
  if ((await r.getAttribute('data-expanded')) !== 'true') {
    await page.getByTestId(`motion-toggle-row-${key}`).click();
  }
  await expect(r).toHaveAttribute('data-expanded', 'true');
}

async function clearMotion(page: Page) {
  await page.getByTestId('header-motion-editor').click();
  await expect(page.getByTestId('motion-modal')).toBeVisible();
  for (let i = 0; i < 20; i++) {
    const remaining = await page.getByLabel('Xóa track').count();
    if (remaining === 0) break;
    await page.getByLabel('Xóa track').first().click();
  }
  await page.getByTestId('motion-modal-close').click();
  await expect(page.getByTestId('motion-modal')).toBeHidden();
}

test.describe('Motion presets panel (simple mode)', () => {
  test.beforeEach(async ({ page }) => {
    await openEditor(page);
    await clearMotion(page);
    await page.getByTestId('sidebar-tab-motion').click();
  });

  test('Motion tab renders new layers panel (no modal)', async ({ page }) => {
    await expect(page.getByText('Bật animation cho block')).toBeVisible();
    await expect(
      page.locator('[data-testid^="motion-row-"]').first()
    ).toBeVisible();
    await expect(page.getByTestId('motion-modal')).toBeHidden();
  });

  test('rows start collapsed; chevron toggles a single row', async ({
    page,
  }) => {
    const key = await firstRowKey(page);
    const r = row(page, key);
    await expect(r).toHaveAttribute('data-expanded', 'false');
    // Dropdown is not rendered when collapsed.
    await expect(page.getByTestId(`motion-preset-${key}`)).toHaveCount(0);

    // Expand
    await page.getByTestId(`motion-toggle-row-${key}`).click();
    await expect(r).toHaveAttribute('data-expanded', 'true');
    await expect(page.getByTestId(`motion-preset-${key}`)).toBeVisible();

    // Collapse again
    await page.getByTestId(`motion-toggle-row-${key}`).click();
    await expect(r).toHaveAttribute('data-expanded', 'false');
    await expect(page.getByTestId(`motion-preset-${key}`)).toHaveCount(0);
  });

  test('group toggle expands and collapses every row', async ({ page }) => {
    const rows = await page.locator('[data-testid^="motion-row-"]').all();
    expect(rows.length).toBeGreaterThan(1);

    await page.getByTestId('motion-toggle-all').click();
    for (const r of rows) {
      await expect(r).toHaveAttribute('data-expanded', 'true');
    }

    await page.getByTestId('motion-toggle-all').click();
    for (const r of rows) {
      await expect(r).toHaveAttribute('data-expanded', 'false');
    }
  });

  test('preset dropdown lists all 9 options', async ({ page }) => {
    const key = await firstRowKey(page);
    await expandRow(page, key);
    const select = page.getByTestId(`motion-preset-${key}`);
    await expect(select.locator('option')).toHaveCount(9);
    await expect(
      select.locator('option', { hasText: 'Fade Up' })
    ).toBeAttached();
  });

  test('picking Fade Up persists, creates a track, and updates the summary', async ({
    page,
  }) => {
    const key = await firstRowKey(page);
    await expandRow(page, key);
    const select = page.getByTestId(`motion-preset-${key}`);
    await select.selectOption('fade-up');
    await expect(select).toHaveValue('fade-up');

    // Collapse the row and verify the summary chip reflects the preset.
    await page.getByTestId(`motion-toggle-row-${key}`).click();
    await expect(row(page, key)).toContainText('Fade Up');

    // Round-trip into advanced timeline.
    await page.getByTestId('header-motion-editor').click();
    await expect(page.getByTestId('motion-modal')).toBeVisible();
    await expect(page.getByTestId(`motion-track-${key}`)).toBeVisible();
    await expect(page.getByTestId(`motion-kf-${key}-0`)).toBeVisible();
    await expect(page.getByTestId(`motion-kf-${key}-1`)).toBeVisible();
  });

  test('selecting "Không animate" removes the track', async ({ page }) => {
    const key = await firstRowKey(page);
    await expandRow(page, key);
    const select = page.getByTestId(`motion-preset-${key}`);

    await select.selectOption('fade-up');
    await expect(select).toHaveValue('fade-up');
    await select.selectOption('none');
    await expect(select).toHaveValue('none');

    await page.getByTestId('header-motion-editor').click();
    await expect(page.getByTestId('motion-modal')).toBeVisible();
    await expect(page.getByTestId(`motion-track-${key}`)).toHaveCount(0);
  });

  test('preset survives switching to Layers tab and back', async ({ page }) => {
    const key = await firstRowKey(page);
    await expandRow(page, key);
    await page.getByTestId(`motion-preset-${key}`).selectOption('scale-in');

    await page.getByTestId('sidebar-tab-layers').click();
    await page.getByTestId('sidebar-tab-motion').click();

    // Tab switch resets the expanded state — verify via the collapsed summary
    // (the preset itself is persisted in BlockMotion, not in local UI state).
    await expect(row(page, key)).toContainText('Scale In');

    // Expanding again reveals the dropdown with the same value.
    await expandRow(page, key);
    await expect(page.getByTestId(`motion-preset-${key}`)).toHaveValue(
      'scale-in'
    );
  });

  test('clicking sidebar Play applies GSAP inline styles to target element', async ({
    page,
  }) => {
    const key = await firstRowKey(page);
    await expandRow(page, key);
    // Bump duration so the animation lingers long enough to inspect.
    await page.getByTestId(`motion-preset-${key}`).selectOption('fade-up');
    // Animation start state for fade-up is opacity:0, y:24 → GSAP writes
    // these as inline style on the target. We need only that the runtime
    // touched the element; values don't have to match exactly.
    const target = page
      .getByTestId('active-block-preview')
      .locator(`[data-element-key="${key}"]`)
      .first();
    const playBtn = page.getByTestId('sidebar-play-motion-preview');

    await playBtn.click();

    // Button reflects previewing state.
    await expect(playBtn).toContainText('Đang phát');

    // GSAP applies a non-empty `transform` to the element while the
    // timeline is running. Poll briefly so we don't race the first RAF tick.
    await expect
      .poll(
        async () =>
          target.evaluate(el => (el as HTMLElement).style.transform || ''),
        { timeout: 2_000 }
      )
      .not.toBe('');
  });

  test('clicking Play twice re-applies start-state styles (nonce replay)', async ({
    page,
  }) => {
    const key = await firstRowKey(page);
    await expandRow(page, key);
    await page.getByTestId(`motion-preset-${key}`).selectOption('fade-up');

    const target = page
      .getByTestId('active-block-preview')
      .locator(`[data-element-key="${key}"]`)
      .first();
    const playBtn = page.getByTestId('sidebar-play-motion-preview');

    // First play — wait for the timeline to LEAVE the start state (i.e.
    // animation actually progressed). For a 600ms fade-up the y-translate
    // shrinks from 24px → 0px; once `translate` is gone or near-zero the
    // run is essentially done.
    await playBtn.click();
    await expect
      .poll(
        async () =>
          target.evaluate(el => (el as HTMLElement).style.transform || ''),
        { timeout: 2_000 }
      )
      .not.toBe('');

    // Let the first run mostly complete so the element is at the rest
    // state — opacity:1, no translate. A second Play click should restart
    // from t=0, re-applying opacity:0 + translate(y).
    await page.waitForTimeout(900);

    // Capture pre-replay opacity (expect ~1 after first run).
    const pre = await target.evaluate(
      el => (el as HTMLElement).style.opacity || ''
    );

    await playBtn.click();

    // After replay, the runtime re-seeds the start state. Opacity should
    // briefly drop to 0 (the from-value). Poll because we may race the
    // RAF tick that applies it.
    await expect
      .poll(
        async () =>
          Number(
            await target.evaluate(
              el => (el as HTMLElement).style.opacity || '1'
            )
          ),
        { timeout: 2_000 }
      )
      .toBeLessThan(0.6);

    // Sanity: pre-state was definitely brighter than the replayed start.
    expect(Number(pre || '1')).toBeGreaterThan(0.6);
  });

  test('switching to a block with motion config disables CSS animation immediately on tracked elements', async ({
    page,
  }) => {
    // Apply Stagger all so every animatable element has a track.
    await page.getByRole('button', { name: /Stagger all/i }).click();

    const preview = page.getByTestId('active-block-preview');
    const rowTestIds = await page
      .locator('[data-testid^="motion-row-"]')
      .evaluateAll(els =>
        els.map(el => (el as HTMLElement).dataset.testid ?? '')
      );
    const keys = rowTestIds
      .map(t => t.replace('motion-row-', ''))
      .filter(Boolean);
    expect(keys.length).toBeGreaterThanOrEqual(2);

    // For every tracked element rendered in the DOM, the runtime should have
    // killed its CSS animation (animationName === 'none'). Before this fix
    // the element would sit at opacity:0 during animation-delay → block blank.
    for (const key of keys) {
      const target = preview.locator(`[data-element-key="${key}"]`).first();
      if ((await target.count()) === 0) continue;
      const animName = await target.evaluate(
        el => getComputedStyle(el).animationName
      );
      expect(animName, `expected animation disabled on "${key}"`).toBe('none');
    }
  });

  test('preset on an element with baseline CSS animation actually animates (description/stats)', async ({
    page,
  }) => {
    // HeroSplit's `description`, `stats`, `ctaText` carry `animate-soft-rise`
    // (CSS @keyframes that animate `transform`). Without disabling the CSS
    // animation, GSAP's inline `transform` is overridden by the CSS
    // animation's fill state — user sees no movement. Assert that
    // computedStyle.transform (not just inline style) reflects GSAP at t=0.
    await page.getByRole('button', { name: /Stagger all/i }).click();
    const preview = page.getByTestId('active-block-preview');
    const description = preview
      .locator('[data-element-key="description"]')
      .first();
    const exists = await description.count();
    test.skip(exists === 0, 'no description element in active block');

    await page.getByTestId('sidebar-play-motion-preview').click();

    // computed transform should be a non-identity matrix at t=0 (fade-up's
    // start state is y:24 → matrix(1,0,0,1,0,24) initially, then tweens).
    await expect
      .poll(
        () =>
          description.evaluate(el => {
            const t = getComputedStyle(el).transform;
            // 'none' or identity 'matrix(1, 0, 0, 1, 0, 0)' means no animation.
            if (t === 'none') return 0;
            const m = t.match(/matrix\(([^)]+)\)/);
            if (!m) return 0;
            const parts = m[1]!.split(',').map(s => Number(s.trim()));
            // tx (index 4) and ty (index 5) — we want at least one non-zero.
            return Math.abs(parts[4] ?? 0) + Math.abs(parts[5] ?? 0);
          }),
        { timeout: 2_000 }
      )
      .toBeGreaterThan(0.5);
  });

  test('picking a preset auto-auditions just that element on the canvas', async ({
    page,
  }) => {
    const key = await firstRowKey(page);
    await expandRow(page, key);

    const target = page
      .getByTestId('active-block-preview')
      .locator(`[data-element-key="${key}"]`)
      .first();
    // Pick a second key on a DIFFERENT row — it should NOT receive any
    // transform when the user picks a preset for `key` (single-element
    // audition isolates).
    const rowTestIds = await page
      .locator('[data-testid^="motion-row-"]')
      .evaluateAll(els =>
        els.map(el => (el as HTMLElement).dataset.testid ?? '')
      );
    const otherKey = rowTestIds
      .map(t => t.replace('motion-row-', ''))
      .find(k => k !== key);
    expect(otherKey, 'expected at least 2 element rows').toBeTruthy();
    const other = page
      .getByTestId('active-block-preview')
      .locator(`[data-element-key="${otherKey!}"]`)
      .first();

    // Snapshot the "other" element's transform pre-pick so we can assert
    // it doesn't change.
    const otherBefore = await other.evaluate(
      el => (el as HTMLElement).style.transform || ''
    );

    await page.getByTestId(`motion-preset-${key}`).selectOption('zoom-in');

    // Audited element gets GSAP inline transform.
    await expect
      .poll(
        () => target.evaluate(el => (el as HTMLElement).style.transform || ''),
        { timeout: 2_000 }
      )
      .not.toBe('');

    // Other element's transform unchanged — proves the audition is scoped
    // to a single track.
    const otherAfter = await other.evaluate(
      el => (el as HTMLElement).style.transform || ''
    );
    expect(otherAfter).toBe(otherBefore);
  });

  test('Stagger all → every element with data-element-key gets GSAP inline styles', async ({
    page,
  }) => {
    // Apply fade-up + 100ms stagger to all elements.
    await page.getByRole('button', { name: /Stagger all/i }).click();

    // Collect element keys from the panel rows so we don't hard-code block-
    // specific keys here — works for hero_split or whatever is active.
    const rowTestIds = await page
      .locator('[data-testid^="motion-row-"]')
      .evaluateAll(els =>
        els.map(el => (el as HTMLElement).dataset.testid ?? '')
      );
    const keys = rowTestIds
      .map(t => t.replace('motion-row-', ''))
      .filter(Boolean);
    expect(keys.length).toBeGreaterThanOrEqual(4);

    // Trigger preview.
    await page.getByTestId('sidebar-play-motion-preview').click();

    // For each key, the DOM target [data-element-key="..."] should receive a
    // non-empty `transform` from GSAP at t=0 (start state of fade-up is y:24).
    // We skip keys whose content is empty/falsy (block renders no DOM, or
    // renders a 0-size hidden node — e.g. ctaText when the CTA string is
    // blank). The runtime's resolveTarget hits real elements only.
    // Scope to the active block preview only. Other blocks in the canvas
    // (tab thumbnails / vertical block list) also render data-element-key
    // nodes but aren't driven by the motion runtime.
    const preview = page.getByTestId('active-block-preview');
    const missing: string[] = [];
    let animated = 0;
    for (const key of keys) {
      const target = preview.locator(`[data-element-key="${key}"]`).first();
      const exists = await target.count();
      if (!exists) continue;
      const visible = await target.evaluate(el => {
        const h = el as HTMLElement;
        return h.offsetWidth > 0 && h.offsetHeight > 0;
      });
      if (!visible) continue;
      try {
        await expect
          .poll(
            () =>
              target.evaluate(el => (el as HTMLElement).style.transform || ''),
            { timeout: 1_500 }
          )
          .not.toBe('');
        animated++;
      } catch {
        missing.push(`${key} (no inline transform applied)`);
      }
    }
    expect(missing, missing.join(', ')).toEqual([]);
    expect(animated).toBeGreaterThanOrEqual(3);
  });

  test('Stagger all button populates every element', async ({ page }) => {
    await page.getByRole('button', { name: /Stagger all/i }).click();

    const rows = await page.locator('[data-testid^="motion-row-"]').all();
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      // Summary chip should mention "Fade Up" for every row.
      await expect(r).toContainText('Fade Up');
    }
  });
});
