'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HousentFaqContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface HousentFaqProps {
  content: HousentFaqContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Housent `.faq-sectrion` — "Everything You Need to Know": accordion mở/đóng.
 *  2 cột: heading trái, danh sách accordion phải. Responsive: mobile stack. */
export function HousentFaq({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HousentFaqProps) {
  const styleOf = (k: string) =>
    composeStyle(
      elementStyleOf(styles, k),
      orderStyle(order, k),
      positionStyle(positions, k)
    );
  const items = content.items ?? [];
  const [open, setOpen] = React.useState(0);
  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-[#17120f] px-6 py-16 text-white @2xl:px-12 @2xl:py-24',
        className
      )}
    >
      <div className='mx-auto grid max-w-6xl grid-cols-1 gap-10 @2xl:grid-cols-[1fr_1.4fr] @2xl:gap-16'>
        <div>
          {content.eyebrow ? (
            <span
              data-element-key='eyebrow'
              style={styleOf('eyebrow')}
              className={selectableClass(
                activeKey === 'eyebrow',
                'text-2xs mb-3 block font-semibold tracking-[0.24em] text-[#e8622c] uppercase'
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
              'text-3xl font-semibold tracking-tight @2xl:text-5xl'
            )}
          >
            {content.title}
          </h2>
        </div>
        <div
          data-element-key='items'
          style={styleOf('items')}
          className={selectableClass(activeKey === 'items', 'flex flex-col')}
        >
          {items.map((it, i) => (
            <div key={i} className='border-t border-white/10'>
              <button
                type='button'
                onClick={() => setOpen(open === i ? -1 : i)}
                className='flex w-full items-center justify-between gap-4 py-5 text-left'
              >
                <span className='text-base font-medium @2xl:text-lg'>
                  {it.question}
                </span>
                <span className='text-xl text-[#e8622c]'>
                  {open === i ? '−' : '+'}
                </span>
              </button>
              {open === i ? (
                <p className='pb-5 text-sm leading-relaxed text-white/60'>
                  {it.answer}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
