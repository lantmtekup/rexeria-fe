import {
  CAMPAIGN_DEFAULT_CURRENCY,
  CAMPAIGN_GOAL_IDS,
} from '@/lib/portal-v2/campaigns/constants';
import {
  emptyBrief,
  readCampaignNotes,
  writeCampaignNotes,
} from '@/lib/portal-v2/campaigns/notes';
import type {
  CampaignDraft,
  CampaignGoal,
  CampaignSource,
  CampaignStatus,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';
import type {
  Campaign,
  CreateCampaignRequest,
  CreatePortalAdCampaignRequest,
  PortalAdCampaign,
  SimpleDate,
} from '@/services/rexer/types';

/**
 * Wire ↔ view for both campaign endpoints.
 *
 * The two BE shapes are near-identical; the differences that matter are
 * `product_id` (required on `/v1/campaigns`, absent on ads) and how dates come
 * back. Everything downstream of this file sees one `CampaignView`.
 */

const STATUSES: CampaignStatus[] = ['draft', 'active', 'paused', 'completed'];

/** Go's zero time — the BE sends it for "unset", and it is not a real date. */
const isZeroTime = (iso: string): boolean => iso.startsWith('0001-01-01');

/**
 * v1 hands dates back wrapped (`{ 'time.Time': iso }`) but only accepts plain
 * `YYYY-MM-DD` on write — sending the wrapper back 400s with `bind_error`.
 * Normalising to the write format on read means the draft is always sendable.
 */
export const toDateString = (
  value: SimpleDate | string | undefined | null
): string | null => {
  const iso = typeof value === 'string' ? value : value?.['time.Time'];
  if (!iso || isZeroTime(iso)) return null;
  const day = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
};

const toStatus = (value: string | undefined): CampaignStatus =>
  STATUSES.includes(value as CampaignStatus)
    ? (value as CampaignStatus)
    : 'draft';

const toGoal = (value: string | undefined): CampaignGoal | null =>
  CAMPAIGN_GOAL_IDS.includes(value as CampaignGoal)
    ? (value as CampaignGoal)
    : null;

/** `GET /v1/campaigns` row → view. */
export const toCampaignView = (row: Campaign): CampaignView => {
  const { pv2, rest } = readCampaignNotes(row.notes);
  return {
    id: row.id,
    source: 'campaigns',
    name: row.name,
    status: toStatus(row.status),
    goal: toGoal(typeof row.objective === 'string' ? row.objective : undefined),
    channels: row.channels ?? [],
    budgetAmount: row.budget_amount ?? null,
    budgetCurrency: row.budget_currency || CAMPAIGN_DEFAULT_CURRENCY,
    startDate: toDateString(row.start_date),
    endDate: toDateString(row.end_date),
    productId: row.product_id || null,
    landingPageId: row.landing_page_id || null,
    trackedUrl: row.tracked_url || null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    type: pv2?.type ?? 'launch',
    owner: pv2?.owner ?? '',
    brief: pv2?.brief ?? emptyBrief(),
    items: pv2?.items ?? [],
    notesRest: rest,
  };
};

/** `GET /v1/portal/ads/campaigns` row → the same view. */
export const toAdCampaignView = (row: PortalAdCampaign): CampaignView => {
  const { pv2, rest } = readCampaignNotes(row.notes);
  return {
    id: row.id,
    source: 'ads',
    name: row.name,
    status: toStatus(typeof row.status === 'string' ? row.status : undefined),
    goal: toGoal(typeof row.objective === 'string' ? row.objective : undefined),
    channels: row.channels ?? [],
    budgetAmount: row.budget_amount ?? null,
    budgetCurrency: row.budget_currency || CAMPAIGN_DEFAULT_CURRENCY,
    startDate: toDateString(row.start_date),
    endDate: toDateString(row.end_date),
    /* Ads campaigns are channel-level and carry no product FK. */
    productId: null,
    landingPageId: null,
    trackedUrl: null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    type: pv2?.type ?? 'launch',
    owner: pv2?.owner ?? '',
    brief: pv2?.brief ?? emptyBrief(),
    items: pv2?.items ?? [],
    notesRest: rest,
  };
};

/** The half of the body both endpoints share. */
const commonBody = (
  draft: CampaignDraft,
  notesRest: Record<string, unknown>
) => ({
  name: draft.name.trim(),
  status: draft.status,
  channels: draft.channels,
  ...(draft.goal ? { objective: draft.goal } : {}),
  ...(draft.budgetAmount === null
    ? {}
    : {
        budget_amount: draft.budgetAmount,
        budget_currency: draft.budgetCurrency,
      }),
  ...(draft.startDate ? { start_date: draft.startDate } : {}),
  ...(draft.endDate ? { end_date: draft.endDate } : {}),
  notes: writeCampaignNotes(notesRest, {
    v: 1,
    type: draft.type,
    owner: draft.owner.trim(),
    brief: draft.brief,
    items: draft.items,
  }),
});

/**
 * `product_id` is required by `/v1/campaigns` and rejected as unknown by ads;
 * the create form therefore only asks for it on the `campaigns` source.
 */
export const toCreateBody = (
  source: CampaignSource,
  draft: CampaignDraft,
  notesRest: Record<string, unknown> = {}
): CreateCampaignRequest | CreatePortalAdCampaignRequest => {
  const body = commonBody(draft, notesRest);
  if (source === 'ads') return body as CreatePortalAdCampaignRequest;
  return {
    ...body,
    product_id: draft.productId ?? '',
  } as CreateCampaignRequest;
};

export const toUpdateBody = (
  source: CampaignSource,
  draft: CampaignDraft,
  notesRest: Record<string, unknown>
): Partial<CreateCampaignRequest> | Partial<CreatePortalAdCampaignRequest> => {
  const body = commonBody(draft, notesRest);
  if (source === 'ads') return body as Partial<CreatePortalAdCampaignRequest>;
  return {
    ...body,
    ...(draft.productId ? { product_id: draft.productId } : {}),
  } as Partial<CreateCampaignRequest>;
};

/** View → editable draft (drops server-owned fields). */
export const toDraft = (view: CampaignView): CampaignDraft => ({
  name: view.name,
  type: view.type,
  goal: view.goal,
  owner: view.owner,
  status: view.status,
  channels: [...view.channels],
  budgetAmount: view.budgetAmount,
  budgetCurrency: view.budgetCurrency,
  startDate: view.startDate,
  endDate: view.endDate,
  productId: view.productId,
  brief: { ...view.brief },
  items: view.items.map(item => ({ ...item, expIds: [...item.expIds] })),
});

/** Apply a saved draft back onto the view we already hold, without a refetch. */
export const applyDraft = (
  view: CampaignView,
  draft: CampaignDraft
): CampaignView => ({
  ...view,
  name: draft.name.trim(),
  type: draft.type,
  goal: draft.goal,
  owner: draft.owner.trim(),
  status: draft.status,
  channels: [...draft.channels],
  budgetAmount: draft.budgetAmount,
  budgetCurrency: draft.budgetCurrency,
  startDate: draft.startDate,
  endDate: draft.endDate,
  productId: draft.productId,
  brief: { ...draft.brief },
  items: draft.items.map(item => ({ ...item, expIds: [...item.expIds] })),
});
