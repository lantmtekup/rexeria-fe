import type {
  InsightType,
  PulseDrillState,
  PulseLens,
  PulseViewState,
} from '@/lib/portal-v2/analytics/types';

export const LENS_PARAM = 'lens';
export const CAMPAIGN_PARAM = 'campaign';
export const SUBJECT_PARAM = 'subject';
export const EXP_PARAM = 'exp';
export const BLOCK_PARAM = 'block';
export const COMP_PARAM = 'comp';
export const ITYPE_PARAM = 'itype';
export const IOBJ_PARAM = 'iobj';

const parseLens = (raw: string | undefined): PulseLens => {
  if (
    raw === 'overview' ||
    raw === 'pages' ||
    raw === 'analytics' ||
    raw === 'insights'
  ) {
    return raw;
  }
  return 'overview';
};

const parseInsightType = (raw: string | undefined): InsightType => {
  if (
    raw === 'experiences' ||
    raw === 'products' ||
    raw === 'journeys' ||
    raw === 'blocks'
  ) {
    return raw;
  }
  return 'experiences';
};

const readParam = (
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string | null => {
  const raw = searchParams[key];
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return value || null;
};

export const readPulseViewState = (
  searchParams: Record<string, string | string[] | undefined>
): PulseViewState => {
  const blockRaw = readParam(searchParams, BLOCK_PARAM);
  const blockIndex =
    blockRaw != null && blockRaw !== '' ? Number.parseInt(blockRaw, 10) : null;

  return {
    lens: parseLens(readParam(searchParams, LENS_PARAM) ?? undefined),
    drill: {
      campaignId: readParam(searchParams, CAMPAIGN_PARAM),
      subject: readParam(searchParams, SUBJECT_PARAM),
      experienceId: readParam(searchParams, EXP_PARAM),
      blockIndex: Number.isFinite(blockIndex) ? blockIndex : null,
      componentEl: readParam(searchParams, COMP_PARAM),
    },
    insightType: parseInsightType(
      readParam(searchParams, ITYPE_PARAM) ?? undefined
    ),
    insightObjectId: readParam(searchParams, IOBJ_PARAM),
  };
};

export const writePulseViewState = (state: PulseViewState): void => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);

  url.searchParams.set(LENS_PARAM, state.lens);

  const setOrDelete = (key: string, value: string | null) => {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  };

  setOrDelete(CAMPAIGN_PARAM, state.drill.campaignId);
  setOrDelete(SUBJECT_PARAM, state.drill.subject);
  setOrDelete(EXP_PARAM, state.drill.experienceId);
  setOrDelete(
    BLOCK_PARAM,
    state.drill.blockIndex != null ? String(state.drill.blockIndex) : null
  );
  setOrDelete(COMP_PARAM, state.drill.componentEl);
  setOrDelete(ITYPE_PARAM, state.insightType);
  setOrDelete(IOBJ_PARAM, state.insightObjectId);

  window.history.replaceState(window.history.state, '', url.toString());
};

export const openCampaignDrill = (
  state: PulseViewState,
  campaignId: string
): PulseViewState => ({
  ...state,
  lens: 'analytics',
  drill: {
    campaignId,
    subject: null,
    experienceId: null,
    blockIndex: null,
    componentEl: null,
  },
  insightObjectId: null,
});

export const openInsightCareer = (
  state: PulseViewState,
  type: InsightType,
  objectId: string
): PulseViewState => ({
  ...state,
  lens: 'insights',
  insightType: type,
  insightObjectId: objectId,
  drill: {
    campaignId: null,
    subject: null,
    experienceId: null,
    blockIndex: null,
    componentEl: null,
  },
});

export const clearDrill = (state: PulseViewState): PulseViewState => ({
  ...state,
  drill: {
    campaignId: null,
    subject: null,
    experienceId: null,
    blockIndex: null,
    componentEl: null,
  },
});

export const drillAtLevel = (
  state: PulseViewState,
  level: PulseDrillState
): PulseViewState => ({
  ...state,
  lens: 'analytics',
  drill: level,
});

export const clearInsightObject = (state: PulseViewState): PulseViewState => ({
  ...state,
  insightObjectId: null,
});
