'use client';

/**
 * Brand-side landing canvas editor — `/portal/landing-pages/[id]`.
 *
 * Đích của nút "Mở editor" (LandingDetailCard). Mount CÙNG BlockEditor như
 * admin editor, chỉ khác URL nằm dưới /portal (brand không vào /admin được).
 *
 * Param `id` = Page UUID (landing). Resolve: Page → template_version_id →
 * template_id → BlockEditor. Template READ (`templates.list/versions`) cho phép
 * mọi user auth kể cả brand (be template.go Register). Code template →
 * CodeTemplatePageEditor (form).
 *
 * Lưu ý perm: mutations canvas (`/templates/:id/draft-canvas-blueprint`,
 * `/versions`) là internal-only ở BE → SAVE có thể 403 cho brand tới khi BE mở
 * quyền edit landing page-scoped cho brand (be-audit §21,
 * docs/be-spec-portal-page-from-blueprint-2026-06-17.md).
 */

import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { CodeTemplatePageEditor } from '@/components/modules/Template/CodeTemplatePageEditor';
import { BlockEditor } from '@/components/modules/CanvasTemplate/BlockEditor';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import { resolveTemplateFromVersionId } from '@/services/rexer/resolveTemplateFromVersion';
import type { Page, Template } from '@/services/rexer/types';
import { getCodeTemplate } from '@/templates/registry';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export default function PortalLandingEditorPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('portal');
  const rawId = params?.id ?? '';
  const autoApplyProductId = searchParams.get('apply_product') ?? undefined;

  const [templateId, setTemplateId] = React.useState<string | null>(null);
  const [resolvedTemplate, setResolvedTemplate] =
    React.useState<Template | null>(null);
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

  const resolvedForRawIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!rawId) return;
    let cancelled = false;

    if (resolvedForRawIdRef.current === rawId && templateId) {
      return;
    }

    setError(null);
    setTemplateId(null);
    setResolvedTemplate(null);
    setResolvedPage(null);
    setPageSlug(undefined);
    setPageId(undefined);
    setPageName(undefined);
    setPageStatus(undefined);
    setPinnedVersionId(undefined);

    (async () => {
      try {
        let versionId: string | undefined;

        if (UUID_RE.test(rawId)) {
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
            // Không phải page id → thử như template id (template vừa tạo).
            try {
              const tplRes = await rexerApi.templates.get(rawId);
              if (cancelled) return;
              resolvedForRawIdRef.current = rawId;
              setTemplateId(tplRes.template.id);
              return;
            } catch (tplErr) {
              throw new Error(
                `UUID "${rawId}" không khớp page ID nào hoặc template ID nào: ${rxMessage(tplErr)}`
              );
            }
          }
        } else {
          // slug → lookup page → derive version_id.
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

        const tpl = await resolveTemplateFromVersionId(versionId);
        if (cancelled) return;
        resolvedForRawIdRef.current = rawId;
        setTemplateId(tpl.id);
        setResolvedTemplate(tpl);
      } catch (err) {
        if (!cancelled) setError(rxMessage(err));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawId]);

  const backBar = (
    <div className='border-border text-content-muted bg-background flex items-center gap-2 border-b px-4 py-2 text-xs'>
      <button
        type='button'
        onClick={() => router.push('/portal/landing-pages')}
        className='hover:text-foreground inline-flex items-center gap-1'
      >
        <ArrowLeft className='size-3.5' /> Landing pages
      </button>
      <span className='text-muted-foreground'>/</span>
      <span className='text-foreground font-semibold'>
        {pageName ?? 'edit'}
      </span>
    </div>
  );

  if (error) {
    return (
      <div className='flex h-screen flex-col'>
        {backBar}
        <div className='bg-muted flex flex-1 items-center justify-center p-8'>
          <div className='border-destructive/20 bg-danger-bg max-w-md rounded-2xl border p-6 text-center'>
            <AlertCircle className='text-destructive mx-auto size-8' />
            <p className='text-destructive mt-3 text-sm font-semibold'>
              {t('blocksIdEdit.openEditorFailed')}
            </p>
            <p className='text-2xs text-destructive mt-1 font-mono'>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!templateId) {
    return (
      <div className='flex h-screen flex-col'>
        {backBar}
        <div className='text-content-muted flex flex-1 items-center justify-center text-sm'>
          <Loader2 className='mr-2 size-4 animate-spin' />{' '}
          {t('blocksIdEdit.resolving')}
        </div>
      </div>
    );
  }

  // Code template + page context → form editor; còn lại → BlockEditor.
  if (
    resolvedTemplate &&
    resolvedPage &&
    getCodeTemplate(resolvedTemplate.code)
  ) {
    // KHÔNG bọc backBar — CodeTemplatePageEditor đã có header riêng (tránh trùng).
    return (
      <div className='h-screen overflow-auto'>
        <CodeTemplatePageEditor
          page={resolvedPage}
          template={resolvedTemplate}
        />
      </div>
    );
  }

  // KHÔNG bọc backBar — BlockEditor đã có header riêng (← Landing pages + tên).
  return (
    <div className='h-screen'>
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
