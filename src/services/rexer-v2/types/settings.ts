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

/** Thành viên của brand — `GET /v1/brands/{id}/users`. */
export type RxBrandMember = {
  id: string;
  brand_id: string;
  user_id: string;
  role: 'owner' | 'manager' | 'editor' | 'viewer';
  joined_at: string;
  /** null = chưa từng đăng nhập kể từ khi được mời. */
  last_seen_at: string | null;
  invited_by: string | null;
  email: string;
  display_name: string;
};

export type RxBrandMembersResponse = { items: RxBrandMember[]; total: number };

/**
 * `POST` và `PATCH` bọc kết quả trong `{membership: …}`, còn `GET` trả thẳng
 * `items[]` — hai shape khác nhau trên cùng một tài nguyên. Và bản bọc KHÔNG
 * mang `email`/`display_name`, nên phải nạp lại danh sách để có tên.
 */
export type RxMembershipEnvelope = {
  membership: Omit<RxBrandMember, 'email' | 'display_name'> & {
    /**
     * Chỉ có khi lời mời vừa TẠO tài khoản mới VÀ thư không gửi được (Resend
     * chưa cấu hình, hoặc domain chưa xác minh). Thư đã đi thì trường này
     * rỗng — người mời phải chuyển tay đúng những lần còn lại.
     */
    generated_password?: string;
  };
};

export type RxInviteMemberRequest = {
  email: string;
  display_name?: string;
  role?: 'owner' | 'manager' | 'editor' | 'viewer';
};
