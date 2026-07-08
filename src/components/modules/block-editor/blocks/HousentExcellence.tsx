import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HousentExcellenceContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface HousentExcellenceProps {
  content: HousentExcellenceContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Housent `.feature-circle-section` — hàng card ảnh tòa nhà bo góc. Mỗi card:
 *  ảnh nền + lớp phủ tối, label nhỏ + value lớn ở đáy. Mobile scroll ngang. */
export function HousentExcellence({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HousentExcellenceProps) {
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
        '@container w-full bg-[#0f0c0a] px-6 py-16 text-white @2xl:px-12 @2xl:py-24',
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
            'max-w-2xl text-3xl font-semibold tracking-tight @2xl:text-5xl'
          )}
        >
          {content.title}
        </h2>
        <div
          data-element-key='items'
          style={styleOf('items')}
          className={selectableClass(
            activeKey === 'items',
            'mt-12 grid grid-cols-2 gap-4 @2xl:grid-cols-4 @2xl:gap-6'
          )}
        >
          {items.map((it, i) => (
            <div
              key={i}
              className='relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#241d18]'
            >
              {it.image ? (
                <img
                  src={it.image}
                  alt={it.label}
                  className='absolute inset-0 h-full w-full object-cover'
                />
              ) : null}
              <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
              <div className='absolute inset-x-0 bottom-0 p-5'>
                <div className='text-xs text-white/70'>{it.label}</div>
                <div className='mt-1 text-2xl font-semibold tracking-tight @2xl:text-3xl'>
                  {it.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
