'use client';

import { Maximize, Maximize2, Minus, Plus } from 'lucide-react';

import { cn } from '@/lib/cn';

// import { DeviceSwitcher } from './DeviceSwitcher';
import type { Device } from '@/components/modules/block-editor/types';

const ZOOM_MIN = 25;
const ZOOM_MAX = 200;
const ZOOM_STEP = 5;

interface CanvasZoomBarProps {
  zoom: number;
  onChange: (next: number) => void;
  onFitToFrame?: () => void;
  /** `right` — góc phải đáy (mặc định, như BlockTabBar cũ). `center` — giữa đáy. */
  align?: 'right' | 'center';
  /** Device + zoom share one pill — both answer "how am I viewing this?". */
  device?: Device;
  onDeviceChange?: (next: Device) => void;
}

/**
 * The canvas viewport bar — device frame and zoom, floating at the bottom.
 *
 * Floating on purpose: it costs zero layout height, so the canvas never
 * reflows when it appears. `BlockPreview`'s `pb-20` and `SURFACE_PAD_BOTTOM`
 * exist to reserve room for it — grow this pill and those must grow too.
 *
 * Device lives here rather than in the header because it is a viewport
 * control, not a document action, and the header already runs dense.
 */
export function CanvasZoomBar({
  zoom,
  onChange,
  onFitToFrame,
  align = 'right',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  device,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDeviceChange,
}: CanvasZoomBarProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 z-20 flex px-3 pb-3',
        align === 'center' ? 'justify-center' : 'justify-end'
      )}
    >
      <div className='pointer-events-auto flex items-center gap-1.5'>
        {/* {device && onDeviceChange && (
          <div className='flex shrink-0 items-center rounded-lg bg-[var(--pv2-paper)] px-1.5 py-1.5 shadow-[var(--pv2-sh-soft)]'>
            <DeviceSwitcher
              device={device}
              onChange={onDeviceChange}
              variant='editor'
            />
          </div>
        )} */}
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
    <div className='flex shrink-0 items-center gap-1.5 self-center rounded-lg bg-[var(--pv2-paper)] px-2 py-1.5 shadow-[var(--pv2-sh-soft)]'>
      <button
        type='button'
        aria-label='Thu nhỏ'
        onClick={() => onChange(clamp(zoom - ZOOM_STEP))}
        disabled={zoom <= ZOOM_MIN}
        className='flex size-6 cursor-pointer items-center justify-center rounded-sm text-[var(--pv2-mut)] transition-colors hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
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
        className='h-1 w-24 accent-[var(--pv2-electric)]'
        aria-label='Mức zoom'
      />
      <button
        type='button'
        aria-label='Phóng to'
        onClick={() => onChange(clamp(zoom + ZOOM_STEP))}
        disabled={zoom >= ZOOM_MAX}
        className='flex size-6 cursor-pointer items-center justify-center rounded-sm text-[var(--pv2-mut)] transition-colors hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
      >
        <Plus className='size-3.5' />
      </button>
      <span className='text-2xs min-w-[36px] text-right font-medium text-[var(--pv2-mut)] tabular-nums'>
        {Math.round(zoom)}%
      </span>
      {onFitToFrame && (
        <button
          type='button'
          aria-label='Vừa khung hiện tại'
          title='Vừa khung hiện tại'
          onClick={onFitToFrame}
          className='flex size-6 cursor-pointer items-center justify-center rounded-sm text-[var(--pv2-mut)] transition-colors hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]'
        >
          <Maximize2 className='size-3.5' />
        </button>
      )}
      <button
        type='button'
        aria-label='Zoom 100%'
        title='Zoom 100%'
        onClick={() => onChange(100)}
        className='flex size-6 cursor-pointer items-center justify-center rounded-sm text-[var(--pv2-mut)] transition-colors hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]'
      >
        <Maximize className='size-3.5' />
      </button>
    </div>
  );
}
