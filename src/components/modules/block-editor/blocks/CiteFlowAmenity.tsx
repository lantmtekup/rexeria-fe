'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';
import { findFont } from '@/lib/fonts';

import type {
  BlockBackground,
  CiteFlowAmenityContent,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface CiteFlowAmenityProps {
  content: CiteFlowAmenityContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const HEADING_FONT_FAMILY = findFont('aboreto').family;

const DEFAULT_HEADING = 'Onsen & Wellness Pavilion';
const DEFAULT_VIDEO_URL = '/cite-flow/amenity-loop.mp4';
const DEFAULT_LIST_ITEMS = [
  'Lush greenery, forested corridors, walking paths beside water.',
  'Views, fresh air, natural microclimate.',
];

const resolveListItems = (content: CiteFlowAmenityContent): string[] => {
  const items = content.listItems;
  if (Array.isArray(items) && items.length > 0) return items;
  return DEFAULT_LIST_ITEMS;
};

const HEADING_BASE_STYLE: React.CSSProperties = {
  color: '#00940c',
  fontFamily: HEADING_FONT_FAMILY,
};

const LIST_BASE_STYLE: React.CSSProperties = {
  color: '#000000',
  fontFamily: HEADING_FONT_FAMILY,
};

export function CiteFlowAmenity({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CiteFlowAmenityProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const items = React.useMemo(() => resolveListItems(content), [content]);
  const heading = content.heading?.trim() || DEFAULT_HEADING;
  const videoUrl = content.videoUrl?.trim() || DEFAULT_VIDEO_URL;

  const headingEl = (
    <h2
      data-element-key='heading'
      style={composeStyle(HEADING_BASE_STYLE, styleOf('heading'))}
      className={selectableClass(
        activeKey === 'heading',
        'w-full text-center text-[45px] leading-[0.82em] tracking-[-0.035em] uppercase @4xl:text-[70px]'
      )}
    >
      {heading}
    </h2>
  );

  const videoEl = (
    <video
      data-element-key='videoUrl'
      src={videoUrl}
      loop
      autoPlay
      muted
      playsInline
      style={composeStyle({}, styleOf('videoUrl'))}
      className={selectableClass(
        activeKey === 'videoUrl',
        'h-130 w-full object-cover'
      )}
    />
  );

  const listEl = (
    <div className='flex w-full max-w-225 flex-col place-content-center items-center gap-2.5 overflow-hidden px-5 pt-15'>
      <div className='relative z-2 flex h-auto w-full flex-none flex-col justify-start wrap-break-word whitespace-pre-wrap'>
        <ul className='list-disc space-y-2 pl-6 text-[30px] leading-[1.17em] tracking-[-0.01em] uppercase'>
          {items.map((item, i) => {
            const itemKey = `listItems[${i}]`;
            return (
              <li
                key={i}
                data-element-key={itemKey}
                style={composeStyle(LIST_BASE_STYLE, styleOf(itemKey))}
                className={selectableClass(
                  activeKey === itemKey,
                  'mb-0 leading-[1.2em] font-normal'
                )}
              >
                {item}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        style={blockBackgroundStyle(background)}
        className={cn(
          '@container relative flex w-full flex-col items-center gap-10 bg-neutral-100 px-5 py-25',
          className
        )}
      >
        <div className='w-full'>{headingEl}</div>
        <div className='w-full overflow-hidden @4xl:w-195'>{videoEl}</div>
        {listEl}
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container relative flex w-full flex-col items-center bg-neutral-100 pt-25 pb-50',
        className
      )}
    >
      <div className='relative flex w-full flex-col items-center'>
        <div className='sticky top-57.5 w-full overflow-hidden px-5'>
          <div className='relative h-auto w-full flex-none'>{headingEl}</div>
        </div>

        <div className='relative z-10 flex w-full flex-col overflow-hidden pt-12.5 pb-38.75 @4xl:w-195 @4xl:pb-77.5'>
          {videoEl}
        </div>
      </div>

      {listEl}
    </section>
  );
}
