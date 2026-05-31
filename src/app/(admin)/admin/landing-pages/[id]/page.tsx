'use client';

/**
 * Admin canvas template editor — `/admin/landing-pages/[id]`.
 *
 * Param `id` accepts 3 shapes (try in order):
 *   1. Template UUID → render BlockEditor directly.
 *   2. Page UUID     → lookup page → template_version_id → template_id.
 *   3. Page slug     → lookup page by slug → template_version_id → template.
 *
 * Why 3 shapes: `/admin/landing-pages` (page list) prefers slug for
 * human-readable URLs, but falls back to page.id when slug is empty
 * (vd page created without an admin-provided slug). Editor needs the
 * derived template_id since `rexerApi.templates.get/version` are
 * template-scoped.
 */

import * as React from 'react';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

import { BlockEditor } from '@/components/modules/CanvasTemplate/BlockEditor';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';

interface PageProps {
  params: Promise<{ id: string }>;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export default function AdminCanvasTemplateEditorPage({ params }: PageProps) {
  const { id: rawId } = use(params);
  const searchParams = useSearchParams();
  const autoApplyProductId = searchParams.get('apply_product') ?? undefined;

  const [templateId, setTemplateId] = React.useState<string | null>(null);
  const [pageSlug, setPageSlug] = React.useState<string | undefined>(undefined);
  const [pageId, setPageId] = React.useState<string | undefined>(undefined);
  const [pageName, setPageName] = React.useState<string | undefined>(undefined);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setError(null);
    setPageSlug(undefined);
    setPageId(undefined);
    setPageName(undefined);

    (async () => {
      try {
        // Resolve template_version_id from rawId (3 shapes, try in order).
        let versionId: string | undefined;

        if (UUID_RE.test(rawId)) {
          // Order matters: try PAGE first, then TEMPLATE. Page is the common
          // case (mọi navigate từ /admin/landing-pages). Template-id chỉ
          // gặp sau khi vừa Create Template Dialog (router.push template.id).
          // Đảo này tránh log noise GET /templates/{pageId} 404 ở DevTools
          // cho luồng phổ biến nhất.
          try {
            const page = await rexerApi.pages.get(rawId);
            if (cancelled) return;
            versionId = page.template_version_id;
            setPageId(page.id);
            setPageName(page.name);
            if (page.slug) setPageSlug(page.slug);
          } catch {
            // Not a page id — try as template id (newly-created template).
            try {
              const tplRes = await rexerApi.templates.get(rawId);
              if (cancelled) return;
              // Template found → editor takes templateId directly, skip
              // the version resolve below. No specific page slug in this
              // shape (template can be used by multiple pages).
              setTemplateId(tplRes.template.id);
              return;
            } catch (tplErr) {
              throw new Error(
                `UUID "${rawId}" không khớp page ID nào hoặc template ID nào: ${rxMessage(tplErr)}`
              );
            }
          }
        } else {
          // Shape 3: slug → lookup page → derive version_id.
          // BE `?slug=` query param doesn't actually filter (returns all). Use
          // `?q=` text search and match exact slug client-side.
          const pages = await rexerApi.pages.listAll({ q: rawId, limit: 25 });
          const page = pages.items?.find(p => p.slug === rawId);
          if (!page) {
            throw new Error(`Không tìm thấy page với slug "${rawId}"`);
          }
          versionId = page.template_version_id;
          setPageId(page.id);
          setPageName(page.name);
          setPageSlug(page.slug);
        }

        if (!versionId) {
          throw new Error('Page không có template_version_id');
        }

        // Resolve version_id → template_id. No flat `/template-versions/{vId}`
        // endpoint, so list templates + match on current_version_id. OK for
        // now — system template count is small (< 100).
        const templates = await rexerApi.templates.list({ limit: 100 });
        const tpl = templates.items?.find(
          t => t.current_version_id === versionId
        );
        if (!tpl) {
          throw new Error(
            `template_version_id "${versionId}" chưa khớp template nào (có thể version đã đổi)`
          );
        }
        if (!cancelled) setTemplateId(tpl.id);
      } catch (err) {
        if (!cancelled) setError(rxMessage(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rawId]);

  if (error) {
    return (
      <div className='flex h-full flex-1 items-center justify-center bg-zinc-50 p-8'>
        <div className='max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center'>
          <AlertCircle className='mx-auto size-8 text-rose-600' />
          <p className='mt-3 text-[14px] font-semibold text-rose-900'>
            Không mở được editor
          </p>
          <p className='mt-1 font-mono text-[11.5px] text-rose-700'>{error}</p>
        </div>
      </div>
    );
  }

  if (!templateId) {
    return (
      <div className='flex h-full flex-1 items-center justify-center text-sm text-zinc-500'>
        <Loader2 className='mr-2 size-4 animate-spin' /> Đang resolve template
        từ slug…
      </div>
    );
  }

  return (
    <div className='flex h-full flex-1 flex-col'>
      <BlockEditor
        templateId={templateId}
        autoApplyProductId={autoApplyProductId}
        pageSlug={pageSlug}
        pageId={pageId}
        pageName={pageName}
        onPageSlugChange={setPageSlug}
      />
    </div>
  );
}
