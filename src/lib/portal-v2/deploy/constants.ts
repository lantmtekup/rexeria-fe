/**
 * Portal V2 — Deploy vocabulary.
 *
 * The prototype's tables (`DTABS` ~L18270, `HEALTH` ~L18289) remapped onto
 * Studio tokens, then cross-checked against `models.ChannelKinds` (spec
 * §11.1) once the real BE shipped — 7 kinds, not the prototype's 6: `booking`
 * (migration 000069) is a deposit/reservation gateway with no FE precedent to
 * port a name/icon from, so its copy is new here, not translated from
 * anywhere. Chrome is translated; the vocabulary of the model stays English —
 * the same decision Brand, Journeys and Experiences already made.
 */

import type {
  DeployChannelKind,
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
  { id: 'domains', labelKey: 'tabDomains', questionKey: 'questionDomains' },
];

/**
 * `core.CheckDeployPreconditions` (be-ReXeR.ai) reasons that are fixed
 * English sentences (no item-specific detail baked in) → the i18n key with a
 * friendly localized version. The Ready queue's proactive `blockers` and a
 * failed deploy's 409 both surface these verbatim from the BE, so both read
 * as raw English inside an otherwise Vietnamese screen without this map.
 *
 * A reason NOT in this map (media-rights ones name the specific asset/
 * territory) passes through unchanged — it is already informative on its own
 * and translating it would have to either drop that detail or template it,
 * neither worth it for a message this rare.
 */
export const DEPLOY_REASON_KEY: Record<string, string> = {
  'no experience copy has an active published release to deploy':
    'deployNeedsPublishedRelease',
  'a campaign journey has an unresolved experience node':
    'deployNeedsResolvedJourney',
  'one or more selected channels are not connected':
    'deployNeedsConnectedChannel',
};

export type DeployHealthStyle = {
  labelKey: string;
  /** What the state means — the cell's `title`, used as a fallback when the
   *  BE's own `health_reason` for this instance is not available. */
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
  hintKey: string;
  dot: string;
  bg: string;
  fg: string;
};

/** The domain pill's four states — same shape as `DEPLOY_HEALTH`, a different
 *  question: not whether the experience is serving, but whether the hostname
 *  in front of the Web channel actually resolves. */
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

/** The only channel kind hosted on a domain of its own. */
export const DEPLOY_WEB_CHANNEL_KIND: DeployChannelKind = 'web';

/** CNAME target dùng cho fallback khi list endpoint không trả `dns_records`.
 *  PHẢI khớp đúng BE (`custom_domain` usecase `edgeCNAME` mặc định
 *  `edge.rexer-edge.com`, KHÔNG có dấu chấm cuối) — trước đây để
 *  `edge.rexer-edge.com.` gây lệch với record thật. Khi có `dns_records`
 *  từ create thì UI ưu tiên dùng records thật, không đụng hằng này. */
export const DEPLOY_DNS_CNAME_TARGET = 'edge.rexer-edge.com';

export type DeployChannelKindStyle = {
  /** Two-character mark for the square badge. */
  abbr: string;
  /** Studio token used as the badge fill. */
  tint: string;
  bodyKey: string;
};

/** `DATA.channels`' per-kind chrome — name comes from the BE (`channel.name`),
 *  everything else (badge mark, tint, one-line description) is local chrome
 *  keyed by `kind` since the BE gives no visual metadata. */
export const DEPLOY_CHANNEL_KIND: Record<
  DeployChannelKind,
  DeployChannelKindStyle
> = {
  web: {
    abbr: 'W',
    tint: 'var(--pv2-violet)',
    bodyKey: 'channelBodyWeb',
  },
  instagram: {
    abbr: 'IG',
    tint: 'var(--pv2-error)',
    bodyKey: 'channelBodyInstagram',
  },
  email: {
    abbr: '@',
    tint: 'var(--pv2-warning)',
    bodyKey: 'channelBodyEmail',
  },
  qr: {
    abbr: 'QR',
    tint: 'var(--pv2-blue-500)',
    bodyKey: 'channelBodyQr',
  },
  paid_social: {
    abbr: 'PS',
    tint: 'var(--pv2-success)',
    bodyKey: 'channelBodyPaidSocial',
  },
  shopify: {
    abbr: 'S',
    tint: 'var(--pv2-slate-500)',
    bodyKey: 'channelBodyShopify',
  },
  booking: {
    abbr: 'B',
    tint: 'var(--pv2-cyan)',
    bodyKey: 'channelBodyBooking',
  },
};

/** The tab a fresh visit opens on — what is out there comes first. */
export const DEPLOY_DEFAULT_TAB: DeployTabId = 'live';
