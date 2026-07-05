import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  ReadymagMarqueeContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface ReadymagMarqueeProps {
  content: ReadymagMarqueeContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Readymag (RADIUS) marquee — băng chạy ngang "WELCOM TO OUR NEW WEBSITE"
 *  xen pill "BOOK CALL". Nền trắng, chữ đen uppercase. */
export function ReadymagMarquee({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: ReadymagMarqueeProps) {
  const styleOf = (k: string) =>
    composeStyle(
      elementStyleOf(styles, k),
      orderStyle(order, k),
      positionStyle(positions, k)
    );
  const reps = Array.from({ length: 6 });
  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full overflow-hidden border-y border-black bg-white py-2.5 text-black',
        className
      )}
    >
      <div
        data-element-key='text'
        style={styleOf('text')}
        className={selectableClass(
          activeKey === 'text',
          'flex w-max items-center gap-4 whitespace-nowrap'
        )}
      >
        {reps.map((_, i) => (
          <React.Fragment key={i}>
            <span className='text-xs font-semibold tracking-[0.08em] uppercase @2xl:text-sm'>
              {content.text}
            </span>
            <span className='text-2xs rounded-full bg-black px-3 py-1 font-semibold tracking-wide text-white uppercase @2xl:text-xs'>
              {content.pill}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
