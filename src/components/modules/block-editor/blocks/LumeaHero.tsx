import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  LumeaHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface LumeaHeroProps {
  content: LumeaHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Lumea `.hero-section-main` — hero full-bleed ảnh nội thất + overlay tối,
 *  eyebrow + heading serif lớn + 2 nút. Responsive padding/typography. */
export function LumeaHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: LumeaHeroProps) {
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
        '@container relative flex min-h-[80svh] w-full items-end overflow-hidden bg-[#2b241d] px-6 py-16 @2xl:px-12 @2xl:py-20',
        className
      )}
    >
      {content.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={content.imageUrl}
          alt=''
          className='absolute inset-0 h-full w-full object-cover'
        />
      ) : null}
      <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30' />
      <div className='relative mx-auto w-full max-w-6xl text-white'>
        {content.eyebrow ? (
          <span
            data-element-key='eyebrow'
            style={styleOf('eyebrow')}
            className={selectableClass(
              activeKey === 'eyebrow',
              'text-2xs mb-5 block font-semibold tracking-[0.28em] text-white/70 uppercase'
            )}
          >
            {content.eyebrow}
          </span>
        ) : null}
        <h1
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'max-w-3xl font-serif text-4xl leading-[1.05] font-medium @2xl:text-7xl'
          )}
        >
          {content.title}
        </h1>
        <div className='mt-8 flex flex-wrap items-center gap-4'>
          <a
            data-element-key='primaryCta'
            href='#'
            onClick={e => e.preventDefault()}
            style={styleOf('primaryCta')}
            className={selectableClass(
              activeKey === 'primaryCta',
              'inline-flex h-12 items-center rounded-full bg-white px-7 text-sm font-medium text-[#2b241d]'
            )}
          >
            {content.primaryCta}
          </a>
          <a
            data-element-key='secondaryCta'
            href='#'
            onClick={e => e.preventDefault()}
            style={styleOf('secondaryCta')}
            className={selectableClass(
              activeKey === 'secondaryCta',
              'text-sm font-medium text-white underline underline-offset-8'
            )}
          >
            {content.secondaryCta}
          </a>
        </div>
      </div>
    </div>
  );
}
