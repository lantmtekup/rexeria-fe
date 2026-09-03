'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  Carousel3dContent,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { ImageCarousel } from './ImageCarousel';

interface Carousel3dProps {
  content: Carousel3dContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * 3D coverflow carousel. The "active" slide sits front-and-centre; the
 * neighbours are tilted away on the Y axis (-/+ rotateY) and pushed
 * slightly back on Z so they overlap behind the centre slide. Use the
 * regular `ImageCarousel` (Swiper) when `mode3d === 'flat'`.
 */
export function Carousel3d({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Carousel3dProps) {
  const slides = Array.isArray(content.slides) ? content.slides : [];
  const [index, setIndex] = React.useState(0);
  const perspective = content.perspectivePx ?? 1200;

  const goNext = React.useCallback(
    () => setIndex(i => (i + 1) % Math.max(slides.length, 1)),
    [slides.length]
  );

  // Autoplay if configured. Hook must run unconditionally (before early return).
  React.useEffect(() => {
    if (content.mode3d !== '3d-coverflow') return;
    const ms = content.autoplayMs ?? 0;
    if (!ms || slides.length === 0) return;
    const id = setInterval(goNext, ms);
    return () => clearInterval(id);
  }, [content.mode3d, content.autoplayMs, slides.length, goNext]);

  if (content.mode3d !== '3d-coverflow') {
    return (
      <ImageCarousel
        content={content}
        styles={styles}
        background={background}
        order={order}
        positions={positions}
        activeKey={activeKey}
        className={className}
      />
    );
  }

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const sEyebrow = styleOf('eyebrow');
  const sTitle = styleOf('title');
  const sDescription = styleOf('description');
  const sSlides = styleOf('slides');

  const goPrev = () => setIndex(i => (i - 1 + slides.length) % slides.length);

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in flex w-full flex-col gap-5 rounded-md bg-neutral-950 px-6 py-10 text-white duration-500 @2xl:px-12 @2xl:py-14',
        className
      )}
    >
      {(content.eyebrow || content.title || content.description) && (
        <div className='flex flex-col items-center gap-2 text-center'>
          {content.eyebrow && (
            <span
              data-element-key='eyebrow'
              style={sEyebrow}
              className={selectableClass(
                activeKey === 'eyebrow',
                'text-3xs font-semibold tracking-[0.32em] text-white/60 uppercase'
              )}
            >
              {content.eyebrow}
            </span>
          )}
          {content.title && (
            <h2
              data-element-key='title'
              style={sTitle}
              className={selectableClass(
                activeKey === 'title',
                'text-2xl font-semibold tracking-tight @2xl:text-3xl'
              )}
            >
              {content.title}
            </h2>
          )}
          {content.description && (
            <p
              data-element-key='description'
              style={sDescription}
              className={selectableClass(
                activeKey === 'description',
                'max-w-[60ch] text-sm text-white/70'
              )}
            >
              {content.description}
            </p>
          )}
        </div>
      )}

      <div
        data-element-key='slides'
        style={sSlides}
        className={selectableClass(
          activeKey === 'slides',
          'relative aspect-[16/9] w-full overflow-hidden'
        )}
      >
        <div
          className='relative size-full'
          style={{
            perspective: `${perspective}px`,
            perspectiveOrigin: '50% 50%',
          }}
        >
          {slides.map((slide, i) => {
            // Offset from active slide; -1 = previous, 0 = active, 1 = next.
            // Loop the comparison so wrap-around still looks like a coverflow.
            const half = Math.floor(slides.length / 2);
            let delta = i - index;
            if (delta > half) delta -= slides.length;
            if (delta < -half) delta += slides.length;
            const rotate = delta * 35;
            const translateX = delta * 40; // %
            const translateZ = delta === 0 ? 0 : -180;
            const opacity =
              Math.abs(delta) > 2 ? 0 : 1 - Math.abs(delta) * 0.25;
            return (
              <div
                key={slide.id}
                onClick={() => setIndex(i)}
                aria-label={slide.caption ?? slide.altText ?? ''}
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${-rotate}deg)`,
                  transformStyle: 'preserve-3d',
                  transformOrigin: '50% 50%',
                  transition:
                    'transform 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 400ms ease',
                  opacity,
                  zIndex: 10 - Math.abs(delta),
                  cursor: delta !== 0 ? 'pointer' : 'default',
                }}
                className='overflow-hidden rounded-md shadow-2xl ring-1 ring-white/10'
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.imageUrl}
                  alt={slide.altText ?? slide.caption ?? ''}
                  draggable={false}
                  className='pointer-events-none size-full object-cover'
                />
                {slide.caption && delta === 0 && (
                  <span className='absolute right-4 bottom-4 left-4 rounded bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur'>
                    {slide.caption}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Nav arrows */}
        {slides.length > 1 && content.showNavArrows !== false && (
          <>
            <button
              type='button'
              onClick={goPrev}
              aria-label='Slide trước'
              className='absolute top-1/2 left-3 z-20 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30'
            >
              <ChevronLeft className='size-4' />
            </button>
            <button
              type='button'
              onClick={goNext}
              aria-label='Slide kế'
              className='absolute top-1/2 right-3 z-20 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30'
            >
              <ChevronRight className='size-4' />
            </button>
          </>
        )}

        {/* Pagination dots */}
        {slides.length > 1 && content.showPagination !== false && (
          <div className='absolute right-0 bottom-3 left-0 z-20 flex items-center justify-center gap-1.5'>
            {slides.map((_, i) => (
              <button
                key={i}
                type='button'
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={cn(
                  'h-1.5 cursor-pointer rounded-full transition-all',
                  i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
