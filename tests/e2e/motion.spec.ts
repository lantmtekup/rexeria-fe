import { expect, test, type Page } from 'playwright/test';

/**
 * Open the timeline modal and delete every existing track so each test
 * starts with a clean slate. Without this, autosave persists tracks added
 * by an earlier test, and the AddTrack popover hides element keys that
 * already have a track.
 */
async function clearAllTracks(page: Page) {
  await page.getByTestId('header-motion-editor').click();
  await expect(page.getByTestId('motion-modal')).toBeVisible();
  // Remove rows one-by-one — count drops as we click. Cap iterations to
  // avoid infinite loops on a stuck UI.
  for (let i = 0; i < 20; i++) {
    const remaining = await page.getByLabel('Xóa track').count();
    if (remaining === 0) break;
    await page.getByLabel('Xóa track').first().click();
  }
  // Leave modal open — most callers want it open to perform their setup.
}

/**
 * Phase 3 timeline editor — track-based motion. Tests cover modal entry
 * points, controls bar, add/remove track, keyframe interactions, inspector,
 * and modal close transitions.
 *
 * Requires the canvas template `TEMPLATE_ID` to exist on the BE pointed at
 * by `NEXT_PUBLIC_REXER_API`. See `tests/e2e/auth.setup.ts` for credentials.
 */
const TEMPLATE_ID = 'e0c2b922-0dca-4fdb-be04-f622d9b6c5cb';
const EDITOR_URL = `/canvas-templates/${TEMPLATE_ID}`;

test.describe('Motion timeline editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(EDITOR_URL);
    // Wait for the editor header to render — confirms canvas loaded.
    await expect(page.getByTestId('header-motion-editor')).toBeVisible({
      timeout: 20_000,
    });
    // Activate hero_split so every test starts from the same block. Without
    // this, the persisted active_block_id from prior test runs leaks in and
    // AddTrackPopover renders at a different height (different element-key
    // count → flaky clicks).
    const heroSplitTab = page.getByTestId('block-tab-hero_split');
    if (await heroSplitTab.count()) {
      await heroSplitTab.scrollIntoViewIfNeeded();
      await heroSplitTab.evaluate(el => (el as HTMLElement).click());
      await expect(heroSplitTab).toHaveAttribute('data-active', 'true', {
        timeout: 5_000,
      });
    }
  });

  test('header Timeline button opens the modal', async ({ page }) => {
    await page.getByTestId('header-motion-editor').click();
    await expect(page.getByTestId('motion-modal')).toBeVisible();
    await expect(page.getByTestId('motion-duration')).toBeVisible();
  });

  test('sidebar Motion tab → CTA opens the modal', async ({ page }) => {
    await page.getByTestId('sidebar-tab-motion').click();
    await page.getByTestId('sidebar-open-motion-editor').click();
    await expect(page.getByTestId('motion-modal')).toBeVisible();
  });

  test('ESC closes the modal', async ({ page }) => {
    await page.getByTestId('header-motion-editor').click();
    await expect(page.getByTestId('motion-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('motion-modal')).toBeHidden({
      timeout: 2_000,
    });
  });

  test('Close button hides the modal', async ({ page }) => {
    await page.getByTestId('header-motion-editor').click();
    await page.getByTestId('motion-modal-close').click();
    await expect(page.getByTestId('motion-modal')).toBeHidden({
      timeout: 2_000,
    });
  });

  test('controls bar surfaces duration / trigger / play', async ({ page }) => {
    await page.getByTestId('header-motion-editor').click();
    await expect(page.getByTestId('motion-duration')).toHaveValue(/\d+/);
    await expect(page.getByTestId('motion-trigger')).toBeVisible();
    await expect(page.getByTestId('motion-play')).toBeVisible();
  });

  test('changing duration is reflected in the input', async ({ page }) => {
    await page.getByTestId('header-motion-editor').click();
    const dur = page.getByTestId('motion-duration');
    await dur.fill('2500');
    await expect(dur).toHaveValue('2500');
  });

  test('add track flow: open popover → pick element → track row appears', async ({
    page,
  }) => {
    await clearAllTracks(page);

    const addBtn = page.getByTestId('motion-add-track');
    await expect(addBtn).toBeEnabled({ timeout: 5_000 });
    await addBtn.click();

    // Pick the block-root key — every block exposes it, so this is the
    // most stable option. The selector matches the data-testid built from
    // the BLOCK_ROOT_KEY constant ("__block__").
    const opt = page.getByTestId('motion-add-track-option-__block__');
    await expect(opt).toBeVisible();
    await opt.click();

    // The new track row should appear in the timeline.
    await expect(page.getByTestId('motion-track-__block__')).toBeVisible();
    // Default factory seeds two keyframes (0 + 60% of duration).
    await expect(page.getByTestId('motion-kf-__block__-0')).toBeVisible();
    await expect(page.getByTestId('motion-kf-__block__-1')).toBeVisible();
  });

  test('clicking a keyframe opens the inspector', async ({ page }) => {
    await clearAllTracks(page);
    await page.getByTestId('motion-add-track').click();
    await page.getByTestId('motion-add-track-option-__block__').click();

    await page.getByTestId('motion-kf-__block__-0').click();
    await expect(page.getByTestId('motion-inspector')).toBeVisible();
    await expect(page.getByTestId('motion-kf-time')).toBeVisible();
    await expect(page.getByTestId('motion-kf-time')).toHaveValue('0');
  });

  test('editing keyframe time via inspector persists and re-orders kfs', async ({
    page,
  }) => {
    await clearAllTracks(page);
    await page.getByTestId('motion-add-track').click();
    await page.getByTestId('motion-add-track-option-__block__').click();

    // Select kf 0 (time=0). Bump its time past kf 1 (time≈900ms) → array
    // re-sorts in patchKeyframe so the largest-time kf becomes index 1.
    await page.getByTestId('motion-kf-__block__-0').click();
    const timeInput = page.getByTestId('motion-kf-time');
    await timeInput.fill('1500');

    // Indices remain valid after sort (selection sticks to its slot, just
    // points at a different kf now). Verify the timeline reflects the
    // new ordering: index-1 diamond sits to the right of index-0.
    await expect
      .poll(async () => {
        const kf0 = await page
          .getByTestId('motion-kf-__block__-0')
          .evaluate(el => parseFloat((el as HTMLElement).style.left));
        const kf1 = await page
          .getByTestId('motion-kf-__block__-1')
          .evaluate(el => parseFloat((el as HTMLElement).style.left));
        return kf1 - kf0;
      })
      .toBeGreaterThan(0);
  });

  test('Delete key removes the selected keyframe', async ({ page }) => {
    await clearAllTracks(page);
    await page.getByTestId('motion-add-track').click();
    await page.getByTestId('motion-add-track-option-__block__').click();

    await page.getByTestId('motion-kf-__block__-0').click();
    // Click the modal background so document.activeElement is no longer the
    // diamond's <button> (Delete handler bails when an INPUT is focused, but
    // also when nothing in particular has focus our handler still fires).
    await page.getByTestId('motion-modal').click({ position: { x: 5, y: 5 } });
    await page.getByTestId('motion-kf-__block__-0').click();
    await page.keyboard.press('Delete');

    // One kf was deleted — index 1 (the second seed) shouldn't exist anymore.
    await expect(page.getByTestId('motion-kf-__block__-1')).toHaveCount(0);
  });

  test('inspector Delete button removes the keyframe', async ({ page }) => {
    await clearAllTracks(page);
    await page.getByTestId('motion-add-track').click();
    await page.getByTestId('motion-add-track-option-__block__').click();

    await page.getByTestId('motion-kf-__block__-1').click();
    await page.getByTestId('motion-kf-delete').click();

    await expect(page.getByTestId('motion-kf-__block__-1')).toHaveCount(0);
    // Inspector closes after delete (selection cleared).
    await expect(page.getByTestId('motion-inspector')).toBeHidden();
  });

  test('removing a track wipes its row + keyframes', async ({ page }) => {
    await clearAllTracks(page);
    await page.getByTestId('motion-add-track').click();
    await page.getByTestId('motion-add-track-option-__block__').click();

    const trackRow = page.getByTestId('motion-track-__block__');
    await expect(trackRow).toBeVisible();
    await trackRow.getByLabel('Xóa track').click();

    await expect(trackRow).toHaveCount(0);
  });

  test('Play button triggers preview replay (no crash)', async ({ page }) => {
    await clearAllTracks(page);
    await page.getByTestId('motion-add-track').click();
    await page.getByTestId('motion-add-track-option-__block__').click();
    // Just verify clicking Play doesn't throw / unmount — no easy assertion
    // on a one-shot GSAP play. The runtime's MotionProvider remounts via
    // previewKey bump.
    await page.getByTestId('motion-play').click();
    await expect(page.getByTestId('motion-modal')).toBeVisible();
  });
});
