/**
 * Public landing render — `/p/[slug]`.
 *
 * 2026-05-31: dùng **`/v1/public/pages/{slug}`** (BE public endpoint —
 * no auth required) thay vì /v1/pages?q= (admin-gated). Anon users
 * mở link share giờ xem được landing.
 *
 * Render branches:
 *  1. **Code template** — registry match qua `template_code` (khóa ổn
 *     định `src/templates/{code}`) từ public response. BE contract
 *     2026-06-04 §2b xác nhận field này luôn có; `template_name` chỉ còn
 *     làm fallback. Render React TSX SSR + hydrate.
 *  2. **Block template** — render canvas_blueprint trực tiếp từ public
 *     response qua `BlockPreview` (mirror admin overlay view).
 *     Fallback: legacy BE `/p/{slug}` HTML qua iframe nếu BlockPreview
 *     fail.
 *
 * Server component — fetch xảy ra ở Next.js server (Node runtime).
 */

import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { getCodeTemplate, listCodeTemplates } from '@/templates/registry';
import { brandKitToCssVars, type BrandKitData } from '@/lib/brand-kit';
import type { MotionKitData, Page } from '@/services/rexer/types';

import { PublicBlockRender } from './_block-render';

interface PageProps {
  params: Promise<{ id: string }>;
  /** `?embed=1` — set when the page is iframed on a partner site (interactive
   *  ad creative embed). Strips the "Tạo bằng REXER" footer. */
  searchParams: Promise<{ embed?: string }>;
}

// Fail loud khi thiếu env — KHÔNG fallback prod URL: env cấu hình sai mà
// âm thầm đọc prod là footgun (audit FE 2026-07-04 P4).
const REXER_BE = (() => {
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
interface PublicPageResponse {
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
}

/**
 * Trang published là immutable per `release_no` → cache SSR với revalidate
 * 60s + tag để publish/unpublish purge chủ động qua `/api/revalidate-page`
 * (audit FE 2026-07-04 P2). Bọc React `cache()` để generateMetadata + page
 * component share đúng 1 lần gọi BE mỗi request (P3).
 */
const fetchPublicPage = cache(
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
function resolveCodeTemplate(pub: PublicPageResponse) {
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
async function fetchBeHtml(slug: string): Promise<string | null> {
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
function publicToPage(p: PublicPageResponse): Page {
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

/**
 * Metadata per-page cho SEO/social share (audit FE 2026-07-04 P3) — trước
 * đây mọi landing published ship title/OG của root layout. Dùng chung
 * fetchPublicPage (React cache) nên không tốn thêm round-trip BE.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id: slug } = await params;
  const pub = await fetchPublicPage(slug);
  if (!pub) return {};
  const cfg = (pub.config ?? {}) as {
    seo?: { title?: string; description?: string; image?: string };
    description?: string;
  };
  const title = cfg.seo?.title || pub.name;
  const description = cfg.seo?.description ?? cfg.description;
  const image = cfg.seo?.image;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function PublicLanding({
  params,
  searchParams,
}: PageProps) {
  const { id: slug } = await params;
  const { embed } = await searchParams;
  const pub = await fetchPublicPage(slug);
  if (!pub) notFound();

  const codeTpl = resolveCodeTemplate(pub);

  if (codeTpl) {
    const Comp = codeTpl.Component;
    const page = publicToPage(pub);
    const content = (pub.config ?? {}) as Record<string, unknown>;
    // Wrap in brand-kit CSS vars so code templates can opt into var(--bk-*).
    return (
      <div style={brandKitToCssVars(pub.brand_kit)}>
        <Comp page={page} content={content} mode='public' />
      </div>
    );
  }

  // Block template — try FE render từ canvas_blueprint trong public
  // response. Nếu empty/missing → fallback iframe BE HTML.
  const blueprint = pub.canvas_blueprint;
  const hasBlocks =
    blueprint &&
    Array.isArray((blueprint as { blocks?: unknown }).blocks) &&
    (blueprint as { blocks: unknown[] }).blocks.length > 0;

  if (hasBlocks) {
    const page = publicToPage(pub);
    return (
      <PublicBlockRender
        page={page}
        blueprint={blueprint}
        brandKit={pub.brand_kit}
        motionKit={pub.motion_kit}
        embed={embed === '1'}
      />
    );
  }

  // Last resort: legacy BE-rendered HTML iframe.
  const beHtml = await fetchBeHtml(slug);
  if (!beHtml) notFound();
  return (
    <iframe
      title={pub.name}
      srcDoc={beHtml}
      sandbox='allow-same-origin allow-scripts allow-forms'
      style={{
        width: '100vw',
        height: '100vh',
        border: 0,
        display: 'block',
      }}
    />
  );
}
