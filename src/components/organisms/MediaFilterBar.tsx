'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';

import { PillChip } from '@/components/atoms/pill-chip';
import { cn } from '@/lib/cn';

export type MediaFilter = 'all' | 'image' | 'video' | '3d';

export interface MediaCounts {
  all: number;
  image: number;
  video: number;
  '3d': number;
}

export interface MediaFilterBarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  active: MediaFilter;
  counts: MediaCounts;
  onChange: (next: MediaFilter) => void;
  onNew?: () => void;
}

function MediaFilterBar({
  active,
  counts,
  onChange,
  onNew,
  className,
  ...props
}: MediaFilterBarProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {onNew && (
        <button
          type='button'
          onClick={onNew}
          className='rounded-pill text-neutral-0 inline-flex h-8 cursor-pointer items-center gap-1.5 bg-neutral-900 px-3 text-xs font-semibold hover:bg-neutral-800'
        >
          <Plus className='size-3.5' />
          New
        </button>
      )}
      <PillChip
        label='All'
        count={counts.all}
        selected={active === 'all'}
        onClick={() => onChange('all')}
      />
      <PillChip
        label='Image'
        count={counts.image}
        selected={active === 'image'}
        onClick={() => onChange('image')}
      />
      <PillChip
        label='Video'
        count={counts.video}
        selected={active === 'video'}
        onClick={() => onChange('video')}
      />
      <PillChip
        label='3D'
        count={counts['3d']}
        selected={active === '3d'}
        onClick={() => onChange('3d')}
      />
    </div>
  );
}

export { MediaFilterBar };
