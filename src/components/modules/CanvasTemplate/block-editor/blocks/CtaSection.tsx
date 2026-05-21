import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  CtaSectionContent,
  ElementPositionsMap,
  ElementStylesMap,
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

interface CtaSectionProps {
  content: CtaSectionContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function CtaSection({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CtaSectionProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const sEyebrow = styleOf('eyebrow');
  const sTitle = styleOf('title');
  const sSubtitle = styleOf('subtitle');
  const sPrimary = styleOf('primaryText');
  const sSecondary = styleOf('secondaryText');
  const sBg = styleOf('backgroundUrl');

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 group relative min-h-[400px] w-full overflow-hidden rounded-md bg-neutral-950 px-6 py-14 text-white duration-700 ease-out @2xl:min-h-[480px] @2xl:px-12 @2xl:py-20 @4xl:px-20 @4xl:py-24',
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
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85' />

      <div className='relative mx-auto flex max-w-3xl flex-col items-center gap-4 text-center @2xl:gap-6'>
        {content.eyebrow && (
          <span
            data-element-key='eyebrow'
            style={sEyebrow}
            className={selectableClass(
              activeKey === 'eyebrow',
              'animate-reveal-x inline-flex w-fit items-center gap-2 text-[10px] font-semibold tracking-[0.32em] text-white/70 uppercase [animation-delay:900ms] [animation-duration:700ms] @2xl:text-xs'
            )}
          >
            <span className='size-1 shrink-0 rounded-full bg-white/50' />
            {content.eyebrow}
          </span>
        )}
        <h2
          data-element-key='title'
          style={sTitle}
          className={selectableClass(
            activeKey === 'title',
            'animate-reveal-x text-2xl leading-[1.1] font-semibold [animation-delay:1100ms] [animation-duration:1200ms] @2xl:text-4xl @4xl:text-6xl'
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
              'animate-soft-rise max-w-2xl text-sm text-white/75 [animation-delay:1700ms] @2xl:text-base @2xl:leading-7 @4xl:text-lg'
            )}
          >
            {content.subtitle}
          </p>
        )}

        <div className='mt-2 flex flex-col flex-wrap items-stretch justify-center gap-3 @2xl:mt-4 @2xl:flex-row @2xl:items-center'>
          {content.primaryText && (
            <a
              data-element-key='primaryText'
              href={content.primaryLink || '#'}
              onClick={e => e.preventDefault()}
              style={sPrimary}
              className={selectableClass(
                activeKey === 'primaryText',
                'rounded-pill animate-soft-rise inline-flex min-h-11 items-center justify-center bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-lg transition-all duration-300 ease-out [animation-delay:2200ms] hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-2xl @2xl:px-6 @2xl:py-3 @2xl:text-base'
              )}
            >
              {content.primaryText}
            </a>
          )}
          {content.secondaryText && (
            <a
              data-element-key='secondaryText'
              href={content.secondaryLink || '#'}
              onClick={e => e.preventDefault()}
              style={sSecondary}
              className={selectableClass(
                activeKey === 'secondaryText',
                'rounded-pill animate-soft-rise inline-flex min-h-11 items-center justify-center border border-white/40 bg-white/0 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-out [animation-delay:2400ms] hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/10 @2xl:px-6 @2xl:py-3 @2xl:text-base'
              )}
            >
              {content.secondaryText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
