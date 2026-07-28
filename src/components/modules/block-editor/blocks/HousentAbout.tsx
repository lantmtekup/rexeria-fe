import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HousentAboutContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface HousentAboutProps {
  content: HousentAboutContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Housent `.who-we-are-section` — intro 1 cột canh giữa. Hàng đầu: badge bo
 * viền (trái) + nút CTA đen (phải). Dưới: heading lớn + 2 đoạn mô tả. Nền be.
 */
export function HousentAbout({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HousentAboutProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-[#f7f3ef] px-6 py-16 @2xl:px-12 @2xl:py-24',
        className
      )}
    >
      <div className='mx-auto max-w-5xl'>
        {/* Hàng trên: badge trái + CTA phải */}
        <div className='flex items-center justify-between gap-4'>
          {content.eyebrow ? (
            <span
              data-element-key='eyebrow'
              style={styleOf('eyebrow')}
              className={selectableClass(
                activeKey === 'eyebrow',
                'text-2xs inline-flex items-center gap-2 rounded-md bg-white px-2.5 py-1.5 font-mono font-medium tracking-[0.16em] text-[#2b2621] uppercase'
              )}
            >
              <span className='size-2.5 rounded-sm bg-[#ff810a]' />
              {content.eyebrow}
            </span>
          ) : null}
          {content.ctaText ? (
            <button
              type='button'
              data-element-key='ctaText'
              style={styleOf('ctaText')}
              className={selectableClass(
                activeKey === 'ctaText',
                'text-2xs inline-flex shrink-0 items-center gap-2 rounded-md bg-[#201d1c] px-4 py-3 font-mono font-medium tracking-[0.12em] text-white uppercase'
              )}
            >
              <span className='text-[#ff810a]'>+</span>
              {content.ctaText}
            </button>
          ) : null}
        </div>

        {/* Heading + body: canh giữa */}
        <div className='mx-auto mt-10 max-w-3xl text-center @2xl:mt-16'>
          <h2
            data-element-key='title'
            style={styleOf('title')}
            className={selectableClass(
              activeKey === 'title',
              'text-4xl font-semibold tracking-tight text-[#2b2621] @2xl:text-6xl'
            )}
          >
            {content.title}
          </h2>
          <div className='mx-auto mt-8 flex max-w-2xl flex-col gap-5 text-left'>
            {content.text ? (
              <p
                data-element-key='text'
                style={styleOf('text')}
                className={selectableClass(
                  activeKey === 'text',
                  'text-base leading-relaxed text-[#6b6058]'
                )}
              >
                {content.text}
              </p>
            ) : null}
            {content.text2 ? (
              <p
                data-element-key='text2'
                style={styleOf('text2')}
                className={selectableClass(
                  activeKey === 'text2',
                  'text-base leading-relaxed text-[#6b6058]'
                )}
              >
                {content.text2}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
