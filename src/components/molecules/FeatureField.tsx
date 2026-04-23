'use client';

import * as React from 'react';
import { Info, Plus, Upload } from 'lucide-react';

import { cn } from '@/lib/cn';

export interface FeatureFieldProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> {
  label: string;
  description?: string;
  placeholder?: string;
  /** Render the "+ Add more feature" button below the description box */
  showAddMore?: boolean;
  showUpload?: boolean;
  /** Render slot on the right of the label */
  info?: boolean;
}

/**
 * Large multi-line text field used across Marketing Discovery / Concept / Assets.
 * Layout: left column is the label; right column is a rounded description box
 * with optional "See More" link, upload icon, and an "Add more feature" button
 * below.
 */
function FeatureField({
  label,
  description,
  placeholder = 'Describe something',
  showAddMore = false,
  showUpload = true,
  info = true,
  className,
  ...props
}: FeatureFieldProps) {
  return (
    <div
      className={cn('grid grid-cols-[160px_1fr] items-start gap-6', className)}
      {...props}
    >
      <div className='text-foreground flex items-center gap-1 pt-2 text-sm font-semibold'>
        {label}
        {info && <Info className='text-content-muted size-3.5' />}
      </div>
      <div className='flex flex-col gap-3'>
        <div className='border-border bg-background rounded-xl border p-4'>
          <div className='text-content-muted mb-1 text-xs font-semibold'>
            Description
          </div>
          {description ? (
            <p className='text-foreground text-sm'>
              {description}{' '}
              <button
                type='button'
                className='text-primary cursor-pointer hover:underline'
              >
                See More
              </button>
            </p>
          ) : (
            <p className='text-content-muted text-sm'>{placeholder}</p>
          )}
          {showUpload && (
            <div className='mt-3 flex items-center'>
              <button
                type='button'
                aria-label='Upload'
                className='text-content-muted hover:text-foreground inline-flex size-6 cursor-pointer items-center justify-center'
              >
                <Upload className='size-4' />
              </button>
            </div>
          )}
        </div>
        {showAddMore && (
          <button
            type='button'
            className='rounded-pill text-neutral-0 inline-flex h-8 w-fit cursor-pointer items-center gap-1 bg-neutral-900 px-3 text-xs font-semibold hover:bg-neutral-800'
          >
            <Plus className='size-3.5' /> Add more feature
          </button>
        )}
      </div>
    </div>
  );
}

export { FeatureField };
