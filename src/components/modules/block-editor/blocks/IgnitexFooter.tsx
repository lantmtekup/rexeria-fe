import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  IgnitexFooterContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface IgnitexFooterProps {
  content: IgnitexFooterContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** IgniteX footer — wordmark + email + link + legal, nền tối. Responsive. */
export function IgnitexFooter({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: IgnitexFooterProps) {
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
        '@container w-full bg-[#0a0a0a] px-6 py-16 text-white @2xl:px-12 @2xl:py-20',
        className
      )}
    >
      <div className='mx-auto max-w-6xl'>
        <div className='flex flex-col gap-8 @2xl:flex-row @2xl:items-end @2xl:justify-between'>
          <div>
            <span
              data-element-key='brand'
              style={styleOf('brand')}
              className={selectableClass(
                activeKey === 'brand',
                'text-3xl font-semibold tracking-tight @2xl:text-5xl'
              )}
            >
              {content.brand}
            </span>
            <a
              data-element-key='email'
              href={`mailto:${content.email}`}
              onClick={e => e.preventDefault()}
              style={styleOf('email')}
              className={selectableClass(
                activeKey === 'email',
                'mt-4 block text-sm text-white/60 underline underline-offset-4'
              )}
            >
              {content.email}
            </a>
          </div>
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
