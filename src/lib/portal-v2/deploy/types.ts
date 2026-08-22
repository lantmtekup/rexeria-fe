/**
 * Portal V2 — Deploy model.
 *
 * Ported from `plan-v2/rexer-platform-v2.html` (`deployView` ~L18441,
 * `DATA.channels` ~L7778, `HEALTH` ~L18289) against `plan-v2/index.html`
 * §`#mod-deploy`, then re-shaped a second time against the REAL BE contract
 * (`be-ReXeR.ai/internal/domain/models/deploy.go`, spec §11) once it shipped.
 *
 * DEPLOY IS OPERATIONAL, NOT ANALYTICAL. The numbers on this route are the
 * ones you check before you push something out, or the morning after you did:
 * is it serving, is it reporting, is anything broken. Funnels, attribution and
 * insight belong to the AI route — nothing here duplicates them.
 *
 * ONE PLACE STATE CHANGES. The plan is explicit: LIVE only happens through
 * Deploy — `POST /campaigns/{id}/items/{itemId}/deploy` is the only path an
 * item reaches `status: 'live'` (`core.CheckDeployPreconditions` refuses the
 * item-status PATCH from setting it). Campaigns mark work `ready`; this route
 * turns that into `live`.
 *
 * WHAT THE REAL BE DOES NOT GIVE YOU, so this file does not invent it:
 *   - Per-item sessions / cvr / trend / revenue. `GET /deploy/live` and
 *     `/deploy/ready` carry per-CHANNEL health only; the only real numbers
 *     are the brand-wide `GET /deploy/kpis` rollup (by channel kind) and,
 *     inside one channel's own detail (`GET /channels/{id}`), real
 *     `sessions_24h` per campaign group.
 *   - A domain picked PER ROW. A brand has at most one `web` channel, and its
 *     domain is bound once at CONNECT time (`ConnectChannelRequest.domain_id`)
 *     — not chosen per deployment. The domain picker therefore lives on the
 *     Web channel's connect flow, not on a Ready row.
 *   - A hard "domain must be connected" gate on Deploy. `core.
 *     CheckDeployPreconditions` never checks domain status — only item
 *     status, an active release, all-selected-channels-connected, resolved
 *     journeys, and media rights. Domain health only ever downgrades a LIVE
 *     row's `health` after the fact.
 */

/** The three tabs, in the order a person actually works. */
export type DeployTabId = 'live' | 'ready' | 'channels';

/**
 * `core.DeploymentHealth` (spec §11.3). Operational, not analytical: is the
 * thing working, not is it good. `quiet` is live-but-silent, a different
 * failure from `broken` (channel error / domain broken / release missing).
 */
export type DeployHealth = 'ok' | 'stale' | 'quiet' | 'broken';

/** `models.ChannelKind*` — 7 fixed kinds, lazily created per brand. */
export type DeployChannelKind =
  | 'web'
  | 'instagram'
  | 'email'
  | 'qr'
  | 'paid_social'
  | 'shopify'
  | 'booking';

export type DeployChannelStatus = 'connected' | 'disconnected' | 'error';

/**
 * A publishing surface — `GET /channels`. One row per (brand, kind); the BE
 * lazily creates all 7 on first read, so this is never a partial list.
 */
export type DeployChannel = {
  id: string;
  kind: DeployChannelKind;
  name: string;
  status: DeployChannelStatus;
  connected: boolean;
  /** Derived by the BE — any live deployment currently on this channel. */
  live: boolean;
  /** `config.domain_id` — only ever set for `kind: 'web'`. */
  domainId: string | null;
};

/** Four states — the BE's three (`pending|verifying|verified|failed` on
 *  `BrandDomain`) folded the same way `mapBrandDomain` already folds them for
 *  `/portal/profile/domains`, so a never-checked domain never reads the same
 *  as one that actually cleared a check. */
export type DeployDomainStatus =
  | 'pending'
  | 'verifying'
  | 'connected'
  | 'error';

/** The brand's own domain — mapped from `BrandDomain`
 *  (`@/services/rexer/types`) the same way `/portal/profile/domains` does. */
export type DeployBrandDomain = {
  id: string;
  domain: string;
  status: DeployDomainStatus;
  verificationToken: string;
  failureReason: string | null;
};

export type DeploySubjectKind = 'product' | 'topic';

/** One experience copy deployed on an item — `CampaignItemV2.experiences[]`. */
export type DeployExperience = {
  id: string;
  name: string;
  thumbnailUrl: string | null;
};

/** `ProductCampaignSummary` — deliberately thin. No type/owner/dates: those
 *  live on the full `Campaign` record the Campaigns screen already reads,
 *  not on the Deploy control-room endpoints. */
export type DeployCampaignSummary = {
  id: string;
  name: string;
  status: string;
};

/** One channel an item is live on, plus that channel's own health. Health is
 *  PER CHANNEL, not per row — the same item can be `ok` on Email and `broken`
 *  on the Web microsite at once. */
export type DeployChannelHealth = {
  channelId: string;
  kind: DeployChannelKind;
  name: string;
  deploymentId: string;
  health: DeployHealth;
  /** `core.DeploymentHealth`'s human reason, verbatim — not re-derived. */
  reason: string;
};

/** One row of the Live tab — `LiveItemView`. */
export type LiveDeployRow = {
  id: string;
  campaignId: string;
  campaign: DeployCampaignSummary;
  kind: DeploySubjectKind;
  /** The subject's display name — from the item's own experience subject, or
   *  `topic_name` when no experience carries one yet. `null` means genuinely
   *  unresolved, never a fabricated id string. */
  subjectName: string | null;
  experiences: DeployExperience[];
  ownerId: string | null;
  channels: DeployChannelHealth[];
  /** The shareable address — `null` when the BE couldn't resolve a slug
   *  (should not happen for a genuinely live item, but never assume). */
  publicUrl: string | null;
  /** `RxCampaignItem.product_id` — already on the wire, just not surfaced
   *  here before. `null` for a topic subject (`kind === 'topic'`). */
  productId: string | null;
};

/** One row of the Ready tab — `ReadyItemView`. */
export type ReadyDeployRow = {
  id: string;
  campaignId: string;
  campaign: DeployCampaignSummary;
  kind: DeploySubjectKind;
  subjectName: string | null;
  experiences: DeployExperience[];
  ownerId: string | null;
  /** Media-rights (and other precomputed) reasons this item would fail Deploy
   *  right now. Empty when clear. Shown verbatim — BE-owned text. */
  blockers: string[];
};

/** The five numbers the header band states — `deployTotals`. */
export type DeployTotals = {
  live: number;
  ready: number;
  /** From `GET /deploy/kpis`, brand-wide, current window. `null` before the
   *  KPI call has resolved — never a silent 0. */
  sessions: number | null;
  revenue: number | null;
  /** Mean conversion across the window, formatted — `'—'` when unmeasured. */
  cvr: string;
  /** Live rows whose worst channel health is not `ok`. */
  issues: number;
  /** Channels the BE reports as `live: true` — carrying at least one live
   *  deployment right now. */
  channels: number;
};

/** One campaign's live rows, grouped for the Live tab's section headers. */
export type DeployCampaignGroup = {
  campaign: DeployCampaignSummary;
  rows: LiveDeployRow[];
  /** Rows whose worst channel health is not `ok`. */
  issues: number;
};
