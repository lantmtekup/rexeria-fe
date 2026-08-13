/**
 * Đường dữ liệu THẬT của màn Phân tích — `/v1/intel/*` → hình dạng mà các
 * component Pulse đang vẽ.
 *
 * Vì sao là một file riêng chứ không sửa `facts.ts`: `facts.ts` dựng
 * `PulseFactRow` (grain chiến dịch × hạng mục × trải nghiệm × kênh, kèm
 * `blocks[]`) rồi mọi thứ khác suy ra từ đó. BE KHÔNG có endpoint nào trả grain
 * ấy — nó trả sẵn từng tầng đã gộp. Ép các phản hồi đó ngược về `PulseFactRow`
 * đồng nghĩa phải bịa lại phần bị gộp mất (kênh của từng dòng, component của
 * từng block), tức đúng cái `seed.ts` đang làm và là thứ cần gỡ bỏ.
 *
 * Nên: những tầng BE trả được thì dựng thẳng view model từ phản hồi; tầng nào
 * chưa có API thì màn hình để trống có ghi lý do, không lấp bằng số băm từ id.
 *
 * Đơn vị: BE trả `*_cents`; mọi thứ ra khỏi file này đã đổi về đơn vị tiền.
 */
import { FUNNEL_LABELS } from '@/lib/portal-v2/analytics/constants';
import { leaksFromSteps } from '@/lib/portal-v2/analytics/helpers';
import type {
  FunnelLeak,
  FunnelStep,
  PulseRollup,
} from '@/lib/portal-v2/analytics/types';
import type {
  RxFunnelStage,
  RxIntelBlockRow,
  RxIntelCampaignRow,
  RxIntelExperienceRow,
  RxIntelSubjectRow,
  RxIntelTotals,
} from '@/services/rexer-v2/types/intel';

const money = (cents: number | null | undefined): number =>
  cents == null ? 0 : cents / 100;

/* ── tổng đo ──────────────────────────────────────────────────────────────── */

/**
 * `PulseRollup` + cờ "doanh thu chưa từng đo".
 *
 * `revenue_cents: null` nghĩa là không đối tượng nào trong lát cắt chốt trên
 * nền tảng (mode lead/booking) — khác hẳn "đã bán được 0đ". `PulseRollup` không
 * mang được sự khác biệt đó nên nó đi kèm bên ngoài, và ô doanh thu hiện "—".
 */
export type PulseTotals = {
  rollup: PulseRollup;
  revenueMeasured: boolean;
  /** high | directional | early | unmeasured. */
  tier: string;
  hasControl: boolean;
};

export const totalsFromIntel = (
  totals: RxIntelTotals,
  confidence?: { tier: string; has_control: boolean }
): PulseTotals => ({
  rollup: {
    sessions: totals.sessions,
    engaged: totals.engaged,
    explored: totals.explored,
    convinced: totals.convinced,
    converted: totals.converted,
    leads: totals.leads,
    revenue: money(totals.revenue_cents),
    spend: money(totals.spend_cents),
    cvr: totals.cvr,
    controlCvr: totals.control_cvr ?? 0,
    lift: totals.lift ?? 0,
    aov: money(totals.aov_cents),
    // Không còn khái niệm "số hàng fact" ở đường thật — BE gộp trước khi trả.
    rows: 0,
  },
  revenueMeasured: totals.revenue_cents != null,
  tier: confidence?.tier ?? '',
  hasControl: confidence?.has_control ?? totals.control_cvr != null,
});

/* ── phễu ─────────────────────────────────────────────────────────────────── */

/**
 * Năm chặng của BE → `FunnelStep`.
 *
 * `lost` suy từ chặng liền trước chứ không đọc `drop_pct`: BE đã lưu các chặng
 * ở dạng đơn điệu (không chặng nào lớn hơn chặng trước), nên phép trừ là đúng
 * và tránh sai số làm tròn của tỷ lệ phần trăm.
 */
export const stepsFromStages = (stages: RxFunnelStage[]): FunnelStep[] =>
  stages.map((stage, index) => {
    const previous = stages[index - 1];
    return {
      label: stage.label || FUNNEL_LABELS[index] || stage.role,
      value: stage.count,
      lost: previous ? Math.max(0, previous.count - stage.count) : 0,
    };
  });

export const leaksFromStages = (
  stages: RxFunnelStage[],
  totals: PulseTotals
): FunnelLeak[] =>
  leaksFromSteps(
    stepsFromStages(stages),
    totals.rollup.converted,
    totals.rollup.aov
  );

/* ── chiến dịch ───────────────────────────────────────────────────────────── */

export type PulseCampaignCard = {
  id: string;
  name: string;
  sessions: number;
  converted: number;
  cvr: number;
  /** null = không có nhóm đối chứng để so, không phải "lift bằng 0". */
  lift: number | null;
  revenue: number;
  spend: number;
  roi: number | null;
  tier: string;
  /** `above` | `below` | `flat` | `no_control` — BE tự chấm. */
  vsControl: string;
  subjects: PulseSubjectRow[];
};

export type PulseSubjectRow = {
  itemId: string;
  name: string;
  kind: string;
  sessions: number;
  cvr: number;
  lift: number | null;
  tier: string;
  experiences: PulseExperienceRow[];
};

export type PulseExperienceRow = {
  pageId: string;
  name: string;
  sessions: number;
  cvr: number;
  lift: number | null;
  tier: string;
  revenue: number;
};

const experienceRowOf = (row: RxIntelExperienceRow): PulseExperienceRow => ({
  pageId: row.page_id,
  name: row.name,
  sessions: row.sessions,
  cvr: row.cvr,
  lift: row.lift,
  tier: row.tier,
  revenue: money(row.revenue_cents),
});

const subjectRowOf = (row: RxIntelSubjectRow): PulseSubjectRow => ({
  itemId: row.item_id,
  // Hạng mục chủ đề có thể chưa đặt tên; id là thứ duy nhất luôn có.
  name: row.subject?.name ?? row.item_id,
  kind: row.subject?.kind ?? 'topic',
  sessions: row.sessions,
  cvr: row.cvr,
  lift: row.lift,
  tier: row.tier,
  experiences: (row.experiences ?? []).map(experienceRowOf),
});

export const campaignCardOf = (row: RxIntelCampaignRow): PulseCampaignCard => ({
  id: row.campaign_id,
  name: row.name,
  sessions: row.sessions,
  converted: row.converted,
  cvr: row.cvr,
  lift: row.lift,
  revenue: money(row.revenue_cents),
  spend: money(row.spend_cents),
  roi: row.roi,
  tier: row.confidence_tier,
  vsControl: row.vs_control,
  subjects: (row.subjects ?? []).map(subjectRowOf),
});

/* ── block ────────────────────────────────────────────────────────────────── */

export type PulseBlockRow = {
  /** `block_type_code` — BE gộp theo LOẠI khối, không theo vị trí trong trang. */
  code: string;
  role: string;
  views: number;
  interRate: number;
  exitRate: number;
  doneRate: number;
  dwellSeconds: number;
  contribution: number;
  tier: string;
  topComponent: {
    key: string;
    signalType: string;
    assists: number;
    meaning: string;
  } | null;
};

const ratio = (part: number, whole: number): number =>
  whole ? part / whole : 0;

export const blockRowOf = (row: RxIntelBlockRow): PulseBlockRow => ({
  code: row.block_type_code,
  role: row.role,
  views: row.views,
  interRate: ratio(row.interactions, row.views),
  exitRate: ratio(row.exits, row.views),
  doneRate: ratio(row.completes, row.views),
  dwellSeconds: Math.round(row.dwell_ms_avg / 1000),
  contribution: row.contribution_score,
  tier: row.confidence_tier,
  topComponent: row.top_component
    ? {
        key: row.top_component.component_key,
        signalType: row.top_component.signal_type,
        assists: row.top_component.assists,
        meaning: row.top_component.meaning,
      }
    : null,
});

/* ── bậc tin cậy ──────────────────────────────────────────────────────────── */

/** `unmeasured` và chuỗi rỗng đều là "chưa đo" — cả hai đều xuất hiện thật. */
export const isMeasured = (tier: string): boolean =>
  tier !== '' && tier !== 'unmeasured';
