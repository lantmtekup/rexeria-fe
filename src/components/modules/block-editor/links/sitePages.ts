import { getBlockDef } from '../blocks/_registry/registry';
import { migrateBlockV1toV2 } from '../serialize';
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
 * Chuẩn hoá 1 block thô trong blueprint về `Block` đúng shape.
 *
 * Trước đây hàm này chỉ `as Block[]` — cast nói dối. Blueprint
 * `schema_version: "1.0"` do AI-Insights publish ra chỉ liệt kê
 * `{id, blockType, block_type, isVisible}`, KHÔNG có `contentVi`, nên
 * `block.contentVi.desktop` ở `_block-render` nổ TypeError và cả trang public
 * trả 500 (không phải hỏng 1 section — hỏng cả trang).
 *
 * `migrateBlockV1toV2` lo phần shape (bọc DeviceVariants, luôn có `contentVi`).
 * Block nào không kèm content thì lấy default content của chính block type đó
 * từ registry — blueprint AI-Insights vốn là danh sách block "chọn sẵn, nội
 * dung điền sau", render bằng default mới ra trang có nghĩa thay vì section
 * trắng. Block type lạ (không có trong registry) giữ content rỗng.
 */
function toBlock(raw: unknown): Block {
  const block = migrateBlockV1toV2((raw ?? {}) as Record<string, unknown>);
  if (Object.keys(block.contentVi.desktop ?? {}).length > 0) return block;

  const def = getBlockDef(block.blockType);
  if (!def) return block;
  return {
    ...block,
    contentVi: {
      ...block.contentVi,
      desktop: structuredClone(def.defaultContent.vi),
    },
    contentEn: {
      ...block.contentEn,
      desktop: structuredClone(def.defaultContent.en),
    },
  };
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
    ? (blueprint as { blocks: unknown[] }).blocks.map(toBlock)
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
        ? (rec.blocks as unknown[]).map(toBlock)
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
