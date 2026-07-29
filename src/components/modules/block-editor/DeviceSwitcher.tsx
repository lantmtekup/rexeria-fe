'use client';

import * as React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

import { cn } from '@/lib/cn';

import { DEVICE_FRAME_WIDTH } from './deviceFrame';
import type { Device } from './types';

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
          'flex items-center gap-0.5 rounded-md bg-neutral-100 p-0.5',
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
                'inline-flex size-7 cursor-pointer items-center justify-center rounded-[5px] text-neutral-500 transition-colors hover:text-neutral-900',
                active &&
                  'bg-white text-neutral-900 shadow-[0_1px_0_rgba(0,0,0,0.04),0_0_0_0.5px_rgba(0,0,0,0.04)]'
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
      ? 'flex shrink-0 items-center gap-1 rounded-lg border border-white/15 bg-[#0d0d10] p-1 shadow-lg'
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
