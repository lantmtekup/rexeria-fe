import type { AdFormat } from '@/lib/portal-v2/exchange/adFormats';
import type {
  ExchangeListingMeta,
  ExchangeListingView,
} from '@/lib/portal-v2/exchange/types';

/**
 * Định dạng quảng cáo tương tác → thẻ trên màn Exchange.
 *
 * Ba trường mà hai nguồn kia có mà nguồn này KHÔNG có, và cố ý để trống:
 *
 *   - `objective`: chưa ai khai mục tiêu cho một định dạng. `null` chứ không
 *     lùi về một nhãn mặc định — dán nhãn sẵn là bịa ra một lời khẳng định.
 *   - `evidence` / `coverage`: chưa đo. Không có chiến dịch nào chạy trên một
 *     định dạng mẫu, nên `proven: false` và bỏ trống hai trường kia.
 *   - `price`: `0` ở đây là giá THẬT — dùng được, không phải mua.
 */

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

export const mapAdFormatToListing = (f: AdFormat): ExchangeListingView => {
  const meta: ExchangeListingMeta = {
    price: 0,
    featured: false,
    objective: null,
    kind: 'ad',
    grad: gradientFor(f.id),
    summary: f.desc,
  };

  return {
    // Tiền tố `ad-` giữ id tách bạch với `tpl-*` và id block, vì cả ba nguồn
    // đổ chung vào một mảng catalog.
    id: `ad-${f.id}`,
    source: 'ad',
    adFormatId: f.id,
    name: f.name,
    author: f.author,
    description: f.desc,
    thumbnailUrl: f.thumbnailUrl,
    category: f.group,
    meta,
    proven: false,
  };
};
