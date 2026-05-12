'use client';

import * as React from 'react';
import { Play, ZoomIn, ZoomOut } from 'lucide-react';

import type { BlockMotion, MotionTrigger } from '../types';

interface BlockControlsBarProps {
  motion: BlockMotion;
  onChange: (next: BlockMotion) => void;
  onPlay: () => void;
  pxPerMs: number;
  onPxPerMsChange: (px: number) => void;
}

const TRIGGERS: { value: MotionTrigger; label: string }[] = [
  { value: 'in-view', label: 'Khi vào view' },
  { value: 'load', label: 'Khi load' },
  { value: 'scroll-progress', label: 'Theo scroll' },
];

export function BlockControlsBar({
  motion,
  onChange,
  onPlay,
  pxPerMs,
  onPxPerMsChange,
}: BlockControlsBarProps) {
  return (
    <div className='flex h-11 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4'>
      <button
        type='button'
        onClick={onPlay}
        data-testid='motion-play'
        className='flex h-7 cursor-pointer items-center gap-1.5 rounded-md bg-neutral-900 px-3 text-[11px] font-semibold text-white transition-colors hover:bg-neutral-700'
      >
        <Play className='size-3' />
        Phát
      </button>

      <Field label='Duration'>
        <input
          type='number'
          min={0}
          step={50}
          value={motion.duration}
          data-testid='motion-duration'
          onChange={e =>
            onChange({
              ...motion,
              duration: Math.max(0, Number(e.target.value)),
            })
          }
          className='h-7 w-20 rounded-md border border-neutral-200 bg-white px-2 text-[11px] tabular-nums focus:border-neutral-400 focus:outline-none'
        />
        <span className='font-mono text-[10px] text-neutral-400'>ms</span>
      </Field>

      <Field label='Trigger'>
        <select
          value={motion.trigger ?? 'in-view'}
          data-testid='motion-trigger'
          onChange={e =>
            onChange({ ...motion, trigger: e.target.value as MotionTrigger })
          }
          className='h-7 cursor-pointer rounded-md border border-neutral-200 bg-white px-2 text-[11px] focus:border-neutral-400 focus:outline-none'
        >
          {TRIGGERS.map(t => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label='Repeat'>
        <input
          type='number'
          min={-1}
          step={1}
          value={motion.repeat ?? 0}
          onChange={e =>
            onChange({ ...motion, repeat: Number(e.target.value) })
          }
          className='h-7 w-14 rounded-md border border-neutral-200 bg-white px-2 text-[11px] tabular-nums focus:border-neutral-400 focus:outline-none'
        />
        <span className='font-mono text-[10px] text-neutral-400'>(-1=∞)</span>
      </Field>

      <Field label='Yoyo'>
        <input
          type='checkbox'
          checked={motion.yoyo ?? false}
          onChange={e => onChange({ ...motion, yoyo: e.target.checked })}
          className='size-3.5 cursor-pointer accent-neutral-900'
        />
      </Field>

      <Field label='Enabled'>
        <input
          type='checkbox'
          checked={motion.enabled !== false}
          onChange={e => onChange({ ...motion, enabled: e.target.checked })}
          className='size-3.5 cursor-pointer accent-neutral-900'
        />
      </Field>

      <div className='flex-1' />

      <div className='flex items-center gap-1'>
        <button
          type='button'
          onClick={() => onPxPerMsChange(Math.max(0.05, pxPerMs / 1.4))}
          aria-label='Thu nhỏ timeline'
          className='flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
        >
          <ZoomOut className='size-3.5' />
        </button>
        <span className='font-mono text-[10px] text-neutral-400 tabular-nums'>
          {Math.round(pxPerMs * 1000)}px/s
        </span>
        <button
          type='button'
          onClick={() => onPxPerMsChange(Math.min(1.2, pxPerMs * 1.4))}
          aria-label='Phóng to timeline'
          className='flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
        >
          <ZoomIn className='size-3.5' />
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className='flex items-center gap-1.5'>
      <span className='font-mono text-[10px] tracking-[0.1em] text-neutral-400 uppercase'>
        {label}
      </span>
      {children}
    </label>
  );
}
