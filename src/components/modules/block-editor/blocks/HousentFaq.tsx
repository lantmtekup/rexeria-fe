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

/** Housent `.faq-sectrion` — "Everything You Need to Know": nền sáng, 2 cột.
 *  Trái: eyebrow pill + heading + subtitle + nút CTA có avatar. Phải: mỗi câu
 *  hỏi là card sáng bo góc riêng, nút +/− trong ô vuông. Responsive: stack. */
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
  const items = Array.isArray(content.items) ? content.items : [];
  const [open, setOpen] = React.useState(0);
  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-[#f7f3ef] px-6 py-16 text-[#2b2621] @2xl:px-12 @2xl:py-24',
        className
      )}
    >
      <div className='mx-auto grid max-w-6xl grid-cols-1 gap-10 @2xl:grid-cols-[1fr_1.4fr] @2xl:gap-16'>
        <div className='@2xl:sticky @2xl:top-16 @2xl:self-start'>
          {content.eyebrow ? (
            <span
              data-element-key='eyebrow'
              style={styleOf('eyebrow')}
              className={selectableClass(
                activeKey === 'eyebrow',
                'text-2xs mb-4 inline-flex items-center gap-2 rounded-full bg-[#e8622c]/10 px-3 py-1.5 font-semibold tracking-[0.24em] text-[#e8622c] uppercase'
              )}
            >
              <span className='size-1.5 rounded-full bg-[#e8622c]' />
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
          {content.subtitle ? (
            <p
              data-element-key='subtitle'
              style={styleOf('subtitle')}
              className={selectableClass(
                activeKey === 'subtitle',
                'mt-4 max-w-xs text-base text-[#8a7f76]'
              )}
            >
              {content.subtitle}
            </p>
          ) : null}
          {content.ctaLabel ? (
            <span
              data-element-key='ctaLabel'
              style={styleOf('ctaLabel')}
              className={selectableClass(
                activeKey === 'ctaLabel',
                'mt-6 inline-flex items-center gap-3 rounded-full bg-[#17120f] py-2 pr-6 pl-2 text-xs font-semibold tracking-[0.1em] text-white uppercase'
              )}
            >
              {content.ctaAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={content.ctaAvatar}
                  alt=''
                  className='size-8 rounded-full object-cover'
                />
              ) : null}
              {content.ctaLabel}
            </span>
          ) : null}
        </div>
        <div
          data-element-key='items'
          style={styleOf('items')}
          className={selectableClass(
            activeKey === 'items',
            'flex flex-col gap-3'
          )}
        >
          {items.map((it, i) => (
            <div key={i} className='rounded-2xl bg-white px-6 @2xl:px-7'>
              <button
                type='button'
                onClick={() => setOpen(open === i ? -1 : i)}
                className='flex w-full items-center justify-between gap-4 py-5 text-left'
              >
                <span className='text-base font-medium @2xl:text-lg'>
                  {it.question}
                </span>
                <span className='flex size-7 shrink-0 items-center justify-center rounded-md bg-[#f7f3ef] text-lg text-[#e8622c]'>
                  {open === i ? '−' : '+'}
                </span>
              </button>
              {open === i ? (
                <p className='pb-5 text-sm leading-relaxed text-[#8a7f76]'>
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
