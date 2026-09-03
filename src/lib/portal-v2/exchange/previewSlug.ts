import type { ExchangeListingView } from '@/lib/portal-v2/exchange/types';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Page, Template } from '@/services/rexer/types';

/**
 * BE Template swagger không có `preview_slug` (chỉ `promoted_from_page_id`).
 * Template cũ thường vẫn có `preview_slug` trên dây vì đã promote từ page.
 * Template mới như Westly thì không: page live là `/p/the-westly-v1` trong khi
 * `code` là `the-westly`, và `current_version_id` có thể đã vượt bản đã
 * publish — join đúng HEAD version sẽ miss.
 *
 * Không nhét `GET /pages` vào catalog (phân biệt admin/brand). Chỉ mượn slug.
 */

type PageSlugSource = Pick<Page, 'slug' | 'name' | 'status' | 'updated_at'> & {
  template_version_id?: string;
  template_id?: string;
};

const resolvedSlugCache = new Map<string, string>();

const slugify = (raw: string): string =>
  raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const slugFromPreviewUrl = (url?: string): string | null => {
  if (!url) return null;
  const match = url.match(/\/p\/([^/?#]+)/);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

/** `the-westly` → `the-westly`, `the-westly-v1` (page slug thật). */
export const previewSlugCandidates = (
  code?: string,
  name?: string
): string[] => {
  const out: string[] = [];
  const push = (value?: string) => {
    if (!value) return;
    const slug = slugify(value);
    if (slug && !out.includes(slug)) out.push(slug);
  };
  push(code);
  push(name);
  const base = code ? slugify(code) : '';
  if (base) {
    for (const suffix of ['v1', 'v2']) {
      const next = `${base}-${suffix}`;
      if (!out.includes(next)) out.push(next);
    }
  }
  return out;
};

const slugBelongsToCode = (pageSlug: string, code?: string): boolean => {
  if (!code) return false;
  const base = slugify(code);
  if (!base) return false;
  const slug = pageSlug.toLowerCase();
  return slug === base || slug.startsWith(`${base}-`);
};

const sortPublishedFirst = (pages: PageSlugSource[]): PageSlugSource[] =>
  [...pages]
    .filter(
      page => page.slug && page.status !== 'draft' && page.status !== 'archived'
    )
    .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));

export const collectPublishedLandings = async (): Promise<PageSlugSource[]> => {
  const limit = 200;
  const maxPages = 3;
  const items: PageSlugSource[] = [];
  for (let page = 1; page <= maxPages; page += 1) {
    try {
      const res = await rexerApi.pages.listAll({
        type: 'landing',
        status: 'published',
        page,
        limit,
      });
      const batch = res.items ?? [];
      items.push(...batch);
      const total = res.total ?? items.length;
      if (batch.length < limit || items.length >= total) break;
    } catch {
      break;
    }
  }
  return items;
};

export const probePublicPreviewSlug = async (
  code?: string,
  name?: string
): Promise<string | null> => {
  const candidates = previewSlugCandidates(code, name);
  const hits = await Promise.all(
    candidates.map(async slug => {
      try {
        const page = await rexerApi.publicPages.get(slug);
        return page.slug || slug;
      } catch {
        return null;
      }
    })
  );
  return hits.find(Boolean) ?? null;
};

/**
 * `template.id` → public slug. Version HEAD is not enough: a published page
 * often pins an older version, and list payloads omit `template_id`.
 */
export const publishedPreviewSlugByTemplate = (
  templates: Template[],
  pages: PageSlugSource[]
): Map<string, string> => {
  const byTemplateId = new Map<string, string>();
  const byVersionId = new Map<string, string>();
  const byName = new Map<string, string>();
  const published = sortPublishedFirst(pages);

  for (const page of published) {
    if (page.template_id && !byTemplateId.has(page.template_id)) {
      byTemplateId.set(page.template_id, page.slug);
    }
    if (
      page.template_version_id &&
      !byVersionId.has(page.template_version_id)
    ) {
      byVersionId.set(page.template_version_id, page.slug);
    }
    const nameKey = page.name.trim().toLowerCase();
    if (nameKey && !byName.has(nameKey)) byName.set(nameKey, page.slug);
  }

  const slugs = new Map<string, string>();
  for (const template of templates) {
    const byCode = published.find(page =>
      slugBelongsToCode(page.slug, template.code)
    )?.slug;
    const slug =
      byTemplateId.get(template.id) ||
      byVersionId.get(template.current_version_id) ||
      byName.get(template.name.trim().toLowerCase()) ||
      byCode;
    if (slug) slugs.set(template.id, slug);
  }
  return slugs;
};

/** Fill gaps the list join missed — public `/p/{code}` / `/p/{code}-v1`. */
export const fillMissingPreviewSlugs = async (
  templates: Template[],
  slugs: Map<string, string>
): Promise<void> => {
  const missing = templates.filter(
    template => !template.preview_slug && !slugs.get(template.id)
  );
  await Promise.all(
    missing.map(async template => {
      if (template.promoted_from_page_id) {
        try {
          const page = await rexerApi.pages.get(template.promoted_from_page_id);
          if (page.slug) {
            slugs.set(template.id, page.slug);
            return;
          }
        } catch {
          /* page may sit outside this tenant */
        }
      }
      const probed = await probePublicPreviewSlug(template.code, template.name);
      if (probed) slugs.set(template.id, probed);
    })
  );
};

/**
 * Click-time fallback when the catalog row still has no slug.
 */
export const resolveExchangePreviewSlug = async (
  listing: ExchangeListingView
): Promise<string | null> => {
  if (listing.slug) return listing.slug;
  if (listing.source !== 'page') return null;

  const cacheKey = listing.templateId || listing.id;
  const cached = resolvedSlugCache.get(cacheKey);
  if (cached) return cached;

  const remember = (slug: string): string => {
    resolvedSlugCache.set(cacheKey, slug);
    return slug;
  };

  const probed = await probePublicPreviewSlug(
    listing.templateCode,
    listing.name
  );
  if (probed) return remember(probed);

  const [previewResult, byCode, byName] = await Promise.allSettled([
    listing.templateId
      ? rexerApi.templates.preview(listing.templateId)
      : Promise.resolve(null),
    listing.templateCode
      ? rexerApi.pages.listAll({
          type: 'landing',
          status: 'published',
          q: listing.templateCode,
          limit: 25,
        })
      : Promise.resolve({ items: [] as Page[] }),
    rexerApi.pages.listAll({
      type: 'landing',
      status: 'published',
      q: listing.name,
      limit: 25,
    }),
  ]);

  if (previewResult.status === 'fulfilled' && previewResult.value) {
    const fromPreview = slugFromPreviewUrl(previewResult.value.preview_url);
    if (fromPreview) return remember(fromPreview);
  }

  const listed: PageSlugSource[] = [
    ...(byCode.status === 'fulfilled' ? (byCode.value.items ?? []) : []),
    ...(byName.status === 'fulfilled' ? (byName.value.items ?? []) : []),
  ];
  const pages = sortPublishedFirst(listed);
  const name = listing.name.trim().toLowerCase();
  const match =
    pages.find(
      page =>
        listing.templateId &&
        page.template_id === listing.templateId &&
        page.slug
    ) ||
    pages.find(
      page =>
        listing.templateVersionId &&
        page.template_version_id === listing.templateVersionId &&
        page.slug
    ) ||
    pages.find(page => slugBelongsToCode(page.slug, listing.templateCode)) ||
    pages.find(page => page.slug && page.name?.trim().toLowerCase() === name);

  return match?.slug ? remember(match.slug) : null;
};
