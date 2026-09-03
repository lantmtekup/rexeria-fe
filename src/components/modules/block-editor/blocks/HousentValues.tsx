import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HousentValuesContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface HousentValuesProps {
  content: HousentValuesContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Housent `.values-stack-section` — "The Principles That Guide Our Expertise":
 *  nền tối, 2 cột. Trái: eyebrow pill + heading + subtitle. Phải: các card sáng
 *  bo góc, mỗi card gom 2 mục (icon + tiêu đề + mô tả). */
export function HousentValues({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HousentValuesProps) {
  const styleOf = (k: string) =>
    composeStyle(
      elementStyleOf(styles, k),
      orderStyle(order, k),
      positionStyle(positions, k)
    );
  const items = Array.isArray(content.items) ? content.items : [];
  const cards: (typeof items)[] = [];
  for (let i = 0; i < items.length; i += 2) {
    cards.push(items.slice(i, i + 2));
  }
  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-[#17120f] px-6 py-16 text-white @2xl:px-12 @2xl:py-24',
        className
      )}
    >
      <div className='mx-auto grid max-w-6xl grid-cols-1 gap-12 @3xl:grid-cols-[minmax(0,24rem)_1fr] @3xl:gap-16'>
        <div className='@3xl:sticky @3xl:top-16 @3xl:self-start'>
          {content.eyebrow ? (
            <span
              data-element-key='eyebrow'
              style={styleOf('eyebrow')}
              className={selectableClass(
                activeKey === 'eyebrow',
                'text-2xs mb-4 inline-flex items-center gap-2 rounded-full bg-[#e8622c]/15 px-3 py-1.5 font-semibold tracking-[0.24em] text-[#e8622c] uppercase'
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
                'mt-4 max-w-sm text-base text-white/55'
              )}
            >
              {content.subtitle}
            </p>
          ) : null}
        </div>
        <div
          data-element-key='items'
          style={styleOf('items')}
          className={selectableClass(
            activeKey === 'items',
            'grid grid-cols-1 gap-5 @xl:grid-cols-2'
          )}
        >
          {cards.map((card, ci) => (
            <div
              key={ci}
              className='flex flex-col rounded-2xl bg-[#f7f3ef] text-[#2b2621]'
            >
              {card.map((it, i) => (
                <div
                  key={i}
                  className='flex flex-col gap-4 border-t border-[#2b2621]/10 p-7 first:border-t-0'
                >
                  <span className='flex size-11 items-center justify-center rounded-xl bg-[#e8622c]/10 text-xl text-[#e8622c]'>
                    {it.icon || '◆'}
                  </span>
                  <h3 className='text-xl font-semibold tracking-tight'>
                    {it.title}
                  </h3>
                  {it.description ? (
                    <p className='text-sm leading-relaxed text-[#8a7f76]'>
                      {it.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
