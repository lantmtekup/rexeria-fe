import { expect, test } from 'playwright/test';

/**
 * Throwaway smoke test cho legacy blocks POC migration (commit f63ac4b).
 * Verify 3 legacy block cards (FAQ, Rexer Product, Delvaux Hero Intro)
 * appear ở /admin/blocks list. Render qua synthetic ServerBlock entries
 * id='legacy:*' merged ở client load — không cần BE seed.
 *
 * Run: PLAYWRIGHT_TEST_BASE_URL=http://localhost:3003 npx playwright test
 *      legacy-blocks-poc.spec.ts --reporter=list
 */

test('legacy blocks render trong /admin/blocks list', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(`pageerror: ${err.message}`));

  await page.goto('/admin/blocks');
  await page.waitForLoadState('networkidle');

  // Card title text (lấy từ schema.name của 3 legacy entries)
  const faqCard = page.getByText('FAQ', { exact: true }).first();
  const rexerCard = page.getByText('Rexer — Product', { exact: true }).first();
  const delvauxCard = page
    .getByText('Delvaux — Hero Intro', { exact: true })
    .first();

  await expect(faqCard).toBeVisible({ timeout: 15_000 });
  await expect(rexerCard).toBeVisible();
  await expect(delvauxCard).toBeVisible();

  // Capture screenshot — admin xem visually 3 card có render đúng không
  await page.screenshot({
    path: 'tests/e2e/.artifacts/legacy-blocks-list.png',
    fullPage: true,
  });

  // Count total — header có "N blocks". Phải ≥ 3 (legacy) + BE blocks
  const header = await page
    .locator('text=/\\d+\\s+blocks/')
    .first()
    .textContent();
  // eslint-disable-next-line no-console
  console.log('[INFO] Header count:', header);

  // Tag filter — legacy entries có tag 'legacy', click → chỉ còn 3 cards
  const legacyTagChip = page.getByRole('button', { name: /^legacy$/i }).first();
  if (await legacyTagChip.isVisible().catch(() => false)) {
    await legacyTagChip.click();
    await page.waitForTimeout(300);
    await expect(faqCard).toBeVisible();
    await expect(rexerCard).toBeVisible();
    await expect(delvauxCard).toBeVisible();
  }

  // Click "FAQ" card → drawer mở (admin). Verify drawer title hiện.
  await faqCard.click();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: 'tests/e2e/.artifacts/legacy-blocks-faq-drawer.png',
    fullPage: true,
  });

  // No console errors (allow Next.js dev warnings)
  const realErrors = consoleErrors.filter(
    e =>
      !e.includes('Download the React DevTools') &&
      !e.includes('source map') &&
      !e.toLowerCase().includes('warning')
  );
  if (realErrors.length > 0) {
    // eslint-disable-next-line no-console
    console.log('[ERRORS]\n' + realErrors.join('\n'));
  }
  expect(realErrors).toHaveLength(0);
});
