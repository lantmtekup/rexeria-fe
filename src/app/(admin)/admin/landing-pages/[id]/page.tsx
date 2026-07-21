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
import { CodeTemplatePageEditor } from '@/components/modules/Template/CodeTemplatePageEditor';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Page, Template } from '@/services/rexer/types';
import { getCodeTemplate } from '@/templates/registry';

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
  /** Full template object — dùng để discriminate code vs block template
   *  qua `template.code` lookup ở registry. Khi code template:
   *  CodeTemplatePageEditor (form) thay vì BlockEditor. */
  const [resolvedTemplate, setResolvedTemplate] =
    React.useState<Template | null>(null);
  /** Full Page object cho CodeTemplatePageEditor — render preview cần
   *  page state đầy đủ. Block editor giữ raw IDs như cũ. */
  const [resolvedPage, setResolvedPage] = React.useState<Page | null>(null);
  const [pageSlug, setPageSlug] = React.useState<string | undefined>(undefined);
  const [pageId, setPageId] = React.useState<string | undefined>(undefined);
  const [pageName, setPageName] = React.useState<string | undefined>(undefined);
  const [pageStatus, setPageStatus] = React.useState<
    'draft' | 'published' | 'archived' | undefined
  >(undefined);
  const [pinnedVersionId, setPinnedVersionId] = React.useState<
    string | undefined
  >(undefined);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setError(null);
    setPageSlug(undefined);
    setPageId(undefined);
    setPageName(undefined);
    setPageStatus(undefined);
    setPinnedVersionId(undefined);
    setResolvedTemplate(null);
    setResolvedPage(null);

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
            setResolvedPage(page);
            setPageId(page.id);
            setPageName(page.name);
            setPageStatus(page.status);
            setPinnedVersionId(page.template_version_id);
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
          setResolvedPage(page);
          setPageId(page.id);
          setPageName(page.name);
          setPageStatus(page.status);
          setPinnedVersionId(page.template_version_id);
          setPageSlug(page.slug);
        }

        if (!versionId) {
          throw new Error('Page không có template_version_id');
        }

        // Resolve version_id → template_id.
        //
        // Cách cũ match `template.current_version_id === versionId` chỉ
        // work khi page pin HEAD. Sau §13 (Option C publish repoint), BE
        // không auto-bump template.current_version_id → page.template
        // _version_id thường diverge khỏi template.current_version_id →
        // find() undefined → throw "chưa khớp template nào".
        //
        // BE chưa có `GET /template-versions/:vId` flat endpoint (probed
        // 2026-05-31, 404), cũng không trả `template_id` ở page response.
        // Fix: fan-out templates.versions() parallel, find template chứa
        // versionId trong versions[]. <100 templates → 100 fetches max,
        // acceptable cho route bootstrap.
        const templates = await rexerApi.templates.list({ limit: 500 });
        const items = templates.items ?? [];
        const matches = await Promise.all(
          items.map(async t => {
            // Fast-path: HEAD match (still common case)
            if (t.current_version_id === versionId) return t;
            try {
              const vl = await rexerApi.templates.versions(t.id);
              const has = (vl.items ?? []).some(v => v.id === versionId);
              return has ? t : null;
            } catch {
              return null;
            }
          })
        );
        const tpl = matches.find(Boolean) ?? null;
        if (cancelled) return;
        if (!tpl) {
          throw new Error(
            `template_version_id "${versionId}" không thuộc template nào (đã probe ${items.length} templates)`
          );
        }
        if (!cancelled) {
          setTemplateId(tpl.id);
          setResolvedTemplate(tpl);
        }
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
      <div className='bg-muted flex h-full flex-1 items-center justify-center p-8'>
        <div className='border-destructive/20 bg-danger-bg max-w-md rounded-2xl border p-6 text-center'>
          <AlertCircle className='text-destructive mx-auto size-8' />
          <p className='text-destructive mt-3 text-sm font-semibold'>
            Không mở được editor
          </p>
          <p className='text-2xs text-destructive mt-1 font-mono'>{error}</p>
        </div>
      </div>
    );
  }

  if (!templateId) {
    return (
      <div className='text-content-muted flex h-full flex-1 items-center justify-center text-sm'>
        <Loader2 className='mr-2 size-4 animate-spin' /> Đang resolve template
        từ slug…
      </div>
    );
  }

  // Code template (registry lookup) + có page context → form editor thay
  // BlockEditor. Block template hoặc route mở từ template UUID (no page)
  // → BlockEditor như cũ.
  if (
    resolvedTemplate &&
    resolvedPage &&
    getCodeTemplate(resolvedTemplate.code)
  ) {
    return (
      <CodeTemplatePageEditor page={resolvedPage} template={resolvedTemplate} />
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
        pageStatus={pageStatus}
        pinnedVersionId={pinnedVersionId}
        onPageSlugChange={setPageSlug}
        onPinnedVersionChange={setPinnedVersionId}
      />
    </div>
  );
}
