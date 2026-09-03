import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  IgnitexHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface IgnitexHeroProps {
  content: IgnitexHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** IgniteX hero — chữ "Design & Strategy" khổng lồ trên ảnh 3D nền tối +
 *  list dịch vụ đánh số góc dưới. Responsive. */
export function IgnitexHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: IgnitexHeroProps) {
  const styleOf = (k: string) =>
    composeStyle(
      elementStyleOf(styles, k),
      orderStyle(order, k),
      positionStyle(positions, k)
    );
  const services = Array.isArray(content.services) ? content.services : [];
  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container relative flex min-h-[85svh] w-full flex-col justify-between overflow-hidden bg-[#0a0a0a] px-6 py-14 text-white @2xl:px-12 @2xl:py-16',
        className
      )}
    >
      {content.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={content.imageUrl}
          alt=''
          className='absolute inset-0 h-full w-full object-cover opacity-70'
        />
      ) : null}
      <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40' />
      <div className='relative'>
        <span
          data-element-key='location'
          style={styleOf('location')}
          className={selectableClass(
            activeKey === 'location',
            'text-xs text-white/60'
          )}
        >
          {content.location}
        </span>
      </div>
      <div className='relative'>
        <h1
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'text-[16vw] leading-[0.9] font-semibold tracking-tight @2xl:text-[13vw]'
          )}
        >
          {content.titleLead}
          <span className='font-serif italic'> &amp; </span>
          {content.titleTrail}
        </h1>
        <div className='mt-8 flex flex-col gap-8 @2xl:flex-row @2xl:items-end @2xl:justify-between'>
          <p
            data-element-key='subtitle'
            style={styleOf('subtitle')}
            className={selectableClass(
              activeKey === 'subtitle',
              'max-w-xs text-sm text-white/70'
            )}
          >
            {content.subtitle}
          </p>
          <ul
            data-element-key='services'
            style={styleOf('services')}
            className={selectableClass(
              activeKey === 'services',
              'flex flex-col gap-2 text-right'
            )}
          >
            {services.map((sv, i) => (
              <li
                key={i}
                className='flex items-center justify-end gap-3 text-sm @2xl:text-base'
              >
                <span className='font-serif text-xs text-white/50 italic'>
                  ({String(i + 1).padStart(2, '0')})
                </span>
                {sv}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
