import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        /** circle grey — back button, 3-dot menu */
        default: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        /** transparent, hover surface */
        ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
        /** solid primary */
        primary: 'bg-primary text-primary-foreground hover:bg-primary-dark',
        /** outline */
        outline:
          'border border-border bg-background text-neutral-900 hover:bg-neutral-50',
      },
      size: {
        sm: 'size-7 [&_svg]:size-4',
        md: 'size-9 [&_svg]:size-4',
        lg: 'size-11 [&_svg]:size-5',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

export interface IconButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /** aria-label required for accessibility */
  'aria-label': string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(iconButtonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };
