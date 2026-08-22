/**
 * `ad` là ad creative — template có `target_page_type === 'ad'`. Nó là một
 * KIND riêng chứ không phải một SOURCE riêng: vẫn nạp từ `GET /v1/templates`
 * cùng lượt với template landing, vẫn xem trước qua `/p/{preview_slug}`.
 * Tách ra để nó không lẫn vào tab Experiences như trước.
 */
export type ExchangeKind = 'all' | 'page' | 'ad' | 'block';

export type ExchangeObjective = 'all' | 'insight' | 'lead' | 'cta' | 'convert';

export type ExchangePriceFilter = 'all' | 'free' | 'paid';

/**
 * Catalog sources: published landing pages + published blocks + định dạng
 * quảng cáo tương tác.
 *
 * `ad` là nguồn TĨNH, khác hẳn hai cái kia: không gọi mạng, không brand,
 * không status — xem `adFormats.ts`. Nó xem trước bằng route công khai
 * `/rexer/ads/{id}` thay vì `/p/{slug}` hay `/embed/block/{id}`.
 */
export type ExchangeSource = 'page' | 'block' | 'ad';

export type ExchangeEvidence = {
  lift: number;
  sessions: number;
  tier: string;
};

export type ExchangeCoverage = {
  pct: number;
  blocks: number;
  objCovered: boolean;
};

export type ExchangeListingMeta = {
  price: number;
  featured: boolean;
  badge?: string;
  /**
   * `null` = người bán chưa khai mục tiêu. KHÔNG lùi về một giá trị mặc định:
   * dán nhãn sẵn lên món chưa khai là bịa ra một lời khẳng định.
   */
  objective: Exclude<ExchangeObjective, 'all'> | null;
  kind: Exclude<ExchangeKind, 'all'>;
  grad: string;
  summary?: string;
  evidence?: ExchangeEvidence;
  /** Vắng = chưa đo. Danh sách chợ không trả độ phủ; 0% là một phép đo. */
  coverage?: ExchangeCoverage;
};

export type ExchangeListingView = {
  id: string;
  source: ExchangeSource;
  /** Landing page id when source === 'page'. */
  pageId?: string;
  /** Public `/p/{slug}` when source === 'page'. */
  slug?: string;
  /** Seed version when installing a landing listing into a workspace. */
  templateVersionId?: string;
  /**
   * Id của TEMPLATE nguồn. `POST /workspaces/{ws}/pages` nhận `template_id`,
   * KHÔNG nhận `template_version_id` (`models/page.go:118`) — gửi nhầm trường
   * thì BE thấy cả template_id lẫn external_url đều rỗng và trả
   * "exactly one of template_id or external_url is required".
   */
  templateId?: string;
  /**
   * Có giá trị ⇒ đây là món trên CHỢ, cài bằng `POST /exchange/items/{id}/add`
   * chứ không phải `pages.create`. Hợp đồng Exchange cố ý không trả source id
   * (doc của RxExchangeItemDetail), nên không có đường nào khác.
   */
  exchangeItemId?: string;
  blockId?: string;
  /** Có giá trị ⇔ `source === 'ad'`. Id định dạng trong `AD_FORMATS`. */
  adFormatId?: string;
  name: string;
  author: string;
  description: string;
  thumbnailUrl?: string;
  /** True when block settings can render a live mini preview on the client. */
  canLivePreview?: boolean;
  category?: string;
  meta: ExchangeListingMeta;
  proven: boolean;
};

export type ExchangeFilters = {
  q: string;
  kind: ExchangeKind;
  obj: ExchangeObjective;
  price: ExchangePriceFilter;
};

/**
 * `unavailable` — món xem được nhưng CHƯA có đường mang về. Đang chỉ dùng cho
 * `kind: 'ad'`: `GET /v1/experiences` chỉ gộp template, block, và page đã gắn
 * `campaign_item_id`, nên một page dựng từ ad template không bao giờ hiện
 * trong thư viện Experiences. Bày nút Thêm ở đó là hứa một chỗ đến không có.
 */
export type ExchangeActionState =
  | 'added'
  | 'owned'
  | 'buy'
  | 'locked'
  | 'unavailable';

export type ExchangeSessionState = {
  owned: Record<string, boolean>;
  added: Record<string, string>;
};
