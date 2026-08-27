/**
 * Journey Audit (`/v1/audit/*`) — hợp đồng Phase 1, BE đang xây song song đúng
 * shape này (JSON snake_case). Phase 1 FE trả mock qua đúng các shape dưới đây
 * để lúc nối thật chỉ đổi nguồn, không đổi hình.
 *
 * Quy ước:
 * - Severity: `crit | warn | good`.
 * - Tiền: `*_usd_cents` int — FE đổi về đơn vị tiền khi map sang view.
 * - Số ước tính mang `estimated: true` (traffic model, chưa có GA4).
 */

export type RxAuditSeverity = 'crit' | 'warn' | 'good';

/** Trạng thái nguồn nuôi touchpoint: live = có nguồn khỏe, stale = chỉ còn
 *  nguồn mất quyền truy cập, off = không nguồn nào kết nối. */
export type RxAuditTouchpointState = 'live' | 'stale' | 'off';

export type RxAuditHandoffSeverity = 'crit' | 'warn' | 'ok';

/* ── GET /v1/audit/products ──────────────────────────────────────────────── */

export type RxAuditProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  /** null = chưa audit được touchpoint nào (mọi nguồn off). */
  score: number | null;
  touchpoint_count: number;
};

export type RxAuditProductsResponse = { items: RxAuditProduct[] };

/* ── GET /v1/audit/products/:id/journey ──────────────────────────────────── */

export type RxAuditDims = {
  message_match: number;
  load_speed: number;
  brand_consistency: number;
  friction: number;
  accessibility: number;
};

export type RxAuditFlag = {
  severity: RxAuditSeverity | 'neutral';
  label: string;
};

export type RxAuditTraffic = {
  arrive: number;
  continue_rate: number;
  leave: number;
  estimated: boolean;
};

export type RxAuditTouchpoint = {
  id: string;
  name: string;
  channel: string;
  icon: string;
  state: RxAuditTouchpointState;
  score: number;
  dims: RxAuditDims;
  flags: RxAuditFlag[];
  /** null = endpoint/không đo được dòng chảy cho touchpoint này. */
  traffic: RxAuditTraffic | null;
  source_ids: string[];
};

export type RxAuditStage = {
  key: string;
  name: string;
  objective: string;
  /** null = không touchpoint nào trong stage được audit. */
  score: number | null;
  leak_usd_cents: number;
  touchpoints: RxAuditTouchpoint[];
};

export type RxAuditHandoff = {
  after_stage: string;
  severity: RxAuditHandoffSeverity;
  label: string;
  note: string;
};

export type RxAuditJourney = {
  stages: RxAuditStage[];
  handoffs: RxAuditHandoff[];
};

/* ── GET /v1/audit/touchpoints/:id ───────────────────────────────────────── */

export type RxAuditFinding = {
  severity: RxAuditSeverity;
  text: string;
  evidence_source: string;
  observed_at: string;
  snapshot_id: string | null;
};

export type RxAuditSnapshotKind =
  | 'page'
  | 'listing'
  | 'social'
  | 'email'
  | 'reviews'
  | 'audio'
  | 'chat'
  | 'physical';

export type RxAuditSnapshot = {
  kind: RxAuditSnapshotKind;
  heading: string;
  subline: string;
  cta: string;
};

export type RxAuditFlowRef = {
  touchpoint_id: string;
  name: string;
  volume: number;
  edge_type: RxAuditFlowEdgeType;
};

export type RxAuditTouchpointDetail = {
  id: string;
  dims: RxAuditDims;
  findings: RxAuditFinding[];
  recommendation: string;
  snapshot: RxAuditSnapshot;
  flows_in: RxAuditFlowRef[];
  flows_out: RxAuditFlowRef[];
  leak_ids: string[];
};

/* ── GET /v1/audit/products/:id/flow ─────────────────────────────────────── */

export type RxAuditFlowEdgeType =
  | 'path'
  | 'weak'
  | 'influence'
  | 'loop'
  | 'broken';

export type RxAuditFlowNode = {
  id: string;
  /** Lượng khách đến thẳng (ads, search, links) — không qua cạnh nào. */
  entry_volume: number;
  estimated: boolean;
};

export type RxAuditFlowEdge = {
  from: string;
  to: string;
  type: RxAuditFlowEdgeType;
  volume: number;
  note: string | null;
};

export type RxAuditFlow = {
  nodes: RxAuditFlowNode[];
  edges: RxAuditFlowEdge[];
};

/* ── GET /v1/audit/products/:id/leaks ────────────────────────────────────── */

export type RxAuditFunnelStep = {
  key: string;
  label: string;
  count: number;
};

export type RxAuditFunnel = {
  steps: RxAuditFunnelStep[];
  /** % continue điển hình cho từng bước chuyển (length = steps - 1). */
  benchmarks: number[];
};

export type RxAuditEvidence = {
  source_id: string;
  text: string;
};

export type RxAuditLeak = {
  id: string;
  rank: number;
  title: string;
  from_step: number;
  to_step: number;
  touchpoint_id: string;
  usd_cents: number;
  confidence: number;
  recovery_range: string;
  narrative: string;
  evidence: RxAuditEvidence[];
  fix: string;
};

export type RxAuditChannel = {
  name: string;
  share_pct: number;
  buyers_per_1000: number;
  leak_id: string | null;
};

export type RxAuditLeaksResponse = {
  funnel: RxAuditFunnel;
  leaks: RxAuditLeak[];
  channels: RxAuditChannel[];
};

/* ── POST /v1/audit/products/:id/runs · GET /v1/audit/runs/:id ───────────── */

export type RxAuditRunStatus = 'queued' | 'crawling' | 'scoring' | 'done';

export type RxAuditRun = {
  id: string;
  product_id: string;
  status: RxAuditRunStatus;
  started_at: string;
  finished_at: string | null;
};
