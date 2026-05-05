'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

export interface TemplateCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  author: string;
  /** Thumbnail image URL. When omitted, a neutral placeholder with the name is shown. */
  imageSrc?: string;
  /** Override background for the image area (CSS value) */
  imageBg?: string;
  /** Aspect ratio of the image area — defaults to Figma 386/247 ≈ 1.56 */
  imageAspect?: string;
}

/**
 * Vertical card: cover image on top, name (left) + author (right) below.
 * Used on Home Template column and Template list.
 */
function TemplateCard({
  name,
  author,
  imageSrc,
  imageBg,
  imageAspect = '386 / 247',
  className,
  ...props
}: TemplateCardProps) {
  return (
    <article className={cn('group flex flex-col gap-3', className)} {...props}>
      <div
        className='relative w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800'
        style={{ aspectRatio: imageAspect, background: imageBg }}
      >
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={name}
            className='size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]'
            draggable={false}
          />
        ) : (
          <div className='flex size-full items-center justify-center'>
            <span className='text-2xl font-black tracking-[-0.04em] text-neutral-900/80 uppercase'>
              {name}
            </span>
          </div>
        )}
      </div>
      <div className='flex items-baseline justify-between gap-2 px-1 text-sm'>
        <span className='text-foreground min-w-0 flex-1 truncate font-semibold tracking-[-0.02em]'>
          {name}
        </span>
        <span className='text-content-muted shrink-0 text-xs'>{author}</span>
      </div>
    </article>
  );
}

export { TemplateCard };
