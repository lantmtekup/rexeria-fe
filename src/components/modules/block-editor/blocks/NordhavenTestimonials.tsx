import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  NordhavenTestimonialsContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface NordhavenTestimonialsProps {
  content: NordhavenTestimonialsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Nordhaven `.testimonials` — lưới card đánh giá nền tối (viền mảnh). 1/2/3. */
export function NordhavenTestimonials({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: NordhavenTestimonialsProps) {
  const styleOf = (k: string) =>
    composeStyle(
      elementStyleOf(styles, k),
      orderStyle(order, k),
      positionStyle(positions, k)
    );
  const items = Array.isArray(content.items) ? content.items : [];
  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-[#0e0e0e] px-6 py-16 text-white @2xl:px-12 @2xl:py-24',
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
              'text-2xs mb-3 block font-semibold tracking-[0.24em] text-white/40 uppercase'
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
            'max-w-2xl text-3xl font-medium tracking-tight @2xl:text-5xl'
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
              className='flex flex-col gap-6 rounded-lg border border-white/10 bg-[#141414] p-8'
            >
              <p className='text-base leading-relaxed text-white/85'>
                &ldquo;{it.quote}&rdquo;
              </p>
              <div className='mt-auto'>
                <div className='text-sm font-medium'>{it.name}</div>
                <div className='text-xs text-white/45'>{it.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
