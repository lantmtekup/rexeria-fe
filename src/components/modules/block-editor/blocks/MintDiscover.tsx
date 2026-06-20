'use client';

/**
 * Data-block "Mint · Discover" (P3/d) — self-contained, container-query.
 * Fork từ template ProductDetailSection: hotspot + side drawer + scroll-lock +
 * scrub. Khác bản template:
 *  - isMobile đo qua useContainerMobile (khung block) thay window.matchMedia.
 *  - CSS md:→@2xl: (container query) để preview editor đúng theo khung.
 *  - ảnh coin có data-element-key='mainImage' → inline-edit.
 * Lưu ý: drawer/backdrop dùng position:fixed (viewport) — đúng trên /p; trong
 * editor nếu mở hotspot sẽ phủ cả khung editor (chấp nhận, ít khi mở khi sửa).
 */
import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintDiscoverContent,
} from '../types';
import {
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useContainerMobile } from './useContainerMobile';

interface LenisGlobal {
  __lenis?: { stop: () => void; start: () => void };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface Props {
  content: MintDiscoverContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function MintDiscover({
  content,
  styles,
  order,
  positions,
  activeKey,
}: Props) {
  const { variant, mainImage, mainAlt, tabs } = content;
  const sectionRef = React.useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = React.useState<string | null>(null);
  const isMobile = useContainerMobile(sectionRef);
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  // Body scroll-lock khi drawer mở (lenis guarded — no-op ngoài SmoothScroll).
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const lenis = (window as unknown as LenisGlobal).__lenis;
    const body = document.body;
    if (activeTab !== null) {
      const scrollY = window.scrollY;
      body.dataset.scrollY = String(scrollY);
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      lenis?.stop();
    } else {
      const savedY = parseInt(body.dataset.scrollY || '0', 10);
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      delete body.dataset.scrollY;
      if (savedY) window.scrollTo(0, savedY);
      lenis?.start();
    }
    return () => {
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
      lenis?.start();
    };
  }, [activeTab]);

  // Scrub fade/scale (variant 2 desktop = scale, còn lại fade).
  React.useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = sectionRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const img = root.querySelector<HTMLElement>('.zoomin-img');
      if (!img) return;
      if (variant === '2' && !isMobile) {
        gsap.fromTo(
          img,
          { autoAlpha: 0, scale: 0.7 },
          {
            autoAlpha: 1,
            scale: 1.1,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top bottom',
              end: 'center center',
              scrub: 1,
              invalidateOnRefresh: true,
            },
          }
        );
      } else {
        gsap.fromTo(
          img,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 1,
            ease: 'sine.out',
            scrollTrigger: {
              trigger: root,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }
    }, root);
    return () => ctx.revert();
  }, [variant, isMobile]);

  const tabOpen = activeTab !== null;
  const tabData = activeTab ? tabs.find(t => t.key === activeTab) : null;

  return (
    <section
      ref={sectionRef}
      data-variant={variant}
      className={`product-detail @container relative h-[70vh] w-full overflow-hidden @2xl:h-screen ${
        variant === '2' ? 'bg-neutral-900 text-white' : 'bg-neutral-100'
      }`}
      style={{ touchAction: 'pan-y' }}
    >
      <div className='content relative h-full w-full'>
        <div
          className='wrapper-image absolute inset-0'
          style={{
            transform: tabOpen
              ? isMobile
                ? 'translate3d(0, 0, 0) scale(1.15)'
                : 'translate3d(-25%, 0, 0) scale(2)'
              : 'none',
            transformOrigin: 'center center',
            transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: tabOpen ? 'transform' : 'auto',
          }}
        >
          <div className='img relative h-full w-full overflow-hidden'>
            <div className='relative h-full w-full p-6 @2xl:p-16'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-element-key='mainImage'
                src={mainImage}
                alt={mainAlt}
                loading='eager'
                decoding='async'
                style={styleOf('mainImage')}
                className={selectableClass(
                  activeKey === 'mainImage',
                  'zoomin-img h-full w-full object-contain select-none'
                )}
                draggable={false}
              />
              {tabs.map(t => (
                <Hotspot
                  key={t.key}
                  xPct={t.dotX}
                  yPct={t.dotY}
                  label={t.label}
                  ctaId={`hotspot-${slugify(t.label)}`}
                  onClick={() =>
                    setActiveTab(activeTab === t.key ? null : t.key)
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className='fixed inset-0 z-[1900] bg-black/40 transition-opacity duration-500'
        style={{
          opacity: tabOpen ? 1 : 0,
          pointerEvents: tabOpen ? 'auto' : 'none',
        }}
        onClick={() => setActiveTab(null)}
        aria-hidden='true'
      />

      {/* Drawer */}
      <div
        className={`fixed z-[1950] bg-white text-neutral-900 shadow-2xl ${
          isMobile
            ? 'right-0 bottom-0 left-0 h-[88vh] w-full rounded-t-2xl'
            : 'top-0 right-0 h-screen w-1/2'
        }`}
        style={{
          transform: tabOpen
            ? 'translate3d(0, 0, 0)'
            : isMobile
              ? 'translate3d(0, 100%, 0)'
              : 'translate3d(100%, 0, 0)',
          transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: tabOpen ? 'transform' : 'auto',
          pointerEvents: tabOpen ? 'auto' : 'none',
        }}
        role='dialog'
        aria-modal='true'
        aria-hidden={!tabOpen}
      >
        {tabData && (
          <div className='relative h-full overflow-y-auto overscroll-contain p-8 @2xl:p-12'>
            <button
              type='button'
              onClick={() => setActiveTab(null)}
              className='absolute top-6 right-6 z-10 p-2 transition-opacity hover:opacity-60'
              aria-label='Close'
              data-rexer-cta='close-detail-tab'
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
            <h3 className='mt-12 mb-6 font-serif text-3xl'>{tabData.label}</h3>
            <p className='mb-8 text-base leading-relaxed text-neutral-700'>
              {tabData.desc}
            </p>
            <div className='mt-8 pb-8'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tabData.img}
                alt={tabData.label}
                className='max-h-[60vh] w-full object-contain'
                loading='lazy'
                decoding='async'
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Hotspot({
  xPct,
  yPct,
  label,
  ctaId,
  onClick,
}: {
  xPct: number;
  yPct: number;
  label: string;
  ctaId: string;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      data-rexer-cta={ctaId}
      className='group absolute flex -translate-x-1/2 -translate-y-1/2 items-center'
      style={{ left: `${xPct}%`, top: `${yPct}%`, touchAction: 'manipulation' }}
      aria-label={`Open ${label}`}
    >
      <span className='relative flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/15 transition-transform duration-300 group-hover:scale-125'>
        <span className='block h-1 w-1 rounded-full bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
      </span>
      <span className='ml-3 -translate-x-1 rounded-full bg-white/95 px-3 py-1 text-[10px] tracking-[0.18em] whitespace-nowrap text-black uppercase opacity-0 shadow-sm transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100'>
        {label}
      </span>
    </button>
  );
}
