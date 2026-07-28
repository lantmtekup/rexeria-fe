import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  NordhavenHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface NordhavenHeroProps {
  content: NordhavenHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Nordhaven `.hero` — chữ khổng lồ (wordmark) mask ảnh kiến trúc + ảnh nền
 *  phía dưới. Nền gần đen. Responsive clamp typography. */
export function NordhavenHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: NordhavenHeroProps) {
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
        '@container relative w-full overflow-hidden bg-[#0e0e0e] px-6 pt-24 text-white @2xl:px-12',
        className
      )}
    >
      <div className='mx-auto max-w-[1400px]'>
        <h1
          data-element-key='wordmark'
          style={{
            ...(content.imageUrl
              ? {
                  backgroundImage: `url(${content.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }
              : {}),
            ...styleOf('wordmark'),
          }}
          className={selectableClass(
            activeKey === 'wordmark',
            'text-center text-[18vw] leading-[0.9] font-semibold tracking-tight @2xl:text-[14vw]'
          )}
        >
          {content.wordmark}
        </h1>
      </div>
      <div
        data-element-key='image'
        style={styleOf('image')}
        className={selectableClass(
          activeKey === 'image',
          'relative mt-6 aspect-[16/7] w-full overflow-hidden'
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
          <div className='absolute inset-0 bg-[#1a1a1a]' />
        )}
      </div>
    </div>
  );
}
