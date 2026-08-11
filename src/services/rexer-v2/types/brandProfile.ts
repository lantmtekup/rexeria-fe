/**
 * Hồ sơ thương hiệu (spec §13.1) — `GET/PUT /v1/brands/{brandId}/profile`.
 *
 * Gương đúng `internal/domain/models/brand_profile.go`. Bốn mục ở đây khớp bốn
 * tab của màn Brand: Identity · Essence · Audience · Visual.
 */

export type RxProfilePositioning = {
  category: string;
  against: string;
  because: string;
};

export type RxProfileIdentity = {
  name: string;
  description: string;
  mission: string;
  value_prop: string;
  positioning: RxProfilePositioning;
  categories: string[];
  industry: string;
  differentiation: string[];
  tones: string[];
};

export type RxProfileEssence = {
  functional: string[];
  emotional: string[];
  social: string[];
  personality: string[];
  perception: string;
};

export type RxProfilePersona = {
  id: string;
  name: string;
  tier: string;
  /** BE có, Portal V2 chưa dùng tới — giữ để PUT không làm rụng. */
  behaves?: string;
  stage: string;
  awareness: string;
  motivations: string[];
  objections: string[];
  action: string;
  desired: string;
};

export type RxProfileLogo = {
  name: string;
  use: string;
  /** BẮT BUỘC bên BE — logo chưa gắn ảnh thì đừng gửi lên. */
  media_id: string;
};

export type RxProfileColor = { name: string; hex: string; role: string };

export type RxProfileType = {
  display: string;
  body: string;
  /** SỐ, không phải chuỗi. FE hiển thị "400, 600" nên phải tách khi gửi. */
  weights: number[];
  scale: string;
  files: string[];
};

export type RxProfileImagery = {
  direction: string;
  ref_media_ids: string[];
};

export type RxProfileVisual = {
  logos: RxProfileLogo[];
  colors: RxProfileColor[];
  type: RxProfileType;
  layout: string[];
  imagery: RxProfileImagery;
};

export type RxBrandProfile = {
  /** Khoá chống ghi đè: PUT gửi lại đúng version vừa đọc, lệch là BE từ chối. */
  version: number;
  identity: RxProfileIdentity;
  essence: RxProfileEssence;
  audience: RxProfilePersona[];
  visual: RxProfileVisual;
};

export type RxPutBrandProfileRequest = {
  version: number;
  identity?: Partial<RxProfileIdentity>;
  essence?: Partial<RxProfileEssence>;
  /**
   * Mảng THAY TOÀN BỘ khi có mặt; bỏ khoá = "đừng đụng tới". Gửi `[]` là xoá
   * sạch persona, không phải "giữ nguyên".
   */
  audience?: RxProfilePersona[];
  visual?: Partial<RxProfileVisual>;
};
