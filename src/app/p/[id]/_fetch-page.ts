import { cache } from 'react';

import type { BrandKitData } from '@/lib/brand-kit';
import type { MotionKitData, Page } from '@/services/rexer/types';
import { getCodeTemplate, listCodeTemplates } from '@/templates/registry';

/**
 * Shared data access for the public landing routes (`/p/[id]` and its
 * `[...path]` sub-pages).
 *
 * `fetchPublicPage` is wrapped in React `cache()` **here, once**, so a route's
 * `generateMetadata` and its component body share a single BE round-trip. Do
 * not re-wrap or duplicate it per route — that silently doubles the fetch.
 */

// Fail loud khi thiếu env — KHÔNG fallback prod URL: env cấu hình sai mà
// âm thầm đọc prod là footgun (audit FE 2026-07-04 P4).
export const REXER_BE = (() => {
  const v = process.env.NEXT_PUBLIC_REXER_API ?? process.env.REXER_API;
  if (!v) {
    throw new Error(
      'NEXT_PUBLIC_REXER_API (hoặc REXER_API) chưa cấu hình — bắt buộc cho /p/[id]'
    );
  }
  return v.replace(/\/+$/, '');
})();

/**
 * Shape của `/v1/public/pages/{slug}`. BE contract 2026-06-04 §2b xác nhận
 * response gồm `template_code` (khóa renderer ổn định) + `template_id`.
 * `template_name` giữ lại làm fallback match khi thiếu code (defensive).
 */
export interface PublicPageResponse {
  id: string;
  slug: string;
  name: string;
  type: string;
  release_id: string;
  release_no: number;
  published_at: string;
  canvas_blueprint?: Record<string, unknown>;
  config?: Record<string, unknown>;
  template_code?: string;
  template_name?: string;
  template_id?: string;
  template_version_id: string;
  /** Active brand kit tokens (colors/fonts/logo/tokens) — BE contract 2026-06-15. */
  brand_kit?: BrandKitData;
  /** Active motion kit — animation scale + page-transition style. */
  motion_kit?: MotionKitData;
  /**
   * GA4 measurement id của brand sở hữu trang (`brands.ga_measurement_id`,
   * migration 000105) — layout nhúng thẻ gtag thứ hai bằng id này.
   */
  ga_measurement_id?: string;
}

/**
 * Trang published là immutable per `release_no` → cache SSR với revalidate
 * 60s + tag để publish/unpublish purge chủ động qua `/api/revalidate-page`.
 *
 * Sub-pages live inside the SAME blueprint and are fetched with the SAME root
 * slug, so they share the `page:{slug}` tag and one publish purges all of
 * them. Never invent a `page:{root}/{sub}` tag.
 */
export const fetchPublicPage = cache(
  async (slug: string): Promise<PublicPageResponse | null> => {
    try {
      const res = await fetch(
        `${REXER_BE}/v1/public/pages/${encodeURIComponent(slug)}`,
        { next: { revalidate: 60, tags: ['public-page', `page:${slug}`] } }
      );
      if (!res.ok) return null;
      return (await res.json()) as PublicPageResponse;
    } catch {
      return null;
    }
  }
);

/** Resolve code-template entry cho public page.
 *  Primary: `template_code` (BE contract §2b) → registry key, exact match.
 *  Fallback: `template_name` chỉ khi response thiếu code (defensive). */
export function resolveCodeTemplate(pub: PublicPageResponse) {
  return (
    getCodeTemplate(pub.template_code) ??
    findCodeTemplateByName(pub.template_name)
  );
}

/** Fallback match `template_name` → registry meta.name/code. Chỉ dùng khi
 *  public response thiếu `template_code`. Fragile nếu trùng tên — chấp nhận
 *  vì chỉ là nhánh dự phòng. */
function findCodeTemplateByName(name: string | undefined) {
  if (!name) return null;
  const lc = name.trim().toLowerCase();
  return (
    listCodeTemplates().find(
      t =>
        t.meta.name.trim().toLowerCase() === lc ||
        t.meta.code.toLowerCase() === lc
    ) ?? null
  );
}

/** Fallback BE-rendered HTML (legacy block renderer §15 placeholder). */
export async function fetchBeHtml(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`${REXER_BE}/p/${slug}`, {
      next: { revalidate: 60, tags: ['public-page', `page:${slug}`] },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Synthesize minimal Page object cho code template props (only fields
 *  template actually reads). */
export function publicToPage(p: PublicPageResponse): Page {
  return {
    id: p.id,
    brand_id: '',
    workspace_id: '',
    slug: p.slug,
    name: p.name,
    description: undefined,
    type: p.type as Page['type'],
    type_metadata: (p.config ?? {}) as Page['type_metadata'],
    status: 'published',
    template_version_id: p.template_version_id,
    active_release_id: p.release_id,
    freeze_products: false,
    created_by: '',
    updated_by: '',
    created_at: p.published_at,
    updated_at: p.published_at,
  };
}

/** Per-page SEO metadata, merging the sub-page's own `seo` over the landing's
 *  `config.seo`. */
export function seoMetadata(
  pub: PublicPageResponse,
  pageSeo?: { title?: string; description?: string; ogImageUrl?: string },
  pageName?: string,
  canonical?: string
) {
  const cfg = (pub.config ?? {}) as {
    seo?: { title?: string; description?: string; image?: string };
    description?: string;
  };
  const title = pageSeo?.title || cfg.seo?.title || pageName || pub.name;
  const description =
    pageSeo?.description ?? cfg.seo?.description ?? cfg.description;
  const image = pageSeo?.ogImageUrl ?? cfg.seo?.image;
  return {
    title,
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title,
      description,
      type: 'website' as const,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: (image ? 'summary_large_image' : 'summary') as
        | 'summary_large_image'
        | 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
