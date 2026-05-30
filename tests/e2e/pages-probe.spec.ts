/* eslint-disable no-console -- diagnostic prints to stdout */
/**
 * End-to-end probe Pages namespace với real BE request/response.
 * - POST /v1/workspaces/{wsId}/pages — tạo page từ template seed
 * - GET /v1/pages/{pageId} — capture actual shape
 * - DELETE /v1/pages/{pageId} — cleanup (archive)
 *
 * Goal: confirm body/response shape match FE types + swagger.
 */

import { test } from 'playwright/test';

const WORKSPACE_ID = 'd7e33473-e1ab-46e8-af77-0ebe3976ffde'; // default ws Tekup
const TEMPLATE_ID = '44444444-0000-0000-0000-000000000001'; // landing-hero-v1 seed

test('probe Pages namespace end-to-end', async ({ page, baseURL }) => {
  const base = baseURL ?? 'http://localhost:3000';

  console.log('\n━━━ 0. GET /v1/templates/{id} — lấy current_version_id ━━━');
  const tplRes = await page.request.get(
    `${base}/api/rexer/templates/${TEMPLATE_ID}`
  );
  console.log('Status:', tplRes.status());
  const tplText = await tplRes.text();
  console.log('Response (preview):', tplText.slice(0, 600));
  let currentVersionId = '';
  try {
    const t = JSON.parse(tplText);
    currentVersionId =
      t.current_version?.id ?? t.template?.current_version_id ?? '';
    console.log('current_version_id:', currentVersionId || '(empty!)');
  } catch {
    console.log('Parse failed');
  }

  console.log(
    '\n━━━ 1. POST /v1/workspaces/{wsId}/pages — try v1 (swagger spec) ━━━'
  );
  const createBody = {
    template_id: TEMPLATE_ID,
    name: `e2e-probe-${Date.now()}`,
    type: 'landing',
  };
  console.log('Request body:', JSON.stringify(createBody, null, 2));

  const createRes = await page.request.post(
    `${base}/api/rexer/workspaces/${WORKSPACE_ID}/pages`,
    { data: createBody }
  );
  console.log('\nStatus:', createRes.status());
  const createText = await createRes.text();
  console.log('Response:', createText.slice(0, 500));

  if (!createRes.ok() && currentVersionId) {
    console.log('\n━━━ 2. Retry with explicit template_version_id ━━━');
    const retryBody = { ...createBody, template_version_id: currentVersionId };
    console.log('Request body:', JSON.stringify(retryBody, null, 2));
    const retryRes = await page.request.post(
      `${base}/api/rexer/workspaces/${WORKSPACE_ID}/pages`,
      { data: retryBody }
    );
    console.log('Status:', retryRes.status());
    console.log('Response:', (await retryRes.text()).slice(0, 500));

    console.log(
      '\n━━━ 3. Try with ALL fields including handoff_notes + slug ━━━'
    );
    const fullBody = {
      ...retryBody,
      slug: `e2e-probe-${Date.now()}`,
      description: 'E2E probe page',
      handoff_notes: 'Test from FE probe',
      type_metadata: {},
    };
    console.log('Request body:', JSON.stringify(fullBody, null, 2));
    const fullRes = await page.request.post(
      `${base}/api/rexer/workspaces/${WORKSPACE_ID}/pages`,
      { data: fullBody }
    );
    console.log('Status:', fullRes.status());
    console.log('Response:', (await fullRes.text()).slice(0, 500));

    if (!fullRes.ok()) return;
  } else if (!createRes.ok()) {
    console.log('\n❌ Create failed, no version id to retry');
    return;
  }

  let pageId: string | undefined;
  try {
    const parsed = JSON.parse(createText);
    pageId = parsed.page?.id ?? parsed.id;
    console.log('\nParsed page id:', pageId);
  } catch {
    console.log('\n❌ Cannot parse JSON');
    return;
  }

  if (!pageId) {
    console.log('❌ No page id in response — abort');
    return;
  }

  console.log('\n━━━ 2. GET /v1/pages/{pageId} — load detail ━━━');
  const getRes = await page.request.get(`${base}/api/rexer/pages/${pageId}`);
  console.log('Status:', getRes.status());
  const getText = await getRes.text();
  console.log('Response:', getText);

  console.log('\n━━━ 3. GET /v1/workspaces/{wsId}/pages — re-list ━━━');
  const listRes = await page.request.get(
    `${base}/api/rexer/workspaces/${WORKSPACE_ID}/pages`
  );
  console.log('Status:', listRes.status());
  console.log('Response:', (await listRes.text()).slice(0, 1500));

  console.log('\n━━━ 4. DELETE /v1/pages/{pageId} — cleanup archive ━━━');
  const delRes = await page.request.delete(`${base}/api/rexer/pages/${pageId}`);
  console.log('Status:', delRes.status());
  console.log('Response:', await delRes.text());

  console.log('\n=== Probe done ===\n');
});
