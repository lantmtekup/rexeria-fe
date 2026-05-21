'use client';

import * as React from 'react';
import { produce, type Draft } from 'immer';

import type { Block } from '../types';

/**
 * Canvas state — blocks + active id + undo/redo. Implemented as a reducer
 * so all mutations route through one predictable code path:
 *
 *   - `mutate(recipe)` — pure-ish updater. Snapshots current blocks onto
 *     the undo stack and applies `produce(blocks, recipe)`. Skips no-op
 *     when the recipe returns the same reference (immer optimisation).
 *   - `mutateBlock(id, recipe)` — convenience wrapper for the common
 *     "update one block by id" pattern.
 *   - `undo` / `redo` — move state across the stacks.
 *   - `reset(blocks, activeId?)` — used after initial load + after AI
 *     apply-product accept.
 *
 * Memory: immer's `produce` does structural sharing — only the path of
 * objects touched by the recipe is cloned, the rest share references with
 * the previous snapshot. A 50-snapshot history of a single-field edit
 * costs ~50 small nodes, not 50 full clones.
 */

const HISTORY_CAP = 50;

interface CanvasState {
  blocks: Block[];
  activeId: string | null;
  undoStack: Block[][];
  redoStack: Block[][];
}

export type BlockRecipe = (draft: Draft<Block[]>) => void | Block[];

type Action =
  | { type: 'mutate'; recipe: BlockRecipe }
  | { type: 'mutateBlock'; id: string; recipe: (b: Draft<Block>) => void }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset'; blocks: Block[]; activeId?: string | null }
  | { type: 'setActiveId'; id: string | null };

function reducer(state: CanvasState, action: Action): CanvasState {
  switch (action.type) {
    case 'mutate': {
      const next = produce(state.blocks, action.recipe);
      if (next === state.blocks) return state; // recipe was a no-op
      const undoStack =
        state.undoStack.length >= HISTORY_CAP
          ? [...state.undoStack.slice(1), state.blocks]
          : [...state.undoStack, state.blocks];
      return { ...state, blocks: next, undoStack, redoStack: [] };
    }
    case 'mutateBlock': {
      const next = produce(state.blocks, draft => {
        const b = draft.find(x => x.id === action.id);
        if (b) action.recipe(b);
      });
      if (next === state.blocks) return state;
      const undoStack =
        state.undoStack.length >= HISTORY_CAP
          ? [...state.undoStack.slice(1), state.blocks]
          : [...state.undoStack, state.blocks];
      return { ...state, blocks: next, undoStack, redoStack: [] };
    }
    case 'undo': {
      const prev = state.undoStack[state.undoStack.length - 1];
      if (!prev) return state;
      return {
        ...state,
        blocks: prev,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.blocks],
      };
    }
    case 'redo': {
      const next = state.redoStack[state.redoStack.length - 1];
      if (!next) return state;
      return {
        ...state,
        blocks: next,
        undoStack: [...state.undoStack, state.blocks],
        redoStack: state.redoStack.slice(0, -1),
      };
    }
    case 'reset': {
      return {
        blocks: action.blocks,
        activeId: action.activeId ?? state.activeId,
        undoStack: [],
        redoStack: [],
      };
    }
    case 'setActiveId': {
      if (state.activeId === action.id) return state;
      return { ...state, activeId: action.id };
    }
  }
}

export interface UseCanvasStateApi {
  blocks: Block[];
  activeBlock: Block | null;
  activeId: string | null;
  canUndo: boolean;
  canRedo: boolean;
  /** Apply an immer recipe to the whole blocks array (with history). */
  mutate: (recipe: BlockRecipe) => void;
  /** Convenience: edit one block by id. No-op if id not found. */
  mutateBlock: (id: string, recipe: (b: Draft<Block>) => void) => void;
  /** Edit the currently active block. No-op if nothing active. */
  mutateActive: (recipe: (b: Draft<Block>) => void) => void;
  /** Replace the entire blocks array (with history). */
  replaceBlocks: (next: Block[]) => void;
  undo: () => void;
  redo: () => void;
  /** Wipe history and seed new blocks — for initial load / AI apply. */
  reset: (blocks: Block[], activeId?: string | null) => void;
  setActiveId: (id: string | null) => void;
}

export function useCanvasState(
  initial: Block[] = [],
  initialActiveId: string | null = null
): UseCanvasStateApi {
  const [state, dispatch] = React.useReducer(reducer, {
    blocks: initial,
    activeId: initialActiveId,
    undoStack: [],
    redoStack: [],
  });

  const api = React.useMemo<UseCanvasStateApi>(() => {
    return {
      blocks: state.blocks,
      activeId: state.activeId,
      activeBlock:
        state.blocks.find(b => b.id === state.activeId) ??
        state.blocks[0] ??
        null,
      canUndo: state.undoStack.length > 0,
      canRedo: state.redoStack.length > 0,
      mutate: recipe => dispatch({ type: 'mutate', recipe }),
      mutateBlock: (id, recipe) =>
        dispatch({ type: 'mutateBlock', id, recipe }),
      mutateActive: recipe => {
        const id = state.activeId;
        if (!id) return;
        dispatch({ type: 'mutateBlock', id, recipe });
      },
      replaceBlocks: next => dispatch({ type: 'mutate', recipe: () => next }),
      undo: () => dispatch({ type: 'undo' }),
      redo: () => dispatch({ type: 'redo' }),
      reset: (blocks, activeId) =>
        dispatch({ type: 'reset', blocks, activeId }),
      setActiveId: id => dispatch({ type: 'setActiveId', id }),
    };
  }, [state]);

  return api;
}
