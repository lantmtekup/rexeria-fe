/**
 * Link tokens — how a block's link field points at something inside the same
 * template.
 *
 * ```
 *   #page:<pageId>      → another page of this template
 *   #block:<blockId>    → scroll to a block on the current page
 *   <anything else>     → passthrough (https://…, mailto:, tel:, #section-id, '')
 * ```
 *
 * ## Why a `#…` fragment and not `page://id` or `/san-pham`
 *
 * Blocks render links as `href={value || '#'}` and there are several render
 * surfaces (public page, preview overlay, editor canvas, mini thumbnails). If
 * one of them ever misses the resolve step, an unresolved token still has to be
 * harmless. A `#…` fragment pointing at an id that doesn't exist does nothing —
 * no navigation, no 404, no console error. `page://…` leaks as an unknown
 * scheme the browser blocks, and a bare `/san-pham` leaks as a wrong absolute
 * path off the site root, i.e. a real 404.
 *
 * The token is never what ships: `resolveLinksDeep` rewrites it to a real path
 * before render, so crawlers see an ordinary `<a href="/p/root/sub">`.
 *
 * ## Why the id and not the slug
 *
 * Renaming a page's slug must not break every link pointing at it.
 */

export const PAGE_LINK_PREFIX = '#page:';
export const BLOCK_LINK_PREFIX = '#block:';

/** Marker used in `preview` mode so the delegation handler can still read the
 *  target off the DOM while the href stays an inert fragment. */
export const PREVIEW_PAGE_PREFIX = '#__preview-page:';

export type ParsedLink =
  | { kind: 'page'; pageId: string }
  | { kind: 'block'; blockId: string }
  | { kind: 'external'; href: string }
  | { kind: 'none' };

export function formatPageLink(pageId: string): string {
  return `${PAGE_LINK_PREFIX}${pageId}`;
}

export function formatBlockLink(blockId: string): string {
  return `${BLOCK_LINK_PREFIX}${blockId}`;
}

/** Classify a stored link value. Never throws; unknown shapes are `external`. */
export function parseLink(value: unknown): ParsedLink {
  if (typeof value !== 'string') return { kind: 'none' };
  const v = value.trim();
  if (!v || v === '#') return { kind: 'none' };
  if (v.startsWith(PAGE_LINK_PREFIX)) {
    const pageId = v.slice(PAGE_LINK_PREFIX.length);
    return pageId ? { kind: 'page', pageId } : { kind: 'none' };
  }
  if (v.startsWith(BLOCK_LINK_PREFIX)) {
    const blockId = v.slice(BLOCK_LINK_PREFIX.length);
    return blockId ? { kind: 'block', blockId } : { kind: 'none' };
  }
  return { kind: 'external', href: v };
}

/** True for values `resolveLinksDeep` needs to rewrite. Value-driven on
 *  purpose — see the note in `resolveLinks.ts`. */
export function isLinkToken(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    (value.startsWith(PAGE_LINK_PREFIX) || value.startsWith(BLOCK_LINK_PREFIX))
  );
}

/** DOM id given to a block wrapper so `#block:` targets can be scrolled to. */
export function blockAnchorId(blockId: string): string {
  return `blk-${blockId}`;
}

/**
 * Key names that hold a SINGLE link.
 *
 * Used only to decide which authoring control to show — the stored value is
 * still a plain string either way. Singular on purpose: `navLinks` /
 * `footerLinks` are arrays with their own editors, and treating one as a
 * single link would let the toolbar overwrite the whole array with one string.
 *
 * `*Url` is deliberately excluded — that suffix is dominated by image fields
 * (`imageUrl`, `coverUrl`, `coinUrl`, …). A CTA field named `*Url` should
 * declare `fieldType: 'link'` in its registry def instead.
 */
export function isLinkKey(key: string): boolean {
  const leaf = key.split('.').pop() ?? key;
  // Case-insensitive so `ctaLink` matches, but `link$` (not `links$`) keeps
  // plural array fields out.
  return /href$/i.test(leaf) || /(^|[a-z])link$/i.test(leaf);
}

/**
 * True for an already-resolved internal path such as `/p/test-02/san-pham`.
 *
 * Blocks that own their anchor behaviour (nav menus that scroll to a section)
 * must treat these as real navigation, not as a section id. Without it,
 * `PnjStickyMenu` would render `href="#p/test-02/san-pham"` and swallow the
 * click — the link silently does nothing.
 */
export function isInternalPathLink(link: string): boolean {
  const v = link.trim();
  // `//host` is protocol-relative, i.e. external.
  return v.startsWith('/') && !v.startsWith('//');
}
