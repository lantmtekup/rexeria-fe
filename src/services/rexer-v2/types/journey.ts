/**
 * Journey v2 — `/v1/journeys`.
 *
 * Node dùng `key`/`description`/`entry_source`/`experience_id`, khác tên với
 * shape UI (`id`/`d`/`src`/`x`). `px`/`py`/`phase` và `stages` là phần bố cục
 * của trình soạn, BE giữ nguyên không đụng tới.
 */

export type RxJourneyNodeKind =
  'entry' | 'experience' | 'decision' | 'action' | 'outcome';

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
  created_at: string;
  updated_at: string;
};

export type RxJourneyListResponse = { items: RxJourney[]; total: number };

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
};

/** PUT thay TOÀN BỘ, và `version` là bắt buộc. */
export type RxUpdateJourneyRequest = RxCreateJourneyRequest & {
  version: number;
};
