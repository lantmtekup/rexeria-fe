/**
 * Journey v2 — `/v1/journeys`.
 *
 * Node dùng `key`/`description`/`entry_source`/`experience_id`, khác tên với
 * shape UI (`id`/`d`/`src`/`x`). `px`/`py`/`phase` và `stages` là phần bố cục
 * của trình soạn, BE giữ nguyên không đụng tới.
 */

export type RxJourneyNodeKind =
  | 'entry'
  | 'experience'
  | 'decision'
  | 'action'
  | 'outcome';

export type RxJourneyNode = {
  key: string;
  kind: RxJourneyNodeKind;
  name: string;
  description: string;
  to: string[];
  entry_source?: string;
  via?: string;
  experience_id?: string;
  media_id?: string | null;
  /** Chỉ có ở phản hồi: bản copy chưa có fork trong campaign của nó. */
  unresolved?: boolean;
  resolved_page_id?: string | null;
  px?: number;
  py?: number;
  phase?: number;
};

export type RxJourneyStage = {
  id: string;
  name: string;
  kind?: string;
  hint?: string;
};

export type RxJourney = {
  id: string;
  name: string;
  is_template: boolean;
  origin_id: string | null;
  campaign_id: string | null;
  objective: string | null;
  persona_id: string | null;
  tagline: string | null;
  summary: string | null;
  /** Khoá lạc quan — `PUT` bắt buộc gửi đúng số vừa đọc. */
  version: number;
  nodes: RxJourneyNode[];
  /** Vắng ⇒ chưa từng đặt, dùng bộ chặng mặc định của hệ thống. */
  stages?: RxJourneyStage[];
  /** Tỉ lệ chuyển đổi mục tiêu (0..1) của chặng convert. Vắng ⇒ chưa lập kế hoạch. */
  target?: number | null;
  /** id chặng → % lượt tới mục tiêu. Vắng ⇒ chưa lập kế hoạch. */
  stage_targets?: Record<string, number> | null;
  created_at: string;
  updated_at: string;
};

export type RxJourneyListResponse = { items: RxJourney[]; total: number };

/**
 * `POST /journeys/{id}/use` — bản copy vừa fork (hoặc bản cũ nếu gọi lại,
 * idempotent) cộng số node experience vừa được tự động gắn vào các hạng mục
 * sẵn có của chiến dịch trong cùng lần gọi này (auto-stage — không cần màn
 * "Stage Candidates" riêng).
 */
export type RxJourneyUseResponse = RxJourney & { auto_forked: number };

export type RxCreateJourneyRequest = {
  /** Chỉ platform admin dùng được; principal khác bị ép về brand của họ. */
  brand_id?: string;
  name: string;
  objective?: string;
  persona_id?: string | null;
  tagline?: string;
  summary?: string;
  nodes: RxJourneyNode[];
  stages?: RxJourneyStage[];
  /** Vắng/`null` ⇒ giữ nguyên bản đã lưu (PUT không xoá ngầm kế hoạch). */
  target?: number | null;
  stage_targets?: Record<string, number> | null;
};

/** PUT thay TOÀN BỘ, và `version` là bắt buộc. */
export type RxUpdateJourneyRequest = RxCreateJourneyRequest & {
  version: number;
};

/** `GET /v1/journeys/{id}/readiness` — BE chấm, KHÔNG phải FE tự tính. */
export type RxJourneyReadiness = {
  /** 0..1 */
  score: number;
  checks: { id: string; label: string; ok: boolean }[];
  missing: string[];
};

/**
 * `GET /v1/journeys/{id}/stats`.
 *
 * `measured: false` ⇒ CHƯA CHẠY, và `reason` nói vì sao
 * (`insufficient_data`…). Mọi số kèm theo là 0 mặc định — vẽ chúng ra sẽ đọc
 * như "đã chạy mà không ai đi tới đâu".
 */
export type RxJourneyStats = {
  measured: boolean;
  reason?: string;
  sessions: number;
  completed: number;
  completion_rate: number;
  leaks: { node_key?: string; lost?: number }[];
  confidence_tier: string;
};

/**
 * `GET /v1/journeys/{id}/review` — điểm "Architect": hợp đồng đồ thị + bằng
 * chứng đo được + cấu trúc, cộng gợi ý stage kế tiếp nên thêm/thay. BE chấm
 * toàn bộ (`core.JourneyReviewScore`/`core.DecideNextBest`), FE chỉ vẽ lại.
 */
export type RxJourneyReviewParts = {
  contract: number;
  evidence: number;
  structure: number;
};

export type RxJourneyStageRead = {
  node_key: string;
  role: string;
  sessions: number;
  lift: number | null;
  tier: string;
};

export type RxJourneyNextBestDetail = {
  role: string;
  experience?: { id: string; name: string } & Record<string, unknown>;
  reason: string;
  node_key?: string;
};

export type RxJourneyNextBest = {
  mode: string;
  detail?: RxJourneyNextBestDetail;
  none_reason?: string;
};

export type RxJourneyReview = {
  score: number;
  parts: RxJourneyReviewParts;
  weights: RxJourneyReviewParts;
  confidence_tier: string;
  stage_reads: RxJourneyStageRead[];
  next_best: RxJourneyNextBest;
};

/** `GET /v1/journeys/compare?a=&b=` — hai hành trình đo được, xếp cạnh nhau. */
export type RxJourneyStageDelta = {
  key: string;
  a_sessions: number;
  b_sessions: number;
  delta: number;
};

export type RxJourneyCompareResponse = {
  a: RxJourneyStats;
  b: RxJourneyStats;
  stages: RxJourneyStageDelta[];
};
