'use client';

import * as React from 'react';
import { produce, type Draft } from 'immer';

import { createPage, duplicatePageDeep } from '../pageFactory';
import {
  DEFAULT_PAGE_ID,
  homePageOf,
  normalizePages,
  type EditorPage,
} from '../serialize';
import type { Block } from '../types';

/**
 * Canvas state — pages + blocks + active ids + undo/redo. Implemented as a
 * reducer so all mutations route through one predictable code path.
 *
 * ## Pages
 *
 * A template's canvas holds N `EditorPage`s (home, product list, product
 * detail, …). Only the active page's blocks are exposed as `blocks`, and every
 * pre-existing member of this API (`mutate`, `mutateBlock`, `mutateActive`,
 * `replaceBlocks`, `activeBlock`, …) operates on the **active page**, so the
 * ~50 call sites in `BlockEditor.tsx` are unchanged by the move to multi-page.
 *
 * `EditorPage` is a page *inside one template canvas* — not the BE `Page`
 * entity. See the naming note in `serialize.ts`.
 *
 *   - `mutate(recipe)` — immer updater over the active page's blocks.
 *   - `mutateBlock(id, recipe)` — update one block by id (active page).
 *   - `undo` / `redo` — move state across the stacks. A snapshot carries
 *     `activePageId`, so undoing an edit made on another page navigates back
 *     to it; without that, Cmd+Z on the wrong page looks like a no-op.
 *   - `reset(blocks, activeId?)` — collapse the document to ONE implicit page.
 *     For initial single-page load / error fallback / block-direct mode.
 *   - `resetPages(pages, …)` — multi-page load.
 *   - `replacePageBlocks(pageId, next)` — replace one page's blocks WITH
 *     history. AI apply-product must use this: `reset` would discard every
 *     other page.
 *
 * Memory: immer's `produce` does structural sharing — a snapshot clones only
 * the `pages` spine plus the touched page's `blocks` spine; untouched pages are
 * shared by reference across all 50 snapshots.
 */

const HISTORY_CAP = 50;

function resolveValidActiveId(
  blocks: Block[],
  preferred?: string | null
): string | null {
  if (preferred && blocks.some(b => b.id === preferred)) return preferred;
  return blocks[0]?.id ?? null;
}

function singlePage(blocks: Block[]): EditorPage {
  return {
    id: DEFAULT_PAGE_ID,
    name: 'Trang chủ',
    slug: '',
    isHome: true,
    blocks,
  };
}

interface HistorySnapshot {
  pages: EditorPage[];
  activePageId: string;
  activeByPage: Record<string, string | null>;
}

export interface CanvasState {
  pages: EditorPage[];
  activePageId: string;
  /**
   * Active block **per page**. A single flat `activeId` silently mis-targets
   * `mutateActive` after a page switch: the reducer's `find` misses (the id
   * belongs to the previous page) so every edit is a no-op, while
   * `activeBlock` falls back to `blocks[0]` — the canvas shows a block that
   * nothing can edit.
   */
  activeByPage: Record<string, string | null>;
  undoStack: HistorySnapshot[];
  redoStack: HistorySnapshot[];
}

export type BlockRecipe = (draft: Draft<Block[]>) => void | Block[];

export type CanvasAction =
  | { type: 'mutate'; recipe: BlockRecipe }
  | { type: 'mutateBlock'; id: string; recipe: (b: Draft<Block>) => void }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset'; blocks: Block[]; activeId?: string | null }
  | {
      type: 'resetPages';
      pages: EditorPage[];
      activePageId?: string | null;
      activeId?: string | null;
    }
  | { type: 'setActiveId'; id: string | null }
  | { type: 'setActivePage'; id: string }
  | { type: 'addPage'; name?: string }
  | { type: 'removePage'; id: string }
  | {
      type: 'renamePage';
      id: string;
      patch: Partial<Pick<EditorPage, 'name' | 'slug' | 'seo'>>;
    }
  | { type: 'duplicatePage'; id: string }
  | { type: 'setHomePage'; id: string }
  | { type: 'reorderPages'; pages: EditorPage[] }
  | {
      type: 'replacePageBlocks';
      pageId: string;
      blocks: Block[];
      activeId?: string | null;
    };

function snapshot(s: CanvasState): HistorySnapshot {
  return {
    pages: s.pages,
    activePageId: s.activePageId,
    activeByPage: s.activeByPage,
  };
}

/** Commit `next` with the previous state pushed onto the undo stack. */
function push(s: CanvasState, next: Partial<CanvasState>): CanvasState {
  const undoStack =
    s.undoStack.length >= HISTORY_CAP
      ? [...s.undoStack.slice(1), snapshot(s)]
      : [...s.undoStack, snapshot(s)];
  return { ...s, ...next, undoStack, redoStack: [] };
}

/**
 * Apply a `Block[]` recipe to ONE page inside a `pages`-rooted produce.
 *
 * ⚠️ The recipe's return value must be **assigned** to `p.blocks`, never
 * returned from the producer — returning it would replace the whole `pages`
 * array. `replaceBlocks` (and therefore all dnd-kit block reordering) relies on
 * that return value, and the failure mode is a silent no-op, not a type error.
 */
function producePage(
  pages: EditorPage[],
  pageId: string,
  recipe: BlockRecipe
): EditorPage[] {
  return produce(pages, draft => {
    const p = draft.find(x => x.id === pageId);
    if (!p) return;
    const res = recipe(p.blocks as unknown as Draft<Block[]>);
    if (res) p.blocks = res as Block[];
  });
}

/** Re-establish page invariants and drop `activeByPage` entries for pages that
 *  no longer exist. */
function commitPages(
  s: CanvasState,
  rawPages: EditorPage[],
  preferredActivePageId?: string
): Partial<CanvasState> {
  const pages = normalizePages(rawPages);
  const activePageId = pages.some(p => p.id === preferredActivePageId)
    ? (preferredActivePageId as string)
    : pages.some(p => p.id === s.activePageId)
      ? s.activePageId
      : homePageOf(pages).id;

  const activeByPage: Record<string, string | null> = {};
  for (const p of pages) {
    activeByPage[p.id] = resolveValidActiveId(p.blocks, s.activeByPage[p.id]);
  }
  return { pages, activePageId, activeByPage };
}

/** Exported for `scripts/check-canvas-pages.ts` — the repo has no unit-test
 *  runner, and the failure modes here (silent no-ops) need direct coverage. */
export function canvasReducer(
  state: CanvasState,
  action: CanvasAction
): CanvasState {
  switch (action.type) {
    case 'mutate': {
      const next = producePage(state.pages, state.activePageId, action.recipe);
      if (next === state.pages) return state; // recipe was a no-op
      return push(state, { pages: next });
    }
    case 'mutateBlock': {
      const next = producePage(state.pages, state.activePageId, draft => {
        const b = draft.find(x => x.id === action.id);
        if (b) action.recipe(b);
      });
      if (next === state.pages) return state;
      return push(state, { pages: next });
    }
    case 'undo': {
      const prev = state.undoStack[state.undoStack.length - 1];
      if (!prev) return state;
      return {
        ...state,
        ...prev,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, snapshot(state)],
      };
    }
    case 'redo': {
      const next = state.redoStack[state.redoStack.length - 1];
      if (!next) return state;
      return {
        ...state,
        ...next,
        undoStack: [...state.undoStack, snapshot(state)],
        redoStack: state.redoStack.slice(0, -1),
      };
    }
    case 'reset': {
      // Collapse to one implicit page — single-page load / error fallback /
      // block-direct mode.
      const pages = [singlePage(action.blocks)];
      return {
        pages,
        activePageId: DEFAULT_PAGE_ID,
        activeByPage: {
          [DEFAULT_PAGE_ID]: resolveValidActiveId(
            action.blocks,
            action.activeId ?? state.activeByPage[state.activePageId]
          ),
        },
        undoStack: [],
        redoStack: [],
      };
    }
    case 'resetPages': {
      const pages = normalizePages(action.pages);
      const activePageId = pages.some(p => p.id === action.activePageId)
        ? (action.activePageId as string)
        : homePageOf(pages).id;
      const activeByPage: Record<string, string | null> = {};
      for (const p of pages) {
        activeByPage[p.id] = resolveValidActiveId(
          p.blocks,
          p.id === activePageId ? action.activeId : null
        );
      }
      return {
        pages,
        activePageId,
        activeByPage,
        undoStack: [],
        redoStack: [],
      };
    }
    case 'setActiveId': {
      // Selection is navigation, not an edit — no history entry.
      const page = state.pages.find(p => p.id === state.activePageId);
      if (!page) return state;
      if (state.activeByPage[state.activePageId] === action.id) return state;
      if (action.id && !page.blocks.some(b => b.id === action.id)) return state;
      return {
        ...state,
        activeByPage: {
          ...state.activeByPage,
          [state.activePageId]: action.id,
        },
      };
    }
    case 'setActivePage': {
      if (state.activePageId === action.id) return state;
      if (!state.pages.some(p => p.id === action.id)) return state;
      return { ...state, activePageId: action.id };
    }
    case 'addPage': {
      const created = createPage(state.pages, action.name);
      return push(state, {
        ...commitPages(state, [...state.pages, created], created.id),
      });
    }
    case 'removePage': {
      if (state.pages.length <= 1) return state; // never leave zero pages
      const idx = state.pages.findIndex(p => p.id === action.id);
      if (idx === -1) return state;
      const rest = state.pages.filter(p => p.id !== action.id);
      // Land on the neighbour, not silently back on home.
      const fallback = rest[Math.min(idx, rest.length - 1)].id;
      const nextActive =
        state.activePageId === action.id ? fallback : state.activePageId;
      return push(state, { ...commitPages(state, rest, nextActive) });
    }
    case 'renamePage': {
      const rest = state.pages.map(p =>
        p.id === action.id ? { ...p, ...action.patch } : p
      );
      return push(state, { ...commitPages(state, rest) });
    }
    case 'duplicatePage': {
      const src = state.pages.find(p => p.id === action.id);
      if (!src) return state;
      const dup = duplicatePageDeep(state.pages, src);
      const idx = state.pages.findIndex(p => p.id === action.id);
      const rest = [...state.pages];
      rest.splice(idx + 1, 0, dup);
      return push(state, { ...commitPages(state, rest, dup.id) });
    }
    case 'setHomePage': {
      if (!state.pages.some(p => p.id === action.id)) return state;
      // Flip the flags and let `normalizePages` re-derive slugs: the new home
      // gets '', the old home gets one derived from its name.
      const rest = state.pages.map(p => ({
        ...p,
        isHome: p.id === action.id,
        slug: p.id === action.id ? '' : p.slug,
      }));
      return push(state, { ...commitPages(state, rest) });
    }
    case 'reorderPages': {
      return push(state, { ...commitPages(state, action.pages) });
    }
    case 'replacePageBlocks': {
      if (!state.pages.some(p => p.id === action.pageId)) return state;
      const pages = state.pages.map(p =>
        p.id === action.pageId ? { ...p, blocks: action.blocks } : p
      );
      return push(state, {
        pages,
        activeByPage: {
          ...state.activeByPage,
          [action.pageId]: resolveValidActiveId(
            action.blocks,
            action.activeId ?? state.activeByPage[action.pageId]
          ),
        },
      });
    }
  }
}

export interface UseCanvasStateApi {
  // ── Active page's blocks (unchanged surface) ──────────────────────────────
  blocks: Block[];
  activeBlock: Block | null;
  activeId: string | null;
  canUndo: boolean;
  canRedo: boolean;
  /** Apply an immer recipe to the active page's blocks (with history). */
  mutate: (recipe: BlockRecipe) => void;
  /** Convenience: edit one block by id. No-op if id not found. */
  mutateBlock: (id: string, recipe: (b: Draft<Block>) => void) => void;
  /** Edit the currently active block. No-op if nothing active. */
  mutateActive: (recipe: (b: Draft<Block>) => void) => void;
  /** Replace the active page's blocks (with history). */
  replaceBlocks: (next: Block[]) => void;
  undo: () => void;
  redo: () => void;
  /** Wipe history and collapse to ONE implicit page — single-page load,
   *  load-error fallback, block-direct mode. NOT for AI apply: that must use
   *  `replacePageBlocks` or it discards every other page. */
  reset: (blocks: Block[], activeId?: string | null) => void;
  setActiveId: (id: string | null) => void;

  // ── Pages ────────────────────────────────────────────────────────────────
  pages: EditorPage[];
  activePage: EditorPage;
  activePageId: string;
  /** Navigation, not an edit — never pushes history. */
  setActivePage: (id: string) => void;
  addPage: (name?: string) => void;
  removePage: (id: string) => void;
  renamePage: (
    id: string,
    patch: Partial<Pick<EditorPage, 'name' | 'slug' | 'seo'>>
  ) => void;
  /** Deep clone, re-iding every block. Inserted right after the source. */
  duplicatePage: (id: string) => void;
  setHomePage: (id: string) => void;
  reorderPages: (next: EditorPage[]) => void;
  /** Multi-page load. Wipes history. */
  resetPages: (
    pages: EditorPage[],
    activePageId?: string | null,
    activeId?: string | null
  ) => void;
  /** Replace one page's blocks with history — AI apply-product. */
  replacePageBlocks: (
    pageId: string,
    next: Block[],
    activeId?: string | null
  ) => void;
}

export function createCanvasState(
  initial: Block[] = [],
  initialActiveId: string | null = null
): CanvasState {
  return {
    pages: [singlePage(initial)],
    activePageId: DEFAULT_PAGE_ID,
    activeByPage: { [DEFAULT_PAGE_ID]: initialActiveId },
    undoStack: [],
    redoStack: [],
  };
}

export function useCanvasState(
  initial: Block[] = [],
  initialActiveId: string | null = null
): UseCanvasStateApi {
  const [state, dispatch] = React.useReducer(canvasReducer, undefined, () =>
    createCanvasState(initial, initialActiveId)
  );

  const api = React.useMemo<UseCanvasStateApi>(() => {
    const activePage =
      state.pages.find(p => p.id === state.activePageId) ?? state.pages[0];
    const blocks = activePage.blocks;
    const activeId = state.activeByPage[activePage.id] ?? null;

    return {
      blocks,
      activeId,
      activeBlock: blocks.find(b => b.id === activeId) ?? blocks[0] ?? null,
      canUndo: state.undoStack.length > 0,
      canRedo: state.redoStack.length > 0,
      mutate: recipe => dispatch({ type: 'mutate', recipe }),
      mutateBlock: (id, recipe) =>
        dispatch({ type: 'mutateBlock', id, recipe }),
      mutateActive: recipe => {
        if (!activeId) return;
        dispatch({ type: 'mutateBlock', id: activeId, recipe });
      },
      replaceBlocks: next => dispatch({ type: 'mutate', recipe: () => next }),
      undo: () => dispatch({ type: 'undo' }),
      redo: () => dispatch({ type: 'redo' }),
      reset: (b, id) => dispatch({ type: 'reset', blocks: b, activeId: id }),
      setActiveId: id => dispatch({ type: 'setActiveId', id }),

      pages: state.pages,
      activePage,
      activePageId: activePage.id,
      setActivePage: id => dispatch({ type: 'setActivePage', id }),
      addPage: name => dispatch({ type: 'addPage', name }),
      removePage: id => dispatch({ type: 'removePage', id }),
      renamePage: (id, patch) => dispatch({ type: 'renamePage', id, patch }),
      duplicatePage: id => dispatch({ type: 'duplicatePage', id }),
      setHomePage: id => dispatch({ type: 'setHomePage', id }),
      reorderPages: pages => dispatch({ type: 'reorderPages', pages }),
      resetPages: (pages, activePageId, activeId2) =>
        dispatch({
          type: 'resetPages',
          pages,
          activePageId,
          activeId: activeId2,
        }),
      replacePageBlocks: (pageId, next, id) =>
        dispatch({
          type: 'replacePageBlocks',
          pageId,
          blocks: next,
          activeId: id,
        }),
    };
  }, [state]);

  return api;
}
