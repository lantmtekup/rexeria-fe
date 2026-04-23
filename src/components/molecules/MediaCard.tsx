'use client';

import * as React from 'react';
import { MoreVertical } from 'lucide-react';

import { cn } from '@/lib/cn';

export interface MediaCardProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'onSelect'
> {
  name: string;
  createdAt: string;
  /** Thumbnail URL */
  imageSrc?: string;
  /** Selection state */
  selected?: boolean;
  onSelect?: (next: boolean) => void;
  /** Open the 3-dot menu */
  onMenu?: () => void;
}

/**
 * Square media tile — thumbnail, checkbox top-left, 3-dot top-right,
 * name + createdAt below.
 */
function MediaCard({
  name,
  createdAt,
  imageSrc,
  selected = false,
  onSelect,
  onMenu,
  className,
  ...props
}: MediaCardProps) {
  return (
    <article
      className={cn(
        'group border-border bg-background flex flex-col gap-3 overflow-hidden rounded-xl border p-3 transition-colors hover:border-neutral-300',
        selected && 'border-primary ring-primary/30 ring-1',
        className
      )}
      {...props}
    >
      <div className='relative aspect-square overflow-hidden rounded-lg bg-neutral-100'>
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={name}
            className='size-full object-cover'
            draggable={false}
          />
        ) : (
          <div className='text-content-muted flex size-full items-center justify-center text-xs'>
            {name}
          </div>
        )}
        <button
          type='button'
          aria-pressed={selected}
          onClick={() => onSelect?.(!selected)}
          className={cn(
            'absolute top-2 left-2 flex size-5 cursor-pointer items-center justify-center rounded-full border transition-colors',
            selected
              ? 'border-primary bg-primary text-primary-foreground'
              : 'bg-background/90 border-neutral-300'
          )}
        >
          {selected && (
            <svg viewBox='0 0 16 16' className='size-3' fill='currentColor'>
              <path d='M6.2 12.2 2.6 8.6l1.2-1.2 2.4 2.4 5.6-5.6 1.2 1.2z' />
            </svg>
          )}
        </button>
      </div>
      <div className='flex items-start gap-2 px-1'>
        <div className='min-w-0 flex-1'>
          <p className='text-foreground truncate text-sm font-semibold'>
            {name}
          </p>
          <p className='text-content-muted text-xs'>Create: {createdAt}</p>
        </div>
        <button
          type='button'
          aria-label='More'
          onClick={onMenu}
          className='text-content-muted hover:text-foreground inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-neutral-100'
        >
          <MoreVertical className='size-4' />
        </button>
      </div>
    </article>
  );
}

export { MediaCard };
