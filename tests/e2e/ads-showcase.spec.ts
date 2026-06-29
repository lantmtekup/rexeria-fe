import { expect, test } from 'playwright/test';

/**
 * /rexer/ads showcase — login/passcode-gated teaser.
 *  - Anonymous: ONE continuous 6-phone grid, NO category filter, unlock form.
 *  - ?full=<code> OR typing the code: full catalog (14) + category nav.
 *  - Authenticated (same-origin): full automatically.
 */

const ART = 'tests/e2e/.artifacts';
const CODE = 'rexer2026';

test.describe('ads showcase — anonymous (teaser)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('continuous 6-phone grid, no filter, unlock form', async ({ page }) => {
    await page.goto('/rexer/ads');
    await page.waitForLoadState('networkidle');

    const navCount = await page.locator('.adsc-nav-scroll').count();
    const phoneCount = await page.locator('.adsc-phone').count();
    const coreHeading = await page
      .getByRole('heading', { name: 'Core Interactions' })
      .count();
    const unlockBtn = await page
      .getByRole('button', { name: 'Mở khoá' })
      .isVisible();

    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        state: 'anon',
        navCount,
        phoneCount,
        coreHeading,
        unlockBtn,
      })
    );
    await page.screenshot({ path: `${ART}/ads-anon.png`, fullPage: true });

    expect(navCount, 'filter nav hidden').toBe(0);
    expect(coreHeading, 'no per-category headings').toBe(0);
    expect(phoneCount, '6 teaser phones').toBe(6);
    expect(unlockBtn, 'unlock form visible').toBe(true);
  });

  test('?full=<code> unlocks full catalog', async ({ page }) => {
    await page.goto(`/rexer/ads?full=${CODE}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    const navCount = await page.locator('.adsc-nav-scroll').count();
    const phoneCount = await page.locator('.adsc-phone').count();
    const unlockBtn = await page
      .getByRole('button', { name: 'Mở khoá' })
      .count();

    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({ state: 'query-unlock', navCount, phoneCount, unlockBtn })
    );

    expect(navCount, 'category nav shown').toBe(1);
    expect(phoneCount, 'all 14 phones').toBe(14);
    expect(unlockBtn, 'unlock form gone').toBe(0);
  });

  test('typing the code unlocks; wrong code stays teaser', async ({ page }) => {
    await page.goto('/rexer/ads');
    await page.waitForLoadState('networkidle');

    // wrong code → stays teaser + shows error
    await page.getByLabel('Mã mở khoá').fill('nope');
    await page.getByRole('button', { name: 'Mở khoá' }).click();
    await expect(page.getByText('Mã không đúng')).toBeVisible();
    expect(await page.locator('.adsc-phone').count()).toBe(6);

    // correct code → full
    await page.getByLabel('Mã mở khoá').fill(CODE);
    await page.getByRole('button', { name: 'Mở khoá' }).click();
    await expect(page.locator('.adsc-nav-scroll')).toBeVisible({
      timeout: 5000,
    });
    expect(await page.locator('.adsc-phone').count()).toBe(14);
  });
});

test.describe('ads showcase — authenticated (full)', () => {
  test('category nav + 14 phones, no unlock form', async ({ page }) => {
    await page.goto('/rexer/ads');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);

    const navCount = await page.locator('.adsc-nav-scroll').count();
    const phoneCount = await page.locator('.adsc-phone').count();
    const unlockBtn = await page
      .getByRole('button', { name: 'Mở khoá' })
      .count();

    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({ state: 'auth', navCount, phoneCount, unlockBtn })
    );
    await page.screenshot({ path: `${ART}/ads-auth.png`, fullPage: true });

    expect(navCount, 'category nav visible').toBe(1);
    expect(phoneCount, 'all 14 phones').toBe(14);
    expect(unlockBtn, 'no unlock form when logged in').toBe(0);
  });
});
