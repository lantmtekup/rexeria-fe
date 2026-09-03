import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  NordhavenGalleryContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface NordhavenGalleryProps {
  content: NordhavenGalleryContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Nordhaven `.gallery` — lưới ảnh kiến trúc nền tối. Responsive 1/2/3. */
export function NordhavenGallery({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: NordhavenGalleryProps) {
  const styleOf = (k: string) =>
    composeStyle(
      elementStyleOf(styles, k),
      orderStyle(order, k),
      positionStyle(positions, k)
    );
  const images = Array.isArray(content.images) ? content.images : [];
  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-[#0e0e0e] px-6 py-16 @2xl:px-12 @2xl:py-24',
        className
      )}
    >
      <div className='mx-auto max-w-6xl'>
        {content.title ? (
          <h2
            data-element-key='title'
            style={styleOf('title')}
            className={selectableClass(
              activeKey === 'title',
              'mb-10 text-3xl font-medium tracking-tight text-white @2xl:mb-14 @2xl:text-5xl'
            )}
          >
            {content.title}
          </h2>
        ) : null}
        <div
          data-element-key='images'
          style={styleOf('images')}
          className={selectableClass(
            activeKey === 'images',
            'grid grid-cols-1 gap-4 @xl:grid-cols-2 @3xl:grid-cols-3'
          )}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className='relative aspect-[4/3] overflow-hidden rounded-lg'
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt=''
                  className='absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105'
                />
              ) : (
                <div className='absolute inset-0 bg-[#222]' />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
