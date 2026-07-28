import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  NordhavenPropertiesContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface NordhavenPropertiesProps {
  content: NordhavenPropertiesContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Nordhaven `.feature-properties` — lưới card bất động sản (ảnh + giá + tên +
 *  địa điểm). Nền đen, card viền mảnh. Responsive 1/2/3 cột. */
export function NordhavenProperties({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: NordhavenPropertiesProps) {
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
            'mt-12 grid grid-cols-1 gap-6 @xl:grid-cols-2 @3xl:grid-cols-3'
          )}
        >
          {items.map((it, i) => (
            <div
              key={i}
              className='group flex flex-col overflow-hidden rounded-lg border border-white/10 bg-[#141414]'
            >
              <div className='relative aspect-[4/3] overflow-hidden'>
                {it.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.imageUrl}
                    alt={it.name}
                    className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                  />
                ) : (
                  <div className='absolute inset-0 bg-[#222]' />
                )}
              </div>
              <div className='flex flex-col gap-1.5 p-5'>
                <span className='text-lg font-semibold'>{it.price}</span>
                <h3 className='text-sm font-medium text-white/85'>{it.name}</h3>
                <p className='text-xs text-white/45'>{it.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
