import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FirmaStatementContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FirmaStatementProps {
  content: FirmaStatementContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Firma statement — eyebrow + câu lớn serif căn giữa. Nền kem. */
export function FirmaStatement({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FirmaStatementProps) {
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
        '@container w-full bg-[#f4f2ee] px-6 py-20 text-center text-[#161514] @2xl:px-12 @2xl:py-28',
        className
      )}
    >
      <div className='mx-auto max-w-3xl'>
        {content.eyebrow ? (
          <span
            data-element-key='eyebrow'
            style={styleOf('eyebrow')}
            className={selectableClass(
              activeKey === 'eyebrow',
              'text-2xs mb-6 block font-semibold tracking-[0.24em] text-[#a39a88] uppercase'
            )}
          >
            {content.eyebrow}
          </span>
        ) : null}
        <h2
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'font-serif text-3xl leading-snug font-medium @2xl:text-5xl'
          )}
        >
          {content.title}
        </h2>
      </div>
    </div>
  );
}
