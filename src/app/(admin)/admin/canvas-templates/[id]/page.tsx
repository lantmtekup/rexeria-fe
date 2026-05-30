'use client';

/**
 * Admin canvas template editor — `/admin/canvas-templates/[id]`.
 *
 * Param `id` accepts:
 *   - UUID  → treated as a template id, passed directly to BlockEditor.
 *   - else  → treated as a page slug. Resolve chain:
 *               page (by slug) → template_version_id → template_id.
 *             Then render BlockEditor with the derived template id.
 *
 * Why: `/admin/canvas-templates` (page list) navigates with `page.slug` so
 * URL stays human-readable. Editor needs `template_id` since
 * `rexerApi.templates.get/version` are template-scoped.
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
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setError(null);

    // UUID → template id direct (legacy flow).
    if (UUID_RE.test(rawId)) {
      setTemplateId(rawId);
      return;
    }

    // Slug → lookup page → derive template.
    (async () => {
      try {
        // BE `?slug=` query param doesn't actually filter (returns all). Use
        // `?q=` text search and match exact slug client-side.
        const pages = await rexerApi.pages.listAll({ q: rawId, limit: 25 });
        const page = pages.items?.find(p => p.slug === rawId);
        if (!page) {
          throw new Error(`Không tìm thấy page với slug "${rawId}"`);
        }
        // No flat `/template-versions/{vId}` endpoint to resolve template_id
        // from version_id, so list templates and match on current_version_id.
        // OK for now — system template count is small (< 100).
        const templates = await rexerApi.templates.list({ limit: 100 });
        const tpl = templates.items?.find(
          t => t.current_version_id === page.template_version_id
        );
        if (!tpl) {
          throw new Error(
            `Page "${rawId}" link tới template_version_id chưa khớp template nào`
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
      />
    </div>
  );
}
