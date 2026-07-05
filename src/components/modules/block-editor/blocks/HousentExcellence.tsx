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

/** Housent `.feature-circle-section` — "Our Excellence": list feature đánh số
 *  trong vòng tròn + tiêu đề + mô tả. Responsive: mobile 1 cột, tablet 2. */
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
        '@container w-full bg-[#17120f] px-6 py-16 text-white @2xl:px-12 @2xl:py-24',
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
            'mt-12 grid grid-cols-1 gap-x-12 gap-y-10 @2xl:grid-cols-2'
          )}
        >
          {items.map((it, i) => (
            <div key={i} className='flex gap-5 border-t border-white/10 pt-6'>
              <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e8622c] text-sm font-semibold text-[#e8622c]'>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className='text-lg font-semibold'>{it.title}</h3>
                <p className='mt-2 text-sm leading-relaxed text-white/60'>
                  {it.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
