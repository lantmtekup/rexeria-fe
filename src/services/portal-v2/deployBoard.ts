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
    channel_ids: channelIds,
  });
  return { public_url: res.public_url };
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
