'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HousentTestimonialContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface HousentTestimonialProps {
  content: HousentTestimonialContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Housent `.testimonial-section` — "The Verdict Of Excellence": eyebrow pill +
 *  heading trái, subtitle phải, divider. Hàng ngang card quote phân cách đường
 *  dọc (scroll ngang), avatar + tên + vai trò ở đáy, nút prev/next góc phải. */
export function HousentTestimonial({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HousentTestimonialProps) {
  const styleOf = (k: string) =>
    composeStyle(
      elementStyleOf(styles, k),
      orderStyle(order, k),
      positionStyle(positions, k)
    );
  const items = Array.isArray(content.items) ? content.items : [];
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const scrollBy = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.5, behavior: 'smooth' });
  };
  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-[#f7f3ef] px-6 py-16 text-[#2b2621] @2xl:px-12 @2xl:py-24',
        className
      )}
    >
      <div className='mx-auto max-w-6xl'>
        <div className='flex flex-col gap-6 @2xl:flex-row @2xl:items-end @2xl:justify-between'>
          <div>
            {content.eyebrow ? (
              <span
                data-element-key='eyebrow'
                style={styleOf('eyebrow')}
                className={selectableClass(
                  activeKey === 'eyebrow',
                  'text-2xs mb-4 inline-flex items-center gap-2 rounded-full bg-[#e8622c]/10 px-3 py-1.5 font-semibold tracking-[0.24em] text-[#e8622c] uppercase'
                )}
              >
                <span className='size-1.5 rounded-full bg-[#e8622c]' />
                {content.eyebrow}
              </span>
            ) : null}
            <h2
              data-element-key='title'
              style={styleOf('title')}
              className={selectableClass(
                activeKey === 'title',
                'text-3xl font-semibold tracking-tight @2xl:text-5xl'
              )}
            >
              {content.title}
            </h2>
          </div>
          {content.subtitle ? (
            <p
              data-element-key='subtitle'
              style={styleOf('subtitle')}
              className={selectableClass(
                activeKey === 'subtitle',
                'max-w-xs text-sm leading-relaxed text-[#8a7f76]'
              )}
            >
              {content.subtitle}
            </p>
          ) : null}
        </div>

        <div className='mt-10 border-t border-[#2b2621]/10'>
          <div
            ref={scrollerRef}
            data-element-key='items'
            style={styleOf('items')}
            className={selectableClass(
              activeKey === 'items',
              'flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto [&::-webkit-scrollbar]:hidden'
            )}
          >
            {items.map((it, i) => (
              <div
                key={i}
                className='flex w-full shrink-0 snap-start flex-col justify-between gap-10 border-l border-[#2b2621]/10 py-10 pr-8 pl-8 first:border-l-0 first:pl-0 @xl:w-1/2 @3xl:w-1/2'
              >
                <p className='text-2xl leading-snug font-medium tracking-tight text-[#2b2621] @2xl:text-3xl'>
                  &ldquo;{it.quote}&rdquo;
                </p>
                <div className='flex items-center gap-3'>
                  {it.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.avatar}
                      alt={it.name}
                      className='size-11 rounded-lg object-cover'
                    />
                  ) : (
                    <span className='flex size-11 items-center justify-center rounded-lg bg-[#e8622c]/10 text-sm font-semibold text-[#e8622c]'>
                      {it.name.slice(0, 1)}
                    </span>
                  )}
                  <div>
                    <div className='text-base font-semibold text-[#2b2621]'>
                      {it.name}
                    </div>
                    <div className='text-sm text-[#8a7f76]'>{it.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-8 flex justify-end gap-3 border-t border-[#2b2621]/10 pt-6'>
          <button
            type='button'
            onClick={() => scrollBy(-1)}
            aria-label='Previous'
            className='flex size-11 items-center justify-center rounded-xl bg-white text-lg text-[#2b2621] transition-colors hover:bg-[#17120f] hover:text-white'
          >
            ←
          </button>
          <button
            type='button'
            onClick={() => scrollBy(1)}
            aria-label='Next'
            className='flex size-11 items-center justify-center rounded-xl bg-white text-lg text-[#2b2621] transition-colors hover:bg-[#17120f] hover:text-white'
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
