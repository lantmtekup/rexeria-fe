'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HoverGridRevealContent,
} from '../types';
import { blockBackgroundStyle, selectableClass } from './applyStyle';

interface HoverGridRevealProps {
  content: HoverGridRevealContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Hover Grid Reveal — port từ CodeGrid "vrtlvrld image hover" (046_…, vanilla).
 * Một ảnh phủ lưới ô trong suốt; rê con trỏ qua thì các ô sáng lên theo vệt
 * (blend hard-light vàng) rồi mờ dần — kết hợp overlay màu tạo tông ấm.
 *
 * Khác bản gốc: generate lưới động theo `cols/rows` (không hard-code), event
 * delegation trên container. Tôn trọng reduced-motion (lưới đứng yên).
 */
export function HoverGridReveal({
  content,
  background,
  activeKey,
  className,
}: HoverGridRevealProps) {
  const gridRef = React.useRef<HTMLDivElement>(null);
  const cols = content.cols ?? 16;
  const rows = content.rows ?? 11;
  const overlayColor = content.overlayColor ?? '#fd5530';
  const blockColor = content.blockColor ?? '#fff989';
  const resetMs = content.resetMs ?? 300;
  const total = cols * rows;

  React.useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (reduce) return;

    const timers = new Map<HTMLElement, number>();
    const onOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!t.classList.contains('hgr-block')) return;
      window.clearTimeout(timers.get(t));
      t.style.opacity = '0.75';
      timers.set(
        t,
        window.setTimeout(() => {
          t.style.opacity = '0';
        }, resetMs)
      );
    };
    grid.addEventListener('pointerover', onOver);
    return () => {
      grid.removeEventListener('pointerover', onOver);
      timers.forEach(id => window.clearTimeout(id));
    };
  }, [resetMs, total]);

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden rounded-md bg-neutral-950 p-6 duration-500 ease-out',
        className
      )}
    >
      <div className='relative aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-lg'>
        {content.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            data-element-key='imageUrl'
            src={content.imageUrl}
            alt=''
            className={selectableClass(
              activeKey === 'imageUrl',
              'absolute inset-0 h-full w-full object-cover'
            )}
          />
        )}
        {/* Overlay màu (blend screen). */}
        <div
          className='absolute inset-0'
          style={{ backgroundColor: overlayColor, mixBlendMode: 'screen' }}
        />
        {/* Lưới ô (blend hard-light). */}
        <div
          ref={gridRef}
          className='absolute inset-0 grid'
          style={{
            gridTemplateColumns: `repeat(${cols},1fr)`,
            gridTemplateRows: `repeat(${rows},1fr)`,
          }}
        >
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className='hgr-block'
              style={{
                backgroundColor: blockColor,
                mixBlendMode: 'hard-light',
                opacity: 0,
                transition: 'opacity 0.3s ease-in',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
