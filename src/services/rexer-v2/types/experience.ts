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

/**
 * Một component bên trong block — chỉ block đã GẮN THẺ mới có.
 *
 * `signal` là chỗ ý nghĩa nằm: `event: 'spin'` trên một `component_kind:
 * 'media'` nghĩa là "người mua xoay ảnh 360", không phải `button_click_47`.
 */
export interface RxExperienceLayerComponent {
  key: string;
  component_kind: string;
  signal?: {
    track?: boolean;
    /** `EXPOSURE` | … */
    type?: string;
    /** `view` | `play` | `spin` | `tap` | `complete` … */
    event?: string;
    object?: string;
    privacy?: string;
    strength?: number;
    crm_action?: string;
  } | null;
}

/**
 * Một block trong canvas, **nguyên xi như lúc được soạn**.
 *
 * BE trả thẳng canvas nên có HAI hình dạng, không phải một:
 *
 *   A · đã gắn thẻ  `{ key, role, block_type, block_signal, components[] }`
 *   B · canvas thường `{ id, name, blockType, isVisible }`  ← camelCase
 *
 * Kiểm trên dữ liệu thật 2026-08-07: 24 bản ghi lấy mẫu ra **1 hình A, 14 hình
 * B, 9 rỗng**. Nên mọi trường ở đây đều optional — đọc `block_type ?? blockType`
 * và coi `role` vắng là "chưa gán vai", đừng bịa một vai vào.
 */
export interface RxExperienceLayer {
  /** Hình A. */
  key?: string;
  role?: string | null;
  block_type?: string;
  block_signal?: { track?: boolean; signals?: Record<string, boolean> } | null;
  components?: RxExperienceLayerComponent[];
  /** Hình B. */
  id?: string;
  name?: string;
  blockType?: string;
  isVisible?: boolean;
  /** Nội dung đã soạn — cả hai hình đều có, shape tuỳ block. */
  content?: Record<string, unknown> | null;
  contentVi?: Record<string, unknown> | null;
  contentEn?: Record<string, unknown> | null;
}

/**
 * `GET /v1/experiences/{id}` (spec §4.4) — object §4.2 **cộng** layers thật,
 * features/benefits và lineage.
 *
 * Đây là nguồn DUY NHẤT có block thật: `GET /v1/experiences` chỉ trả
 * `funnel_coverage` (mảng vai), và 99/100 bản ghi trả `null` cho nó.
 */
export interface RxExperienceDetail extends RxExperience {
  layers: RxExperienceLayer[] | null;
  features: string[] | null;
  benefits: string[] | null;
  lineage?: {
    origin?: RxExperience;
    copies_count?: number;
  };
}

/** `{ items, total }` list envelope (spec §2/§4.2). */
export interface RxExperienceListResponse {
  items: RxExperience[];
  total: number;
}

/**
 * `POST /v1/experiences/{id}/use` — hai trường **đi cùng nhau**, và đều tuỳ
 * chọn:
 *
 * - không gửi gì ⇒ lấy một **bản của mình**: page thuộc brand người gọi,
 *   `campaign_item_id` NULL. Đây là đường thường: xem thư viện, thấy ưng, lấy
 *   một bản về sửa, xong xuôi mới quyết dùng cho chiến dịch nào.
 * - gửi cả hai ⇒ nộp thẳng vào hạng mục đó. Đường tắt cho người đang đứng sẵn
 *   trong một chiến dịch.
 *
 * Gửi một trong hai thì BE trả 400.
 */
export type RxUseExperienceRequest = {
  campaign_id?: string;
  item_id?: string;
  /**
   * Chủ của bản copy khi fork KHÔNG kèm chiến dịch. Chỉ platform admin cần gửi
   * — họ không thuộc brand nào, nên thiếu trường này BE trả 400 `taking a copy
   * of an experience requires a brand scope`. Người dùng thuộc brand thì BE lấy
   * brand từ phiên; gửi brand khác của mình sẽ bị từ chối.
   *
   * Bỏ qua ở đường có `campaign_id`/`item_id`: ở đó chiến dịch đã nói brand.
   */
  brand_id?: string;
};

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
