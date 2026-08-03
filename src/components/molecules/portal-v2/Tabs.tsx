'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

export type PortalTabItem = {
  id: string;
  label: React.ReactNode;
  count?: number | string;
};

export type TabsProps = {
  items: PortalTabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  'aria-label'?: string;
};

/**
 * Underline tabs for Portal V2 surfaces.
 */
export const Tabs = ({
  items,
  value,
  onChange,
  className,
  'aria-label': ariaLabel = 'Tabs',
}: TabsProps) => {
  return (
    <div
      role='tablist'
      aria-label={ariaLabel}
      className={cn(
        'flex gap-0.5 overflow-x-auto border-b border-[var(--pv2-hair)]',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className
      )}
    >
      {items.map(item => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type='button'
            role='tab'
            aria-selected={active}
            tabIndex={0}
            onClick={() => onChange(item.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(item.id);
              }
            }}
            className={cn(
              'relative flex shrink-0 items-center gap-2 px-3.5 py-2.5',
              'text-[13.5px] font-semibold transition-colors',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none',
              active
                ? 'text-[var(--pv2-electric)]'
                : 'text-[var(--pv2-mut)] hover:text-[var(--pv2-ink)]'
            )}
          >
            {item.label}
            {item.count !== undefined ? (
              <span
                className={cn(
                  'rounded-md px-1.5 py-px text-[11px] font-semibold tabular-nums',
                  active
                    ? 'bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]'
                    : 'bg-[var(--pv2-canvas)] text-[var(--pv2-mut)]'
                )}
              >
                {item.count}
              </span>
            ) : null}
            <span
              aria-hidden
              className={cn(
                'absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-colors',
                active ? 'bg-[var(--pv2-electric)]' : 'bg-transparent'
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
