/**
 * Public landing render — `/p/[slug]`.
 *
 * 2026-05-31: dùng **`/v1/public/pages/{slug}`** (BE public endpoint —
 * no auth required) thay vì /v1/pages?q= (admin-gated). Anon users
 * mở link share giờ xem được landing.
 *
 * Render branches:
 *  1. **Code template** — registry match qua `template_name` từ public
 *     response (BE chưa expose `template_code` field; FE lookup bằng
 *     `meta.name` workaround). Render React TSX SSR + hydrate.
 *  2. **Block template** — render canvas_blueprint trực tiếp từ public
 *     response qua `BlockPreview` (mirror admin overlay view).
 *     Fallback: legacy BE `/p/{slug}` HTML qua iframe nếu BlockPreview
 *     fail.
 *
 * Server component — fetch xảy ra ở Next.js server (Node runtime).
 */

import { notFound } from 'next/navigation';

import { listCodeTemplates } from '@/templates/registry';
import type { Page } from '@/services/rexer/types';

import { PublicBlockRender } from './_block-render';

interface PageProps {
  params: Promise<{ id: string }>;
}

const REXER_BE =
  process.env.NEXT_PUBLIC_REXER_API ??
  process.env.REXER_API ??
  'https://rexerai.tekupsoftware.com';

/**
 * Shape của `/v1/public/pages/{slug}` (probed 2026-05-31). KHÔNG có
 * `template_code` field — FE workaround lookup qua `template_name`.
 * Doc be-audit §18 request BE add `template_code` cho match chính xác.
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
  template_name?: string;
  template_version_id: string;
}

async function fetchPublicPage(
  slug: string
): Promise<PublicPageResponse | null> {
  try {
    const res = await fetch(
      `${REXER_BE}/v1/public/pages/${encodeURIComponent(slug)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return (await res.json()) as PublicPageResponse;
  } catch {
    return null;
  }
}

/** Match `template_name` (public response) → registry meta.name.
 *  Workaround vì BE chưa expose template_code ở public response.
 *  Fragile nếu admin tạo nhiều template trùng tên — accept rủi ro tới
 *  khi BE thêm field. */
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
    const res = await fetch(`${REXER_BE}/p/${slug}`, { cache: 'no-store' });
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

export default async function PublicLanding({ params }: PageProps) {
  const { id: slug } = await params;
  const pub = await fetchPublicPage(slug);
  if (!pub) notFound();

  const codeTpl = findCodeTemplateByName(pub.template_name);

  if (codeTpl) {
    const Comp = codeTpl.Component;
    const page = publicToPage(pub);
    const content = (pub.config ?? {}) as Record<string, unknown>;
    return <Comp page={page} content={content} mode='public' />;
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
    return <PublicBlockRender page={page} blueprint={blueprint} />;
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
