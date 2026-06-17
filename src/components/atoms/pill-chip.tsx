'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

/**
 * Filter pill with a trailing count. Used for Media filter (`All 0`, `Image 0`,
 * `Video 0`, `3D 0`) and Template category tabs (`Fashion 250`, `F&B 250`, …).
 */
export interface PillChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: React.ReactNode;
  count?: number | string;
  selected?: boolean;
}

const PillChip = React.forwardRef<HTMLButtonElement, PillChipProps>(
  (
    { className, label, count, selected = false, type = 'button', ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={selected}
        className={cn(
          'rounded-pill inline-flex h-8 cursor-pointer items-center gap-2 px-3 text-sm font-medium transition-colors',
          selected
            ? 'bg-foreground text-background'
            : 'text-content-muted hover:bg-muted',
          className
        )}
        {...props}
      >
        <span>{label}</span>
        {count !== undefined && (
          <span
            className={cn(
              'rounded-pill min-w-4 px-1.5 text-xs font-semibold',
              selected
                ? 'bg-background/20 text-background'
                : 'bg-muted text-content-muted'
            )}
          >
            {count}
          </span>
        )}
      </button>
    );
  }
);
PillChip.displayName = 'PillChip';

export { PillChip };
