'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  InteractiveGridContent,
} from '../types';
import { blockBackgroundStyle } from './applyStyle';

interface InteractiveGridProps {
  content: InteractiveGridContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Interactive Grid — lưới ảnh; hover 1 ô thì ô đó phóng to + sáng, các ô khác
 * mờ + co nhẹ (CSS group state). Thuần CSS/React, không lib. Port pattern
 * interactive-grid (CodeGrid nov2025). Touch → lưới thường.
 */
export function InteractiveGrid({
  content,
  background,
  className,
}: InteractiveGridProps) {
  const images = content.images ?? [];
  const [hover, setHover] = React.useState<number | null>(null);

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container w-full overflow-hidden rounded-md bg-[#0a0c10] p-4 duration-500 ease-out',
        className
      )}
    >
      <div className='grid grid-cols-2 gap-3 @md:grid-cols-3 @4xl:grid-cols-4'>
        {images.map((src, i) => {
          const isHover = hover === i;
          const dim = hover !== null && !isHover;
          return (
            <div
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg bg-white/5 transition-all duration-500 ease-out',
                isHover && 'z-10 scale-[1.06]',
                dim && 'scale-95 opacity-40'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=''
                loading='lazy'
                className={cn(
                  'h-full w-full object-cover transition-transform duration-700 ease-out',
                  isHover && 'scale-110'
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
