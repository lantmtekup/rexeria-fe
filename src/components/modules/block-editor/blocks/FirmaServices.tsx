import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FirmaServicesContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FirmaServicesProps {
  content: FirmaServicesContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Firma services — eyebrow + heading + list dịch vụ phân cách (số + tên +
 *  mô tả). Nền kem. Responsive. */
export function FirmaServices({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FirmaServicesProps) {
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
        '@container w-full bg-[#f4f2ee] px-6 py-16 text-[#161514] @2xl:px-12 @2xl:py-24',
        className
      )}
    >
      <div className='mx-auto max-w-5xl'>
        <div className='mb-10 flex items-baseline gap-3 @2xl:mb-14'>
          <h2
            data-element-key='title'
            style={styleOf('title')}
            className={selectableClass(
              activeKey === 'title',
              'font-serif text-3xl font-medium @2xl:text-5xl'
            )}
          >
            {content.title}
          </h2>
          <span className='text-sm text-[#a39a88]'>{content.count}</span>
        </div>
        <div
          data-element-key='items'
          style={styleOf('items')}
          className={selectableClass(activeKey === 'items', 'flex flex-col')}
        >
          {items.map((it, i) => (
            <div
              key={i}
              className='grid grid-cols-1 gap-2 border-t border-[#161514]/12 py-7 @2xl:grid-cols-[auto_1fr_2fr] @2xl:gap-10'
            >
              <span className='text-sm text-[#a39a88]'>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className='font-serif text-xl'>{it.title}</h3>
              <p className='text-sm leading-relaxed text-[#5c574f]'>
                {it.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
