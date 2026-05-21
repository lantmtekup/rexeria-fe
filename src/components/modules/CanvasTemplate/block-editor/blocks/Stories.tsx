'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  StoriesContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface StoriesProps {
  content: StoriesContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Instagram-style Stories block. Vertical 9:16-ish panel that auto-advances
 * across `slides[]`. Tap left edge = previous, tap right edge = next, tap
 * centre = pause/resume. At the end the block loops or holds based on
 * `loop` config.
 *
 * Animation is purely a single requestAnimationFrame loop driving the
 * progress bar + advancing the active slide; no external library needed.
 */
export function Stories({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: StoriesProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const sEyebrow = styleOf('eyebrow');
  const sTitle = styleOf('title');
  const sSlides = styleOf('slides');

  const slides = content.slides ?? [];
  const defaultDur = content.defaultDurationMs ?? 4500;
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [progress, setProgress] = React.useState(0); // 0..1 for current slide
  const rafRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number>(0);

  // Reset progress when index changes.
  React.useEffect(() => {
    setProgress(0);
    startRef.current = performance.now();
  }, [index]);

  // RAF loop drives progress + auto-advance.
  React.useEffect(() => {
    if (slides.length === 0 || paused) return;
    const dur = slides[index]?.durationMs ?? defaultDur;
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const p = Math.min(1, elapsed / Math.max(1, dur));
      setProgress(p);
      if (p >= 1) {
        if (index < slides.length - 1) {
          setIndex(i => i + 1);
        } else if (content.loop) {
          setIndex(0);
        } else {
          setPaused(true); // hold on last frame
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    rafRef.current = raf;
    return () => cancelAnimationFrame(raf);
  }, [index, paused, slides, defaultDur, content.loop]);

  const current = slides[index];
  const showProgress = content.showProgress !== false;

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in relative w-full overflow-hidden rounded-md bg-neutral-950 text-white duration-500 ease-out',
        className
      )}
    >
      {(content.eyebrow || content.title) && (
        <div className='flex flex-col gap-1 px-5 pt-4 pb-3 @2xl:px-8 @2xl:pt-6'>
          {content.eyebrow && (
            <span
              data-element-key='eyebrow'
              style={sEyebrow}
              className={selectableClass(
                activeKey === 'eyebrow',
                'text-[10px] font-semibold tracking-[0.32em] text-white/60 uppercase @2xl:text-[11px]'
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
                'text-xl font-semibold tracking-tight @2xl:text-2xl'
              )}
            >
              {content.title}
            </h2>
          )}
        </div>
      )}

      {/* Story canvas — 9:16 on mobile, 16:9 on desktop for editor readability. */}
      <div
        data-element-key='slides'
        style={sSlides}
        className={selectableClass(
          activeKey === 'slides',
          'group relative aspect-[9/16] w-full overflow-hidden bg-neutral-900 @2xl:aspect-[16/9]'
        )}
      >
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.mediaUrl}
            alt={current.title ?? ''}
            draggable={false}
            className='pointer-events-none absolute inset-0 size-full object-cover'
          />
        ) : (
          <div className='absolute inset-0 grid place-items-center text-xs text-white/50'>
            Chưa có slide
          </div>
        )}

        {/* Gradient overlay for text legibility. */}
        <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />

        {/* Progress bars (top) */}
        {showProgress && slides.length > 0 && (
          <div className='absolute top-3 right-3 left-3 z-10 flex gap-1.5'>
            {slides.map((_, i) => (
              <div
                key={i}
                className='h-0.5 flex-1 overflow-hidden rounded-full bg-white/25'
              >
                <div
                  className='h-full bg-white transition-[width] duration-100'
                  style={{
                    width:
                      i < index
                        ? '100%'
                        : i === index
                          ? `${progress * 100}%`
                          : '0%',
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Title + body + CTA bottom-left */}
        {current && (current.title || current.body || current.ctaText) && (
          <div className='absolute right-5 bottom-5 left-5 z-10 flex flex-col gap-2 text-white'>
            {current.title && (
              <p className='text-lg leading-tight font-semibold drop-shadow-md @2xl:text-2xl'>
                {current.title}
              </p>
            )}
            {current.body && (
              <p className='line-clamp-3 text-sm text-white/85 @2xl:text-base'>
                {current.body}
              </p>
            )}
            {current.ctaText && (
              <a
                href={current.ctaUrl || '#'}
                onClick={e => e.preventDefault()}
                className='rounded-pill mt-1 inline-flex h-9 w-fit items-center bg-white px-4 text-xs font-semibold text-neutral-900 hover:bg-neutral-100'
              >
                {current.ctaText}
              </a>
            )}
          </div>
        )}

        {/* Tap zones */}
        {slides.length > 1 && (
          <>
            <button
              type='button'
              aria-label='Slide trước'
              onClick={() => setIndex(i => Math.max(0, i - 1))}
              className='absolute top-0 bottom-0 left-0 z-20 w-1/3 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100'
            >
              <span className='absolute top-1/2 left-3 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur'>
                <ChevronLeft className='size-4' />
              </span>
            </button>
            <button
              type='button'
              aria-label='Slide kế'
              onClick={() =>
                setIndex(i =>
                  i < slides.length - 1 ? i + 1 : content.loop ? 0 : i
                )
              }
              className='absolute top-0 right-0 bottom-0 z-20 w-1/3 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100'
            >
              <span className='absolute top-1/2 right-3 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur'>
                <ChevronRight className='size-4' />
              </span>
            </button>
            <button
              type='button'
              aria-label={paused ? 'Tiếp tục' : 'Tạm dừng'}
              onClick={() => setPaused(p => !p)}
              className='absolute top-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100'
            >
              {paused ? (
                <Play className='size-3' />
              ) : (
                <Pause className='size-3' />
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
