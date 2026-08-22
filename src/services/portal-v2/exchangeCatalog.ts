import { AD_FORMATS, type AdFormat } from '@/lib/portal-v2/exchange/adFormats';
import { mapAdFormatToListing } from '@/lib/portal-v2/exchange/mapAdFormat';
import { mapBlockToListing } from '@/lib/portal-v2/exchange/mapBlock';
import { mapExchangeItemToListing } from '@/lib/portal-v2/exchange/mapExchangeItem';
import { mapTemplateToListing } from '@/lib/portal-v2/exchange/mapTemplate';
import type { ExchangeListingView } from '@/lib/portal-v2/exchange/types';
import { enrichBlocksWithThumbnailUrls } from '@/lib/pages/resolve-thumbnails';
import { rexerApi } from '@/services/rexer/endpoints';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

export type ExchangeCatalogQuery = {
  /** Free-text search — forwarded to all three sources as `q`. */
  q?: string;
};

export type ExchangeCatalogResult = {
  catalog: ExchangeListingView[];
  /** Hard failure — no source returned anything. */
  error: string | null;
  /** Some sources failed but the screen still has items to show. */
  softError: string | null;
};

const LIMIT = 200;

/**
 * Catalog màn Exchange = CHỢ + KHO NỀN TẢNG.
 *
 * Bản đầu ghép `GET /pages?type=landing` với `GET /blocks`. `GET /pages` ép
 * brand cứng cho mọi người không phải platform admin (`tenant.go:173`), nên
 * admin thấy hàng của mọi brand còn brand chỉ thấy của mình — đúng chênh lệch
 * đã báo.
 *
 * Bản thứ hai chuyển hẳn sang `GET /v1/exchange/items`. Đúng nguồn, giống nhau
 * cho mọi tài khoản, nhưng `exchange_listings` chưa có dòng nào nên màn hình
 * trống trơn — mất luôn 75 template và 109 block mà ai cũng có quyền xem.
 *
 * Bản này lấy cả hai, từ những endpoint KHÔNG phân biệt người gọi:
 *
 *   1. `GET /v1/exchange/items` — hàng ai đó đăng bán. Không lọc brand ở bất
 *      kỳ tầng nào (handler `priv`, usecase, filter, repository).
 *   2. `GET /v1/templates`      — `brand_id IS NULL OR brand_id = ?`, nên 75
 *      template hệ thống hiện với mọi tài khoản.
 *   3. `GET /v1/blocks`         — `brand_id = ? OR scope = 'system'`; sau khi
 *      kho RexerStudio chuyển về `scope='system'`, cả 109 block hiện với mọi
 *      tài khoản.
 *
 * `GET /pages` CỐ Ý không nằm trong danh sách: nó là endpoint duy nhất trong
 * ba nguồn cũ không thể trả cùng một kết quả cho hai loại tài khoản.
 *
 * Một nguồn hỏng thì các nguồn còn lại vẫn hiện, và lỗi đi ra `softError`.
 */
export const fetchExchangeCatalog = async (
  query: ExchangeCatalogQuery = {}
): Promise<ExchangeCatalogResult> => {
  const q = query.q?.trim() || undefined;

  const settled = await Promise.allSettled([
    rexerV2Api.exchange.list({
      page: 1,
      page_size: LIMIT,
      ...(q ? { q } : {}),
    }),
    // Chỉ `active` — cùng ý với `published` của block: chợ chỉ bày thứ đã
    // xong. Kho có 62 draft + 13 active; draft là bản đang dựng dở, bày ra
    // cho brand khác là mời người ta dùng một trang chưa hoàn thiện.
    rexerApi.templates.list({
      status: 'active',
      page: 1,
      limit: LIMIT,
      sort: 'updated_at',
      order: 'desc',
      ...(q ? { q } : {}),
    }),
    rexerApi.blocks.list({
      status: 'published',
      page: 1,
      limit: LIMIT,
      sort_by: 'updated_at',
      sort_order: 'desc',
      ...(q ? { q } : {}),
    }),
  ]);

  const errors: string[] = [];
  const catalog: ExchangeListingView[] = [];

  const [listed, templates, blocks] = settled;

  if (listed.status === 'fulfilled') {
    catalog.push(...(listed.value.items ?? []).map(mapExchangeItemToListing));
  } else {
    errors.push(reasonOf(listed.reason, 'Failed to load marketplace'));
  }

  if (templates.status === 'fulfilled') {
    catalog.push(...(templates.value.items ?? []).map(mapTemplateToListing));
  } else {
    errors.push(reasonOf(templates.reason, 'Failed to load templates'));
  }

  if (blocks.status === 'fulfilled') {
    // List block chỉ trả `thumbnail_asset_id` → resolve public_url trước khi
    // map, nếu không thẻ luôn rơi về cover generate.
    const withThumbs = await enrichBlocksWithThumbnailUrls(
      blocks.value.items ?? []
    );
    catalog.push(...withThumbs.map(mapBlockToListing));
  } else {
    errors.push(reasonOf(blocks.reason, 'Failed to load blocks'));
  }

  // Nguồn thứ tư: định dạng quảng cáo tương tác. Tĩnh, nằm sẵn trong bundle —
  // không gọi mạng nên không nằm trong `Promise.allSettled` ở trên và không
  // bao giờ đóng góp vào `errors`. Cũng vì tĩnh nên `q` phải tự lọc ở đây:
  // ba nguồn kia đẩy `q` xuống server, nguồn này không có server để đẩy.
  catalog.push(
    ...AD_FORMATS.filter(f => matchesQuery(f, q)).map(mapAdFormatToListing)
  );

  const joined = errors.length ? errors.join(' · ') : null;

  return {
    catalog,
    error: catalog.length === 0 ? joined : null,
    softError: catalog.length > 0 ? joined : null,
  };
};

const reasonOf = (reason: unknown, fallback: string): string =>
  reason instanceof Error ? reason.message : fallback;

/** Tìm trên tên + mô tả + nhóm, không phân biệt hoa thường. */
const matchesQuery = (f: AdFormat, q?: string): boolean => {
  if (!q) return true;
  const needle = q.toLowerCase();
  return `${f.name} ${f.desc} ${f.group} ${f.author}`
    .toLowerCase()
    .includes(needle);
};
