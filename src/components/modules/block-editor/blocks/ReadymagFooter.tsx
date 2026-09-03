import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  ReadymagFooterContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface ReadymagFooterProps {
  content: ReadymagFooterContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Readymag (RADIUS) footer — wordmark khổng lồ + link, nền trắng viền đen. */
export function ReadymagFooter({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: ReadymagFooterProps) {
  const styleOf = (k: string) =>
    composeStyle(
      elementStyleOf(styles, k),
      orderStyle(order, k),
      positionStyle(positions, k)
    );
  const links = Array.isArray(content.links) ? content.links : [];
  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full border-t border-black bg-white px-6 py-16 text-black @2xl:px-12 @2xl:py-20',
        className
      )}
    >
      <div className='mx-auto max-w-6xl'>
        <nav className='flex flex-wrap gap-x-8 gap-y-2 text-sm font-semibold tracking-wide uppercase'>
          {links.map((l, i) => (
            <a
              key={i}
              href='#'
              onClick={e => e.preventDefault()}
              className='hover:opacity-60'
            >
              {l}
            </a>
          ))}
        </nav>
        <h2
          data-element-key='brand'
          style={styleOf('brand')}
          className={selectableClass(
            activeKey === 'brand',
            'mt-10 text-[18vw] leading-[0.85] font-semibold tracking-tighter @2xl:text-[14vw]'
          )}
        >
          {content.brand}
        </h2>
        <div className='mt-8 text-xs font-semibold tracking-wide uppercase'>
          {content.copyright}
        </div>
      </div>
    </div>
  );
}
