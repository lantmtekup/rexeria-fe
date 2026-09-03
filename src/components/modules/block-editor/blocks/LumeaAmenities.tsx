import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  LumeaAmenitiesContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface LumeaAmenitiesProps {
  content: LumeaAmenitiesContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Lumea `.elevated-section` — "Exclusive Amenities": heading serif + lưới
 *  tiện ích (tiêu đề + mô tả). Nền nâu đậm. Responsive 1/2/3 cột. */
export function LumeaAmenities({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: LumeaAmenitiesProps) {
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
        '@container w-full bg-[#2b241d] px-6 py-16 text-white @2xl:px-12 @2xl:py-24',
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
              'text-2xs mb-4 block font-semibold tracking-[0.28em] text-[#a68a5b] uppercase'
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
            'max-w-3xl font-serif text-3xl leading-tight font-medium @2xl:text-5xl'
          )}
        >
          {content.title}
        </h2>
        <div
          data-element-key='items'
          style={styleOf('items')}
          className={selectableClass(
            activeKey === 'items',
            'mt-14 grid grid-cols-1 gap-x-12 gap-y-10 @xl:grid-cols-2 @3xl:grid-cols-3'
          )}
        >
          {items.map((it, i) => (
            <div key={i} className='border-t border-white/15 pt-6'>
              <h3 className='font-serif text-xl'>{it.title}</h3>
              <p className='mt-2 text-sm leading-relaxed text-white/60'>
                {it.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
