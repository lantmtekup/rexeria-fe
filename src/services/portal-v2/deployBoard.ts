/**
 * Deploy control room ← `/v1/channels` + `/v1/deploy/*` (spec §11).
 *
 * Replaces `MOCK_DEPLOY_BOARD`. No mock fallback here on purpose — see
 * `DeployWorkspace`'s own doc comment: a failed read is a real error shown
 * on the route, never a fake board pretending to be live data.
 */

import {
  mapChannel,
  mapLiveRow,
  mapReadyRow,
} from '@/lib/portal-v2/deploy/helpers';
import type {
  DeployChannel,
  LiveDeployRow,
  ReadyDeployRow,
} from '@/lib/portal-v2/deploy/types';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';
import type {
  RxConnectChannelRequest,
  RxDeployKPIsResponse,
} from '@/services/rexer-v2/types/deploy';

const message = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

export type DeployChannelsResult = {
  items: DeployChannel[];
  error: string | null;
};

export const fetchDeployChannels = async (): Promise<DeployChannelsResult> => {
  try {
    const res = await rexerV2Api.channels.list();
    return { items: (res.items ?? []).map(mapChannel), error: null };
  } catch (err) {
    return { items: [], error: message(err, 'Failed to load channels') };
  }
};

export type DeployLiveResult = {
  items: LiveDeployRow[];
  error: string | null;
};

export const fetchDeployLive = async (): Promise<DeployLiveResult> => {
  try {
    const res = await rexerV2Api.deploy.live();
    return { items: (res.items ?? []).map(mapLiveRow), error: null };
  } catch (err) {
    return {
      items: [],
      error: message(err, 'Failed to load live deployments'),
    };
  }
};

export type DeployReadyResult = {
  items: ReadyDeployRow[];
  error: string | null;
};

export const fetchDeployReady = async (): Promise<DeployReadyResult> => {
  try {
    const res = await rexerV2Api.deploy.ready();
    return { items: (res.items ?? []).map(mapReadyRow), error: null };
  } catch (err) {
    return { items: [], error: message(err, 'Failed to load ready items') };
  }
};

export type DeployKpisResult = {
  kpis: RxDeployKPIsResponse | null;
  error: string | null;
};

export const fetchDeployKpis = async (): Promise<DeployKpisResult> => {
  try {
    return { kpis: await rexerV2Api.deploy.kpis(), error: null };
  } catch (err) {
    return { kpis: null, error: message(err, 'Failed to load deploy KPIs') };
  }
};

/* ── mutations — no fallback, callers surface the real error ─────────────── */

/**
 * BE's own `public_url` is `<publicBase>/p/<slug>` — the BE API host, not a
 * link a customer should ever see. Until a brand's Web channel has its own
 * connected domain, the checkable link is a `{slug}.rexerstudio.com`
 * subdomain instead — same `/p/{slug}` route, rewritten by `middleware.ts`.
 * Wildcard DNS/Cloudflare route for `*.rexerstudio.com` is a deploy-time
 * prerequisite tracked outside this repo; until it exists this URL 404s.
 */
const SLUG_FROM_PUBLIC_URL = /\/p\/([^/?#]+)\/?$/;
const EXPERIENCE_HOST_SUFFIX = '.rexerstudio.com';

const brandedExperienceUrl = (publicUrl: string): string => {
  const slug = publicUrl.match(SLUG_FROM_PUBLIC_URL)?.[1];
  return slug ? `https://${slug}${EXPERIENCE_HOST_SUFFIX}` : publicUrl;
};

/**
 * `POST /campaigns/{id}/items/{itemId}/deploy` — the only path an item
 * reaches `live`. Same endpoint the Campaign screen's own Deploy button
 * (`CampaignItemModal`) calls.
 */
export const deployCampaignItem = async (
  campaignId: string,
  itemId: string,
  channelIds: string[]
): Promise<{ public_url: string | null }> => {
  const res = await rexerV2Api.campaigns.deploy(campaignId, itemId, {
    channels: channelIds,
  });
  return {
    public_url: res.public_url ? brandedExperienceUrl(res.public_url) : null,
  };
};

/** `POST /campaigns/{id}/items/{itemId}/pause` — live → ready. Drops every
 *  live deployment on the item; channels are not remembered server-side. */
export const pauseCampaignItem = async (
  campaignId: string,
  itemId: string
): Promise<void> => {
  await rexerV2Api.campaigns.pause(campaignId, itemId);
};

export const connectChannel = async (
  channelId: string,
  body: RxConnectChannelRequest
): Promise<DeployChannel> =>
  mapChannel(await rexerV2Api.channels.connect(channelId, body));

export const disconnectChannel = async (
  channelId: string
): Promise<{ paused_items: string[] }> => {
  const res = await rexerV2Api.channels.disconnect(channelId);
  return { paused_items: res.paused_items ?? [] };
};
