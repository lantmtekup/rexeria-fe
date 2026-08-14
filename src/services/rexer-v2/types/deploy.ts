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

/** `GET /channels` row — one per (brand, kind). `config` shape depends on
 *  `kind`: `{domain_id}` for `web`, `{shop_domain}` for `shopify`, `{}`
 *  otherwise. */
export type RxChannel = {
  id: string;
  brand_id: string;
  kind: RxChannelKind;
  name: string;
  status: RxChannelStatus;
  /** Any live deployment currently on this channel. */
  live: boolean;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type RxChannelListResponse = { items: RxChannel[] };

/** `GET /channels/{id}` — adds real per-campaign `sessions_24h`, the one
 *  surface that carries it. */
export type RxChannelDetail = RxChannel & {
  campaigns: Array<{
    campaign_id: string;
    campaign_name: string;
    sessions_24h: number;
  }>;
};

/** `POST /channels/{id}/connect` body — shape per `kind` (spec §11.1):
 *  `web` needs `domain_id`, `shopify` needs `shop_domain` + `token`,
 *  everything else needs nothing. */
export type RxConnectChannelRequest = {
  domain_id?: string;
  shop_domain?: string;
  token?: string;
};

/** `POST /channels/{id}/disconnect` — side effect is pausing every live
 *  deployment on the channel; `paused_items` is only the items that lost
 *  their LAST live channel by this. */
export type RxDisconnectChannelResponse = {
  channel: RxChannel;
  paused_items: string[];
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

/** `GET /deploy/live` row — `NewLiveItemView`. */
export type RxLiveItemView = {
  item: RxCampaignItem;
  campaign: RxCampaignSummary;
  channels: RxItemChannelHealth[];
};

export type RxDeployLiveResponse = { items: RxLiveItemView[] };

/** `GET /deploy/ready` row — `NewReadyItemView`. `blockers` is precomputed
 *  media-rights text; every other Deploy precondition only surfaces as a 409
 *  at deploy time. */
export type RxReadyItemView = {
  item: RxCampaignItem;
  campaign: RxCampaignSummary;
  blockers: string[];
};

export type RxDeployReadyResponse = { items: RxReadyItemView[] };

export type RxKPIWindow = '24h' | '7d' | '30d';

/** `GET /deploy/kpis` — brand-wide rollup, by channel KIND, current window.
 *  Not by item, not by campaign — that grain does not exist on this route. */
export type RxDeployKPIsResponse = {
  window: RxKPIWindow;
  sessions: number;
  converted: number;
  revenue_cents: number;
  by_channel_kind: Array<{
    kind: RxChannelKind;
    sessions: number;
    converted: number;
    revenue_cents: number;
  }>;
};

/** `POST /campaigns/{id}/items/{itemId}/deploy` body. */
export type RxDeployItemRequest = {
  channel_ids: string[];
};

/** `public_url` is only set once the `web` channel is among the deployed
 *  ones and its domain is connected — `null` otherwise, never a guess. */
export type RxDeployItemResponse = {
  item: RxCampaignItem;
  public_url: string | null;
};
