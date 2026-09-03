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
 * Housent listings — `.property-section` của housent.webflow.io. Eyebrow chấm
 * cam + filter tabs bên phải. Mỗi card: badge trạng thái góc trái, giá pill góc
 * phải, chips beds/baths/area + nút DETAILS phủ đáy ảnh, tên + địa chỉ có pin.
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
  const items = Array.isArray(content.items) ? content.items : [];
  const filters = Array.isArray(content.filters) ? content.filters : [];

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-[#f7f3ef] px-6 py-16 @2xl:px-12 @2xl:py-24',
        className
      )}
    >
      <div className='mx-auto max-w-6xl'>
        <div className='mb-10 flex flex-col gap-6 @2xl:mb-14 @2xl:flex-row @2xl:items-end @2xl:justify-between'>
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
                'max-w-xl text-3xl font-semibold tracking-tight text-[#2b2621] @2xl:text-5xl'
              )}
            >
              {content.title}
            </h2>
          </div>
          {filters.length ? (
            <div
              data-element-key='filters'
              style={styleOf('filters')}
              className={selectableClass(
                activeKey === 'filters',
                'flex flex-wrap gap-2'
              )}
            >
              {filters.map((f, i) => (
                <span
                  key={i}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium',
                    i === 0
                      ? 'bg-[#e8622c] text-white'
                      : 'bg-white text-[#2b2621]'
                  )}
                >
                  {f}
                </span>
              ))}
            </div>
          ) : null}
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
            <div key={i} className='group flex flex-col'>
              <div className='relative aspect-[4/5] overflow-hidden rounded-2xl'>
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
                {it.status ? (
                  <span className='text-2xs absolute top-3 left-3 rounded-md bg-[#e8622c] px-2.5 py-1 font-semibold tracking-[0.1em] text-white uppercase'>
                    {it.status}
                  </span>
                ) : null}
                {it.price ? (
                  <span className='absolute top-3 right-3 rounded-md bg-white/95 px-3 py-1.5 text-sm font-semibold text-[#2b2621]'>
                    {it.price}
                  </span>
                ) : null}
                <div className='absolute inset-x-3 bottom-3 flex items-end justify-between gap-2'>
                  <div className='flex flex-col gap-1.5'>
                    {[it.beds, it.baths, it.area]
                      .filter(Boolean)
                      .map((sp, k) => (
                        <span
                          key={k}
                          className='text-2xs inline-flex w-fit items-center gap-1.5 rounded-md bg-black/55 px-2.5 py-1 font-medium text-white backdrop-blur-sm'
                        >
                          {sp}
                        </span>
                      ))}
                  </div>
                  <span className='inline-flex items-center gap-1.5 rounded-md bg-[#17120f] px-3 py-2 text-xs font-semibold text-white'>
                    <span className='text-[#e8622c]'>+</span>
                    Details
                  </span>
                </div>
              </div>
              <div className='flex flex-col gap-1.5 px-1 pt-4'>
                <h3 className='text-xl font-semibold tracking-tight text-[#2b2621]'>
                  {it.name}
                </h3>
                {it.address ? (
                  <p className='inline-flex items-center gap-1.5 text-sm text-[#8a7f76]'>
                    <span className='text-[#e8622c]'>◍</span>
                    {it.address}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
