'use client';

import * as React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

import { cn } from '@/lib/cn';

import { FLOATING, SEGMENT_ACTIVE } from './chrome';
import { DEVICE_FRAME_WIDTH } from '@/components/modules/block-editor/deviceFrame';
import type { Device } from '@/components/modules/block-editor/types';

const DEVICE_BUTTONS: {
  value: Device;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { value: 'desktop', icon: Monitor, label: 'Desktop' },
  { value: 'tablet', icon: Tablet, label: 'Tablet' },
  { value: 'mobile', icon: Smartphone, label: 'Mobile' },
];

type Variant = 'preview' | 'editor' | 'floating';

interface DeviceSwitcherProps {
  device: Device;
  onChange: (device: Device) => void;
  /** `preview` = dark compact bar; `editor` = light segmented control;
   *  `floating` = dark solid pill for fixed overlay on light/dark bg. */
  variant?: Variant;
  className?: string;
}

export function DeviceSwitcher({
  device,
  onChange,
  variant = 'preview',
  className,
}: DeviceSwitcherProps) {
  if (variant === 'editor') {
    return (
      <div
        role='group'
        aria-label='Thiết bị xem trước'
        className={cn(
          'flex items-center gap-0.5 rounded-[6px] bg-[var(--pv2-canvas)] p-0.5',
          className
        )}
      >
        {DEVICE_BUTTONS.map(({ value, icon: Icon, label }) => {
          const width = DEVICE_FRAME_WIDTH[value];
          const active = device === value;
          return (
            <button
              key={value}
              type='button'
              onClick={() => onChange(value)}
              aria-label={label}
              aria-pressed={active}
              title={`${label} · ${width}px`}
              className={cn(
                'inline-flex size-7 cursor-pointer items-center justify-center rounded-sm text-[var(--pv2-mut)] transition-colors hover:text-[var(--pv2-ink)]',
                active && SEGMENT_ACTIVE
              )}
            >
              <Icon className='size-3.5' />
            </button>
          );
        })}
      </div>
    );
  }

  const shellClass =
    variant === 'floating'
      ? // Keeps its hairline: this one floats over the live preview, so the
        // edge has to hold against whatever the block renders behind it.
        cn(
          'flex shrink-0 items-center gap-1 rounded-lg border border-white/15 bg-[#0d0d10] p-1',
          FLOATING
        )
      : 'flex shrink-0 items-center gap-0.5 rounded border border-white/10 bg-white/5 p-px';

  const btnSize =
    variant === 'floating'
      ? 'flex size-8 items-center justify-center rounded-md transition-colors'
      : 'flex size-5 items-center justify-center rounded-sm transition-colors';

  const iconSize = variant === 'floating' ? 'size-4' : 'size-3';

  return (
    <div
      role='group'
      aria-label='Thiết bị xem trước'
      className={cn(shellClass, className)}
    >
      {DEVICE_BUTTONS.map(({ value, icon: Icon, label }) => {
        const width = DEVICE_FRAME_WIDTH[value];
        const active = device === value;
        return (
          <button
            key={value}
            type='button'
            onClick={() => onChange(value)}
            aria-label={label}
            aria-pressed={active}
            title={`${label} · ${width}px`}
            className={cn(
              btnSize,
              active
                ? 'bg-amber-400 text-neutral-900'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            )}
          >
            <Icon className={iconSize} />
          </button>
        );
      })}
    </div>
  );
}
