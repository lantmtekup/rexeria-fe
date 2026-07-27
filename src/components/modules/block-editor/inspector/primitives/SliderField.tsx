'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import { CONTROL_H, TEXT_NUM } from '../tokens';

interface SliderFieldProps {
  /** undefined = không đặt; slider hiển thị `fallback` nhưng không ghi gì. */
  value: number | undefined;
  fallback: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  step: number;
  /** Format the numeric readout, e.g. `v => `${Math.round(v * 100)}%``. */
  format?: (v: number) => string;
  ariaLabel: string;
}

/**
 * Range input + numeric readout. The repo has no Radix Slider dependency —
 * every slider here (`ImagePicker`, `CanvasZoomBar`) is a native range input,
 * so this stays consistent instead of pulling in a new package.
 */
export function SliderField({
  value,
  fallback,
  onChange,
  min,
  max,
  step,
  format,
  ariaLabel,
}: SliderFieldProps) {
  const effective = value ?? fallback;
  return (
    <div className={cn('flex min-w-0 flex-1 items-center gap-2', CONTROL_H)}>
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={effective}
        onChange={e => onChange(Number(e.target.value))}
        aria-label={ariaLabel}
        className='accent-foreground h-1 min-w-0 flex-1 cursor-pointer'
      />
      <span
        className={cn('text-content-muted w-10 shrink-0 text-right', TEXT_NUM)}
      >
        {format ? format(effective) : effective}
      </span>
    </div>
  );
}
