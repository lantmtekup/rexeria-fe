import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HeroSplitContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { TransformedImage } from './TransformedImage';

interface HeroSplitProps {
  content: HeroSplitContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function HeroSplit({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HeroSplitProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const sEyebrow = styleOf('eyebrow');
  const sTitle = styleOf('title');
  const sDescription = styleOf('description');
  const sStats = styleOf('stats');
  const sCta = styleOf('ctaText');
  const sImage = styleOf('imageUrl');
  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in slide-in-from-bottom-4 relative grid w-full grid-cols-1 overflow-hidden rounded-md bg-neutral-950 text-white duration-700 ease-out @2xl:aspect-[16/9] @2xl:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]',
        className
      )}
    >
      <div className='order-2 flex flex-col justify-between gap-5 p-6 @2xl:order-1 @2xl:gap-6 @2xl:p-10 @4xl:p-14'>
        <div className='flex flex-col gap-3 @2xl:gap-4'>
          {content.eyebrow && (
            <span
              data-element-key='eyebrow'
              style={sEyebrow}
              className={selectableClass(
                activeKey === 'eyebrow',
                'animate-reveal-x inline-flex w-fit items-center gap-2 text-[10px] font-semibold tracking-[0.32em] text-white/60 uppercase [animation-delay:900ms] [animation-duration:700ms] @2xl:text-[11px]'
              )}
            >
              <span className='size-1 shrink-0 rounded-full bg-white/40' />
              {content.eyebrow}
            </span>
          )}
          <h2
            data-element-key='title'
            style={sTitle}
            className={selectableClass(
              activeKey === 'title',
              'animate-reveal-x text-2xl leading-[1.05] font-semibold [animation-delay:1100ms] [animation-duration:1200ms] @2xl:text-4xl @4xl:text-6xl'
            )}
          >
            {content.title}
          </h2>
          {content.description && (
            <p
              data-element-key='description'
              style={sDescription}
              className={selectableClass(
                activeKey === 'description',
                'animate-soft-rise max-w-[36ch] text-sm text-white/70 [animation-delay:1700ms] @2xl:text-sm @2xl:leading-6 @4xl:text-base'
              )}
            >
              {content.description}
            </p>
          )}
        </div>

        {content.stats.length > 0 && (
          <div
            data-element-key='stats'
            style={sStats}
            className={selectableClass(
              activeKey === 'stats',
              'animate-soft-rise grid grid-cols-3 gap-2 [animation-delay:2200ms] @2xl:gap-3 @4xl:gap-4'
            )}
          >
            {content.stats.slice(0, 3).map((stat, i) => (
              <div
                key={i}
                style={{ animationDelay: `${2300 + i * 80}ms` }}
                className='animate-in fade-in slide-in-from-bottom-2 fill-mode-both rounded-md border border-white/10 bg-white/[0.04] p-2 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] @2xl:p-2.5 @4xl:p-3.5'
              >
                <div className='text-sm leading-none font-semibold @2xl:text-base @4xl:text-2xl'>
                  {stat.value}
                </div>
                <div className='mt-1 text-[8px] tracking-widest text-white/50 uppercase @2xl:mt-1.5 @4xl:mt-2 @4xl:text-[10px]'>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {content.ctaText && (
          <a
            data-element-key='ctaText'
            href={content.ctaLink || '#'}
            onClick={e => e.preventDefault()}
            style={sCta}
            className={selectableClass(
              activeKey === 'ctaText',
              'rounded-pill animate-soft-rise inline-flex min-h-11 w-fit items-center bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-md transition-all duration-300 ease-out [animation-delay:2400ms] hover:-translate-y-0.5 hover:shadow-xl @2xl:px-5 @2xl:py-2.5'
            )}
          >
            {content.ctaText}
          </a>
        )}
      </div>

      <div
        data-element-key='imageUrl'
        style={sImage}
        className={selectableClass(
          activeKey === 'imageUrl',
          // Mobile: image cell has explicit aspect (parent grid-cols-1, no outer aspect).
          // Tablet+: parent enforces 16:9 aspect, image fills cell.
          'group relative order-1 aspect-[4/3] w-full overflow-hidden @2xl:order-2 @2xl:aspect-auto @2xl:h-full'
        )}
      >
        <div className='h-full w-full transition-transform duration-[1200ms] ease-out group-hover:scale-105'>
          <TransformedImage
            src={content.imageUrl}
            transform={content.imageTransform}
            fallback={
              <div className='flex h-full w-full items-center justify-center bg-neutral-800 text-xs text-white/40'>
                Chưa có ảnh
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
