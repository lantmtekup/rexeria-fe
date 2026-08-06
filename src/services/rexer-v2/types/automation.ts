import type { RxExperience } from './experience';

/**
 * Automation (spec §"THE AUTOMATION LAYER") — v2-only.
 *
 * BE đã làm gần hết phần logic mà FE từng phải tự ghép: chấm điểm sẵn sàng,
 * dựng master draft, và nhân bản sang N sản phẩm. FE chỉ còn gọi bốn endpoint
 * và vẽ. Shape ở đây gương đúng `internal/domain/models` của nhánh
 * `feature/v2-migration`.
 */

/** Sản phẩm như v2 BE trả về trong danh sách ứng viên. */
export type RxAutomationProduct = {
  id: string;
  name: string;
  sku?: string;
  status?: string;
  thumbnail_url?: string;
  category_id?: string | null;
  description?: string;
};

/**
 * Kết quả chấm ô phễu. BE trả về TÊN ô chứ không phải cờ boolean từng vai —
 * `filled` và `gaps` là hai danh sách rời, `score` là tỉ lệ đã tính sẵn.
 */
export type RxAutoSlots = {
  filled: string[];
  gaps: string[];
  /** 0..1 — đừng tự chia lại từ filled/gaps, BE có thể đổi cách tính. */
  score: number;
};

export type RxAutomationCandidate = {
  product: RxAutomationProduct;
  readiness: RxAutoSlots;
};

export type RxAutomation = {
  id: string;
  brand_id: string;
  source_template_id: string;
  setup_product_id: string;
  campaign_id: string;
  /** Bản nháp master do BE dựng khi tạo automation — mở được trong canvas. */
  master_page_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type RxAutomationHubResponse = {
  proven_templates: RxExperience[];
  automations: RxAutomation[];
  total: number;
};

export type RxCreateAutomationRequest = {
  source_experience_id: string;
  setup_product_id: string;
  campaign_id: string;
};

export type RxCreateAutomationResponse = {
  automation: RxAutomation;
};

export type RxAutomationCandidatesResponse = {
  items: RxAutomationCandidate[];
  total: number;
};

export type RxRunAutomationRequest = {
  product_ids: string[];
};
