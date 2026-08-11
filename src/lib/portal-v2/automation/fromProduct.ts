import type { Product, ProductAsset } from '@/lib/portal-v2/product/types';
import type { AutomationProduct } from '@/lib/portal-v2/automation/types';

/**
 * `Product` (catalogue v2) → `AutomationProduct` (rubric sẵn sàng).
 *
 * Rubric hỏi record sản phẩm năm câu, và cả năm đều trả lời được từ shape này —
 * nên map thẳng, không suy diễn thêm gì. Thiếu dữ liệu thì để đúng là thiếu:
 * đó là GAP, và gap được phơi ra chứ không lấp bằng mặc định cho đẹp.
 */
export const toAutomationProduct = (
  p: Product,
  assets: ProductAsset[]
): AutomationProduct => ({
  id: p.id,
  title: p.title,
  type: p.type || '—',
  category: p.category || '',
  // `ProductStatus` của v2 đã là 'active' | 'draft' | 'archived' — không cần
  // nhánh phòng thủ, thêm vào chỉ là code chết mà đọc tưởng có xử lý gì.
  status: p.status,
  hasCover: Boolean(p.cover),
  imageCount: countProductImages(assets, p.id),
  body: p.body ?? '',
  benefits: p.value?.benefits ?? [],
  features: p.value?.features ?? [],
  claims: (p.value?.claims ?? [])
    .filter(c => c.ok && c.proof)
    .map(c => ({ text: c.t, proof: c.proof })),
  competitors: (p.value?.competitors ?? [])
    .filter(c => c.n)
    .map(c => ({ name: c.n, theirs: c.theirs, ours: c.ours })),
  disclaimers: p.value?.disclaimers ?? [],
  priceText: p.priceText ?? priceFromVariants(p),
  // Chỉ claim vừa được xác nhận (`ok`) vừa có dẫn chứng (`proof`) mới tính —
  // một khẳng định trống bằng chứng không lấp được ô TRU.
  provenClaims: (p.value?.claims ?? []).filter(c => c.ok && c.proof).length,
  variantCount: (p.variants ?? []).length,
  gradient: p.grad,
});

/**
 * Giá từ biến thể khi hồ sơ không có `priceText`. Lấy giá thấp nhất > 0 —
 * biến thể tổng hợp cho sản phẩm không size mang `price: 0`, đưa số 0 vào brief
 * thì AI viết "miễn phí".
 */
const priceFromVariants = (p: Product): string | null => {
  const prices = (p.variants ?? []).map(v => v.price).filter(n => n > 0);
  if (!prices.length) return null;
  return `${Math.min(...prices).toLocaleString('vi-VN')} đ`;
};

/** Ảnh của một sản phẩm = asset kiểu IMG được "home" về đúng sản phẩm đó. */
const countProductImages = (
  assets: ProductAsset[],
  productId: string
): number =>
  assets.filter(
    a =>
      a.kind === 'IMG' && a.home.scope === 'product' && a.home.ref === productId
  ).length;
