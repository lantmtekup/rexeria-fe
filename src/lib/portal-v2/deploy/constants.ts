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
  DeployDomainStatus,
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

export type DeployDomainStatusStyle = {
  labelKey: string;
  /** What the state means — the pill's `title`. */
  hintKey: string;
  dot: string;
  bg: string;
  fg: string;
};

/**
 * The domain pill's four states — same shape as `DEPLOY_HEALTH`, a different
 * question. Health asks whether the experience is serving; this asks whether
 * the hostname in front of it actually resolves.
 */
export const DEPLOY_DOMAIN_STATUS: Record<
  DeployDomainStatus,
  DeployDomainStatusStyle
> = {
  pending: {
    labelKey: 'domainPending',
    hintKey: 'domainPendingHint',
    dot: 'var(--pv2-mut)',
    bg: 'color-mix(in srgb, var(--pv2-mut) 12%, transparent)',
    fg: 'var(--pv2-mut)',
  },
  verifying: {
    labelKey: 'domainVerifying',
    hintKey: 'domainVerifyingHint',
    dot: 'var(--pv2-electric)',
    bg: 'var(--pv2-electric-soft)',
    fg: 'var(--pv2-electric)',
  },
  connected: {
    labelKey: 'domainConnected',
    hintKey: 'domainConnectedHint',
    dot: 'var(--pv2-success)',
    bg: 'color-mix(in srgb, var(--pv2-success) 12%, transparent)',
    fg: 'color-mix(in srgb, var(--pv2-success) 78%, var(--pv2-ink))',
  },
  error: {
    labelKey: 'domainError',
    hintKey: 'domainErrorHint',
    dot: 'var(--pv2-error)',
    bg: 'color-mix(in srgb, var(--pv2-error) 10%, transparent)',
    fg: 'color-mix(in srgb, var(--pv2-error) 78%, var(--pv2-ink))',
  },
};

/**
 * The only channel hosted on a domain of its own. Kept as one named constant
 * rather than a literal `'ch1'` scattered through helpers and panes.
 */
export const DEPLOY_DOMAIN_CHANNEL_ID = 'ch1';

/**
 * The CNAME target every connected domain points at. `/portal/profile/domains`
 * hardcodes this exact same value client-side — the BE's `verify` response
 * carries `dns_records` but that page ignores them and reconstructs the
 * record from convention, so this route does the same rather than disagree
 * with the page a person may already have this domain open in.
 */
export const DEPLOY_DNS_CNAME_TARGET = 'edge.rexer-edge.com.';

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
