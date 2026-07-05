import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  LumeaTestimonialContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface LumeaTestimonialProps {
  content: LumeaTestimonialContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Lumea `.testimonial-section` — trích dẫn lớn căn giữa + tên + vai trò.
 *  Nền cream, serif. Responsive typography. */
export function LumeaTestimonial({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: LumeaTestimonialProps) {
  const styleOf = (k: string) =>
    composeStyle(
      elementStyleOf(styles, k),
      orderStyle(order, k),
      positionStyle(positions, k)
    );
  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-[#efe9e1] px-6 py-20 text-center @2xl:px-12 @2xl:py-32',
        className
      )}
    >
      <div className='mx-auto max-w-3xl'>
        <blockquote
          data-element-key='quote'
          style={styleOf('quote')}
          className={selectableClass(
            activeKey === 'quote',
            'font-serif text-2xl leading-snug font-medium text-[#2b241d] @2xl:text-4xl'
          )}
        >
          &ldquo;{content.quote}&rdquo;
        </blockquote>
        <div className='mt-8'>
          <div
            data-element-key='name'
            style={styleOf('name')}
            className={selectableClass(
              activeKey === 'name',
              'text-sm font-semibold tracking-wide text-[#2b241d] uppercase'
            )}
          >
            {content.name}
          </div>
          <div
            data-element-key='role'
            style={styleOf('role')}
            className={selectableClass(
              activeKey === 'role',
              'mt-1 text-xs text-[#a68a5b]'
            )}
          >
            {content.role}
          </div>
        </div>
      </div>
    </div>
  );
}
