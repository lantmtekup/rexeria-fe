'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/cn';

const portalButtonVariants = cva(
  cn(
    'inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap',
    'text-[13px] font-semibold transition-colors',
    'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0'
  ),
  {
    variants: {
      variant: {
        primary: cn(
          'rounded-full bg-[var(--pv2-electric)] text-[var(--pv2-paper)]',
          'shadow-[0_2px_8px_rgba(56,98,255,0.18)]',
          'hover:bg-[var(--pv2-electric-hover)]'
        ),
        ghost: cn(
          'rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-transparent text-[var(--pv2-ink)]',
          'hover:border-[var(--pv2-slate-300)] hover:bg-[var(--pv2-canvas)]'
        ),
        danger: cn(
          'rounded-[var(--pv2-r)] text-[var(--pv2-error)]',
          'hover:bg-[color-mix(in_srgb,var(--pv2-error)_10%,transparent)]'
        ),
        dashed: cn(
          'w-full rounded-[var(--pv2-r-sm)] border border-dashed border-[var(--pv2-hair)]',
          'text-[var(--pv2-electric)] hover:border-[var(--pv2-electric)] hover:bg-[var(--pv2-electric-soft)]'
        ),
      },
      size: {
        sm: 'h-8 px-3 text-xs [&_svg]:size-3.5',
        default: 'h-[34px] px-3.5 [&_svg]:size-4',
        lg: 'h-10 px-4 [&_svg]:size-[18px]',
        icon: 'size-9 rounded-[var(--pv2-r)] p-0 [&_svg]:size-[18px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export type PortalButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof portalButtonVariants> & {
    asChild?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, PortalButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? 'button')}
        className={cn(portalButtonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = 'PortalV2Button';

export { portalButtonVariants };
