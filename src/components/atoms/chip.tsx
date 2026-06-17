'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

/**
 * Interactive, selectable chip. Used for Size picker (3.5 UK), etc.
 * When selected the chip flips to dark fill.
 */
const chipVariants = cva(
  'inline-flex cursor-pointer items-center justify-center rounded-pill border text-xs font-medium transition-colors select-none',
  {
    variants: {
      size: {
        sm: 'h-6 px-2.5',
        md: 'h-8 px-3',
      },
      selected: {
        true: 'border-foreground bg-foreground text-background',
        false: 'border-border bg-background text-content-muted hover:bg-muted',
      },
    },
    defaultVariants: { size: 'sm', selected: false },
  }
);

export interface ChipProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof chipVariants> {
  children: React.ReactNode;
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, size, selected, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={Boolean(selected)}
        className={cn(chipVariants({ size, selected, className }))}
        {...props}
      />
    );
  }
);
Chip.displayName = 'Chip';

export { Chip, chipVariants };
