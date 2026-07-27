/**
 * Checks for the multi-page canvas schema layer (`serialize.ts` + `pageFactory`).
 *
 * The repo has no unit-test runner, so this follows the `sync-motion-catalog`
 * convention: a plain TS script run with `npx tsx`. Wired as `yarn check:pages`.
 *
 * What it guards — every item here is a silent failure, not a type error:
 *   - legacy blueprints (no `pages`) still parse into exactly one home page
 *   - the root `blocks` mirror stays in sync with `pages[home]`
 *   - `normalizePages` invariants hold for malformed input
 *   - a page duplicate never reuses block ids
 */

import assert from 'node:assert/strict';

import {
  DEFAULT_PAGE_ID,
  normalizePages,
  parseCanvas,
  serializeCanvas,
  serializeCanvasPages,
  slugifyPageName,
  type EditorPage,
} from '../src/components/modules/block-editor/serialize';
import {
  createPage,
  duplicatePageDeep,
} from '../src/components/modules/block-editor/pageFactory';
import {
  canvasReducer,
  createCanvasState,
  type CanvasState,
} from '../src/components/modules/block-editor/hooks/useCanvasState';
import {
  formatBlockLink,
  formatPageLink,
  isInternalPathLink,
  isLinkKey,
  parseLink,
} from '../src/components/modules/block-editor/links/linkToken';
import { resolveLinksDeep } from '../src/components/modules/block-editor/links/resolveLinks';
import {
  findPageBySlug,
  readSitePages,
  type SitePage,
} from '../src/components/modules/block-editor/links/sitePages';
import type { Block } from '../src/components/modules/block-editor/types';

let passed = 0;
function check(name: string, fn: () => void): void {
  try {
    fn();
    passed += 1;
  } catch (err) {
    console.error(`\n✗ ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

function block(id: string): Block {
  return {
    id,
    blockType: 'hero_split',
    name: `Block ${id}`,
    isVisible: true,
    contentVi: { desktop: {} },
    contentEn: { desktop: {} },
  } as Block;
}

function page(over: Partial<EditorPage> = {}): EditorPage {
  return {
    id: 'p_x',
    name: 'Trang',
    slug: 'trang',
    isHome: false,
    blocks: [],
    ...over,
  };
}

// ── parseCanvas: legacy (pre-multi-page) blueprints ────────────────────────

check('legacy blueprint → exactly one implicit home page', () => {
  const parsed = parseCanvas(
    serializeCanvas([block('b1'), block('b2')], undefined, undefined, 'fade')
  );
  assert.ok(parsed);
  assert.equal(parsed.pages.length, 1);
  assert.equal(parsed.pages[0].id, DEFAULT_PAGE_ID);
  assert.equal(parsed.pages[0].isHome, true);
  assert.equal(parsed.pages[0].slug, '');
  assert.equal(parsed.pages[0].blocks.length, 2);
  assert.equal(parsed.activePageId, DEFAULT_PAGE_ID);
  // Legacy top-level fields must survive untouched.
  assert.equal(parsed.transition, 'fade');
});

check('empty `pages: []` falls back to root blocks', () => {
  const wire = serializeCanvas([block('b1')]);
  wire.pages = [];
  const parsed = parseCanvas(wire);
  assert.ok(parsed);
  assert.equal(parsed.pages.length, 1);
  assert.equal(parsed.pages[0].blocks.length, 1);
});

check('non-canvas payload still returns null', () => {
  assert.equal(parseCanvas({ foo: 'bar' }), null);
  assert.equal(parseCanvas(undefined), null);
});

// ── Round-trip: multi-page ─────────────────────────────────────────────────

check('multi-page round-trip preserves every page', () => {
  const pages: EditorPage[] = [
    page({
      id: 'p_home',
      name: 'Trang chủ',
      isHome: true,
      blocks: [block('h1')],
    }),
    page({
      id: 'p_list',
      name: 'Danh sách',
      slug: 'san-pham',
      blocks: [block('l1'), block('l2')],
    }),
    page({
      id: 'p_det',
      name: 'Chi tiết',
      slug: 'chi-tiet',
      blocks: [block('d1')],
    }),
  ];
  const wire = serializeCanvasPages({ pages, activePageId: 'p_list' });
  const parsed = parseCanvas(wire);
  assert.ok(parsed);
  assert.equal(parsed.pages.length, 3);
  assert.deepEqual(
    parsed.pages.map(p => p.slug),
    ['', 'san-pham', 'chi-tiet']
  );
  assert.equal(parsed.activePageId, 'p_list');
  assert.equal(parsed.pages[1].blocks.length, 2);
});

check('root `blocks` mirrors the home page (legacy readers)', () => {
  const pages: EditorPage[] = [
    page({ id: 'p_a', name: 'A', slug: 'a', blocks: [block('a1')] }),
    // Home is NOT first — the mirror must follow isHome, not index 0.
    page({
      id: 'p_h',
      name: 'Home',
      isHome: true,
      blocks: [block('h1'), block('h2')],
    }),
  ];
  const wire = serializeCanvasPages({ pages });
  const rootBlocks = wire.blocks as Block[];
  assert.equal(rootBlocks.length, 2);
  assert.deepEqual(
    rootBlocks.map(b => b.id),
    ['h1', 'h2']
  );

  const parsed = parseCanvas(wire);
  assert.ok(parsed);
  // `blocks` is the legacy view and must equal the home page's blocks.
  assert.equal(parsed.blocks, parsed.pages.find(p => p.isHome)!.blocks);
});

check('homeMirror:false drops the mirror but keeps pages intact', () => {
  const pages: EditorPage[] = [
    page({ id: 'p_h', name: 'Home', isHome: true, blocks: [block('h1')] }),
  ];
  const wire = serializeCanvasPages({ pages, homeMirror: false });
  assert.equal((wire.blocks as Block[]).length, 0);
  const parsed = parseCanvas(wire);
  assert.ok(parsed);
  assert.equal(parsed.pages[0].blocks.length, 1);
});

check('home entry without `blocks` reads the root mirror', () => {
  // The "home lives at root" layout we deliberately did NOT adopt — parse must
  // still read it so the mirror decision stays reversible.
  const wire = serializeCanvas([block('h1'), block('h2')]);
  wire.pages = [
    { id: 'p_h', name: 'Home', slug: '', isHome: true },
    { id: 'p_b', name: 'B', slug: 'b', blocks: [] },
  ];
  const parsed = parseCanvas(wire);
  assert.ok(parsed);
  assert.equal(parsed.pages[0].blocks.length, 2);
});

check('snake_case `is_home` is accepted on read', () => {
  const wire = serializeCanvas([]);
  wire.pages = [
    { id: 'p_a', name: 'A', slug: 'a', blocks: [] },
    { id: 'p_h', name: 'H', slug: '', is_home: true, blocks: [block('h1')] },
  ];
  const parsed = parseCanvas(wire);
  assert.ok(parsed);
  assert.equal(parsed.pages.find(p => p.isHome)!.id, 'p_h');
});

// ── normalizePages invariants ──────────────────────────────────────────────

check('no isHome → pages[0] is promoted and gets slug ""', () => {
  const out = normalizePages([
    page({ id: 'a', slug: 'a' }),
    page({ id: 'b', slug: 'b' }),
  ]);
  assert.equal(out[0].isHome, true);
  assert.equal(out[0].slug, '');
  assert.equal(out.filter(p => p.isHome).length, 1);
});

check('multiple isHome → first claimant wins', () => {
  const out = normalizePages([
    page({ id: 'a', isHome: true }),
    page({ id: 'b', isHome: true }),
    page({ id: 'c', isHome: true }),
  ]);
  assert.equal(out.filter(p => p.isHome).length, 1);
  assert.equal(out[0].id, 'a');
  assert.notEqual(out[1].slug, '');
});

check('duplicate slugs are deduped', () => {
  const out = normalizePages([
    page({ id: 'h', isHome: true }),
    page({ id: 'a', slug: 'sp' }),
    page({ id: 'b', slug: 'sp' }),
    page({ id: 'c', slug: 'sp' }),
  ]);
  const slugs = out.slice(1).map(p => p.slug);
  assert.equal(new Set(slugs).size, 3, `slugs collided: ${slugs.join(',')}`);
});

check('empty input yields one default home page', () => {
  const out = normalizePages([]);
  assert.equal(out.length, 1);
  assert.equal(out[0].id, DEFAULT_PAGE_ID);
  assert.equal(out[0].isHome, true);
});

check('non-home page with blank name/slug still gets a slug', () => {
  const out = normalizePages([
    page({ id: 'h', isHome: true }),
    page({ id: 'x', name: '', slug: '' }),
  ]);
  assert.ok(out[1].slug.length > 0);
});

// ── slugify ────────────────────────────────────────────────────────────────

check('slugifyPageName handles Vietnamese diacritics and đ', () => {
  assert.equal(slugifyPageName('Danh sách sản phẩm'), 'danh-sach-san-pham');
  assert.equal(slugifyPageName('Đặt hàng'), 'dat-hang');
  assert.equal(slugifyPageName('  Chi  tiết!! '), 'chi-tiet');
  assert.equal(slugifyPageName('***'), '');
});

// ── pageFactory ────────────────────────────────────────────────────────────

check('createPage never collides with an existing slug', () => {
  const pages = [
    page({ id: 'h', isHome: true }),
    page({ id: 'a', slug: 'trang-2' }),
  ];
  const created = createPage(pages, 'Trang 2');
  assert.notEqual(created.slug, 'trang-2');
  assert.equal(created.isHome, false);
});

check('duplicatePageDeep re-ids every block and deep-clones content', () => {
  const src = page({
    id: 'p_src',
    name: 'Danh sách',
    slug: 'san-pham',
    blocks: [block('b1'), block('b2')],
  });
  const dup = duplicatePageDeep([src], src);

  assert.notEqual(dup.id, src.id);
  assert.equal(dup.isHome, false);
  assert.notEqual(dup.slug, src.slug);

  const srcIds = new Set(src.blocks.map(b => b.id));
  for (const b of dup.blocks) {
    assert.ok(
      !srcIds.has(b.id),
      `block id ${b.id} was reused in the duplicate`
    );
  }
  assert.equal(dup.blocks.length, src.blocks.length);
  // Deep clone: mutating the copy must not touch the source.
  (dup.blocks[0].contentVi.desktop as Record<string, unknown>).title =
    'changed';
  assert.equal(
    (src.blocks[0].contentVi.desktop as Record<string, unknown>).title,
    undefined
  );
});

check('duplicating the home page yields a non-home copy', () => {
  const home = page({ id: 'p_h', name: 'Trang chủ', slug: '', isHome: true });
  const dup = duplicatePageDeep([home], home);
  assert.equal(dup.isHome, false);
  assert.notEqual(dup.slug, '');
});

// ── Reducer: the three silent failure modes ────────────────────────────────

function twoPageState(): CanvasState {
  return canvasReducer(createCanvasState([block('h1'), block('h2')], 'h1'), {
    type: 'resetPages',
    pages: [
      page({
        id: 'p_h',
        name: 'Home',
        slug: '',
        isHome: true,
        blocks: [block('h1'), block('h2')],
      }),
      page({
        id: 'p_b',
        name: 'B',
        slug: 'b',
        blocks: [block('x1'), block('x2'), block('x3')],
      }),
    ],
    activePageId: 'p_h',
    activeId: 'h1',
  });
}

check('BUG 1 — replaceBlocks actually replaces (dnd reorder)', () => {
  // `replaceBlocks` dispatches `mutate` with a recipe that RETURNS the new
  // array. If the producer's return value isn't assigned to `p.blocks`, this
  // is a silent no-op and every dnd-kit block reorder stops working.
  let s = twoPageState();
  const reordered = [block('h2'), block('h1')];
  s = canvasReducer(s, { type: 'mutate', recipe: () => reordered });
  const home = s.pages.find(p => p.id === 'p_h')!;
  assert.deepEqual(
    home.blocks.map(b => b.id),
    ['h2', 'h1']
  );
  // …and it must not have leaked into the other page.
  assert.equal(s.pages.find(p => p.id === 'p_b')!.blocks.length, 3);
  assert.equal(s.undoStack.length, 1);
});

check('BUG 2 — editing still works after switching page', () => {
  // With a single flat activeId, `mutateActive` would dispatch an id belonging
  // to the previous page: `find` misses, produce is a no-op, and every
  // keystroke silently does nothing while the canvas shows blocks[0].
  let s = twoPageState();
  s = canvasReducer(s, { type: 'setActivePage', id: 'p_b' });
  assert.equal(
    s.activeByPage['p_b'],
    'x1',
    'active block should resolve per page'
  );

  s = canvasReducer(s, {
    type: 'mutateBlock',
    id: s.activeByPage['p_b']!,
    recipe: b => {
      b.name = 'edited';
    },
  });
  assert.equal(s.pages.find(p => p.id === 'p_b')!.blocks[0].name, 'edited');
  // Home page's own selection survived the round trip.
  assert.equal(s.activeByPage['p_h'], 'h1');
});

check('BUG 2b — setActiveId cannot select a block from another page', () => {
  let s = twoPageState();
  s = canvasReducer(s, { type: 'setActivePage', id: 'p_b' });
  const before = s.activeByPage['p_b'];
  s = canvasReducer(s, { type: 'setActiveId', id: 'h1' }); // home's block
  assert.equal(s.activeByPage['p_b'], before);
});

check('BUG 3 — replacePageBlocks keeps other pages (AI apply)', () => {
  let s = twoPageState();
  s = canvasReducer(s, {
    type: 'replacePageBlocks',
    pageId: 'p_h',
    blocks: [block('new1')],
  });
  assert.equal(s.pages.length, 2);
  assert.equal(s.pages.find(p => p.id === 'p_h')!.blocks.length, 1);
  assert.equal(s.pages.find(p => p.id === 'p_b')!.blocks.length, 3);
});

check('BUG 3b — reset() deliberately collapses to one page', () => {
  let s = twoPageState();
  s = canvasReducer(s, { type: 'reset', blocks: [block('z1')] });
  assert.equal(s.pages.length, 1);
  assert.equal(s.pages[0].id, DEFAULT_PAGE_ID);
  assert.equal(s.undoStack.length, 0, 'reset wipes history');
});

// ── Reducer: undo/redo across pages ────────────────────────────────────────

check('undo restores the page the edit happened on', () => {
  let s = twoPageState();
  s = canvasReducer(s, { type: 'setActivePage', id: 'p_b' });
  s = canvasReducer(s, {
    type: 'mutateBlock',
    id: 'x1',
    recipe: b => {
      b.name = 'edited';
    },
  });
  // Navigate away, then undo — we must land back on p_b to see the change.
  s = canvasReducer(s, { type: 'setActivePage', id: 'p_h' });
  s = canvasReducer(s, { type: 'undo' });
  assert.equal(s.activePageId, 'p_b');
  assert.equal(s.pages.find(p => p.id === 'p_b')!.blocks[0].name, 'Block x1');

  s = canvasReducer(s, { type: 'redo' });
  assert.equal(s.pages.find(p => p.id === 'p_b')!.blocks[0].name, 'edited');
});

check('page switching is navigation, not an undo step', () => {
  let s = twoPageState();
  s = canvasReducer(s, { type: 'setActivePage', id: 'p_b' });
  s = canvasReducer(s, { type: 'setActiveId', id: 'x2' });
  assert.equal(s.undoStack.length, 0);
});

check('structural ops are undoable', () => {
  let s = twoPageState();
  s = canvasReducer(s, { type: 'removePage', id: 'p_b' });
  assert.equal(s.pages.length, 1);
  s = canvasReducer(s, { type: 'undo' });
  assert.equal(s.pages.length, 2);
  assert.ok(s.pages.some(p => p.id === 'p_b'));
});

check('history is capped', () => {
  let s = twoPageState();
  for (let i = 0; i < 60; i += 1) {
    s = canvasReducer(s, {
      type: 'mutateBlock',
      id: 'h1',
      recipe: b => {
        b.name = `n${i}`;
      },
    });
  }
  assert.ok(
    s.undoStack.length <= 50,
    `undoStack grew to ${s.undoStack.length}`
  );
});

// ── Reducer: page CRUD ─────────────────────────────────────────────────────

check('cannot remove the last page', () => {
  let s = createCanvasState([block('h1')], 'h1');
  s = canvasReducer(s, { type: 'removePage', id: DEFAULT_PAGE_ID });
  assert.equal(s.pages.length, 1);
});

check('removing the active page lands on its neighbour', () => {
  let s = twoPageState();
  s = canvasReducer(s, { type: 'setActivePage', id: 'p_b' });
  s = canvasReducer(s, { type: 'removePage', id: 'p_b' });
  assert.equal(s.activePageId, 'p_h');
  assert.equal(s.activeByPage['p_b'], undefined, 'stale selection was dropped');
});

check('removing the home page promotes another to home', () => {
  let s = twoPageState();
  s = canvasReducer(s, { type: 'removePage', id: 'p_h' });
  assert.equal(s.pages.length, 1);
  assert.equal(s.pages[0].isHome, true);
  assert.equal(s.pages[0].slug, '');
});

check('setHomePage swaps slugs both ways', () => {
  let s = twoPageState();
  s = canvasReducer(s, { type: 'setHomePage', id: 'p_b' });
  const b = s.pages.find(p => p.id === 'p_b')!;
  const h = s.pages.find(p => p.id === 'p_h')!;
  assert.equal(b.isHome, true);
  assert.equal(b.slug, '');
  assert.equal(h.isHome, false);
  assert.ok(h.slug.length > 0, 'old home must get a real slug');
});

check('addPage selects the new page and keeps blocks empty', () => {
  let s = twoPageState();
  s = canvasReducer(s, { type: 'addPage', name: 'Chi tiết' });
  assert.equal(s.pages.length, 3);
  const created = s.pages.find(p => p.name === 'Chi tiết')!;
  assert.equal(s.activePageId, created.id);
  assert.equal(created.blocks.length, 0);
  assert.equal(created.isHome, false);
});

check(
  'duplicatePage inserts right after the source with fresh block ids',
  () => {
    let s = twoPageState();
    s = canvasReducer(s, { type: 'duplicatePage', id: 'p_b' });
    assert.equal(s.pages.length, 3);
    assert.equal(s.pages[2].id, s.activePageId, 'copy sits after its source');
    const srcIds = new Set(s.pages[1].blocks.map(b => b.id));
    for (const b of s.pages[2].blocks) assert.ok(!srcIds.has(b.id));
  }
);

// ── Link resolution ────────────────────────────────────────────────────────

const SITE: SitePage[] = [
  { id: 'p_h', name: 'Trang chủ', slug: '', isHome: true, blocks: [] },
  { id: 'p_l', name: 'Danh sách', slug: 'san-pham', isHome: false, blocks: [] },
];
const PUBLIC_CTX = {
  pages: SITE,
  rootSlug: 'rolex-2026',
  mode: 'public' as const,
};

check('page token resolves to a real public path', () => {
  const out = resolveLinksDeep(
    { ctaHref: formatPageLink('p_l'), title: 'Xem' },
    PUBLIC_CTX
  );
  assert.equal(out.ctaHref, '/p/rolex-2026/san-pham');
  assert.equal(out.title, 'Xem');
});

check('home token resolves to the root path (no trailing slug)', () => {
  const out = resolveLinksDeep({ h: formatPageLink('p_h') }, PUBLIC_CTX);
  assert.equal(out.h, '/p/rolex-2026');
});

check('?embed=1 survives internal navigation', () => {
  const out = resolveLinksDeep(
    { h: formatPageLink('p_l') },
    { ...PUBLIC_CTX, search: '?embed=1' }
  );
  assert.equal(out.h, '/p/rolex-2026/san-pham?embed=1');
});

check('deleted page fails closed to "#" — never leaks the token', () => {
  const out = resolveLinksDeep({ h: formatPageLink('p_gone') }, PUBLIC_CTX);
  assert.equal(out.h, '#');
});

check('block token becomes an anchor; canvas mode inerts everything', () => {
  assert.equal(
    resolveLinksDeep({ h: formatBlockLink('b7') }, PUBLIC_CTX).h,
    '#blk-b7'
  );
  const canvas = resolveLinksDeep(
    { a: formatBlockLink('b7'), b: formatPageLink('p_l') },
    { ...PUBLIC_CTX, mode: 'canvas' }
  );
  assert.equal(canvas.a, '#');
  assert.equal(canvas.b, '#');
});

check('preview mode keeps the target readable but inert', () => {
  const out = resolveLinksDeep(
    { h: formatPageLink('p_l') },
    { ...PUBLIC_CTX, mode: 'preview' }
  );
  assert.equal(out.h, '#__preview-page:p_l');
  assert.ok((out.h as string).startsWith('#'), 'must stay a fragment');
});

check('IMAGE urls are never touched (value-driven, not key-driven)', () => {
  const content = {
    imageUrl: 'https://cdn/x.png',
    coverUrl: '/local/cover.jpg',
    ctaHref: 'https://example.com',
    linkHref: '#discover',
    mailto: 'mailto:a@b.c',
    empty: '',
  };
  assert.equal(resolveLinksDeep(content, PUBLIC_CTX), content);
});

check('STRUCTURAL SHARING — no token means the same reference back', () => {
  // Load-bearing: block content arrays are GSAP effect dependencies. A new
  // identity every render would revert() and restart every animation.
  const items = [{ label: 'A', href: 'https://a' }, { label: 'B' }];
  const content = { title: 'T', items, nested: { deep: { n: 1 } } };
  const out = resolveLinksDeep(content, PUBLIC_CTX);
  assert.equal(out, content, 'root identity must be preserved');
  assert.equal(out.items, items, 'array identity must be preserved');
});

check('STRUCTURAL SHARING — untouched siblings keep their identity', () => {
  const items = [{ label: 'A', href: 'https://a' }];
  const content = { items, cta: formatPageLink('p_l') };
  const out = resolveLinksDeep(content, PUBLIC_CTX);
  assert.notEqual(out, content, 'root must be a new object — cta changed');
  assert.equal(out.items, items, 'the untouched branch must be shared');
  assert.equal(out.cta, '/p/rolex-2026/san-pham');
});

check('tokens nested in arrays of objects resolve', () => {
  const content = {
    navLinks: [
      { label: 'Trang chủ', href: formatPageLink('p_h') },
      { label: 'Sản phẩm', href: formatPageLink('p_l') },
      { label: 'FB', href: 'https://facebook.com' },
    ],
  };
  const out = resolveLinksDeep(content, PUBLIC_CTX);
  assert.deepEqual(
    out.navLinks.map(l => l.href),
    ['/p/rolex-2026', '/p/rolex-2026/san-pham', 'https://facebook.com']
  );
});

check('parseLink round-trips every kind', () => {
  assert.deepEqual(parseLink(formatPageLink('p_l')), {
    kind: 'page',
    pageId: 'p_l',
  });
  assert.deepEqual(parseLink(formatBlockLink('b1')), {
    kind: 'block',
    blockId: 'b1',
  });
  assert.deepEqual(parseLink('https://x.com'), {
    kind: 'external',
    href: 'https://x.com',
  });
  assert.deepEqual(parseLink(''), { kind: 'none' });
  assert.deepEqual(parseLink('#'), { kind: 'none' });
  assert.deepEqual(parseLink(undefined), { kind: 'none' });
});

check('isInternalPathLink separates nav paths from section ids', () => {
  // Nav blocks (PnjStickyMenu, DelvauxSubnav) treat a non-URL value as an
  // in-page section id. Without this predicate they render
  // `href="#p/test-02/san-pham"` and swallow the click — the link silently
  // does nothing.
  assert.equal(isInternalPathLink('/p/test-02/san-pham'), true);
  assert.equal(isInternalPathLink('/p/test-02'), true);
  // Section ids and external URLs must NOT be treated as navigation.
  assert.equal(isInternalPathLink('discover'), false);
  assert.equal(isInternalPathLink('#contact'), false);
  assert.equal(isInternalPathLink(''), false);
  assert.equal(isInternalPathLink('https://example.com'), false);
  assert.equal(isInternalPathLink('mailto:a@b.c'), false);
  // Protocol-relative is external, not an internal path.
  assert.equal(isInternalPathLink('//cdn.example.com/x'), false);
});

check('a page link resolves into something nav blocks will navigate on', () => {
  const out = resolveLinksDeep({ link: formatPageLink('p_l') }, PUBLIC_CTX);
  assert.equal(out.link, '/p/rolex-2026/san-pham');
  assert.equal(
    isInternalPathLink(out.link as string),
    true,
    'resolved page links must satisfy the nav-block predicate'
  );
});

check('isLinkKey picks single link fields, never link ARRAYS', () => {
  for (const k of [
    'ctaHref',
    'linkHref',
    'logoHref',
    'nextHref',
    'ctaLink',
    'link',
    'primaryLink',
    'items[0].link',
    'navLinks[2].href',
  ]) {
    assert.equal(isLinkKey(k), true, `${k} should be a link field`);
  }
  // Arrays own their own editors — treating them as a single link would let
  // the toolbar overwrite the whole array with one string.
  for (const k of ['navLinks', 'footerLinks', 'links']) {
    assert.equal(isLinkKey(k), false, `${k} is an array, not a link`);
  }
  // Image space must stay untouched.
  for (const k of ['imageUrl', 'coverUrl', 'coinUrl', 'bgUrl', 'title']) {
    assert.equal(isLinkKey(k), false, `${k} must not be a link`);
  }
});

// ── readSitePages ──────────────────────────────────────────────────────────

check('readSitePages synthesizes a home page for legacy blueprints', () => {
  const pages = readSitePages(serializeCanvas([block('b1')]));
  assert.equal(pages.length, 1);
  assert.equal(pages[0].isHome, true);
  assert.equal(pages[0].blocks.length, 1);
});

check('readSitePages tolerates junk and always yields one home', () => {
  assert.equal(readSitePages(undefined).length, 1);
  assert.equal(readSitePages({}).length, 1);
  const noHome = readSitePages({
    blocks: [],
    pages: [{ id: 'a', name: 'A', slug: 'a', blocks: [] }],
  });
  assert.equal(noHome.filter(p => p.isHome).length, 1);
  assert.equal(noHome[0].slug, '');
});

check('findPageBySlug distinguishes home from sub-pages', () => {
  const pages = readSitePages(
    serializeCanvasPages({
      pages: [
        page({ id: 'p_h', name: 'H', isHome: true, blocks: [block('h1')] }),
        page({ id: 'p_l', name: 'L', slug: 'san-pham', blocks: [block('l1')] }),
      ],
    })
  );
  assert.equal(findPageBySlug(pages, '')!.id, 'p_h');
  assert.equal(findPageBySlug(pages, 'san-pham')!.id, 'p_l');
  assert.equal(findPageBySlug(pages, 'khong-co'), undefined);
});

if (process.exitCode) {
  console.error('\ncheck-canvas-pages: FAILED');
} else {
  console.log(`check-canvas-pages: ${passed} checks passed`);
}
