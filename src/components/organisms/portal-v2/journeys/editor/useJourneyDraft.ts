'use client';

import { useCallback, useMemo, useReducer } from 'react';

import { withPositions } from '@/lib/portal-v2/journeys/editor';
import type { Journey } from '@/lib/portal-v2/journeys/types';

/**
 * The editor's draft and its timeline.
 *
 * IT EDITS A CLONE. The record in the workspace cannot change while the editor
 * is open — only Save writes back. That makes the prototype's criterion 8 (a
 * live journey is never changed unintentionally, ~L23527) structural rather
 * than a rule someone has to remember.
 *
 * TWO KINDS OF STEP. Structural edits (add, delete, connect, cut, kind change)
 * snapshot immediately. Continuous ones — typing in a field, dragging a node —
 * update the draft but only snapshot when they finish, so one sentence typed is
 * one undo and not forty.
 */

const HISTORY_LIMIT = 50;

type DraftState = {
  draft: Journey;
  /** JSON snapshots, oldest first. `history[index]` is what is on screen. */
  history: string[];
  index: number;
  /** The journey as the editor received it — the dirty check's baseline. */
  origin: string;
};

type DraftAction =
  | { type: 'set'; draft: Journey; snapshot: boolean }
  | { type: 'commit' }
  | { type: 'undo' }
  | { type: 'redo' };

const snapshotOf = (journey: Journey): string => JSON.stringify(journey);

const push = (state: DraftState, draft: Journey): DraftState => {
  const entry = snapshotOf(draft);
  if (entry === state.history[state.index]) return { ...state, draft };

  /* A new step after an undo drops the redo tail — the timeline is a line. */
  const history = [...state.history.slice(0, state.index + 1), entry];
  const trimmed =
    history.length > HISTORY_LIMIT ? history.slice(-HISTORY_LIMIT) : history;

  return { ...state, draft, history: trimmed, index: trimmed.length - 1 };
};

const reducer = (state: DraftState, action: DraftAction): DraftState => {
  switch (action.type) {
    case 'set':
      return action.snapshot
        ? push(state, action.draft)
        : { ...state, draft: action.draft };

    case 'commit':
      return push(state, state.draft);

    case 'undo': {
      if (state.index <= 0) return state;
      const index = state.index - 1;
      const entry = state.history[index];
      if (!entry) return state;
      return { ...state, index, draft: JSON.parse(entry) as Journey };
    }

    case 'redo': {
      if (state.index >= state.history.length - 1) return state;
      const index = state.index + 1;
      const entry = state.history[index];
      if (!entry) return state;
      return { ...state, index, draft: JSON.parse(entry) as Journey };
    }

    default:
      return state;
  }
};

const init = (journey: Journey): DraftState => {
  /* Positions are seeded once, on arrival: from here the floor is the author's
     and no re-render can reshuffle it. */
  const draft = withPositions(structuredClone(journey));
  const entry = snapshotOf(draft);
  return { draft, history: [entry], index: 0, origin: entry };
};

export type JourneyDraftController = {
  draft: Journey;
  /** Replace the draft and add an undo step. */
  apply: (next: Journey) => void;
  /** Replace the draft without an undo step — for drags and keystrokes. */
  applyLive: (next: Journey) => void;
  /** Turn whatever `applyLive` has accumulated into one undo step. */
  commit: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** The draft differs from what the editor opened with. */
  isDirty: boolean;
};

export const useJourneyDraft = (journey: Journey): JourneyDraftController => {
  const [state, dispatch] = useReducer(reducer, journey, init);

  const apply = useCallback((next: Journey) => {
    dispatch({ type: 'set', draft: next, snapshot: true });
  }, []);

  const applyLive = useCallback((next: Journey) => {
    dispatch({ type: 'set', draft: next, snapshot: false });
  }, []);

  const commit = useCallback(() => dispatch({ type: 'commit' }), []);
  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);

  const isDirty = useMemo(
    () => snapshotOf(state.draft) !== state.origin,
    [state.draft, state.origin]
  );

  return {
    draft: state.draft,
    apply,
    applyLive,
    commit,
    undo,
    redo,
    canUndo: state.index > 0,
    canRedo: state.index < state.history.length - 1,
    isDirty,
  };
};
