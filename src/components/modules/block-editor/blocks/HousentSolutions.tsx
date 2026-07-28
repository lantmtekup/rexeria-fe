import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HousentSolutionsContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface HousentSolutionsProps {
  content: HousentSolutionsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Housent `.property-solution-section` — "Our Complete Property Solutions":
 *  2 cột. Trái: eyebrow + heading + subtitle (sticky). Phải: list dọc từng
 *  giải pháp (tiêu đề lớn + mô tả + checklist feature), ảnh xen giữa. */
export function HousentSolutions({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HousentSolutionsProps) {
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
      <div className='mx-auto grid max-w-6xl grid-cols-1 gap-12 @3xl:grid-cols-[minmax(0,22rem)_1fr] @3xl:gap-16'>
        <div className='@3xl:sticky @3xl:top-16 @3xl:self-start'>
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
          {content.subtitle ? (
            <p
              data-element-key='subtitle'
              style={styleOf('subtitle')}
              className={selectableClass(
                activeKey === 'subtitle',
                'mt-4 text-base text-[#6b6058]'
              )}
            >
              {content.subtitle}
            </p>
          ) : null}
        </div>
        <div
          data-element-key='items'
          style={styleOf('items')}
          className={selectableClass(activeKey === 'items', 'flex flex-col')}
        >
          {items.map((it, i) => (
            <div
              key={i}
              className='flex flex-col gap-6 border-t border-[#2b2621]/10 py-10 first:border-t-0 first:pt-0'
            >
              {it.image ? (
                <img
                  src={it.image}
                  alt={it.title}
                  className='aspect-[16/10] w-full rounded-2xl object-cover'
                />
              ) : null}
              <div className='flex flex-col gap-3 @xl:flex-row @xl:items-start @xl:justify-between @xl:gap-8'>
                <h3 className='text-2xl font-semibold tracking-tight text-[#2b2621] @2xl:text-3xl'>
                  {it.title}
                </h3>
                <p className='max-w-xs text-sm leading-relaxed text-[#8a7f76]'>
                  {it.description}
                </p>
              </div>
              {it.features?.length ? (
                <div className='flex flex-wrap gap-x-6 gap-y-2'>
                  {it.features.map((f, fi) => (
                    <span
                      key={fi}
                      className='text-2xs inline-flex items-center gap-2 font-medium tracking-[0.1em] text-[#2b2621] uppercase'
                    >
                      <span className='flex size-4 items-center justify-center rounded-sm bg-[#e8622c]/15 text-[#e8622c]'>
                        ✓
                      </span>
                      {f}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
