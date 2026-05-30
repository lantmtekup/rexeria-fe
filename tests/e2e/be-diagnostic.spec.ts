/* eslint-disable no-console -- diagnostic test prints to stdout */
/**
 * BE shape diagnostic — uses the authenticated admin session (via the auth
 * setup project) to probe which canonical paths BE currently serves. Run
 * after a BE update to figure out which FE adapters need to be updated.
 *
 * Always passes — the point is to surface the report in stdout.
 */

import { test } from 'playwright/test';

const BRAND_ID = '8dd7494e-f97a-4be9-9d74-7e8f68d1688e';

// Re-probe after BE confirms full deploy 2026-05-26.
// Swagger went 148→108 paths, canonical paths mounted per handoff §1.2.
const WORKSPACE_ID = 'd7e33473-e1ab-46e8-af77-0ebe3976ffde';
const PROBES: { label: string; path: string }[] = [
  // NEW: canonical brand-scoped workspaces (resolved open Q #3)
  {
    label: 'NEW /brands/:id/workspaces (canonical)',
    path: `/api/rexer/brands/${BRAND_ID}/workspaces`,
  },
  // SQL bugs — re-test
  {
    label: '/brands/:id/users (was 500)',
    path: `/api/rexer/brands/${BRAND_ID}/users`,
  },
  {
    label: '/brands/:id/activity (was 500)',
    path: `/api/rexer/brands/${BRAND_ID}/activity`,
  },
  // Block-types admin (LIST endpoint not in swagger now — only POST/PATCH/DELETE)
  {
    label: 'POST allowed on /admin/block-types?',
    path: '/api/rexer/admin/block-types',
  },
  // Confirm working
  { label: '/brands', path: '/api/rexer/brands' },
  { label: '/brands/:id', path: `/api/rexer/brands/${BRAND_ID}` },
  {
    label: '/brands/:id/domains',
    path: `/api/rexer/brands/${BRAND_ID}/domains`,
  },
  {
    label: '/workspaces/:wsId/pages',
    path: `/api/rexer/workspaces/${WORKSPACE_ID}/pages`,
  },
  { label: '/blocks', path: '/api/rexer/blocks' },
  { label: '/block-types (public)', path: '/api/rexer/block-types' },
  // Legacy SHOULD be 404 now
  {
    label: '/clients/:id/workspaces (legacy — expect 404 post-cutover)',
    path: `/api/rexer/clients/${BRAND_ID}/workspaces`,
  },
  // Template version probe — to see canvas_blueprint shape
  {
    label: '/v1/templates/{id} (detail)',
    path: '/api/rexer/templates/44444444-0000-0000-0000-000000000001',
  },
  {
    label: '/v1/templates/{id}/versions',
    path: '/api/rexer/templates/44444444-0000-0000-0000-000000000001/versions',
  },
  {
    label: '/v1/templates/{id}/versions/{vId}',
    path: '/api/rexer/templates/44444444-0000-0000-0000-000000000001/versions/55555555-0000-0000-0000-000000000001',
  },
];
const OLD_PROBES: { label: string; path: string }[] = [
  // P0 — canonical rename
  {
    label: '#3 brands/{id}/workspaces',
    path: `/api/rexer/brands/${BRAND_ID}/workspaces`,
  },
  { label: '#4 admin/block-types list', path: '/api/rexer/admin/block-types' },
  { label: '#5 projects list', path: '/api/rexer/projects' },
  { label: '#6 canvas-templates list', path: '/api/rexer/canvas-templates' },
  {
    label: '#7 clients/{id}/users',
    path: `/api/rexer/clients/${BRAND_ID}/users`,
  },

  // P0 — SQL bug
  {
    label: '#2 brands/{id}/users (SQL bug)',
    path: `/api/rexer/brands/${BRAND_ID}/users`,
  },

  // ✅ verified before — confirm still working
  { label: '✅ brands list', path: '/api/rexer/brands' },
  { label: '✅ brands/{id}', path: `/api/rexer/brands/${BRAND_ID}` },
  {
    label: '✅ clients/{id}/workspaces (legacy)',
    path: `/api/rexer/clients/${BRAND_ID}/workspaces`,
  },
  { label: '✅ admin/users', path: '/api/rexer/admin/users' },

  // FE canonical Wave 1
  { label: 'pages (FE canonical Wave 1)', path: '/api/rexer/pages' },
  {
    label: 'pages?brand_id (alt)',
    path: `/api/rexer/pages?brand_id=${BRAND_ID}`,
  },

  // Newly-suspected (BE may have shipped recently)
  {
    label: 'brands/{id}/members (alt)',
    path: `/api/rexer/brands/${BRAND_ID}/members`,
  },
  { label: 'admin/brands', path: '/api/rexer/admin/brands' },
  { label: 'block-types public', path: '/api/rexer/block-types' },
];
void OLD_PROBES;
const DIRECT_PROBES: { label: string; url: string }[] = [];

test('probe BE endpoint shapes', async ({ page, baseURL }) => {
  const base = baseURL ?? 'http://localhost:3000';
  console.log('\n=== BE endpoint probe (authenticated admin) ===\n');
  for (const p of PROBES) {
    const url = `${base}${p.path}`;
    try {
      const r = await page.request.get(url);
      const status = r.status();
      const body = await r.text();
      const preview = body.slice(0, r.ok() ? 220 : 140).replace(/\s+/g, ' ');
      console.log(
        `  ${status}  ${p.label}\n        ${p.path}\n        ${preview}`
      );
    } catch (e) {
      console.log(`  ERR  ${p.label}  ${p.path}  ${(e as Error).message}`);
    }
  }
  console.log(
    '\n--- direct BE host probes (no auth, bypassing /v1 rewrite) ---\n'
  );
  for (const p of DIRECT_PROBES) {
    try {
      const r = await page.request.get(p.url);
      const status = r.status();
      const body = await r.text();
      const preview = body.slice(0, 200).replace(/\s+/g, ' ');
      console.log(
        `  ${status}  ${p.label}\n        ${p.url}\n        ${preview}`
      );
    } catch (e) {
      console.log(`  ERR  ${p.label}  ${p.url}  ${(e as Error).message}`);
    }
  }
  console.log('\n=== done ===\n');
});
