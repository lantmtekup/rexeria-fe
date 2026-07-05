import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HousentListingsContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface HousentListingsProps {
  content: HousentListingsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Housent listings — `.property-section` của housent.webflow.io. Lưới card
 * bất động sản (ảnh + giá + tên + địa chỉ + thông số bed/bath/area).
 * Responsive: mobile 1 cột, tablet 2, desktop 3.
 */
export function HousentListings({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HousentListingsProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
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
        <div className='mb-10 flex flex-col gap-3 @2xl:mb-14 @2xl:flex-row @2xl:items-end @2xl:justify-between'>
          <div>
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
                'max-w-xl text-3xl font-semibold tracking-tight text-[#2b2621] @2xl:text-5xl'
              )}
            >
              {content.title}
            </h2>
          </div>
        </div>

        <div
          data-element-key='items'
          style={styleOf('items')}
          className={selectableClass(
            activeKey === 'items',
            'grid grid-cols-1 gap-6 @xl:grid-cols-2 @3xl:grid-cols-3'
          )}
        >
          {items.map((it, i) => (
            <div
              key={i}
              className='group flex flex-col overflow-hidden rounded-2xl bg-white'
            >
              <div className='relative aspect-[4/3] overflow-hidden'>
                {it.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.imageUrl}
                    alt={it.name}
                    className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                  />
                ) : (
                  <div className='absolute inset-0 bg-[#e6ddd5]' />
                )}
                {it.price ? (
                  <span className='absolute top-3 left-3 rounded-full bg-[#17120f] px-3 py-1.5 text-xs font-semibold text-white'>
                    {it.price}
                  </span>
                ) : null}
              </div>
              <div className='flex flex-col gap-2 p-5'>
                <h3 className='text-lg font-semibold text-[#2b2621]'>
                  {it.name}
                </h3>
                <p className='text-sm text-[#8a7f76]'>{it.address}</p>
                {it.specs ? (
                  <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6b6058]'>
                    {it.specs.split('·').map((sp, k) => (
                      <span key={k}>{sp.trim()}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
