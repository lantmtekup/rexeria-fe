/**
 * Portal V2 — Journey editor operations.
 *
 * Every function here takes a draft and returns a NEW draft. The prototype
 * mutates `S.jed.draft` in place and re-renders by hand (~L23625); React needs
 * fresh objects, and an immutable step is also what makes the undo timeline in
 * `useJourneyDraft` a list of snapshots rather than a diff log.
 *
 * THE GRAPH STAYS THE ONLY STORED THING. These verbs only ever move nodes,
 * routes and positions. Validation, readiness and the walk-through are still
 * derived in `helpers.ts`, so an edit cannot leave a stale verdict behind — the
 * editor renders the same checks the detail modal does, live.
 *
 * ONE INVARIANT IS ENFORCED HERE RATHER THAN CHECKED: deleting a node strips
 * every route into it, so the editor can never produce a dangling edge. Every
 * other rule (cycles, dead ends, unreachable nodes) is left to the contract,
 * because those are design mistakes worth SEEING rather than preventing.
 */

import {
  JOURNEY_KINDS,
  entrySourceById,
} from '@/lib/portal-v2/journeys/constants';
import { nodeById } from '@/lib/portal-v2/journeys/helpers';
import {
  BAND_ADD_W,
  BAND_W,
  NODE_H,
  NODE_W,
  STAGE_MIN,
  ensureStages,
  ownStages,
  placeInBands,
  relayoutStage,
  slotY,
  snap,
  stageAt,
  stageCount,
  stageX,
  stagesOf,
} from '@/lib/portal-v2/journeys/stages';
import type {
  Journey,
  JourneyExperienceLink,
  JourneyMetaPatch,
  JourneyNode,
  JourneyNodeKind,
  JourneyNodePatch,
  JourneyStage,
} from '@/lib/portal-v2/journeys/types';

/* The floor's geometry lives in `stages.ts`, because the slot pitch is derived
   from the node box and the band width is derived from the routing clearance.
   Re-exported here so the canvas keeps one import for "everything the editor
   knows about the floor". */
export { GRID, NODE_H, NODE_W, snap } from '@/lib/portal-v2/journeys/stages';

/* ── placing ───────────────────────────────────────────────────────────── */

/**
 * Give every node a phase and an explicit position.
 *
 * Called once when the editor opens: from that moment on the floor is the
 * author's, and no re-render can reshuffle it. Both steps are deterministic, so
 * opening the editor twice on the same graph places it identically.
 */
export const withPositions = (journey: Journey): Journey =>
  placeInBands(ensureStages(journey));

/**
 * Re-flow every band into its slots.
 *
 * This is what Align means now. It no longer re-runs the layered layout,
 * because that would overrule the phases the author assigned - the one thing on
 * this floor that is a decision rather than a drawing. Align straightens the
 * columns; it does not re-plan the journey.
 */
export const tidyLayout = (journey: Journey): Journey =>
  stagesOf(journey).reduce(
    (draft, _stage, index) => relayoutStage(draft, index),
    ensureStages(journey)
  );

/* ── ids ───────────────────────────────────────────────────────────────── */

/**
 * `n{highest + 1}` — the prototype's own scheme (~L23628). Deterministic given
 * the draft, so a test can predict the id and a re-render cannot reshuffle it.
 */
const nextNodeId = (nodes: JourneyNode[]): string => {
  const highest = nodes.reduce((max, node) => {
    const digits = Number(String(node.id).replace(/\D/g, ''));
    return Number.isFinite(digits) ? Math.max(max, digits) : max;
  }, 0);
  return `n${highest + 1}`;
};

/* ── node fields per kind ──────────────────────────────────────────────── */

/**
 * The fields a kind is allowed to carry. Switching kind drops what no longer
 * applies — otherwise a node that used to be an experience would keep a link
 * nothing reads, and the contract would pass on a field the UI cannot show.
 */
const normalizeForKind = (node: JourneyNode): JourneyNode => {
  const next: JourneyNode = { ...node };

  if (next.kind !== 'experience') {
    delete next.x;
    delete next.xName;
    delete next.xSlug;
    delete next.xCoverage;
    delete next.stats;
  }

  if (next.kind !== 'entry') delete next.src;

  if (['entry', 'action', 'outcome'].includes(next.kind)) {
    next.via = next.via ?? '';
  } else {
    delete next.via;
  }

  return next;
};

/* ── mutations ─────────────────────────────────────────────────────────── */

const mapNodes = (
  journey: Journey,
  fn: (node: JourneyNode) => JourneyNode
): Journey => ({ ...journey, nodes: journey.nodes.map(fn) });

const patchNode = (
  journey: Journey,
  nodeId: string,
  fn: (node: JourneyNode) => JourneyNode
): Journey => mapNodes(journey, node => (node.id === nodeId ? fn(node) : node));

/**
 * Add a node to the bottom of one phase.
 *
 * KIND AND PLACE IN ONE GESTURE. The old palette asked for a kind and then left
 * the author to drag the result somewhere meaningful; here the question is
 * always "what happens in THIS phase", and the answer lands where it was asked.
 *
 * If a node is selected and it is not an outcome, the new node is wired up to
 * it — building a route forward is the common case, and making the author draw
 * that edge by hand every time is friction with no upside.
 */
export const addNodeToStage = (
  journey: Journey,
  kind: JourneyNodeKind,
  stage: number,
  selectedId: string | null
): { journey: Journey; nodeId: string } => {
  const id = nextNodeId(journey.nodes);
  const anchor = selectedId ? nodeById(journey, selectedId) : null;

  const node = normalizeForKind({
    id,
    kind,
    name: `New ${JOURNEY_KINDS[kind].name.toLowerCase()}`,
    d: '',
    to: [],
    stage,
    px: stageX(stage),
    py: slotY(stageCount(journey, stage)),
  });

  const linkFromAnchor =
    anchor && anchor.kind !== 'outcome' && !anchor.to.includes(id);

  return {
    journey: {
      ...journey,
      nodes: [
        ...journey.nodes.map(n =>
          linkFromAnchor && n.id === anchor.id ? { ...n, to: [...n.to, id] } : n
        ),
        node,
      ],
    },
    nodeId: id,
  };
};

/**
 * Deleting a node strips every route into it — no dangling edges, ever — and
 * closes the gap it leaves in its band, so a column never reads as if a card
 * were merely invisible.
 */
export const deleteNode = (journey: Journey, nodeId: string): Journey => {
  const stage = nodeById(journey, nodeId)?.stage ?? 0;
  const without: Journey = {
    ...journey,
    nodes: journey.nodes
      .filter(node => node.id !== nodeId)
      .map(node =>
        node.to.includes(nodeId)
          ? { ...node, to: node.to.filter(target => target !== nodeId) }
          : node
      ),
  };
  return relayoutStage(without, stage);
};

/**
 * Duplicate a node: same design, fresh id, the slot directly below the original,
 * the same routes OUT but none IN — a twin should not silently receive its
 * sibling's traffic.
 */
export const duplicateNode = (
  journey: Journey,
  nodeId: string
): { journey: Journey; nodeId: string } | null => {
  const source = nodeById(journey, nodeId);
  if (!source) return null;

  const id = nextNodeId(journey.nodes);
  const stage = source.stage ?? 0;
  const copy: JourneyNode = {
    ...structuredClone(source),
    id,
    name: `${source.name} (copy)`,
    stage,
    px: stageX(stage),
    /* Below its original but above the next slot, so the re-flow ranks it
       second rather than making it fight the original for the same place. */
    py: (source.py ?? 0) + NODE_H,
  };

  return {
    journey: relayoutStage(
      { ...journey, nodes: [...journey.nodes, copy] },
      stage
    ),
    nodeId: id,
  };
};

/** Refuses a self-loop and dedups. Every other routing sin the contract shows. */
export const connectNodes = (
  journey: Journey,
  from: string,
  to: string
): Journey | null => {
  if (from === to) return null;
  const source = nodeById(journey, from);
  if (!source || !nodeById(journey, to)) return null;
  if (source.to.includes(to)) return null;

  return patchNode(journey, from, node => ({ ...node, to: [...node.to, to] }));
};

export const cutEdge = (journey: Journey, from: string, to: string): Journey =>
  patchNode(journey, from, node => ({
    ...node,
    to: node.to.filter(target => target !== to),
  }));

/**
 * Move one end of an existing route — the drag on an edge handle.
 *
 * ONE STEP, NOT TWO. Cutting and connecting separately would put a graph with a
 * missing route in the undo timeline, and one Cmd+Z would land the author there
 * rather than back where they started.
 *
 * Dropping a route onto a pair that is ALREADY wired collapses to a plain cut:
 * the author asked for one route between those two nodes and that is what they
 * are left with, instead of a silent refusal that appears to lose the drag.
 */
export const rerouteEdge = (
  journey: Journey,
  prev: { from: string; to: string },
  next: { from: string; to: string }
): Journey | null => {
  if (next.from === next.to) return null;
  if (prev.from === next.from && prev.to === next.to) return null;
  if (!nodeById(journey, next.from) || !nodeById(journey, next.to)) return null;

  const cut = cutEdge(journey, prev.from, prev.to);
  return connectNodes(cut, next.from, next.to) ?? cut;
};

/** Live, while the pointer is down: the card goes exactly where it is dragged. */
export const moveNode = (
  journey: Journey,
  nodeId: string,
  x: number,
  y: number
): Journey =>
  patchNode(journey, nodeId, node => ({
    ...node,
    px: snap(x),
    py: snap(y),
  }));

/**
 * The drop. Phase from where the card's centre landed, rank from how far down
 * the band it landed — then both touched bands re-flow around it.
 *
 * ORDER IS A DRAG, NOT A COORDINATE. The author never types a rank or nudges a
 * card by eight pixels to make a column line up; they drop it roughly where it
 * belongs and the band does the arithmetic.
 */
export const dropNode = (journey: Journey, nodeId: string): Journey => {
  const node = nodeById(journey, nodeId);
  if (!node) return journey;

  const from = node.stage ?? 0;
  const to = stageAt(node.px ?? 0, stagesOf(journey).length - 1);

  const restaged =
    from === to
      ? journey
      : patchNode(journey, nodeId, n => ({ ...n, stage: to }));

  const flowed = relayoutStage(restaged, to);
  return from === to ? flowed : relayoutStage(flowed, from);
};

export const updateNode = (
  journey: Journey,
  nodeId: string,
  patch: JourneyNodePatch
): Journey => patchNode(journey, nodeId, node => ({ ...node, ...patch }));

/**
 * Picking an entry source suggests its usual system — but only INTO emptiness,
 * the same rule the prototype keeps (~L23743). A typed-in system is the
 * author's answer and is never overwritten.
 */
export const setEntrySource = (
  journey: Journey,
  nodeId: string,
  sourceId: string
): Journey =>
  patchNode(journey, nodeId, node => {
    const source = entrySourceById(sourceId);
    return {
      ...node,
      src: sourceId || undefined,
      via: node.via ? node.via : (source?.via ?? ''),
    };
  });

export const changeNodeKind = (
  journey: Journey,
  nodeId: string,
  kind: JourneyNodeKind
): Journey =>
  patchNode(journey, nodeId, node => normalizeForKind({ ...node, kind }));

/**
 * Write the link. `stats` is deliberately dropped: numbers belong to what the
 * campaign measured on the OLD link, and carrying them onto a new page would
 * be inventing a history that never happened.
 */
export const linkExperience = (
  journey: Journey,
  nodeId: string,
  link: JourneyExperienceLink
): Journey =>
  patchNode(journey, nodeId, node => {
    const next: JourneyNode = {
      ...node,
      x: link.id,
      xName: link.name,
      xCoverage: link.coverage,
    };
    /* A page without a public slug has nothing to preview, and a stale slug from
       the previous link would preview the wrong page — so it is written or it is
       removed, never left behind. */
    if (link.slug) next.xSlug = link.slug;
    else delete next.xSlug;
    if (node.x !== link.id) delete next.stats;
    return next;
  });

export const unlinkExperience = (journey: Journey, nodeId: string): Journey =>
  patchNode(journey, nodeId, node => {
    const next = { ...node };
    delete next.x;
    delete next.xName;
    delete next.xSlug;
    delete next.xCoverage;
    delete next.stats;
    return next;
  });

export const updateMeta = (
  journey: Journey,
  patch: JourneyMetaPatch
): Journey => ({
  ...journey,
  ...patch,
});

/* ── the phases ────────────────────────────────────────────────────────────
   Every verb here calls `ownStages` first: a journey shares the house
   vocabulary by reference until the moment it disagrees with it, and only then
   does it start carrying five words of its own. */

/** The phase's name is the brand's word. Empty falls back rather than vanishing. */
export const renameStage = (
  journey: Journey,
  index: number,
  name: string
): Journey => {
  const stages = ownStages(journey);
  const stage = stages[index];
  if (!stage) return journey;
  stages[index] = { ...stage, name: name.trim() || 'Phase' };
  return { ...journey, stages };
};

export const addStage = (journey: Journey): Journey => ({
  ...journey,
  stages: [
    ...ownStages(journey),
    {
      id: `stage-${Date.now().toString(36)}`,
      name: 'New phase',
      kind: 'flow',
      hint: 'name what happens here',
    },
  ],
});

/**
 * Remove a phase — only an empty one, and never below the point where the
 * picture stops reading as a funnel.
 *
 * Refusing rather than cascading is the whole point: deleting a phase that
 * holds cards would have to either delete them or silently move them, and both
 * are decisions that belong to the author, not to a `✕`.
 */
export const removeStage = (
  journey: Journey,
  index: number
): Journey | null => {
  const stages = ownStages(journey);
  if (stages.length <= STAGE_MIN) return null;
  if (!stages[index]) return null;
  if (stageCount(journey, index) > 0) return null;

  const next = { ...journey, stages: stages.filter((_, i) => i !== index) };

  /* Everything to the right shifts one band left, positions included. */
  const shifted: Journey = {
    ...next,
    nodes: next.nodes.map(node => {
      const stage = node.stage ?? 0;
      if (stage <= index) return node;
      return { ...node, stage: stage - 1, px: stageX(stage - 1) };
    }),
  };

  return shifted;
};

/**
 * Re-label all the phases at once from a framework.
 *
 * POSITIONAL, SO NOTHING MOVES. Applying a spine keeps every card exactly where
 * it is: only the words and the measurement semantics change. A framework with
 * fewer phases than the journey uses leaves the extra ones alone rather than
 * dropping the cards inside them.
 */
export const applyStageTemplate = (
  journey: Journey,
  stages: JourneyStage[]
): Journey => {
  const current = ownStages(journey);
  return {
    ...journey,
    stages: current.map((stage, index) => {
      const swap = stages[index];
      return swap ? { ...swap } : stage;
    }),
  };
};

/* ── reading the draft ─────────────────────────────────────────────────── */

/** Every edge in the graph, flattened — what the canvas draws and hit-tests. */
export const journeyEdges = (
  journey: Journey
): { from: string; to: string }[] =>
  journey.nodes.flatMap(node =>
    node.to.flatMap(target =>
      nodeById(journey, target) ? [{ from: node.id, to: target }] : []
    )
  );

/**
 * True when the two nodes are already wired that way — the canvas uses it to
 * refuse a drag that would do nothing, instead of silently succeeding.
 */
export const hasEdge = (journey: Journey, from: string, to: string): boolean =>
  Boolean(nodeById(journey, from)?.to.includes(to));

/** Breathing room around the outermost nodes, in floor units. */
const FLOOR_MARGIN = 48;

export type FloorBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};

/**
 * What the floor occupies, margin included.
 *
 * THE BANDS COUNT, NOT ONLY THE CARDS. An empty phase holds nothing, but it is
 * still part of the picture and still has to be reachable: bounds that stopped
 * at the last card would make the last two phases un-scrollable on a journey
 * that has not been filled in yet.
 *
 * Reaches into negative space, because dragging is not clamped: the overview and
 * the fit-to-content view both have to be able to find a node the author parked
 * above or to the left of the first band.
 *
 * The rail's "+ Phase" slot counts too (`BAND_ADD_W`): the view is clamped to
 * these bounds, so a slot past the last band that the bounds do not know about
 * is a slot the author can never scroll into view.
 */
export const floorBounds = (journey: Journey): FloorBounds => {
  const railWide = stagesOf(journey).length * BAND_W + BAND_ADD_W;

  const xs = journey.nodes.map(node => node.px ?? 0);
  const ys = journey.nodes.map(node => node.py ?? 0);

  const minX = Math.min(0, ...xs) - FLOOR_MARGIN;
  const minY = Math.min(0, ...ys) - FLOOR_MARGIN;
  const maxX = Math.max(railWide, ...xs.map(x => x + NODE_W)) + FLOOR_MARGIN;
  const maxY = Math.max(slotY(3), ...ys.map(y => y + NODE_H)) + FLOOR_MARGIN;

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
};
