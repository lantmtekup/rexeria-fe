'use client';

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';

import { DEVICE_FRAME_WIDTH } from '@/components/modules/block-editor/deviceFrame';
import type { Device } from '@/components/modules/block-editor/types';
import { cn } from '@/lib/cn';

type ExchangeDeviceStageProps = {
  device: Device;
  children: ReactNode;
  /** Shown in desktop chrome URL pill. */
  urlLabel?: string;
  /** Block canvas scrolls inside the viewport; page iframe scrolls itself. */
  scrollable?: boolean;
  scrollerRef?: RefObject<HTMLDivElement | null>;
  className?: string;
};

const DESKTOP_CHROME = 38;
const MOBILE_BEZEL = 11;

/**
 * Fixed logical content heights (device viewport, not browser window).
 * Keeps phone / laptop aspect ratios honest; shell then scale-to-fits the stage.
 * Page iframes: iframe height === this value → `100vh` inside `/p` fills the frame.
 */
const DEVICE_CONTENT_H = {
  mobile: 844,
  desktop: 900 - DESKTOP_CHROME,
  tablet: 900 - DESKTOP_CHROME,
} as const;

const logicalContentHeight = (device: Device): number =>
  device === 'mobile'
    ? DEVICE_CONTENT_H.mobile
    : device === 'tablet'
      ? DEVICE_CONTENT_H.tablet
      : DEVICE_CONTENT_H.desktop;

const shellWidth = (device: Device): number => {
  const w =
    device === 'mobile'
      ? DEVICE_FRAME_WIDTH.mobile
      : device === 'tablet'
        ? DEVICE_FRAME_WIDTH.tablet
        : DEVICE_FRAME_WIDTH.desktop;
  return device === 'mobile' ? w + MOBILE_BEZEL * 2 : w;
};

const chromeHeight = (device: Device): number =>
  device === 'mobile' ? MOBILE_BEZEL * 2 : DESKTOP_CHROME;

const viewportWidth = (device: Device): number =>
  device === 'mobile'
    ? DEVICE_FRAME_WIDTH.mobile
    : device === 'tablet'
      ? DEVICE_FRAME_WIDTH.tablet
      : DEVICE_FRAME_WIDTH.desktop;

export const ExchangeDeviceStage = ({
  device,
  children,
  urlLabel,
  scrollable = false,
  scrollerRef,
  className,
}: ExchangeDeviceStageProps) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const isMobile = device === 'mobile';
  const contentH = logicalContentHeight(device);
  const shellW = shellWidth(device);
  const shellH = contentH + chromeHeight(device);
  const vpW = viewportWidth(device);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const measure = () => {
      const styles = window.getComputedStyle(el);
      const padX =
        parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const padY =
        parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
      const availW = Math.max(0, el.clientWidth - padX);
      const availH = Math.max(0, el.clientHeight - padY);
      const next = Math.min(1, availW / shellW, availH / shellH);
      setScale(Number.isFinite(next) && next > 0 ? next : 1);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [device, shellW, shellH]);

  return (
    <div
      ref={stageRef}
      className={cn(
        'flex h-full min-h-0 w-full items-center justify-center overflow-hidden',
        'bg-[var(--pv2-canvas)] px-6 py-8 md:px-10 md:py-10',
        className
      )}
    >
      {/* Layout box after scale — keeps flex centering honest. */}
      <div
        className='relative shrink-0'
        style={{
          width: shellW * scale,
          height: shellH * scale,
        }}
      >
        <div
          className='absolute top-0 left-1/2'
          style={{
            width: shellW,
            height: shellH,
            transform: `translateX(-50%) scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          {isMobile ? (
            <div
              className={cn(
                'relative size-full overflow-hidden bg-[var(--pv2-ink)]',
                'rounded-[40px] shadow-[var(--pv2-sh-soft)]',
                'p-[11px]'
              )}
            >
              <span
                className='pointer-events-none absolute top-0 left-1/2 z-[2] h-[26px] w-[130px] -translate-x-1/2 rounded-b-[16px] bg-[var(--pv2-ink)]'
                aria-hidden
              />
              <div
                data-device-frame='true'
                data-device={device}
                className='@container relative overflow-hidden rounded-[28px] bg-white'
                style={{ width: vpW, height: contentH }}
              >
                <div
                  ref={scrollerRef}
                  data-landing-preview-scroller={
                    scrollable ? 'true' : undefined
                  }
                  className={cn(
                    '@container absolute inset-0',
                    scrollable
                      ? 'overflow-x-hidden overflow-y-auto'
                      : 'overflow-hidden'
                  )}
                >
                  {children}
                </div>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'flex size-full flex-col overflow-hidden bg-[var(--pv2-paper)]',
                'rounded-[14px] border border-[var(--pv2-hair)] shadow-[var(--pv2-sh-soft)]'
              )}
            >
              <div
                className='flex h-[38px] shrink-0 items-center gap-1.5 border-b border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3.5'
                aria-hidden
              >
                <span className='size-[9px] rounded-full bg-[var(--pv2-slate-300)]' />
                <span className='size-[9px] rounded-full bg-[var(--pv2-slate-300)]' />
                <span className='size-[9px] rounded-full bg-[var(--pv2-slate-300)]' />
                <span className='ml-2.5 min-w-0 flex-1 truncate rounded-full border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3.5 py-1 text-[11px] text-[var(--pv2-faint)]'>
                  {urlLabel ?? '/'}
                </span>
              </div>
              <div
                data-device-frame='true'
                data-device={device}
                className='@container relative min-h-0 shrink-0 overflow-hidden bg-white'
                style={{ width: vpW, height: contentH }}
              >
                <div
                  ref={scrollerRef}
                  data-landing-preview-scroller={
                    scrollable ? 'true' : undefined
                  }
                  className={cn(
                    '@container absolute inset-0',
                    scrollable
                      ? 'overflow-x-hidden overflow-y-auto'
                      : 'overflow-hidden'
                  )}
                >
                  {children}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
