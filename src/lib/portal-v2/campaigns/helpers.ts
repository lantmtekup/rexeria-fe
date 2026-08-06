import {
  CAMPAIGN_DEFAULT_CURRENCY,
  ITEM_DONE_STEP,
  ITEM_STATUS,
} from '@/lib/portal-v2/campaigns/constants';
import { experienceCopyId } from '@/lib/portal-v2/campaigns/mock';
import type {
  CampaignBrief,
  CampaignDraft,
  CampaignFilters,
  CampaignItem,
  CampaignStage,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';

export const emptyBrief = (): CampaignBrief => ({
  objective: '',
  audience: '',
  message: '',
  offer: '',
});

/* ── dates ──────────────────────────────────────────────────────────────── */

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * `2026-11-01` → `1 Nov`. Formatted by hand rather than with
 * `toLocaleDateString` — the server and the browser can resolve a locale
 * differently and the mismatch would surface as a hydration error.
 */
export const fmtDate = (day: string | null): string => {
  if (!day) return '';
  const [y, m, d] = day.split('-').map(Number);
  if (!y || !m || !d) return '';
  return `${d} ${MONTHS[m - 1] ?? ''}`.trim();
};

/** `1 Nov → 26 Dec`, with the open-ended case spelled out by the caller. */
export const fmtRange = (
  campaign: Pick<CampaignView, 'startDate' | 'endDate'>,
  ongoingLabel: string
): string => {
  const start = fmtDate(campaign.startDate) || '—';
  const end = fmtDate(campaign.endDate) || ongoingLabel;
  return `${start} → ${end}`;
};

/** An item is late when its deadline passed before it reached Ready. */
export const isLate = (item: CampaignItem, today: string): boolean =>
  item.due !== null &&
  ITEM_STATUS[item.status].step < ITEM_DONE_STEP &&
  item.due < today;

/** `YYYY-MM-DD` for "now" — pass it in so components stay deterministic. */
export const todayString = (): string => new Date().toISOString().slice(0, 10);

/* ── derived state ──────────────────────────────────────────────────────── */

/**
 * Chặng hiển thị = đúng thứ server trả về.
 *
 * Bản trước tự suy ở đây, và luật đó trùng gần y hệt `core.DeriveCampaignStage`
 * bên BE — hai bản sao của một luật là cách chúng lệch nhau. BE đã suy sẵn và
 * đồng bộ lại mỗi khi hạng mục đổi trạng thái.
 *
 * Giữ lại hàm này thay vì đọc thẳng `campaign.status` ở mọi nơi gọi: nếu sau
 * này cần một chặng chỉ tồn tại trên màn hình thì chỗ thêm đã có sẵn.
 */
export const deriveStage = (campaign: CampaignView): CampaignStage =>
  campaign.status;

export const campExpCount = (campaign: CampaignView): number =>
  campaign.items.reduce((n, item) => n + item.expIds.length, 0);

export const campProgress = (
  campaign: CampaignView
): { done: number; total: number; pct: number } => {
  const total = campaign.items.length;
  const done = campaign.items.filter(
    item => ITEM_STATUS[item.status].step >= ITEM_DONE_STEP
  ).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
};

export const unassignedCount = (campaign: CampaignView): number =>
  campaign.items.filter(
    item => !item.owner.trim() && ITEM_STATUS[item.status].step < ITEM_DONE_STEP
  ).length;

/**
 * Plan §mod-campaigns bullet 4 — "tự chuyển In build khi hạng mục đã có trải
 * nghiệm (fork)". Only the first step is automatic: Review / Ready / Live are
 * judgement calls and stay with the person, exactly as the prototype has it.
 */
export const syncItemStage = (item: CampaignItem): CampaignItem => {
  if (!item.expIds.length) return item;
  if (ITEM_STATUS[item.status].step > 0) return item;
  return { ...item, status: 'building' };
};

/**
 * Chặng mà hạng mục ngụ ý — CHỈ để hiện ngay sau một thao tác cục bộ, trước
 * khi server trả về giá trị của nó.
 *
 * Không phải nguồn sự thật: `core.SyncCampaignStage` bên BE mới là nơi quyết,
 * và nó giữ nguyên `done` vì đóng một chiến dịch là quyết định của con người.
 */
export const impliedStatus = (campaign: CampaignView): CampaignStage | null => {
  if (campaign.status === 'done') return null;
  const anyLive = campaign.items.some(item => item.status === 'live');
  if (anyLive && campaign.status !== 'live') return 'live';
  const started = campaign.items.some(
    item => ITEM_STATUS[item.status].step > 0
  );
  if (started && campaign.status === 'planning') return 'building';
  return null;
};

export const syncCampaignStage = (campaign: CampaignView): CampaignView => {
  const implied = impliedStatus(campaign);
  return implied ? { ...campaign, status: implied } : campaign;
};

/* ── list narrowing ─────────────────────────────────────────────────────── */

/** The stage axis, plus a contains-match over the name, owner and brief. */
export const visibleCampaigns = (
  campaigns: CampaignView[],
  filters: CampaignFilters
): CampaignView[] => {
  const q = filters.q.trim().toLowerCase();
  return campaigns.filter(campaign => {
    if (filters.stage !== 'all' && deriveStage(campaign) !== filters.stage) {
      return false;
    }
    if (!q) return true;
    const haystack = [
      campaign.name,
      campaign.owner,
      campaign.brief.objective,
      campaign.brief.audience,
      campaign.brief.message,
      campaign.brief.offer,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
};

export const countByStage = (
  campaigns: CampaignView[],
  stage: CampaignStage
): number => campaigns.filter(c => deriveStage(c) === stage).length;

/* ── drafts ─────────────────────────────────────────────────────────────── */

export const blankDraft = (): CampaignDraft => ({
  name: '',
  type: 'launch',
  goal: null,
  owner: '',
  status: 'planning',
  channels: [],
  budgetAmount: null,
  budgetCurrency: CAMPAIGN_DEFAULT_CURRENCY,
  startDate: null,
  endDate: null,
  productId: null,
  brief: emptyBrief(),
  items: [],
  journeyId: null,
});

export const toDraft = (campaign: CampaignView): CampaignDraft => ({
  name: campaign.name,
  type: campaign.type,
  goal: campaign.goal,
  owner: campaign.owner,
  status: campaign.status,
  channels: [...campaign.channels],
  budgetAmount: campaign.budgetAmount,
  budgetCurrency: campaign.budgetCurrency,
  startDate: campaign.startDate,
  endDate: campaign.endDate,
  productId: campaign.productId,
  brief: { ...campaign.brief },
  items: campaign.items.map(item => ({ ...item, expIds: [...item.expIds] })),
  journeyId: campaign.journeyId,
});

/**
 * Ids derive from the current list length rather than `Date.now()` — the same
 * reason `ProductWorkspace.handleCreate` does it: a timestamp minted during
 * render drifts between the server pass and hydration.
 */
export const nextItemId = (items: CampaignItem[]): string =>
  `it${items.length + 1}`;

export const blankItem = (
  items: CampaignItem[],
  kind: CampaignItem['kind'],
  due: string | null
): CampaignItem => ({
  id: nextItemId(items),
  kind,
  ...(kind === 'product' ? { productId: '' } : { name: '' }),
  expIds: [],
  status: 'todo',
  owner: '',
  due,
  note: '',
});

/* ── formatting ─────────────────────────────────────────────────────────── */

export const fmtBudget = (
  amount: number | null,
  currency: string
): string | null => {
  if (amount === null) return null;
  const compact =
    amount >= 1000 ? `${Math.round(amount / 1000)}k` : String(amount);
  return `${currency === 'USD' ? '$' : ''}${compact}${currency === 'USD' ? '' : ` ${currency}`}`;
};

/** First word of a subject name — the card chips only have room for one. */
export const shortLabel = (label: string): string =>
  label.trim().split(/\s+/)[0] ?? '';

/**
 * What to call a subject. A topic carries its own name; a product only carries
 * an id, so the caller passes the catalogue lookup it already loaded. Empty
 * string means "resolve to a placeholder" — the components own that copy.
 */
export const subjectName = (
  item: CampaignItem,
  productNames: Record<string, string>
): string =>
  item.kind === 'topic'
    ? (item.name ?? '').trim()
    : (productNames[item.productId ?? ''] ?? '').trim();

/**
 * What an experience copy is filed under. A product subject is identified by
 * its SKU so two campaigns can fork the same master onto the same product and
 * still get their own copy; a topic has only itself.
 */
export const subjectRef = (item: CampaignItem): string =>
  item.kind === 'product' ? (item.productId ?? item.id) : item.id;

/* ── mutators ───────────────────────────────────────────────────────────── */

/*
 * Every mutator takes the list and returns a NEW list — the prototype pushes
 * into a global `DATA.campaigns`, which React state cannot do.
 */

export const findCampaign = (
  list: CampaignView[],
  id: string
): CampaignView | null => list.find(c => c.id === id) ?? null;

/**
 * Ids come off the list rather than `Date.now()`: a timestamp minted during
 * render drifts between the server pass and hydration.
 */
export const nextCampaignId = (list: CampaignView[]): string => {
  const used = new Set(list.map(c => c.id));
  let n = list.length + 1;
  while (used.has(`m${n}`)) n += 1;
  return `m${n}`;
};

export const createCampaign = (
  list: CampaignView[],
  id: string,
  draft: CampaignDraft
): CampaignView => ({
  id,
  name: draft.name.trim(),
  status: draft.status,
  type: draft.type,
  goal: draft.goal,
  owner: draft.owner.trim(),
  channels: [...draft.channels],
  budgetAmount: draft.budgetAmount,
  budgetCurrency: draft.budgetCurrency,
  startDate: draft.startDate,
  endDate: draft.endDate,
  productId: draft.productId,
  brief: { ...draft.brief },
  items: draft.items.map(item => ({ ...item, expIds: [...item.expIds] })),
  journeyId: draft.journeyId,
});

/** Fold a draft back onto the campaign it came from, then let items promote it. */
export const applyDraft = (
  campaign: CampaignView,
  draft: CampaignDraft
): CampaignView =>
  syncCampaignStage({
    ...campaign,
    name: draft.name.trim() || campaign.name,
    status: draft.status,
    type: draft.type,
    goal: draft.goal,
    owner: draft.owner.trim(),
    channels: [...draft.channels],
    budgetAmount: draft.budgetAmount,
    budgetCurrency: draft.budgetCurrency,
    startDate: draft.startDate,
    endDate: draft.endDate,
    productId: draft.productId,
    brief: { ...draft.brief },
    items: draft.items.map(syncItemStage),
    journeyId: draft.journeyId,
  });

export const replaceCampaign = (
  list: CampaignView[],
  next: CampaignView
): CampaignView[] => list.map(c => (c.id === next.id ? next : c));

export const deleteCampaigns = (
  list: CampaignView[],
  ids: string[]
): CampaignView[] => list.filter(c => !ids.includes(c.id));

/**
 * Clone a campaign back to the start line. The plan is worth copying; the work
 * is not — the duplicate opens in Planning with every subject back at Not
 * started, and its experience copies re-derived onto its own id so the two
 * campaigns never share a page (prototype `cdup`, :20399).
 */
export const duplicateCampaign = (
  list: CampaignView[],
  id: string,
  copySuffix: string
): { list: CampaignView[]; campaign: CampaignView } | null => {
  const source = findCampaign(list, id);
  if (!source) return null;

  const nextId = nextCampaignId(list);
  const origin = journeyOriginOf(source);

  const campaign: CampaignView = {
    ...structuredClone(source),
    id: nextId,
    name: `${source.name} ${copySuffix}`,
    status: 'planning',
    journeyId: origin ? campaignJourneyId(origin, nextId) : null,
    promoted: undefined,
    items: source.items.map(item => ({
      ...item,
      status: 'todo',
      expIds: item.expIds.map(expId => {
        const expOrigin = experienceOriginOf(expId);
        return expOrigin
          ? experienceCopyId(expOrigin, nextId, subjectRef(item))
          : expId;
      }),
    })),
  };

  return { list: [campaign, ...list], campaign };
};

/* ── deterministic fork ids ─────────────────────────────────────────────── */

/** `j-{origin}-{campaignId}` — the same shape `forkJourney` mints. */
export const campaignJourneyId = (origin: string, campaignId: string): string =>
  `j-${origin}-${campaignId}`;

/** The blueprint behind a campaign's journey, read back out of the fork id. */
export const journeyOriginOf = (campaign: CampaignView): string | null => {
  if (!campaign.journeyId) return null;
  const parts = campaign.journeyId.split('-');
  return parts.length >= 3 ? parts[1] : null;
};

/** The master behind a copy, read back out of `x-{origin}-{campaign}-{subject}`. */
export const experienceOriginOf = (expId: string): string | null => {
  const parts = expId.split('-');
  return parts[0] === 'x' && parts.length >= 4 ? parts[1] : null;
};
