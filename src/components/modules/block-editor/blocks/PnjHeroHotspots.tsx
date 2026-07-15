'use client';

/**
 * Hotspot overlay + drawer for PnjHero — port từ apps/pnj ProductHotspotUI.
 * Drawer portals to document.body so @container on the block root không clip.
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';

import type { PnjHeroHotspot } from '../types';

interface LenisGlobal {
  __lenis?: { stop: () => void; start: () => void };
}

const isLightBackground = (color: string) => {
  const rgba = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgba) {
    const r = Number(rgba[1]);
    const g = Number(rgba[2]);
    const b = Number(rgba[3]);
    return (r * 299 + g * 587 + b * 114) / 1000 > 180;
  }
  const hex = color.replace('#', '');
  if (hex.length !== 6) return false;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
};

/** Body scroll lock while drawer open — desktop giữ pin canvas (không fixed body). */
export const useDrawerScrollLock = (activeTab: string | null) => {
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const lenis = (window as unknown as LenisGlobal).__lenis;
    const body = document.body;
    const html = document.documentElement;

    const unlock = () => {
      if (body.style.position === 'fixed') {
        const savedY = parseInt(body.dataset.scrollY || '0', 10);
        body.style.position = '';
        body.style.top = '';
        body.style.left = '';
        body.style.right = '';
        body.style.width = '';
        delete body.dataset.scrollY;
        if (savedY) window.scrollTo(0, savedY);
      }
      html.style.overflow = '';
      body.style.paddingRight = '';
    };

    if (activeTab !== null) {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      if (isMobile) {
        const scrollY = window.scrollY;
        body.dataset.scrollY = String(scrollY);
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.left = '0';
        body.style.right = '0';
        body.style.width = '100%';
      } else {
        const scrollbarWidth = window.innerWidth - html.clientWidth;
        html.style.overflow = 'hidden';
        if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
      }
      lenis?.stop();
    } else {
      unlock();
      lenis?.start();
    }

    return () => {
      unlock();
      lenis?.start();
    };
  }, [activeTab]);
};

function Hotspot({
  xPct,
  yPct,
  label,
  stepIndex,
  ringOffsetColor,
  reduceMotion = false,
  onClick,
}: {
  xPct: number;
  yPct: number;
  label: string;
  stepIndex: number;
  ringOffsetColor: string;
  reduceMotion?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      data-cta-id={`hotspot-${label.toLowerCase().replace(/\s+/g, '-')}`}
      data-step={stepIndex}
      data-current='false'
      className='pnj-hero-hotspot group absolute min-h-11 min-w-11'
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        touchAction: 'manipulation',
        opacity: 0,
        transform: 'translate(-50%, -50%) scale(0.85)',
        pointerEvents: 'none',
        transition: 'opacity 280ms ease, transform 280ms ease',
        ['--tw-ring-offset-color' as string]: ringOffsetColor,
      }}
      aria-label={`Open ${label}`}
      aria-hidden
      tabIndex={-1}
    >
      <span className='relative block'>
        {!reduceMotion && (
          <span
            className='pnj-hero-hotspot__ping absolute inset-0 -z-10 hidden animate-ping rounded-full bg-[#d4af37]/30'
            aria-hidden='true'
          />
        )}
        <span
          aria-hidden='true'
          className='pnj-hero-hotspot__dot flex h-5 w-5 items-center justify-center rounded-full border border-[#f0d78c]/90 shadow-[0_0_8px_rgba(212,175,55,0.4)] transition-transform duration-300 select-none group-hover:scale-110 @2xl:h-6 @2xl:w-6'
          style={{
            background:
              'linear-gradient(211.53deg, #2F3023 13.54%, #0D0C0A 85.73%)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src='/pnj/icon-pnj.svg'
            alt=''
            draggable={false}
            className='h-2.5 w-2.5 object-contain @2xl:h-3 @2xl:w-3'
          />
        </span>
      </span>
      <span className='pnj-hero-hotspot__label pointer-events-none absolute top-1/2 left-8 -translate-x-1 -translate-y-1/2 rounded-full border border-white/15 bg-[#0a2447] px-2.5 py-1 text-[9px] font-medium tracking-[0.1em] whitespace-nowrap text-white uppercase opacity-0 shadow-[0_2px_10px_rgba(0,0,0,0.45)] transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 @2xl:left-9 @2xl:text-[10px]'>
        {label}
      </span>
    </button>
  );
}

function HotspotInfoCard({
  tab,
  stepIndex,
  panelBackgroundColor,
  lightPanel,
}: {
  tab: PnjHeroHotspot;
  stepIndex: number;
  panelBackgroundColor: string;
  lightPanel: boolean;
}) {
  const specLines = tab.desc
    ? tab.desc.split('\n').filter(line => line.trim())
    : [];

  return (
    <div
      data-step={stepIndex}
      data-visible='false'
      className='pnj-hero-hotspot-card pointer-events-none absolute right-4 bottom-6 z-[20] @2xl:right-12 @2xl:bottom-12 @2xl:max-w-md'
      style={{
        opacity: 0,
        transform: 'translateY(12px)',
        transition: 'opacity 400ms ease, transform 400ms ease',
        pointerEvents: 'none',
      }}
    >
      <div
        className={`rounded-2xl px-5 py-4 shadow-xl backdrop-blur-md @2xl:px-7 @2xl:py-6 ${
          lightPanel ? 'border border-neutral-200/80' : ''
        }`}
        style={{ backgroundColor: panelBackgroundColor }}
      >
        <h3
          className={`text-xl font-semibold tracking-tight @2xl:text-2xl ${
            lightPanel ? 'text-[#003468]' : 'text-white'
          }`}
        >
          {tab.label}
        </h3>
        {specLines.length > 1 ? (
          <ul
            className={`mt-3 space-y-1.5 text-sm leading-relaxed ${
              lightPanel ? 'text-neutral-700' : 'text-white/75'
            }`}
          >
            {specLines.map(line => (
              <li key={line} className='flex gap-2'>
                <span aria-hidden='true' className='text-[#d4af37]'>
                  •
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p
            className={`mt-2 text-sm leading-relaxed ${
              lightPanel ? 'text-neutral-700' : 'text-white/75'
            }`}
          >
            {tab.desc}
          </p>
        )}
        <div
          className={`mt-3 text-[11px] ${
            lightPanel ? 'text-neutral-400' : 'text-white/45'
          }`}
        >
          Bấm vào điểm sáng để xem ảnh chi tiết
        </div>
      </div>
    </div>
  );
}

export function HotspotDrawer({
  tab,
  open,
  isMobile,
  behindRef,
  onBehindTick,
  onClose,
}: {
  tab: PnjHeroHotspot | null;
  open: boolean;
  isMobile: boolean;
  behindRef?: React.RefObject<HTMLElement | null>;
  onBehindTick?: () => void;
  onClose: () => void;
}) {
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const tlRef = React.useRef<gsap.core.Timeline | null>(null);
  const didInitRef = React.useRef(false);
  const onBehindTickRef = React.useRef(onBehindTick);
  onBehindTickRef.current = onBehindTick;
  const [mounted, setMounted] = React.useState(false);
  // Keep portal mounted through close animation; unmount when fully closed
  // so BlockMiniPreview (/admin/blocks) never paints fixed black/white overlays.
  const [portalAlive, setPortalAlive] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) setPortalAlive(true);
  }, [open]);

  React.useEffect(() => {
    if (!portalAlive) didInitRef.current = false;
  }, [portalAlive]);

  useIsomorphicLayoutEffect(() => {
    if (!portalAlive) return;
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (!backdrop || !panel) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduceMotion ? 0 : 0.55;
    const behind = behindRef?.current ?? null;
    const tick = () => onBehindTickRef.current?.();

    const behindOpen = isMobile
      ? { scale: 0.96, x: 0, borderRadius: 12 }
      : { scale: 0.92, x: -28, borderRadius: 16 };

    tlRef.current?.kill();

    // First portal mount: park off-screen via GSAP only — không inline transform
    // (inline transform bị React re-apply mỗi render → panel kẹt ngoài viewport).
    if (!didInitRef.current) {
      gsap.set(backdrop, { autoAlpha: 0 });
      if (isMobile) gsap.set(panel, { yPercent: 100, xPercent: 0 });
      else gsap.set(panel, { xPercent: 100, yPercent: 0 });
      didInitRef.current = true;
      if (!open) return;
    }

    if (behind) {
      gsap.set(behind, {
        transformOrigin: '50% 50%',
        willChange: 'transform',
      });
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut', duration },
      onComplete: () => {
        if (!open) setPortalAlive(false);
      },
    });
    tlRef.current = tl;

    if (open) {
      if (behind) tl.to(behind, { ...behindOpen, onUpdate: tick }, 0);
      tl.to(backdrop, { autoAlpha: 0.25 }, 0);
      if (isMobile) tl.to(panel, { yPercent: 0, xPercent: 0 }, 0);
      else tl.to(panel, { xPercent: 0, yPercent: 0 }, 0);
    } else {
      if (behind)
        tl.to(
          behind,
          {
            scale: 1,
            x: 0,
            borderRadius: 0,
            clearProps: 'transform,borderRadius',
            onUpdate: tick,
          },
          0
        );
      tl.to(backdrop, { autoAlpha: 0 }, 0);
      if (isMobile) tl.to(panel, { yPercent: 100, xPercent: 0 }, 0);
      else tl.to(panel, { xPercent: 100, yPercent: 0 }, 0);
    }

    tick();

    return () => {
      tl.kill();
      if (tlRef.current === tl) tlRef.current = null;
    };
  }, [open, isMobile, behindRef, portalAlive]);

  React.useEffect(() => {
    const behind = behindRef?.current;
    return () => {
      if (behind) {
        gsap.set(behind, { clearProps: 'transform,borderRadius,willChange' });
      }
    };
  }, [behindRef]);

  if (!mounted || !portalAlive) return null;

  return createPortal(
    <>
      <div
        ref={backdropRef}
        className='fixed inset-0 z-[1900] bg-black'
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        onClick={onClose}
        aria-hidden='true'
      />
      <div
        ref={panelRef}
        className={`fixed z-[1950] bg-white shadow-2xl ${
          isMobile
            ? 'right-0 bottom-0 left-0 h-[88svh] w-full rounded-t-2xl'
            : 'top-0 right-0 h-screen w-1/2'
        }`}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        role='dialog'
        aria-modal='true'
        aria-hidden={!open}
      >
        {tab && (
          <div
            className='relative h-full overflow-y-auto overscroll-contain p-8 @2xl:p-12'
            data-lenis-prevent
          >
            <button
              type='button'
              onClick={onClose}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClose();
                }
              }}
              data-cta-id='detail-drawer-close'
              className='absolute top-6 right-6 z-10 min-h-11 min-w-11 p-2 transition-opacity hover:opacity-60'
              aria-label='Close'
              tabIndex={0}
            >
              <svg width='14' height='14' viewBox='0 0 12 13' fill='none'>
                <line
                  x1='0.48'
                  y1='11.48'
                  x2='11.09'
                  y2='0.88'
                  stroke='black'
                  strokeWidth='0.75'
                />
                <line
                  x1='1.02'
                  y1='0.98'
                  x2='11.62'
                  y2='11.59'
                  stroke='black'
                  strokeWidth='0.75'
                />
              </svg>
            </button>
            <h3 className='mt-12 mb-6 text-3xl font-semibold tracking-tight text-[#003468]'>
              {tab.label}
            </h3>
            {tab.desc.includes('\n') ? (
              <ul className='mb-8 space-y-2 text-base leading-relaxed text-neutral-700'>
                {tab.desc
                  .split('\n')
                  .filter(line => line.trim())
                  .map(line => (
                    <li key={line} className='flex gap-2'>
                      <span aria-hidden='true' className='text-[#d4af37]'>
                        •
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className='mb-8 text-base leading-relaxed text-neutral-700'>
                {tab.desc}
              </p>
            )}
            <div className='mt-8 pb-8'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tab.img}
                alt={tab.label}
                className='max-h-[60svh] w-full object-contain'
                loading='lazy'
                decoding='async'
              />
            </div>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}

export type HotspotOverlayHandle = {
  /** DOM-only sync — không setState, tránh re-render khi scrub. */
  sync: (step: number, inPin: boolean) => void;
};

export const HotspotOverlayLayer = React.forwardRef<
  HotspotOverlayHandle,
  {
    tabs: PnjHeroHotspot[];
    activeTab: string | null;
    ringOffsetColor: string;
    panelBackgroundColor: string;
    reduceMotion?: boolean;
    exclusive?: boolean;
    onHotspotClick: (key: string) => void;
  }
>(function HotspotOverlayLayer(
  {
    tabs,
    activeTab,
    ringOffsetColor,
    panelBackgroundColor,
    reduceMotion = false,
    exclusive = false,
    onHotspotClick,
  },
  ref
) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const stepRef = React.useRef(-1);
  const inPinRef = React.useRef(false);
  const exclusiveRef = React.useRef(exclusive);
  exclusiveRef.current = exclusive;

  const tabOpen = activeTab !== null;
  const lightPanel = isLightBackground(panelBackgroundColor);

  const applyDom = React.useCallback((step: number, inPin: boolean) => {
    const root = rootRef.current;
    if (!root) return;
    stepRef.current = step;
    inPinRef.current = inPin;
    root.dataset.scrollStep = String(step);
    root.dataset.inPin = inPin ? 'true' : 'false';

    const exclusiveMode = exclusiveRef.current;
    root.querySelectorAll<HTMLElement>('.pnj-hero-hotspot').forEach(el => {
      const i = Number(el.dataset.step);
      const isCurrent = inPin && i === step;
      // exclusive: chỉ current khi inPin; không exclusive: luôn hiện (như trước).
      const visible = exclusiveMode ? isCurrent : true;
      el.dataset.current = isCurrent ? 'true' : 'false';
      el.style.opacity = visible ? '1' : '0';
      el.style.transform = visible
        ? 'translate(-50%, -50%) scale(1)'
        : 'translate(-50%, -50%) scale(0.85)';
      el.style.pointerEvents = visible ? 'auto' : 'none';
      el.setAttribute('aria-hidden', visible ? 'false' : 'true');
      el.tabIndex = visible ? 0 : -1;

      const ping = el.querySelector<HTMLElement>('.pnj-hero-hotspot__ping');
      if (ping) ping.classList.toggle('hidden', !(isCurrent && visible));

      const dot = el.querySelector<HTMLElement>('.pnj-hero-hotspot__dot');
      if (dot) {
        dot.classList.toggle('scale-110', isCurrent);
        dot.classList.toggle('ring-1', isCurrent);
        dot.classList.toggle('ring-[#f0d78c]/70', isCurrent);
        dot.classList.toggle('ring-offset-1', isCurrent);
      }

      const label = el.querySelector<HTMLElement>('.pnj-hero-hotspot__label');
      if (label) {
        if (isCurrent && visible) {
          label.style.opacity = '1';
          label.style.transform = 'translate(0, -50%)';
        } else {
          label.style.opacity = '';
          label.style.transform = '';
        }
      }
    });

    root.querySelectorAll<HTMLElement>('.pnj-hero-hotspot-card').forEach(el => {
      const i = Number(el.dataset.step);
      const visible = inPin && i === step;
      el.dataset.visible = visible ? 'true' : 'false';
      el.style.opacity = visible ? '1' : '0';
      el.style.transform = visible ? 'translateY(0)' : 'translateY(12px)';
    });
  }, []);

  React.useImperativeHandle(
    ref,
    () => ({
      sync: (step, inPin) => {
        if (step === stepRef.current && inPin === inPinRef.current) return;
        applyDom(step, inPin);
      },
    }),
    [applyDom]
  );

  // Re-apply when exclusive / tabs change (not on every scroll).
  React.useEffect(() => {
    applyDom(stepRef.current, inPinRef.current);
  }, [tabs, exclusive, applyDom]);

  return (
    <div
      ref={rootRef}
      className='pnj-hero-hotspot-overlay pointer-events-none absolute inset-0 z-40'
      data-scroll-step='0'
      data-in-pin='false'
      style={{
        opacity: tabOpen ? 0 : 1,
        transition: 'opacity 300ms ease',
        pointerEvents: tabOpen ? 'none' : undefined,
      }}
    >
      <div className='relative h-full w-full'>
        {tabs.map((t, i) => (
          <Hotspot
            key={t.key}
            xPct={t.dotX}
            yPct={t.dotY}
            label={t.label}
            stepIndex={i}
            ringOffsetColor={ringOffsetColor}
            reduceMotion={reduceMotion}
            onClick={() => onHotspotClick(t.key)}
          />
        ))}
      </div>
      {tabs.map((t, i) => (
        <HotspotInfoCard
          key={`card-${t.key}`}
          tab={t}
          stepIndex={i}
          panelBackgroundColor={panelBackgroundColor}
          lightPanel={lightPanel}
        />
      ))}
    </div>
  );
});
