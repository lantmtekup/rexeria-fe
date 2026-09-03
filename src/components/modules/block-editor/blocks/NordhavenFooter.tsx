import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  NordhavenFooterContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface NordhavenFooterProps {
  content: NordhavenFooterContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Nordhaven `.footer` — nền đen: wordmark lớn + link + legal. Responsive. */
export function NordhavenFooter({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: NordhavenFooterProps) {
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
        '@container w-full bg-[#0e0e0e] px-6 py-16 text-white @2xl:px-12 @2xl:py-20',
        className
      )}
    >
      <div className='mx-auto max-w-6xl'>
        <div className='flex flex-col gap-8 @2xl:flex-row @2xl:items-end @2xl:justify-between'>
          <span
            data-element-key='brand'
            style={styleOf('brand')}
            className={selectableClass(
              activeKey === 'brand',
              'text-4xl font-semibold tracking-tight @2xl:text-6xl'
            )}
          >
            {content.brand}
          </span>
          <nav className='flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/60'>
            {links.map((l, i) => (
              <a
                key={i}
                href='#'
                onClick={e => e.preventDefault()}
                className='hover:text-white'
              >
                {l}
              </a>
            ))}
          </nav>
        </div>
        <div className='mt-12 border-t border-white/10 pt-6 text-xs tracking-[0.12em] text-white/45 uppercase'>
          {content.copyright}
        </div>
      </div>
    </div>
  );
}
