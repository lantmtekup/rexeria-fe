import { pageMetaPreset } from '@/lib/portal-v2/exchange/mock';
import type {
  ExchangeListingMeta,
  ExchangeListingView,
  ExchangeObjective,
} from '@/lib/portal-v2/exchange/types';
import type { Page } from '@/services/rexer/types';

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
    thumbnailUrl: page.thumbnail_url,
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
