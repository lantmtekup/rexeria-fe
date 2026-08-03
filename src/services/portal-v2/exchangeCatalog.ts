import { enrichPagesWithThumbnailUrls } from '@/lib/pages/resolve-thumbnails';
import { mapBlockToListing } from '@/lib/portal-v2/exchange/mapBlock';
import { mapLandingPageToListing } from '@/lib/portal-v2/exchange/mapPage';
import type { ExchangeListingView } from '@/lib/portal-v2/exchange/types';
import { rexerApi } from '@/services/rexer/endpoints';

export type ExchangeCatalogQuery = {
  /** Free-text search — forwarded to both list APIs as `q`. */
  q?: string;
};

export type ExchangeCatalogResult = {
  catalog: ExchangeListingView[];
  /** Hard failure — no items from either source. */
  error: string | null;
  /** One source failed but the other returned items. */
  softError: string | null;
};

const PAGE_LIMIT = 500;

/**
 * Dual catalog, one page each (APIs are paginated):
 * - Experiences ← GET /pages?type=landing&status=published&limit=50&q=
 * - Blocks      ← GET /blocks?status=published&limit=50&q=
 *
 * Kind / objective / price are filtered client-side (marketplace meta / tabs).
 */
export const fetchExchangeCatalog = async (
  query: ExchangeCatalogQuery = {}
): Promise<ExchangeCatalogResult> => {
  const q = query.q?.trim() || undefined;

  const settled = await Promise.allSettled([
    rexerApi.pages.listAll({
      type: 'landing',
      status: 'published',
      page: 1,
      limit: PAGE_LIMIT,
      sort: 'updated_at',
      ...(q ? { q } : {}),
    }),
    rexerApi.blocks.list({
      status: 'published',
      page: 1,
      limit: PAGE_LIMIT,
      sort_by: 'updated_at',
      sort_order: 'desc',
      ...(q ? { q } : {}),
    }),
  ]);

  const errors: string[] = [];
  const catalog: ExchangeListingView[] = [];

  const pagesResult = settled[0];
  if (pagesResult.status === 'fulfilled') {
    // BE list page chỉ có `thumbnail_asset_id` → resolve public_url trước khi
    // map, nếu không card sẽ luôn rơi về cover generate.
    const pages = await enrichPagesWithThumbnailUrls(
      pagesResult.value.items ?? []
    );
    catalog.push(...pages.map(mapLandingPageToListing));
  } else {
    const reason = pagesResult.reason;
    errors.push(
      reason instanceof Error ? reason.message : 'Failed to load landing pages'
    );
  }

  const blocksResult = settled[1];
  if (blocksResult.status === 'fulfilled') {
    catalog.push(...(blocksResult.value.items ?? []).map(mapBlockToListing));
  } else {
    const reason = blocksResult.reason;
    errors.push(
      reason instanceof Error ? reason.message : 'Failed to load blocks'
    );
  }

  const joined = errors.length ? errors.join(' · ') : null;

  return {
    catalog,
    error: catalog.length === 0 ? joined : null,
    softError: catalog.length > 0 ? joined : null,
  };
};
