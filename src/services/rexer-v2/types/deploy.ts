/**
 * Deploy control room v2 (spec §11) — `/v1/channels` + `/v1/deploy/*`, plus
 * the two campaign-item actions BE nests under `/campaigns` (`deploy`/`pause`,
 * declared alongside `RxCampaignItem` on `./campaign.ts`).
 *
 * `item` on the two views below is a full `RxCampaignItem` (`./campaign.ts`)
 * — `NewLiveItemView`/`NewReadyItemView` on the BE serialize the same
 * `CampaignItemV2` the Campaigns screen already reads, `experiences[]`
 * included, not a thinner projection.
 *
 * Convention: snake_case wire shapes, `*T` → `T | null`, `omitempty` → optional.
 */

import type { RxCampaignItem } from './campaign';

/** `models.ChannelKind*` — 7 fixed kinds, lazily created per brand. */
export type RxChannelKind =
  | 'web'
  | 'instagram'
  | 'email'
  | 'qr'
  | 'paid_social'
  | 'shopify'
  | 'booking';

export type RxChannelStatus = 'connected' | 'disconnected' | 'error';

/** `core.DeploymentHealth` (spec §11.3). */
export type RxDeployHealth = 'ok' | 'stale' | 'quiet' | 'broken';

/** `ChannelView` — `GET /channels` row, one per (brand, kind). `config` shape
 *  depends on `kind`: `{domain_id}` for `web`, `{shop_domain, token}` for
 *  `shopify`, `{}` otherwise. Note: NOT the raw `DeployChannel` model —
 *  no `brand_id`/`created_at`/`updated_at`, and `connected_at` instead. */
export type RxChannel = {
  id: string;
  kind: RxChannelKind;
  name: string;
  /** Any live deployment currently on this channel. */
  live: boolean;
  status: RxChannelStatus;
  connected_at: string | null;
  config: Record<string, unknown>;
};

export type RxChannelListResponse = { items: RxChannel[]; total: number };

export type RxDeployedExperience = {
  page_id: string;
  name: string;
  status: string;
  deployment_id: string;
};

export type RxChannelLiveGroup = {
  campaign_id: string;
  campaign_name: string;
  experiences: RxDeployedExperience[];
  sessions_24h: number;
};

export type RxChannelIssue = {
  /** `channel_error` | `domain_failed`. */
  kind: string;
  message: string;
};

export type RxJourneyEntering = {
  journey_id: string;
  name: string;
  entry_node_key: string;
  entry_signal?: { kind: string; value: string } | null;
};

/** `GET /channels/{id}` — adds the real per-campaign `sessions_24h`, the one
 *  surface that carries it, plus operational issues and which journeys enter
 *  through this channel. */
export type RxChannelDetail = {
  channel: RxChannel;
  live_by_campaign: RxChannelLiveGroup[];
  issues: RxChannelIssue[];
  journeys_entering: RxJourneyEntering[];
};

/** `POST /channels/{id}/connect` body — shape per `kind` (spec §11.1):
 *  `web` needs `domain_id`, `shopify` needs `shop_domain` + `token`,
 *  everything else needs nothing. */
export type RxConnectChannelRequest = {
  domain_id?: string;
  shop_domain?: string;
  token?: string;
  config?: Record<string, unknown>;
};

/** `POST /channels/{id}/disconnect` — side effect is pausing every live
 *  deployment on the channel. `paused_items` is only the items that lost
 *  their LAST live channel by this; `affected_deployments` is every
 *  deployment paused, including items that stayed live elsewhere. */
export type RxDisconnectChannelResponse = {
  channel: RxChannel;
  paused_items: string[];
  affected_deployments: string[];
};

/** One channel an item is live on, plus that channel's own health — health is
 *  PER CHANNEL, not per item. */
export type RxItemChannelHealth = {
  channel_id: string;
  kind: RxChannelKind;
  name: string;
  deployment_id: string;
  health: RxDeployHealth;
  health_reason: string;
};

/** `ProductCampaignSummary` — deliberately thin; the full `Campaign` record
 *  lives on `./campaign.ts`'s `RxCampaign`, not on these control-room reads. */
export type RxCampaignSummary = {
  id: string;
  name: string;
  status: string;
};

/** `GET /deploy/live` row — `NewLiveItemView`. `public_url` is `omitempty` —
 *  empty when the item's page has no slug yet (should not happen for a
 *  genuinely live item, but never assume). */
export type RxLiveItemView = {
  item: RxCampaignItem;
  campaign: RxCampaignSummary;
  channels: RxItemChannelHealth[];
  public_url?: string;
};

export type RxDeployLiveResponse = { items: RxLiveItemView[]; total: number };

/** `GET /deploy/ready` row — `NewReadyItemView`. `blockers` is `omitempty` —
 *  absent (not `[]`) when the item is clear, precomputed media-rights text
 *  otherwise; every other Deploy precondition only surfaces as a 409 at
 *  deploy time. */
export type RxReadyItemView = {
  item: RxCampaignItem;
  campaign: RxCampaignSummary;
  blockers?: string[];
};

export type RxDeployReadyResponse = {
  items: RxReadyItemView[];
  total: number;
};

/** `normalizeWindow` only recognizes `'7d'` — anything else (including
 *  omitted) falls back to `'24h'` server-side. */
export type RxKPIWindow = '24h' | '7d';

/** One by-channel-KIND rollup line. `channel` is the kind string
 *  (`models.FactChannelToKind`'s output, e.g. `'web'`/`'instagram'`) despite
 *  the field's name — it is not the raw `fact_daily.channel` token. */
export type RxKPIChannelRow = {
  channel: RxChannelKind;
  sessions: number;
  converted: number;
  revenue_cents: number;
};

/** `GET /deploy/kpis` — brand-wide rollup, by channel KIND, current window.
 *  Not by item, not by campaign — that grain does not exist on this route. */
export type RxDeployKPIsResponse = {
  window: RxKPIWindow;
  sessions: number;
  converted: number;
  revenue_cents: number;
  by_channel: RxKPIChannelRow[];
};

/** `POST /campaigns/{id}/items/{itemId}/deploy` body. Wire field is
 *  `channels`, not `channel_ids` — BE `validate:"required,min=1,dive,uuid"`,
 *  so an empty array 400s at the request-validation layer, before it ever
 *  reaches `core.CheckDeployPreconditions`. */
export type RxDeployItemRequest = {
  channels: string[];
};

export type RxDeployment = {
  id: string;
  brand_id: string;
  campaign_item_id: string;
  channel_id: string;
  page_id: string;
  status: 'live' | 'paused';
  deployed_at: string;
  paused_at: string | null;
  created_at: string;
  updated_at: string;
};

/** `public_url`/`tracking_plan_version` are both `omitempty` — absent (not
 *  `null`) when the deployed page has no slug / no active release, which
 *  should not happen on a deploy that just succeeded but is never assumed. */
export type RxDeployItemResponse = {
  item: RxCampaignItem;
  deployments: RxDeployment[];
  public_url?: string;
  tracking_plan_version?: number;
};
