/**
 * Lead của MỘT trang — "thông tin khách để lại".
 *
 * Nguồn (đã soát handler BE `internal/server/http/handler/lead.go`, không suy
 * từ type FE):
 *   list   → GET /v1/leads?page_id=…   (cookieAuth, brand-scoped)
 *   trạng thái → PATCH /v1/leads/{id}  body `{ status }`
 *   chốt deal  → POST /v1/leads/{id}/deal
 *
 * `page_id` là THAM SỐ BẮT BUỘC của BE (`ListLeadFilters.PageID` validate
 * required) — đúng ý đồ: con số `leads` ở phễu và `total` của danh sách phải
 * khớp nhau dưới cùng một bộ lọc. Nên màn hình PHẢI chọn một trang trước; không
 * có "tất cả lead của brand" ở tầng API.
 *
 * Một `ExperienceView.id` CHÍNH LÀ page id (xem `experiences/types.ts`), nên
 * thư viện trải nghiệm dùng thẳng làm danh sách chọn.
 *
 * KHÔNG rơi về mock: nạp hỏng ⇒ trả rỗng + error để UI hiện khung trống.
 */

import { rexerApi } from '@/services/rexer/endpoints';
import type {
  AnalyticsRange,
  Lead,
  LeadStatus,
  LeadTier,
} from '@/services/rexer/types';

export type LeadsQuery = {
  pageId: string;
  status?: LeadStatus;
  tier?: LeadTier;
  range?: AnalyticsRange;
};

export type LeadsResult = {
  items: Lead[];
  total: number;
  error: string | null;
};

/** Trần của BE: `ListFilter.Limit` validate `max=500`. */
const PAGE_LIMIT = 200;

const message = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

export const fetchLeads = async ({
  pageId,
  status,
  tier,
  range,
}: LeadsQuery): Promise<LeadsResult> => {
  try {
    const res = await rexerApi.leads.list({
      page_id: pageId,
      limit: PAGE_LIMIT,
      // Người trực bán hàng đọc từ mới nhất xuống — lead nguội đi theo giờ,
      // không theo điểm. Cột điểm vẫn sắp được bằng cách bấm tiêu đề.
      sort_by: 'created_at',
      sort_order: 'desc',
      ...(status ? { status } : {}),
      ...(tier ? { tier } : {}),
      ...(range ? { range } : {}),
    });
    return {
      items: res.items ?? [],
      total: res.total ?? (res.items ?? []).length,
      error: null,
    };
  } catch (err) {
    return {
      items: [],
      total: 0,
      error: message(err, 'Không tải được danh sách khách để lại thông tin'),
    };
  }
};

/**
 * Những field KHÔNG phải cột riêng của bảng leads — phần còn lại của
 * `form_data`, tức những gì form của block hỏi thêm (ghi chú, ngân sách, căn
 * quan tâm…). `name`/`email`/`phone` đã có cột riêng nên bỏ ra, tránh in hai
 * lần cùng một giá trị.
 */
const CORE_FORM_KEYS = new Set(['name', 'email', 'phone', 'contact']);

export const extraFormFields = (
  lead: Lead
): { key: string; value: string }[] => {
  const data = lead.form_data;
  if (!data || typeof data !== 'object') return [];
  const out: { key: string; value: string }[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (CORE_FORM_KEYS.has(key.toLowerCase())) continue;
    if (value === null || value === undefined) continue;
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    if (text.trim()) out.push({ key, value: text });
  }
  return out;
};
