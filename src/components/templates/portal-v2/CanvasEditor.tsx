'use client';

import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { BlockEditorV2 } from '@/components/modules/block-editor-v2/BlockEditorV2';
import { PreviewStageLoading } from '@/components/organisms/portal-v2/exchange/PreviewStageLoading';
import { CodeTemplatePageEditor } from '@/components/modules/Template/CodeTemplatePageEditor';
import { useResolvedCanvasTarget } from '@/lib/portal-v2/canvas/useResolvedCanvasTarget';
import { PORTAL_V2_BASE } from '@/lib/portal-v2/nav';
import { getCodeTemplate } from '@/templates/registry';

type CanvasEditorProps = {
  /** Page slug or UUID from the route segment. */
  rawId: string;
  /**
   * Where Back lands when there is no history to pop — a deep link or a reload.
   * The route supplies it because only the route knows which module the user
   * came from; this template is shared by all of them.
   */
  fallbackHref?: string;
};

/**
 * The portal-v2 canvas editor page — the whole of `/portal-v2/:id/canvas`.
 *
 * A TEMPLATE, not an organism: it composes a full page (resolve the target,
 * then mount the editor) the same way `Shell` does, and it is deliberately
 * module-agnostic. Experiences opens it today; Campaigns and Journeys will open
 * the same route for the same reason, so nothing here may assume Experiences.
 *
 * Runs on `BlockEditorV2` — a fork of the editor chrome that portal-v2 owns, so
 * changes to it never reach the admin or brand editors. The block library, the
 * canvas data format and the motion runtime stay shared with v1 because the
 * public `/p/[slug]` render depends on them.
 *
 * Portal-v2 has its own route rather than linking to `/admin/landing-pages/[id]`
 * because middleware bounces anyone whose role is not `admin` off `/admin/*`.
 */
export const CanvasEditor = ({
  rawId,
  fallbackHref = PORTAL_V2_BASE,
}: CanvasEditorProps) => {
  const t = useTranslations('portalV2.canvas');
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoApplyProductId = searchParams.get('apply_product') ?? undefined;

  const target = useResolvedCanvasTarget(rawId);

  /**
   * Callers navigate here in the same tab, so there is normally a history entry
   * to pop. On a deep link or a reload there is not, and `router.back()` would
   * be a silent no-op — fall back to where the route says.
   */
  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }, [router, fallbackHref]);

  if (target.status === 'error') {
    return (
      <div className='flex h-full items-center justify-center p-8'>
        <div className='max-w-md rounded-[var(--pv2-r-lg)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-6 py-8 text-center'>
          <AlertCircle
            className='mx-auto size-7 text-[var(--pv2-error)]'
            strokeWidth={2}
            aria-hidden
          />
          <p className='mt-3 text-[15px] font-semibold text-[var(--pv2-ink)]'>
            {t('editorFailed')}
          </p>
          <p className='mt-2 font-mono text-[11.5px] break-words text-[var(--pv2-mut)]'>
            {target.error}
          </p>
        </div>
      </div>
    );
  }

  /*
   * Same boot UI as the shopper previews and the route-level `loading.tsx`, so
   * opening the canvas is one continuous progress bar rather than a skeleton
   * that swaps for a spinner that swaps for the editor.
   */
  if (target.status === 'resolving' || !target.templateId) {
    return (
      <PreviewStageLoading className='h-full' label={t('editorResolving')} />
    );
  }

  /* A code template is a form, not a canvas — it brings its own header. */
  if (target.template && target.page && getCodeTemplate(target.template.code)) {
    return (
      <div className='h-full overflow-auto'>
        <CodeTemplatePageEditor page={target.page} template={target.template} />
      </div>
    );
  }

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <BlockEditorV2
        templateId={target.templateId}
        autoApplyProductId={autoApplyProductId}
        pageSlug={target.pageSlug}
        pageId={target.pageId}
        pageName={target.pageName}
        pageStatus={target.pageStatus}
        pinnedVersionId={target.pinnedVersionId}
        onPageSlugChange={target.setPageSlug}
        onPinnedVersionChange={target.setPinnedVersionId}
        onBack={handleBack}
      />
    </div>
  );
};
