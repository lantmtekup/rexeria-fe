'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { Avatar } from '@/components/atoms/avatar';
import { cn } from '@/lib/cn';

export interface AccountCardProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'name'
> {
  /** Plan name / sub-label shown above the main label ("Basic plan") */
  sublabel: React.ReactNode;
  /** User name ("Huy Nguyễn") */
  name: React.ReactNode;
  avatarSrc?: string;
}

/**
 * Clickable user-plan row at the top of AppSidebar — avatar + two-line title
 * + chevron. Intended to open an account switcher dropdown.
 */
const AccountCard = React.forwardRef<HTMLButtonElement, AccountCardProps>(
  (
    { sublabel, name, avatarSrc, className, type = 'button', ...props },
    ref
  ) => {
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
        <Avatar
          src={avatarSrc}
          name={typeof name === 'string' ? name : undefined}
          size='md'
        />
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
AccountCard.displayName = 'AccountCard';

export { AccountCard };
