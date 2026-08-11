/**
 * Portal V2 — the editor floor's geography.
 *
 * A JOURNEY IS NOT A FREE DRAWING. It runs left to right through the phases of
 * a funnel, and a node's phase is where it sits. The first editor drew nodes
 * wherever they were dropped: the picture said which node followed which, and
 * nothing at all about which part of the funnel the author was working on. Two
 * journeys drawn by two people could not be read side by side.
 *
 * So the floor has bands. A band is a phase; a card lives in a SLOT inside its
 * band; dragging across a border is how a card changes phase. The graph
 * mechanics underneath are untouched — branches, back-links, validation and
 * readiness all still read `node.to`. Phases give the edges a geography, they
 * do not add a rule.
 *
 * THE VOCABULARY BELONGS TO THE BRAND. `STAGE_HOUSE` is a starting set, not a
 * law: a journey may rename a phase, add one, or drop an empty one, and
 * `STAGE_TEMPLATES` re-labels all five at once for a different kind of
 * business. Like `JOURNEY_KINDS`, these words are the vocabulary of the model
 * rather than chrome, so they stay in English and are not translated.
 *
 * Everything here is pure and takes plain journeys, so `editor.ts` can build
 * verbs on it and the canvas can draw from it without either owning geometry.
 */

import { orderNodes } from '@/lib/portal-v2/journeys/helpers';
import { walkJourney } from '@/lib/portal-v2/journeys/helpers';
import type {
  Journey,
  JourneyNode,
  JourneyStage,
} from '@/lib/portal-v2/journeys/types';

/* ── the node box ──────────────────────────────────────────────────────────
   Bigger than the read-only graph's — it holds a kind label, a name, a subline
   and a row of hover actions, and it has to be a drag target. The slot pitch is
   derived from it, which is why the box lives here and not in `editor.ts`. */

export const NODE_W = 168;
export const NODE_H = 68;

/** Positions snap to this while a drag is in flight. */
export const GRID = 8;

export const snap = (value: number): number => Math.round(value / GRID) * GRID;

/* ── the bands ─────────────────────────────────────────────────────────────
   `BAND_W - NODE_W` is the horizontal gutter between one band's cards and the
   next: at 112 it clears the routing stubs (24 each side) plus a lane, so a
   forward edge always has room to bend rather than detour. */

export const BAND_W = 280;
/** Height of the header strip that names a phase. */
export const BAND_HEAD = 44;
/**
 * Width of the "+ Phase" slot the header rail ends with.
 *
 * It sits past the last band, so `floorBounds` has to reserve it: panning is
 * clamped to those bounds, and a control drawn outside them is a control the
 * author can never scroll all the way to.
 */
export const BAND_ADD_W = 132;
/** Where the first card sits, measured from the top of the floor. */
export const SLOT_TOP = BAND_HEAD + 26;
/** Vertical pitch between cards in one band. */
export const SLOT_H = NODE_H + 40;

const clamp = (value: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, value));

/** The x a card takes in band `index` — centred, so the gutters stay even. */
export const stageX = (index: number): number =>
  index * BAND_W + (BAND_W - NODE_W) / 2;

export const slotY = (slot: number): number => SLOT_TOP + slot * SLOT_H;

/** Which band a card belongs to, read from where its CENTRE landed. */
export const stageAt = (px: number, last: number): number =>
  clamp(Math.floor((px + NODE_W / 2) / BAND_W), 0, last);

/** The x range a band occupies — what the canvas paints and highlights. */
export const bandLeft = (index: number): number => index * BAND_W;

/* ── the house vocabulary ──────────────────────────────────────────────── */

export const STAGE_HOUSE: JourneyStage[] = [
  { id: 'aware', name: 'Awareness', kind: 'flow', hint: 'they discover you' },
  { id: 'consider', name: 'Consideration', kind: 'flow', hint: 'they lean in' },
  { id: 'decide', name: 'Decision', kind: 'flow', hint: 'they evaluate' },
  { id: 'convert', name: 'Conversion', kind: 'convert', hint: 'they act' },
  { id: 'retain', name: 'Retention', kind: 'flow', hint: 'they come back' },
];

export type JourneyStageTemplate = {
  id: string;
  name: string;
  /** One line: the kind of path this spine is for. */
  for: string;
  stages: JourneyStage[];
};

/**
 * The journey's spine by business type. Each is a five-phase set that
 * POSITIONALLY re-labels the house phases, so applying one keeps every card
 * exactly where it is — only the words and the measurement semantics change.
 * Exactly one phase in each set is the `convert` one.
 */
export const STAGE_TEMPLATES: JourneyStageTemplate[] = [
  {
    id: 'house',
    name: 'ReXeR standard',
    for: 'the default marketing spine',
    stages: STAGE_HOUSE,
  },
  {
    id: 'ecom',
    name: 'Ecommerce',
    for: 'a storefront purchase path',
    stages: [
      { id: 'discover', name: 'Discover', kind: 'flow', hint: 'they find you' },
      {
        id: 'understand',
        name: 'Understand',
        kind: 'flow',
        hint: 'they learn the product',
      },
      { id: 'evaluate', name: 'Evaluate', kind: 'flow', hint: 'they compare' },
      { id: 'act', name: 'Act', kind: 'convert', hint: 'they buy' },
      { id: 'return', name: 'Return', kind: 'flow', hint: 'they come back' },
    ],
  },
  {
    id: 'lead',
    name: 'Lead generation',
    for: 'a qualified-lead path',
    stages: [
      {
        id: 'awareness',
        name: 'Awareness',
        kind: 'flow',
        hint: 'they discover you',
      },
      { id: 'interest', name: 'Interest', kind: 'flow', hint: 'they lean in' },
      {
        id: 'qualification',
        name: 'Qualification',
        kind: 'flow',
        hint: 'they fit the profile',
      },
      {
        id: 'consultation',
        name: 'Consultation',
        kind: 'flow',
        hint: 'they talk to sales',
      },
      {
        id: 'decision',
        name: 'Decision',
        kind: 'convert',
        hint: 'they commit',
      },
    ],
  },
  {
    id: 'realestate',
    name: 'Real estate',
    for: 'a property reservation path',
    stages: [
      {
        id: 'discover',
        name: 'Discover',
        kind: 'flow',
        hint: 'they find a listing',
      },
      {
        id: 'explore',
        name: 'Explore',
        kind: 'flow',
        hint: 'they tour options',
      },
      {
        id: 'evaluate',
        name: 'Evaluate',
        kind: 'flow',
        hint: 'they shortlist',
      },
      {
        id: 'consult',
        name: 'Consult',
        kind: 'flow',
        hint: 'they meet an agent',
      },
      { id: 'reserve', name: 'Reserve', kind: 'convert', hint: 'they reserve' },
    ],
  },
  {
    id: 'onboarding',
    name: 'Customer onboarding',
    for: 'an activation path',
    stages: [
      { id: 'welcome', name: 'Welcome', kind: 'flow', hint: 'they arrive' },
      {
        id: 'understand',
        name: 'Understand',
        kind: 'flow',
        hint: 'they learn the tool',
      },
      { id: 'configure', name: 'Configure', kind: 'flow', hint: 'they set up' },
      {
        id: 'activate',
        name: 'Activate',
        kind: 'convert',
        hint: 'they go live',
      },
      { id: 'adopt', name: 'Adopt', kind: 'flow', hint: 'they stick' },
    ],
  },
];

/** A journey without its own phases reads the house set. */
export const stagesOf = (journey: Journey): JourneyStage[] =>
  journey.stages?.length ? journey.stages : STAGE_HOUSE;

/**
 * Materialise a private copy of the phases onto the journey.
 *
 * Called by every phase edit. Until the planner touches them, a journey shares
 * the house set by reference and stores nothing — so a journey that never had
 * an opinion cannot drift when the house vocabulary is revised.
 */
export const ownStages = (journey: Journey): JourneyStage[] =>
  journey.stages?.length
    ? journey.stages.map(stage => ({ ...stage }))
    : STAGE_HOUSE.map(stage => ({ ...stage }));

/** The lowest phase index a journey can shrink to and still read as a funnel. */
export const STAGE_MIN = 2;

/* ── placing cards ─────────────────────────────────────────────────────── */

/** An outcome that reads like a returning customer belongs in the last phase. */
const RETURNING = /member|loyal|repeat|return|refer|winback|replenish/i;

/**
 * Give every node a phase, inferred ONCE.
 *
 * Seeded and legacy journeys carry no phase. Rather than refuse to draw them,
 * infer a starting claim from what the graph already says — kind first,
 * topological depth second — and let the planner correct it by dragging. This
 * is a claim, never a fact, which is why it only ever runs on nodes that have
 * no phase of their own.
 */
export const ensureStages = (journey: Journey): Journey => {
  if (journey.nodes.every(node => node.stage !== undefined)) return journey;

  const stages = stagesOf(journey);
  const last = stages.length - 1;
  const convertAt = (() => {
    const found = stages.findIndex(stage => stage.kind === 'convert');
    return found < 0 ? Math.max(0, last - 1) : found;
  })();

  const layout = orderNodes(journey);
  const colOf = new Map(layout.map(item => [item.node.id, item.col]));
  const maxCol = Math.max(1, ...layout.map(item => item.col));

  const staged = journey.nodes.map(node => {
    if (node.stage !== undefined) return node;
    if (node.kind === 'entry') return { ...node, stage: 0 };
    if (node.kind === 'outcome') {
      return {
        ...node,
        stage: RETURNING.test(`${node.name} ${node.via ?? ''}`)
          ? last
          : convertAt,
      };
    }
    const col = colOf.get(node.id) ?? 1;
    return {
      ...node,
      stage: clamp(Math.round((col / maxCol) * last), 1, last),
    };
  });

  /* A support action that feeds nothing but outcomes belongs beside them: it is
     part of the moment they convert, not a phase of its own. */
  const byId = new Map(staged.map(node => [node.id, node]));
  const settled = staged.map(node => {
    if (node.kind !== 'action' || !node.to.length) return node;
    if (!node.to.every(target => byId.get(target)?.kind === 'outcome'))
      return node;
    const beside = byId.get(node.to[0])?.stage;
    return beside === undefined ? node : { ...node, stage: beside };
  });

  /* Phases assigned, the old free-floating coordinates are meaningless — the
     bands rebuild them. */
  return {
    ...journey,
    nodes: settled.map(node => {
      const next: JourneyNode = { ...node };
      delete next.px;
      delete next.py;
      return next;
    }),
  };
};

/** Fill in any missing coordinate from the node's phase and the next free slot. */
export const placeInBands = (journey: Journey): Journey => {
  if (
    journey.nodes.every(node => node.px !== undefined && node.py !== undefined)
  )
    return journey;

  const filled = new Map<number, number>();
  return {
    ...journey,
    nodes: journey.nodes.map(node => {
      const stage = node.stage ?? 0;
      const slot = filled.get(stage) ?? 0;
      filled.set(stage, slot + 1);
      return {
        ...node,
        px: node.px ?? stageX(stage),
        py: node.py ?? slotY(slot),
      };
    }),
  };
};

/**
 * Re-flow one band into its slots, in the order the cards currently read down
 * the column. Order is the RESULT of a drag, not a coordinate the author has to
 * get right: drop a card anywhere in the band and the band tidies around it.
 */
export const relayoutStage = (journey: Journey, stage: number): Journey => {
  const slotOf = new Map(
    journey.nodes
      .filter(node => (node.stage ?? 0) === stage)
      .slice()
      .sort((a, b) => (a.py ?? 0) - (b.py ?? 0))
      .map((node, index) => [node.id, index])
  );

  return {
    ...journey,
    nodes: journey.nodes.map(node => {
      const slot = slotOf.get(node.id);
      if (slot === undefined) return node;
      return { ...node, px: stageX(stage), py: slotY(slot) };
    }),
  };
};

/** How many cards a band holds — what the header counts and `✕` checks. */
export const stageCount = (journey: Journey, stage: number): number =>
  journey.nodes.filter(node => (node.stage ?? 0) === stage).length;

/* ── what a band measured ──────────────────────────────────────────────── */

export type StagePulse = {
  /** Shoppers who reached this phase. `null` ⇒ nothing here was measured. */
  reached: number | null;
  /** The convert phase only: reach here as a share of the first measured phase. */
  conv: number | null;
};

export type FloorNumbers = {
  /** One entry per phase, in phase order. */
  stages: StagePulse[];
  /** Node id → shoppers who reached that card. Absent ⇒ never measured. */
  reached: Map<string, number>;
};

/**
 * Every number the floor shows, from ONE walk.
 *
 * The band headers and the badges on the cards under them are the same
 * derivation read at two altitudes, which is why they cannot disagree. Two
 * separate passes would eventually drift, and a header that contradicts the
 * cards beneath it is worse than a header with no number at all.
 *
 * Within a phase, reach is the largest single graph column rather than the sum:
 * two branches drawn side by side are one moment in the funnel seen twice, and
 * adding them would invent shoppers. A phase with nothing measured stays
 * silent: evidence or nothing.
 *
 * ONE DELIBERATE DIVERGENCE FROM THE PROTOTYPE. There the convert band prints a
 * journey-level `cvr` and a "% of plan" against a stored target. Portal V2 has
 * neither field, so the conversion figure is derived from the same reach chain,
 * and a convert band holding no measured experience says nothing rather than
 * inventing a rate.
 */
export const floorNumbers = (
  list: Journey[],
  journey: Journey
): FloorNumbers => {
  const stages = stagesOf(journey);
  // 'all' ⇒ hệ số 1, nên không cần danh sách phân khúc ở đây.
  const walk = walkJourney(list, journey, 'all', []);

  const reached = new Map<string, number>();
  /* stage → graph column → summed reach */
  const perStage = new Map<number, Map<number, number>>();

  for (const step of walk) {
    if (step.node.kind !== 'experience' || step.reached === null) continue;
    reached.set(step.node.id, step.reached);
    const stage = step.node.stage ?? 0;
    const columns = perStage.get(stage) ?? new Map<number, number>();
    columns.set(step.col, (columns.get(step.col) ?? 0) + step.reached);
    perStage.set(stage, columns);
  }

  const reachOf = new Map<number, number>();
  for (const [stage, columns] of perStage) {
    reachOf.set(stage, Math.max(...columns.values()));
  }

  const first = [...reachOf.keys()].sort((a, b) => a - b)[0];
  const base = first === undefined ? null : (reachOf.get(first) ?? null);

  return {
    reached,
    stages: stages.map((stage, index) => {
      const at = reachOf.get(index) ?? null;
      return {
        reached: at,
        conv:
          stage.kind === 'convert' && at !== null && base
            ? (at / base) * 100
            : null,
      };
    }),
  };
};

/** `9,404` → `9.4k`. The card badge has room for four characters, not six. */
export const compactCount = (value: number): string =>
  value >= 1000
    ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
    : String(value);
