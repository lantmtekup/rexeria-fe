/**
 * Portal V2 — Deploy vocabulary.
 *
 * The prototype's tables (`DTABS` ~L18270, `HEALTH` ~L18289, `CAMP_TYPES`
 * ~L9401, `DATA.expCats`) remapped onto Studio tokens. Chrome is translated;
 * the vocabulary of the model stays English — the same decision Brand,
 * Journeys and Experiences already made.
 */

import type {
  DeployCampaignType,
  DeployHealth,
  DeployTabId,
} from '@/lib/portal-v2/deploy/types';

/** `DTABS` — each tab opens by naming the question it answers. */
export const DEPLOY_TABS: {
  id: DeployTabId;
  labelKey: string;
  questionKey: string;
}[] = [
  { id: 'live', labelKey: 'tabLive', questionKey: 'questionLive' },
  { id: 'ready', labelKey: 'tabReady', questionKey: 'questionReady' },
  { id: 'channels', labelKey: 'tabChannels', questionKey: 'questionChannels' },
];

export type DeployHealthStyle = {
  labelKey: string;
  /** What the state means — the cell's `title`. */
  hintKey: string;
  dot: string;
  bg: string;
  fg: string;
};

/**
 * `HEALTH` — four states, two of which are amber. `stale` and `quiet` are not
 * the same problem (untouched vs. not reporting) and the hint says which.
 */
export const DEPLOY_HEALTH: Record<DeployHealth, DeployHealthStyle> = {
  ok: {
    labelKey: 'healthOk',
    hintKey: 'healthOkHint',
    dot: 'var(--pv2-success)',
    bg: 'color-mix(in srgb, var(--pv2-success) 12%, transparent)',
    fg: 'color-mix(in srgb, var(--pv2-success) 78%, var(--pv2-ink))',
  },
  stale: {
    labelKey: 'healthStale',
    hintKey: 'healthStaleHint',
    dot: 'var(--pv2-warning)',
    bg: 'color-mix(in srgb, var(--pv2-warning) 14%, transparent)',
    fg: 'color-mix(in srgb, var(--pv2-warning) 76%, var(--pv2-ink))',
  },
  quiet: {
    labelKey: 'healthQuiet',
    hintKey: 'healthQuietHint',
    dot: 'var(--pv2-warning)',
    bg: 'color-mix(in srgb, var(--pv2-warning) 14%, transparent)',
    fg: 'color-mix(in srgb, var(--pv2-warning) 76%, var(--pv2-ink))',
  },
  broken: {
    labelKey: 'healthBroken',
    hintKey: 'healthBrokenHint',
    dot: 'var(--pv2-error)',
    bg: 'color-mix(in srgb, var(--pv2-error) 10%, transparent)',
    fg: 'color-mix(in srgb, var(--pv2-error) 78%, var(--pv2-ink))',
  },
};

/** `CAMP_TYPES` — the group header's mark, so live work reads by campaign. */
export const DEPLOY_CAMPAIGN_TYPE: Record<
  DeployCampaignType,
  { labelKey: string; tint: string }
> = {
  launch: { labelKey: 'typeLaunch', tint: 'var(--pv2-violet)' },
  seasonal: { labelKey: 'typeSeasonal', tint: 'var(--pv2-warning)' },
  sale: { labelKey: 'typeSale', tint: 'var(--pv2-error)' },
  always: { labelKey: 'typeAlways', tint: 'var(--pv2-blue-500)' },
  retention: { labelKey: 'typeRetention', tint: 'var(--pv2-success)' },
};

/** `DATA.expCats` — the sub-label under an experience name. */
export const DEPLOY_EXPERIENCE_CATEGORY: Record<string, string> = {
  microsite: 'Microsite',
  showcase: 'Product showcase',
  curated: 'Curated edit',
  ads: 'Ad unit',
};

/** The tab a fresh visit opens on — what is out there comes first. */
export const DEPLOY_DEFAULT_TAB: DeployTabId = 'live';
