import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HousentStatsContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface HousentStatsProps {
  content: HousentStatsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Housent highlights — dải chỉ số `.highlights-section` của housent.webflow.io.
 * Hàng 4-5 stat (giá trị lớn + nhãn). Responsive: mobile 2 cột, tablet+ chia
 * đều theo số stat. Nền tối #17120f, số màu cam accent.
 */
export function HousentStats({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HousentStatsProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const stats = Array.isArray(content.stats) ? content.stats : [];

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-[#17120f] px-6 py-14 text-white @2xl:px-12 @2xl:py-20',
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
              'text-2xs mb-8 block font-semibold tracking-[0.24em] text-[#e8622c] uppercase'
            )}
          >
            {content.eyebrow}
          </span>
        ) : null}
        <div
          data-element-key='stats'
          style={styleOf('stats')}
          className={selectableClass(
            activeKey === 'stats',
            'grid grid-cols-2 gap-x-6 gap-y-10 @2xl:grid-cols-4 @3xl:grid-cols-5'
          )}
        >
          {stats.map((s, i) => (
            <div key={i} className='flex flex-col gap-2'>
              <span className='text-3xl font-semibold tracking-tight text-[#e8622c] @2xl:text-5xl'>
                {s.value}
              </span>
              <span className='text-xs text-white/60 @2xl:text-sm'>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
