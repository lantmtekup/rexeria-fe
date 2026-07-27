import type { Block } from '../types';

/**
 * Minimal page descriptor shared by the render surfaces (public route, preview
 * overlay, canvas). Deliberately narrower than `EditorPage` so server
 * components can build it from a raw blueprint without pulling in the editor.
 */
export interface SitePage {
  id: string;
  name: string;
  /** '' for the home page. */
  slug: string;
  isHome: boolean;
  blocks: Block[];
}

/**
 * Read `pages` out of a raw `canvas_blueprint`, defensively.
 *
 * Blueprints written before multi-page have no `pages` key — those become a
 * single home page built from root `blocks`, which is exactly what the public
 * route rendered before. Never throws and never returns an empty array.
 */
export function readSitePages(
  blueprint: Record<string, unknown> | undefined | null
): SitePage[] {
  const rootBlocks = Array.isArray(
    (blueprint as { blocks?: unknown } | undefined)?.blocks
  )
    ? ((blueprint as { blocks: Block[] }).blocks satisfies Block[])
    : [];

  const raw = (blueprint as { pages?: unknown } | undefined)?.pages;
  if (!Array.isArray(raw) || raw.length === 0) {
    return [
      {
        id: 'p_home',
        name: 'Trang chủ',
        slug: '',
        isHome: true,
        blocks: rootBlocks,
      },
    ];
  }

  const pages = raw.map((p, i) => {
    const rec = (p ?? {}) as Record<string, unknown>;
    const isHome = rec.isHome === true || rec.is_home === true;
    return {
      id: typeof rec.id === 'string' ? rec.id : `p_${i}`,
      name: typeof rec.name === 'string' ? rec.name : `Trang ${i + 1}`,
      slug: typeof rec.slug === 'string' ? rec.slug : '',
      isHome,
      // A home entry with no `blocks` key means the blueprint stored home at
      // the root instead of mirroring it.
      blocks: Array.isArray(rec.blocks)
        ? (rec.blocks as Block[])
        : isHome
          ? rootBlocks
          : [],
    };
  });

  // Guarantee exactly one home so callers never have to handle "no home".
  if (!pages.some(p => p.isHome))
    pages[0] = { ...pages[0], isHome: true, slug: '' };
  return pages;
}

export function findHomePage(pages: SitePage[]): SitePage {
  return pages.find(p => p.isHome) ?? pages[0];
}

/** Resolve a sub-path segment (as it appears in `/p/{root}/{sub}`). */
export function findPageBySlug(
  pages: SitePage[],
  slug: string
): SitePage | undefined {
  if (!slug) return findHomePage(pages);
  return pages.find(p => !p.isHome && p.slug === slug);
}

/** Public path for a page of the template published under `rootSlug`. */
export function pagePath(
  rootSlug: string,
  page: Pick<SitePage, 'isHome' | 'slug'>,
  search?: string
): string {
  const base = page.isHome ? `/p/${rootSlug}` : `/p/${rootSlug}/${page.slug}`;
  return search ? `${base}${search}` : base;
}
