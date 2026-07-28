/**
 * Public sub-page render — `/p/{rootSlug}/{subSlug}`.
 *
 * Also the landing spot for legacy share-token links `/p/{templateId}/{token}`.
 *
 * ## Why one catch-all instead of `[token]` + `[...path]` side by side
 *
 * Next builds both happily — `sorted-routes` keeps `slugName` and
 * `restSlugName` in separate fields, so the "different slug names" error can't
 * fire. But `_smoosh()` orders `'[]'` (dynamic) before `'[...]'` (catch-all)
 * and the matcher is first-wins, so a 2-segment URL ALWAYS lands on `[token]`.
 * Every sub-page would have rendered "Trang này chưa được xuất bản", with no
 * build error to catch it. So the token view is dispatched from here instead.
 *
 * Sub-pages live in the same blueprint as the home page, so this route reuses
 * `fetchPublicPage(rootSlug)` — same React cache, same `page:{slug}` tag, one
 * publish purges everything.
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import {
  findPageBySlug,
  readSitePages,
} from '@/components/modules/block-editor/links/sitePages';

import { fetchPublicPage, publicToPage, seoMetadata } from '../_fetch-page';
import { PublicBlockRender } from '../_block-render';
import { LegacyTokenView } from '../_legacy-token-view';

interface PageProps {
  params: Promise<{ id: string; path: string[] }>;
  searchParams: Promise<{ embed?: string }>;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** `newShareToken()` emits a 24-char base36/hex string; allow a little slack. */
const SHARE_TOKEN_RE = /^[a-z0-9]{16,32}$/;

/**
 * A legacy share link is `/p/{canvas-template-uuid}/{share-token}`.
 *
 * Checked only AFTER `fetchPublicPage` misses, because `SLUG_RE` in
 * PublishDialog accepts UUID-shaped strings — a landing could legitimately be
 * slugged like a UUID, and a real page must always win.
 */
function isLegacyTokenUrl(rootSlug: string, path: string[]): boolean {
  return (
    path.length === 1 && UUID_RE.test(rootSlug) && SHARE_TOKEN_RE.test(path[0])
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id: rootSlug, path } = await params;
  if (path.length !== 1) return {};
  const pub = await fetchPublicPage(rootSlug);
  if (!pub) return {};
  const page = findPageBySlug(readSitePages(pub.canvas_blueprint), path[0]);
  if (!page || page.isHome) return {};
  return seoMetadata(
    pub,
    (page as { seo?: { title?: string } }).seo,
    page.name,
    `/p/${rootSlug}/${page.slug}`
  );
}

export default async function PublicSubPage({
  params,
  searchParams,
}: PageProps) {
  const { id: rootSlug, path } = await params;
  const { embed } = await searchParams;

  // Depth > 1 is not authored yet. `EditorPage.slug` already allows '/', so
  // supporting it later means matching `path.join('/')` here — no route change.
  if (path.length !== 1) notFound();

  const pub = await fetchPublicPage(rootSlug);

  if (pub) {
    const pages = readSitePages(pub.canvas_blueprint);
    const page = findPageBySlug(pages, path[0]);
    // `findPageBySlug('')` returns home, but an explicit sub-slug must never
    // resolve to it — that would give the home page two URLs.
    if (page && !page.isHome && page.blocks.length > 0) {
      return (
        <PublicBlockRender
          page={publicToPage(pub)}
          blueprint={pub.canvas_blueprint ?? {}}
          activePageId={page.id}
          rootSlug={rootSlug}
          brandKit={pub.brand_kit}
          motionKit={pub.motion_kit}
          embed={embed === '1'}
        />
      );
    }
  }

  if (isLegacyTokenUrl(rootSlug, path)) {
    return <LegacyTokenView id={rootSlug} token={path[0]} />;
  }

  notFound();
}
