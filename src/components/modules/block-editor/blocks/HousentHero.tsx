import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HousentHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface HousentHeroProps {
  content: HousentHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Housent hero — port 1:1 section `.hero-section` của housent.webflow.io
 * (real-estate template). Layout 2 cột: trái = badge + heading lớn + sub +
 * search bar; phải = ảnh toà nhà bo góc. Responsive container-query: tablet
 * (@2xl) 2 cột, mobile 1 cột (ảnh xuống dưới). Nền be nhạt #f2ece7.
 */
export function HousentHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HousentHeroProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container relative w-full overflow-hidden bg-[#f2ece7] px-6 py-16 @2xl:px-12 @2xl:py-20',
        className
      )}
    >
      <div className='mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 @2xl:grid-cols-2 @2xl:gap-12'>
        <div className='flex flex-col items-start'>
          {content.badge ? (
            <span
              data-element-key='badge'
              style={styleOf('badge')}
              className={selectableClass(
                activeKey === 'badge',
                'text-2xs mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold tracking-[0.14em] text-[#2b2621] uppercase @2xl:text-xs'
              )}
            >
              <span className='inline-block h-2 w-2 rounded-full bg-[#e8622c]' />
              {content.badge}
            </span>
          ) : null}

          <h1
            data-element-key='title'
            style={styleOf('title')}
            className={selectableClass(
              activeKey === 'title',
              'text-4xl leading-[1.05] font-semibold tracking-tight text-[#2b2621] @2xl:text-6xl'
            )}
          >
            {content.title}
          </h1>

          {content.subtitle ? (
            <p
              data-element-key='subtitle'
              style={styleOf('subtitle')}
              className={selectableClass(
                activeKey === 'subtitle',
                'mt-5 max-w-md text-base text-[#6b6058] @2xl:text-lg'
              )}
            >
              {content.subtitle}
            </p>
          ) : null}

          <div
            data-element-key='search'
            style={styleOf('search')}
            className={selectableClass(
              activeKey === 'search',
              'mt-8 flex w-full max-w-lg items-center gap-2 rounded-2xl bg-white/70 p-2 @2xl:mt-10'
            )}
          >
            <input
              readOnly
              placeholder={content.searchPlaceholder}
              className='h-12 flex-1 rounded-xl bg-transparent px-4 text-sm text-[#2b2621] outline-none placeholder:text-[#9a8f86]'
            />
            <button
              type='button'
              className='flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#2b2621] px-5 text-sm font-semibold tracking-wide text-white uppercase'
            >
              {content.searchLabel}
            </button>
          </div>
        </div>

        <div
          data-element-key='image'
          style={styleOf('image')}
          className={selectableClass(
            activeKey === 'image',
            'relative aspect-[4/5] w-full overflow-hidden rounded-3xl @2xl:aspect-[3/4]'
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
            <div className='absolute inset-0 grid place-items-center bg-[#e6ddd5] text-sm text-[#9a8f86]'>
              Ảnh hero
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
