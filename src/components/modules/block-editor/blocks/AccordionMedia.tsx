'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  AccordionMediaContent,
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import { blockBackgroundStyle } from './applyStyle';

interface AccordionMediaProps {
  content: AccordionMediaContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Accordion Media — port pattern Accordion (CodeGrid may2026): hàng panel ngang,
 * panel active nở rộng (ảnh + tiêu đề + mô tả), còn lại thu hẹp; mobile xếp dọc
 * hiện hết. Thuần React state + CSS transition (flex-grow), không lib.
 */
export function AccordionMedia({
  content,
  background,
  className,
}: AccordionMediaProps) {
  const items = content.items ?? [];
  const [active, setActive] = React.useState(0);

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container w-full overflow-hidden rounded-md bg-[#0e0f13] p-3 duration-500 ease-out',
        className
      )}
    >
      <div className='flex h-[60vh] flex-col gap-2 @2xl:flex-row'>
        {items.map((item, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              type='button'
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              style={{ flexGrow: isActive ? 52 : 16 }}
              className='group relative h-full flex-1 basis-0 overflow-hidden rounded-lg text-left transition-[flex-grow] duration-500 ease-out @2xl:flex-none'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className='absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
              <div className='absolute right-4 bottom-4 left-4'>
                <h3 className='text-lg font-semibold text-white @2xl:text-xl'>
                  {item.title}
                </h3>
                <p
                  className={cn(
                    'mt-1 max-w-md text-sm text-white/70 transition-opacity duration-500',
                    isActive ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
