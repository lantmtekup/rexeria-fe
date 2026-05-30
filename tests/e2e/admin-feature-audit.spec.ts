/* eslint-disable no-console -- audit test prints a report to stdout */
/**
 * Admin + portal feature audit smoke test.
 *
 * For each route the FE claims to ship, visit it as admin and capture:
 *  - HTTP status (page render)
 *  - Console errors (React, BE 5xx surfaced)
 *  - Network failures (4xx/5xx on /api/rexer/*)
 *  - Headline text (proves the page rendered, not a fallback)
 *
 * Report goes to stdout as a Markdown table. Test passes even when issues
 * exist — the point is to surface them, not block CI.
 */

import { expect, test } from 'playwright/test';

interface RouteCheck {
  path: string;
  group: 'admin' | 'portal';
  expectHeadline?: RegExp;
  notes?: string;
}

const ROUTES: RouteCheck[] = [
  // Admin
  {
    path: '/admin',
    group: 'admin',
    expectHeadline: /bảng điều khiển|admin dashboard|tổng quan|overview/i,
  },
  { path: '/admin/products', group: 'admin', expectHeadline: /sản phẩm/i },
  {
    path: '/admin/canvas-templates',
    group: 'admin',
    expectHeadline: /landing pages?/i,
  },
  {
    path: '/admin/templates',
    group: 'admin',
    expectHeadline: /landing page template/i,
  },
  { path: '/admin/ai-templates', group: 'admin' },
  { path: '/admin/blocks', group: 'admin', expectHeadline: /blocks?/i },
  {
    path: '/admin/block-types',
    group: 'admin',
    expectHeadline: /catalog|block types/i,
    notes: 'NEW',
  },
  { path: '/admin/users', group: 'admin', expectHeadline: /khách hàng/i },
  {
    path: '/admin/users-global',
    group: 'admin',
    expectHeadline: /global users|toàn hệ thống|người dùng/i,
    notes: 'NEW',
  },
  {
    path: '/admin/inbox',
    group: 'admin',
    expectHeadline: /workload|staff inbox/i,
    notes: 'NEW',
  },
  { path: '/admin/ai-usage', group: 'admin' },
  { path: '/admin/feedback', group: 'admin' },
  { path: '/admin/analytics', group: 'admin' },
  { path: '/admin/assets', group: 'admin' },
  { path: '/admin/workspaces', group: 'admin' },

  // Portal note — skip with admin cookie (PortalDataProvider needs brand
  // membership and stalls). Run separate test with brand cookie when ready.
];

interface RouteResult {
  path: string;
  group: string;
  ok: boolean;
  status: number;
  consoleErrors: string[];
  networkFailures: { url: string; status: number }[];
  headlineMatch: boolean | null;
  notes?: string;
}

test('audit admin + portal routes', async ({ page, baseURL }) => {
  const base = baseURL ?? 'http://localhost:3000';
  const results: RouteResult[] = [];

  for (const route of ROUTES) {
    const consoleErrors: string[] = [];
    const networkFailures: { url: string; status: number }[] = [];

    const onConsole = (msg: import('playwright/test').ConsoleMessage) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Filter out noisy expected errors
        if (
          text.includes('401') ||
          text.includes('403') ||
          text.includes('Failed to load resource') ||
          text.includes('Hydration')
        ) {
          return;
        }
        consoleErrors.push(text.slice(0, 200));
      }
    };

    const onResponse = (response: import('playwright/test').Response) => {
      const url = response.url();
      if (!url.includes('/api/rexer/')) return;
      const status = response.status();
      if (status >= 400 && status !== 401 && status !== 403 && status !== 404) {
        networkFailures.push({
          url: url.replace(base, '').slice(0, 80),
          status,
        });
      }
    };

    page.on('console', onConsole);
    page.on('response', onResponse);

    let status = 0;
    let headlineMatch: boolean | null = null;
    try {
      const resp = await page.goto(`${base}${route.path}`, {
        waitUntil: 'networkidle',
        timeout: 20_000,
      });
      status = resp?.status() ?? 0;

      // Give the page 1.5s to render React-rendered headings
      await page.waitForTimeout(1500);

      if (route.expectHeadline) {
        const heading = await page
          .locator('h1, h2')
          .first()
          .textContent({ timeout: 3000 })
          .catch(() => null);
        headlineMatch = heading ? route.expectHeadline.test(heading) : false;
      }
    } catch {
      status = -1;
    }

    page.off('console', onConsole);
    page.off('response', onResponse);

    results.push({
      path: route.path,
      group: route.group,
      ok:
        status === 200 &&
        consoleErrors.length === 0 &&
        networkFailures.length === 0 &&
        (headlineMatch ?? true),
      status,
      consoleErrors,
      networkFailures,
      headlineMatch,
      notes: route.notes,
    });
  }

  // ─── Print report ─────────────────────────────────────────────────────
  console.log('\n\n═══════════════════════════════════════════════════');
  console.log('  Rexer FE — Admin + Portal route audit report');
  console.log('═══════════════════════════════════════════════════\n');

  const okCount = results.filter(r => r.ok).length;
  const failCount = results.length - okCount;
  console.log(
    `Pass: ${okCount} · Issues: ${failCount} · Total: ${results.length}\n`
  );

  for (const r of results) {
    const badge = r.ok
      ? '✅'
      : r.status !== 200
        ? '❌'
        : r.consoleErrors.length > 0
          ? '⚠️ '
          : r.networkFailures.length > 0
            ? '🌐'
            : '🔍';
    const notes = r.notes ? ` [${r.notes}]` : '';
    console.log(`${badge} ${r.path}${notes} (${r.status})`);
    if (r.headlineMatch === false) {
      console.log(`     ⊘ Headline mismatch`);
    }
    if (r.consoleErrors.length > 0) {
      console.log(`     ⊘ ${r.consoleErrors.length} console error(s):`);
      for (const e of r.consoleErrors.slice(0, 3)) {
        console.log(`        ${e}`);
      }
    }
    if (r.networkFailures.length > 0) {
      console.log(`     ⊘ ${r.networkFailures.length} network failure(s):`);
      for (const f of r.networkFailures.slice(0, 3)) {
        console.log(`        ${f.status} ${f.url}`);
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════\n');

  // Don't fail the test — just surface info
  expect(results.length).toBeGreaterThan(0);
});
