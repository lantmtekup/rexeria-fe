/**
 * Số ĐO của màn Phân tích — hỏi `/v1/intel/*`, không tự tính, không tự bịa.
 *
 * Thay `buildPulseFacts()` (đọc `MOCK_FACT_ROWS` rồi `seed.ts` băm id ra block
 * và component). Các số băm ấy ổn định theo id nên trông hệt một phép đo — đó
 * mới là chỗ nguy hiểm, không phải chuyện chúng sai.
 *
 * Quy ước lỗi giống `experienceMeasured.ts`: hỏng thì trả `null`/rỗng kèm
 * `error`, để màn hình nói "chưa đo" thay vì vẽ một dãy số 0 đọc như kết quả.
 */
import {
  blockRowOf,
  campaignCardOf,
  isMeasured,
  leaksFromStages,
  stepsFromStages,
  totalsFromIntel,
  type PulseBlockRow,
  type PulseCampaignCard,
  type PulseTotals,
} from '@/lib/portal-v2/analytics/pulseView';
import type { FunnelLeak, FunnelStep } from '@/lib/portal-v2/analytics/types';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';
import type { RxIntelQuery } from '@/services/rexer-v2/types/intel';

const message = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

const scoped = (brandId?: string | null): RxIntelQuery =>
  brandId ? { brand_id: brandId } : {};

/* ── tổng quan ────────────────────────────────────────────────────────────── */

export type PulseOverviewData = {
  totals: PulseTotals | null;
  steps: FunnelStep[];
  leaks: FunnelLeak[];
  /** 0..100. `null` = `/intel/trust` không trả lời được, KHÁC với 0%. */
  coveragePct: number | null;
  campaigns: PulseCampaignCard[];
  error: string | null;
};

const EMPTY_OVERVIEW: PulseOverviewData = {
  totals: null,
  steps: [],
  leaks: [],
  coveragePct: null,
  campaigns: [],
  error: null,
};

/**
 * Bốn nguồn độc lập ⇒ chạy song song. `allSettled` chứ không `all`: độ phủ đo
 * hỏng thì ô đó để trống, không kéo sập cả trang.
 *
 * `campaignId` bỏ trống ⇒ toàn danh mục của brand.
 */
export const fetchPulseOverview = async (
  query: { brandId?: string | null; campaignId?: string } = {}
): Promise<PulseOverviewData> => {
  const slice: RxIntelQuery = {
    ...scoped(query.brandId),
    ...(query.campaignId ? { campaign_id: query.campaignId } : {}),
  };

  const [overview, funnel, trust, campaigns] = await Promise.allSettled([
    rexerV2Api.intel.overview(slice),
    rexerV2Api.intel.funnel(slice),
    rexerV2Api.intel.trust(slice),
    rexerV2Api.intel.campaigns(scoped(query.brandId)),
  ]);

  if (overview.status === 'rejected') {
    return {
      ...EMPTY_OVERVIEW,
      error: message(overview.reason, 'Không đọc được số đo'),
    };
  }

  const totals = totalsFromIntel(
    overview.value.totals,
    overview.value.confidence
  );
  const stages = funnel.status === 'fulfilled' ? funnel.value.stages : [];

  return {
    totals,
    steps: stepsFromStages(stages),
    leaks: leaksFromStages(stages, totals),
    coveragePct:
      trust.status === 'fulfilled'
        ? Math.round(trust.value.coverage.tracked_components_pct * 100)
        : null,
    campaigns:
      campaigns.status === 'fulfilled'
        ? campaigns.value.items.map(campaignCardOf)
        : [],
    error: null,
  };
};

/* ── một chiến dịch ───────────────────────────────────────────────────────── */

export type PulseCampaignData = {
  campaign: PulseCampaignCard | null;
  totals: PulseTotals | null;
  steps: FunnelStep[];
  leaks: FunnelLeak[];
  error: string | null;
};

/**
 * Một chiến dịch, kèm tầng hạng mục → trải nghiệm.
 *
 * `expand=subjects` là BẮT BUỘC: không có nó `subjects` vắng mặt và màn drill
 * tưởng chiến dịch rỗng.
 */
export const fetchPulseCampaign = async (
  campaignId: string,
  brandId?: string | null
): Promise<PulseCampaignData> => {
  const slice: RxIntelQuery = {
    ...scoped(brandId),
    campaign_id: campaignId,
  };

  try {
    const [campaigns, overview, funnel] = await Promise.all([
      rexerV2Api.intel.campaigns(slice, true),
      rexerV2Api.intel.overview(slice),
      rexerV2Api.intel.funnel(slice),
    ]);

    const row = campaigns.items.find(x => x.campaign_id === campaignId);
    const totals = totalsFromIntel(overview.totals, overview.confidence);

    return {
      campaign: row ? campaignCardOf(row) : null,
      totals,
      steps: stepsFromStages(funnel.stages),
      leaks: leaksFromStages(funnel.stages, totals),
      error: null,
    };
  } catch (err) {
    return {
      campaign: null,
      totals: null,
      steps: [],
      leaks: [],
      error: message(err, 'Không đọc được số đo của chiến dịch'),
    };
  }
};

/* ── một trải nghiệm ──────────────────────────────────────────────────────── */

export type PulseExperienceData = {
  /** `false` ⇒ chưa chạy lần nào; mọi số kèm theo là 0 mặc định của BE. */
  measured: boolean;
  sessions: number;
  cvr: number;
  lift: number | null;
  revenue: number;
  leads: number;
  tier: string;
  steps: FunnelStep[];
  blocks: PulseBlockRow[];
  /** 0..100 — độ phủ điểm đo của riêng trải nghiệm này. */
  coveragePct: number | null;
  componentsTracked: number | null;
  error: string | null;
};

const EMPTY_EXPERIENCE: PulseExperienceData = {
  measured: false,
  sessions: 0,
  cvr: 0,
  lift: null,
  revenue: 0,
  leads: 0,
  tier: '',
  steps: [],
  blocks: [],
  coveragePct: null,
  componentsTracked: null,
  error: null,
};

/**
 * Một trải nghiệm ở tầng sâu nhất còn API: phễu riêng + bảng block + độ phủ.
 *
 * `experience_id` nhận cả template lẫn bản copy — BE tự nở template ra toàn bộ
 * copy của nó, nên id nào cũng gọi được mà không phải đoán trước.
 */
export const fetchPulseExperience = async (
  experienceId: string,
  brandId?: string | null
): Promise<PulseExperienceData> => {
  const [stats, blocks, coverage] = await Promise.allSettled([
    rexerV2Api.experiences.stats(experienceId),
    rexerV2Api.intel.blocks({
      ...scoped(brandId),
      experience_id: experienceId,
    }),
    rexerV2Api.experiences.coverage(experienceId),
  ]);

  if (stats.status === 'rejected') {
    return {
      ...EMPTY_EXPERIENCE,
      error: message(stats.reason, 'Không đọc được số đo của trải nghiệm'),
    };
  }

  const s = stats.value;
  const signal =
    coverage.status === 'fulfilled' ? coverage.value.signal_coverage : null;

  return {
    measured: s.measured,
    sessions: s.sessions,
    cvr: s.cvr,
    lift: s.lift,
    revenue: s.revenue_cents / 100,
    leads: s.leads,
    tier: s.tier && isMeasured(s.tier) ? s.tier : '',
    steps: stepsFromStages(s.funnel ?? []),
    blocks:
      blocks.status === 'fulfilled' ? blocks.value.items.map(blockRowOf) : [],
    coveragePct: signal ? Math.round(signal.pct * 100) : null,
    componentsTracked: signal ? signal.components_tracked : null,
    error: null,
  };
};
