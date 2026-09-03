import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  IgnitexServicesContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface IgnitexServicesProps {
  content: IgnitexServicesContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** IgniteX `Solutions that Drive results` — list dịch vụ đánh số phân cách +
 *  mô tả, nền tối. Responsive. */
export function IgnitexServices({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: IgnitexServicesProps) {
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
        '@container w-full bg-[#0a0a0a] px-6 py-16 text-white @2xl:px-12 @2xl:py-24',
        className
      )}
    >
      <div className='mx-auto max-w-6xl'>
        <h2
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'max-w-2xl text-4xl leading-tight font-semibold tracking-tight @2xl:text-6xl'
          )}
        >
          {content.title}
        </h2>
        <div
          data-element-key='items'
          style={styleOf('items')}
          className={selectableClass(
            activeKey === 'items',
            'mt-14 flex flex-col'
          )}
        >
          {items.map((it, i) => (
            <div
              key={i}
              className='grid grid-cols-1 gap-3 border-t border-white/12 py-8 @2xl:grid-cols-[auto_1fr_2fr] @2xl:gap-12'
            >
              <span className='font-serif text-sm text-white/40 italic'>
                ({String(i + 1).padStart(2, '0')})
              </span>
              <h3 className='text-2xl font-medium @2xl:text-3xl'>{it.title}</h3>
              <p className='text-sm leading-relaxed text-white/55'>
                {it.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
