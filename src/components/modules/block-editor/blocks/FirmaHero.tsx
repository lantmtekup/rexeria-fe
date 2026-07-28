import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FirmaHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FirmaHeroProps {
  content: FirmaHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Firma hero — "Let's create together." serif + từ nhấn in nghiêng, subtext,
 *  chữ FIRMA khổng lồ mask ảnh. Nền kem. Responsive. */
export function FirmaHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FirmaHeroProps) {
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
        '@container relative w-full overflow-hidden bg-[#f4f2ee] px-6 pt-20 pb-0 text-[#161514] @2xl:px-12 @2xl:pt-28',
        className
      )}
    >
      <div className='mx-auto max-w-5xl text-center'>
        <h1
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'font-serif text-4xl leading-tight font-medium @2xl:text-7xl'
          )}
        >
          {content.titleLead}{' '}
          <span className='italic'>{content.titleAccent}</span>
        </h1>
        <p
          data-element-key='subtitle'
          style={styleOf('subtitle')}
          className={selectableClass(
            activeKey === 'subtitle',
            'mx-auto mt-6 max-w-md text-sm text-[#5c574f] @2xl:text-base'
          )}
        >
          {content.subtitle}
        </p>
      </div>
      <div
        data-element-key='image'
        style={styleOf('image')}
        className={selectableClass(
          activeKey === 'image',
          'relative mx-auto mt-12 aspect-[16/7] w-full max-w-6xl overflow-hidden rounded-t-3xl'
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
          <div className='absolute inset-0 bg-[#e3ded4]' />
        )}
      </div>
    </div>
  );
}
