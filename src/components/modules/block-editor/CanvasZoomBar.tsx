'use client';

import { Maximize, Maximize2, Minus, Plus } from 'lucide-react';

import { cn } from '@/lib/cn';

const ZOOM_MIN = 25;
const ZOOM_MAX = 200;
const ZOOM_STEP = 5;

interface CanvasZoomBarProps {
  zoom: number;
  onChange: (next: number) => void;
  onFitToFrame?: () => void;
  /** `right` — góc phải đáy (mặc định, như BlockTabBar cũ). `center` — giữa đáy. */
  align?: 'right' | 'center';
}

/** Thanh zoom nổi ở đáy canvas — không chiếm chiều cao layout. */
export function CanvasZoomBar({
  zoom,
  onChange,
  onFitToFrame,
  align = 'right',
}: CanvasZoomBarProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 z-20 flex px-3 pb-3',
        align === 'center' ? 'justify-center' : 'justify-end'
      )}
    >
      <div className='pointer-events-auto rounded-lg shadow-lg'>
        <ZoomControls
          zoom={zoom}
          onChange={onChange}
          onFitToFrame={onFitToFrame}
        />
      </div>
    </div>
  );
}

export function ZoomControls({
  zoom,
  onChange,
  onFitToFrame,
}: {
  zoom: number;
  onChange: (next: number) => void;
  onFitToFrame?: () => void;
}) {
  const clamp = (n: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, n));
  return (
    <div className='flex shrink-0 items-center gap-1.5 self-center rounded-md border border-neutral-200 bg-white px-2 py-1.5'>
      <button
        type='button'
        aria-label='Thu nhỏ'
        onClick={() => onChange(clamp(zoom - ZOOM_STEP))}
        disabled={zoom <= ZOOM_MIN}
        className='flex size-6 cursor-pointer items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
      >
        <Minus className='size-3.5' />
      </button>
      <input
        type='range'
        min={ZOOM_MIN}
        max={ZOOM_MAX}
        step={1}
        value={zoom}
        onChange={e => onChange(Number(e.target.value))}
        className='h-1 w-24 accent-neutral-900'
        aria-label='Mức zoom'
      />
      <button
        type='button'
        aria-label='Phóng to'
        onClick={() => onChange(clamp(zoom + ZOOM_STEP))}
        disabled={zoom >= ZOOM_MAX}
        className='flex size-6 cursor-pointer items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
      >
        <Plus className='size-3.5' />
      </button>
      <span className='text-2xs min-w-[36px] text-right font-medium text-neutral-600 tabular-nums'>
        {Math.round(zoom)}%
      </span>
      {onFitToFrame && (
        <button
          type='button'
          aria-label='Vừa khung hiện tại'
          title='Vừa khung hiện tại'
          onClick={onFitToFrame}
          className='flex size-6 cursor-pointer items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900'
        >
          <Maximize2 className='size-3.5' />
        </button>
      )}
      <button
        type='button'
        aria-label='Zoom 100%'
        title='Zoom 100%'
        onClick={() => onChange(100)}
        className='flex size-6 cursor-pointer items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900'
      >
        <Maximize className='size-3.5' />
      </button>
    </div>
  );
}
