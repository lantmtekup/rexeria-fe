import type {
  ExchangeKind,
  ExchangeObjective,
  ExchangePriceFilter,
} from '@/lib/portal-v2/exchange/types';

export const EXCHANGE_CAN_BUY = true;

/**
 * Ba loại hàng, KHÔNG còn tab "Tất cả".
 *
 * Ba loại này khác nhau đủ xa để không ai đứng ở giữa: một trang hoàn chỉnh,
 * một khối lẻ để lắp vào trang, và một định dạng quảng cáo tương tác. Gộp
 * chúng vào một lưới chỉ làm loãng — và trên thực tế tab "Tất cả" đang bị
 * chiếm bởi hơn trăm khối lẻ, đúng thứ ít người vào đây để tìm.
 *
 * Bỏ nó đi thì mất một thứ: ô tìm kiếm vốn tìm XUYÊN cả ba loại, nên gõ một từ
 * chỉ khớp bên tab khác sẽ ra màn hình trống mà không nói vì sao. Đó là việc
 * của dải "còn kết quả ở tab khác" trong `ExchangeWorkspace` — bỏ tab này mà
 * không có dải đó là đổi một lỗi cũ lấy một lỗi mới.
 *
 * `?tab=all` của link cũ không còn hợp lệ ⇒ rơi về mặc định, không vỡ.
 */
export const EXCHANGE_KINDS: {
  id: Exclude<ExchangeKind, 'all'>;
  labelKey: string;
}[] = [
  { id: 'page', labelKey: 'kindPage' },
  { id: 'block', labelKey: 'kindBlock' },
  { id: 'ad', labelKey: 'kindAd' },
];

/**
 * `hintKey` — một câu nói chip này LỌC RA CÁI GÌ, hiện khi rê chuột.
 *
 * Bốn nhãn này là từ vựng nội bộ (`CTA` là một thành phần trên trang, `Insights`
 * là cách ReXeR gọi, không phải cách người làm marketing gọi), nên người lần đầu
 * vào màn không đoán được chip nào ra cái gì. Bảng giải thích đầy đủ nằm ở
 * `ObjectiveFilterHelp` — rê chuột chỉ trả lời được từng cái một, mà cái người
 * mới cần là nhìn cả bốn cạnh nhau.
 */
export const EXCHANGE_OBJECTIVES: {
  id: ExchangeObjective;
  labelKey: string;
  hintKey: string;
}[] = [
  { id: 'all', labelKey: 'objAny', hintKey: 'objAnyHint' },
  { id: 'insight', labelKey: 'objInsight', hintKey: 'objInsightHint' },
  { id: 'lead', labelKey: 'objLead', hintKey: 'objLeadHint' },
  { id: 'cta', labelKey: 'objCta', hintKey: 'objCtaHint' },
  { id: 'convert', labelKey: 'objConvert', hintKey: 'objConvertHint' },
];

export const EXCHANGE_PRICES: {
  id: ExchangePriceFilter;
  labelKey: string;
}[] = [
  { id: 'all', labelKey: 'priceAny' },
  { id: 'free', labelKey: 'priceFree' },
  { id: 'paid', labelKey: 'pricePaid' },
];

export const EXCHANGE_DEFAULT_FILTERS = {
  q: '',
  /**
   * Trang hoàn chỉnh là thứ người ta mở chợ ra để tìm. Ít hàng hơn khối lẻ
   * nhiều, nên lưới trông thưa hơn — nhưng thưa mà đúng thứ cần tìm.
   */
  kind: 'page' as ExchangeKind,
  obj: 'all' as ExchangeObjective,
  price: 'all' as ExchangePriceFilter,
};

export const EXCHANGE_GRADIENTS = [
  'linear-gradient(135deg,#6C4CF1,#9B7DF8)',
  'linear-gradient(135deg,#3862FF,#6B8AFF)',
  'linear-gradient(135deg,#0EA5A4,#34D399)',
  'linear-gradient(135deg,#F97316,#FBBF24)',
  'linear-gradient(135deg,#EC4899,#A855F7)',
  'linear-gradient(135deg,#64748B,#94A3B8)',
] as const;
