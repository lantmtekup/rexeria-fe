'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

interface KnobOption<T extends string> {
  value: T;
  label: string;
}

interface KnobRowProps<T extends string> {
  label: string;
  value: T;
  options: KnobOption<T>[];
  disabled?: boolean;
  onChange: (next: T) => void;
}

/**
 * 3-segment selector for motion knobs (speed/intensity/cascade). Disabled
 * state grays the row out — used when the active preset doesn't expose
 * that knob.
 */
export function KnobRow<T extends string>({
  label,
  value,
  options,
  disabled,
  onChange,
}: KnobRowProps<T>) {
  return (
    <div
      className={cn(
        'flex items-center gap-2',
        disabled && 'pointer-events-none opacity-40'
      )}
    >
      <span className='w-16 shrink-0 font-mono text-[10px] tracking-[0.08em] text-neutral-400 uppercase'>
        {label}
      </span>
      <div
        role='radiogroup'
        aria-label={label}
        className='flex flex-1 items-center gap-0.5 rounded-md bg-neutral-100 p-0.5'
      >
        {options.map(opt => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type='button'
              role='radio'
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              data-testid={`knob-${label.toLowerCase()}-${opt.value}`}
              className={cn(
                'flex h-6 flex-1 cursor-pointer items-center justify-center rounded text-[10px] font-semibold tracking-tight transition-colors',
                active
                  ? 'bg-white text-neutral-900 shadow-[0_1px_0_rgba(0,0,0,0.04),0_0_0_0.5px_rgba(0,0,0,0.04)]'
                  : 'text-neutral-500 hover:text-neutral-900'
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
