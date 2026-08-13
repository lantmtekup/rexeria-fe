/**
 * Intel (spec §8) — số liệu suy từ `fact_daily` lúc đọc, không lưu sẵn.
 */

export type RxIntelSegment = {
  /** `s1`..`s8` — cùng namespace với `ProfilePersona.behaves`. */
  id: string;
  name: string;
  /** 0..1, ĐO ĐƯỢC. 0 = chưa có lượt nào, không phải "phân khúc này nhỏ". */
  share: number;
  sessions: number;
  score: number;
  trend: string;
  tells: string[];
  want: string;
  action: string;
  confidence_tier: string;
};

export type RxIntelSegmentsResponse = { items: RxIntelSegment[] };

/* ── §8 slice chung ───────────────────────────────────────────────────────── */

/**
 * Lát cắt mọi endpoint §8 nhận. `brand_id` chỉ platform admin dùng được; thiếu
 * nó admin đọc brand rỗng và mọi số về 0 bất kể màn hình đang xem brand nào.
 */
export type RxIntelQuery = {
  brand_id?: string | null;
  campaign_id?: string;
  item_id?: string;
  experience_id?: string;
  channel?: string;
  /** YYYY-MM-DD */
  from?: string;
  to?: string;
};

/** Server vọng lại lát cắt đã hiểu — null nghĩa là "không thu hẹp". */
export type RxIntelSlice = {
  campaign_id: string | null;
  item_id: string | null;
  experience_id: string | null;
  channel: string | null;
  from: string | null;
  to: string | null;
};

/**
 * Đo thô là SUM; số suy ra được cân theo phiên ở BE (cấm mean-of-means).
 *
 * `revenue_cents`/`aov_cents` NULL khi không đối tượng nào trong lát cắt phát
 * sinh giao dịch (chốt bằng lead/booking ngoài nền tảng) — vẽ 0 ở đó là bịa
 * một phép đo chưa từng có. `lift`/`control_cvr` null khi không có đối chứng;
 * `roi`/`cac_cents`/`cpql_cents` null khi không có chi phí.
 */
export type RxIntelTotals = {
  sessions: number;
  engaged: number;
  explored: number;
  convinced: number;
  converted: number;
  leads: number;
  revenue_cents: number | null;
  spend_cents: number;
  cvr: number;
  lift: number | null;
  control_cvr: number | null;
  aov_cents: number | null;
  engagement: number;
  roi: number | null;
  cac_cents: number | null;
  cpql_cents: number | null;
};

/** `tier`: high | directional | early | unmeasured. */
export type RxIntelConfidence = {
  tier: string;
  sessions: number;
  has_control: boolean;
};

export type RxIntelTrendPoint = {
  date: string;
  sessions: number;
  converted: number;
  revenue_cents: number;
};

/** `GET /v1/intel/overview` (spec §8.2). */
export type RxIntelOverview = {
  slice: RxIntelSlice;
  totals: RxIntelTotals;
  confidence: RxIntelConfidence;
  trend: RxIntelTrendPoint[];
};

/* ── §8.3 phễu ────────────────────────────────────────────────────────────── */

/** `drop_pct` null ở chặng đầu — không có chặng trước để rơi khỏi. */
export type RxFunnelStage = {
  role: string;
  label: string;
  count: number;
  drop_pct: number | null;
};

export type RxFunnelLeak = {
  from: string;
  to: string;
  drop_pct: number;
};

/** Ý đồ (block dựng cho vai nào) so với hành vi (tương tác rơi vào vai nào). */
export type RxIntentBehaviourRow = {
  role: string;
  built_share: number;
  earned_share: number;
  gap: number;
};

/** `GET /v1/intel/funnel` (spec §8.3). */
export type RxIntelFunnel = {
  stages: RxFunnelStage[];
  biggest_leak: RxFunnelLeak | null;
  intent_vs_behaviour: RxIntentBehaviourRow[];
};

/* ── §8.4 chiến dịch ──────────────────────────────────────────────────────── */

export type RxIntelExperienceRow = {
  page_id: string;
  name: string;
  sessions: number;
  cvr: number;
  lift: number | null;
  tier: string;
  revenue_cents: number;
};

export type RxIntelSubjectRow = {
  item_id: string;
  subject: { kind: string; product_id?: string; name: string } | null;
  sessions: number;
  cvr: number;
  lift: number | null;
  tier: string;
  experiences: RxIntelExperienceRow[];
};

export type RxIntelCampaignRow = {
  campaign_id: string;
  name: string;
  sessions: number;
  converted: number;
  cvr: number;
  lift: number | null;
  revenue_cents: number;
  spend_cents: number;
  roi: number | null;
  confidence_tier: string;
  vs_control: string;
  /** Chỉ có khi gọi kèm `expand=subjects`. */
  subjects?: RxIntelSubjectRow[];
};

export type RxIntelCampaignsResponse = {
  items: RxIntelCampaignRow[];
  total: number;
};

/* ── §8.5 block ───────────────────────────────────────────────────────────── */

export type RxIntelTopComponent = {
  component_key: string;
  signal_type: string;
  assists: number;
  meaning: string;
};

/**
 * Gộp theo `block_type_code`, KHÔNG theo vị trí trong một trang: một loại khối
 * dùng ở ba trang cho ra MỘT dòng. Không có `block_key` nên chưa khoan xuống
 * component được — xem `docs/be-analytics-gaps-2026-08-13.md` mục 5–6.
 */
export type RxIntelBlockRow = {
  block_type_code: string;
  role: string;
  views: number;
  interactions: number;
  completes: number;
  exits: number;
  dwell_ms_avg: number;
  contribution_score: number;
  top_component: RxIntelTopComponent | null;
  confidence_tier: string;
};

export type RxIntelBlocksResponse = {
  items: RxIntelBlockRow[];
  total: number;
};

/* ── §8.10 độ tin dữ liệu ─────────────────────────────────────────────────── */

/** `GET /v1/intel/trust` — `coverage.tracked_components_pct` là ô "độ phủ đo". */
export type RxIntelTrust = {
  score: number;
  coverage: {
    /** 0..1 */
    tracked_components_pct: number;
    pages_with_signals_pct: number;
  };
  consent: { identified_pct?: number; ceiling: string };
  freshness: { latest_event_at: string | null; stale_pages: number };
  schema: { invalid_events_7d: number };
  issues: { code: string; detail: string; fix: string }[];
};
