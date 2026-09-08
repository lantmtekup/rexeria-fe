import type {
  AnalyticsRange,
  LeadStatus,
  LeadTier,
} from '@/services/rexer/types';

/**
 * Bộ lọc của màn "Khách để lại thông tin", đọc từ query string.
 *
 * Đi qua URL chứ không phải state trong máy: server component nạp được ngay ở
 * lần render đầu (không nháy khung rỗng rồi mới có dữ liệu), và người trực bán
 * hàng gửi được nguyên đường link "lead nóng của trang X" cho đồng nghiệp.
 * Cùng quy ước với `?brand=` của `resolvePortalScope`.
 */

export const LEADS_PAGE_PARAM = 'page';
export const LEADS_STATUS_PARAM = 'status';
export const LEADS_TIER_PARAM = 'tier';
export const LEADS_RANGE_PARAM = 'range';

const LEAD_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'negotiating',
  'won',
  'lost',
];
const LEAD_TIERS: LeadTier[] = ['hot', 'warm', 'cold'];
const RANGES: AnalyticsRange[] = ['7d', '30d', '90d'];

type SearchParams = Record<string, string | string[] | undefined>;

const one = (sp: SearchParams, key: string): string | null => {
  const raw = sp[key];
  return (Array.isArray(raw) ? raw[0] : raw)?.trim() || null;
};

/**
 * Giá trị lạ ⇒ coi như KHÔNG lọc, thay vì đẩy nguyên xuống BE.
 * `ListLeadFilters` validate `oneof=…`, nên một `?tier=nong` gõ nhầm sẽ làm cả
 * màn hình 400 — trong khi ý người dùng chỉ là xem danh sách.
 */
const oneOf = <T extends string>(
  sp: SearchParams,
  key: string,
  allowed: T[]
): T | undefined => {
  const v = one(sp, key);
  return v && (allowed as string[]).includes(v) ? (v as T) : undefined;
};

export type LeadsFilters = {
  pageId: string | null;
  status?: LeadStatus;
  tier?: LeadTier;
  range: AnalyticsRange;
};

export const readLeadsFilters = (sp: SearchParams): LeadsFilters => ({
  pageId: one(sp, LEADS_PAGE_PARAM),
  status: oneOf(sp, LEADS_STATUS_PARAM, LEAD_STATUSES),
  tier: oneOf(sp, LEADS_TIER_PARAM, LEAD_TIERS),
  // BE tự suy from/to khi thiếu, nhưng để mặc định tường minh thì con số trên
  // màn hình luôn nói rõ nó đang đếm khoảng nào.
  range: oneOf(sp, LEADS_RANGE_PARAM, RANGES) ?? '30d',
});

/** Đường dẫn màn lead của một trang — dùng từ thư viện Trải nghiệm. */
export const leadsHref = (
  base: string,
  pageId: string,
  brandId?: string | null
): string => {
  const q = new URLSearchParams({ [LEADS_PAGE_PARAM]: pageId });
  if (brandId) q.set('brand', brandId);
  return `${base}/experiences/leads?${q.toString()}`;
};
