import type {
  EvidenceTier,
  ExperienceCategory,
  ExperienceDetailTab,
  ExperienceFilters,
  ExperienceInteraction,
  ExperienceObjective,
  ExperienceState,
  ExperienceVehicle,
  FunnelRole,
  LayerComponentKey,
} from '@/lib/portal-v2/experiences/types';

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
 * Prototype `XSTATES` + All (~L16071) — the page's primary navigation.
 * Ownership (template vs copy) is orthogonal to Category / Type / Objective.
 */
export const EXPERIENCE_STATES: {
  id: ExperienceState | 'all';
  labelKey: string;
}[] = [
  { id: 'all', labelKey: 'stateAll' },
  { id: 'template', labelKey: 'stateTemplate' },
  { id: 'product', labelKey: 'stateProduct' },
  { id: 'topic', labelKey: 'stateTopic' },
  // `kind: 'block'` là loại THỨ TƯ mà `/v1/experiences` trả về. Bản cũ không
  // có tab này vì nó suy từ `/pages`, nơi block không tồn tại; gộp block vào
  // một trong ba tab kia là gán cho chúng một quyền sở hữu chúng không có.
  { id: 'block', labelKey: 'stateBlock' },
];

/** `DATA.expCategories` (~L5480) — what KIND of artifact this is. */
export const EXPERIENCE_CATEGORIES: {
  id: ExperienceCategory | 'all';
  labelKey: string;
}[] = [
  { id: 'all', labelKey: 'catAny' },
  { id: 'blocks', labelKey: 'catBlocks' },
  { id: 'collection', labelKey: 'catCollection' },
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
  state: 'all',
  category: 'all',
  vehicle: 'all',
  objective: 'all',
  ev: 'all',
};
