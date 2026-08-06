import { enrichPagesWithThumbnailUrls } from '@/lib/pages/resolve-thumbnails';
import { mapPageToExperience } from '@/lib/portal-v2/experiences/mapPage';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';
import { rexerApi } from '@/services/rexer/endpoints';

export type ExperienceLibraryQuery = {
  /** Free-text search — forwarded to the pages API as `q`. */
  q?: string;
  /** Giới hạn theo thương hiệu; bỏ trống = mọi brand đọc được. */
  brandId?: string | null;
};

export type ExperienceLibraryResult = {
  items: ExperienceView[];
  error: string | null;
};

const PAGE_LIMIT = 50;

/**
 * The Experiences library ← `GET /pages?type=landing&status=published`.
 *
 * Same source and same query the admin landing-pages list reads, filtered to
 * published only. Search goes to the server; the chip axes (category, type,
 * objective, evidence) are seeded values and narrow client-side.
 *
 * No `'use client'` — this is called from the route's server component for the
 * first paint and again from the workspace on a debounced search, exactly like
 * `fetchExchangeCatalog`.
 *
 * One page of results. Pagination is deliberately deferred: the module has no
 * pager UI yet, and silently showing the first 50 of a larger set would read as
 * "this is everything". Revisit when a workspace actually exceeds it.
 */
export const fetchExperienceLibrary = async (
  query: ExperienceLibraryQuery = {}
): Promise<ExperienceLibraryResult> => {
  const q = query.q?.trim() || undefined;

  try {
    const res = await rexerApi.pages.listAll({
      type: 'landing',
      status: 'published',
      page: 1,
      limit: PAGE_LIMIT,
      sort: '-updated_at',
      ...(q ? { q } : {}),
      ...(query.brandId ? { brand_id: query.brandId } : {}),
    });

    // BE list page trả `thumbnail_asset_id` chứ không resolve `thumbnail_url`
    // → batch-resolve qua media trước khi map, giống admin landing list.
    const pages = await enrichPagesWithThumbnailUrls(res.items ?? []);

    return { items: pages.map(mapPageToExperience), error: null };
  } catch (err) {
    return {
      items: [],
      error:
        err instanceof Error ? err.message : 'Failed to load landing pages',
    };
  }
};
