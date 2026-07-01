import { expect, test } from 'playwright/test';

/**
 * /rexer/ads showcase — passcode-gated teaser (no on-page form, no persistence).
 *  - Plain URL: ONE continuous 6-phone grid, NO filter, NO unlock banner.
 *  - ?full=<code>: full catalog (14) + category nav.
 *  - Plain URL stays teaser even after a previous ?full visit (no localStorage).
 *  - Authenticated (same-origin): full automatically.
 */

const ART = 'tests/e2e/.artifacts';
const CODE = 'rexer2026';

test.describe('ads showcase — anonymous (teaser)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('plain URL = clean 6-phone teaser, no filter, no banner', async ({
    page,
  }) => {
    await page.goto('/rexer/ads');
    await page.waitForLoadState('networkidle');

    const navCount = await page.locator('.adsc-nav-scroll').count();
    const phoneCount = await page.locator('.adsc-phone').count();
    const coreHeading = await page
      .getByRole('heading', { name: 'Core Interactions' })
      .count();
    const banner = await page.getByText('Đây mới là').count();

    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        state: 'anon',
        navCount,
        phoneCount,
        coreHeading,
        banner,
      })
    );
    await page.screenshot({ path: `${ART}/ads-anon.png`, fullPage: true });

    expect(navCount, 'filter nav hidden').toBe(0);
    expect(coreHeading, 'no per-category headings').toBe(0);
    expect(phoneCount, '6 teaser phones').toBe(6);
    expect(banner, 'unlock banner hidden').toBe(0);
  });

  test('?full=<code> unlocks full catalog', async ({ page }) => {
    await page.goto(`/rexer/ads?full=${CODE}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    expect(await page.locator('.adsc-nav-scroll').count(), 'nav shown').toBe(1);
    expect(await page.locator('.adsc-phone').count(), '14 phones').toBe(14);
  });

  test('plain URL stays teaser AFTER a ?full visit (no persistence)', async ({
    page,
  }) => {
    await page.goto(`/rexer/ads?full=${CODE}`);
    await page.waitForLoadState('networkidle');
    expect(await page.locator('.adsc-phone').count(), 'full after ?full').toBe(
      14
    );

    await page.goto('/rexer/ads');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    expect(
      await page.locator('.adsc-phone').count(),
      'plain back to teaser'
    ).toBe(6);
    expect(
      await page.locator('.adsc-nav-scroll').count(),
      'no nav on plain'
    ).toBe(0);
  });

  test('wrong ?full code stays teaser', async ({ page }) => {
    await page.goto('/rexer/ads?full=nope');
    await page.waitForLoadState('networkidle');
    expect(await page.locator('.adsc-phone').count()).toBe(6);
  });
});

test.describe('ads showcase — authenticated (full)', () => {
  test('category nav + 14 phones, no banner', async ({ page }) => {
    await page.goto('/rexer/ads');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);

    expect(await page.locator('.adsc-nav-scroll').count(), 'nav visible').toBe(
      1
    );
    expect(await page.locator('.adsc-phone').count(), '14 phones').toBe(14);
    expect(await page.getByText('Đây mới là').count(), 'no banner').toBe(0);
    await page.screenshot({ path: `${ART}/ads-auth.png`, fullPage: true });
  });
});
