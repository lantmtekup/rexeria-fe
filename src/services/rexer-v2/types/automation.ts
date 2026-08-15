import type { AiBrandBrief, AiProductBrief } from '@/lib/ai-brief/types';
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
  /** Đúng 1 trong hai — BE giờ tạo automation thẳng từ canvas của page, không
   *  bắt buộc phải có template gốc nữa (automations_source_chk). */
  source_template_id?: string | null;
  source_page_id?: string | null;
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

/** Phẳng, KHÔNG bọc trong `automation` — BE trả đúng ba trường này. */
export type RxCreateAutomationResponse = {
  id: string;
  master_page_id: string;
  status: string;
};

/** Một bản nháp đã fork. Nội dung do worker nền điền sau, không có ngay. */
export type RxAutomationRunItem = {
  product_id: string;
  page_id: string;
  /** Ô phễu còn thiếu, do `core.AutoSlots` chấm lúc fork. */
  auto_gaps: string[];
};

/** Sản phẩm bị bỏ qua khi Run — không fork, không tạo ai_job. */
export type RxAutomationRunSkip = {
  product_id: string;
  reason: string;
  auto_gaps: string[];
};

export type RxRunAutomationResponse = {
  created: RxAutomationRunItem[];
  skipped: RxAutomationRunSkip[];
};

export type RxAutomationCandidatesResponse = {
  items: RxAutomationCandidate[];
  total: number;
};

/**
 * Brief cho AI (brand + product + ảnh) — cộng thêm vào `run`, OPTIONAL: BE
 * chưa xác nhận nhận field này, request vẫn gửi được nếu thiếu (chỉ mất phần
 * "hiểu brand/sản phẩm", không vỡ luồng nhân bản hiện có).
 */
export type RxAutomationBriefPayload = {
  brand?: AiBrandBrief;
  product?: AiProductBrief;
  assets?: { items: string[] };
  note?: string;
};

export type RxRunAutomationRequest = {
  product_ids: string[];
  inputs?: RxAutomationBriefPayload;
};
