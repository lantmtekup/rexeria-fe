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
 *  lưới card dịch vụ (icon + tiêu đề + mô tả). Responsive 1/2/3 cột. */
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
      <div className='mx-auto max-w-6xl'>
        <div className='max-w-2xl'>
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
          className={selectableClass(
            activeKey === 'items',
            'mt-12 grid grid-cols-1 gap-6 @xl:grid-cols-2 @3xl:grid-cols-3'
          )}
        >
          {items.map((it, i) => (
            <div
              key={i}
              className='flex flex-col gap-4 rounded-2xl bg-white p-8'
            >
              <span className='flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8622c]/10 text-xl'>
                {it.icon || '⌂'}
              </span>
              <h3 className='text-lg font-semibold text-[#2b2621]'>
                {it.title}
              </h3>
              <p className='text-sm leading-relaxed text-[#8a7f76]'>
                {it.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
