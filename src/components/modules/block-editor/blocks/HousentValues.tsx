import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HousentValuesContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface HousentValuesProps {
  content: HousentValuesContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Housent `.values-stack-section` — "The Principles That Guide Our Expertise":
 *  stack các nguyên tắc (số lớn + tiêu đề + mô tả), hàng ngang phân cách. */
export function HousentValues({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HousentValuesProps) {
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
      <div className='mx-auto max-w-5xl'>
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
            'max-w-2xl text-3xl font-semibold tracking-tight text-[#2b2621] @2xl:text-5xl'
          )}
        >
          {content.title}
        </h2>
        <div
          data-element-key='items'
          style={styleOf('items')}
          className={selectableClass(
            activeKey === 'items',
            'mt-12 flex flex-col'
          )}
        >
          {items.map((it, i) => (
            <div
              key={i}
              className='grid grid-cols-1 gap-3 border-t border-[#2b2621]/10 py-8 @2xl:grid-cols-[auto_1fr_2fr] @2xl:gap-10'
            >
              <span className='text-sm font-semibold text-[#e8622c]'>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className='text-xl font-semibold text-[#2b2621]'>
                {it.title}
              </h3>
              <p className='text-sm leading-relaxed text-[#6b6058]'>
                {it.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
