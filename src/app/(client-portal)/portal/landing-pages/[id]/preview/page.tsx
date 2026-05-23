'use client';

/**
 * Brand-side preview of a landing page using the **authenticated** canvas
 * endpoint (`GET /canvas-templates/{id}/canvas`) — works for both draft
 * + published. No share_token required because the cookie scopes access
 * to the brand's own canvases. Renders the exact same block tree as the
 * public `/p/[id]/[token]` page so what brand sees here matches what
 * visitors will see live.
 */

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';

import { RenderBlock } from '@/components/modules/CanvasTemplate/block-editor/blocks/renderBlock';
import {
  MotionBlockRoot,
  MotionProvider,
} from '@/components/modules/CanvasTemplate/block-editor/motion/runtime';
import type { BlockMotion } from '@/components/modules/CanvasTemplate/block-editor/motion/types';
import {
  parseCanvas,
  type BlockEditorCanvas,
} from '@/components/modules/CanvasTemplate/block-editor/serialize';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';

export default function PortalLandingPreviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? '';

  const [canvas, setCanvas] = React.useState<BlockEditorCanvas | null>(null);
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
        const resp = await rexerApi.canvasTemplates.getCanvas(id);
        if (cancelled) return;
        const parsed = parseCanvas(resp?.canvas_data);
        if (!parsed) {
          setStatus('error');
          setError('EMPTY_CANVAS');
          return;
        }
        setCanvas(parsed);
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

  if (status === 'error') {
    return (
      <div className='mx-auto max-w-2xl p-10 text-center'>
        <button
          type='button'
          onClick={() => router.push('/portal/landing-pages')}
          className='inline-flex items-center gap-1.5 text-[13px] text-zinc-600 hover:text-zinc-900'
        >
          <ArrowLeft className='size-4' /> Landing pages
        </button>
        <div className='mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-8'>
          <AlertTriangle className='mx-auto size-7 text-amber-700' />
          <p className='mt-3 text-[14px] font-semibold text-amber-900'>
            Không hiển thị được bản preview
          </p>
          <p className='mt-1 font-mono text-[11px] text-amber-800'>
            {error === 'EMPTY_CANVAS'
              ? 'Canvas chưa có block — mở editor để thêm block trước.'
              : error}
          </p>
          <Link
            href={`/canvas-templates/${id}`}
            className='mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700'
          >
            <ExternalLink className='size-3' /> Mở canvas editor
          </Link>
        </div>
      </div>
    );
  }

  const visible = canvas?.blocks.filter(b => b.isVisible) ?? [];

  return (
    <div className='relative flex min-h-screen flex-col bg-neutral-50'>
      {/* Preview chrome — sticky top bar showing this isn't the public URL */}
      <div className='sticky top-0 z-40 flex items-center gap-3 border-b border-amber-200 bg-amber-50/95 px-4 py-2 backdrop-blur'>
        <button
          type='button'
          onClick={() => router.push('/portal/landing-pages')}
          className='inline-flex items-center gap-1.5 rounded-md text-[12px] font-medium text-amber-900 hover:text-amber-700'
        >
          <ArrowLeft className='size-3.5' /> Landing pages
        </button>
        <span className='inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-800 uppercase'>
          <span className='size-1.5 animate-pulse rounded-full bg-amber-600' />
          Preview · brand-only
        </span>
        <span className='hidden text-[11px] text-amber-800/80 sm:inline'>
          Đây là bản WIP cho bạn xem trước. Khách công khai sẽ thấy URL{' '}
          <code className='font-mono'>/p/[id]/[token]</code> sau khi publish.
        </span>
        <div className='ml-auto flex items-center gap-2'>
          <Link
            href={`/canvas-templates/${id}`}
            className='rounded-md border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-medium text-amber-900 hover:bg-amber-100'
          >
            Mở editor
          </Link>
        </div>
      </div>

      {/* Same render path as /p/[id]/[token] */}
      <main className='@container mx-auto flex w-full max-w-[1280px] flex-col gap-3 px-4 py-6 md:gap-4 md:py-10'>
        {visible.length === 0 ? (
          <div className='flex h-[60vh] items-center justify-center text-sm text-neutral-500'>
            Trang chưa có block hiển thị.
          </div>
        ) : (
          visible.map(block => {
            const content = block.contentVi.desktop;
            const styles = block.elementStyles?.desktop;
            const background = block.background?.desktop;
            const order = block.elementOrder?.desktop;
            const motion = block.motion?.desktop as BlockMotion | undefined;
            return (
              <MotionProvider key={block.id} mode='production' motion={motion}>
                <div data-block-id={block.id} data-block-type={block.blockType}>
                  <MotionBlockRoot className='overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/5'>
                    <RenderBlock
                      block={block}
                      content={content}
                      styles={styles}
                      background={background}
                      order={order}
                    />
                  </MotionBlockRoot>
                </div>
              </MotionProvider>
            );
          })
        )}
      </main>
    </div>
  );
}
