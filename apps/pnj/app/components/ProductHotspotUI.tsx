'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';

export interface HotspotTab {
  key: string;
  label: string;
  desc: string;
  img: string;
  /** Position of the hotspot dot. Percentages of the container. */
  dotX: number;
  dotY: number;
}

interface LenisGlobal {
  __lenis?: { stop: () => void; start: () => void };
}

export const isLightBackground = (color: string) => {
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

/** Body scroll lock while a drawer is open.
 *
 *  Mobile: iOS-safe `position: fixed` + `top: -scrollY` trick.
 *  Desktop: MUST NOT displace layout — the hero pins `.hero-canvas-wrap`
 *  with GSAP `pinType: 'transform'`, and `position: fixed` on <body> yanks
 *  that pinned content off-screen (left half goes blank). Instead lock via
 *  `overflow: hidden` on <html> and compensate the scrollbar width so the
 *  pinned canvas stays visually put. */
export const useDrawerScrollLock = (activeTab: string | null) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const lenis = (window as unknown as LenisGlobal).__lenis;
    const body = document.body;
    const html = document.documentElement;

    const unlock = () => {
      // Mobile fixed-position lock
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
      // Desktop overflow lock
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

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return isMobile;
};

export function Hotspot({
  xPct,
  yPct,
  label,
  active,
  visible = true,
  ringOffsetColor,
  reduceMotion = false,
  onClick,
}: {
  xPct: number;
  yPct: number;
  label: string;
  active: boolean;
  /** When false, fade out + disable clicks (scroll-past exclusive mode). */
  visible?: boolean;
  ringOffsetColor: string;
  reduceMotion?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      data-cta-id={`hotspot-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className='hero-hotspot group absolute'
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        touchAction: 'manipulation',
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translate(-50%, -50%) scale(1)'
          : 'translate(-50%, -50%) scale(0.85)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 280ms ease, transform 280ms ease',
      }}
      aria-label={`Open ${label}`}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <span className='hotspot-float relative block'>
        {active && visible && !reduceMotion && (
          <span
            className='absolute inset-0 -z-10 animate-ping rounded-full bg-[#d4af37]/30'
            aria-hidden='true'
          />
        )}
        <span
          aria-hidden='true'
          className={`flex h-5 w-5 items-center justify-center rounded-full border border-[#f0d78c]/90 shadow-[0_0_8px_rgba(212,175,55,0.4)] transition-transform duration-300 select-none group-hover:scale-110 md:h-6 md:w-6 ${
            active ? 'scale-110 ring-1 ring-[#f0d78c]/70 ring-offset-1' : ''
          }`}
          style={{
            background:
              'linear-gradient(211.53deg, #2F3023 13.54%, #0D0C0A 85.73%)',
            ...(active
              ? ({ '--tw-ring-offset-color': ringOffsetColor } as Record<
                  string,
                  string
                >)
              : {}),
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src='/icon-pnj.svg'
            alt=''
            draggable={false}
            className='h-2.5 w-2.5 object-contain md:h-3 md:w-3'
          />
        </span>
      </span>
      <span
        className={`pointer-events-none absolute top-1/2 left-8 -translate-y-1/2 rounded-full border border-white/15 bg-[#0a2447] px-2.5 py-1 text-[9px] font-medium tracking-[0.1em] whitespace-nowrap text-white uppercase shadow-[0_2px_10px_rgba(0,0,0,0.45)] transition-all duration-300 md:left-9 md:text-[10px] ${
          active && visible
            ? 'translate-x-0 opacity-100'
            : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export function HotspotInfoCard({
  tab,
  visible,
  panelBackgroundColor,
  lightPanel,
}: {
  tab: HotspotTab;
  visible: boolean;
  panelBackgroundColor: string;
  lightPanel: boolean;
}) {
  const specLines = tab.desc
    ? tab.desc.split('\n').filter(line => line.trim())
    : [];

  return (
    <div
      className='pointer-events-none absolute right-4 bottom-6 z-[20] md:right-12 md:bottom-12 md:max-w-md'
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 400ms ease, transform 400ms ease',
      }}
    >
      <div
        key={tab.key}
        className={`fade-step rounded-2xl px-5 py-4 shadow-xl backdrop-blur-md md:px-7 md:py-6 ${
          lightPanel ? 'border border-neutral-200/80' : ''
        }`}
        style={{ backgroundColor: panelBackgroundColor }}
      >
        <h3
          className={`text-xl font-semibold tracking-tight md:text-2xl ${
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
  tab: HotspotTab | null;
  open: boolean;
  isMobile: boolean;
  /** Content behind the drawer — scales down + nudges left on open. */
  behindRef?: RefObject<HTMLElement | null>;
  /** Called each frame while behind animates (e.g. canvas redraw). */
  onBehindTick?: () => void;
  onClose: () => void;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const didInitRef = useRef(false);
  const onBehindTickRef = useRef(onBehindTick);
  onBehindTickRef.current = onBehindTick;

  useIsomorphicLayoutEffect(() => {
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (!backdrop || !panel) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduceMotion ? 0 : 0.55;
    const behind = behindRef?.current ?? null;
    const tick = () => onBehindTickRef.current?.();

    // Scale the behind layer IN PLACE. Do NOT switch it to position:fixed —
    // the hero pins `.hero-canvas-wrap` with pinType:'transform', so a fixed
    // descendant would resolve against that transformed ancestor and jump
    // off-screen. Body scroll-lock (position:fixed + top:-scrollY) already
    // keeps the pinned content visually put.
    const behindOpen = isMobile
      ? { scale: 0.96, x: 0, borderRadius: 12 }
      : { scale: 0.92, x: -28, borderRadius: 16 };

    tlRef.current?.kill();

    // First mount: park panel off-screen + hide backdrop, no tween.
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
  }, [open, isMobile, behindRef]);

  useEffect(() => {
    return () => {
      const behind = behindRef?.current;
      if (behind) {
        gsap.set(behind, { clearProps: 'transform,borderRadius,willChange' });
      }
    };
  }, [behindRef]);

  return (
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
            ? 'right-0 bottom-0 left-0 h-[88vh] w-full rounded-t-2xl'
            : 'top-0 right-0 h-screen w-1/2'
        }`}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        role='dialog'
        aria-modal='true'
        aria-hidden={!open}
      >
        {tab && (
          <div
            className='tab active relative h-full overflow-y-auto overscroll-contain p-8 md:p-12'
            data-lenis-prevent
          >
            <button
              type='button'
              onClick={onClose}
              data-cta-id='detail-drawer-close'
              className='tab-close absolute top-6 right-6 z-10 p-2 transition-opacity hover:opacity-60'
              aria-label='Close'
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
            <h3 className='title mt-12 mb-6 text-3xl font-semibold tracking-tight text-[#003468]'>
              {tab.label}
            </h3>
            {tab.desc.includes('\n') ? (
              <ul className='desc mb-8 space-y-2 text-base leading-relaxed text-neutral-700'>
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
              <p className='desc mb-8 text-base leading-relaxed text-neutral-700'>
                {tab.desc}
              </p>
            )}
            <div className='tab-img mt-8 pb-8'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tab.img}
                alt={tab.label}
                className='max-h-[60vh] w-full object-contain'
                loading='lazy'
                decoding='async'
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/** Overlay layer: dots + info card for canvas or image containers.
 *  `exclusive` = only the current scroll-step hotspot is visible; others fade out. */
export function HotspotOverlayLayer({
  tabs,
  scrollStep,
  inPin,
  activeTab,
  ringOffsetColor,
  panelBackgroundColor,
  reduceMotion = false,
  exclusive = false,
  onHotspotClick,
}: {
  tabs: HotspotTab[];
  scrollStep: number;
  inPin: boolean;
  activeTab: string | null;
  ringOffsetColor: string;
  panelBackgroundColor: string;
  reduceMotion?: boolean;
  exclusive?: boolean;
  onHotspotClick: (key: string) => void;
}) {
  const tabOpen = activeTab !== null;
  const stepTab = tabs[scrollStep];
  const cardVisible = inPin && !tabOpen;
  const lightPanel = isLightBackground(panelBackgroundColor);

  return (
    <div
      className='hero-hotspot-overlay pointer-events-none absolute inset-0 z-40'
      style={{
        opacity: tabOpen ? 0 : 1,
        transition: 'opacity 300ms ease',
      }}
    >
      <div className='relative h-full w-full'>
        {tabs.map((t, i) => {
          const isCurrent = inPin && scrollStep === i;
          return (
            <Hotspot
              key={t.key}
              xPct={t.dotX}
              yPct={t.dotY}
              label={t.label}
              active={isCurrent}
              visible={exclusive ? isCurrent : true}
              ringOffsetColor={ringOffsetColor}
              reduceMotion={reduceMotion}
              onClick={() => onHotspotClick(t.key)}
            />
          );
        })}
      </div>

      {stepTab && (
        <HotspotInfoCard
          tab={stepTab}
          visible={cardVisible}
          panelBackgroundColor={panelBackgroundColor}
          lightPanel={lightPanel}
        />
      )}
    </div>
  );
}
