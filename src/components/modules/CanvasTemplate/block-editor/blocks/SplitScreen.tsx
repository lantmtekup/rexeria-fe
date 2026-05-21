'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SplitScreenContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface SplitScreenProps {
  content: SplitScreenContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Two views side-by-side (or stacked on mobile). Tabs at the top let the
 * user pin one view as "active" — the inactive view dims & shrinks to give
 * visual focus, matching the "toggle between 2 views" pattern from the
 * smart-ad-demo studio.
 */
export function SplitScreen({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: SplitScreenProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const sEyebrow = styleOf('eyebrow');
  const sTitle = styleOf('title');
  const sDescription = styleOf('description');
  const sViews = styleOf('views');

  const views = content.views ?? [];
  const [activeIdx, setActiveIdx] = React.useState(
    Math.max(0, Math.min(views.length - 1, content.defaultIndex ?? 0))
  );

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in flex w-full flex-col gap-4 rounded-md bg-white px-6 py-10 duration-500 @2xl:gap-6 @2xl:px-12 @2xl:py-16',
        className
      )}
    >
      <div className='flex flex-col items-center gap-2 text-center'>
        {content.eyebrow && (
          <span
            data-element-key='eyebrow'
            style={sEyebrow}
            className={selectableClass(
              activeKey === 'eyebrow',
              'text-[10px] font-semibold tracking-[0.32em] text-neutral-500 uppercase @2xl:text-[11px]'
            )}
          >
            {content.eyebrow}
          </span>
        )}
        {content.title && (
          <h2
            data-element-key='title'
            style={sTitle}
            className={selectableClass(
              activeKey === 'title',
              'text-2xl font-semibold tracking-tight text-neutral-900 @2xl:text-4xl'
            )}
          >
            {content.title}
          </h2>
        )}
        {content.description && (
          <p
            data-element-key='description'
            style={sDescription}
            className={selectableClass(
              activeKey === 'description',
              'max-w-[60ch] text-sm text-neutral-600'
            )}
          >
            {content.description}
          </p>
        )}
      </div>

      {/* Tab strip */}
      {views.length > 1 && (
        <div className='flex justify-center gap-1.5'>
          {views.map((v, i) => (
            <button
              key={v.id}
              type='button'
              onClick={() => setActiveIdx(i)}
              className={cn(
                'rounded-pill h-9 cursor-pointer px-4 text-xs font-semibold transition-colors',
                i === activeIdx
                  ? 'bg-neutral-900 text-white shadow'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}

      {/* View panes — both visible side-by-side on tablet+, stacked on
          mobile. Active view scales slightly larger / drops opacity on the
          inactive twin to focus attention. */}
      <div
        data-element-key='views'
        style={sViews}
        className={selectableClass(
          activeKey === 'views',
          'grid grid-cols-1 gap-3 @2xl:grid-cols-2 @2xl:gap-5'
        )}
      >
        {views.map((v, i) => {
          const isActive = i === activeIdx;
          return (
            <div
              key={v.id}
              className={cn(
                'group relative overflow-hidden rounded-md border bg-neutral-50 transition-all',
                isActive
                  ? 'scale-100 border-neutral-900 opacity-100 shadow-md'
                  : 'scale-[0.98] border-neutral-200 opacity-70'
              )}
            >
              {v.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={v.imageUrl}
                  alt=''
                  className='aspect-[4/3] w-full object-cover'
                />
              )}
              <div className='flex flex-col gap-2 p-5'>
                <h3 className='text-lg font-semibold tracking-tight text-neutral-900'>
                  {v.title}
                </h3>
                {v.body && (
                  <p className='text-sm leading-relaxed text-neutral-600'>
                    {v.body}
                  </p>
                )}
                {v.ctaText && (
                  <a
                    href={v.ctaUrl || '#'}
                    onClick={e => e.preventDefault()}
                    className='rounded-pill mt-2 inline-flex h-9 w-fit items-center bg-neutral-900 px-4 text-xs font-semibold text-white hover:bg-neutral-700'
                  >
                    {v.ctaText}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
