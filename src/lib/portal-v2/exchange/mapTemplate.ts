import type {
  ExchangeListingMeta,
  ExchangeListingView,
  ExchangeObjective,
} from '@/lib/portal-v2/exchange/types';
import type { Template } from '@/services/rexer/types';

/**
 * Trải nghiệm gốc hệ thống → thẻ trên màn Exchange.
 *
 * `GET /v1/templates` áp `brand_id IS NULL OR brand_id = ?`
 * (`repository/template.go:79`), nên trải nghiệm gốc hệ thống (`brand_id NULL`) hiện
 * ra với MỌI tài khoản — admin hay brand đều thấy cùng một danh sách. Đó là
 * lý do khối này ghép được vào chợ mà không tạo lại chênh lệch cũ.
 *
 * Đây là hàng của KHO NỀN TẢNG, không phải hàng ai đó đăng bán. Nên nó không
 * mang giá, không mang evidence, không mang độ phủ — ba trường đó để trống
 * thay vì điền 0, và UI im lặng ở những chỗ ấy.
 */

const OBJECTIVES = ['insight', 'lead', 'cta', 'convert'] as const;

const GRADIENTS = [
  'linear-gradient(135deg,#eef2ff,#e0e7ff)',
  'linear-gradient(135deg,#fef3c7,#fde68a)',
  'linear-gradient(135deg,#dcfce7,#bbf7d0)',
  'linear-gradient(135deg,#fae8ff,#f5d0fe)',
  'linear-gradient(135deg,#e0f2fe,#bae6fd)',
  'linear-gradient(135deg,#ffe4e6,#fecdd3)',
] as const;

const gradientFor = (id: string): string => {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length]!;
};

/** `objective` không nằm trong bộ đóng ⇒ null, không lùi về một nhãn mặc định. */
const narrowObjective = (
  raw: string | null | undefined
): Exclude<ExchangeObjective, 'all'> | null =>
  OBJECTIVES.includes(raw as (typeof OBJECTIVES)[number])
    ? (raw as Exclude<ExchangeObjective, 'all'>)
    : null;

const authorOf = (t: Template): string => {
  if (typeof t.author === 'string') return t.author;
  if (t.author && typeof t.author === 'object' && 'name' in t.author) {
    return String((t.author as { name?: string }).name ?? '');
  }
  return 'ReXeR';
};

export const mapTemplateToListing = (
  t: Template,
  /** Slug from a published page the caller can list — used when BE omits `preview_slug`. */
  publishedSlug?: string
): ExchangeListingView => {
  const meta: ExchangeListingMeta = {
    // Kho nền tảng — dùng được, không phải mua. `0` ở đây là giá THẬT.
    price: 0,
    featured: false,
    objective: narrowObjective(
      (t as Template & { objective?: string }).objective ?? null
    ),
    kind: 'page',
    grad: gradientFor(t.id),
    ...(t.description ? { summary: t.description } : {}),
    // evidence / coverage bỏ trống: chưa ai đo trải nghiệm gốc này trên chợ.
  };

  const slug = t.preview_slug || publishedSlug;

  return {
    id: `tpl-${t.id}`,
    source: 'page',
    templateId: t.id,
    // Xem trước đi qua `/p/{slug}`. Template không có slug riêng. BE *nên*
    // giải `preview_slug`; swagger hiện tại chưa có field đó, nên catalog
    // truyền thêm slug page đã publish (nếu tài khoản này list được).
    ...(slug ? { slug } : {}),
    templateVersionId: t.current_version_id,
    ...(t.code ? { templateCode: t.code } : {}),
    name: t.name || t.code || 'Untitled',
    author: authorOf(t),
    description: t.description || '',
    ...(t.thumbnail_url ? { thumbnailUrl: t.thumbnail_url } : {}),
    ...(t.category ? { category: t.category } : {}),
    meta,
    proven: false,
  };
};
