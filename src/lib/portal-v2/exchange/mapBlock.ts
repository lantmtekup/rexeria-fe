import { canLivePreview } from '@/lib/portal-v2/exchange/parseEditorBlock';
import type {
  ExchangeListingMeta,
  ExchangeListingView,
  ExchangeObjective,
} from '@/lib/portal-v2/exchange/types';
import type { Block } from '@/services/rexer/types';

/**
 * Block hệ thống → thẻ trên màn Exchange.
 *
 * Bản trước lấy meta từ `blockMetaPreset` trong `mock.ts`, hàm đó chọn giá,
 * evidence và độ phủ bằng cách BĂM ID của block. Nên mọi thẻ đều khoe
 * "100% instrumented · EARLY +6% vs control" — những con số không đo từ đâu
 * cả, chỉ là hàm băm ra số đó. Một thẻ khác id sẽ khoe con số khác, vẫn bịa.
 *
 * Nay chỉ mang những gì `GET /v1/blocks` thật sự trả. Ba trường không có
 * nguồn thì để trống, và UI im lặng ở đó thay vì in một con số.
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

const narrowObjective = (
  raw: string | null | undefined
): Exclude<ExchangeObjective, 'all'> | null =>
  OBJECTIVES.includes(raw as (typeof OBJECTIVES)[number])
    ? (raw as Exclude<ExchangeObjective, 'all'>)
    : null;

export const mapBlockToListing = (block: Block): ExchangeListingView => {
  const meta: ExchangeListingMeta = {
    // Kho nền tảng — dùng được, không phải mua. `0` ở đây là giá THẬT.
    price: 0,
    featured: false,
    objective: narrowObjective(
      (block as Block & { objective?: string }).objective ?? null
    ),
    kind: 'block',
    grad: gradientFor(block.id),
    ...(block.description ? { summary: block.description } : {}),
    layerRoles: [],
    // evidence / coverage bỏ trống: một block lẻ không có grain khái niệm để
    // đo lift (xem chính BE: `itemFor` trả Evidence nil cho nguồn block).
  };

  return {
    id: `x-b-${block.id}`,
    source: 'block',
    blockId: block.id,
    name: block.name || 'Untitled',
    author: 'ReXeR',
    description: block.description || '',
    ...(block.thumbnail_url ? { thumbnailUrl: block.thumbnail_url } : {}),
    canLivePreview: canLivePreview(block.settings),
    ...(block.type_code ? { category: block.type_code } : {}),
    meta,
    proven: false,
  };
};
