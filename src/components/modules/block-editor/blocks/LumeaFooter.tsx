import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  LumeaFooterContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface LumeaFooterProps {
  content: LumeaFooterContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Lumea `.footer` — nền nâu đậm: brand serif lớn + CTA + nhóm link + legal.
 *  Responsive: mobile stack. */
export function LumeaFooter({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: LumeaFooterProps) {
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
        '@container w-full bg-[#2b241d] px-6 py-16 text-white @2xl:px-12 @2xl:py-20',
        className
      )}
    >
      <div className='mx-auto max-w-6xl'>
        <div className='flex flex-col gap-10 @2xl:flex-row @2xl:items-end @2xl:justify-between'>
          <div>
            <span
              data-element-key='brand'
              style={styleOf('brand')}
              className={selectableClass(
                activeKey === 'brand',
                'font-serif text-4xl font-medium @2xl:text-6xl'
              )}
            >
              {content.brand}
            </span>
            <p
              data-element-key='tagline'
              style={styleOf('tagline')}
              className={selectableClass(
                activeKey === 'tagline',
                'mt-4 max-w-sm text-sm text-white/60'
              )}
            >
              {content.tagline}
            </p>
          </div>
          <nav className='flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/70'>
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
        <div className='mt-14 border-t border-white/10 pt-6 text-xs tracking-[0.12em] text-white/50 uppercase'>
          {content.copyright}
        </div>
      </div>
    </div>
  );
}
