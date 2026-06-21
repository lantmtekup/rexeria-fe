'use client';

import * as React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
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

const DEVICE_WIDTH: Record<Device, number> = {
  desktop: 1280,
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

const TRANSITION_MS = 240;

export function PreviewMode({
  blocks,
  lang,
  onClose,
  transition,
}: PreviewModeProps) {
  const [device, setDevice] = React.useState<Device>('desktop');
  const [closing, setClosing] = React.useState(false);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  const handleClose = React.useCallback(() => {
    setClosing(true);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  // Enter animation — overlay fade + sheet rise. Runs once on mount.
  useGSAP(() => {
    if (!overlayRef.current || !sheetRef.current) return;
    gsap.set(overlayRef.current, { autoAlpha: 0 });
    gsap.set(sheetRef.current, { y: 24, autoAlpha: 0 });
    const tl = gsap.timeline();
    tl.to(overlayRef.current, {
      autoAlpha: 1,
      duration: TRANSITION_MS / 1000,
      ease: 'power2.out',
    }).to(
      sheetRef.current,
      {
        y: 0,
        autoAlpha: 1,
        duration: TRANSITION_MS / 1000,
        ease: 'power3.out',
      },
      '-=0.12'
    );
  }, []);

  // Exit animation — invert enter; call parent's onClose after the sheet
  // settles so the unmount happens *after* the user sees the transition.
  useGSAP(
    () => {
      if (!closing) return;
      if (!overlayRef.current || !sheetRef.current) return;
      const tl = gsap.timeline({ onComplete: onClose });
      tl.to(sheetRef.current, {
        y: 16,
        autoAlpha: 0,
        duration: TRANSITION_MS / 1000,
        ease: 'power2.in',
      }).to(
        overlayRef.current,
        {
          autoAlpha: 0,
          duration: TRANSITION_MS / 1000,
          ease: 'power2.in',
        },
        '-=0.08'
      );
    },
    { dependencies: [closing] }
  );

  const visible = blocks.filter(b => b.isVisible);

  return (
    <div
      ref={overlayRef}
      className='fixed inset-0 z-50 flex flex-col bg-neutral-950/95 backdrop-blur'
    >
      <div ref={sheetRef} className='flex h-full flex-col'>
        <header className='flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 text-white'>
          <span className='text-xs font-medium tracking-widest text-white/70 uppercase'>
            Xem trước · {visible.length}/{blocks.length} block
          </span>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-0.5 rounded-md border border-white/15 bg-white/5 p-0.5'>
              {DEVICE_BUTTONS.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type='button'
                  aria-label={label}
                  onClick={() => setDevice(value)}
                  className={cn(
                    'flex size-7 cursor-pointer items-center justify-center rounded-sm text-white/60 transition-colors hover:text-white',
                    device === value && 'bg-white text-neutral-900 shadow-sm'
                  )}
                >
                  <Icon className='size-3.5' />
                </button>
              ))}
            </div>
            <button
              type='button'
              onClick={handleClose}
              aria-label='Đóng xem trước'
              className='flex size-8 cursor-pointer items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white'
            >
              <X className='size-4' />
            </button>
          </div>
        </header>

        <LandingMotionRoot scrollerRef={scrollerRef} enableSmooth={false}>
          <div ref={scrollerRef} className='flex-1 overflow-auto p-8'>
            <div
              className='@container mx-auto transition-[max-width] duration-200'
              style={{ maxWidth: DEVICE_WIDTH[device] }}
            >
              {visible.length === 0 ? (
                <div className='rounded-lg border border-white/10 bg-white/5 p-12 text-center text-sm text-white/60'>
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
                        key={block.id}
                        mode='preview'
                        motion={motion}
                        scrollerEl={scrollerRef.current}
                      >
                        <MotionBlockRoot className='overflow-hidden rounded-md bg-white shadow-2xl ring-1 ring-black/10'>
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
          </div>
        </LandingMotionRoot>
      </div>
    </div>
  );
}
