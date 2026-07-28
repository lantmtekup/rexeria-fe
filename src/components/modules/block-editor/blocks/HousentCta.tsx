import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HousentCtaContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface HousentCtaProps {
  content: HousentCtaContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Housent CTA — `.cta-serction` của housent.webflow.io. Băng cam bo góc lớn,
 * heading trắng đậm + nút CTA + ảnh nền phủ nhẹ. Responsive padding.
 */
export function HousentCta({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HousentCtaProps) {
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
        '@container w-full bg-[#f7f3ef] px-6 py-12 @2xl:px-12 @2xl:py-16',
        className
      )}
    >
      <div className='relative mx-auto flex max-w-6xl flex-col items-center overflow-hidden rounded-3xl bg-[#e8622c] px-8 py-16 text-center @2xl:px-16 @2xl:py-24'>
        {content.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.imageUrl}
            alt=''
            className='absolute inset-0 h-full w-full object-cover opacity-20'
          />
        ) : null}
        <div className='relative flex flex-col items-center'>
          <h2
            data-element-key='title'
            style={styleOf('title')}
            className={selectableClass(
              activeKey === 'title',
              'max-w-2xl text-3xl font-semibold tracking-tight text-white @2xl:text-5xl'
            )}
          >
            {content.title}
          </h2>
          {content.subtitle ? (
            <p
              data-element-key='subtitle'
              style={styleOf('subtitle')}
              className={selectableClass(
                activeKey === 'subtitle',
                'mt-4 max-w-lg text-base text-white/85'
              )}
            >
              {content.subtitle}
            </p>
          ) : null}
          <a
            data-element-key='button'
            href={content.buttonUrl || '#'}
            onClick={e => e.preventDefault()}
            style={styleOf('button')}
            className={selectableClass(
              activeKey === 'button',
              'mt-8 inline-flex h-12 items-center rounded-full bg-white px-8 text-sm font-semibold tracking-wide text-[#17120f] uppercase'
            )}
          >
            {content.buttonLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
