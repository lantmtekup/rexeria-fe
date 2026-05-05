'use client';

import * as React from 'react';
import { ArrowLeft, MoreHorizontal, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { IconButton } from '@/components/atoms/icon-button';
import { cn } from '@/lib/cn';

export interface WorkspaceTopBarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> {
  /** Shown on the left after the back icon — can be a product name with pencil */
  title?: React.ReactNode;
  /** When true, render the title as an editable product-name row with pencil */
  titleEditable?: boolean;
  /** Override back button href; default uses router.back() */
  onBack?: () => void;
  /** Right-side actions (Import / API / Add new / Continue / Save / Launch…) */
  actions?: React.ReactNode;
  /** Optional center area — typically the top tabs */
  center?: React.ReactNode;
}

/**
 * Shared top bar for Product / AI-Agents workspace pages.
 *   ┌───────────────────────────────────────────────────────────────┐
 *   │ [<] <title>      … center (tabs) …            [actions]       │
 *   └───────────────────────────────────────────────────────────────┘
 */
function WorkspaceTopBar({
  title,
  titleEditable = false,
  onBack,
  actions,
  center,
  className,
  ...props
}: WorkspaceTopBarProps) {
  const router = useRouter();
  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <div
      className={cn(
        // Mobile: 2-row stacked layout (top: back+title+actions, bottom: tabs).
        // Desktop ≥ md: original single row.
        'border-border bg-background flex flex-col border-b px-3 md:h-14 md:flex-row md:items-center md:gap-3 md:px-4',
        className
      )}
      {...props}
    >
      <div className='flex h-12 min-w-0 items-center gap-2 md:h-auto md:gap-3'>
        <IconButton
          aria-label='Back'
          variant='default'
          size='sm'
          onClick={handleBack}
        >
          <ArrowLeft />
        </IconButton>

        {title && (
          <div
            className={cn(
              'text-foreground flex min-w-0 flex-1 items-center gap-2 rounded-md text-sm font-semibold tracking-[-0.02em] md:flex-none',
              titleEditable && 'bg-muted rounded-lg px-3 py-1.5 md:py-2'
            )}
          >
            <span className='min-w-0 flex-1 truncate md:flex-none'>
              {title}
            </span>
            {titleEditable && (
              <Pencil className='text-muted-foreground hidden size-3.5 shrink-0 md:inline' />
            )}
            {titleEditable && (
              <IconButton
                aria-label='More'
                variant='ghost'
                size='sm'
                className='-mr-2 ml-auto hidden md:inline-flex'
              >
                <MoreHorizontal />
              </IconButton>
            )}
          </div>
        )}
      </div>

      {center && (
        <div
          className={cn(
            // Mobile: scrollable second row.
            'scrollbar-hide -mx-3 flex items-center overflow-x-auto px-3 pb-2',
            // Desktop: centered, no scroll, in-row.
            'md:mx-0 md:flex-1 md:justify-center md:overflow-visible md:p-0'
          )}
        >
          {center}
        </div>
      )}
      {!center && <div className='hidden flex-1 md:block' />}

      {actions && (
        <div
          className={cn(
            // Mobile: dedicated bottom row, right-aligned, scrolls if huge.
            'scrollbar-hide -mx-3 flex shrink-0 items-center justify-end gap-2 overflow-x-auto border-t border-neutral-100 px-3 py-2',
            // Desktop: in-row, no border, no overflow.
            'md:mx-0 md:border-0 md:py-0'
          )}
        >
          {actions}
        </div>
      )}
    </div>
  );
}

export { WorkspaceTopBar };
