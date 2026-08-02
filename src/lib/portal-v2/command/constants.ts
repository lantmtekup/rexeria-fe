import type {
  BlockerReason,
  CommandTabId,
  ItemStatus,
} from '@/lib/portal-v2/command/types';
import { PORTAL_V2_BASE } from '@/lib/portal-v2/nav';

export const COMMAND_TABS: {
  id: CommandTabId;
  labelKey: string;
  descKey: string;
}[] = [
  {
    id: 'portfolio',
    labelKey: 'tabPortfolio',
    descKey: 'tabPortfolioDesc',
  },
  {
    id: 'mywork',
    labelKey: 'tabMyWork',
    descKey: 'tabMyWorkDesc',
  },
  {
    id: 'recs',
    labelKey: 'tabRecs',
    descKey: 'tabRecsDesc',
  },
];

export const ITEM_STATUS_STEP: Record<ItemStatus, number> = {
  todo: 0,
  building: 1,
  review: 2,
  ready: 3,
  live: 4,
};

export const COMMAND_LINKS = {
  campaigns: `${PORTAL_V2_BASE}/campaigns`,
  deploy: `${PORTAL_V2_BASE}/deploy`,
  journeys: `${PORTAL_V2_BASE}/journeys`,
  intel: `${PORTAL_V2_BASE}/ai`,
  media: `${PORTAL_V2_BASE}/media`,
  brand: `${PORTAL_V2_BASE}/brand`,
} as const;

/**
 * The plan asks the Command Center to be the shortcut back into the three
 * places work actually gets unblocked, so they sit in the header band rather
 * than behind the rail.
 */
export const COMMAND_SHORTCUTS: {
  id: keyof typeof COMMAND_LINKS;
  labelKey: string;
}[] = [
  { id: 'campaigns', labelKey: 'shortcutCampaigns' },
  { id: 'deploy', labelKey: 'shortcutDeploy' },
  { id: 'media', labelKey: 'shortcutMedia' },
];

/** Reason a built experience cannot ship, and how loudly to say it. */
export const BLOCKER_STYLE: Record<
  BlockerReason,
  { labelKey: string; tone: 'error' | 'warning' }
> = {
  'media-expired': { labelKey: 'reasonMediaExpired', tone: 'error' },
  'missing-channel': { labelKey: 'reasonMissingChannel', tone: 'error' },
  'brand-approval': { labelKey: 'reasonBrandApproval', tone: 'warning' },
  'no-owner': { labelKey: 'reasonNoOwner', tone: 'warning' },
};

export const KPI_ACCENT: Record<
  'violet' | 'mint' | 'amber' | 'blue' | 'rose',
  { dot: string; value?: string }
> = {
  violet: { dot: 'var(--pv2-violet)' },
  mint: { dot: 'var(--pv2-success)' },
  amber: { dot: 'var(--pv2-warning)' },
  blue: { dot: 'var(--pv2-electric)' },
  rose: { dot: 'var(--pv2-error)' },
};

export const HEALTH_COLOR: Record<'ok' | 'quiet' | 'stale' | 'broken', string> =
  {
    ok: 'var(--pv2-success)',
    quiet: 'var(--pv2-warning)',
    stale: 'var(--pv2-warning)',
    broken: 'var(--pv2-error)',
  };

export const CAMP_STATUS_STYLE: Record<
  string,
  { bg: string; fg: string; labelKey: string }
> = {
  planning: {
    bg: 'var(--pv2-canvas)',
    fg: 'var(--pv2-mut)',
    labelKey: 'statusPlanning',
  },
  building: {
    bg: 'color-mix(in srgb, var(--pv2-warning) 14%, transparent)',
    fg: 'var(--pv2-warning)',
    labelKey: 'statusBuilding',
  },
  live: {
    bg: 'color-mix(in srgb, var(--pv2-success) 14%, transparent)',
    fg: 'var(--pv2-success)',
    labelKey: 'statusLive',
  },
  done: {
    bg: 'var(--pv2-electric-soft)',
    fg: 'var(--pv2-violet)',
    labelKey: 'statusDone',
  },
};
