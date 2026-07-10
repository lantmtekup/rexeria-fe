'use client';

/**
 * Full-viewport preview overlay — cùng layout/render path với `/dev/blocks`:
 * scroller = vùng cuộn full height, LandingMotionRoot + MotionProvider(mode=preview)
 * + RenderBlock. Sticky/pin/scrub neo đúng như trang dev preview.
 *
 * Khác `/dev/blocks`: nhận blocks live từ editor (chưa cần save), overlay
 * trong app (không mở tab mới).
 */

import * as React from 'react';
import { Monitor, Smartphone, Tablet, X } from 'lucide-react';

import { cn } from '@/lib/cn';

import { LandingMotionRoot } from './motion/LandingMotion';
import { RenderBlock } from './blocks/renderBlock';
import { MotionBlockRoot, MotionProvider } from './motion/runtime';
import type { BlockMotion } from './motion/types';
import {
  TemplateTransitions,
  asTransition,
} from './transitions/TemplateTransitions';
import { readVariant, type Block, type Device, type Lang } from './types';

interface PreviewModeProps {
  blocks: Block[];
  lang: Lang;
  onClose: () => void;
  /** Preset transition cấp template (none/fade/roll-up/swipe/tabs/parallax). */
  transition?: string;
}

/** Desktop = full width (null); tablet/mobile = khung cố định — khớp /dev/blocks. */
const DEVICE_MAX_WIDTH: Record<Device, number | null> = {
  desktop: null,
  tablet: 834,
  mobile: 390,
};

const DEVICE_BUTTONS: {
  value: Device;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { value: 'desktop', icon: Monitor, label: 'Desktop' },
  { value: 'tablet', icon: Tablet, label: 'Tablet' },
  { value: 'mobile', icon: Smartphone, label: 'Mobile' },
];

export function PreviewMode({
  blocks,
  lang,
  onClose,
  transition,
}: PreviewModeProps) {
  const [device, setDevice] = React.useState<Device>('desktop');
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const visible = blocks.filter(b => b.isVisible);
  const maxWidth = DEVICE_MAX_WIDTH[device];

  return (
    <div className='fixed inset-0 z-50 bg-neutral-900'>
      {/* Top bar fixed, gọn — mirror /dev/blocks */}
      <header className='fixed inset-x-0 top-0 z-50 flex h-7 items-center gap-2 border-b border-white/10 bg-[#0d0d10]/90 px-2 backdrop-blur-sm'>
        <span className='shrink-0 text-[8px] font-bold tracking-[0.16em] text-amber-400/90 uppercase'>
          Preview
        </span>
        <span className='min-w-0 flex-1 truncate text-[9px] text-white/40'>
          {visible.length}/{blocks.length} block
        </span>
        <div className='flex shrink-0 items-center gap-0.5 rounded border border-white/10 bg-white/5 p-px'>
          {DEVICE_BUTTONS.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type='button'
              onClick={() => setDevice(value)}
              title={label}
              aria-label={label}
              aria-pressed={device === value}
              className={cn(
                'flex size-5 items-center justify-center rounded-sm transition-colors',
                device === value
                  ? 'bg-amber-400 text-neutral-900'
                  : 'text-white/60 hover:bg-white/10'
              )}
            >
              <Icon className='size-3' />
            </button>
          ))}
        </div>
        <button
          type='button'
          onClick={onClose}
          aria-label='Đóng xem trước'
          className='flex size-5 shrink-0 items-center justify-center rounded-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white'
        >
          <X className='size-3.5' />
        </button>
      </header>

      {/* Vùng cuộn full viewport = scroller — khớp /dev/blocks */}
      <div
        ref={scrollerRef}
        className='relative h-screen overflow-auto bg-neutral-200 pt-7'
      >
        <LandingMotionRoot scrollerRef={scrollerRef} enableSmooth={false}>
          <div
            className='@container mx-auto bg-white'
            style={
              maxWidth
                ? {
                    maxWidth,
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
                  }
                : undefined
            }
          >
            {visible.length === 0 ? (
              <div className='flex min-h-[60vh] items-center justify-center px-6 text-center text-sm text-neutral-500'>
                Chưa có block nào hiển thị.
              </div>
            ) : (
              <TemplateTransitions
                transition={asTransition(transition)}
                items={visible.map(block => {
                  const langContent =
                    lang === 'vi' ? block.contentVi : block.contentEn;
                  const content =
                    readVariant(langContent, device) ?? langContent.desktop;
                  const styles = readVariant(block.elementStyles, device);
                  const background = readVariant(block.background, device);
                  const order = readVariant(block.elementOrder, device);
                  const motion = readVariant(block.motion, device) as
                    | BlockMotion
                    | undefined;
                  return (
                    <MotionProvider
                      key={`${block.id}:${device}`}
                      mode='preview'
                      motion={motion}
                      scrollerEl={scrollerRef.current}
                    >
                      <MotionBlockRoot>
                        <RenderBlock
                          block={block}
                          content={content}
                          styles={styles}
                          background={background}
                          order={order}
                        />
                      </MotionBlockRoot>
                    </MotionProvider>
                  );
                })}
              />
            )}
          </div>
        </LandingMotionRoot>
      </div>
    </div>
  );
}
