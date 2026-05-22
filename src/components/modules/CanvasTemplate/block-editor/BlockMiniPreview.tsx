'use client';

/**
 * Static, scaled-down preview of a saved block. Renders the same component
 * tree the public landing page uses, but at a fixed `RENDER_WIDTH` and then
 * CSS-scales the result to fit whatever container size the caller gives us.
 *
 * Motion is disabled (`mode='edit'`) so the preview doesn't animate while
 * the user is scrolling a grid of cards. Interactions are killed via
 * `pointer-events: none` + `select: none` so clicks pass through to the
 * card wrapper.
 */

import * as React from 'react';

import { cn } from '@/lib/cn';

import { RenderBlock } from './blocks/renderBlock';
import { MotionBlockRoot, MotionProvider } from './motion/runtime';
import type { Block } from './types';

/** Render width the canvas editor assumes for blocks. */
const RENDER_WIDTH = 800;

export interface BlockMiniPreviewProps {
  block: Block;
  /** Aspect ratio of the preview frame (string for CSS). Default "4 / 3". */
  aspect?: string;
  className?: string;
}

class PreviewErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { errored: boolean }
> {
  state = { errored: false };
  static getDerivedStateFromError() {
    return { errored: true };
  }
  componentDidCatch(err: unknown) {
    // Surface to console so we can debug bad saved-block payloads without
    // breaking the whole library page.
    // eslint-disable-next-line no-console
    console.warn('[BlockMiniPreview] render failed', err);
  }
  render() {
    return this.state.errored ? this.props.fallback : this.props.children;
  }
}

export function BlockMiniPreview({
  block,
  aspect = '4 / 3',
  className,
}: BlockMiniPreviewProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0.3);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) setScale(w / RENDER_WIDTH);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const content = block.contentVi?.desktop;
  const styles = block.elementStyles?.desktop;
  const background = block.background?.desktop;
  const order = block.elementOrder?.desktop;
  const positions = block.elementPositions?.desktop;

  // Without `contentVi.desktop` the block was either freshly stubbed or the
  // saved payload was corrupted — bail to fallback so we don't crash the
  // whole grid trying to render `undefined`.
  if (!content) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-[10px] text-zinc-400',
          className
        )}
        style={{ aspectRatio: aspect }}
      >
        no preview
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden bg-white', className)}
      style={{ aspectRatio: aspect }}
    >
      <div
        className='pointer-events-none absolute top-0 left-0 origin-top-left select-none'
        style={{
          width: `${RENDER_WIDTH}px`,
          transform: `scale(${scale})`,
        }}
      >
        <PreviewErrorBoundary
          fallback={
            <div className='flex h-[600px] items-center justify-center text-xs text-zinc-400'>
              render error
            </div>
          }
        >
          <MotionProvider mode='edit'>
            <MotionBlockRoot>
              <RenderBlock
                block={block}
                content={content}
                styles={styles}
                background={background}
                order={order}
                positions={positions}
              />
            </MotionBlockRoot>
          </MotionProvider>
        </PreviewErrorBoundary>
      </div>
    </div>
  );
}
