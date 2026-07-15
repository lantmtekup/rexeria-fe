'use client';

import * as React from 'react';

import { RenderBlock } from './blocks/renderBlock';
import type { Block, Lang } from './types';

/** Mini preview cho tab block — dùng chung BlockTabBar + BlockSceneRail. */
export function BlockSceneThumb({ block, lang }: { block: Block; lang: Lang }) {
  const langContent = lang === 'vi' ? block.contentVi : block.contentEn;
  const content = langContent.desktop;
  const styles = block.elementStyles?.desktop;
  const background = block.background?.desktop;
  const order = block.elementOrder?.desktop;
  const baseWidth = 1280;
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(0.087);

  React.useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const w = entry.contentRect.width;
      setScale(Math.max(0.04, w / baseWidth));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const inner = (
    <RenderBlock
      block={block}
      content={content}
      styles={styles}
      background={background}
      order={order}
      fallback={
        <div className='text-3xs flex aspect-[16/9] w-full items-center justify-center bg-neutral-100 font-semibold tracking-widest text-neutral-400 uppercase'>
          {block.name}
        </div>
      }
    />
  );

  return (
    <div ref={ref} className='absolute inset-0 overflow-hidden'>
      <div
        className='origin-top-left'
        style={{
          width: baseWidth,
          transform: `scale(${scale})`,
        }}
      >
        {inner}
      </div>
    </div>
  );
}
