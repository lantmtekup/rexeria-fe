'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  VideoGalleryContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface VideoGalleryProps {
  content: VideoGalleryContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Video Gallery — lưới video showcase, hover để phát (muted), rời chuột tạm dừng.
 * Port pattern Minimalist Portfolio + Video Gallery (CodeGrid dec2023).
 */
export function VideoGallery({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: VideoGalleryProps) {
  const videos = content.videos ?? [];
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const play = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    e.currentTarget.play().catch(() => {});
  };
  const pause = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    v.pause();
    v.currentTime = 0;
  };

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container w-full rounded-md bg-[#0e0f13] px-6 py-14 duration-500 ease-out @2xl:px-10',
        className
      )}
    >
      {content.title && (
        <h2
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'mb-8 text-3xl font-bold tracking-tight text-white @2xl:text-5xl'
          )}
        >
          {content.title}
        </h2>
      )}
      <div className='grid grid-cols-1 gap-4 @md:grid-cols-2 @4xl:grid-cols-3'>
        {videos.map((v, i) => (
          <figure
            key={i}
            className='relative aspect-video overflow-hidden rounded-lg bg-white/5'
          >
            <video
              src={v.src}
              poster={v.poster}
              muted
              loop
              playsInline
              preload='metadata'
              onMouseEnter={play}
              onMouseLeave={pause}
              className='h-full w-full object-cover'
            />
            {v.title && (
              <figcaption className='absolute right-3 bottom-3 left-3 text-sm font-medium text-white drop-shadow'>
                {v.title}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}
