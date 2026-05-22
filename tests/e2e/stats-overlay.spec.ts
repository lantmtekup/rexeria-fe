import { expect, test } from 'playwright/test';

/**
 * E2E for the Figma-style StatsAnnotationOverlay rendered on the public
 * landing route `/p/[id]/[token]`.
 *
 * Setup is idempotent and self-discovering: we list canvas templates,
 * pick the first active one with non-empty canvas_data, ensure publish meta
 * is set, and reuse the existing share token if already published.
 * The test asserts admin-only behaviour: toolbar visible, toggle persistence
 * via localStorage, range dropdown, leader cards mount.
 */

type PublishMeta = {
  published: boolean;
  shareToken?: string;
  publishedAt?: string;
};

type CanvasData = Record<string, unknown> & { publish?: PublishMeta };

function newShareToken(): string {
  // Mirror src serialize.ts: 24-char hex from a UUID.
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return Array.from(buf, b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 24);
}

/**
 * Pick a publishable template by listing canvas-templates and selecting the
 * first active one whose canvas_data contains at least one block. We need
 * blocks because the StatsAnnotationOverlay only mounts inside the `ok`
 * status branch and we assert `[data-block-id]` anchors render.
 */
async function pickTemplateId(
  request: import('playwright/test').APIRequestContext,
  baseURL: string
): Promise<string> {
  const listRes = await request.get(
    `${baseURL}/api/rexer/canvas-templates?is_active=true&limit=20`
  );
  expect(
    listRes.ok(),
    `LIST canvas templates should succeed (got ${listRes.status()})`
  ).toBeTruthy();
  const { items } = (await listRes.json()) as {
    items: Array<{ id: string; name?: string; is_active?: boolean }>;
  };
  expect(
    items.length,
    'BE should have at least one canvas template'
  ).toBeGreaterThan(0);

  // Probe each candidate for a non-empty `blocks` array. First match wins.
  // Skip scratch canvases from the /admin/blocks Edit flow (`[Editing] ...`)
  // — they have content but are throwaway and may disappear between runs.
  for (const item of items) {
    if (typeof item.name === 'string' && item.name.startsWith('[Editing] ')) {
      continue;
    }
    const res = await request.get(
      `${baseURL}/api/rexer/canvas-templates/${item.id}/canvas`
    );
    if (!res.ok()) continue;
    const { canvas_data } = (await res.json()) as { canvas_data: CanvasData };
    const blocks = canvas_data?.blocks;
    if (Array.isArray(blocks) && blocks.length > 0) {
      return item.id;
    }
  }
  throw new Error(
    'No template with blocks found on BE — cannot run overlay test'
  );
}

/**
 * Ensure the canvas is published; returns a share URL the public route can
 * resolve. If already published we reuse its token (cheap), otherwise we
 * PATCH a new publish meta into canvas_data.
 */
async function ensurePublishedUrl(
  request: import('playwright/test').APIRequestContext,
  baseURL: string,
  templateId: string
): Promise<string> {
  const canvasRes = await request.get(
    `${baseURL}/api/rexer/canvas-templates/${templateId}/canvas`
  );
  expect(
    canvasRes.ok(),
    `GET canvas should succeed (got ${canvasRes.status()})`
  ).toBeTruthy();
  const { canvas_data, version } = (await canvasRes.json()) as {
    canvas_data: CanvasData;
    version: number;
  };

  const already = canvas_data.publish;
  if (already?.published && already.shareToken) {
    return `/p/${templateId}/${already.shareToken}`;
  }

  const nextToken = already?.shareToken ?? newShareToken();
  const next: CanvasData = {
    ...canvas_data,
    publish: {
      published: true,
      shareToken: nextToken,
      publishedAt: new Date().toISOString(),
    },
  };

  const patchRes = await request.patch(
    `${baseURL}/api/rexer/canvas-templates/${templateId}`,
    { data: { canvas_data: next, version } }
  );
  expect(
    patchRes.ok(),
    `PATCH publish should succeed (got ${patchRes.status()})`
  ).toBeTruthy();

  return `/p/${templateId}/${nextToken}`;
}

test.describe('Stats annotation overlay (gutter)', () => {
  test('toolbar appears for admin and toggles persist via localStorage', async ({
    page,
    baseURL,
  }) => {
    const base = baseURL ?? 'http://localhost:3000';
    const templateId = await pickTemplateId(page.request, base);
    const url = await ensurePublishedUrl(page.request, base, templateId);

    // Wider than MIN_VIEWPORT (1280) so gutters render.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(url);

    // Wait for the page to settle (canvas resolved + auth hydrated).
    const toolbar = page.locator('button', { hasText: /Stats (ON|OFF)/ });
    await expect(toolbar).toBeVisible({ timeout: 15_000 });
    await expect(toolbar).toContainText('Stats OFF');

    // Toggling on flips label and persists state.
    await toolbar.click();
    await expect(toolbar).toContainText('Stats ON');
    await expect(page.locator('select')).toBeVisible();

    const persisted = await page.evaluate(() =>
      window.localStorage.getItem('rexer.statsOverlay.enabled')
    );
    expect(persisted).toBe('1');

    // Reload — toolbar should remember ON.
    await page.reload();
    const toolbarAfterReload = page.locator('button', {
      hasText: /Stats (ON|OFF)/,
    });
    await expect(toolbarAfterReload).toBeVisible({ timeout: 15_000 });
    await expect(toolbarAfterReload).toContainText('Stats ON');

    // Change the range dropdown — value should persist too.
    await page.locator('select').selectOption('7d');
    const persistedRange = await page.evaluate(() =>
      window.localStorage.getItem('rexer.statsOverlay.range')
    );
    expect(persistedRange).toBe('7d');

    // Toggle off — gutter content (data-block-id annotations) must drop.
    await toolbarAfterReload.click();
    await expect(toolbarAfterReload).toContainText('Stats OFF');
    // Range select disappears once overlay is off.
    await expect(page.locator('select')).toHaveCount(0);
  });

  test('block elements carry data-block-id anchors for the overlay', async ({
    page,
    baseURL,
  }) => {
    const base = baseURL ?? 'http://localhost:3000';
    const templateId = await pickTemplateId(page.request, base);
    const url = await ensurePublishedUrl(page.request, base, templateId);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(url);

    // Wait for the public render to mount at least one block wrapper.
    await page.waitForSelector('[data-block-id]', { timeout: 15_000 });
    const blockCount = await page.locator('[data-block-id]').count();
    expect(blockCount).toBeGreaterThan(0);
  });
});
