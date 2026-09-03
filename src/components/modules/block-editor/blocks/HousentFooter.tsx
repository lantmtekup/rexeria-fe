import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HousentFooterContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface HousentFooterProps {
  content: HousentFooterContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Housent footer — `.footer-section` của housent.webflow.io. Nền tối, cột
 * brand + prompt "Need assistance?" + nhóm link + hàng legal dưới cùng.
 * Responsive: mobile stack, tablet+ nhiều cột.
 */
export function HousentFooter({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HousentFooterProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const columns = Array.isArray(content.columns) ? content.columns : [];

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-[#17120f] px-6 py-16 text-white @2xl:px-12 @2xl:py-20',
        className
      )}
    >
      <div className='mx-auto max-w-6xl'>
        <div className='grid grid-cols-1 gap-12 @2xl:grid-cols-[1.4fr_1fr_1fr]'>
          <div>
            <span
              data-element-key='brand'
              style={styleOf('brand')}
              className={selectableClass(
                activeKey === 'brand',
                'text-2xl font-semibold tracking-tight'
              )}
            >
              {content.brand}
            </span>
            <h2
              data-element-key='prompt'
              style={styleOf('prompt')}
              className={selectableClass(
                activeKey === 'prompt',
                'mt-6 max-w-sm text-2xl font-semibold text-white/90 @2xl:text-3xl'
              )}
            >
              {content.prompt}
            </h2>
            {content.email ? (
              <a
                href={`mailto:${content.email}`}
                onClick={e => e.preventDefault()}
                className='mt-5 inline-block text-sm text-[#e8622c]'
              >
                {content.email}
              </a>
            ) : null}
          </div>

          {columns.map((col, i) => (
            <div key={i} className='flex flex-col gap-3'>
              <span className='text-2xs mb-1 font-semibold tracking-[0.2em] text-white/40 uppercase'>
                {col.title}
              </span>
              {col.links.map((l, k) => (
                <a
                  key={k}
                  href='#'
                  onClick={e => e.preventDefault()}
                  className='text-sm text-white/70 transition-colors hover:text-white'
                >
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className='mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs tracking-[0.12em] text-white/50 uppercase @2xl:flex-row @2xl:items-center @2xl:justify-between'>
          <span>{content.copyright}</span>
        </div>
      </div>
    </div>
  );
}
