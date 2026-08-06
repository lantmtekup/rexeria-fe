/**
 * Experience wire shapes (spec §4.2) — the v2 unified library object: one shape
 * over templates (`kind: 'template'`), page copies (`'copy'`) and blocks
 * (`'block'`). Mirrors `be-ReXeR.ai/internal/domain/models/experience.go`.
 *
 * Lives here (not in `exchange.ts`) because it is its own domain — `/v1/experiences/*`
 * is a separate v2 surface. Exchange only borrows it as the return type of
 * `POST /v1/exchange/items/{itemId}/add`.
 *
 * Convention: snake_case wire shapes, `*T` → `T | null`, `omitempty` → optional.
 */

export type RxExperienceKind = 'template' | 'copy' | 'block';

export interface RxExperienceSubject {
  kind: 'product' | 'topic';
  product_id?: string;
  name: string;
}

export interface RxExperience {
  id: string;
  kind: RxExperienceKind;
  name: string;
  /** `collection` | `blocks`. */
  category: string;
  vehicle: string | null;
  objective: string | null;
  role: string | null;
  interactions: string[];
  is_template: boolean;
  origin_id: string | null;
  campaign_id: string | null;
  item_id: string | null;
  subject: RxExperienceSubject | null;
  proven: boolean;
  from_automation: boolean;
  auto_gaps: unknown[];
  tagline: string | null;
  summary: string | null;
  thumbnail_url: string | null;
  /**
   * Omitted (not 0) for `kind: 'block'` — a block owns no canvas, so coverage
   * was never measurable. Absence is a claim about measurability, not a zero.
   */
  /**
   * 0..1, và BỊ BỎ QUA (nil) khi loại này không đo được — đó là chủ ý của BE:
   * "nil = not measurable for this kind, and is omitted rather than reported
   * as 0%". Nên `undefined` ở đây nghĩa là CHƯA ĐO, không phải 0%.
   */
  signal_coverage?: number | null;
  /** Slug công khai của bản copy (`/p/{slug}`); template không có. */
  slug?: string | null;
  funnel_coverage?: string[];
  status: string;
  updated_at: string;
  /** `high|directional|early|unmeasured`; omitted on create/detail surfaces. */
  ev?: string;
  /** Only populated by `POST /v1/experiences`. */
  edit_url?: string;
}

/** `{ items, total }` list envelope (spec §2/§4.2). */
export interface RxExperienceListResponse {
  items: RxExperience[];
  total: number;
}

/** `POST /v1/experiences/{id}/promote` — `name` bắt buộc (BE validate min=1). */
export type RxPromoteExperienceRequest = {
  name: string;
  template_code?: string;
};

export type RxExperienceListQuery = {
  state?: string;
  category?: string;
  vehicle?: string;
  objective?: string;
  ev?: string;
  q?: string;
  campaign_id?: string;
  item_id?: string;
  sort?: string;
  page?: number;
  page_size?: number;
  /** Chỉ platform admin dùng được — BE ép principal khác về brand của họ. */
  brand_id?: string;
};

/** `measured:false` ⇒ CHƯA CHẠY. Đừng vẽ các số 0 kèm theo như thể là kết quả. */
export type RxExperienceStats = {
  measured: boolean;
  sessions: number;
  cvr: number;
  lift: number | null;
  revenue_cents: number;
  leads: number;
  dwell_ms_avg: number;
};

export type RxExperienceCoverage = {
  funnel_coverage: {
    roles_present: string[];
    missing: string[];
    complete: boolean;
  };
  signal_coverage: {
    blocks_total: number;
    blocks_reporting: number;
    components_total: number;
    components_tracked: number;
    /** 0..1 */
    pct: number;
  };
};
