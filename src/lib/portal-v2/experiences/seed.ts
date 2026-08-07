import {
  CONFIDENCE_TIERS,
  OBJECTIVE_ROLE,
} from '@/lib/portal-v2/experiences/constants';
import type {
  EvidenceTier,
  ExperienceEvidence,
  ExperienceInteraction,
  ExperienceLayer,
  ExperienceObjective,
  ExperienceState,
  ExperienceStats,
  ExperienceVehicle,
  FunnelRole,
  LayerComponentKey,
  SignalCoverage,
} from '@/lib/portal-v2/experiences/types';

/**
 * The seeded half of an experience.
 *
 * A published landing page carries no funnel roles, no instrumentation and no
 * measured sessions — that pipeline does not exist yet. Rather than render
 * zeroes (which would read as "measured, and the answer is nothing"), every
 * analytics surface is derived from the page's own UUID through the
 * prototype's hash. Same page id ⇒ same numbers, on the server and in the
 * browser, forever.
 *
 * DETERMINISM IS LOAD-BEARING: this runs during SSR and again during
 * hydration. No `Math.random`, no `Date.now()`, no `new Date()`.
 *
 * Ported from `plan-v2/rexer-platform-v2.html` — `ihash`/`irnd` (~L8237-8245),
 * `normalizeLayers` (~L11868), `signalCoverage` (~L12566), `rollup` (~L8413),
 * `CONF_TIERS` (~L13409). When `/v1/experiences` lands, everything below is
 * replaced by measured values; the view types do not change.
 */

/* ── seeded RNG ─────────────────────────────────────────────────────────── */

export const ihash = (s: string): number => {
  let h = 2166136261;
  for (const ch of String(s)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

export const irnd = (s: string, lo: number, hi: number): number =>
  lo + ((ihash(s) % 1000) / 1000) * (hi - lo);

/** Deterministic pick from a fixed list. */
const ipick = <T>(seed: string, list: readonly T[]): T =>
  list[ihash(seed) % list.length]!;

/* ── the seeded axes ────────────────────────────────────────────────────── */

const VEHICLES: readonly ExperienceVehicle[] = [
  'curated',
  'ads',
  'showcase',
  'microsite',
];

const OBJECTIVES: readonly ExperienceObjective[] = [
  'insight',
  'lead',
  'cta',
  'convert',
];

const INTERACTIONS: readonly ExperienceInteraction[] = [
  'hotspot',
  'swipe',
  'pan',
  '360',
  'vr',
];

/** Prototype `XSTATES` (~L15932) — ownership until lineage exists on the wire. */
const STATES: readonly ExperienceState[] = ['template', 'product', 'topic'];

/** Funnel shapes a real post-click page tends to take. */
const LAYER_SHAPES: readonly FunnelRole[][] = [
  ['ATT', 'EXP', 'EDU', 'CON'],
  ['ATT', 'EDU', 'EXP', 'TRU', 'CON'],
  ['ATT', 'EXP', 'CON'],
  ['ATT', 'EDU', 'TRU', 'CON'],
  ['EDU', 'TRU', 'EXP', 'CON'],
];

const ROLE_BLOCK_NAME: Record<FunnelRole, string> = {
  ATT: 'Hook',
  EDU: 'Explain',
  EXP: 'Explore',
  TRU: 'Prove',
  CON: 'Convert',
};

export const seedVehicle = (id: string): ExperienceVehicle =>
  ipick(id + 'vehicle', VEHICLES);

export const seedState = (id: string): ExperienceState =>
  ipick(id + 'state', STATES);

export const seedObjective = (id: string): ExperienceObjective =>
  ipick(id + 'objective', OBJECTIVES);

export const seedInteractions = (id: string): ExperienceInteraction[] =>
  INTERACTIONS.filter((_, i) => irnd(`${id}int${i}`, 0, 1) > 0.62);

/* ── layers + coverage ──────────────────────────────────────────────────── */

/**
 * `normalizeLayers` port: every block reports, `CON` layers gain a CTA, and
 * exactly one hero component per block carries a tracking point. Must run
 * before coverage — skip it and every `pct` is 0.
 */
const buildLayer = (
  role: FunnelRole,
  objective: ExperienceObjective,
  hasMedia: boolean
): ExperienceLayer => {
  const cta =
    role === 'CON' ? (objective === 'lead' ? 'Send it' : 'Add to cart') : null;

  const components: LayerComponentKey[] = [
    'n',
    'h',
    'b',
    ...(hasMedia ? (['media'] as const) : []),
    ...(cta ? (['cta'] as const) : []),
  ];

  const hero: LayerComponentKey = cta ? 'cta' : hasMedia ? 'media' : 'h';

  return {
    role,
    name: ROLE_BLOCK_NAME[role],
    description: '',
    mediaRef: hasMedia ? 'seeded' : null,
    cta,
    tracked: true,
    components,
    trackedComponents: [hero],
  };
};

export const seedLayers = (
  id: string,
  objective: ExperienceObjective
): ExperienceLayer[] =>
  ipick(id + 'shape', LAYER_SHAPES).map((role, i) =>
    buildLayer(role, objective, irnd(`${id}media${i}`, 0, 1) > 0.45)
  );

/**
 * The single layer of a BLOCK.
 *
 * A block is one section, so it never gets a shape drawn from `LAYER_SHAPES` —
 * that would invent a funnel a block cannot have. Its role is the one its
 * objective serves, and it keeps its own name instead of the generic
 * `ROLE_BLOCK_NAME` label, because here the record and the layer are the same
 * thing and the user already knows what it is called.
 */
export const seedBlockLayer = (
  id: string,
  objective: ExperienceObjective,
  name: string
): ExperienceLayer => ({
  ...buildLayer(
    OBJECTIVE_ROLE[objective],
    objective,
    irnd(id + 'media0', 0, 1) > 0.45
  ),
  name,
});

/**
 * `signalCoverage` port. `pct` is COMPONENT coverage, not block coverage: a
 * tracked block emits dwell and scroll — mechanics — while a tracked component
 * emits a meaning, and the meanings are the product.
 */
export const computeCoverage = (layers: ExperienceLayer[]): SignalCoverage => {
  const components = layers.reduce((n, l) => n + l.components.length, 0);
  const trackedComponents = layers.reduce(
    (n, l) => n + l.trackedComponents.length,
    0
  );
  return {
    blocks: layers.length,
    trackedBlocks: layers.filter(l => l.tracked).length,
    components,
    trackedComponents,
    pct: components ? Math.round((trackedComponents / components) * 100) : 0,
  };
};

/* ── the funnel ─────────────────────────────────────────────────────────── */

/** `ICHANNELS` (~L8097). */
const CHANNELS = [
  'Meta',
  'Email',
  'Google',
  'TikTok',
  'Retail QR',
  'Web microsite',
] as const;

/**
 * `facts()` + `rollup()` reduced to one row.
 *
 * The funnel is monotonic BY CONSTRUCTION — each stage is a fraction of the one
 * above it, so this cannot emit a funnel that grows. The LIFT is drawn first,
 * in the range a real post-click layer produces (−20% to +55%), and the control
 * is implied by it; draw them independently and you get a 400% lift, which is
 * not a result but a bug wearing a result's clothes.
 *
 * Returns null for roughly a third of pages — those read "Not yet run". A page
 * with no rows behind it has no numbers, not zeroes.
 */
export const seedStats = (
  id: string,
  objective: ExperienceObjective
): ExperienceStats | null => {
  if (irnd(id + 'ran', 0, 1) < 0.32) return null;

  const sessions = Math.round(irnd(id + 'sess', 240, 24000));
  const engaged = Math.round(sessions * irnd(id + 'eng', 0.48, 0.72));
  const explored = Math.round(engaged * irnd(id + 'exp', 0.5, 0.78));
  const convinced = Math.round(explored * irnd(id + 'tru', 0.28, 0.55));
  const converted = Math.round(convinced * irnd(id + 'con', 0.3, 0.62));
  const leads =
    objective === 'lead'
      ? Math.round(convinced * irnd(id + 'ld', 0.35, 0.68))
      : 0;

  const cvr = sessions ? converted / sessions : 0;

  return {
    sessions,
    engaged,
    explored,
    convinced,
    converted,
    leads,
    revenue: Math.round(converted * irnd(id + 'aov', 42, 96)),
    cvr,
    lift: irnd(id + 'lift', -0.2, 0.55),
    campaigns: Math.round(irnd(id + 'camps', 1, 3)),
    campaignNames: [],
    channels: CHANNELS.filter((_, i) => irnd(`${id}ch${i}`, 0, 1) > 0.68).slice(
      0,
      3
    ),
  };
};

/**
 * `engConfidence` (~L13440). The prototype's shelf read always passes
 * `hasControl: true` because every row is measured against the page it
 * replaced, so the floors are the only thing that decide the tier.
 */
export const confidenceTier = (stats: ExperienceStats | null): EvidenceTier => {
  if (!stats) return 'unmeasured';
  return CONFIDENCE_TIERS.find(t => stats.sessions >= t.min)?.id ?? 'early';
};

export const seedEvidence = (
  stats: ExperienceStats | null
): ExperienceEvidence => ({
  tier: confidenceTier(stats),
  lineage: stats,
});

export const roleOf = (objective: ExperienceObjective): FunnelRole =>
  OBJECTIVE_ROLE[objective];
