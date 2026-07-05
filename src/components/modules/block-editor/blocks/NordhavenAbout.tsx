import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  NordhavenAboutContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface NordhavenAboutProps {
  content: NordhavenAboutContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Nordhaven `.about` — eyebrow + câu lớn uppercase + đoạn mô tả. Nền đen.
 *  Responsive typography. */
export function NordhavenAbout({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: NordhavenAboutProps) {
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
        '@container w-full bg-[#0e0e0e] px-6 py-20 text-white @2xl:px-12 @2xl:py-28',
        className
      )}
    >
      <div className='mx-auto max-w-5xl'>
        {content.eyebrow ? (
          <span
            data-element-key='eyebrow'
            style={styleOf('eyebrow')}
            className={selectableClass(
              activeKey === 'eyebrow',
              'text-2xs mb-8 block font-semibold tracking-[0.24em] text-white/40 uppercase'
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
            'text-3xl leading-tight font-medium tracking-tight uppercase @2xl:text-5xl'
          )}
        >
          {content.title}
        </h2>
        {content.text ? (
          <p
            data-element-key='text'
            style={styleOf('text')}
            className={selectableClass(
              activeKey === 'text',
              'mt-8 max-w-2xl text-base leading-relaxed text-white/55 @2xl:text-lg'
            )}
          >
            {content.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}
