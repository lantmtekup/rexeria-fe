'use client';

/**
 * Admin template canvas editor — `/admin/templates/[id]/edit`.
 *
 * Reuses `BlockEditor` (the same component dùng cho landing pages) ở
 * "template-only" mode: chỉ pass `templateId`, KHÔNG pass `pageId` /
 * `pageSlug` / `pageStatus`. Khi không có page context:
 *  - publish dialog không hiện slug controls
 *  - publish toggle chỉ update blueprint.publish meta (không gọi
 *    pages.publish — không có page để publish)
 *  - autosave PATCH `templates/:id/draft-canvas-blueprint` (đúng vì
 *    template có chính draft buffer ở schema canonical)
 *  - Save Version create new TemplateVersion (như landing flow)
 *
 * Khác với `/admin/landing-pages/[id]` resolver (3-shape):
 * route này dành riêng cho template authoring, param luôn là template
 * UUID. Không lookup page, không resolve slug.
 *
 * Khi nào dùng route nào:
 *  - Tạo template mới (CreateTemplateDialog) → route này.
 *  - Edit landing page instance của brand → `/admin/landing-pages/{id}`.
 *  - Edit template's canvas độc lập (admin maintain catalog) → route này.
 */

import * as React from 'react';
import { use } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

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

export default function AdminTemplateEditPage({ params }: PageProps) {
  const { id: rawId } = use(params);

  const [templateId, setTemplateId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setError(null);
    setTemplateId(null);

    (async () => {
      if (!UUID_RE.test(rawId)) {
        setError(`"${rawId}" không phải template UUID`);
        return;
      }
      try {
        const r = await rexerApi.templates.get(rawId);
        if (!cancelled) setTemplateId(r.template.id);
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
            Không mở được editor template
          </p>
          <p className='mt-1 font-mono text-[11.5px] text-rose-700'>{error}</p>
        </div>
      </div>
    );
  }

  if (!templateId) {
    return (
      <div className='flex h-full flex-1 items-center justify-center text-sm text-zinc-500'>
        <Loader2 className='mr-2 size-4 animate-spin' /> Đang load template…
      </div>
    );
  }

  return (
    <div className='flex h-full flex-1 flex-col'>
      <BlockEditor templateId={templateId} />
    </div>
  );
}
