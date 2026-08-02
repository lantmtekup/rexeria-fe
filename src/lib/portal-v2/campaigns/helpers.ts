import {
  CAMPAIGN_DEFAULT_CURRENCY,
  ITEM_DONE_STEP,
  ITEM_STATUS,
} from '@/lib/portal-v2/campaigns/constants';
import { emptyBrief } from '@/lib/portal-v2/campaigns/notes';
import type {
  CampaignDraft,
  CampaignFilters,
  CampaignItem,
  CampaignStage,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';

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
 * The display stage. v1 stores four statuses; the prototype shows five because
 * "In build" is not a status at all — it is a `draft` campaign whose items have
 * started moving. Deriving it here keeps the extra stage out of the wire.
 */
export const deriveStage = (campaign: CampaignView): CampaignStage => {
  if (campaign.status === 'active') return 'live';
  if (campaign.status === 'paused') return 'paused';
  if (campaign.status === 'completed') return 'done';
  const started = campaign.items.some(
    item => ITEM_STATUS[item.status].step > 0
  );
  return started ? 'building' : 'planning';
};

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
 * Campaign status implied by its items, or null when nothing should change.
 * A completed campaign is left alone — closing one is a human decision.
 */
export const impliedStatus = (
  campaign: CampaignView
): CampaignView['status'] | null => {
  if (campaign.status === 'completed' || campaign.status === 'paused') {
    return null;
  }
  const anyLive = campaign.items.some(item => item.status === 'live');
  if (anyLive && campaign.status !== 'active') return 'active';
  return null;
};

/* ── list narrowing ─────────────────────────────────────────────────────── */

/**
 * Search already ran on the server (`?q=`); this only applies the stage axis
 * plus a local contains-match so typing feels instant between fetches.
 */
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
  status: 'draft',
  channels: [],
  budgetAmount: null,
  budgetCurrency: CAMPAIGN_DEFAULT_CURRENCY,
  startDate: null,
  endDate: null,
  productId: null,
  brief: emptyBrief(),
  items: [],
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
