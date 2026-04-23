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
        'border-border bg-background flex h-14 items-center gap-3 border-b px-4',
        className
      )}
      {...props}
    >
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
            'text-foreground flex min-w-0 items-center gap-2 rounded-md text-sm font-semibold tracking-[-0.02em]',
            titleEditable && 'bg-muted rounded-lg px-3 py-2'
          )}
        >
          <span className='truncate'>{title}</span>
          {titleEditable && (
            <Pencil className='text-muted-foreground size-3.5' />
          )}
          {titleEditable && (
            <IconButton
              aria-label='More'
              variant='ghost'
              size='sm'
              className='-mr-2 ml-auto'
            >
              <MoreHorizontal />
            </IconButton>
          )}
        </div>
      )}

      {center && (
        <div className='flex flex-1 items-center justify-center'>{center}</div>
      )}
      {!center && <div className='flex-1' />}

      {actions && <div className='flex items-center gap-2'>{actions}</div>}
    </div>
  );
}

export { WorkspaceTopBar };
