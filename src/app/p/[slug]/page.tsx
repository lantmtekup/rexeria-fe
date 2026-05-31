/**
 * Public landing render — `/p/[slug]`.
 *
 * 2026-05-31 (Option C A2a): FE owns route. 2 nhánh render theo template
 * kind:
 *
 * 1. **Code template** (`src/templates/{code}/` exists ở registry)
 *    → render React component server-side với
 *      `content = page.type_metadata`. Full Next.js SSR, hydrate
 *      client cho animation (GSAP / framer-motion).
 *
 * 2. **Block template** (canvas_blueprint JSON, no code entry)
 *    → server-fetch BE `/p/{slug}` HTML + inject qua iframe srcDoc.
 *      Legacy fallback cho đến khi BE ship server-side block renderer
 *      (be-audit §15) — sau đó có thể move sang FE-render bằng
 *      BlockPreview component như preview route làm.
 *
 * Server component — fetch xảy ra ở Next.js server (Node runtime),
 * không expose admin endpoints. Page metadata public-safe (slug, name,
 * type_metadata content).
 */

import { notFound } from 'next/navigation';

import { getCodeTemplate } from '@/templates/registry';
import type { Page, Template } from '@/services/rexer/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const REXER_BE =
  process.env.NEXT_PUBLIC_REXER_API ??
  process.env.REXER_API ??
  'https://rexerai.tekupsoftware.com';

/** Server-side fetch page by slug. */
async function fetchPageBySlug(slug: string): Promise<Page | null> {
  // BE pages?q={slug} returns matching list, client filter exact slug.
  // No admin auth needed for public page (BE allows guest read for
  // published pages per RLS). Pass-through any session cookie if user
  // logged in (so unpublished preview works for admin).
  try {
    const res = await fetch(
      `${REXER_BE}/v1/pages?q=${encodeURIComponent(slug)}&limit=25`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { items?: Page[] };
    return body.items?.find(p => p.slug === slug) ?? null;
  } catch {
    return null;
  }
}

/** Fetch template by id (server). */
async function fetchTemplate(
  templateVersionId: string
): Promise<Template | null> {
  try {
    // No flat /template-versions/{id} endpoint → list templates,
    // match. < 100 templates expected (small catalog).
    const res = await fetch(`${REXER_BE}/v1/templates?limit=500`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { items?: Template[] };
    // Match by ANY of template's versions containing templateVersionId.
    // Fast-path: current_version_id match.
    const fast = body.items?.find(
      t => t.current_version_id === templateVersionId
    );
    if (fast) return fast;
    // Slow path: per-template versions lookup. Parallel fan-out.
    if (!body.items) return null;
    const matches = await Promise.all(
      body.items.map(async t => {
        try {
          const vr = await fetch(`${REXER_BE}/v1/templates/${t.id}/versions`, {
            cache: 'no-store',
          });
          if (!vr.ok) return null;
          const vb = (await vr.json()) as {
            items?: Array<{ id: string }>;
          };
          return vb.items?.some(v => v.id === templateVersionId) ? t : null;
        } catch {
          return null;
        }
      })
    );
    return matches.find(Boolean) ?? null;
  } catch {
    return null;
  }
}

/** Fetch BE-rendered HTML cho block template fallback. */
async function fetchBeHtml(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`${REXER_BE}/p/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export default async function PublicLanding({ params }: PageProps) {
  const { slug } = await params;
  const page = await fetchPageBySlug(slug);
  if (!page) notFound();

  const template = await fetchTemplate(page.template_version_id);
  const codeTpl = template ? getCodeTemplate(template.code) : null;

  if (codeTpl) {
    const Comp = codeTpl.Component;
    const content = (page.type_metadata ?? {}) as Record<string, unknown>;
    return <Comp page={page} content={content} mode='public' />;
  }

  // Block template fallback — server-fetch BE HTML, inject inline.
  // sandbox=allow-scripts vì BE tracking script cần chạy. trust BE
  // (own backend). Khi BE ship FE block renderer hoặc deprecate block
  // templates, có thể remove fallback này.
  const beHtml = await fetchBeHtml(slug);
  if (!beHtml) notFound();
  return (
    <iframe
      title={page.name}
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
