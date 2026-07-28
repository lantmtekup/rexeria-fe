import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  LumeaStatementContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface LumeaStatementProps {
  content: LumeaStatementContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Lumea `.about-section` — statement căn giữa: eyebrow + câu tuyên ngôn serif
 *  lớn. Nền cream. Responsive typography. */
export function LumeaStatement({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: LumeaStatementProps) {
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
        '@container w-full bg-[#efe9e1] px-6 py-20 text-center @2xl:px-12 @2xl:py-32',
        className
      )}
    >
      <div className='mx-auto max-w-4xl'>
        {content.eyebrow ? (
          <span
            data-element-key='eyebrow'
            style={styleOf('eyebrow')}
            className={selectableClass(
              activeKey === 'eyebrow',
              'text-2xs mb-8 block font-semibold tracking-[0.28em] text-[#a68a5b] uppercase'
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
            'font-serif text-3xl leading-[1.15] font-medium text-[#2b241d] @2xl:text-5xl'
          )}
        >
          {content.title}
        </h2>
      </div>
    </div>
  );
}
