'use client';

import * as React from 'react';
import { MoveHorizontal } from 'lucide-react';

import { cn } from '@/lib/cn';

import {
  CONTROL_FOCUS_WITHIN,
  CONTROL_H,
  CONTROL_SURFACE,
  ICON_SM,
  TEXT_META,
  TEXT_NUM,
} from '../tokens';

interface NumberFieldProps {
  /** undefined = không đặt (dùng mặc định của block). */
  value: number | undefined;
  onChange: (next: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Suffix shown inside the field, e.g. `px`. */
  unit?: string;
  /** Placeholder when unset. */
  placeholder?: string;
  ariaLabel: string;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Number input with a drag-to-scrub grip. Scrubbing is the fast path for
 * size/radius tweaks; typing stays available for exact values, and clearing
 * the field writes `undefined` so the element falls back to the block default.
 */
export function NumberField({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  unit,
  placeholder = '—',
  ariaLabel,
}: NumberFieldProps) {
  // Local draft so a half-typed value ("1" on the way to "16") isn't clamped
  // out from under the cursor.
  const [draft, setDraft] = React.useState<string | null>(null);
  const display = draft ?? (value === undefined ? '' : String(value));

  const commit = (raw: string) => {
    setDraft(null);
    const trimmed = raw.trim();
    if (!trimmed) {
      onChange(undefined);
      return;
    }
    const n = Number(trimmed);
    if (Number.isNaN(n)) return;
    onChange(clamp(n, min, max));
  };

  const scrubRef = React.useRef<{ startX: number; startValue: number } | null>(
    null
  );

  const handleScrubDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    scrubRef.current = { startX: e.clientX, startValue: value ?? min };
  };

  const handleScrubMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    const s = scrubRef.current;
    if (!s) return;
    const delta = Math.round((e.clientX - s.startX) / 2) * step;
    const next = clamp(s.startValue + delta, min, max);
    if (next !== value) onChange(next);
  };

  const handleScrubUp = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    scrubRef.current = null;
  };

  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 items-center transition-shadow',
        CONTROL_H,
        CONTROL_SURFACE,
        CONTROL_FOCUS_WITHIN
      )}
    >
      <span
        role='slider'
        tabIndex={-1}
        aria-label={`${ariaLabel} — kéo để chỉnh`}
        aria-valuenow={value ?? min}
        aria-valuemin={min}
        aria-valuemax={max}
        onPointerDown={handleScrubDown}
        onPointerMove={handleScrubMove}
        onPointerUp={handleScrubUp}
        onPointerCancel={handleScrubUp}
        className='text-content-muted hover:text-foreground flex h-full w-5 shrink-0 cursor-ew-resize touch-none items-center justify-center select-none'
      >
        <MoveHorizontal className={ICON_SM} aria-hidden />
      </span>
      <input
        type='text'
        inputMode='numeric'
        value={display}
        onChange={e => setDraft(e.target.value)}
        onBlur={e => commit(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit((e.target as HTMLInputElement).value);
          }
          if (e.key === 'Escape') setDraft(null);
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const base = value ?? min;
            const dir = e.key === 'ArrowUp' ? 1 : -1;
            const mult = e.shiftKey ? 10 : 1;
            setDraft(null);
            onChange(clamp(base + dir * step * mult, min, max));
          }
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          'text-foreground placeholder:text-content-muted/60 h-full min-w-0 flex-1 bg-transparent px-1 outline-none',
          TEXT_NUM
        )}
      />
      {unit && (
        <span className={cn('text-content-muted/70 pr-2 font-mono', TEXT_META)}>
          {unit}
        </span>
      )}
    </div>
  );
}
