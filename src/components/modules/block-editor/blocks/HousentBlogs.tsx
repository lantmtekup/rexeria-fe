import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HousentBlogsContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface HousentBlogsProps {
  content: HousentBlogsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Housent `.blogs-section` — "Deep structural intelligence": lưới bài viết
 *  (ảnh + category + tiêu đề + ngày). Responsive 1/2/3 cột. */
export function HousentBlogs({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HousentBlogsProps) {
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
        <div className='mb-10 max-w-2xl @2xl:mb-14'>
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
              'text-3xl font-semibold tracking-tight text-[#2b2621] @2xl:text-5xl'
            )}
          >
            {content.title}
          </h2>
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
            <a
              key={i}
              href='#'
              onClick={e => e.preventDefault()}
              className='group flex flex-col overflow-hidden rounded-2xl bg-white'
            >
              <div className='relative aspect-[16/10] overflow-hidden'>
                {it.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.imageUrl}
                    alt={it.title}
                    className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                  />
                ) : (
                  <div className='absolute inset-0 bg-[#e6ddd5]' />
                )}
              </div>
              <div className='flex flex-col gap-2 p-6'>
                <span className='text-2xs font-semibold tracking-[0.16em] text-[#e8622c] uppercase'>
                  {it.category}
                </span>
                <h3 className='text-lg font-semibold text-[#2b2621]'>
                  {it.title}
                </h3>
                <span className='mt-1 text-xs text-[#8a7f76]'>{it.date}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
