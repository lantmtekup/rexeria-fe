'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SeamlessScrollGalleryContent,
} from '../types';
import { blockBackgroundStyle, selectableClass } from './applyStyle';

interface SeamlessScrollGalleryProps {
  content: SeamlessScrollGalleryContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Seamless Scroll Gallery — port (đơn giản hoá) từ CodeGrid "infinite scroll"
 * (238_…). Dải ảnh chạy ngang liên tục, nhân đôi bộ ảnh nên loop liền mạch
 * không có điểm gãy; dừng khi hover.
 *
 * Bản gốc tự viết lerp + wrap phức tạp; ở đây dùng CSS keyframe (2 bản sao,
 * dịch -50%) cho chắc chạy + nhẹ. `prefers-reduced-motion` → đứng yên.
 */
export function SeamlessScrollGallery({
  content,
  background,
  activeKey,
  className,
}: SeamlessScrollGalleryProps) {
  const images = content.images ?? [];
  const seconds = content.seconds ?? 30;

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in relative w-full overflow-hidden rounded-md bg-[#0e1a16] py-10 duration-500 ease-out',
        className
      )}
    >
      {content.title && (
        <h2
          data-element-key='title'
          className={selectableClass(
            activeKey === 'title',
            'mb-6 px-8 text-2xl font-semibold tracking-tight text-white @2xl:text-4xl'
          )}
        >
          {content.title}
        </h2>
      )}

      <div className='group relative w-full overflow-hidden'>
        <div
          className='ssg-track flex w-max gap-5 group-hover:[animation-play-state:paused]'
          style={{ animation: `ssg ${seconds}s linear infinite` }}
        >
          {[...images, ...images].map((src, i) => (
            <div
              key={i}
              className='h-56 w-80 shrink-0 overflow-hidden rounded-xl @2xl:h-64 @2xl:w-96'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt='' className='h-full w-full object-cover' />
            </div>
          ))}
        </div>
      </div>

      <style>{`@media(prefers-reduced-motion:reduce){.ssg-track{animation:none!important}}@keyframes ssg{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
