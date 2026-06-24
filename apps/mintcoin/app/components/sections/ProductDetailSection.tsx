'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface LenisGlobal {
  __lenis?: { stop: () => void; start: () => void };
}

interface Tab {
  key: string;
  label: string;
  desc: string;
  img: string;
  /** Position of the hotspot dot ON the product image. Percentages of
   *  the image container. */
  dotX: number; // 0–100 (horizontal %)
  dotY: number; // 0–100 (vertical %)
}

interface Props {
  id?: string;
  variant: '1' | '2';
  mainImage: string;
  mainAlt: string;
  tabs: Tab[];
}

// Reusable product detail block (Delvaux reference pattern):
//   - Big product image fills the section
//   - SMALL hotspot dots positioned ON specific points of the product
//   - Clicking a dot opens a full side panel (drawer) with the feature
//
// SCROLL-SEQUENCE (2026-06): the section is now TALL with a `sticky` inner
// wrapper (CSS sticky, NOT GSAP pin — iOS-safe). As the user scrolls through,
// `scrollStep` advances 0→N-1; the matching hotspot lights up and an inline
// info card reveals that feature's text — so the user sees every detail just
// by scrolling, like auto-clicking each hotspot. Click → full drawer still works.
export default function ProductDetailSection({
  id,
  variant,
  mainImage,
  mainAlt,
  tabs,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const imgScrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  // Scroll-driven sequence: which hotspot is currently revealed (0…N-1), and
  // whether the section is in its pinned range (controls info-card visibility).
  const [scrollStep, setScrollStep] = useState(0);
  const [inPin, setInPin] = useState(false);
  const lastStepRef = useRef(0);
  // Track mobile breakpoint so the click-hotspot animation + drawer slide
  // direction can be tailored: desktop slides drawer in from right + zooms
  // the coin 2× leftward; mobile slides from bottom + only nudges the
  // coin 1.15× since the drawer takes the entire viewport anyway.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Center the default scroll position of the pannable image on mobile.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = imgScrollRef.current;
    if (!el) return;
    const center = () => {
      if (window.innerWidth >= 768) return;
      const offset = (el.scrollWidth - el.clientWidth) / 2;
      if (offset > 0) el.scrollLeft = offset;
    };
    const t = setTimeout(center, 50);
    window.addEventListener('resize', center);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', center);
    };
  }, []);

  // Lock body scroll while the drawer is open (iOS-safe position:fixed pattern).
  useEffect(() => {
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

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = sectionRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const img = root.querySelector<HTMLElement>('.zoomin-img');

      // VISIBILITY: one-time fade-in that plays once and STAYS.
      if (img) {
        gsap.fromTo(
          img,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 1.0,
            ease: 'sine.out',
            scrollTrigger: { trigger: root, start: 'top 85%', once: true },
          }
        );

        // Zoom-in as the coin enters; completes by the time the sticky pin
        // engages (end 'top top'), then holds while the sequence plays.
        if (
          variant === '2' &&
          !window.matchMedia('(max-width: 767px)').matches
        ) {
          gsap.fromTo(
            img,
            { scale: 0.78 },
            {
              scale: 1.05,
              ease: 'none',
              scrollTrigger: {
                trigger: root,
                start: 'top bottom',
                end: 'top top',
                scrub: 1,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      }

      // SCROLL SEQUENCE: map scroll progress through the tall section to a
      // hotspot step. `floor(progress * N)` advances 0→N-1 as you scroll;
      // `inPin` toggles the info-card while the sticky coin is on screen.
      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onToggle: self => setInPin(self.isActive),
        onUpdate: self => {
          const step = Math.min(
            Math.floor(self.progress * tabs.length),
            tabs.length - 1
          );
          if (step !== lastStepRef.current) {
            lastStepRef.current = step;
            setScrollStep(step);
          }
        },
      });
    }, root);

    return () => ctx.revert();
  }, [tabs.length, variant]);

  const tabOpen = activeTab !== null;
  const tabData = activeTab ? tabs.find(t => t.key === activeTab) : null;
  const stepTab = tabs[scrollStep];
  // Info card shows while pinned and no drawer is open.
  const cardVisible = inPin && !tabOpen;
  const dark = variant === '2';

  return (
    <section
      id={id}
      ref={sectionRef}
      data-variant={variant}
      className='product-detail relative w-full'
      // Tall scroll track: ~120vh per hotspot so each step gets a comfortable
      // scroll band. The inner wrapper is `sticky`, so the coin holds while the
      // page scrolls through these bands.
      style={{ height: `${Math.max(tabs.length, 2) * 120}vh` }}
    >
      <div
        className={`sticky top-0 h-[70vh] w-full overflow-hidden md:h-screen ${
          dark ? 'bg-neutral-900 text-white' : 'bg-neutral-100'
        }`}
        style={{ touchAction: 'pan-y' }}
      >
        <div
          className='content relative h-full w-full'
          style={!isMobile ? { contain: 'paint' } : undefined}
        >
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
            <div
              ref={imgScrollRef}
              className='img product-detail-pan relative h-full w-full overflow-hidden'
            >
              <div className='relative h-full w-full p-6 md:p-16'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mainImage}
                  alt={mainAlt}
                  loading='eager'
                  decoding='async'
                  fetchPriority='high'
                  className='zoomin-img h-full w-full object-contain select-none'
                  draggable={false}
                />

                {/* Hotspots. The scroll-active one is highlighted; clicking any
                    still opens the full drawer. Hidden while a drawer is open. */}
                <div
                  style={{
                    opacity: tabOpen ? 0 : 1,
                    pointerEvents: tabOpen ? 'none' : 'auto',
                    transition: 'opacity 300ms ease',
                  }}
                >
                  {tabs.map((t, i) => (
                    <Hotspot
                      key={t.key}
                      xPct={t.dotX}
                      yPct={t.dotY}
                      label={t.label}
                      active={inPin && scrollStep === i}
                      onClick={() =>
                        setActiveTab(activeTab === t.key ? null : t.key)
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Inline info card — reveals the current hotspot's text as the user
              scrolls (no scroll-lock). Desktop: bottom-left. Mobile: bottom. */}
          {stepTab && (
            <div
              className='pointer-events-none absolute right-4 bottom-6 left-4 z-[20] md:right-auto md:bottom-12 md:left-12 md:max-w-md'
              style={{
                opacity: cardVisible ? 1 : 0,
                transform: cardVisible ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 400ms ease, transform 400ms ease',
              }}
            >
              <div
                key={stepTab.key}
                className={`fade-step rounded-2xl px-5 py-4 shadow-xl backdrop-blur-md md:px-7 md:py-6 ${
                  dark
                    ? 'bg-white/10 text-white'
                    : 'bg-white/80 text-neutral-900'
                }`}
              >
                <div
                  className={`mb-1 font-mono text-[10px] tracking-[0.2em] uppercase ${
                    dark ? 'text-white/50' : 'text-neutral-500'
                  }`}
                >
                  {String(scrollStep + 1).padStart(2, '0')} / {tabs.length}
                </div>
                <h3 className='font-serif text-xl md:text-2xl'>
                  {stepTab.label}
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    dark ? 'text-white/70' : 'text-neutral-600'
                  }`}
                >
                  {stepTab.desc}
                </p>
                <div
                  className={`mt-3 text-[11px] ${
                    dark ? 'text-white/40' : 'text-neutral-400'
                  }`}
                >
                  Bấm vào điểm sáng để xem ảnh chi tiết →
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop — dims the page behind the drawer. */}
      <div
        className='fixed inset-0 z-[1900] bg-black/40 transition-opacity duration-500'
        style={{
          opacity: tabOpen ? 1 : 0,
          pointerEvents: tabOpen ? 'auto' : 'none',
        }}
        onClick={() => setActiveTab(null)}
        aria-hidden='true'
      />

      {/* Drawer — mobile slides up from bottom, desktop in from right. */}
      <div
        className={`fixed z-[1950] bg-white shadow-2xl ${
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
          <div
            className='tab active relative h-full overflow-y-auto overscroll-contain p-8 md:p-12'
            data-lenis-prevent
          >
            <button
              type='button'
              onClick={() => setActiveTab(null)}
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
            <h3 className='title mt-12 mb-6 font-serif text-3xl'>
              {tabData.label}
            </h3>
            <p className='desc mb-8 text-base leading-relaxed text-neutral-700'>
              {tabData.desc}
            </p>
            <div className='tab-img mt-8 pb-8'>
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

// ── Hotspot dot ────────────────────────────────────────────────────
function Hotspot({
  xPct,
  yPct,
  label,
  active,
  onClick,
}: {
  xPct: number;
  yPct: number;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      data-cta-id={`hotspot-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className='group absolute -translate-x-1/2 -translate-y-1/2'
      style={{ left: `${xPct}%`, top: `${yPct}%`, touchAction: 'manipulation' }}
      aria-label={`Open ${label}`}
    >
      {/* Scroll-active or hover → scale up + glow ring so the user's eye tracks
          the hotspot the inline card is describing. */}
      <span className='hotspot-float block'>
        {active && (
          <span
            className='absolute inset-0 -z-10 animate-ping rounded-full bg-amber-300/50'
            aria-hidden='true'
          />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src='/mint-icon.png'
          alt=''
          aria-hidden='true'
          draggable={false}
          className={`h-10 w-10 rounded-full shadow-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition-transform duration-300 select-none group-hover:scale-110 ${
            active ? 'scale-125 ring-2 ring-amber-300' : ''
          }`}
        />
      </span>
      {/* Label — shows on hover, and stays visible while scroll-active. */}
      <span
        className={`pointer-events-none absolute top-1/2 left-12 -translate-y-1/2 rounded-full bg-white/95 px-3 py-1 text-[10px] tracking-[0.18em] whitespace-nowrap text-black uppercase shadow-sm transition-all duration-300 ${
          active
            ? 'translate-x-0 opacity-100'
            : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
        }`}
      >
        {label}
      </span>
    </button>
  );
}
