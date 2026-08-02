import {
  CAMPAIGN_TYPE_IDS,
  ITEM_FLOW,
} from '@/lib/portal-v2/campaigns/constants';
import type {
  CampaignBrief,
  CampaignItem,
  CampaignItemStatus,
  CampaignNotesPayload,
  CampaignType,
} from '@/lib/portal-v2/campaigns/types';

/**
 * `campaign.notes` is a free-text column that the platform already treats as a
 * JSON bag — `/portal/marketing` reads `insight_report_id` / `insight_summary` /
 * `insight_handoff` out of it, and the BE gap doc states plainly that the
 * portal's marketing brief lives there.
 *
 * Portal V2 adds ONE key, `pv2`, and round-trips everything else untouched.
 * That is the whole contract: never write a `notes` value that drops a key we
 * did not put there, or the old screen loses its AI-Insights chip.
 */

const EMPTY_BRIEF: CampaignBrief = {
  objective: '',
  audience: '',
  message: '',
  offer: '',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((x): x is string => typeof x === 'string')
    : [];

const asItemStatus = (value: unknown): CampaignItemStatus =>
  ITEM_FLOW.includes(value as CampaignItemStatus)
    ? (value as CampaignItemStatus)
    : 'todo';

const asType = (value: unknown, fallback: CampaignType): CampaignType =>
  CAMPAIGN_TYPE_IDS.includes(value as CampaignType)
    ? (value as CampaignType)
    : fallback;

const asBrief = (value: unknown): CampaignBrief => {
  if (!isRecord(value)) return { ...EMPTY_BRIEF };
  return {
    objective: asString(value.objective),
    audience: asString(value.audience),
    message: asString(value.message),
    offer: asString(value.offer),
  };
};

const asItem = (value: unknown, index: number): CampaignItem | null => {
  if (!isRecord(value)) return null;
  const kind = value.kind === 'topic' ? 'topic' : 'product';
  return {
    id: asString(value.id) || `it${index + 1}`,
    kind,
    ...(kind === 'product'
      ? { productId: asString(value.productId) || undefined }
      : { name: asString(value.name) }),
    expIds: asStringArray(value.expIds),
    status: asItemStatus(value.status),
    owner: asString(value.owner),
    due: typeof value.due === 'string' && value.due ? value.due : null,
    note: asString(value.note),
  };
};

export type ParsedCampaignNotes = {
  /** The Portal V2 envelope, or null when this campaign has never been saved here. */
  pv2: CampaignNotesPayload | null;
  /** Everything else in `notes`, preserved verbatim for the next write. */
  rest: Record<string, unknown>;
};

/**
 * Parse `notes` defensively — it can be absent, valid JSON, or free text a
 * human typed before any of this existed. Free text is not thrown away: it is
 * parked under `legacy_notes` so the next save still carries it.
 */
export const readCampaignNotes = (
  raw: string | undefined | null,
  fallbackType: CampaignType = 'launch'
): ParsedCampaignNotes => {
  const trimmed = raw?.trim();
  if (!trimmed) return { pv2: null, rest: {} };

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { pv2: null, rest: { legacy_notes: trimmed } };
  }

  if (!isRecord(parsed)) return { pv2: null, rest: { legacy_notes: trimmed } };

  const { pv2, ...rest } = parsed;
  if (!isRecord(pv2)) return { pv2: null, rest };

  const items = Array.isArray(pv2.items)
    ? pv2.items
        .map((item, i) => asItem(item, i))
        .filter((item): item is CampaignItem => item !== null)
    : [];

  return {
    pv2: {
      v: 1,
      type: asType(pv2.type, fallbackType),
      owner: asString(pv2.owner),
      brief: asBrief(pv2.brief),
      items,
    },
    rest,
  };
};

/**
 * Rebuild the `notes` string for a PATCH/POST body. `rest` goes back first so
 * an unknown key can never be shadowed by ours.
 */
export const writeCampaignNotes = (
  rest: Record<string, unknown>,
  pv2: CampaignNotesPayload
): string => JSON.stringify({ ...rest, pv2 });

export const emptyBrief = (): CampaignBrief => ({ ...EMPTY_BRIEF });
