import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FirmaWorkContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FirmaWorkProps {
  content: FirmaWorkContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Firma work — lưới project (ảnh + tên + category). Nền kem. 1/2 cột. */
export function FirmaWork({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FirmaWorkProps) {
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
        '@container w-full bg-[#f4f2ee] px-6 py-16 text-[#161514] @2xl:px-12 @2xl:py-24',
        className
      )}
    >
      <div className='mx-auto max-w-6xl'>
        <div className='mb-10 flex items-baseline gap-3 @2xl:mb-14'>
          <h2
            data-element-key='title'
            style={styleOf('title')}
            className={selectableClass(
              activeKey === 'title',
              'font-serif text-3xl font-medium @2xl:text-5xl'
            )}
          >
            {content.title}
          </h2>
          <span className='text-sm text-[#a39a88]'>{content.count}</span>
        </div>
        <div
          data-element-key='items'
          style={styleOf('items')}
          className={selectableClass(
            activeKey === 'items',
            'grid grid-cols-1 gap-6 @xl:grid-cols-2'
          )}
        >
          {items.map((it, i) => (
            <a
              key={i}
              href='#'
              onClick={e => e.preventDefault()}
              className='group flex flex-col'
            >
              <div className='relative aspect-[4/3] overflow-hidden rounded-2xl'>
                {it.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.imageUrl}
                    alt={it.name}
                    className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                  />
                ) : (
                  <div className='absolute inset-0 bg-[#e3ded4]' />
                )}
              </div>
              <div className='mt-4 flex items-baseline justify-between'>
                <h3 className='font-serif text-xl'>{it.name}</h3>
                <span className='text-xs tracking-wide text-[#a39a88] uppercase'>
                  {it.category}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
