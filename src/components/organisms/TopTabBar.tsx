'use client';

import * as React from 'react';
import Link from 'next/link';

import { cn } from '@/lib/cn';

export interface TopTab {
  key: string;
  label: React.ReactNode;
  href?: string;
  disabled?: boolean;
}

export interface TopTabBarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  tabs: TopTab[];
  activeKey: string;
  onChange?: (key: string) => void;
}

/**
 * Horizontal tab bar with an underline under the active tab.
 * Used above the content area: `Product | Marketing` (Product module),
 * `Design | Prototype` (editor property panel).
 */
function TopTabBar({
  tabs,
  activeKey,
  onChange,
  className,
  ...props
}: TopTabBarProps) {
  return (
    <div
      role='tablist'
      className={cn('flex items-center gap-6', className)}
      {...props}
    >
      {tabs.map(t => {
        const active = t.key === activeKey;
        const cls = cn(
          'relative cursor-pointer py-3 text-sm font-bold tracking-[-0.02em] transition-colors',
          active
            ? 'text-foreground'
            : 'text-content-muted hover:text-foreground',
          t.disabled && 'pointer-events-none opacity-60'
        );
        const underline = active && (
          <span className='bg-foreground absolute inset-x-0 bottom-0 h-0.5 rounded-full' />
        );
        if (t.href && !t.disabled) {
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
            disabled={t.disabled}
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

export { TopTabBar };
