import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  IgnitexAboutContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface IgnitexAboutProps {
  content: IgnitexAboutContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** IgniteX about — eyebrow + câu lớn + hàng mini-stat, nền tối. Responsive. */
export function IgnitexAbout({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: IgnitexAboutProps) {
  const styleOf = (k: string) =>
    composeStyle(
      elementStyleOf(styles, k),
      orderStyle(order, k),
      positionStyle(positions, k)
    );
  const stats = content.stats ?? [];
  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-[#0a0a0a] px-6 py-16 text-white @2xl:px-12 @2xl:py-24',
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
              'text-2xs mb-6 block font-semibold tracking-[0.24em] text-white/40 uppercase'
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
            'text-3xl leading-snug font-medium @2xl:text-4xl'
          )}
        >
          {content.title}
        </h2>
        <div
          data-element-key='stats'
          style={styleOf('stats')}
          className={selectableClass(
            activeKey === 'stats',
            'mt-14 grid grid-cols-2 gap-8 @2xl:grid-cols-4'
          )}
        >
          {stats.map((s, i) => (
            <div key={i} className='border-t border-white/12 pt-5'>
              <div className='text-3xl font-semibold @2xl:text-4xl'>
                {s.value}
              </div>
              <div className='mt-1 text-sm text-white/50'>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
