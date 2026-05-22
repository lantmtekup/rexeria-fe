import { expect, test } from 'playwright/test';

/**
 * Verifies the FE analytics tracker fires events to BE when a visitor lands
 * on `/p/[id]/[token]`. We intercept the POST so we don't depend on BE
 * actually ingesting — just confirms the wiring is alive.
 */

type CanvasData = Record<string, unknown> & {
  publish?: { published: boolean; shareToken?: string; publishedAt?: string };
  blocks?: unknown[];
};

async function pickPublishedTemplate(
  request: import('playwright/test').APIRequestContext,
  baseURL: string
): Promise<{ id: string; token: string }> {
  const listRes = await request.get(
    `${baseURL}/api/rexer/canvas-templates?is_active=true&limit=20`
  );
  const { items } = (await listRes.json()) as {
    items: Array<{ id: string; name?: string }>;
  };
  for (const item of items) {
    if (item.name?.startsWith('[Editing] ')) continue;
    const res = await request.get(
      `${baseURL}/api/rexer/canvas-templates/${item.id}/canvas`
    );
    if (!res.ok()) continue;
    const { canvas_data } = (await res.json()) as { canvas_data: CanvasData };
    const blocks = canvas_data?.blocks;
    if (!Array.isArray(blocks) || blocks.length === 0) continue;
    let token = canvas_data.publish?.shareToken;
    if (!canvas_data.publish?.published || !token) {
      // Publish in place so this test is self-contained.
      const { version } = (await (
        await request.get(
          `${baseURL}/api/rexer/canvas-templates/${item.id}/canvas`
        )
      ).json()) as { canvas_data: CanvasData; version: number };
      token = token ?? Math.random().toString(36).slice(2, 26);
      await request.patch(`${baseURL}/api/rexer/canvas-templates/${item.id}`, {
        data: {
          canvas_data: {
            ...canvas_data,
            publish: {
              published: true,
              shareToken: token,
              publishedAt: new Date().toISOString(),
            },
          },
          version,
        },
      });
    }
    return { id: item.id, token: token as string };
  }
  throw new Error('No publishable template found');
}

test.describe('Analytics tracker', () => {
  test('fires page_view + block_view to /api/rexer/analytics/events', async ({
    page,
    baseURL,
  }) => {
    const base = baseURL ?? 'http://localhost:3000';
    const { id, token } = await pickPublishedTemplate(page.request, base);

    const ingestRequests: Array<{
      events: Array<{ event_type: string; block_id?: string }>;
    }> = [];
    await page.route('**/api/rexer/analytics/events', async route => {
      try {
        const raw = route.request().postData() ?? '[]';
        const parsed = JSON.parse(raw);
        const events = Array.isArray(parsed) ? parsed : [parsed];
        ingestRequests.push({ events });
      } catch {
        // ignore parse errors
      }
      // Mirror BE's 204 — we don't actually need the ingest to succeed.
      await route.fulfill({ status: 204, body: '' });
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/p/${id}/${token}`);

    // Tracker batches; debounce is 5s. Force a flush via pagehide-like flow
    // by waiting and then scrolling so block_view fires.
    await page.waitForSelector('[data-block-id]', { timeout: 15_000 });
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(6_000); // > FLUSH_DEBOUNCE_MS (5s)

    const allEvents = ingestRequests.flatMap(r => r.events);
    expect(
      allEvents.some(e => e.event_type === 'page_view'),
      'page_view should be emitted on mount'
    ).toBe(true);
    expect(
      allEvents.some(e => e.event_type === 'block_view' && !!e.block_id),
      'at least one block_view should be emitted after scroll'
    ).toBe(true);
  });
});
