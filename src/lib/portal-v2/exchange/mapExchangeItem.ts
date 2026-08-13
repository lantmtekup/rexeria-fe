import type {
  ExchangeListingMeta,
  ExchangeListingView,
  ExchangeObjective,
} from '@/lib/portal-v2/exchange/types';
import type { RxExchangeItem } from '@/services/rexer-v2/types/exchange';

/**
 * `GET /v1/exchange/items` → thẻ trên màn Exchange.
 *
 * Bản trước màn này dựng catalog từ `GET /pages` + `GET /blocks` — hai endpoint
 * CÓ PHẠM VI TENANT (`block_canonical.go` ép `brand_id` cho mọi người không
 * phải platform admin). Nên admin thấy hàng của mọi brand còn brand chỉ thấy
 * của mình, dù Exchange theo spec §15 là chợ chung cho tất cả.
 *
 * Kèm theo đó, meta của thẻ lấy từ `blockMetaPreset` trong `mock.ts` — nó chọn
 * giá, evidence và độ phủ bằng cách BĂM ID. Số hiện trên chợ là số bịa, không
 * phải số ai đó đăng.
 *
 * Endpoint thật trả đúng những gì người bán khai, giống nhau cho mọi tài khoản.
 */

const OBJECTIVES = ['insight', 'lead', 'cta', 'convert'] as const;

/** Nền thẻ. Trang trí thuần tuý — không mang thông tin nào về món hàng. */
const GRADIENTS = [
  'linear-gradient(135deg,#eef2ff,#e0e7ff)',
  'linear-gradient(135deg,#fef3c7,#fde68a)',
  'linear-gradient(135deg,#dcfce7,#bbf7d0)',
  'linear-gradient(135deg,#fae8ff,#f5d0fe)',
  'linear-gradient(135deg,#e0f2fe,#bae6fd)',
  'linear-gradient(135deg,#ffe4e6,#fecdd3)',
] as const;

/**
 * `objective` trên dây là chuỗi tự do và có thể null. KHÔNG lùi về một giá trị
 * mặc định: dán nhãn "Insight" lên một món người bán chưa khai mục tiêu là bịa
 * ra một lời khẳng định. Null đi thẳng tới UI và ở đó nó im lặng.
 */
const narrowObjective = (
  raw: string | null
): Exclude<ExchangeObjective, 'all'> | null =>
  OBJECTIVES.includes(raw as (typeof OBJECTIVES)[number])
    ? (raw as Exclude<ExchangeObjective, 'all'>)
    : null;

/** Dải màu nền thẻ — trang trí thuần tuý, nên suy từ id là đủ và ổn định. */
const gradientFor = (id: string): string => {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length]!;
};

export const mapExchangeItemToListing = (
  item: RxExchangeItem
): ExchangeListingView => {
  const meta: ExchangeListingMeta = {
    price: item.price_cents,
    featured: item.featured,
    ...(item.badge ? { badge: item.badge } : {}),
    objective: narrowObjective(item.objective),
    kind: item.kind === 'block' ? 'block' : 'page',
    grad: gradientFor(item.id),
    ...(item.preview.summary ? { summary: item.preview.summary } : {}),
    // `lift` null = chưa đo được lift ⇒ coi như KHÔNG có evidence, thay vì
    // dựng một object với lift 0. `coverage_brands` là số brand đã dùng, không
    // phải số phiên — đặt vào `sessions` sẽ là dán nhãn sai lên một con số thật.
    ...(item.evidence && item.evidence.lift !== null
      ? {
          evidence: {
            lift: item.evidence.lift,
            sessions: item.evidence.coverage_brands,
            tier: item.evidence.confidence_tier,
          },
        }
      : {}),
    layerRoles: item.roles ?? [],
    // `coverage` KHÔNG có trong danh sách chợ. Bỏ trống chứ không điền 0: 0%
    // là một phép đo, và ở đây chưa ai đo gì cả.
  };

  return {
    id: item.id,
    source: item.kind === 'block' ? 'block' : 'page',
    exchangeItemId: item.id,
    name: item.title || 'Untitled',
    author: item.author || '',
    description: item.preview.tagline || item.preview.summary || '',
    ...(item.preview.thumbnail_url
      ? { thumbnailUrl: item.preview.thumbnail_url }
      : {}),
    // Hợp đồng Exchange cố ý KHÔNG trả source id hay slug (xem doc của
    // RxExchangeItemDetail), nên không có `blockId`/`pageId` để dựng preview
    // sống. Thẻ rơi về ảnh đại diện người bán khai.
    meta,
    proven: Boolean(item.evidence && item.evidence.lift !== null),
  };
};
