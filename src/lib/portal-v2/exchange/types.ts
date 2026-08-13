export type ExchangeKind = 'all' | 'page' | 'block';

export type ExchangeObjective = 'all' | 'insight' | 'lead' | 'cta' | 'convert';

export type ExchangePriceFilter = 'all' | 'free' | 'paid';

/** Catalog sources: published landing pages + published blocks. */
export type ExchangeSource = 'page' | 'block';

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

export type ExchangeActionState = 'added' | 'owned' | 'buy' | 'locked';

export type ExchangeSessionState = {
  owned: Record<string, boolean>;
  added: Record<string, string>;
};
