/**
 * Portal V2 — Experiences view types.
 *
 * The library is backed by REAL published landing pages — `GET /v1/pages?
 * type=landing&status=published`, the same source `/admin/landing-pages` reads.
 * The analytics half (coverage, stats, evidence, funnel layers) has no backend
 * yet, so it is SEEDED from `page.id` via the prototype's own hash. See
 * `ExperienceView` below for which half is which, and `seed.ts` for the hash.
 *
 * Vocabulary (roles, objectives, vehicles, evidence tiers) is ported from the
 * `plan-v2/rexer-platform-v2.html` prototype and lines up with
 * `@/services/rexer-v2/types/experience` (`RxExperience`), so when
 * `/v1/experiences` lands the seeded half can be swapped for measured values
 * field-for-field rather than restructured.
 */

/** `DATA.expCategories` (~L5480) → `RxExperience.category`. */
export type ExperienceCategory = 'blocks' | 'collection';

/** `DATA.expCats` (~L5497) — the vehicle → `RxExperience.vehicle`. */
export type ExperienceVehicle = 'curated' | 'ads' | 'showcase' | 'microsite';

/** `DATA.expObjs` (~L5511) → `RxExperience.objective`. */
export type ExperienceObjective = 'insight' | 'lead' | 'cta' | 'convert';

/** `DATA.expInteractions` (~L5521) → `RxExperience.interactions[]`. */
export type ExperienceInteraction = 'hotspot' | 'swipe' | 'pan' | '360' | 'vr';

/** `EV_OPTS` minus 'all' → `RxExperience.ev`. The wire says 'unmeasured'. */
export type EvidenceTier = 'high' | 'directional' | 'early' | 'unmeasured';

/**
 * Trục SỞ HỮU — prototype `expState` / `XSTATES` (~L15927), mở rộng cho v2.
 *
 * Trải nghiệm gốc thuộc về thư viện dùng chung; bản copy thuộc về brand đã lấy nó.
 *
 * `unassigned` không có trong prototype và là mắt xích thiếu: prototype giả
 * định mọi bản copy đều sinh ra bên trong một chiến dịch, còn thực tế người
 * dùng lấy một bản về sửa TRƯỚC, rồi mới quyết dùng cho chiến dịch nào — và
 * trang do trình dựng / AI sinh ra thì không bao giờ đi qua chiến dịch cả.
 * Thiếu trạng thái này thì 55/56 trang của brand không có tab nào chứa.
 */
export type ExperienceState =
  | 'template'
  | 'unassigned'
  | 'product'
  | 'topic'
  | 'block';

/**
 * Một component bên trong block — `GET /v1/experiences/{id}` → `layers[].
 * components[]`.
 *
 * `kind` là chuỗi TỰ DO từ canvas (`media`, `product`, `button`, …), không phải
 * enum: bảng nhãn chỉ dịch những giá trị đã biết và in nguyên phần còn lại.
 * Đóng khung nó thành union sẽ khiến một loại block mới ở BE lặng lẽ rơi khỏi
 * màn hình.
 */
export type LayerComponent = {
  key: string;
  kind: string;
  tracked: boolean;
  /** `view` | `play` | `spin` | `tap` | `complete` … — cái nó BÁO VỀ. */
  event: string | null;
};

/**
 * Một block trong canvas.
 *
 * Nạp từ `GET /v1/experiences/{id}` — chính các block của canvas.
 */
export type ExperienceLayer = {
  name: string;
  /** `framer_realestate02_menu` — mã block, hiện dạng mono. */
  blockType: string | null;
  /** false ⇒ block bị ẩn trên trang thật. */
  visible: boolean;
  /** `block_signal.track` — block có báo dwell/scroll không. */
  tracked: boolean;
  /** `['dwell','scroll']` — tên tín hiệu mức block. */
  blockSignals: string[];
  components: LayerComponent[];
};

/** Prototype `signalCoverage(e)` (~L12566). `pct` is COMPONENT coverage. */
export type SignalCoverage = {
  blocks: number;
  trackedBlocks: number;
  components: number;
  trackedComponents: number;
  /** trackedComponents / components, rounded. */
  pct: number;
};

/**
 * Prototype `xStats(e)` (~L12532). NULL when the record has no fact rows behind
 * it — never a zero. Cards read `stats === null` as "Not yet run" (rule R5).
 */
export type ExperienceStats = {
  sessions: number;
  engaged: number;
  explored: number;
  convinced: number;
  converted: number;
  leads: number;
  revenue: number;
  /** 0..1 */
  cvr: number;
  /** Signed fraction, e.g. 0.18 → +18%. */
  lift: number;
  campaigns: number;
  campaignNames: string[];
  channels: string[];
};

/**
 * Prototype `engShelfRead(e)` (~L15258) — the CONCEPT read, keyed on
 * `originId ?? id`, so a source experience and every copy of it always agree on tier.
 */
export type ExperienceEvidence = {
  tier: EvidenceTier;
  /** null when nothing in the lineage has ever run. */
  lineage: ExperienceStats | null;
};

/**
 * One row of the library.
 *
 * Split deliberately into REAL and SEEDED halves. The real half comes straight
 * off the `Page` record from `GET /v1/pages`; the seeded half is derived from
 * `page.id` through the prototype's own hash so the analytics surfaces have
 * something to render until the measurement pipeline exists.
 *
 * This mirrors what Exchange already does — `mapLandingPageToListing`
 * (`@/lib/portal-v2/exchange/mapPage`) attaches `pageMetaPreset(page.id)` to a
 * real page the same way. Seeded values are stable per page id, never random.
 */
export type ExperienceView = {
  // ── REAL · straight off the `Page` record ────────────────────────────────
  /** Page UUID. Also the seed for every derived figure below. */
  id: string;
  name: string;
  /** Public slug for `/p/{slug}`. Empty on pages created without one. */
  slug: string | null;
  /** Seed version id — what a future "install this" flow would fork. */
  templateVersionId: string | null;
  thumbnailUrl: string | null;
  /** Set ⇒ the page has no canvas; Edit must be blocked. */
  externalUrl: string | null;
  status: PageStatusView;
  summary: string;
  /** Absolute UTC date. Never a relative string — see `formatUpdated`. */
  updatedLabel: string;

  // ── SEEDED from `id` · stable, deterministic, not measured ───────────────
  /** Ownership axis — prototype `expState`. Seeded until lineage exists. */
  state: ExperienceState;
  /**
   * Bản copy này đang phục vụ hạng mục nào — `null` khi chưa gắn vào đâu.
   *
   * `GET /v1/experiences` trả sẵn cả ba trường này; bản trước đọc chúng CHỈ để
   * suy ra `state` rồi vứt đi. Nên màn hình biết một mục "là bản copy sản
   * phẩm" mà không nói được nó thuộc sản phẩm nào — người dùng nhìn ba thẻ tên
   * na ná nhau và không có cách nào phân biệt.
   *
   * `campaignName` KHÔNG có trên dây: chỉ có id, tên phải tra riêng qua danh
   * sách chiến dịch (xem `withCampaignNames`).
   */
  campaignId: string | null;
  campaignName: string | null;
  itemId: string | null;
  /** Sản phẩm hoặc chủ đề mà bản copy này nói về. */
  subject: { kind: 'product' | 'topic'; name: string } | null;
  category: ExperienceCategory;
  vehicle: ExperienceVehicle;
  objective: ExperienceObjective;
  interactions: ExperienceInteraction[];
  proven: boolean;
  tagline: string;
  /**
   * RỖNG ở danh sách — chỉ `GET /v1/experiences/{id}` mới có block thật, và
   * modal nạp nó khi mở.
   */
  layers: ExperienceLayer[];
  features: string[];
  benefits: string[];
  /**
   * Độ phủ cho THẺ, tính theo phần trăm — `signal_coverage` của danh sách.
   *
   * null = CHƯA ĐO. BE cố ý bỏ qua trường này với loại không đo được ("nil =
   * not measurable for this kind, and is omitted rather than reported as 0%"),
   * nên quy về 0% ở đây là dựng lại đúng lời nói dối vừa gỡ. Đo thật
   * 2026-08-07: 99/100 bản ghi trả null.
   *
   * Chỉ là con số, KHÔNG phải `SignalCoverage`: danh sách không kèm số block
   * hay số component, nên dựng một object với các đếm bằng 0 sẽ khiến câu
   * "0/0 component có điểm đo" hiện ra như một phép đo. Khối đầy đủ nằm ở
   * `GET /experiences/{id}/coverage`, modal nạp riêng.
   */
  coveragePct: number | null;
  /** null when the seed says this has never run — never a zero. */
  stats: ExperienceStats | null;
  evidence: ExperienceEvidence;

  /**
   * Locale-independent haystack: name + slug + description. Precomputed so the
   * client-side chip filter stays a pure function with no `t` dependency and a
   * search means the same thing under en and vi.
   */
  searchText: string;
};

export type PageStatusView = 'draft' | 'published' | 'archived';

export type ExperienceFilters = {
  q: string;
  /** Ownership tab — prototype `F.state`. */
  state: ExperienceState | 'all';
  category: ExperienceCategory | 'all';
  vehicle: ExperienceVehicle | 'all';
  objective: ExperienceObjective | 'all';
  ev: EvidenceTier | 'all';
};

export type ExperienceDetailTab = 'details' | 'signals' | 'perf';
