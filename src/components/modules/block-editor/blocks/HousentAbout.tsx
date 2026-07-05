import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HousentAboutContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface HousentAboutProps {
  content: HousentAboutContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Housent who-we-are — `.who-we-are-section`. 2 cột: heading lớn trái + đoạn
 * mô tả phải, dưới là hàng mini-stat. Responsive: mobile stack.
 */
export function HousentAbout({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HousentAboutProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const points = content.points ?? [];

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-[#f7f3ef] px-6 py-16 @2xl:px-12 @2xl:py-24',
        className
      )}
    >
      <div className='mx-auto grid max-w-6xl grid-cols-1 gap-10 @2xl:grid-cols-2 @2xl:gap-16'>
        <div>
          {content.eyebrow ? (
            <span
              data-element-key='eyebrow'
              style={styleOf('eyebrow')}
              className={selectableClass(
                activeKey === 'eyebrow',
                'text-2xs mb-4 block font-semibold tracking-[0.24em] text-[#e8622c] uppercase'
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
        <div className='flex flex-col gap-6'>
          <p
            data-element-key='text'
            style={styleOf('text')}
            className={selectableClass(
              activeKey === 'text',
              'text-base leading-relaxed text-[#6b6058] @2xl:text-lg'
            )}
          >
            {content.text}
          </p>
          <div className='grid grid-cols-2 gap-6'>
            {points.map((pt, i) => (
              <div key={i} className='border-t border-[#2b2621]/10 pt-4'>
                <div className='text-2xl font-semibold text-[#2b2621]'>
                  {pt.value}
                </div>
                <div className='mt-1 text-sm text-[#8a7f76]'>{pt.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
