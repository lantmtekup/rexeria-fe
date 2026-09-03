'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  StorySlidesContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface StorySlidesProps {
  content: StorySlidesContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Story Slides — slide tự chạy kiểu IG-stories: ảnh nền + tiêu đề, thanh index
 * trên đầu chạy đầy theo thời gian rồi sang slide kế; bấm thanh để nhảy. Mô hình
 * B (tự chạy, vanilla + CSS), tôn trọng `prefers-reduced-motion` (đứng yên).
 * Port pattern StorySlides (CodeGrid oct2025).
 */
export function StorySlides({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: StorySlidesProps) {
  const slides = Array.isArray(content.slides) ? content.slides : [];
  const duration = content.duration ?? 4000;
  const [active, setActive] = React.useState(0);
  const [reduced, setReduced] = React.useState(false);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  React.useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  React.useEffect(() => {
    if (reduced || slides.length <= 1) return;
    const t = setTimeout(
      () => setActive(a => (a + 1) % slides.length),
      duration
    );
    return () => clearTimeout(t);
  }, [active, duration, reduced, slides.length]);

  if (!slides.length) return null;

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container relative aspect-[16/10] w-full overflow-hidden rounded-md bg-black duration-500 ease-out @2xl:aspect-[21/9]',
        className
      )}
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={i}
          className={cn(
            'absolute inset-0 transition-opacity duration-700 ease-out',
            i === active ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.imageUrl}
            alt={s.title}
            className='h-full w-full object-cover'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30' />
          <div className='absolute right-6 bottom-6 left-6 @2xl:right-10 @2xl:left-10'>
            <h3
              data-element-key={i === active ? 'title' : undefined}
              style={i === active ? styleOf('title') : undefined}
              className={selectableClass(
                i === active && activeKey === 'title',
                'text-2xl font-bold tracking-tight text-white @2xl:text-4xl'
              )}
            >
              {s.title}
            </h3>
            {s.subtitle && (
              <p className='mt-1 text-sm text-white/70 @2xl:text-base'>
                {s.subtitle}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Index progress bars */}
      <div className='absolute top-4 right-6 left-6 flex gap-1.5 @2xl:right-10 @2xl:left-10'>
        {slides.map((_, i) => (
          <button
            key={i}
            type='button'
            onClick={() => setActive(i)}
            aria-label={`Slide ${i + 1}`}
            className='relative h-1 flex-1 overflow-hidden rounded-full bg-white/30'
          >
            <span
              className='absolute inset-y-0 left-0 rounded-full bg-white'
              style={{
                width: i < active ? '100%' : i === active ? '100%' : '0%',
                transition:
                  i === active && !reduced
                    ? `width ${duration}ms linear`
                    : 'none',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
