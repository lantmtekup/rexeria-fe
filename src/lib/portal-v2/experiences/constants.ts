import type { BlockCategory } from '@/components/modules/block-editor/types';
import {
  BLOCK_CATEGORY_LABEL,
  BLOCK_CATEGORY_ORDER,
} from '@/lib/block-type-catalog';
import type {
  EvidenceTier,
  ExperienceDetailTab,
  ExperienceFilters,
  ExperienceInteraction,
  ExperienceObjective,
  ExperienceTab,
  ExperienceVehicle,
  FunnelRole,
  LayerComponentKey,
} from '@/lib/portal-v2/experiences/types';
import type { BlockSurface } from '@/services/rexer/types';

/**
 * THE SPINE — prototype `DATA.expObjs` (~L5511).
 *
 * Every objective maps to exactly one funnel role, and between them the four
 * objectives cover the funnel. TRUST has no objective and never had one: it is
 * a property of the blocks inside a page, not of the page's purpose.
 *
 * Do NOT reach for `@/lib/portal-v2/exchange/objectiveStyles` instead — that
 * table maps the same four ids to unrelated colours (`lead` → amber there,
 * `lead` → EXP → blue here) and the mismatch produces no type error.
 */
export const OBJECTIVE_ROLE: Record<ExperienceObjective, FunnelRole> = {
  insight: 'ATT',
  lead: 'EXP',
  cta: 'EDU',
  convert: 'CON',
};

/**
 * THE NAVIGATION — prototype `XSTATES` + All (~L16071), plus Blocks.
 *
 * One row, read left to right as the library widens then turns a corner:
 * everything → the three page ownership states → the block half. Blocks sit at
 * the end rather than on a row of their own because the axes never overlap: a
 * block has `scope`, not template-vs-copy, so no tab has to express both.
 *
 * `all` genuinely means all — pages AND blocks.
 */
export const EXPERIENCE_TABS: {
  id: ExperienceTab;
  labelKey: string;
}[] = [
  { id: 'all', labelKey: 'stateAll' },
  { id: 'template', labelKey: 'stateTemplate' },
  { id: 'product', labelKey: 'stateProduct' },
  { id: 'topic', labelKey: 'stateTopic' },
  { id: 'block', labelKey: 'tabBlocks' },
];

/**
 * Block categories — BLOCK axis.
 *
 * Derived from the shared catalog so this list can never drift from the one
 * `/admin/blocks` filters by. Labels come from `BLOCK_CATEGORY_LABEL` and are
 * proper nouns ("Hero", "FAQ"), so they are passed through as `label` rather
 * than routed through i18n like the seeded axes.
 */
export const EXPERIENCE_BLOCK_CATEGORIES: {
  id: BlockCategory | 'all';
  /** Pre-resolved label; `labelKey` is set only for the `all` entry. */
  label?: string;
  labelKey?: string;
}[] = [
  { id: 'all', labelKey: 'blockCatAny' },
  ...BLOCK_CATEGORY_ORDER.map(id => ({
    id,
    label: BLOCK_CATEGORY_LABEL[id],
  })),
];

/** Where a block is allowed to land — `Block.supported_surfaces`. BLOCK axis. */
export const EXPERIENCE_SURFACES: {
  id: BlockSurface | 'all';
  labelKey: string;
}[] = [
  { id: 'all', labelKey: 'surfaceAny' },
  { id: 'landing', labelKey: 'surfaceLanding' },
  { id: 'ad', labelKey: 'surfaceAd' },
  { id: 'curate', labelKey: 'surfaceCurate' },
];

/** `DATA.expCats` (~L5497) — the vehicle. */
export const EXPERIENCE_VEHICLES: {
  id: ExperienceVehicle | 'all';
  labelKey: string;
}[] = [
  { id: 'all', labelKey: 'vehicleAny' },
  { id: 'curated', labelKey: 'vehicleCurated' },
  { id: 'ads', labelKey: 'vehicleAds' },
  { id: 'showcase', labelKey: 'vehicleShowcase' },
  { id: 'microsite', labelKey: 'vehicleMicrosite' },
];

export const EXPERIENCE_OBJECTIVES: {
  id: ExperienceObjective | 'all';
  labelKey: string;
}[] = [
  { id: 'all', labelKey: 'objAny' },
  { id: 'insight', labelKey: 'objInsight' },
  { id: 'lead', labelKey: 'objLead' },
  { id: 'cta', labelKey: 'objCta' },
  { id: 'convert', labelKey: 'objConvert' },
];

/** `EV_OPTS` (~L15273). */
export const EXPERIENCE_EVIDENCE: {
  id: EvidenceTier | 'all';
  labelKey: string;
  titleKey?: string;
}[] = [
  { id: 'all', labelKey: 'evAny' },
  { id: 'high', labelKey: 'evHigh', titleKey: 'evHighTitle' },
  {
    id: 'directional',
    labelKey: 'evDirectional',
    titleKey: 'evDirectionalTitle',
  },
  { id: 'early', labelKey: 'evEarly', titleKey: 'evEarlyTitle' },
  { id: 'unmeasured', labelKey: 'evUnmeasured', titleKey: 'evUnmeasuredTitle' },
];

/** `DATA.expInteractions` (~L5521) — what the shopper's hands actually do. */
export const EXPERIENCE_INTERACTIONS: {
  id: ExperienceInteraction;
  labelKey: string;
  descKey: string;
}[] = [
  { id: 'hotspot', labelKey: 'intHotspot', descKey: 'intHotspotDesc' },
  { id: 'swipe', labelKey: 'intSwipe', descKey: 'intSwipeDesc' },
  { id: 'pan', labelKey: 'intPan', descKey: 'intPanDesc' },
  { id: '360', labelKey: 'int360', descKey: 'int360Desc' },
  { id: 'vr', labelKey: 'intVr', descKey: 'intVrDesc' },
];

/**
 * `CONF_TIERS` (~L13409). Confidence is a rule, not a vibe. Ordered high →
 * low; the first entry whose floor is met wins.
 *
 * `requiresControl` is carried for fidelity: the prototype's shelf read always
 * passes `hasControl: true` (~L15268) because every fact row is measured
 * against the product page it replaced.
 */
export const CONFIDENCE_TIERS: {
  id: Exclude<EvidenceTier, 'unmeasured'>;
  min: number;
  requiresControl: boolean;
}[] = [
  { id: 'high', min: 5000, requiresControl: true },
  { id: 'directional', min: 1000, requiresControl: false },
  { id: 'early', min: 0, requiresControl: false },
];

/** `XGRADS` (~L7911). Carried on the record; not painted as the card cover. */
export const EXPERIENCE_GRADIENTS: { css: string; nameKey: string }[] = [
  { css: 'linear-gradient(135deg,#6C4CF1,#9B7DF8)', nameKey: 'gradViolet' },
  { css: 'linear-gradient(135deg,#3B82D6,#6FA8E5)', nameKey: 'gradBlue' },
  { css: 'linear-gradient(135deg,#13B57F,#3ED2A0)', nameKey: 'gradMint' },
  { css: 'linear-gradient(135deg,#E89A3C,#F2BE7C)', nameKey: 'gradAmber' },
  { css: 'linear-gradient(135deg,#E0629B,#F08FBC)', nameKey: 'gradRose' },
  { css: 'linear-gradient(135deg,#1E1930,#3D3950)', nameKey: 'gradInk' },
];

/** `XTABS` (~L22096), reduced to the three P0 panes. */
export const EXPERIENCE_DETAIL_TABS: {
  id: ExperienceDetailTab;
  labelKey: string;
  questionKey: string;
}[] = [
  { id: 'details', labelKey: 'tabDetails', questionKey: 'tabDetailsQ' },
  { id: 'signals', labelKey: 'tabSignals', questionKey: 'tabSignalsQ' },
  { id: 'perf', labelKey: 'tabPerf', questionKey: 'tabPerfQ' },
];

/** `COMP_NAME` (~L12401). */
export const LAYER_COMPONENT_LABEL_KEY: Record<LayerComponentKey, string> = {
  n: 'componentTitle',
  h: 'componentHeadline',
  b: 'componentBody',
  media: 'componentMedia',
  product: 'componentProduct',
  cta: 'componentCta',
};

/** Prototype `xCoverCell` (~L15726) — mint ≥80, amber ≥50, else rose. */
export const COVERAGE_THRESHOLDS = { ok: 80, warn: 50 } as const;

/** The funnel stages, in the order the shopper moves through them. */
export const FUNNEL_ORDER: FunnelRole[] = ['ATT', 'EDU', 'EXP', 'TRU', 'CON'];

export const EXPERIENCE_DEFAULT_FILTERS: ExperienceFilters = {
  q: '',
  tab: 'all',
  vehicle: 'all',
  objective: 'all',
  ev: 'all',
  blockCat: 'all',
  surface: 'all',
};

/** Which `ExperienceFilters` key a Refine chip row writes to. */
export type RefineAxis =
  | 'vehicle'
  | 'objective'
  | 'ev'
  | 'blockCat'
  | 'surface';

export type RefineFacet = {
  key: RefineAxis;
  /** i18n key for the row's uppercase label. */
  labelKey: string;
  options: { id: string; label?: string; labelKey?: string }[];
};

/**
 * The Refine drawer, per tab.
 *
 * The Blocks tab swaps the whole facet set for the two axes a block actually
 * has on the wire — its catalog category and the surfaces it is allowed on —
 * so it is never offered "Kiểu: Microsite", which for a block would be a chip
 * with nothing behind it.
 *
 * Every other tab (including `all`) keeps the shared axes. Those are seeded,
 * and blocks are seeded through the same helpers as pages, so narrowing by
 * objective or evidence on the All tab is meaningful for both halves.
 */
export const REFINE_FACETS_SHARED: RefineFacet[] = [
  { key: 'vehicle', labelKey: 'filterVehicle', options: EXPERIENCE_VEHICLES },
  {
    key: 'objective',
    labelKey: 'filterObjective',
    options: EXPERIENCE_OBJECTIVES,
  },
  { key: 'ev', labelKey: 'filterEvidence', options: EXPERIENCE_EVIDENCE },
];

export const REFINE_FACETS_BLOCK: RefineFacet[] = [
  {
    key: 'blockCat',
    labelKey: 'filterBlockCategory',
    options: EXPERIENCE_BLOCK_CATEGORIES,
  },
  { key: 'surface', labelKey: 'filterSurface', options: EXPERIENCE_SURFACES },
];

export const refineFacetsFor = (tab: ExperienceTab): RefineFacet[] =>
  tab === 'block' ? REFINE_FACETS_BLOCK : REFINE_FACETS_SHARED;
