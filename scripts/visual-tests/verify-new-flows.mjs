// E2E verify cho các UI mới triển khai trong loạt PR gần đây.
// Cover:
//   1. Sign-in (with Forgot link visible)
//   2. /forgot-password — submit → reset_token panel
//   3. /reset-password?token=... — render + validate
//   4. Sidebar nav → /portal Client Portal layout
//   5. /setting + /setting/clients (list)
//   6. /product → list (BE products)
//   7. /product/[id]/landing — list landings, 3 quick links
//   8. /product/[id]/landing/[lid]/publish — workspace render
//   9. /product/[id]/landing/[lid]/media — upload+bind UI
//   10. /product/[id]/landing/[lid]/analytics — metrics + chart
//   11. /ai-agents/start
//   12. /ai-agents/[pid]/template — AI suggestions render
//   13. /product/[id]/marketing — campaigns list
//
// Usage: node scripts/visual-tests/verify-new-flows.mjs
//
// Reports per page: HTTP status of main doc, console errors, pageerrors,
// failed network requests, and saves a screenshot.

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'out');
await mkdir(OUT, { recursive: true });

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

const log = (...a) =>
  console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

const results = [];

async function visit(page, path, name, opts = {}) {
  const r = {
    name,
    path,
    status: null,
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    headerText: null,
    notes: [],
  };

  const consoleHandler = msg => {
    const t = msg.type();
    if (t === 'error') r.consoleErrors.push(msg.text().slice(0, 200));
  };
  const pageErrHandler = err =>
    r.pageErrors.push((err.message || String(err)).slice(0, 200));
  const reqFailedHandler = req =>
    r.failedRequests.push(
      `${req.method()} ${req.url()} :: ${req.failure()?.errorText ?? ''}`.slice(
        0,
        200
      )
    );

  page.on('console', consoleHandler);
  page.on('pageerror', pageErrHandler);
  page.on('requestfailed', reqFailedHandler);

  try {
    log(`→ GOTO ${path}`);
    const resp = await page.goto(BASE + path, {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });
    r.status = resp?.status() ?? null;

    // Allow client hydration + network tail to settle.
    await page.waitForTimeout(opts.settle ?? 1500);

    // Capture an h1/h2 for sanity.
    const head = await page
      .locator('h1, h2')
      .first()
      .textContent({ timeout: 1000 })
      .catch(() => null);
    if (head) r.headerText = head.trim().slice(0, 80);

    if (opts.expect) {
      for (const txt of opts.expect) {
        const found = await page
          .getByText(txt, { exact: false })
          .first()
          .isVisible({ timeout: 1000 })
          .catch(() => false);
        if (!found) r.notes.push(`missing text "${txt}"`);
      }
    }

    if (opts.action) {
      try {
        await opts.action(page, r);
      } catch (err) {
        r.notes.push(`action failed: ${err.message?.slice(0, 100)}`);
      }
    }

    const filename = `verify-${name.replace(/[^\w]+/g, '_')}.png`;
    await page.screenshot({ path: join(OUT, filename), fullPage: false });
    r.notes.push(`shot: ${filename}`);
  } catch (err) {
    r.notes.push(`navigation error: ${err.message?.slice(0, 200)}`);
  } finally {
    page.off('console', consoleHandler);
    page.off('pageerror', pageErrHandler);
    page.off('requestfailed', reqFailedHandler);
    results.push(r);
  }
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// 1. Sign-in
await visit(page, '/sign-in', '01-signin', {
  expect: ['Forgot password'],
});

// 2. Submit sign-in (default creds in form)
log('→ submit sign-in form');
const submitClicked = await page
  .locator('form button[type=submit]')
  .first()
  .click()
  .then(() => true)
  .catch(() => false);
if (submitClicked) {
  await page
    .waitForURL(/\/home/, { timeout: 15000 })
    .catch(() => log('   sign-in did not redirect to /home'));
  await page.waitForTimeout(1500);
}
log('→ post-login url=', page.url());

// 3. Forgot password
await visit(page, '/forgot-password', '02-forgot', {
  expect: ['Forgot password', 'Send reset token'],
  action: async (p, r) => {
    await p.locator('input[type=email]').fill('admin@rexer.ai');
    await p.locator('button[type=submit]').click();
    await p.waitForTimeout(2000);
    const tokenVisible = await p
      .getByText(/Reset token issued|If the email exists/i)
      .first()
      .isVisible()
      .catch(() => false);
    if (!tokenVisible) r.notes.push('no token/confirm panel after submit');
  },
});

// 4. Reset password (no token) — should still render
await visit(page, '/reset-password?token=fake-token-123', '03-reset', {
  expect: ['Reset password', 'New password'],
});

// 5. Settings hub
await visit(page, '/setting', '04-setting', {
  expect: ['Settings', 'Clients & workspaces'],
});

// 6. Settings → Clients list
await visit(page, '/setting/clients', '05-clients-list', {
  expect: ['Clients'],
});

// 7. Client Portal overview
await visit(page, '/portal', '06-portal', {
  expect: ['Overview', 'Live landings'],
});

// 8. Product list (BE products)
await visit(page, '/product', '07-product-list', {
  expect: ['Product'],
});

// 9. Get a product id from BE list (or fall back to "demo")
let productId = 'demo';
try {
  const res = await page.evaluate(async () => {
    const r = await fetch('/api/rexer/products?limit=1', {
      credentials: 'include',
    });
    return { status: r.status, body: await r.text() };
  });
  log('   /api/rexer/products →', res.status, res.body.slice(0, 150));
  const parsed = JSON.parse(res.body);
  if (parsed.items?.[0]?.id) productId = parsed.items[0].id;
} catch (err) {
  log('   could not fetch products:', err.message);
}
log('→ using productId =', productId);

// 10. Landings list
await visit(page, `/product/${productId}/landing`, '08-landing-list', {
  expect: ['Landings'],
});

// 11. Pick a project id (any project we own)
let projectId = 'demo';
try {
  const res = await page.evaluate(async () => {
    const r = await fetch('/api/rexer/projects', { credentials: 'include' });
    return { status: r.status, body: await r.text() };
  });
  log('   /api/rexer/projects →', res.status, res.body.slice(0, 150));
  const parsed = JSON.parse(res.body);
  if (parsed.items?.[0]?.id) projectId = parsed.items[0].id;
} catch (err) {
  log('   could not fetch projects:', err.message);
}
log('→ using projectId =', projectId);

// 12. Publish workspace
await visit(
  page,
  `/product/${productId}/landing/${projectId}/publish`,
  '09-landing-publish',
  { expect: ['Pre-flight checks', 'Publish'] }
);

// 13. Landing media (upload+bind)
await visit(
  page,
  `/product/${productId}/landing/${projectId}/media`,
  '10-landing-media',
  { expect: ['Landing media', 'Upload'] }
);

// 14. Landing analytics
await visit(
  page,
  `/product/${productId}/landing/${projectId}/analytics`,
  '11-landing-analytics',
  { expect: ['Page views', 'Daily activity'] }
);

// 15. Template detail (with versions panel)
let templateId = 'demo';
try {
  const res = await page.evaluate(async () => {
    const r = await fetch('/api/rexer/templates', { credentials: 'include' });
    return { status: r.status, body: await r.text() };
  });
  const parsed = JSON.parse(res.body);
  if (parsed.items?.[0]?.id) templateId = parsed.items[0].id;
} catch {
  /* noop */
}
await visit(page, `/template/${templateId}`, '12-template-detail', {
  expect: ['Versions'],
});

// 16. AI Agents start
await visit(page, '/ai-agents/start', '13-ai-start', {
  expect: ['AI-Agents'],
});

// 17. AI template suggestions (uses real productId)
await visit(page, `/ai-agents/${productId}/template`, '14-ai-template', {
  expect: ['Pick a template'],
});

// 18. AI campaign plan
await visit(page, `/ai-agents/${productId}/campaign`, '15-ai-campaign', {
  expect: ['Campaign brief', 'Plan with AI'],
});

// 19. Marketing list
await visit(page, `/product/${productId}/marketing`, '16-marketing-list', {
  expect: ['Marketing'],
});

await browser.close();

// Write detailed report
const lines = [];
lines.push('# Verify report');
lines.push(`Date: ${new Date().toISOString()}`);
lines.push(`Base: ${BASE}`);
lines.push('');
let pass = 0;
let warn = 0;
let fail = 0;
for (const r of results) {
  const verdict =
    r.status === 200 &&
    r.pageErrors.length === 0 &&
    r.notes.filter(n => n.startsWith('navigation error') || n.startsWith('missing text'))
      .length === 0
      ? 'PASS'
      : r.status && r.status >= 400
        ? 'FAIL'
        : 'WARN';
  if (verdict === 'PASS') pass++;
  else if (verdict === 'FAIL') fail++;
  else warn++;
  lines.push(`## [${verdict}] ${r.name}  ·  ${r.path}`);
  lines.push(`- HTTP: ${r.status}`);
  lines.push(`- header: ${r.headerText ?? '—'}`);
  if (r.consoleErrors.length)
    lines.push(`- console errors (${r.consoleErrors.length}):`);
  r.consoleErrors.slice(0, 5).forEach(c => lines.push(`    · ${c}`));
  if (r.pageErrors.length)
    lines.push(`- page errors (${r.pageErrors.length}):`);
  r.pageErrors.slice(0, 5).forEach(c => lines.push(`    · ${c}`));
  if (r.failedRequests.length)
    lines.push(`- failed requests (${r.failedRequests.length}):`);
  r.failedRequests.slice(0, 5).forEach(c => lines.push(`    · ${c}`));
  if (r.notes.length) {
    lines.push(`- notes:`);
    r.notes.forEach(n => lines.push(`    · ${n}`));
  }
  lines.push('');
}
lines.push('---');
lines.push(`Summary: ${pass} pass · ${warn} warn · ${fail} fail`);
const report = lines.join('\n');
await writeFile(join(OUT, 'verify-report.md'), report);
console.log('\n' + report);
console.log('\nReport saved to', join(OUT, 'verify-report.md'));
