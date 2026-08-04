'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';

import type { Block as EditorBlock } from '@/components/modules/block-editor/types';
import { parseEditorBlock } from '@/lib/portal-v2/exchange/parseEditorBlock';
import { rexerApi } from '@/services/rexer/endpoints';

const BlockMiniPreview = dynamic(
  () =>
    import('@/components/modules/block-editor/BlockMiniPreview').then(m => ({
      default: m.BlockMiniPreview,
    })),
  { ssr: false }
);

const parsedBlockCache = new Map<string, EditorBlock>();
const inflightByBlockId = new Map<string, Promise<EditorBlock | null>>();

const fetchParsedBlock = (blockId: string): Promise<EditorBlock | null> => {
  const cached = parsedBlockCache.get(blockId);
  if (cached) return Promise.resolve(cached);

  const inflight = inflightByBlockId.get(blockId);
  if (inflight) return inflight;

  const request = rexerApi.blocks
    .get(blockId)
    .then(apiBlock => {
      const editor = parseEditorBlock(apiBlock.settings);
      if (editor) parsedBlockCache.set(blockId, editor);
      return editor;
    })
    .catch(() => null)
    .finally(() => {
      inflightByBlockId.delete(blockId);
    });

  inflightByBlockId.set(blockId, request);
  return request;
};

type LazyBlockCoverPreviewProps = {
  blockId: string;
  fallback: React.ReactNode;
  /** Skip IntersectionObserver — use in modal where the cover is always visible. */
  eager?: boolean;
  className?: string;
};

export const LazyBlockCoverPreview = ({
  blockId,
  fallback,
  eager = false,
  className,
}: LazyBlockCoverPreviewProps) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(eager);
  const [editorBlock, setEditorBlock] = React.useState<EditorBlock | null>(
    () => parsedBlockCache.get(blockId) ?? null
  );

  React.useEffect(() => {
    if (eager) {
      setVisible(true);
      return;
    }

    const box = ref.current;
    if (!box) return;

    let cancelIdle: (() => void) | null = null;
    const schedule = () => {
      if (typeof window.requestIdleCallback === 'function') {
        const id = window.requestIdleCallback(() => setVisible(true), {
          timeout: 500,
        });
        cancelIdle = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(() => setVisible(true), 80);
        cancelIdle = () => window.clearTimeout(id);
      }
    };

    const io = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      io.disconnect();
      schedule();
    });
    io.observe(box);
    return () => {
      io.disconnect();
      cancelIdle?.();
    };
  }, [eager]);

  React.useEffect(() => {
    if (!visible) return;

    const cached = parsedBlockCache.get(blockId);
    if (cached) {
      setEditorBlock(cached);
      return;
    }

    let cancelled = false;
    void fetchParsedBlock(blockId).then(block => {
      if (!cancelled) setEditorBlock(block);
    });
    return () => {
      cancelled = true;
    };
  }, [blockId, visible]);

  return (
    <div ref={ref} className={className}>
      {editorBlock ? (
        <div className='pointer-events-none absolute inset-0' aria-hidden>
          <BlockMiniPreview
            block={editorBlock}
            aspect='auto'
            className='size-full'
          />
        </div>
      ) : (
        fallback
      )}
    </div>
  );
};
