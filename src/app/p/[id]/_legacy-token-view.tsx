'use client';

/**
 * Legacy share-token view — `/p/{templateId}/{shareToken}`.
 *
 * Was its own `[token]/page.tsx` route. It had to stop being a route: a
 * sibling `[...path]` catch-all builds fine next to `[token]`, but Next sorts
 * `'[]'` before `'[...]'` and matches first-wins, so `[token]` would swallow
 * every 2-segment URL — including every `/p/{slug}/{sub-page}` — and render
 * "Trang này chưa được xuất bản". Nothing in the build catches that.
 *
 * It is now a plain component that `[...path]/page.tsx` dispatches to when the
 * URL looks like a share-token link (UUID + token) and no sub-page matches.
 */

import * as React from 'react';
import Link from 'next/link';
import { Globe2 } from 'lucide-react';

import { Spinner } from '@/components/atoms/spinner';
import { AuthHydrator } from '@/components/modules/Auth/AuthHydrator';
import { StatsAnnotationOverlay } from '@/components/modules/Analytics/StatsAnnotationOverlay';
import { useBlockTracking, useInitTracker } from '@/lib/analytics/use-tracker';
import { RenderBlock } from '@/components/modules/block-editor/blocks/renderBlock';
import {
  MotionBlockRoot,
  MotionProvider,
} from '@/components/modules/block-editor/motion/runtime';
import type { BlockMotion } from '@/components/modules/block-editor/motion/types';
import {
  parseCanvas,
  type BlockEditorCanvas,
} from '@/components/modules/block-editor/serialize';
import type { BlockSignalConfig } from '@/components/modules/block-editor/types';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';

interface LegacyTokenViewProps {
  /** Canvas-template UUID (the first URL segment). */
  id: string;
  /** Share token minted by `newShareToken()`. */
  token: string;
}

const LOAD_TIMEOUT_MS = 8000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const tid = setTimeout(() => reject(new Error(`Timeout (${ms}ms)`)), ms);
    p.then(
      v => {
        clearTimeout(tid);
        resolve(v);
      },
      e => {
        clearTimeout(tid);
        reject(e);
      }
    );
  });
}

export function LegacyTokenView({ id, token }: LegacyTokenViewProps) {
  const [canvas, setCanvas] = React.useState<BlockEditorCanvas | null>(null);
  const [status, setStatus] = React.useState<
    'loading' | 'ok' | 'not-published' | 'wrong-token' | 'error'
  >('loading');
  const [errorDetail, setErrorDetail] = React.useState<string | null>(null);

  // `block.signal` (Signal panel config) → visitor tracker, so it can gate
  // block/element events on opt-in instead of tracking everything blindly.
  // `canvas` loads async, so this starts empty and updates once it resolves
  // — `useBlockTracking` reads it through a ref, no re-wiring needed.
  const signalByBlockId = React.useMemo(() => {
    const map: Record<string, BlockSignalConfig> = {};
    for (const block of canvas?.blocks ?? []) {
      if (block.signal) map[block.id] = block.signal;
    }
    return map;
  }, [canvas]);

  // Visitor analytics — page_view + block_view/dwell + click + scroll_depth.
  // `id` là page UUID của canvas đang xem (canvas instance ≡ page) — ingest
  // chỉ nhận page_id (be-fe-handoff Q5).
  useInitTracker(id);
  useBlockTracking(signalByBlockId);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus('loading');
      try {
        // Public endpoint — no auth, BE validates share_token. Returns
        // 404 (caught below) when canvas is unpublished or token wrong.
        const resp = await withTimeout(
          rexerApi.canvasTemplates.getPublicCanvas(id, token),
          LOAD_TIMEOUT_MS
        );
        if (cancelled) return;
        const parsed = parseCanvas(resp?.canvas_data);
        if (!parsed) {
          setStatus('not-published');
          return;
        }
        setCanvas(parsed);
        setStatus('ok');
      } catch (err) {
        if (cancelled) return;
        // 404 from BE = unpublished or wrong token. Show the friendly
        // "not published" state instead of the generic error screen.
        if (err instanceof RxApiError && err.status === 404) {
          setStatus('not-published');
          return;
        }
        const msg =
          err instanceof RxApiError
            ? err.message || err.code
            : err instanceof Error
              ? err.message
              : 'Lỗi';
        setErrorDetail(msg);
        setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  if (status === 'loading') {
    return (
      <div className='flex h-screen items-center justify-center bg-neutral-100'>
        <Spinner size={28} />
      </div>
    );
  }

  if (status === 'not-published' || status === 'wrong-token') {
    return <NotPublishedState />;
  }

  if (status === 'error') {
    return (
      <div className='flex h-screen items-center justify-center bg-neutral-100 px-6 text-center'>
        <div className='max-w-md'>
          <h1 className='text-foreground text-xl font-semibold'>
            Không tải được trang
          </h1>
          <p className='mt-2 text-sm text-neutral-500'>{errorDetail}</p>
        </div>
      </div>
    );
  }

  const visible = canvas?.blocks.filter(b => b.isVisible) ?? [];

  return (
    <>
      <AuthHydrator />
      <StatsAnnotationOverlay templateId={id}>
        <div className='relative flex min-h-screen flex-col bg-neutral-50'>
          <main className='@container mx-auto flex w-full max-w-[1280px] flex-col gap-3 px-4 py-6 md:gap-4 md:py-10'>
            {visible.length === 0 ? (
              <div className='flex h-[60vh] items-center justify-center text-sm text-neutral-500'>
                Trang chưa có block hiển thị.
              </div>
            ) : (
              visible.map(block => {
                // Public view always renders desktop variant. Container queries
                // inside the block templates handle responsive scaling based on
                // the actual viewport (real device width).
                const content = block.contentVi.desktop;
                const styles = block.elementStyles?.desktop;
                const background = block.background?.desktop;
                const order = block.elementOrder?.desktop;
                const motion = block.motion?.desktop as BlockMotion | undefined;
                return (
                  <MotionProvider
                    key={block.id}
                    mode='production'
                    motion={motion}
                  >
                    <div
                      data-block-id={block.id}
                      data-block-type={block.blockType}
                    >
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

          <footer className='text-3xs border-t border-neutral-200 bg-white px-6 py-4 text-center tracking-widest text-neutral-400 uppercase'>
            Tạo bằng REXER · {visible.length} block
          </footer>
        </div>
      </StatsAnnotationOverlay>
    </>
  );
}

function NotPublishedState() {
  return (
    <div className='flex h-screen items-center justify-center bg-neutral-100 px-6 text-center'>
      <div className='max-w-md'>
        <span className='inline-flex size-14 items-center justify-center rounded-2xl bg-neutral-900/5 text-neutral-700'>
          <Globe2 className='size-6' />
        </span>
        <h1 className='text-foreground mt-4 text-xl font-semibold'>
          Trang này chưa được xuất bản
        </h1>
        <p className='mt-2 text-sm text-neutral-500'>
          Link bạn đang truy cập không hoạt động — có thể chủ sở hữu đã ngưng
          xuất bản hoặc đã đổi link mới.
        </p>
        <Link
          href='/'
          className='mt-4 inline-flex items-center gap-1 text-xs font-medium text-neutral-700 underline hover:text-neutral-900'
        >
          Về trang chủ REXER
        </Link>
      </div>
    </div>
  );
}
