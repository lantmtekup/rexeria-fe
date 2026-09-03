import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FirmaFooterContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FirmaFooterProps {
  content: FirmaFooterContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Firma footer — CTA lớn serif + email + link. Nền kem. Responsive. */
export function FirmaFooter({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FirmaFooterProps) {
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
        '@container w-full bg-[#f4f2ee] px-6 py-20 text-[#161514] @2xl:px-12 @2xl:py-28',
        className
      )}
    >
      <div className='mx-auto max-w-5xl text-center'>
        <h2
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'font-serif text-4xl leading-tight font-medium @2xl:text-6xl'
          )}
        >
          {content.title}
        </h2>
        <a
          data-element-key='email'
          href={`mailto:${content.email}`}
          onClick={e => e.preventDefault()}
          style={styleOf('email')}
          className={selectableClass(
            activeKey === 'email',
            'mt-8 inline-block text-lg underline underline-offset-8'
          )}
        >
          {content.email}
        </a>
        <nav className='mt-12 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-[#5c574f]'>
          {links.map((l, i) => (
            <a
              key={i}
              href='#'
              onClick={e => e.preventDefault()}
              className='hover:text-[#161514]'
            >
              {l}
            </a>
          ))}
        </nav>
        <div className='mt-10 text-xs tracking-[0.12em] text-[#a39a88] uppercase'>
          {content.copyright}
        </div>
      </div>
    </div>
  );
}
