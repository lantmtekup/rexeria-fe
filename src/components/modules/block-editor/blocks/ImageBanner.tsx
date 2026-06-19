'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  ImageBannerContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface ImageBannerProps {
  content: ImageBannerContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Image Banner — ảnh nền full-bleed + heading/description reveal fade-up khi vào
 * màn (IntersectionObserver). Port ImageBanner (CodeGrid feb2026). reduced-motion
 * → hiện ngay.
 */
export function ImageBanner({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: ImageBannerProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reveal = () => root.setAttribute('data-in', '');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveal();
      return;
    }
    const io = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && reveal()),
      { threshold: 0.3 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        'group animate-in fade-in @container relative flex min-h-[60vh] w-full items-center overflow-hidden rounded-md duration-500 ease-out',
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={content.imageUrl}
        alt=''
        className='absolute inset-0 h-full w-full object-cover'
      />
      <div className='absolute inset-0 bg-black/45' />
      <div className='relative z-10 max-w-2xl px-8 @2xl:px-16'>
        <h2
          data-element-key='heading'
          style={styleOf('heading')}
          className={selectableClass(
            activeKey === 'heading',
            'translate-y-6 text-4xl font-bold tracking-tight text-white opacity-0 transition-[opacity,transform] duration-700 ease-out group-data-[in]:translate-y-0 group-data-[in]:opacity-100 @2xl:text-6xl'
          )}
        >
          {content.heading}
        </h2>
        {content.description && (
          <p className='mt-4 translate-y-6 text-base leading-relaxed text-white/80 opacity-0 transition-[opacity,transform] delay-150 duration-700 ease-out group-data-[in]:translate-y-0 group-data-[in]:opacity-100'>
            {content.description}
          </p>
        )}
      </div>
    </div>
  );
}
