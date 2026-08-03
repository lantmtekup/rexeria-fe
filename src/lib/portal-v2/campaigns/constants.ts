import type {
  CampaignFilters,
  CampaignGoal,
  CampaignItemStatus,
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

/** Prototype `CAMP_TYPES` (rexer-platform-v2.html :9401). Stored in `notes.pv2`. */
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

/** `Campaign.objective` — a real v1 enum column. */
export const CAMPAIGN_GOALS: Record<CampaignGoal, { labelKey: string }> = {
  awareness: { labelKey: 'goalAwareness' },
  traffic: { labelKey: 'goalTraffic' },
  conversion: { labelKey: 'goalConversion' },
  retention: { labelKey: 'goalRetention' },
};

export const CAMPAIGN_GOAL_IDS = Object.keys(CAMPAIGN_GOALS) as CampaignGoal[];

/**
 * Display stages. `planning|live|paused|done` are the four statuses v1 stores;
 * `building` is derived at read time and is the one stage that can never be
 * written back — see `deriveStage` in `./helpers.ts`.
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

/** Seeded — the BE has no campaign-channel taxonomy of its own. */
export const CAMPAIGN_CHANNELS = [
  'Meta',
  'Google',
  'TikTok',
  'Email',
  'SMS',
] as const;

export const CAMPAIGN_DEFAULT_CURRENCY = 'USD';

export const CAMPAIGN_DEFAULT_FILTERS: CampaignFilters = {
  stage: 'all',
  q: '',
  view: 'grid',
};

/**
 * One page of results — there is no pager UI yet, and the stage tabs count off
 * whatever this call returns, so the bound has to cover the whole workspace or
 * the counts read low. Temporarily 500 (the sibling boards still sit at 50);
 * revisit together with a real pager.
 */
export const CAMPAIGN_PAGE_LIMIT = 500;
