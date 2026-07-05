import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  NordhavenServicesContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface NordhavenServicesProps {
  content: NordhavenServicesContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Nordhaven `.service` — list dịch vụ hàng ngang phân cách (số + tiêu đề +
 *  mô tả). Nền đen. Responsive. */
export function NordhavenServices({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: NordhavenServicesProps) {
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
        '@container w-full bg-[#0e0e0e] px-6 py-16 text-white @2xl:px-12 @2xl:py-24',
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
              'text-2xs mb-3 block font-semibold tracking-[0.24em] text-white/40 uppercase'
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
            'max-w-2xl text-3xl font-medium tracking-tight @2xl:text-5xl'
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
              className='grid grid-cols-1 gap-2 border-t border-white/12 py-7 @2xl:grid-cols-[auto_1fr_2fr] @2xl:gap-12'
            >
              <span className='text-sm text-white/40'>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className='text-xl font-medium'>{it.title}</h3>
              <p className='text-sm leading-relaxed text-white/55'>
                {it.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
