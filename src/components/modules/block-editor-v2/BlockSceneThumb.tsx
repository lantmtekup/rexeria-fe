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
 */
export function BlockSceneThumb({ block, lang }: { block: Block; lang: Lang }) {
  const langContent = lang === 'vi' ? block.contentVi : block.contentEn;
  const content = langContent.desktop;
  const styles = block.elementStyles?.desktop;
  const background = block.background?.desktop;
  const order = block.elementOrder?.desktop;
  const baseWidth = DEVICE_FRAME_WIDTH.desktop;
  const ref = React.useRef<HTMLDivElement | null>(null);
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(0.087);

  React.useEffect(() => {
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
  }, [baseWidth]);

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
    </div>
  );
}
