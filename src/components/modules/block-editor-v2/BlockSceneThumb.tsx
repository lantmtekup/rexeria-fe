'use client';

import * as React from 'react';

import { DEVICE_FRAME_WIDTH } from '@/components/modules/block-editor/deviceFrame';
import { RenderBlock } from '@/components/modules/block-editor/blocks/renderBlock';
import type { Block, Lang } from '@/components/modules/block-editor/types';

/**
 * Mini preview cho tab block — dùng chung BlockTabBar + BlockSceneRail.
 *
 * Scales to COVER the box, not to fit it. Scaling on width alone (which is what
 * this did) left a band of empty page under any block shorter than the box, and
 * that band was most of the thumbnail for short blocks. Cover crops instead:
 * a tall block shows its top, which is the part you recognise it by.
 *
 * Memoized + lazily mounted. Each thumb renders the REAL block tree at 1440px,
 * so a page switch used to render the whole page twice (canvas + N thumbs) in
 * one synchronous commit — that was the "cả page giật" report. Now the thumb
 * shows a name placeholder until its box is on screen AND the main thread is
 * idle, so the canvas paints first and thumbs fill in behind it.
 */
export const BlockSceneThumb = React.memo(function BlockSceneThumb({
  block,
  lang,
}: {
  block: Block;
  lang: Lang;
}) {
  const langContent = lang === 'vi' ? block.contentVi : block.contentEn;
  const content = langContent.desktop;
  const styles = block.elementStyles?.desktop;
  const background = block.background?.desktop;
  const order = block.elementOrder?.desktop;
  const baseWidth = DEVICE_FRAME_WIDTH.desktop;
  const ref = React.useRef<HTMLDivElement | null>(null);
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(0.087);
  const [ready, setReady] = React.useState(false);

  // Mount the heavy subtree only once visible, and only on an idle slice —
  // several thumbs becoming visible together still mount one per idle slot
  // instead of all in the frame the page canvas is trying to paint in.
  React.useEffect(() => {
    if (ready) return;
    const box = ref.current;
    if (!box) return;

    let cancelIdle: (() => void) | null = null;
    const schedule = () => {
      if (typeof window.requestIdleCallback === 'function') {
        const id = window.requestIdleCallback(() => setReady(true), {
          timeout: 500,
        });
        cancelIdle = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(() => setReady(true), 80);
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
  }, [ready]);

  React.useEffect(() => {
    if (!ready) return;
    const box = ref.current;
    const inner = innerRef.current;
    if (!box || !inner) return;

    const measure = () => {
      const { width, height } = box.getBoundingClientRect();
      if (!width || !height) return;
      // offsetHeight is the UNSCALED height — the transform lives on this same
      // element, and layout boxes are measured before transforms apply.
      const naturalHeight = inner.offsetHeight;
      const byWidth = width / baseWidth;
      const byHeight = naturalHeight > 0 ? height / naturalHeight : 0;
      setScale(Math.max(0.04, byWidth, byHeight));
    };

    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(inner);
    measure();
    return () => ro.disconnect();
  }, [baseWidth, ready]);

  const placeholder = (
    <div className='text-3xs absolute inset-0 flex items-center justify-center truncate bg-neutral-100 px-1 font-semibold tracking-widest text-neutral-400 uppercase'>
      {block.name}
    </div>
  );

  const inner = (
    <RenderBlock
      block={block}
      content={content}
      styles={styles}
      background={background}
      order={order}
      fallback={
        <div className='text-3xs flex aspect-video w-full items-center justify-center bg-neutral-100 font-semibold tracking-widest text-neutral-400 uppercase'>
          {block.name}
        </div>
      }
    />
  );

  return (
    <div ref={ref} className='absolute inset-0 overflow-hidden'>
      {ready ? (
        <div
          ref={innerRef}
          className='absolute top-0 left-1/2 origin-top'
          style={{
            width: baseWidth,
            // translate before scale: the -50% is in unscaled units, which is
            // what centres the 1440px page inside a much narrower box.
            transform: `translateX(-50%) scale(${scale})`,
          }}
        >
          {inner}
        </div>
      ) : (
        placeholder
      )}
    </div>
  );
});
