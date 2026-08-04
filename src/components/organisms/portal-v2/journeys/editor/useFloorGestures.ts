'use client';

import { useCallback, useEffect, useState, type SetStateAction } from 'react';

import type { LinkVerdict } from '@/components/organisms/portal-v2/journeys/editor/canvas/NodeCard';
import type { ViewTransform } from '@/components/organisms/portal-v2/journeys/editor/EditorCanvas';
import { hasEdge } from '@/lib/portal-v2/journeys/editor';
import {
  sameEdge,
  type JourneyEdgeRef,
  type RoutedEdge,
} from '@/lib/portal-v2/journeys/routing';
import { NODE_H, NODE_W } from '@/lib/portal-v2/journeys/stages';
import type { Journey, JourneyNode } from '@/lib/portal-v2/journeys/types';

/**
 * The floor's three gestures, in one place.
 *
 * ONLY ONE OF THEM CAN BE IN FLIGHT. Dragging a card, pulling a route and
 * panning the floor all begin with a pointer going down and all end with it
 * coming up, and every one of them has to keep working when the pointer leaves
 * the element that started it. Left in the component they were three tangled
 * state machines sharing one window listener and one `busy` flag; here they are
 * one machine with three states, and the canvas only renders what it says.
 *
 * WHAT A LINK MEANS depends on what is already drawn, so the verdict lives here
 * too: pulling onto a card that is already wired CUTS that route rather than
 * doing nothing, and the hint in the canvas is just this verdict spelled out.
 */

export type DragState = {
  nodeId: string;
  /** Pointer offset inside the card, in floor units. */
  grabX: number;
  grabY: number;
  moved: boolean;
};

export type LinkState = {
  /**
   * `out` — the source is fixed and the drag is choosing the target.
   * `in`  — the target is fixed and the drag is choosing the source.
   */
  mode: 'out' | 'in';
  /** The end that stays put for the length of the drag. */
  anchorId: string;
  /** Set when the drag started on an existing route — the one being moved. */
  replacing: JourneyEdgeRef | null;
  /** Cursor in floor coordinates. */
  x: number;
  y: number;
  moved: boolean;
};

type PanState = {
  originX: number;
  originY: number;
  panX: number;
  panY: number;
  moved: boolean;
};

type FloorGesturesInput = {
  draft: Journey;
  view: ViewTransform;
  toFloor: (clientX: number, clientY: number) => { x: number; y: number };
  applyView: (update: SetStateAction<ViewTransform>) => void;
  onSelect: (
    selection:
      | { kind: 'node'; id: string }
      | { kind: 'edge'; from: string; to: string }
      | null
  ) => void;
  onNodeDrag: (nodeId: string, x: number, y: number) => void;
  onNodeDrop: (nodeId: string) => void;
  onConnect: (from: string, to: string) => void;
  onCutEdge: (from: string, to: string) => void;
  onRerouteEdge: (prev: JourneyEdgeRef, next: JourneyEdgeRef) => void;
  /** Closes the kind menu — any gesture on the floor dismisses it. */
  onDismiss: () => void;
};

export type FloorGestures = {
  drag: DragState | null;
  link: LinkState | null;
  /** Card under the cursor while a link is being pulled. */
  linkTarget: string | null;
  /** What releasing over `linkTarget` would do. */
  verdict: LinkVerdict;
  /** A gesture is in flight: hit areas and floating controls stand down. */
  busy: boolean;
  pairFor: (state: LinkState, targetId: string) => JourneyEdgeRef;
  completeLink: (state: LinkState, targetId: string) => void;
  onCardPointerDown: (node: JourneyNode, e: React.PointerEvent) => void;
  onCardActivate: (node: JourneyNode) => void;
  onPortDown: (
    mode: 'in' | 'out',
    node: JourneyNode,
    e: React.PointerEvent
  ) => void;
  onPortArm: (mode: 'in' | 'out', node: JourneyNode) => void;
  onGrabEnd: (
    edge: RoutedEdge,
    end: 'head' | 'tail',
    e: React.PointerEvent
  ) => void;
  onBackgroundPointerDown: (e: React.PointerEvent) => void;
};

export const useFloorGestures = ({
  draft,
  view,
  toFloor,
  applyView,
  onSelect,
  onNodeDrag,
  onNodeDrop,
  onConnect,
  onCutEdge,
  onRerouteEdge,
  onDismiss,
}: FloorGesturesInput): FloorGestures => {
  const [drag, setDrag] = useState<DragState | null>(null);
  const [link, setLink] = useState<LinkState | null>(null);
  const [pan, setPan] = useState<PanState | null>(null);
  const [linkTarget, setLinkTarget] = useState<string | null>(null);

  const nodeAt = useCallback(
    (x: number, y: number): JourneyNode | null =>
      /* Last drawn wins, matching what the eye picks when boxes overlap. */
      [...draft.nodes]
        .reverse()
        .find(
          node =>
            x >= (node.px ?? 0) &&
            x <= (node.px ?? 0) + NODE_W &&
            y >= (node.py ?? 0) &&
            y <= (node.py ?? 0) + NODE_H
        ) ?? null,
    [draft.nodes]
  );

  const pairFor = useCallback(
    (state: LinkState, targetId: string): JourneyEdgeRef =>
      state.mode === 'out'
        ? { from: state.anchorId, to: targetId }
        : { from: targetId, to: state.anchorId },
    []
  );

  const verdictFor = useCallback(
    (state: LinkState | null, targetId: string | null): LinkVerdict => {
      if (!state || !targetId || targetId === state.anchorId) return 'none';
      const pair = pairFor(state, targetId);
      if (state.replacing) {
        return sameEdge(state.replacing, pair) ? 'keep' : 'connect';
      }
      return hasEdge(draft, pair.from, pair.to) ? 'disconnect' : 'connect';
    },
    [draft, pairFor]
  );

  const clearLink = useCallback(() => {
    setLink(null);
    setLinkTarget(null);
  }, []);

  /** Land the link on a card — the one place a route is created or moved. */
  const completeLink = useCallback(
    (state: LinkState, targetId: string) => {
      const decision = verdictFor(state, targetId);
      const pair = pairFor(state, targetId);

      if (decision === 'connect') {
        if (state.replacing) onRerouteEdge(state.replacing, pair);
        else onConnect(pair.from, pair.to);
        /* Select what was just drawn: the handles appear on it, so the next
           correction is one drag away rather than a hunt for the line. */
        onSelect({ kind: 'edge', from: pair.from, to: pair.to });
      } else if (decision === 'disconnect') {
        onCutEdge(pair.from, pair.to);
        onSelect(null);
      }

      clearLink();
    },
    [
      clearLink,
      onConnect,
      onCutEdge,
      onRerouteEdge,
      onSelect,
      pairFor,
      verdictFor,
    ]
  );

  /* ── pointer move / up, once per gesture ─────────────────────────────── */
  useEffect(() => {
    if (!drag && !link && !pan) return;

    const handleMove = (e: PointerEvent) => {
      if (drag) {
        const point = toFloor(e.clientX, e.clientY);
        onNodeDrag(drag.nodeId, point.x - drag.grabX, point.y - drag.grabY);
        if (!drag.moved) setDrag({ ...drag, moved: true });
        return;
      }

      if (link) {
        const point = toFloor(e.clientX, e.clientY);
        const hovered = nodeAt(point.x, point.y);
        setLinkTarget(
          hovered && hovered.id !== link.anchorId ? hovered.id : null
        );
        setLink({ ...link, x: point.x, y: point.y, moved: true });
        return;
      }

      if (pan) {
        /* Measured from where the gesture started, so a dropped frame cannot
           accumulate into drift. */
        applyView(prev => ({
          ...prev,
          panX: pan.panX + (e.clientX - pan.originX),
          panY: pan.panY + (e.clientY - pan.originY),
        }));
        if (!pan.moved) setPan({ ...pan, moved: true });
      }
    };

    const handleUp = (e: PointerEvent) => {
      if (drag) {
        /* Always: a card that was picked up and put back still has to land in a
           slot rather than wherever the pointer happened to release. */
        onNodeDrop(drag.nodeId);
        setDrag(null);
        return;
      }

      if (link) {
        const point = toFloor(e.clientX, e.clientY);
        const dropped = nodeAt(point.x, point.y);

        if (dropped && dropped.id !== link.anchorId) {
          completeLink(link, dropped.id);
          return;
        }

        /* Released without travelling: keep the link armed so the next click
           finishes it — the keyboard and touch path. */
        if (!link.moved) return;
        /* Released over nothing: the route stays exactly as it was. Removing a
           route is a thing you ask for, never something a slipped drag does. */
        clearLink();
        return;
      }

      if (pan) {
        if (!pan.moved) onSelect(null);
        setPan(null);
      }
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [
    applyView,
    clearLink,
    completeLink,
    drag,
    link,
    nodeAt,
    onNodeDrag,
    onNodeDrop,
    onSelect,
    pan,
    toFloor,
  ]);

  /* Escape cancels an armed link and nothing else. `stopImmediatePropagation`
     rather than `stopPropagation`: the shell's own Escape handler is bound to
     this same window, and it would otherwise go on to close the editor. */
  useEffect(() => {
    if (!link) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopImmediatePropagation();
      clearLink();
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [clearLink, link]);

  /* ── starters ──────────────────────────────────────────────────────── */

  const onCardPointerDown = useCallback(
    (node: JourneyNode, e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      onDismiss();

      /* A pulled link lands here when the pointer is released over a card, and
         an armed one lands here on the completing click. */
      if (link) {
        completeLink(link, node.id);
        return;
      }

      onSelect({ kind: 'node', id: node.id });
      const point = toFloor(e.clientX, e.clientY);
      setDrag({
        nodeId: node.id,
        grabX: point.x - (node.px ?? 0),
        grabY: point.y - (node.py ?? 0),
        moved: false,
      });
    },
    [completeLink, link, onDismiss, onSelect, toFloor]
  );

  const onCardActivate = useCallback(
    (node: JourneyNode) => {
      if (link) completeLink(link, node.id);
      else onSelect({ kind: 'node', id: node.id });
    },
    [completeLink, link, onSelect]
  );

  const onPortDown = useCallback(
    (mode: 'in' | 'out', node: JourneyNode, e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      const point = toFloor(e.clientX, e.clientY);
      setLink({
        mode,
        anchorId: node.id,
        replacing: null,
        x: point.x,
        y: point.y,
        moved: false,
      });
      setLinkTarget(null);
      onSelect({ kind: 'node', id: node.id });
    },
    [onSelect, toFloor]
  );

  /** The keyboard and touch path: arm the link, then click the other card. */
  const onPortArm = useCallback((mode: 'in' | 'out', node: JourneyNode) => {
    setLink({
      mode,
      anchorId: node.id,
      replacing: null,
      x: (node.px ?? 0) + (mode === 'out' ? NODE_W + 40 : -40),
      y: (node.py ?? 0) + NODE_H / 2,
      moved: false,
    });
    setLinkTarget(null);
  }, []);

  /** Pick up one end of a route that already exists. */
  const onGrabEnd = useCallback(
    (edge: RoutedEdge, end: 'head' | 'tail', e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      const point = toFloor(e.clientX, e.clientY);
      setLink({
        /* Dragging the head keeps the source; the tail keeps the target. */
        mode: end === 'head' ? 'out' : 'in',
        anchorId: end === 'head' ? edge.from : edge.to,
        replacing: { from: edge.from, to: edge.to },
        x: point.x,
        y: point.y,
        moved: false,
      });
      setLinkTarget(null);
    },
    [toFloor]
  );

  const onBackgroundPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      onDismiss();
      if (link) {
        clearLink();
        return;
      }
      setPan({
        originX: e.clientX,
        originY: e.clientY,
        panX: view.panX,
        panY: view.panY,
        moved: false,
      });
    },
    [clearLink, link, onDismiss, view.panX, view.panY]
  );

  return {
    drag,
    link,
    linkTarget,
    verdict: verdictFor(link, linkTarget),
    busy: Boolean(drag || pan?.moved || link),
    pairFor,
    completeLink,
    onCardPointerDown,
    onCardActivate,
    onPortDown,
    onPortArm,
    onGrabEnd,
    onBackgroundPointerDown,
  };
};
