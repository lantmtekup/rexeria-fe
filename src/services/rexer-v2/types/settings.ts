/**
 * Settings (spec §14) — ba nguồn cho năm tab.
 *
 *   /org/governance    ngưỡng đo, trọng số, quyền riêng tư, mặc định sản phẩm
 *   /org/capabilities  loại tài khoản + bảng năng lực
 *   /me/profile        tên, email, chức danh của chính người đang đăng nhập
 *
 * Cả `governance` lẫn `capabilities` đều cần `brand_id` với platform admin —
 * họ không thuộc brand nào, và thiếu tham số là 400.
 */

export type RxGovScoreWeights = {
  order: number;
  blocks: number;
  signals: number;
};

export type RxGovFitWeights = {
  objective: number;
  audience: number;
  evidence: number;
};

export type RxGovernance = {
  /** Khoá lạc quan — `PUT` phải gửi đúng số vừa đọc. */
  version: number;
  high_floor: number;
  directional_floor: number;
  block_gap_pts: number;
  score_weights: RxGovScoreWeights;
  fit_weights: RxGovFitWeights;
  default_privacy: string;
  max_privacy: string;
  default_product_status: string;
  org_name: string;
};

/** PUT gửi TOÀN BỘ tài liệu — mọi trường `required`, thiếu một cái là 400. */
export type RxPutGovernanceRequest = RxGovernance;

export type RxCapabilities = {
  account_type: 'brand' | 'company' | 'agency' | 'freelance';
  /** `automate`, `team`, `white_label`… → đúng bảng "what this unlocks". */
  capabilities: Record<string, boolean>;
  spaces: string[];
};

export type RxMeProfile = {
  name: string;
  email: string;
  title: string;
};
