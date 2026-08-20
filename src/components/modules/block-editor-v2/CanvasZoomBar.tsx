'use client';

import { Maximize, Maximize2, Minus, Plus } from 'lucide-react';

import { cn } from '@/lib/cn';

import {
  CANVAS_ZOOM_MAX,
  CANVAS_ZOOM_MIN,
  clampCanvasZoom,
} from './canvasZoom';

const ZOOM_STEP = 5;

/** `page` — cả trang nối liền; `block` — artboard 1 block để zoom sâu. */
export type CanvasMode = 'page' | 'block';

interface CanvasZoomBarProps {
  zoom: number;
  onChange: (next: number) => void;
  onFitToFrame?: () => void;
  /** `right` — góc phải đáy (mặc định, như BlockTabBar cũ). `center` — giữa đáy. */
  align?: 'right' | 'center';
}

/**
 * The canvas viewport bar — zoom, floating at the bottom.
 *
 * Floating on purpose: it costs zero layout height, so the canvas never
 * reflows when it appears. `BlockPreview`'s `pb-20` and `SURFACE_PAD_BOTTOM`
 * exist to reserve room for it — grow this pill and those must grow too.
 *
 * Device switcher + page/block mode moved to the header (see
 * `BlockEditorHeader`) — floating over an arbitrary block background made
 * them hard to read against light covers/canvas colours; the header's fixed
 * paper background doesn't have that problem.
 */
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
      <div className='pointer-events-auto flex items-center gap-1.5'>
        <ZoomControls
          zoom={zoom}
          onChange={onChange}
          onFitToFrame={onFitToFrame}
        />
      </div>
    </div>
  );
}

/**
 * Page ↔ block artboard. Two words rather than icons: "what am I looking at"
 * is the one viewport control users pick deliberately, and an icon pair here
 * reads as another zoom affordance.
 */
export function ModeSwitch({
  mode,
  onChange,
}: {
  mode: CanvasMode;
  onChange: (next: CanvasMode) => void;
}) {
  return (
    <div className='flex shrink-0 items-center gap-0.5 self-center rounded-lg bg-[var(--pv2-paper)] p-1 shadow-[var(--pv2-sh-soft)]'>
      {(
        [
          ['page', 'Trang', 'Xem và sửa cả trang nối liền'],
          ['block', 'Block', 'Chỉ block đang chọn, có pan/zoom'],
        ] as const
      ).map(([value, label, title]) => (
        <button
          key={value}
          type='button'
          title={title}
          aria-pressed={mode === value}
          onClick={() => onChange(value)}
          className={cn(
            'text-2xs cursor-pointer rounded-sm px-2 py-1 font-medium transition-colors',
            mode === value
              ? 'bg-[var(--pv2-ink)] text-white'
              : 'text-[var(--pv2-mut)] hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]'
          )}
        >
          {label}
        </button>
      ))}
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
  const clamp = clampCanvasZoom;
  return (
    <div className='flex shrink-0 items-center gap-1.5 self-center rounded-lg bg-[var(--pv2-paper)] px-2 py-1.5 shadow-[var(--pv2-sh-soft)]'>
      <button
        type='button'
        aria-label='Thu nhỏ'
        onClick={() => onChange(clamp(zoom - ZOOM_STEP))}
        disabled={zoom <= CANVAS_ZOOM_MIN}
        className='flex size-6 cursor-pointer items-center justify-center rounded-sm text-[var(--pv2-mut)] transition-colors hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
      >
        <Minus className='size-3.5' />
      </button>
      <input
        type='range'
        min={CANVAS_ZOOM_MIN}
        max={CANVAS_ZOOM_MAX}
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
        disabled={zoom >= CANVAS_ZOOM_MAX}
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
