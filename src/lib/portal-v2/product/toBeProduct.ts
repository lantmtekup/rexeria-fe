import type { Product } from '@/lib/portal-v2/product/types';
import type {
  CreateProductRequest,
  UpdateProductRequest,
} from '@/services/rexer/types';

/**
 * `Product` (shape của Portal V2) → payload cho `POST/PATCH /v1/products`.
 *
 * Chiều ngược của `mapProduct.ts`. Có hai điều dễ sai và cả hai đều im lặng:
 *
 * 1. HAI nguồn features. Cột `features` mang {label, description} — thứ modal
 *    hiển thị; `value.features` mang chuỗi phẳng — thứ `core.AutoSlots` chấm
 *    và AI đọc khi sinh nội dung. BE KHÔNG tự suy cái này ra cái kia
 *    (`applyValueInput` lấy nguyên xi từ client), nên phải gửi CẢ HAI. Ghi
 *    một bên là trang sinh ra mất nội dung mà không ai báo.
 *
 * 2. `ok` của claim do BE tự tính qua `core.DeriveClaims`. Gửi lên bị bỏ qua,
 *    nên đừng dựng UI cho phép người dùng tự đánh dấu "đã chứng minh".
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Chỉ nhận id thật; id tổng hợp phía client bị loại. */
const asUuid = (v: string | null | undefined): string | undefined =>
  v && UUID_RE.test(v) ? v : undefined;

/** Đồng → xu, làm tròn. `0`/rỗng ⇒ bỏ hẳn khoá thay vì gửi 0. */
const toCents = (v: number | undefined): number | undefined =>
  v && v > 0 ? Math.round(v * 100) : undefined;

const toInt = (v: number | undefined): number | undefined =>
  v && v > 0 ? Math.round(v) : undefined;

/** Tách "Nhãn: giá trị" thành cặp; không có dấu hai chấm thì coi cả câu là nhãn. */
const splitFeature = (raw: string): { label: string; description: string } => {
  const i = raw.indexOf(':');
  if (i < 0) return { label: raw.trim(), description: '' };
  return {
    label: raw.slice(0, i).trim(),
    description: raw.slice(i + 1).trim(),
  };
};

const valuePayload = (p: Product) => ({
  // Chuỗi phẳng, giữ nguyên cả phần giá trị — KHÔNG cắt còn mỗi nhãn, vì đây
  // là thứ AI đọc. Bản trên prod đang chỉ có nhãn và đó là lý do nội dung sinh
  // ra nói "Giá niêm yết" mà không có giá.
  features: p.value.features.map(f => f.trim()).filter(Boolean),
  benefits: p.value.benefits.map(b => b.trim()).filter(Boolean),
  competitors: p.value.competitors
    .filter(c => c.n?.trim())
    .map(c => ({
      name: c.n.trim(),
      theirs: c.theirs ?? '',
      ours: c.ours ?? '',
    })),
  claims: p.value.claims
    .filter(c => c.t?.trim())
    .map(c => ({ text: c.t.trim(), proof: c.proof ?? '' })),
  disclaimers: p.value.disclaimers.map(d => d.trim()).filter(Boolean),
});

export const toCreateProductRequest = (
  p: Product,
  opts: { brandId?: string; mediaIds?: string[]; coverMediaId?: string } = {}
): CreateProductRequest => ({
  name: p.title.trim(),
  slug: p.handle?.trim() || undefined,
  sku: p.variants[0]?.sku?.trim() || undefined,
  description: p.body?.trim() || undefined,
  body_html: p.body?.trim() || undefined,
  handle: p.handle?.trim() || undefined,
  status: p.status,
  type: p.type?.trim() || undefined,
  brand_name: p.brand?.trim() || undefined,
  brand_id: opts.brandId,
  category_id: asUuid(p.categoryId),
  category: p.category?.trim() || undefined,
  tags: p.tags?.length ? p.tags : undefined,
  source: p.source,
  channels: p.channels?.length ? p.channels : undefined,
  // Cả hai nguồn features — xem chú thích đầu file.
  features: p.value.features
    .map(splitFeature)
    .filter(f => f.label)
    .map(f => ({ label: f.label, description: f.description })),
  value: valuePayload(p),
  options: p.options?.length
    ? p.options.map(o => ({ name: o.name, values: o.values }))
    : undefined,
  variants_v2: p.variants.length
    ? p.variants.map(v => ({
        sku: v.sku,
        option1: v.opt1,
        barcode: v.barcode,
        // Tiền tính bằng XU và là số nguyên. Gửi `price` (tên cũ, số thực) thì
        // BE bỏ qua im lặng — giá không bao giờ được lưu.
        price_cents: toCents(v.price),
        compare_at_cents: toCents(v.compareAt),
        cost_cents: toCents(v.cost),
        qty: toInt(v.qty),
        inventory_policy: v.policy === 'continue' ? 'continue' : 'deny',
        // `grams` là số NGUYÊN bên BE: gửi 1.97 trả 400 "expected=int". Nhẫn
        // vàng nặng dưới 2g nên làm tròn là mất thông tin — nhưng đó là hợp
        // đồng hiện tại, và mất một chữ số vẫn hơn không lưu được gì.
        grams: toInt(v.grams),
      }))
    : undefined,
  seo:
    p.seo?.title || p.seo?.desc
      ? { title: p.seo.title, description: p.seo.desc }
      : undefined,
  // Ảnh bìa người dùng chọn nằm ở `p.cover`. Chỉ gửi khi nó là UUID thật:
  // với sản phẩm chưa có media, `mapProduct` từng bịa ra id kiểu
  // `a-{productId}-cover` để lưới có gì đó mà vẽ — gửi id đó lên là BE 400.
  //
  // ATT được chấm theo trường này (hoặc số media binding); `thumbnail_url`
  // KHÔNG được tính.
  cover_media_id: opts.coverMediaId ?? asUuid(p.cover),
  media_ids: opts.mediaIds?.length ? opts.mediaIds : undefined,
});

export const toUpdateProductRequest = (
  p: Product,
  opts: { coverMediaId?: string } = {}
): UpdateProductRequest => {
  // PATCH nhận đúng những trường gửi lên. Không truyền `mediaIds` xuống là
  // khoá `media_ids` không xuất hiện — nó chỉ có nghĩa lúc tạo mới.
  return toCreateProductRequest(p, opts) as UpdateProductRequest;
};
