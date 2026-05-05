import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        /** solid blue primary CTA — Sign in, Save, Apply, Create */
        default:
          'rounded-md bg-primary text-primary-foreground shadow-sm hover:bg-primary-dark',
        /** solid blue pill — rarer, used for Launch */
        primary:
          'rounded-pill bg-primary text-primary-foreground shadow-sm hover:bg-primary-dark',
        /** black pill with icon — Add new product, Create new product, Create Marketing */
        pill: 'rounded-pill bg-neutral-900 text-neutral-0 hover:bg-neutral-800',
        /** light grey pill — Add more Marketing, Select product, Add more feature */
        'pill-light':
          'rounded-pill bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        /** outline blue pill — Edit button */
        outline:
          'rounded-pill border border-primary bg-background text-primary hover:bg-primary/5',
        /** generic ghost */
        ghost: 'rounded-md hover:bg-accent hover:text-accent-foreground',
        /** link style */
        link: 'text-primary underline-offset-4 hover:underline',
        /** destructive red */
        destructive:
          'rounded-md bg-destructive text-white shadow-sm hover:bg-destructive/90',
        /** secondary grey solid — rare */
        secondary:
          'rounded-md bg-secondary text-secondary-foreground shadow-sm hover:bg-neutral-200',
        /** AI-Assistant gradient button */
        ai: 'rounded-pill bg-ai-gradient text-primary-600 font-semibold hover:brightness-105',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'size-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
