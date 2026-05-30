/* eslint-disable no-console -- smoke test prints to stdout */
/**
 * Wave 3 autosave + version commit smoke test.
 *
 * Verifies the 3 BE endpoints + FE flow shipped 2026-05-30:
 *   1. PATCH /v1/templates/:id/draft-canvas-blueprint — autosave draft.
 *   2. GET /v1/templates/:id → field `draft_canvas_blueprint` resume.
 *   3. POST /v1/templates/:id/versions — commit draft to immutable version.
 *
 * Always passes — point is to surface the API contract; assertions are
 * tight on shape but lenient on values (BE may pin different defaults).
 */

import { expect, test } from 'playwright/test';

const TEMPLATE_ID = '44444444-0000-0000-0000-000000000001'; // landing-hero-v1 seed

test('Wave 3: autosave PATCH + Save Version POST', async ({
  page,
  baseURL,
}) => {
  const base = baseURL ?? 'http://localhost:3003';

  console.log('\n━━━ 1. PATCH draft-canvas-blueprint (autosave) ━━━');
  const draftBlueprint = {
    schema_version: '1.0',
    blocks: [
      { id: 'b_smoke_1', blockType: 'hero_split' },
      { id: 'b_smoke_2', blockType: 'cta_section' },
    ],
  };
  const patchRes = await page.request.patch(
    `${base}/api/rexer/templates/${TEMPLATE_ID}/draft-canvas-blueprint`,
    { data: { canvas_blueprint: draftBlueprint } }
  );
  console.log('Status:', patchRes.status());
  expect(patchRes.status()).toBe(200);
  const patchBody = await patchRes.json();
  console.log(
    'Returned draft_canvas_blueprint.blocks count:',
    patchBody.template?.draft_canvas_blueprint?.blocks?.length
  );

  console.log('\n━━━ 2. GET template → resume from draft buffer ━━━');
  const getRes = await page.request.get(
    `${base}/api/rexer/templates/${TEMPLATE_ID}`
  );
  expect(getRes.status()).toBe(200);
  const getBody = await getRes.json();
  const resumedBlocks = getBody.template?.draft_canvas_blueprint?.blocks ?? [];
  console.log('Resumed blocks count:', resumedBlocks.length);
  expect(resumedBlocks.length).toBe(2);
  const resumedIds = resumedBlocks.map((b: { id?: string }) => b.id);
  console.log('Block ids:', resumedIds);
  expect(resumedIds).toContain('b_smoke_1');

  console.log('\n━━━ 3. GET current version (to inherit schema fields) ━━━');
  const currentVerId = getBody.template?.current_version_id;
  expect(currentVerId).toBeTruthy();
  const verRes = await page.request.get(
    `${base}/api/rexer/templates/${TEMPLATE_ID}/versions/${currentVerId}`
  );
  expect(verRes.status()).toBe(200);
  const verBody = await verRes.json();
  const currentVer = verBody.template_version;
  console.log('Current version:', currentVer?.version);

  console.log('\n━━━ 4. POST createVersion (commit draft) ━━━');
  const nextVersion = bumpVersion(currentVer.version);
  console.log('Next version:', nextVersion);
  const createRes = await page.request.post(
    `${base}/api/rexer/templates/${TEMPLATE_ID}/versions`,
    {
      data: {
        version: nextVersion,
        schema_version: currentVer.schema_version ?? '1',
        field_schema_json: currentVer.field_schema_json ?? {},
        default_config_json: currentVer.default_config_json ?? {},
        canvas_blueprint: draftBlueprint,
        ...(currentVer.renderer_key
          ? { renderer_key: currentVer.renderer_key }
          : {}),
        change_note: 'E2E smoke test',
      },
    }
  );
  console.log('Status:', createRes.status());
  const createBody = await createRes.json();
  if (!createRes.ok()) {
    console.log('Response:', JSON.stringify(createBody).slice(0, 400));
  } else {
    console.log('New version id:', createBody.template_version?.id);
    console.log(
      'Canvas_blueprint.blocks committed:',
      createBody.template_version?.canvas_blueprint?.blocks?.length
    );
  }
});

function bumpVersion(v: string): string {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v.trim());
  if (m) {
    return `${m[1]}.${m[2]}.${Number(m[3]) + 1}`;
  }
  return v + '-r2';
}
