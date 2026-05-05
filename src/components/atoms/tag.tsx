import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

/**
 * Size/category chip — static display. For interactive selectable chips see `Chip`.
 */
const tagVariants = cva(
  'inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        neutral: 'bg-neutral-100 text-neutral-700',
        outline: 'border border-border bg-background text-neutral-700',
        primary: 'bg-primary-50 text-primary-600',
        success: 'bg-success-bg text-success',
        danger: 'bg-danger-bg text-danger',
      },
    },
    defaultVariants: { variant: 'neutral' },
  }
);

export interface TagProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {}

function Tag({ className, variant, ...props }: TagProps) {
  return (
    <span className={cn(tagVariants({ variant, className }))} {...props} />
  );
}

export { Tag, tagVariants };
