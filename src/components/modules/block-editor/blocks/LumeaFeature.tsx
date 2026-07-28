import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  LumeaFeatureContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface LumeaFeatureProps {
  content: LumeaFeatureContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Lumea feature split — ảnh + text (immersive / handcrafted). `reverse` để
 *  đảo cột. Responsive: mobile stack (ảnh trên). */
export function LumeaFeature({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: LumeaFeatureProps) {
  const styleOf = (k: string) =>
    composeStyle(
      elementStyleOf(styles, k),
      orderStyle(order, k),
      positionStyle(positions, k)
    );
  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-[#efe9e1] px-6 py-16 @2xl:px-12 @2xl:py-24',
        className
      )}
    >
      <div
        className={cn(
          'mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 @2xl:grid-cols-2 @2xl:gap-16',
          content.reverse && '@2xl:[&>*:first-child]:order-2'
        )}
      >
        <div
          data-element-key='image'
          style={styleOf('image')}
          className={selectableClass(
            activeKey === 'image',
            'relative aspect-[4/3] w-full overflow-hidden rounded-2xl'
          )}
        >
          {content.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.imageUrl}
              alt=''
              className='absolute inset-0 h-full w-full object-cover'
            />
          ) : (
            <div className='absolute inset-0 bg-[#ddd3c7]' />
          )}
        </div>
        <div>
          {content.eyebrow ? (
            <span
              data-element-key='eyebrow'
              style={styleOf('eyebrow')}
              className={selectableClass(
                activeKey === 'eyebrow',
                'text-2xs mb-4 block font-semibold tracking-[0.28em] text-[#a68a5b] uppercase'
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
              'font-serif text-3xl leading-tight font-medium text-[#2b241d] @2xl:text-4xl'
            )}
          >
            {content.title}
          </h2>
          {content.text ? (
            <p
              data-element-key='text'
              style={styleOf('text')}
              className={selectableClass(
                activeKey === 'text',
                'mt-6 text-base leading-relaxed text-[#6b6157] @2xl:text-lg'
              )}
            >
              {content.text}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
