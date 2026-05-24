'use client';

/**
 * Brand-side preview of a landing page.
 *
 * Wave 2 of FE canonical cutover: legacy canvas_data preview was tied to the
 * `/canvas-templates/:id/canvas` endpoint which is gone post-Migration 134.
 * Canonical preview will resolve:
 *   1. Page via `rexerApi.pages.get(id)` (+ active_release_id)
 *   2. Template version (canvas_blueprint + slot_schema)
 *   3. Latest page_revision (config_json slot values)
 *   4. Merge slot bindings → renderable block tree → existing RenderBlock pipe
 *
 * This stitching lives in a yet-to-be-built `lib/renderPage.ts` (Wave 3).
 * For now this route renders a placeholder so brands know preview is being
 * rebuilt rather than hitting a 404.
 */

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Construction, Loader2 } from 'lucide-react';

import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Page } from '@/services/rexer/types';

export default function PortalLandingPreviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? '';

  const [page, setPage] = React.useState<Page | null>(null);
  const [status, setStatus] = React.useState<'loading' | 'ok' | 'error'>(
    'loading'
  );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setStatus('loading');
      try {
        const p = await rexerApi.pages.get(id);
        if (cancelled) return;
        setPage(p);
        setStatus('ok');
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        const msg =
          err instanceof RxApiError
            ? err.code || err.message
            : err instanceof Error
              ? err.message
              : 'LOAD_FAILED';
        setError(msg);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === 'loading') {
    return (
      <div className='flex h-screen items-center justify-center bg-neutral-100'>
        <Loader2 className='size-6 animate-spin text-zinc-500' />
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-2xl p-10'>
      <button
        type='button'
        onClick={() => router.push('/portal/landing-pages')}
        className='inline-flex items-center gap-1.5 text-[13px] text-zinc-600 hover:text-zinc-900'
      >
        <ArrowLeft className='size-4' /> Landing pages
      </button>
      <div className='mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center'>
        <Construction className='mx-auto size-7 text-amber-700' />
        <p className='mt-3 text-[14px] font-semibold text-amber-900'>
          Preview đang được rebuild
        </p>
        <p className='mt-2 text-[12px] text-amber-800'>
          Preview canonical (template_version.canvas_blueprint + slot fills từ
          page_revisions.config_json) sẽ release ở Wave 3. Hiện tại brand sửa
          nội dung qua form editor ở{' '}
          <code className='font-mono'>/portal/landing-pages/[id]/edit</code>.
        </p>
        {status === 'error' && (
          <p className='mt-2 font-mono text-[10.5px] text-amber-800/80'>
            (debug) {error}
          </p>
        )}
        {page && (
          <div className='mt-4 inline-flex flex-col gap-1 rounded-lg border border-amber-300 bg-white px-4 py-3 text-left text-[11.5px]'>
            <div>
              <span className='text-zinc-500'>Page:</span>{' '}
              <strong>{page.name}</strong>
            </div>
            <div>
              <span className='text-zinc-500'>Status:</span> {page.status}
            </div>
            <div>
              <span className='text-zinc-500'>Type:</span> {page.type}
            </div>
            <div className='font-mono text-[10px] text-zinc-500'>{page.id}</div>
          </div>
        )}
      </div>
    </div>
  );
}
