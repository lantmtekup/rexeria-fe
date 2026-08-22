'use client';

import { useCallback, useMemo, useReducer } from 'react';

import { withPositions } from '@/lib/portal-v2/journeys/editor';
import type { Journey } from '@/lib/portal-v2/journeys/types';

/**
 * The editor's draft and its timeline.
 *
 * IT EDITS A CLONE. Autosave / Save write the clone back; Discard restores the
 * snapshot taken when the editor opened. That keeps criterion 8 structural:
 * nothing outside this session mutates the graph unless the author said so.
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
  /**
   * Autosave-settle baseline — moved forward each time the debounced local
   * write-back runs, purely so that effect stops re-firing on an unchanged
   * draft. NOT a save-to-server signal — see `savedOrigin`.
   */
  autosaveOrigin: string;
  /**
   * Save-to-server baseline — open snapshot, moved forward ONLY by a real
   * Save. `isDirty` (the "leave without saving" gate) is checked against
   * this, never against `autosaveOrigin`: the debounced write-back only
   * touches workspace state, not the server (see `JourneyEditor`'s
   * `onPersist` vs `onSave`), so it must not silence that warning.
   */
  savedOrigin: string;
  /** Positioned clone at open — Discard restores this; never moves. */
  opened: string;
};

type DraftAction =
  | { type: 'set'; draft: Journey; snapshot: boolean }
  | { type: 'commit' }
  | { type: 'markClean' }
  | { type: 'autosaved'; draft: Journey }
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

    case 'markClean': {
      const entry = snapshotOf(state.draft);
      return { ...state, autosaveOrigin: entry, savedOrigin: entry };
    }

    case 'autosaved':
      return {
        ...state,
        draft: action.draft,
        autosaveOrigin: snapshotOf(action.draft),
      };

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
  return {
    draft,
    history: [entry],
    index: 0,
    autosaveOrigin: entry,
    savedOrigin: entry,
    opened: entry,
  };
};

export type JourneyDraftController = {
  draft: Journey;
  /** Replace the draft and add an undo step. */
  apply: (next: Journey) => void;
  /** Replace the draft without an undo step — for drags and keystrokes. */
  applyLive: (next: Journey) => void;
  /** Turn whatever `applyLive` has accumulated into one undo step. */
  commit: () => void;
  /** Persist-shaped draft becomes the live draft and the autosave baseline. */
  markAutosaved: (next: Journey) => void;
  /** Positioned clone as the editor received it — Discard restores this. */
  opened: Journey;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /**
   * The draft differs from what the SERVER has (open or last real Save) —
   * drives the "leave without saving" warning. Local autosave never clears
   * this: it only writes back to workspace state, not the server.
   */
  isDirty: boolean;
  /** The draft differs from the last autosave write-back — internal to the debounce effect. */
  needsAutosave: boolean;
};

export const useJourneyDraft = (journey: Journey): JourneyDraftController => {
  const [state, dispatch] = useReducer(reducer, journey, init);

  const opened = useMemo(
    () => JSON.parse(state.opened) as Journey,
    [state.opened]
  );

  const apply = useCallback((next: Journey) => {
    dispatch({ type: 'set', draft: next, snapshot: true });
  }, []);

  const applyLive = useCallback((next: Journey) => {
    dispatch({ type: 'set', draft: next, snapshot: false });
  }, []);

  const commit = useCallback(() => dispatch({ type: 'commit' }), []);
  const markAutosaved = useCallback((next: Journey) => {
    dispatch({ type: 'autosaved', draft: next });
  }, []);
  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);

  const isDirty = useMemo(
    () => snapshotOf(state.draft) !== state.savedOrigin,
    [state.draft, state.savedOrigin]
  );

  const needsAutosave = useMemo(
    () => snapshotOf(state.draft) !== state.autosaveOrigin,
    [state.draft, state.autosaveOrigin]
  );

  return {
    draft: state.draft,
    apply,
    applyLive,
    commit,
    markAutosaved,
    opened,
    undo,
    redo,
    canUndo: state.index > 0,
    canRedo: state.index < state.history.length - 1,
    isDirty,
    needsAutosave,
  };
};
