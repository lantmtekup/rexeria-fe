'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import { TRACK_HEADER_WIDTH } from './TrackRow';
import { formatMs, snapTime } from './utils';

interface TimelineRulerProps {
  duration: number;
  pxPerMs: number;
  playhead: number;
  onScrub: (ms: number) => void;
}

/** Major-tick spacing in ms — choose based on zoom so labels stay readable. */
function pickTickStep(pxPerMs: number): number {
  const targetPx = 80; // aim for ~one label every 80px
  const stepMs = targetPx / pxPerMs;
  // Snap to a "nice" step (50, 100, 250, 500, 1000, 2000, 5000…).
  const ladder = [50, 100, 250, 500, 1000, 2000, 5000, 10000];
  return ladder.find(s => s >= stepMs) ?? ladder[ladder.length - 1]!;
}

export function TimelineRuler({
  duration,
  pxPerMs,
  playhead,
  onScrub,
}: TimelineRulerProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const draggingRef = React.useRef(false);
  const tickStep = pickTickStep(pxPerMs);
  const totalWidth = Math.max(duration * pxPerMs, 200);

  const scrubFromEvent = React.useCallback(
    (clientX: number) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const ms = snapTime(x / pxPerMs);
      onScrub(Math.max(0, Math.min(duration, ms)));
    },
    [duration, pxPerMs, onScrub]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    scrubFromEvent(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    scrubFromEvent(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const ticks: number[] = [];
  for (let t = 0; t <= duration; t += tickStep) ticks.push(t);

  return (
    <div className='sticky top-0 z-10 flex h-8 shrink-0 border-b border-neutral-200 bg-neutral-50'>
      <div
        className='shrink-0 border-r border-neutral-200 bg-neutral-100'
        style={{ width: TRACK_HEADER_WIDTH }}
      />
      <div
        ref={ref}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        data-testid='motion-ruler'
        className='relative flex-1 cursor-grab touch-none overflow-hidden select-none active:cursor-grabbing'
        style={{ minWidth: totalWidth }}
      >
        {ticks.map(t => {
          const left = t * pxPerMs;
          return (
            <React.Fragment key={t}>
              <div
                className='absolute top-0 bottom-0 w-px bg-neutral-200'
                style={{ left }}
              />
              <span
                className='absolute top-0.5 font-mono text-[9px] text-neutral-400 tabular-nums'
                style={{ left: left + 3 }}
              >
                {formatMs(t)}
              </span>
            </React.Fragment>
          );
        })}
        {/* Duration end marker */}
        <div
          className='absolute top-0 bottom-0 w-px bg-neutral-400'
          style={{ left: duration * pxPerMs }}
        />
        {/* Playhead */}
        <div
          className={cn(
            'pointer-events-none absolute top-0 bottom-0 w-px bg-rose-500'
          )}
          style={{ left: playhead * pxPerMs }}
        >
          <div className='absolute top-0 left-1/2 size-2 -translate-x-1/2 rounded-sm bg-rose-500' />
        </div>
      </div>
    </div>
  );
}
