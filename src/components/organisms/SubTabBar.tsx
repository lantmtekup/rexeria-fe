'use client';

import * as React from 'react';
import Link from 'next/link';

import { cn } from '@/lib/cn';

export interface SubTab {
  key: string;
  label: React.ReactNode;
  href?: string;
}

export interface SubTabBarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  tabs: SubTab[];
  activeKey: string;
  onChange?: (key: string) => void;
}

/**
 * Wide two-tab bar stretching across the content width.
 * Used on Product workspace: `Information | Media`.
 * Active tab has a thick underline that reaches the container edge.
 */
function SubTabBar({
  tabs,
  activeKey,
  onChange,
  className,
  ...props
}: SubTabBarProps) {
  return (
    <div
      role='tablist'
      className={cn('border-border flex border-b', className)}
      {...props}
    >
      {tabs.map(t => {
        const active = t.key === activeKey;
        const cls = cn(
          'relative flex flex-1 cursor-pointer items-center justify-center py-3 text-sm font-semibold tracking-[-0.02em] transition-colors',
          active
            ? 'text-foreground'
            : 'text-content-muted hover:text-foreground'
        );
        const underline = active && (
          <span className='bg-foreground absolute inset-x-4 -bottom-[1px] h-[2px] rounded-full' />
        );
        if (t.href) {
          return (
            <Link
              key={t.key}
              href={t.href}
              role='tab'
              aria-selected={active}
              className={cls}
            >
              {t.label}
              {underline}
            </Link>
          );
        }
        return (
          <button
            key={t.key}
            type='button'
            role='tab'
            aria-selected={active}
            onClick={() => onChange?.(t.key)}
            className={cls}
          >
            {t.label}
            {underline}
          </button>
        );
      })}
    </div>
  );
}

export { SubTabBar };
