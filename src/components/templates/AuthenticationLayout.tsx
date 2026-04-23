import * as React from 'react';

import { Logo } from '@/components/atoms/logo';
import { cn } from '@/lib/cn';

export interface AuthenticationLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Two-column auth shell used by Sign in / Sign up:
 *   ┌────────────────────┬──────────────────┐
 *   │ hero image (1/2)   │ logo + children  │
 *   └────────────────────┴──────────────────┘
 * Hero collapses on mobile so only the form column shows.
 */
export default function AuthenticationLayout({
  children,
  className,
}: AuthenticationLayoutProps) {
  return (
    <div
      className={cn(
        'bg-background text-foreground flex min-h-screen w-full',
        className
      )}
    >
      {/* Hero — hidden on mobile */}
      <aside
        aria-hidden
        className='relative hidden flex-1 overflow-hidden bg-neutral-200 md:block'
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src='/brand/sign-in-hero.png'
          alt=''
          className='absolute inset-0 size-full object-cover'
          draggable={false}
        />
      </aside>

      {/* Form column */}
      <section className='flex w-full flex-col items-center md:w-[538px] md:shrink-0'>
        <div className='flex w-full items-center justify-center py-5'>
          <Logo size={18} />
        </div>
        <div className='flex w-full flex-1 items-center justify-center px-6 pb-10 md:px-[60px]'>
          <div className='w-full max-w-[420px]'>{children}</div>
        </div>
      </section>
    </div>
  );
}
