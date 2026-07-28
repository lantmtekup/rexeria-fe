import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FirmaTestimonialContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FirmaTestimonialProps {
  content: FirmaTestimonialContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Firma testimonial — trích dẫn serif lớn căn giữa + hàng tên tác giả. */
export function FirmaTestimonial({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FirmaTestimonialProps) {
  const styleOf = (k: string) =>
    composeStyle(
      elementStyleOf(styles, k),
      orderStyle(order, k),
      positionStyle(positions, k)
    );
  const authors = content.authors ?? [];
  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-[#161514] px-6 py-20 text-center text-[#f4f2ee] @2xl:px-12 @2xl:py-28',
        className
      )}
    >
      <div className='mx-auto max-w-4xl'>
        <blockquote
          data-element-key='quote'
          style={styleOf('quote')}
          className={selectableClass(
            activeKey === 'quote',
            'font-serif text-2xl leading-snug font-medium @2xl:text-4xl'
          )}
        >
          &ldquo;{content.quote}&rdquo;
        </blockquote>
        <div className='mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-[#f4f2ee]/60'>
          {authors.map((a, i) => (
            <span key={i}>{a}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
