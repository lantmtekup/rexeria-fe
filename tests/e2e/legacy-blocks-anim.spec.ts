import { expect, test } from 'playwright/test';

/**
 * Throwaway — verify animation states ở legacy blocks preview.
 * Capture initial state (rx-reveal opacity 0) + post-animation state.
 */

test('legacy blocks anim verify — rexer product reveal', async ({ page }) => {
  await page.goto('/admin/blocks');
  await page.waitForLoadState('networkidle');

  // Open rexer product card preview — click Play button trên card thứ 2
  // (FAQ là card 1, Rexer Product là card 2 trong registry order).
  const playButtons = page.getByRole('button', { name: 'Preview block' });
  await playButtons.nth(1).click({ force: true });
  await page.waitForTimeout(50); // Capture initial state

  // Verify .rx-reveal có element + initially opacity 0
  const revealEl = page.locator('#rexer-product .rx-reveal').first();
  await expect(revealEl).toBeVisible();

  // Wait IO fire + transition complete
  await page.waitForTimeout(1600);

  await page.screenshot({
    path: 'tests/e2e/.artifacts/legacy-rexer-product-after-anim.png',
    fullPage: false,
  });

  // Scroll modal content xuống để trigger card reveals
  await page.evaluate(() => {
    const scroller = document.querySelector(
      '.fixed.inset-0 .overflow-auto'
    ) as HTMLElement | null;
    if (scroller) scroller.scrollTop = scroller.scrollHeight / 2;
  });
  await page.waitForTimeout(1500);

  await page.screenshot({
    path: 'tests/e2e/.artifacts/legacy-rexer-product-scrolled.png',
    fullPage: false,
  });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
});

test('legacy blocks anim verify — delvaux hero fade', async ({ page }) => {
  await page.goto('/admin/blocks');
  await page.waitForLoadState('networkidle');

  // Delvaux là card thứ 3 (index 2)
  const playButtons = page.getByRole('button', { name: 'Preview block' });
  await playButtons.nth(2).click({ force: true });
  await page.waitForTimeout(1600);

  await page.screenshot({
    path: 'tests/e2e/.artifacts/legacy-delvaux-hero-after-anim.png',
    fullPage: false,
  });

  // Verify dx-fade visible class
  const fadeEl = page.locator('#delvaux-hero .dx-fade.is-visible').first();
  await expect(fadeEl).toBeVisible({ timeout: 2000 });

  // Scroll xuống panel 2 (product)
  await page.evaluate(() => {
    const scroller = document.querySelector(
      '.fixed.inset-0 .overflow-auto'
    ) as HTMLElement | null;
    if (scroller) scroller.scrollTop = window.innerHeight;
  });
  await page.waitForTimeout(1600);

  await page.screenshot({
    path: 'tests/e2e/.artifacts/legacy-delvaux-hero-panel2.png',
    fullPage: false,
  });

  await page.keyboard.press('Escape');
});
