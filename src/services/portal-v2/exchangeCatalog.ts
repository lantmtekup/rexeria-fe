import { mapExchangeItemToListing } from '@/lib/portal-v2/exchange/mapExchangeItem';
import type { ExchangeListingView } from '@/lib/portal-v2/exchange/types';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

export type ExchangeCatalogQuery = {
  /** Free-text search — forwarded to the exchange API as `q`. */
  q?: string;
};

export type ExchangeCatalogResult = {
  catalog: ExchangeListingView[];
  /** Hard failure — nothing loaded. */
  error: string | null;
  /** Reserved: a partial failure the screen can show without going blank. */
  softError: string | null;
};

const PAGE_SIZE = 200;

/**
 * Catalog của chợ ← `GET /v1/exchange/items`.
 *
 * Bản trước KHÔNG gọi API Exchange. Nó ghép `GET /pages?type=landing` với
 * `GET /blocks`, hai endpoint có phạm vi tenant: `block_canonical.go:361` ép
 * `brand_id` cho mọi người không phải platform admin. Hệ quả là admin thấy
 * hàng của mọi brand còn brand chỉ thấy của chính mình — trong khi Exchange
 * theo spec §15 là chợ chung, và BE không lọc brand ở BẤT KỲ tầng nào
 * (handler `priv`, usecase, filter, repository đều không).
 *
 * Kèm theo đó, meta của thẻ lấy từ `blockMetaPreset` trong `mock.ts`, chọn
 * giá / evidence / độ phủ bằng cách băm id. Đổi sang endpoint thật là thay số
 * bịa bằng số người bán khai.
 *
 * Bốn bộ lọc đẩy xuống server thay vì lọc ở client: chợ là dữ liệu chung, phân
 * trang phải do server quyết.
 */
export const fetchExchangeCatalog = async (
  query: ExchangeCatalogQuery = {}
): Promise<ExchangeCatalogResult> => {
  const q = query.q?.trim() || undefined;

  try {
    const res = await rexerV2Api.exchange.list({
      page: 1,
      page_size: PAGE_SIZE,
      ...(q ? { q } : {}),
    });
    return {
      catalog: (res.items ?? []).map(mapExchangeItemToListing),
      error: null,
      softError: null,
    };
  } catch (err) {
    return {
      catalog: [],
      error: err instanceof Error ? err.message : 'Failed to load catalog',
      softError: null,
    };
  }
};
