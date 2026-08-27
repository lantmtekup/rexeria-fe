/**
 * Journey Audit (`/v1/audit/*`) — hợp đồng THẬT, đối chiếu từng field với BE
 * `internal/domain/models/audit.go` (nhánh feature/journey-audit-api) và curl
 * thật ngày 2026-08-27. JSON snake_case.
 *
 * Điểm dễ vấp (đều đã thấy trên dữ liệu thật):
 * - `score`/`dims`/`traffic` của touchpoint NULLABLE — ghost chưa từng chấm
 *   trả null, nhưng một touchpoint `off` VẪN có thể mang điểm của run cũ.
 * - `traffic.continue_rate` là PHÂN SỐ 0..1, không phải phần trăm.
 * - `from_step`/`to_step` của leak là KEY stage ("decision"), không phải index.
 * - `confidence` là chữ ("high"), không phải số phần trăm.
 * - `benchmarks` là mảng object `{key, rate}` với rate 0..1.
 * - icon là TÊN lucide-ish ("megaphone"), không phải emoji.
 */

export type RxAuditSeverity = 'crit' | 'warn' | 'good';

export type RxAuditTouchpointState = 'live' | 'stale' | 'off';

export type RxAuditHandoffSeverity = 'crit' | 'warn' | 'ok';

export type RxAuditRunStatus = 'queued' | 'running' | 'succeeded' | 'failed';

/* ── GET /v1/audit/products (query brand_id — admin override) ────────────── */

export type RxAuditProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  /** null = chưa touchpoint non-off nào có điểm. */
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
  /** Phân số 0..1 (BE trả 0.47 = 47%). */
  continue_rate: number;
  leave: number;
  estimated: boolean;
};

export type RxAuditTouchpoint = {
  id: string;
  name: string;
  channel: string;
  /** Tên icon lucide-ish ("megaphone", "search"…), không phải emoji. */
  icon: string;
  state: RxAuditTouchpointState;
  score: number | null;
  dims: RxAuditDims | null;
  flags: RxAuditFlag[];
  traffic: RxAuditTraffic | null;
  /** Id các source_connections nuôi touchpoint; rỗng = ghost. */
  source_ids: string[];
};

export type RxAuditStage = {
  key: string;
  name: string;
  objective: string;
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

/** Snapshot THẬT của BE: extract có cấu trúc, body nằm ở S3. */
export type RxAuditSnapshot = {
  id: string;
  url: string;
  content_hash: string;
  extract: Record<string, unknown>;
  captured_at: string;
};

export type RxAuditFlowEdgeType =
  | 'path'
  | 'weak'
  | 'influence'
  | 'loop'
  | 'broken';

export type RxAuditFlowEdge = {
  from: string;
  to: string;
  type: RxAuditFlowEdgeType;
  volume: number;
  note: string;
};

export type RxAuditTouchpointDetail = {
  id: string;
  product_id: string;
  stage: string;
  name: string;
  channel: string;
  icon: string;
  state: RxAuditTouchpointState;
  score: number | null;
  dims: RxAuditDims | null;
  findings: RxAuditFinding[];
  recommendation: string;
  snapshot: RxAuditSnapshot | null;
  flows_in: RxAuditFlowEdge[];
  flows_out: RxAuditFlowEdge[];
  leaks: RxAuditLeak[];
  source_ids: string[];
};

/* ── GET /v1/audit/products/:id/flow ─────────────────────────────────────── */

export type RxAuditFlowNode = {
  id: string;
  name: string;
  stage: string;
  channel: string;
  state: RxAuditTouchpointState;
  score: number | null;
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
  /** Phân số 0..1; null ở bước đầu. */
  drop_pct: number | null;
  estimated: boolean;
};

export type RxAuditFunnelBenchmark = {
  /** Key của bước NGUỒN của lần chuyển. */
  key: string;
  /** Continue-rate điển hình, phân số 0..1. */
  rate: number;
};

export type RxAuditFunnel = {
  steps: RxAuditFunnelStep[];
  benchmarks: RxAuditFunnelBenchmark[];
};

export type RxAuditRecoveryRange = {
  lo_usd_cents: number;
  hi_usd_cents: number;
};

/**
 * Evidence là jsonb tự do: dữ liệu thật thấy `{metric, source, value}` và
 * `{snapshot_id, source: "snapshot"}`; mock giữ `{source, text}`.
 */
export type RxAuditEvidenceItem = {
  source?: string;
  text?: string;
  metric?: string;
  value?: unknown;
  snapshot_id?: string;
};

export type RxAuditLeak = {
  id: string;
  rank: number;
  title: string;
  from_step: string;
  to_step: string;
  touchpoint_id: string | null;
  usd_cents: number;
  /** Chữ, không phải số: "high" | "medium" | … (mock dùng "86%"). */
  confidence: string;
  recovery_range: RxAuditRecoveryRange;
  narrative: string;
  evidence: RxAuditEvidenceItem[];
  fix: string;
  estimated: boolean;
};

export type RxAuditChannel = {
  channel: string;
  sessions: number;
  converted: number;
  revenue_cents: number;
  estimated: boolean;
};

export type RxAuditLeaksResponse = {
  funnel: RxAuditFunnel;
  leaks: RxAuditLeak[];
  channels: RxAuditChannel[];
};

/* ── POST /v1/audit/products/:id/runs (201) · GET /v1/audit/runs/:id ─────── */

export type RxAuditRun = {
  id: string;
  product_id: string;
  status: RxAuditRunStatus;
  stats: Record<string, unknown>;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
};
