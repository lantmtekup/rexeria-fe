import {
  BLOCK_LINK_PREFIX,
  PAGE_LINK_PREFIX,
  PREVIEW_PAGE_PREFIX,
  blockAnchorId,
} from './linkToken';
import { pagePath, type SitePage } from './sitePages';

/**
 * Rewrite link tokens inside a block's content into real hrefs, just before it
 * is handed to `RenderBlock`.
 *
 * ## Value-driven, never key-driven
 *
 * It is tempting to look at field names (`ctaHref`, `linkHref`, `buttonUrl`)
 * and rewrite those. Don't: the same naming space is full of **image** URLs —
 * `imageUrl`, `coverUrl`, `bgUrl`, `slide1Url`, `mediaUrl`,
 * `floorplanPdfUrl` — and any name-based rule eventually rewrites one of them.
 * Matching on the *value* (`startsWith('#page:')`) cannot touch an image URL,
 * because no image URL starts with `#page:`.
 *
 * ## Structural sharing is required, not an optimisation
 *
 * Blocks pass content arrays straight into `useBlockMotion(ref, build, [
 * content.items ])`. If this function returned fresh objects on every call, the
 * dependency identity would change every render, `gsap.context().revert()`
 * would run, and animations would reset continuously. So every node that has no
 * token below it is returned **by reference**.
 */

export type LinkResolveMode = 'public' | 'preview' | 'canvas';

export interface LinkResolveContext {
  pages: SitePage[];
  /** Public slug of the landing this template is published under. */
  rootSlug: string;
  mode: LinkResolveMode;
  /** Query string to preserve across internal navigation, e.g. `?embed=1`. */
  search?: string;
}

function resolveToken(token: string, ctx: LinkResolveContext): string {
  if (token.startsWith(PAGE_LINK_PREFIX)) {
    const pageId = token.slice(PAGE_LINK_PREFIX.length);
    const page = ctx.pages.find(p => p.id === pageId);
    // Fail closed: a link to a deleted page becomes inert rather than leaking
    // the raw token into the DOM.
    if (!page) return '#';
    if (ctx.mode === 'canvas') return '#';
    // Preview has no router and no real URLs — keep the target readable by the
    // delegation handler while staying an inert fragment.
    if (ctx.mode === 'preview') return `${PREVIEW_PAGE_PREFIX}${page.id}`;
    return pagePath(ctx.rootSlug, page, ctx.search);
  }

  if (token.startsWith(BLOCK_LINK_PREFIX)) {
    const blockId = token.slice(BLOCK_LINK_PREFIX.length);
    if (!blockId) return '#';
    if (ctx.mode === 'canvas') return '#';
    return `#${blockAnchorId(blockId)}`;
  }

  return token;
}

/**
 * Deep-walk `node`, rewriting link tokens. Returns `node` itself when nothing
 * changed, so React/GSAP dependency identity is preserved.
 */
export function resolveLinksDeep<T>(node: T, ctx: LinkResolveContext): T {
  if (typeof node === 'string') {
    if (
      !node.startsWith(PAGE_LINK_PREFIX) &&
      !node.startsWith(BLOCK_LINK_PREFIX)
    ) {
      return node;
    }
    return resolveToken(node, ctx) as unknown as T;
  }

  if (Array.isArray(node)) {
    let changed = false;
    const next = node.map(item => {
      const res = resolveLinksDeep(item, ctx);
      if (res !== item) changed = true;
      return res;
    });
    return (changed ? next : node) as unknown as T;
  }

  if (node && typeof node === 'object') {
    // Only walk plain objects. React elements, Dates, class instances etc. are
    // never link carriers and cloning them would break identity for no gain.
    const proto = Object.getPrototypeOf(node);
    if (proto !== Object.prototype && proto !== null) return node;

    let changed = false;
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      const res = resolveLinksDeep(value, ctx);
      if (res !== value) changed = true;
      out[key] = res;
    }
    return (changed ? out : node) as unknown as T;
  }

  return node;
}
