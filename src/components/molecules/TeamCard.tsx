'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/cn';

export interface TeamCardProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'name' | 'color'
> {
  /** Section label ("Team") */
  sublabel: React.ReactNode;
  /** Team name ("Hnd.Studio") */
  name: React.ReactNode;
  /** Short initial letter for the coloured avatar — defaults to first char of name */
  initial?: string;
  /** Avatar background — defaults to REXER brand green */
  color?: string;
}

/**
 * Team row under AccountCard. Uses a solid coloured round avatar with a bold
 * initial letter (matches the `H` green tile in the Figma source).
 */
const TeamCard = React.forwardRef<HTMLButtonElement, TeamCardProps>(
  (
    {
      sublabel,
      name,
      initial,
      color = '#00FF5E',
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const char =
      initial ??
      (typeof name === 'string' ? name.trim().charAt(0).toUpperCase() : '?');
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-left transition-colors',
          className
        )}
        {...props}
      >
        <span
          aria-hidden
          className='flex size-9 shrink-0 items-center justify-center rounded-full text-lg leading-none font-black tracking-[-0.02em] text-neutral-900'
          style={{ backgroundColor: color }}
        >
          {char}
        </span>
        <div className='flex min-w-0 flex-1 flex-col'>
          <span className='truncate text-xs font-bold tracking-[-0.02em] text-neutral-500'>
            {sublabel}
          </span>
          <span className='text-foreground truncate text-sm font-semibold tracking-[-0.02em]'>
            {name}
          </span>
        </div>
        <ChevronDown className='size-5 shrink-0 text-neutral-500' />
      </button>
    );
  }
);
TeamCard.displayName = 'TeamCard';

export { TeamCard };
