/**
 * Public landing render — `/p/[slug]` (the template's HOME page).
 *
 * Sub-pages of the same template live at `/p/[slug]/[...path]` and are handled
 * by the sibling catch-all route, which shares `_fetch-page.ts` (one BE
 * round-trip, one cache tag) with this one.
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

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import {
  findHomePage,
  readSitePages,
} from '@/components/modules/block-editor/links/sitePages';
import { brandKitToCssVars } from '@/lib/brand-kit';

import {
  fetchBeHtml,
  fetchPublicPage,
  publicToPage,
  resolveCodeTemplate,
  seoMetadata,
} from './_fetch-page';
import { PublicBlockRender } from './_block-render';

interface PageProps {
  params: Promise<{ id: string }>;
  /** `?embed=1` — set when the page is iframed on a partner site (interactive
   *  ad creative embed). Strips the "Tạo bằng REXER" footer. */
  searchParams: Promise<{ embed?: string }>;
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
  const home = findHomePage(readSitePages(pub.canvas_blueprint));
  return seoMetadata(pub, undefined, home.name, `/p/${slug}`);
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

  // Block template — render the HOME page out of the blueprint. For a
  // pre-multi-page blueprint `readSitePages` synthesizes one home page from
  // root `blocks`, so this is identical to the old behaviour.
  const pages = readSitePages(pub.canvas_blueprint);
  const home = findHomePage(pages);

  if (home.blocks.length > 0) {
    return (
      <PublicBlockRender
        page={publicToPage(pub)}
        blueprint={pub.canvas_blueprint ?? {}}
        activePageId={home.id}
        rootSlug={slug}
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
