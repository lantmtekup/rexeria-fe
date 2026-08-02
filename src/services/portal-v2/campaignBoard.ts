import { CAMPAIGN_PAGE_LIMIT } from '@/lib/portal-v2/campaigns/constants';
import {
  toAdCampaignView,
  toCampaignView,
  toCreateBody,
  toUpdateBody,
} from '@/lib/portal-v2/campaigns/mapCampaign';
import type {
  CampaignDraft,
  CampaignSource,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type {
  CreateCampaignRequest,
  CreatePortalAdCampaignRequest,
  UpdateCampaignRequest,
  UpdatePortalAdCampaignRequest,
} from '@/services/rexer/types';

/**
 * The Campaigns board ← `GET /v1/campaigns`, falling back to
 * `GET /v1/portal/ads/campaigns`.
 *
 * `/v1/campaigns` is the canonical store — it is what `/portal/marketing`
 * writes to, so anything created there shows up here. It is also still mounted
 * on the BE `internal` group and answers
 * `403 ERR_FORBIDDEN "Internal-only endpoint"` to brand users
 * (`docs/be-gap-campaigns-brand-access-2026-06-14.md`). Rather than show those
 * users an empty module, a 403 falls through to the brand-scoped ads campaigns,
 * and the chosen source rides along on every row so writes land in the same
 * place the reads came from. When the BE moves `Campaign.Register` to `priv`,
 * the fallback simply stops firing — nothing here needs to change.
 *
 * No `'use client'`: the route's server component calls this for the first
 * paint and the workspace calls it again on a debounced search, exactly like
 * `fetchExperienceLibrary`.
 */

export type CampaignBoardQuery = {
  /** Free-text search — forwarded as `q`. */
  q?: string;
};

export type CampaignBoardResult = {
  items: CampaignView[];
  /** Which endpoint answered — writes must target the same one. */
  source: CampaignSource;
  error: string | null;
  /**
   * True when `/v1/campaigns` refused the caller and this board is the ads
   * fallback. The workspace surfaces it as a notice, not as an error.
   */
  degraded: boolean;
};

const message = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

const isForbidden = (err: unknown): boolean =>
  err instanceof RxApiError && err.status === 403;

export const fetchCampaignBoard = async (
  query: CampaignBoardQuery = {}
): Promise<CampaignBoardResult> => {
  const q = query.q?.trim() || undefined;
  const common = { page: 1, limit: CAMPAIGN_PAGE_LIMIT };

  try {
    const res = await rexerApi.campaigns.list({
      ...common,
      ...(q ? { q } : {}),
    });
    return {
      items: (res.items ?? []).map(toCampaignView),
      source: 'campaigns',
      error: null,
      degraded: false,
    };
  } catch (err) {
    if (!isForbidden(err)) {
      return {
        items: [],
        source: 'campaigns',
        error: message(err, 'Failed to load campaigns'),
        degraded: false,
      };
    }

    /* BE gap — `/campaigns` is internal-only. Ads campaigns are brand-scoped.
       They have no `q` parameter, so search narrows client-side on this path. */
    try {
      const res = await rexerApi.portalAds.listCampaigns(common);
      return {
        items: (res.items ?? []).map(toAdCampaignView),
        source: 'ads',
        error: null,
        degraded: true,
      };
    } catch (adsErr) {
      return {
        items: [],
        source: 'ads',
        error: message(adsErr, 'Failed to load campaigns'),
        degraded: true,
      };
    }
  }
};

export type CampaignDetailResult = {
  campaign: CampaignView | null;
  source: CampaignSource;
  error: string | null;
  degraded: boolean;
};

/** One campaign by id, with the same fallback ladder as the board. */
export const fetchCampaign = async (
  id: string
): Promise<CampaignDetailResult> => {
  try {
    const row = await rexerApi.campaigns.get(id);
    return {
      campaign: toCampaignView(row),
      source: 'campaigns',
      error: null,
      degraded: false,
    };
  } catch (err) {
    if (!isForbidden(err)) {
      return {
        campaign: null,
        source: 'campaigns',
        error: message(err, 'Failed to load campaign'),
        degraded: false,
      };
    }

    try {
      const res = await rexerApi.portalAds.getCampaign(id);
      return {
        campaign: toAdCampaignView(res.campaign),
        source: 'ads',
        error: null,
        degraded: true,
      };
    } catch (adsErr) {
      return {
        campaign: null,
        source: 'ads',
        error: message(adsErr, 'Failed to load campaign'),
        degraded: true,
      };
    }
  }
};

export const createCampaign = async (
  source: CampaignSource,
  draft: CampaignDraft
): Promise<CampaignView> => {
  const body = toCreateBody(source, draft);
  if (source === 'ads') {
    const res = await rexerApi.portalAds.createCampaign(
      body as CreatePortalAdCampaignRequest
    );
    return toAdCampaignView(res.campaign);
  }
  const row = await rexerApi.campaigns.create(body as CreateCampaignRequest);
  return toCampaignView(row);
};

export const updateCampaign = async (
  source: CampaignSource,
  id: string,
  draft: CampaignDraft,
  notesRest: Record<string, unknown>
): Promise<CampaignView> => {
  const body = toUpdateBody(source, draft, notesRest);
  if (source === 'ads') {
    const res = await rexerApi.portalAds.updateCampaign(
      id,
      body as UpdatePortalAdCampaignRequest
    );
    return toAdCampaignView(res.campaign);
  }
  const row = await rexerApi.campaigns.update(
    id,
    body as UpdateCampaignRequest
  );
  return toCampaignView(row);
};

/**
 * The catalogue behind the subject picker and the `product_id` a new campaign
 * needs on the `campaigns` source. Names only — the pickers show nothing else,
 * and the module has no business holding whole product rows.
 */
export const fetchCampaignProducts = async (): Promise<{
  products: { id: string; name: string }[];
  error: string | null;
}> => {
  try {
    const res = await rexerApi.products.list({
      status: 'active',
      page: 1,
      limit: CAMPAIGN_PAGE_LIMIT,
      sort: 'name',
    });
    return {
      products: (res.items ?? []).map(p => ({ id: p.id, name: p.name })),
      error: null,
    };
  } catch (err) {
    return { products: [], error: message(err, 'Failed to load products') };
  }
};

export const deleteCampaign = async (
  source: CampaignSource,
  id: string
): Promise<void> => {
  if (source === 'ads') {
    await rexerApi.portalAds.deleteCampaign(id);
    return;
  }
  await rexerApi.campaigns.remove(id);
};
