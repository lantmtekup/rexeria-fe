import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  IgnitexProjectsContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface IgnitexProjectsProps {
  content: IgnitexProjectsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** IgniteX projects — lưới project (ảnh + tên + tag) nền tối. 1/2 cột. */
export function IgnitexProjects({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: IgnitexProjectsProps) {
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
        '@container w-full bg-[#0a0a0a] px-6 py-16 text-white @2xl:px-12 @2xl:py-24',
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
              'text-3xl font-semibold tracking-tight @2xl:text-5xl'
            )}
          >
            {content.title}
          </h2>
          <span className='font-serif text-sm text-white/40 italic'>
            {content.count}
          </span>
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
              <div className='relative aspect-[4/3] overflow-hidden rounded-xl'>
                {it.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.imageUrl}
                    alt={it.name}
                    className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                  />
                ) : (
                  <div className='absolute inset-0 bg-[#1a1a1a]' />
                )}
              </div>
              <div className='mt-4 flex items-baseline justify-between'>
                <h3 className='text-xl font-medium'>{it.name}</h3>
                <span className='text-xs tracking-wide text-white/45 uppercase'>
                  {it.tag}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
