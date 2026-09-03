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
  const items = Array.isArray(content.items) ? content.items : [];
  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-[#f7f3ef] px-6 py-16 @2xl:px-12 @2xl:py-24',
        className
      )}
    >
      <div className='mx-auto max-w-6xl'>
        <div className='mb-10 flex flex-col gap-6 @2xl:mb-14 @3xl:flex-row @3xl:items-end @3xl:justify-between'>
          <div className='max-w-2xl'>
            {content.eyebrow ? (
              <span
                data-element-key='eyebrow'
                style={styleOf('eyebrow')}
                className={selectableClass(
                  activeKey === 'eyebrow',
                  'text-2xs mb-4 inline-flex items-center gap-2 rounded-full bg-[#e8622c]/15 px-3 py-1.5 font-semibold tracking-[0.24em] text-[#e8622c] uppercase'
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
                'text-3xl font-semibold tracking-tight text-[#2b2621] @2xl:text-5xl'
              )}
            >
              {content.title}
            </h2>
          </div>
          {content.subtitle ? (
            <p
              data-element-key='subtitle'
              style={styleOf('subtitle')}
              className={selectableClass(
                activeKey === 'subtitle',
                'max-w-sm text-base text-[#8a7f76]'
              )}
            >
              {content.subtitle}
            </p>
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
            <a
              key={i}
              href='#'
              onClick={e => e.preventDefault()}
              className='group flex flex-col'
            >
              <div className='relative aspect-[16/10] overflow-hidden rounded-2xl'>
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
                <span className='absolute bottom-3 left-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-lg leading-none text-[#2b2621] shadow-sm transition-colors group-hover:bg-white'>
                  +
                </span>
              </div>
              <h3 className='mt-5 text-lg font-semibold text-[#2b2621]'>
                {it.title}
              </h3>
              <div className='mt-3 flex items-center gap-3'>
                <span className='text-2xs inline-flex items-center gap-1.5 rounded-full bg-[#e8e2da] px-2.5 py-1 font-semibold tracking-[0.16em] text-[#6f655c] uppercase'>
                  <span className='size-1.5 rounded-full bg-[#e8622c]' />
                  {it.category}
                </span>
                <span className='text-xs text-[#8a7f76]'>{it.date}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
