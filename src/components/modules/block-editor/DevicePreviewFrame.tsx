'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import { DEVICE_FRAME_WIDTH } from './deviceFrame';
import type { Device } from './types';

interface DevicePreviewFrameProps {
  device: Device;
  children: React.ReactNode;
  className?: string;
  /** Show a small width badge (helpful for QA). Default true. */
  showBadge?: boolean;
  /**
   * Height reserved above the frame (PreviewMode chrome = h-7 = 1.75rem).
   * Frame fills the rest of the viewport.
   */
  chromeOffset?: string;
  /** Ref to the inner scrollable region (LandingMotion / ScrollTrigger). */
  scrollerRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Fixed-width device shell for PreviewMode / `/dev/blocks`.
 *
 * Structure:
 * - Outer `[data-device-frame]`: `@container` + viewport-tall, centered, NOT
 *   scrolling — portal host for header / sticky menu (`absolute` top/bottom).
 * - Inner scroller: overflow-y — blocks scroll here; inherits container width
 *   for queries / useContainerMobile.
 *
 * Do NOT wrap in `transform: scale()` — breaks sticky/pin.
 */
export function DevicePreviewFrame({
  device,
  children,
  className,
  showBadge = true,
  chromeOffset = '0px',
  scrollerRef,
}: DevicePreviewFrameProps) {
  const width = DEVICE_FRAME_WIDTH[device];

  return (
    <div className='flex h-full w-full justify-center'>
      <div
        data-device-frame='true'
        data-device={device}
        className='@container relative shrink-0 overflow-hidden bg-white'
        style={{
          width,
          height: `calc(100vh - ${chromeOffset})`,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
        }}
      >
        {showBadge && (
          <div className='pointer-events-none absolute top-2 right-2 z-10 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-white uppercase'>
            {device} · {width}px
          </div>
        )}
        <div
          ref={scrollerRef}
          data-landing-preview-scroller='true'
          className={cn(
            '@container absolute inset-0 overflow-x-hidden overflow-y-auto',
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
