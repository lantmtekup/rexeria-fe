/**
 * "Publish template as demo landing page" — helpers.
 *
 * Templates (`/admin/templates`) have no public URL of their own; a public
 * `/p/:slug` page always requires a real `Page` (brand/workspace-scoped).
 * For a one-click "share this template as a link" feature we don't want to
 * make the admin pick a real client's brand/workspace — so every demo page
 * lives under the internal Studio brand (seeded, not a real client) in one
 * dedicated workspace that's created on first use.
 *
 * The mapping template → its demo Page is cached client-side (localStorage)
 * so re-publishing the same template reuses the same Page/slug instead of
 * creating a new one every time.
 */

import { rexerApi } from '@/services/rexer/endpoints';
import type { Workspace } from '@/services/rexer/types';

/** Internal Studio brand (seeded, `slug: rexerstudio`) — not a real client. */
export const DEMO_BRAND_ID = 'aaaaaaaa-0000-0000-0000-000000000001';
/** Fixed workspace under the Studio brand that all template demo pages live in. */
export const DEMO_WORKSPACE_SLUG = 'template-demos';

/** Find the shared demo workspace under the Studio brand, creating it on first use. */
export async function getOrCreateDemoWorkspace(): Promise<Workspace> {
  const { items } = await rexerApi.brands.workspaces.list(DEMO_BRAND_ID);
  const existing = items?.find(w => w.slug === DEMO_WORKSPACE_SLUG);
  if (existing) return existing;
  return rexerApi.brands.workspaces.create(DEMO_BRAND_ID, {
    name: 'Template Demos',
    slug: DEMO_WORKSPACE_SLUG,
    description:
      'Auto-created — hosts public demo links published from admin templates.',
  });
}

interface DemoPageMapping {
  pageId: string;
  slug?: string;
}

const mappingKey = (templateId: string) =>
  `rexer:template-demo-page:${templateId}`;

export function getDemoPageMapping(templateId: string): DemoPageMapping | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(mappingKey(templateId));
    return raw ? (JSON.parse(raw) as DemoPageMapping) : null;
  } catch {
    return null;
  }
}

export function setDemoPageMapping(
  templateId: string,
  pageId: string,
  slug?: string
): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    mappingKey(templateId),
    JSON.stringify({ pageId, slug } satisfies DemoPageMapping)
  );
}
