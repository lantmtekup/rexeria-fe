/**
 * Rankings tab (Experiences/Products) ← `/v1/intel/experiences`,
 * `/v1/intel/subjects`. Thay nhánh `experiences`/`products` của
 * `insItems()` (từng đọc `MOCK_CAMPAIGN_EXPERIENCES`/`MOCK_PRODUCTS`).
 *
 * BE báo cáo ở grain concept/subject, không phải grain block — không có
 * `PulseFactRow[]` thật để lấp vào `InsightItemBase.rows`; các item ở đây
 * luôn mang `rows: []` (đã sửa `RankingCareer.tsx` để không còn phụ thuộc
 * trường đó ngoài lối cũ dành cho journeys mock).
 */
import { ROLE_OF, RETENTION_LABELS } from '@/lib/portal-v2/analytics/constants';
import { insVar } from '@/lib/portal-v2/analytics/insights';
import type {
  ExperienceInsightItem,
  InsightFunnel,
  InsightSplit,
  ProductInsightItem,
  PulseRollup,
} from '@/lib/portal-v2/analytics/types';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';
import type {
  RxFunnelStage,
  RxIntelExperienceLibraryRow,
  RxIntelLibrarySplit,
  RxIntelQuery,
  RxIntelSubjectLibraryRow,
} from '@/services/rexer-v2/types/intel';

const money = (cents: number | null | undefined): number =>
  cents == null ? 0 : cents / 100;

const scoped = (brandId?: string | null): RxIntelQuery =>
  brandId ? { brand_id: brandId } : {};

/** A split only carries sessions/cvr/lift — the three fields `RankingCareer`'s
 *  track-record rows actually read; the rest of `PulseRollup` is padding. */
const rollupFromSplit = (split: RxIntelLibrarySplit): PulseRollup => ({
  sessions: split.sessions,
  engaged: 0,
  explored: 0,
  convinced: 0,
  converted: 0,
  leads: 0,
  revenue: 0,
  spend: 0,
  cvr: split.cvr,
  controlCvr: 0,
  lift: split.lift ?? 0,
  aov: 0,
  rows: 0,
});

const splitsOf = (rows: RxIntelLibrarySplit[] | undefined): InsightSplit[] =>
  (rows ?? []).map(s => ({
    campaignId: s.campaign_id,
    campaignName: s.campaign_name,
    rollup: rollupFromSplit(s),
  }));

/**
 * Funnel + role from the BE's 5-stage array — same shape `insFunnel()` builds
 * for the mock path (`RETENTION_LABELS`/`ROLE_OF`), so `RankingCareer`'s
 * `FunnelBars` and the "funnel role" cell read identically either way.
 */
const funnelFromStages = (stages: RxFunnelStage[]): InsightFunnel => {
  const steps = RETENTION_LABELS.map((name, i) => {
    const stage = stages[i + 1];
    return { name, rate: stage?.drop_pct != null ? 1 - stage.drop_pct : null };
  });
  const valid = steps.filter(step => step.rate != null);
  return {
    steps,
    weakest: valid.length
      ? valid.reduce((a, b) => (b.rate! < a.rate! ? b : a))
      : null,
    strongest: valid.length
      ? valid.reduce((a, b) => (b.rate! > a.rate! ? b : a))
      : null,
  };
};

const rollupOf = (row: {
  sessions: number;
  converted?: number;
  cvr: number;
  lift: number | null;
  revenue_cents: number | null;
  leads?: number;
}): PulseRollup => ({
  sessions: row.sessions,
  engaged: 0,
  explored: 0,
  convinced: 0,
  converted: row.converted ?? Math.round(row.sessions * row.cvr),
  leads: row.leads ?? 0,
  revenue: money(row.revenue_cents),
  spend: 0,
  cvr: row.cvr,
  controlCvr: 0,
  lift: row.lift ?? 0,
  aov: 0,
  rows: 0,
});

const experienceItemOf = (
  row: RxIntelExperienceLibraryRow
): ExperienceInsightItem => {
  const funnel = funnelFromStages(row.funnel);
  const splits = splitsOf(row.splits);
  return {
    type: 'experiences',
    id: row.experience_id,
    name: row.name,
    rows: [],
    rollup: rollupOf(row),
    splits,
    campaigns: row.campaigns,
    variance: insVar(splits),
    funnel,
    role: funnel.strongest ? (ROLE_OF[funnel.strongest.name] ?? null) : null,
    bestChannel: row.best_channel
      ? { channel: row.best_channel.channel, cvr: row.best_channel.cvr }
      : null,
    depth: row.engagement_depth,
    coveragePct: row.signal_coverage,
  };
};

const productItemOf = (row: RxIntelSubjectLibraryRow): ProductInsightItem => {
  const splits = splitsOf(row.splits);
  return {
    type: 'products',
    id: row.item_id,
    // `subject` is null only for a fact row with no resolvable item — shouldn't
    // happen (rows are grouped BY item_id) but the type is honest about BE's.
    name: row.subject?.name ?? row.item_id,
    rows: [],
    rollup: rollupOf(row),
    splits,
    campaigns: row.campaigns,
    variance: insVar(splits),
    aov: money(row.aov_cents),
    cac: null, // no item-level spend — see the "no cost fields" note above.
    bestExp: row.best_experience
      ? { name: row.best_experience.name, cvr: row.best_experience.cvr }
      : null,
  };
};

export const fetchExperienceRankings = async (
  brandId?: string | null
): Promise<{ items: ExperienceInsightItem[]; error: string | null }> => {
  try {
    const res = await rexerV2Api.intel.experiences(scoped(brandId), true);
    return { items: res.items.map(experienceItemOf), error: null };
  } catch (err) {
    return {
      items: [],
      error: err instanceof Error ? err.message : 'Không đọc được xếp hạng',
    };
  }
};

export const fetchProductRankings = async (
  brandId?: string | null
): Promise<{ items: ProductInsightItem[]; error: string | null }> => {
  try {
    const res = await rexerV2Api.intel.subjects(scoped(brandId), true);
    return { items: res.items.map(productItemOf), error: null };
  } catch (err) {
    return {
      items: [],
      error: err instanceof Error ? err.message : 'Không đọc được xếp hạng',
    };
  }
};
