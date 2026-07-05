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

/** Housent `.testimonial-section` — "The Verdict Of Excellence": lưới card
 *  đánh giá (quote + tên + vai trò + avatar). Responsive 1/2/3 cột. */
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
  const items = content.items ?? [];
  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-[#f7f3ef] px-6 py-16 @2xl:px-12 @2xl:py-24',
        className
      )}
    >
      <div className='mx-auto max-w-6xl'>
        {content.eyebrow ? (
          <span
            data-element-key='eyebrow'
            style={styleOf('eyebrow')}
            className={selectableClass(
              activeKey === 'eyebrow',
              'text-2xs mb-3 block font-semibold tracking-[0.24em] text-[#e8622c] uppercase'
            )}
          >
            {content.eyebrow}
          </span>
        ) : null}
        <h2
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'max-w-2xl text-3xl font-semibold tracking-tight text-[#2b2621] @2xl:text-5xl'
          )}
        >
          {content.title}
        </h2>
        <div
          data-element-key='items'
          style={styleOf('items')}
          className={selectableClass(
            activeKey === 'items',
            'mt-12 grid grid-cols-1 gap-6 @xl:grid-cols-2 @3xl:grid-cols-3'
          )}
        >
          {items.map((it, i) => (
            <div
              key={i}
              className='flex flex-col gap-6 rounded-2xl bg-white p-8'
            >
              <p className='text-base leading-relaxed text-[#2b2621]'>
                &ldquo;{it.quote}&rdquo;
              </p>
              <div className='mt-auto flex items-center gap-3'>
                <span className='flex h-11 w-11 items-center justify-center rounded-full bg-[#e8622c]/10 text-sm font-semibold text-[#e8622c]'>
                  {it.name.slice(0, 1)}
                </span>
                <div>
                  <div className='text-sm font-semibold text-[#2b2621]'>
                    {it.name}
                  </div>
                  <div className='text-xs text-[#8a7f76]'>{it.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
