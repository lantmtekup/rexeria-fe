import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HeroOverlayContent,
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

interface HeroOverlayProps {
  content: HeroOverlayContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function HeroOverlay({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HeroOverlayProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const sTag = styleOf('tag');
  const sTitle = styleOf('title');
  const sSubtitle = styleOf('subtitle');
  const sCta = styleOf('ctaText');
  const sBg = styleOf('backgroundUrl');

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 group relative aspect-[9/16] w-full overflow-hidden rounded-md bg-neutral-900 duration-700 ease-out @2xl:aspect-[16/10]',
        className
      )}
    >
      <div
        data-element-key='backgroundUrl'
        style={sBg}
        className={selectableClass(
          activeKey === 'backgroundUrl',
          'absolute inset-0 transition-transform duration-[1500ms] ease-out group-hover:scale-105'
        )}
      >
        <TransformedImage
          src={content.backgroundUrl}
          transform={content.backgroundTransform}
        />
      </div>
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/10' />

      <div className='absolute inset-0 flex flex-col justify-end gap-3 p-6 text-white @2xl:gap-4 @2xl:p-10 @4xl:gap-6 @4xl:p-16'>
        {content.tag && (
          <span
            data-element-key='tag'
            style={sTag}
            className={selectableClass(
              activeKey === 'tag',
              'rounded-pill animate-reveal-x inline-block w-fit border border-white/40 bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-wider uppercase backdrop-blur [animation-delay:900ms] [animation-duration:700ms] @2xl:text-[11px]'
            )}
          >
            {content.tag}
          </span>
        )}
        <h2
          data-element-key='title'
          style={sTitle}
          className={selectableClass(
            activeKey === 'title',
            'animate-reveal-x max-w-[90%] text-2xl leading-[1.05] font-semibold drop-shadow-md [animation-delay:1100ms] [animation-duration:1200ms] @2xl:max-w-[70%] @2xl:text-4xl @4xl:text-6xl'
          )}
        >
          {content.title}
        </h2>
        {content.subtitle && (
          <p
            data-element-key='subtitle'
            style={sSubtitle}
            className={selectableClass(
              activeKey === 'subtitle',
              'animate-soft-rise max-w-[90%] text-sm font-light text-white/85 [animation-delay:1700ms] @2xl:max-w-[60%] @2xl:text-base @4xl:text-lg'
            )}
          >
            {content.subtitle}
          </p>
        )}
        {content.ctaText && (
          <a
            data-element-key='ctaText'
            href={content.ctaLink || '#'}
            onClick={e => e.preventDefault()}
            style={sCta}
            className={selectableClass(
              activeKey === 'ctaText',
              'rounded-pill animate-soft-rise inline-flex min-h-11 w-fit items-center bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-lg transition-all duration-300 ease-out [animation-delay:2200ms] hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-2xl @2xl:px-6 @2xl:py-3 @2xl:text-base'
            )}
          >
            {content.ctaText}
          </a>
        )}
      </div>
    </div>
  );
}
