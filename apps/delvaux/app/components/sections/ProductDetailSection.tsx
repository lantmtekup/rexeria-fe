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

// Reusable product detail block that matches the Delvaux reference pattern:
//   - Big product image fills the section
//   - SMALL hotspot dots (32px) positioned ON specific points of the product
//   - Each dot is an arrow icon inside a thin-bordered circle
//   - Hovering a dot scales it up and slides a label beside it
//   - Clicking opens a side panel with the feature description
//
// Replaces the previous design (large pill buttons stacked vertically with
// always-visible labels) which didn't match the luxury minimal aesthetic.
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

  // Center the default scroll position of the pannable image on mobile.
  // Without this, the image lands flush-left (showing only the heel side)
  // — the more interesting middle (crystal embellishment + heel curve) is
  // hidden behind the right edge until the user manually swipes.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = imgScrollRef.current;
    if (!el) return;
    const center = () => {
      // Only center on mobile — desktop uses object-cover, no scroll.
      if (window.innerWidth >= 768) return;
      const offset = (el.scrollWidth - el.clientWidth) / 2;
      if (offset > 0) el.scrollLeft = offset;
    };
    // Defer one tick so the image has finished its initial layout pass
    // (otherwise scrollWidth equals clientWidth and we don't centre).
    const t = setTimeout(center, 50);
    window.addEventListener('resize', center);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', center);
    };
  }, []);

  // Lock body scroll while the drawer is open (matches Astro original
  // which adds 'overflow-hidden' to <body>). Stops Lenis as well so
  // wheel events while the drawer is up don't smooth-scroll the page
  // behind it.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const lenis = (window as unknown as LenisGlobal).__lenis;
    if (activeTab !== null) {
      document.body.style.overflow = 'hidden';
      lenis?.stop();
    } else {
      document.body.style.overflow = '';
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = '';
      lenis?.start();
    };
  }, [activeTab]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = sectionRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // STEP 3 — opacity-only fade-in restored. autoAlpha = visibility +
      // opacity, both compositor-only operations. toggleActions fires
      // once on enter, reverses on leave-back — no per-tick scrub work.
      const img = root.querySelector<HTMLElement>('.zoomin-img');
      if (img) {
        gsap.fromTo(
          img,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 1.0,
            ease: 'sine.out',
            scrollTrigger: {
              trigger: root,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              fastScrollEnd: true,
              invalidateOnRefresh: true,
            },
          }
        );
      }
    }, root);

    return () => ctx.revert();
  }, []);

  const tabOpen = activeTab !== null;
  const tabData = activeTab ? tabs.find(t => t.key === activeTab) : null;

  return (
    <section
      id={id}
      ref={sectionRef}
      data-variant={variant}
      // Mobile: 70vh (was 100vh). On portrait phones the image was
      // stretching vertically, exaggerating the shoe to feel awkwardly
      // tall. 70vh keeps the image aspect closer to its natural 1.6:1
      // landscape ratio. Desktop unchanged.
      className='product-detail relative h-[70vh] w-full overflow-hidden bg-neutral-100 md:h-screen'
    >
      {/* Wrapper: contain:paint pre-warms a GPU layer at parse time so
          first scroll-into-view doesn't pay rasterisation cost.
          data-lenis-prevent intentionally NOT used — caused micro-pause
          in Lenis scroll handling at viewport entry. */}
      {/*
        Panel-open animation REWRITE:
        Original used `transition: width / flex-basis` on both image and
        side panel — both are LAYOUT properties, so every animation frame
        re-ran layout + reflow on the image, hotspots, and panel content
        ("hơi giật"). Layout transitions cost ~10-15ms per frame on a
        full-viewport section.

        New approach uses ONLY `transform: translateX` (compositor-only):
        - Image wrapper: stays full-width, always.
        - Panel: absolute right:0, width 50% on desktop. When closed,
          transform: translateX(100%) (off-screen right). When open,
          translateX(0). Pure GPU work — no layout, no reflow.
        - Visually the panel slides IN OVER the image's right half. The
          image is partially hidden behind it. Same 2-column read as the
          flex version, but rendered cheaply.
      */}
      <div
        className='content relative h-full w-full'
        style={{ contain: 'paint' }}
      >
        {/* Image fills the section. On MOBILE the image is wider than the
            portrait viewport so users can pan horizontally to see the full
            shoe; on DESKTOP it cover-fits the section as before. */}
        <div className='wrapper-image absolute inset-0'>
          {/*
            Pannable wrapper:
            - Mobile (<md): overflow-x:auto + touch-pan-x → user drags
              horizontally to reveal the right half of the image.
              data-lenis-prevent stops Lenis from intercepting touch
              gestures here so horizontal swipe works without nudging
              the page vertically.
            - Desktop (md+): overflow-x:hidden → image cover-fits.
            The inner container width auto-sizes to the image's natural
            ratio on mobile (h-full + w-auto), and stretches to 100% on
            desktop. Hotspots live INSIDE this inner container so their
            xPct/yPct stay anchored to the image as the user pans. */}
          <div
            ref={imgScrollRef}
            className='img product-detail-pan relative h-full w-full overflow-x-auto overflow-y-hidden md:overflow-hidden'
          >
            <div className='relative h-full w-max md:w-full'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mainImage}
                alt={mainAlt}
                loading='eager'
                decoding='async'
                fetchPriority='high'
                className='zoomin-img h-full w-auto max-w-none select-none md:h-full md:w-full md:max-w-full md:object-cover'
                draggable={false}
              />

              {/* Hotspots positioned within the inner image container so
                  xPct/yPct map to the actual image, not the viewport.
                  When user pans on mobile, hotspots move with the image. */}
              {tabs.map(t => (
                <Hotspot
                  key={t.key}
                  xPct={t.dotX}
                  yPct={t.dotY}
                  label={t.label}
                  onClick={() =>
                    setActiveTab(activeTab === t.key ? null : t.key)
                  }
                />
              ))}
            </div>
          </div>

          {/* Mobile-only "swipe both directions" hint. POSITIONED OUTSIDE
              the scroll container — if it lived inside, it would scroll
              with the image and disappear off the right edge as the user
              pans. Sitting in `wrapper-image` (which is absolute:inset-0
              of the section), it stays visually anchored to the centre-
              bottom of the viewport regardless of horizontal scroll
              position. Two arrows make the bidirectional pan affordance
              explicit. */}
          <div
            className='pointer-events-none absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-[10px] tracking-[0.2em] whitespace-nowrap text-white uppercase md:hidden'
            aria-hidden='true'
          >
            <svg width='12' height='12' viewBox='0 0 24 24' fill='none'>
              <path
                d='M9 5l-7 7 7 7M22 12H2'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            swipe
            <svg width='12' height='12' viewBox='0 0 24 24' fill='none'>
              <path
                d='M15 5l7 7-7 7M2 12h20'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </div>
        </div>
      </div>

      {/*
        Drawer rendered AT SECTION ROOT (not inside .content), with
        position:fixed so it covers the WHOLE viewport — not just the
        bounds of the product-detail section. Mirrors the Astro original
        which sets body.overflow=hidden and overlays a full-page panel.
        Backdrop dim layer fades in/out with the drawer for the standard
        modal feel.
      */}
      {/* Backdrop — dims the page behind the drawer. pointer-events
          gated by tabOpen so when the drawer is closed nothing intercepts
          clicks on the section beneath. */}
      <div
        className='fixed inset-0 z-[1900] bg-black/40 transition-opacity duration-500'
        style={{
          opacity: tabOpen ? 1 : 0,
          pointerEvents: tabOpen ? 'auto' : 'none',
        }}
        onClick={() => setActiveTab(null)}
        aria-hidden='true'
      />

      {/* Drawer — fixed, full-height, slides in from right via transform.
          z-[1950] above backdrop, below the global debug overlay (9999). */}
      <div
        className='fixed top-0 right-0 z-[1950] h-screen w-full bg-white shadow-2xl md:w-1/2'
        style={{
          transform: tabOpen
            ? 'translate3d(0, 0, 0)'
            : 'translate3d(100%, 0, 0)',
          transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
        }}
        role='dialog'
        aria-modal='true'
        aria-hidden={!tabOpen}
      >
        {tabData && (
          <div className='tab active relative h-full overflow-y-auto p-8 md:p-12'>
            <button
              type='button'
              onClick={() => setActiveTab(null)}
              className='tab-close absolute top-6 right-6 p-2 transition-opacity hover:opacity-60'
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
            <div className='tab-img mt-8'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tabData.img}
                alt={tabData.label}
                className='w-full'
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
// Astro/Delvaux pattern: minimalist plain WHITE circle with subtle ring,
// no arrow icon and no label visible by default. Hover scales it up and
// fades a small text label in to the right. Click opens the side panel.
// (Earlier version had a permanent arrow + always-visible label which read
// as a generic UI button instead of the editorial pin Delvaux uses.)
function Hotspot({
  xPct,
  yPct,
  label,
  onClick,
}: {
  xPct: number;
  yPct: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='group absolute flex -translate-x-1/2 -translate-y-1/2 items-center'
      style={{ left: `${xPct}%`, top: `${yPct}%` }}
      aria-label={`Open ${label}`}
    >
      <span className='relative flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/15 transition-transform duration-300 group-hover:scale-125'>
        {/* tiny inner dot, only visible on hover for an extra "live" feel */}
        <span className='block h-1 w-1 rounded-full bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
      </span>
      <span className='ml-3 -translate-x-1 rounded-full bg-white/95 px-3 py-1 text-[10px] tracking-[0.18em] whitespace-nowrap text-black uppercase opacity-0 shadow-sm transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100'>
        {label}
      </span>
    </button>
  );
}
