import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  PhotoGalleryContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { TransformedImage } from './TransformedImage';

interface PhotoGalleryProps {
  content: PhotoGalleryContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function PhotoGallery({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: PhotoGalleryProps) {
  const photos = (content.photos ?? []).slice(0, 5);
  const hasFive = photos.length >= 5;
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const sEyebrow = styleOf('eyebrow');
  const sTitle = styleOf('title');
  const sDescription = styleOf('description');
  const sPhotos = styleOf('photos');

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in slide-in-from-bottom-4 relative w-full overflow-hidden rounded-md bg-neutral-50 px-6 py-10 duration-700 ease-out @2xl:px-12 @2xl:py-16 @4xl:px-20 @4xl:py-20',
        className
      )}
    >
      <div className='flex flex-col gap-3 @2xl:max-w-[60ch]'>
        {content.eyebrow && (
          <span
            data-element-key='eyebrow'
            style={sEyebrow}
            className={selectableClass(
              activeKey === 'eyebrow',
              'animate-reveal-x inline-flex w-fit items-center gap-2 text-[10px] font-semibold tracking-[0.32em] text-neutral-400 uppercase [animation-delay:900ms] [animation-duration:700ms] @2xl:text-xs'
            )}
          >
            <span className='size-1 shrink-0 rounded-full bg-neutral-400' />
            {content.eyebrow}
          </span>
        )}
        <h2
          data-element-key='title'
          style={sTitle}
          className={selectableClass(
            activeKey === 'title',
            'animate-reveal-x text-2xl leading-[1.15] font-semibold text-neutral-900 [animation-delay:1100ms] [animation-duration:1200ms] @2xl:text-4xl @4xl:text-5xl'
          )}
        >
          {content.title}
        </h2>
        {content.description && (
          <p
            data-element-key='description'
            style={sDescription}
            className={selectableClass(
              activeKey === 'description',
              'animate-soft-rise text-sm text-neutral-500 [animation-delay:1700ms] @2xl:text-base @2xl:leading-7'
            )}
          >
            {content.description}
          </p>
        )}
      </div>

      {photos.length > 0 && (
        <div
          data-element-key='photos'
          style={sPhotos}
          className={selectableClass(
            activeKey === 'photos',
            cn(
              'mt-8 grid gap-2 @2xl:mt-10 @2xl:gap-3',
              hasFive
                ? 'grid-cols-2 @2xl:grid-cols-3 @2xl:[grid-template-rows:repeat(2,minmax(160px,1fr))]'
                : photos.length === 4
                  ? 'grid-cols-2 @2xl:grid-cols-4'
                  : photos.length === 3
                    ? 'grid-cols-2 @2xl:grid-cols-3'
                    : 'grid-cols-2'
            )
          )}
        >
          {photos.map((p, i) => (
            <figure
              key={i}
              style={{ animationDelay: `${2200 + i * 100}ms` }}
              className={cn(
                'animate-in fade-in zoom-in-95 group/photo fill-mode-both relative aspect-[4/3] overflow-hidden rounded-md bg-neutral-200 duration-500 ease-out',
                hasFive &&
                  i === 0 &&
                  '@2xl:col-span-2 @2xl:row-span-2 @2xl:aspect-auto'
              )}
            >
              <div className='h-full w-full transition-transform duration-[1200ms] ease-out group-hover/photo:scale-110'>
                <TransformedImage src={p.url} transform={p.transform} />
              </div>
              {p.caption && (
                <figcaption className='absolute right-0 bottom-0 left-0 translate-y-1 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 text-xs font-medium text-white opacity-90 transition-all duration-300 ease-out group-hover/photo:translate-y-0 group-hover/photo:opacity-100'>
                  {p.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
