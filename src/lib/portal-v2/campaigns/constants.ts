import type {
  CampaignFilters,
  CampaignGoal,
  CampaignHealthState,
  CampaignItemStatus,
  CampaignPhase,
  CampaignStage,
  CampaignType,
} from '@/lib/portal-v2/campaigns/types';

/**
 * Registries for the Campaigns module.
 *
 * Colours are `--pv2-*` tokens run through `color-mix`, the same way
 * `PRODUCT_STATUS` does it — the prototype's `var(--amber)` / `--mint` / `--rose`
 * have no Portal V2 equivalent, and hard-coding hexes here would leak a second
 * palette into the module.
 *
 * Labels are i18n keys, not strings: this module translates everything (the
 * products/experiences convention), unlike the older Brand panels.
 */

/** Prototype `CAMP_TYPES` (rexer-demo-v3.html :15610). */
export const CAMPAIGN_TYPES: Record<
  CampaignType,
  { labelKey: string; descKey: string; color: string }
> = {
  launch: {
    labelKey: 'typeLaunch',
    descKey: 'typeLaunchDesc',
    color: 'var(--pv2-violet)',
  },
  seasonal: {
    labelKey: 'typeSeasonal',
    descKey: 'typeSeasonalDesc',
    color: 'var(--pv2-electric)',
  },
  sale: {
    labelKey: 'typeSale',
    descKey: 'typeSaleDesc',
    color: 'var(--pv2-warning)',
  },
  always: {
    labelKey: 'typeAlways',
    descKey: 'typeAlwaysDesc',
    color: 'var(--pv2-blue-500)',
  },
  retention: {
    labelKey: 'typeRetention',
    descKey: 'typeRetentionDesc',
    color: 'var(--pv2-success)',
  },
};

export const CAMPAIGN_TYPE_IDS = Object.keys(CAMPAIGN_TYPES) as CampaignType[];

export const CAMPAIGN_GOALS: Record<CampaignGoal, { labelKey: string }> = {
  awareness: { labelKey: 'goalAwareness' },
  traffic: { labelKey: 'goalTraffic' },
  conversion: { labelKey: 'goalConversion' },
  retention: { labelKey: 'goalRetention' },
};

export const CAMPAIGN_GOAL_IDS = Object.keys(CAMPAIGN_GOALS) as CampaignGoal[];

/**
 * Display stages. `planning|live|paused|done` map onto the four stored
 * statuses; `building` is derived at read time and is the one stage that can
 * never be written back — see `deriveStage` in `./helpers.ts`.
 */
export const CAMPAIGN_STAGES: Record<
  CampaignStage,
  { labelKey: string; dot: string; bg: string; fg: string }
> = {
  planning: {
    labelKey: 'stagePlanning',
    dot: 'var(--pv2-faint)',
    bg: 'var(--pv2-canvas)',
    fg: 'var(--pv2-mut)',
  },
  building: {
    labelKey: 'stageBuilding',
    dot: 'var(--pv2-warning)',
    bg: 'color-mix(in srgb, var(--pv2-warning) 14%, transparent)',
    fg: 'color-mix(in srgb, var(--pv2-warning) 76%, var(--pv2-ink))',
  },
  live: {
    labelKey: 'stageLive',
    dot: 'var(--pv2-success)',
    bg: 'color-mix(in srgb, var(--pv2-success) 12%, transparent)',
    fg: 'color-mix(in srgb, var(--pv2-success) 78%, var(--pv2-ink))',
  },
  paused: {
    labelKey: 'stagePaused',
    dot: 'var(--pv2-error)',
    bg: 'color-mix(in srgb, var(--pv2-error) 10%, transparent)',
    fg: 'color-mix(in srgb, var(--pv2-error) 78%, var(--pv2-ink))',
  },
  done: {
    labelKey: 'stageDone',
    dot: 'var(--pv2-violet)',
    bg: 'color-mix(in srgb, var(--pv2-violet) 12%, transparent)',
    fg: 'var(--pv2-violet)',
  },
};

/** Tab order on the list screen. */
export const CAMPAIGN_STAGE_ORDER: CampaignStage[] = [
  'planning',
  'building',
  'live',
  'paused',
  'done',
];

/** Plan §mod-campaigns — the item state machine, with its position in the flow. */
export const ITEM_STATUS: Record<
  CampaignItemStatus,
  { labelKey: string; step: number; dot: string; fg: string }
> = {
  todo: {
    labelKey: 'itemTodo',
    step: 0,
    dot: 'var(--pv2-hair)',
    fg: 'var(--pv2-faint)',
  },
  building: {
    labelKey: 'itemBuilding',
    step: 1,
    dot: 'var(--pv2-warning)',
    fg: 'color-mix(in srgb, var(--pv2-warning) 76%, var(--pv2-ink))',
  },
  review: {
    labelKey: 'itemReview',
    step: 2,
    dot: 'var(--pv2-blue-500)',
    fg: 'var(--pv2-blue-500)',
  },
  ready: {
    labelKey: 'itemReady',
    step: 3,
    dot: 'var(--pv2-violet)',
    fg: 'var(--pv2-violet)',
  },
  live: {
    labelKey: 'itemLive',
    step: 4,
    dot: 'var(--pv2-success)',
    fg: 'color-mix(in srgb, var(--pv2-success) 78%, var(--pv2-ink))',
  },
};

export const ITEM_FLOW: CampaignItemStatus[] = [
  'todo',
  'building',
  'review',
  'ready',
  'live',
];

/** An item at `ready` or beyond counts as done for the progress bar. */
export const ITEM_DONE_STEP = 3;

/**
 * The lifecycle the campaign screen is organised around. Not a status: a phase
 * is where the work *is*, and it is derived — see `campPhase` in `./phases.ts`.
 */
export const CAMP_PHASES: Record<
  CampaignPhase,
  { labelKey: string; hintKey: string }
> = {
  plan: { labelKey: 'phasePlan', hintKey: 'phasePlanHint' },
  build: { labelKey: 'phaseBuild', hintKey: 'phaseBuildHint' },
  run: { labelKey: 'phaseRun', hintKey: 'phaseRunHint' },
  learn: { labelKey: 'phaseLearn', hintKey: 'phaseLearnHint' },
};

export const CAMP_PHASE_ORDER: CampaignPhase[] = [
  'plan',
  'build',
  'run',
  'learn',
];

/** The operating state a campaign reads as, once its numbers are in. */
export const CAMPAIGN_HEALTH: Record<
  CampaignHealthState,
  { labelKey: string; bg: string; fg: string }
> = {
  healthy: {
    labelKey: 'healthHealthy',
    bg: 'color-mix(in srgb, var(--pv2-violet) 12%, transparent)',
    fg: 'var(--pv2-violet)',
  },
  valuable: {
    labelKey: 'healthValuable',
    bg: 'color-mix(in srgb, var(--pv2-success) 14%, transparent)',
    fg: 'color-mix(in srgb, var(--pv2-success) 78%, var(--pv2-ink))',
  },
  delayed: {
    labelKey: 'healthDelayed',
    bg: 'color-mix(in srgb, var(--pv2-warning) 16%, transparent)',
    fg: 'color-mix(in srgb, var(--pv2-warning) 76%, var(--pv2-ink))',
  },
  risk: {
    labelKey: 'healthRisk',
    bg: 'var(--pv2-error)',
    fg: 'var(--pv2-paper)',
  },
  complete: {
    labelKey: 'healthComplete',
    bg: 'var(--pv2-canvas)',
    fg: 'var(--pv2-mut)',
  },
};

/**
 * Nothing ships with less than a fifth of it measured. The prototype's
 * `GOV.shipTrackFloor` — a governance dial, not a magic number: shipping an
 * untracked experience means the campaign cannot be told whether it worked.
 */
export const SHIP_TRACK_FLOOR = 0.2;

/** Below this, a live campaign's numbers are not worth believing. */
export const TRUST_FLOOR = 0.15;

/** Who the work can be assigned to. */
export const CAMPAIGN_TEAM = [
  'Toan Nguyen',
  'Maya Okonjo',
  'Linh Tran',
  'Diego Alvarez',
] as const;

/** The surfaces a campaign plans against — the same names Deploy publishes to. */
export const CAMPAIGN_CHANNELS = [
  'Web microsite',
  'Instagram',
  'Email',
  'Retail QR',
  'Paid social',
] as const;

export const CAMPAIGN_DEFAULT_CURRENCY = 'USD';

export const CAMPAIGN_DEFAULT_FILTERS: CampaignFilters = {
  stage: 'all',
  q: '',
  view: 'grid',
};

/** The wizard's four questions, in order. */
export const CAMPAIGN_WIZARD_STEPS = [
  { step: 1, titleKey: 'wizStep1', subKey: 'wizStep1Sub' },
  { step: 2, titleKey: 'wizStep2', subKey: 'wizStep2Sub' },
  { step: 3, titleKey: 'wizStep3', subKey: 'wizStep3Sub' },
  { step: 4, titleKey: 'wizStep4', subKey: 'wizStep4Sub' },
] as const;
