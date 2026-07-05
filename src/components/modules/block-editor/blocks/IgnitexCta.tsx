import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  IgnitexCtaContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface IgnitexCtaProps {
  content: IgnitexCtaContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** IgniteX CTA — heading khổng lồ + nút, nền tối. Responsive. */
export function IgnitexCta({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: IgnitexCtaProps) {
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
        '@container w-full bg-[#0a0a0a] px-6 py-24 text-center text-white @2xl:px-12 @2xl:py-32',
        className
      )}
    >
      <div className='mx-auto max-w-4xl'>
        <h2
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'text-5xl leading-[0.95] font-semibold tracking-tight @2xl:text-8xl'
          )}
        >
          {content.title}
        </h2>
        <a
          data-element-key='button'
          href='#'
          onClick={e => e.preventDefault()}
          style={styleOf('button')}
          className={selectableClass(
            activeKey === 'button',
            'mt-10 inline-flex h-14 items-center rounded-full bg-white px-9 text-sm font-semibold tracking-wide text-[#0a0a0a] uppercase'
          )}
        >
          {content.buttonLabel}
        </a>
      </div>
    </div>
  );
}
