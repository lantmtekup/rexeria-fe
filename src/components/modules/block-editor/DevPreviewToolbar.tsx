'use client';

import { MessageSquareText, ScrollText } from 'lucide-react';

import { cn } from '@/lib/cn';

import { DeviceSwitcher } from './DeviceSwitcher';
import type { Device } from './types';

interface DevPreviewToolbarProps {
  device: Device;
  onDeviceChange: (device: Device) => void;
  showScrollRoom: boolean;
  onToggleScrollRoom: () => void;
  /** Mở modal ghi chú nội bộ — chỉ khi preview block từ BE (?id=). */
  onFeedback?: () => void;
  hasFeedbackNote?: boolean;
  className?: string;
}

const toggleBtn =
  'flex size-9 shrink-0 items-center justify-center rounded-md transition-colors';

export function DevPreviewToolbar({
  device,
  onDeviceChange,
  showScrollRoom,
  onToggleScrollRoom,
  onFeedback,
  hasFeedbackNote = false,
  className,
}: DevPreviewToolbarProps) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed right-3 bottom-3 z-50',
        className
      )}
    >
      <div
        role='toolbar'
        aria-label='Dev preview controls'
        className='pointer-events-auto flex items-center gap-1.5 rounded-xl border border-white/15 bg-[#0d0d10]/95 p-1.5 shadow-lg backdrop-blur-sm'
      >
        <DeviceSwitcher
          device={device}
          onChange={onDeviceChange}
          variant='floating'
          className='gap-1 border-0 bg-transparent p-0 shadow-none'
        />

        <div className='mx-0.5 h-7 w-px shrink-0 bg-white/10' aria-hidden />

        <button
          type='button'
          onClick={onToggleScrollRoom}
          aria-pressed={showScrollRoom}
          aria-label={
            showScrollRoom
              ? 'Ẩn vùng scroll trên/dưới'
              : 'Hiện vùng scroll trên/dưới'
          }
          title={
            showScrollRoom
              ? 'Ẩn scroll room trên/dưới'
              : 'Hiện scroll room trên/dưới'
          }
          className={cn(
            toggleBtn,
            showScrollRoom
              ? 'bg-amber-400/15 text-amber-400'
              : 'text-white/50 hover:bg-white/10 hover:text-white/80'
          )}
        >
          <ScrollText className='size-5' />
        </button>

        {onFeedback ? (
          <>
            <div className='mx-0.5 h-7 w-px shrink-0 bg-white/10' aria-hidden />
            <button
              type='button'
              onClick={onFeedback}
              aria-label='Ghi chú nội bộ / feedback'
              title='Ghi chú nội bộ / feedback'
              className={cn(
                toggleBtn,
                'relative',
                hasFeedbackNote
                  ? 'bg-amber-400/15 text-amber-400'
                  : 'text-white/50 hover:bg-white/10 hover:text-white/80'
              )}
            >
              <MessageSquareText className='size-5' />
              {hasFeedbackNote ? (
                <span
                  className='absolute top-1.5 right-1.5 size-2 rounded-full bg-amber-400'
                  aria-hidden
                />
              ) : null}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
