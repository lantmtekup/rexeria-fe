import { AD_FORMATS, type AdFormat } from '@/lib/portal-v2/exchange/adFormats';
import { mapAdFormatToListing } from '@/lib/portal-v2/exchange/mapAdFormat';
import { mapBlockToListing } from '@/lib/portal-v2/exchange/mapBlock';
import { mapExchangeItemToListing } from '@/lib/portal-v2/exchange/mapExchangeItem';
import { mapTemplateToListing } from '@/lib/portal-v2/exchange/mapTemplate';
import {
  collectPublishedLandings,
  fillMissingPreviewSlugs,
  publishedPreviewSlugByTemplate,
} from '@/lib/portal-v2/exchange/previewSlug';
import type { ExchangeListingView } from '@/lib/portal-v2/exchange/types';
import { enrichBlocksWithThumbnailUrls } from '@/lib/pages/resolve-thumbnails';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

export type ExchangeCatalogQuery = {
  /** Free-text search — forwarded to all three sources as `q`. */
  q?: string;
};

export type ExchangeCatalogOptions = {
  /**
   * Có phiên đăng nhập hay không — quyết định gọi bộ endpoint nào.
   *
   * `true`  → đường có phiên (`/templates`, `/blocks`, `/exchange/items`).
   *           Brand vẫn thấy template/block RIÊNG của mình trong chợ, đúng như
   *           trước khi màn này mở cho khách.
   * `false` → đường công khai (`/public/*`). BE ghim phạm vi về kho hệ thống.
   *
   * Đoán sai không mở thêm quyền: cookie hỏng thì đường có phiên trả 401 và
   * `withPublicFallback` tự hạ xuống đường công khai.
   */
  signedIn?: boolean;
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
 * trống trơn — mất luôn 75 trải nghiệm gốc và 109 block mà ai cũng có quyền xem.
 *
 * Bản này lấy cả hai, từ những endpoint KHÔNG phân biệt người gọi:
 *
 *   1. `GET /v1/exchange/items` — hàng ai đó đăng bán. Không lọc brand ở bất
 *      kỳ tầng nào (handler `priv`, usecase, filter, repository).
 *   2. `GET /v1/templates`      — `brand_id IS NULL OR brand_id = ?`, nên 75
 *      trải nghiệm gốc hệ thống hiện với mọi tài khoản.
 *   3. `GET /v1/blocks?scope=system` — CHỈ kho nền tảng (109 block scope
 *      `'system'`), không kèm `brand_id = ?`. Exchange là quầy của Rexer, không
 *      phải thư viện riêng của brand: mỗi brand tự "mua/copy" một block hệ
 *      thống về thư viện riêng (`Block.clone` → brand-private), và bản clone
 *      đó CHỈ brand đó thấy — không brand nào khác thấy, và cũng không được
 *      quay lại hiện trong Exchange. Trước đây gọi thiếu `scope`, repo tự
 *      nới thành `brand_id = ? OR scope = 'system'` (`block.go` filter
 *      `EnforceBrandOrSystem`) nên bản clone của chính người bấm "Thêm" lọt
 *      ngược vào catalog của họ ở lần tải sau — nhìn như bị nhân đôi.
 *
 * `GET /pages` CỐ Ý không nằm trong CATALOG: nó phân biệt admin/brand, nên
 * không được biến thành thẻ. Vẫn gọi song song chỉ để gắn `slug` lên template
 * đã có — iframe preview cần `/p/{slug}`, mà `GET /templates` hiện không trả
 * `preview_slug`. Hỏng lượt này thì catalog vẫn nguyên, chỉ mất preview.
 *
 * Một nguồn hỏng thì các nguồn còn lại vẫn hiện, và lỗi đi ra `softError`.
 */
/**
 * Gọi đường có phiên, rơi về đường công khai khi BE nói "không có phiên".
 *
 * Cần thiết vì `/portal-v2/exchange` nay mở cho khách: một cookie CŨ (hết hạn,
 * hoặc còn lại sau khi BE xoay khoá) không còn bị middleware chặn ở cửa nữa —
 * nó đi thẳng vào trang rồi mới 401 ở tầng dữ liệu. Không có nhánh này thì màn
 * hình trống trơn kèm lỗi, trong khi đúng ra phải hiện chợ như một người khách.
 *
 * Chỉ hạ cấp trên 401/403. Lỗi khác (500, mạng) ném tiếp để `Promise.allSettled`
 * ghi vào `softError` — im lặng nuốt chúng sẽ giấu mất sự cố thật.
 */
const withPublicFallback = async <T>(
  authed: () => Promise<T>,
  publicCall: () => Promise<T>
): Promise<T> => {
  try {
    return await authed();
  } catch (err) {
    if (
      err instanceof RxApiError &&
      (err.status === 401 || err.status === 403)
    ) {
      return publicCall();
    }
    throw err;
  }
};

export const fetchExchangeCatalog = async (
  query: ExchangeCatalogQuery = {},
  options: ExchangeCatalogOptions = {}
): Promise<ExchangeCatalogResult> => {
  const q = query.q?.trim() || undefined;
  const signedIn = options.signedIn ?? true;

  const listExchange = () =>
    rexerV2Api.exchange.list({
      page: 1,
      page_size: LIMIT,
      ...(q ? { q } : {}),
    });
  const listExchangePublic = () =>
    rexerV2Api.exchange.publicList({
      page: 1,
      page_size: LIMIT,
      ...(q ? { q } : {}),
    });

  // Chỉ `active` — cùng ý với `published` của block: chợ chỉ bày thứ đã
  // xong. Kho có 62 draft + 13 active; draft là bản đang dựng dở, bày ra
  // cho brand khác là mời người ta dùng một trang chưa hoàn thiện.
  // Đường `/public/templates` ghim sẵn `active` ở BE nên không gửi `status`.
  const listTemplates = () =>
    rexerApi.templates.list({
      status: 'active',
      page: 1,
      limit: LIMIT,
      sort: 'updated_at',
      order: 'desc',
      ...(q ? { q } : {}),
    });
  const listTemplatesPublic = () =>
    rexerApi.publicTemplates.list({
      page: 1,
      limit: LIMIT,
      sort: 'updated_at',
      order: 'desc',
      ...(q ? { q } : {}),
    });

  const listBlocks = () =>
    rexerApi.blocks.list({
      scope: 'system',
      status: 'published',
      page: 1,
      limit: LIMIT,
      sort_by: 'updated_at',
      sort_order: 'desc',
      ...(q ? { q } : {}),
    });
  const listBlocksPublic = () =>
    rexerApi.publicBlocks.list({
      page: 1,
      limit: LIMIT,
      sort_by: 'updated_at',
      sort_order: 'desc',
      ...(q ? { q } : {}),
    });

  const settled = await Promise.allSettled([
    signedIn
      ? withPublicFallback(listExchange, listExchangePublic)
      : listExchangePublic(),
    signedIn
      ? withPublicFallback(listTemplates, listTemplatesPublic)
      : listTemplatesPublic(),
    signedIn
      ? withPublicFallback(listBlocks, listBlocksPublic)
      : listBlocksPublic(),
    // `GET /pages` KHÔNG có bản công khai và cũng không nên có — nó phân biệt
    // admin/brand. Khách không có lượt này; template nào thiếu slug sẽ được
    // `fillMissingPreviewSlugs` dò qua `/public/pages/{slug}`.
    signedIn
      ? collectPublishedLandings()
      : Promise.resolve(
          [] as Awaited<ReturnType<typeof collectPublishedLandings>>
        ),
  ]);

  const errors: string[] = [];
  const catalog: ExchangeListingView[] = [];

  const [listed, templates, blocks, publishedPages] = settled;

  if (listed.status === 'fulfilled') {
    catalog.push(...(listed.value.items ?? []).map(mapExchangeItemToListing));
  } else {
    errors.push(reasonOf(listed.reason, 'Failed to load marketplace'));
  }

  if (templates.status === 'fulfilled') {
    const items = templates.value.items ?? [];
    const slugs = publishedPreviewSlugByTemplate(
      items,
      publishedPages.status === 'fulfilled' ? publishedPages.value : []
    );
    await fillMissingPreviewSlugs(items, slugs);
    catalog.push(
      ...items.map(item => mapTemplateToListing(item, slugs.get(item.id)))
    );
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
