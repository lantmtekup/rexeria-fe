'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import { CONTROL_H, CONTROL_H_INNER, TEXT_CONTROL } from '../tokens';

export interface SegmentedOption<T> {
  value: T;
  label: string;
  /** Icon-only segments still need a readable name for a11y + tooltip. */
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T> {
  options: SegmentedOption<T>[];
  value: T | undefined;
  onChange: (next: T) => void;
  /** Clicking the active segment clears the value (toggle-off). */
  allowDeselect?: boolean;
  onDeselect?: () => void;
  ariaLabel: string;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  allowDeselect = false,
  onDeselect,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role='group'
      aria-label={ariaLabel}
      className={cn(
        'border-border bg-muted/40 flex min-w-0 flex-1 items-center gap-px rounded-md border p-px',
        CONTROL_H
      )}
    >
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type='button'
            aria-pressed={active}
            title={opt.label}
            onClick={() => {
              if (active && allowDeselect) {
                onDeselect?.();
                return;
              }
              onChange(opt.value);
            }}
            className={cn(
              'flex min-w-0 flex-1 cursor-pointer items-center justify-center rounded-sm px-1 transition-colors',
              CONTROL_H_INNER,
              TEXT_CONTROL,
              active
                ? 'bg-foreground text-background font-medium'
                : 'text-content-muted hover:bg-muted hover:text-foreground'
            )}
          >
            {opt.icon ?? <span className='truncate'>{opt.label}</span>}
            {opt.icon && <span className='sr-only'>{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
