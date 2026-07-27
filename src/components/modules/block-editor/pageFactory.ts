import { genId, genPageId } from './ids';
import { slugifyPageName, type EditorPage } from './serialize';
import type { Block } from './types';

/**
 * Factory helpers for `EditorPage` — the pages *inside one template's canvas*,
 * not the BE `Page` entity. See the naming note in `serialize.ts`.
 */

/** "Trang 2", "Trang 3", … skipping names already taken. */
export function nextPageName(pages: EditorPage[]): string {
  const taken = new Set(pages.map(p => p.name.trim().toLowerCase()));
  let n = pages.length + 1;
  while (taken.has(`trang ${n}`)) n += 1;
  return `Trang ${n}`;
}

/** Ensure `slug` is unique among `pages` by appending -2, -3, … */
function uniqueSlug(pages: EditorPage[], slug: string): string {
  const taken = new Set(pages.map(p => p.slug).filter(Boolean));
  if (!taken.has(slug)) return slug;
  let n = 2;
  while (taken.has(`${slug}-${n}`)) n += 1;
  return `${slug}-${n}`;
}

/** A new, empty, non-home page. Blocks are added by the user afterwards. */
export function createPage(pages: EditorPage[], name?: string): EditorPage {
  const finalName = name?.trim() || nextPageName(pages);
  const base = slugifyPageName(finalName) || 'trang';
  return {
    id: genPageId(),
    name: finalName,
    slug: uniqueSlug(pages, base),
    isHome: false,
    blocks: [],
  };
}

/**
 * Deep clone a page, **re-iding every block**.
 *
 * Re-iding is mandatory, not hygiene: block ids are the `data-block-id`
 * analytics key on the public render, and `mutateBlock` finds blocks by id — a
 * duplicate id means edits land on the wrong block and analytics conflates two
 * blocks into one.
 *
 * The clone is never home: a template has exactly one home page.
 */
export function duplicatePageDeep(
  pages: EditorPage[],
  source: EditorPage
): EditorPage {
  const name = `${source.name} (bản sao)`;
  const blocks = (structuredClone(source.blocks) as Block[]).map(b => ({
    ...b,
    id: genId(),
  }));
  return {
    ...structuredClone({ ...source, blocks: [] as Block[] }),
    id: genPageId(),
    name,
    slug: uniqueSlug(pages, slugifyPageName(name) || 'trang'),
    isHome: false,
    blocks,
  };
}
