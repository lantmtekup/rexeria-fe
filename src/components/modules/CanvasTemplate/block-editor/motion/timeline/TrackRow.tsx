'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { cn } from '@/lib/cn';

import type { MotionTrack } from '../types';

import { elementLabel, snapTime } from './utils';

export const TRACK_HEADER_WIDTH = 180;

interface TrackRowProps {
  track: MotionTrack;
  duration: number;
  pxPerMs: number;
  playhead: number;
  selectedIndex: number | null;
  onSelectKeyframe: (index: number) => void;
  onMoveKeyframe: (index: number, time: number) => void;
  onAddKeyframe: () => void;
  onRemoveTrack: () => void;
}

export function TrackRow({
  track,
  duration,
  pxPerMs,
  playhead,
  selectedIndex,
  onSelectKeyframe,
  onMoveKeyframe,
  onAddKeyframe,
  onRemoveTrack,
}: TrackRowProps) {
  const totalWidth = Math.max(duration * pxPerMs, 200);

  return (
    <div
      data-testid={`motion-track-${track.elementKey}`}
      className='flex h-10 shrink-0 items-stretch border-b border-neutral-100 bg-white hover:bg-neutral-50/40'
    >
      {/* ── Header (left) ─────────────────────────────────────────── */}
      <div
        className='flex shrink-0 items-center gap-1 border-r border-neutral-200 bg-neutral-50 px-3'
        style={{ width: TRACK_HEADER_WIDTH }}
      >
        <span className='min-w-0 flex-1 truncate text-[11px] font-medium text-neutral-800'>
          {elementLabel(track.elementKey)}
        </span>
        <button
          type='button'
          onClick={onAddKeyframe}
          aria-label='Thêm keyframe ở playhead'
          title='Thêm keyframe ở playhead'
          className='flex size-6 shrink-0 cursor-pointer items-center justify-center rounded text-neutral-400 hover:bg-white hover:text-neutral-900'
        >
          <Plus className='size-3' />
        </button>
        <button
          type='button'
          onClick={onRemoveTrack}
          aria-label='Xóa track'
          title='Xóa track'
          className='flex size-6 shrink-0 cursor-pointer items-center justify-center rounded text-neutral-400 hover:bg-white hover:text-rose-600'
        >
          <Trash2 className='size-3' />
        </button>
      </div>

      {/* ── Keyframe lane ─────────────────────────────────────────── */}
      <div
        className='relative flex-1 overflow-hidden'
        style={{ minWidth: totalWidth }}
      >
        {/* Lane background */}
        <div className='absolute inset-y-1/2 right-0 left-0 h-px -translate-y-1/2 bg-neutral-100' />

        {/* Playhead line within lane (visual continuity from ruler) */}
        <div
          className='pointer-events-none absolute top-0 bottom-0 w-px bg-rose-500/30'
          style={{ left: playhead * pxPerMs }}
        />

        {/* Keyframes */}
        {track.keyframes.map((kf, i) => (
          <KeyframeDiamond
            key={i}
            kf={kf}
            index={i}
            elementKey={track.elementKey}
            duration={duration}
            pxPerMs={pxPerMs}
            selected={selectedIndex === i}
            onSelect={() => onSelectKeyframe(i)}
            onMove={time => onMoveKeyframe(i, time)}
          />
        ))}
      </div>
    </div>
  );
}

function KeyframeDiamond({
  kf,
  index,
  elementKey,
  duration,
  pxPerMs,
  selected,
  onSelect,
  onMove,
}: {
  kf: { time: number };
  index: number;
  elementKey: string;
  duration: number;
  pxPerMs: number;
  selected: boolean;
  onSelect: () => void;
  onMove: (time: number) => void;
}) {
  // Drag state — we record the starting time + pointer x so move events
  // compute deltas without re-fetching the parent rect every frame.
  const startRef = React.useRef<{ x: number; time: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, time: kf.time };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const start = startRef.current;
    if (!start) return;
    const deltaPx = e.clientX - start.x;
    const next = snapTime(start.time + deltaPx / pxPerMs);
    onMove(Math.max(0, Math.min(duration, next)));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!startRef.current) return;
    startRef.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <button
      type='button'
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      data-testid={`motion-kf-${elementKey}-${index}`}
      data-selected={selected ? 'true' : 'false'}
      className={cn(
        'absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 cursor-grab rounded-[2px] transition-colors active:cursor-grabbing',
        selected
          ? 'bg-sky-500 ring-2 ring-sky-500/30'
          : 'bg-neutral-700 hover:bg-neutral-900'
      )}
      style={{ left: kf.time * pxPerMs }}
    />
  );
}
