import {
  enrichBlocksWithThumbnailUrls,
  enrichPagesWithThumbnailUrls,
} from '@/lib/pages/resolve-thumbnails';
import { mapBlockToExperience } from '@/lib/portal-v2/experiences/mapBlock';
import { mapPageToExperience } from '@/lib/portal-v2/experiences/mapPage';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';
import { rexerApi } from '@/services/rexer/endpoints';

export type ExperienceLibraryQuery = {
  /** Free-text search — forwarded to both list APIs as `q`. */
  q?: string;
};

export type ExperienceLibraryResult = {
  /** Pages and blocks in one array; `ExperienceView.kind` tells them apart. */
  items: ExperienceView[];
  /** Hard failure — neither source returned anything. */
  error: string | null;
  /** One source failed while the other returned rows. */
  softError: string | null;
};

/** Same ceiling `fetchExchangeCatalog` uses — the two read the same two APIs. */
const PAGE_LIMIT = 500;

/**
 * The Experiences library — TWO sources, kept apart by `kind`:
 * - `GET /pages?type=landing&status=published` (what `/admin/landing-pages` reads)
 * - `GET /blocks?status=published` (what `/admin/blocks` reads)
 *
 * Published-only on both sides: Experiences is where a marketer picks something
 * to USE, not where blocks get reviewed — that lifecycle lives at
 * `/admin/blocks`.
 *
 * `allSettled` rather than `all` because the two halves are independent: a
 * blocks outage must not blank the pages tab. That is the same soft/hard error
 * split `fetchExchangeCatalog` uses, and the workspace renders `softError` as a
 * strip above a working grid.
 *
 * Search goes to both servers; the chip axes narrow client-side (page axes are
 * seeded, block axes come off the record).
 *
 * No `'use client'` — called from the route's server component for the first
 * paint and again from the workspace on a debounced search.
 *
 * One page of results per source. Pagination is deliberately deferred: the
 * module has no pager UI, and silently showing the first N of a larger set
 * would read as "this is everything". Revisit when a workspace exceeds it.
 */
export const fetchExperienceLibrary = async (
  query: ExperienceLibraryQuery = {}
): Promise<ExperienceLibraryResult> => {
  const q = query.q?.trim() || undefined;

  const settled = await Promise.allSettled([
    rexerApi.pages.listAll({
      type: 'landing',
      status: 'published',
      page: 1,
      limit: PAGE_LIMIT,
      sort: '-updated_at',
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
  const items: ExperienceView[] = [];

  const [pagesResult, blocksResult] = settled;

  if (pagesResult.status === 'fulfilled') {
    // BE list page trả `thumbnail_asset_id` chứ không resolve `thumbnail_url`
    // → batch-resolve qua media trước khi map, giống admin landing list.
    const pages = await enrichPagesWithThumbnailUrls(
      pagesResult.value.items ?? []
    );
    items.push(...pages.map(mapPageToExperience));
  } else {
    const reason = pagesResult.reason;
    errors.push(
      reason instanceof Error ? reason.message : 'Failed to load landing pages'
    );
  }

  if (blocksResult.status === 'fulfilled') {
    const blocks = await enrichBlocksWithThumbnailUrls(
      blocksResult.value.items ?? []
    );
    items.push(...blocks.map(mapBlockToExperience));
  } else {
    const reason = blocksResult.reason;
    errors.push(
      reason instanceof Error ? reason.message : 'Failed to load blocks'
    );
  }

  const joined = errors.length ? errors.join(' · ') : null;

  return {
    items,
    error: items.length === 0 ? joined : null,
    softError: items.length > 0 ? joined : null,
  };
};
