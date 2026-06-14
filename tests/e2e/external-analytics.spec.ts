/* eslint-disable no-console -- spec verify/diagnostic: in KPI số thật ra log */
import { expect, test } from 'playwright/test';

/**
 * Verify trang Tổng quan analytics của landing NGOÀI (mintcoin) render data
 * thật sau khi seed. Chạy với admin session (platform-admin → qua brand-scope
 * nên mọi endpoint analytics trả data). Log số thật + chụp màn hình.
 */

const PAGE_ID = '1a69ef99-5773-41e6-8bdf-466fd53e3cc1';

test('external landing Tổng quan hiện data', async ({ page, baseURL }) => {
  // Probe raw API (dùng cookie của session) → chốt real vs demo.
  const base = baseURL ?? 'http://localhost:3000';
  const probe = async (path: string) => {
    const r = await page.request.get(`${base}/api/rexer/${path}`);
    return `${r.status()} ${(await r.text()).slice(0, 240)}`;
  };
  console.log(
    'summary  →',
    await probe(`pages/${PAGE_ID}/analytics/summary?range=30d`)
  );
  console.log(
    'evt-bd   →',
    await probe(
      `pages/${PAGE_ID}/analytics/breakdown?group_by=event_type&range=30d`
    )
  );
  console.log(
    'sources  →',
    await probe(`analytics/sources?page_id=${PAGE_ID}&range=30d`)
  );
  console.log(
    'timeser  →',
    await probe(
      `analytics/timeseries?page_id=${PAGE_ID}&metric=visits&range=30d`
    )
  );
  console.log(
    'funnel   →',
    await probe(`analytics/funnel?page_id=${PAGE_ID}&range=30d`)
  );

  await page.goto(`/portal/landing-pages/${PAGE_ID}/analytics`);

  // Chờ tab Tổng quan + KPI tiles.
  await expect(page.getByRole('button', { name: 'Tổng quan' })).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByText('Lượt xem', { exact: true })).toBeVisible({
    timeout: 20_000,
  });

  // Đọc giá trị KPI (value nằm ngay sau label trong MetricTile).
  const kpi = async (label: string) => {
    const tile = page
      .locator('div', { has: page.getByText(label, { exact: true }) })
      .filter({ hasText: label })
      .last();
    return (await tile.innerText()).replace(/\s+/g, ' ').trim();
  };

  const views = await kpi('Lượt xem');
  const visitors = await kpi('Khách (unique)');
  const clicks = await kpi('Click CTA');
  const conv = await kpi('Chuyển đổi');
  console.log('KPI →', { views, visitors, clicks, conv });

  // Trend: card "Lượt xem theo ngày" có <svg> (AreaChart) nếu có data.
  const trendCard = page
    .locator('section', { hasText: 'Lượt xem theo ngày' })
    .first();
  const hasChart = await trendCard.locator('svg').count();
  console.log('Trend chart svg count →', hasChart);

  // Theo section + Nguồn truy cập: log các dòng.
  const sectionCard = page
    .locator('section', { hasText: 'Theo section' })
    .first();
  const sectionRows = await sectionCard.locator('li').allInnerTexts();
  console.log('Theo section →', sectionRows);

  const sourceCard = page
    .locator('section', { hasText: 'Nguồn truy cập' })
    .first();
  const sourceRows = await sourceCard.locator('li').allInnerTexts();
  console.log('Nguồn truy cập →', sourceRows);

  await page.screenshot({
    path: 'tests/e2e/.artifacts/external-overview.png',
    fullPage: true,
  });

  // Tab Phễu & Lead.
  await page.getByRole('button', { name: 'Phễu & Lead' }).click();
  await page.waitForTimeout(2500);
  const funnelErr = await page.getByText('Không tải được analytics').count();
  console.log('Phễu & Lead lỗi? →', funnelErr > 0 ? 'CÓ' : 'không');
  await page.screenshot({
    path: 'tests/e2e/.artifacts/external-funnel.png',
    fullPage: true,
  });

  // Assert: trang Tổng quan KHÔNG kẹt loading, có ít nhất 1 dòng section.
  expect(sectionRows.length).toBeGreaterThan(0);
});
