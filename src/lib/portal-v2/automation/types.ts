/**
 * Portal V2 — Automation types.
 *
 * Mô hình lấy từ `rexer-demo-v3_102.html` §"THE AUTOMATION LAYER (06k)" — bản
 * proven-first propagation, KHÔNG phải "rules / promote queue" mà module-map
 * ghi theo prototype `rexer-platform-v2.html` cũ. Plan `#mod-automation` mô tả
 * đúng bản demo: "Luồng Master → chỉnh → Automate sang product class".
 *
 * Nguyên tắc của demo, giữ nguyên ở đây vì nó là điểm khác biệt của module:
 * bản copy KHÔNG thừa hưởng số liệu của bản gốc, và thứ nào không lấp được từ
 * chính record sản phẩm thì phơi ra thành GAP chứ không bịa.
 */

/** Năm vai phễu — `ROLES` của demo. Plan gọi là "điểm sẵn sàng 5 ô phễu". */
export type FunnelRole = 'ATT' | 'EXP' | 'EDU' | 'TRU' | 'CON';

/** Bậc bằng chứng đọc từ kết quả thật; chưa chạy thì `unmeasured`. */
export type EvidenceTier = 'high' | 'directional' | 'early' | 'unmeasured';

/** Ba chặng của workspace: hub khi rảnh, wizard khi đang nhân bản. */
export type AutomationStage = 'hub' | 'setup' | 'pick';

/** Một tầng trong thiết kế — demo `layers[]`, chỉ giữ phần Automation cần. */
export type AutomationLayer = {
  role: FunnelRole;
  name: string;
};

/**
 * Thiết kế đã được đánh dấu Proven.
 *
 * `proven` là dấu THỦ CÔNG do người dùng bấm (demo: "a manual curation mark.
 * It never touches the numbers") — không suy ra từ số liệu. Phần `lift` và
 * `evidence` hiển thị BÊN CẠNH nó và tự suy biến về `unmeasured` khi chưa có
 * số, đúng tinh thần "evidence or silence".
 */
export type AutomationExperience = {
  id: string;
  name: string;
  /**
   * KHOÁ i18n trong `portalV2.experiences`, không phải giá trị enum thô.
   *
   * Từ vựng vehicle/objective thuộc về module Experiences; mang khoá sang đây
   * thì hub dịch được mà Automation không phải import union enum của nó. In
   * thẳng enum ra màn hình sẽ hiện "microsite · lead" — đúng dữ liệu, sai ngôn ngữ.
   */
  categoryKey: string;
  objectiveKey: string;
  proven: boolean;
  layers: AutomationLayer[];
  /** Phần trăm so với control. `null` = chưa chạy, KHÔNG phải 0. */
  lift: number | null;
  evidence: EvidenceTier;
  gradient: string;
};

/** Sản phẩm — demo `DATA.products`, rút còn phần rubric đọc tới. */
export type AutomationProduct = {
  id: string;
  title: string;
  type: string;
  /** Đường phân loại đầy đủ: "A > B > C". Lớp = đoạn cuối. */
  category: string;
  status: 'active' | 'draft' | 'archived';
  hasCover: boolean;
  /** Số ảnh trong thư viện gắn với sản phẩm — vai EXP cần > 1. */
  imageCount: number;
  body: string;
  benefits: string[];
  features: string[];
  /**
   * Khẳng định KÈM bằng chứng. Gửi cả nội dung lẫn dẫn chứng, không chỉ đếm —
   * "có 2 khẳng định đã xác minh" chẳng nói cho model biết phải viết gì.
   */
  claims: { text: string; proof: string }[];
  /** Đối thủ đã nêu tên: "họ thế nào, mình thế nào". */
  competitors: { name: string; theirs: string; ours: string }[];
  /** Miễn trừ đi kèm mọi khẳng định mà nó ràng buộc. */
  disclaimers: string[];
  /** Giá hiển thị đúng như trên hồ sơ, kèm đơn vị tiền. */
  priceText: string | null;
  /** Claim đã có bằng chứng — vai TRU chỉ tính claim `proven`. */
  provenClaims: number;
  variantCount: number;
  gradient: string;
};

export type AutomationCampaign = {
  id: string;
  name: string;
};

/** Một ô phễu đã chấm trên một sản phẩm cụ thể. */
export type ReadinessSlot = {
  role: FunnelRole;
  /** Thiếu thì cần gì — chuỗi i18n key, không phải câu tiếng Anh cứng. */
  needKey: string;
  ok: boolean;
};

export type Readiness = {
  slots: ReadinessSlot[];
  filled: number;
  total: number;
  gaps: ReadinessSlot[];
};
