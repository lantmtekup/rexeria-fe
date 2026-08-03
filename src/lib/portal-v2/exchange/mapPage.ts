import { pageMetaPreset } from '@/lib/portal-v2/exchange/mock';
import type {
  ExchangeListingMeta,
  ExchangeListingView,
  ExchangeObjective,
} from '@/lib/portal-v2/exchange/types';
import type { Page } from '@/services/rexer/types';

/**
 * `thumbnail_url` chỉ có sau khi resolve `thumbnail_asset_id` (xem
 * `enrichPagesWithThumbnailUrls`); fallback về featured image trong landing
 * metadata trước khi để card vẽ cover generate. Giống admin landing list.
 */
const pageThumbnailUrl = (page: Page): string | undefined => {
  if (page.thumbnail_url) return page.thumbnail_url;
  const meta = page.type_metadata as { featured_image?: string } | undefined;
  return meta?.featured_image || undefined;
};

export const mapLandingPageToListing = (page: Page): ExchangeListingView => {
  const preset = pageMetaPreset(page.id);
  const meta: ExchangeListingMeta = {
    ...preset,
    kind: 'page',
    summary: preset.summary ?? page.description,
  };

  return {
    id: `x-p-${page.id}`,
    source: 'page',
    pageId: page.id,
    slug: page.slug,
    templateVersionId: page.template_version_id,
    name: page.name || 'Untitled',
    author: 'ReXeR',
    description: page.description || '',
    thumbnailUrl: pageThumbnailUrl(page),
    category: page.type,
    meta,
    proven: Boolean(meta.evidence),
  };
};

export const objectiveLabelKey = (
  objective: Exclude<ExchangeObjective, 'all'>
): string => {
  const map: Record<Exclude<ExchangeObjective, 'all'>, string> = {
    insight: 'objInsight',
    lead: 'objLead',
    cta: 'objCta',
    convert: 'objConvert',
  };
  return map[objective];
};
