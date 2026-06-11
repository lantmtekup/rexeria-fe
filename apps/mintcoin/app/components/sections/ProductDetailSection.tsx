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

  // Lock body scroll while the drawer is open. iOS Safari ignores
  // `body { overflow: hidden }` for native scroll, AND the leftover
  // style state combined with off-screen GPU layers caused scroll to
  // freeze after close. Solution: the position:fixed + top: -scrollY
  // pattern. Saves scroll position, fixes body, restores both on close.
  // Works on iOS, Android, desktop.
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
      // Defensive cleanup if component unmounts while drawer open.
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
      if (!img) return;

      const mobile = window.matchMedia('(max-width: 767px)').matches;

      // VISIBILITY: one-time fade-in that plays once and STAYS. Critical —
      // opening a hotspot drawer locks the body (position:fixed) which resets
      // window.scrollY to 0; a reversible/scrubbed autoAlpha would then revert
      // to 0 and the zoomed coin vanishes behind the drawer (the empty-left
      // bug). `once` + no-reverse keeps it visible regardless of scroll resets.
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
            once: true,
            invalidateOnRefresh: true,
          },
        }
      );

      // CINEMATIC SCALE (variant 2 desktop only): scrub scale separately from
      // visibility, so a scroll reset can shrink it harmlessly but never hide it.
      if (variant === '2' && !mobile) {
        gsap.fromTo(
          img,
          { scale: 0.7 },
          {
            scale: 1.1,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top bottom',
              end: 'center center',
              scrub: 1,
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
      className={`product-detail relative h-[70vh] w-full overflow-hidden md:h-screen ${
        variant === '2' ? 'bg-neutral-900 text-white' : 'bg-neutral-100'
      }`}
      // `touch-action: pan-y` tells iOS "vertical scroll has priority,
      // never wait to disambiguate tap vs scroll." Without it, every
      // touch on the section paused 100-200ms while iOS decided if the
      // user was tapping a hotspot button or trying to scroll — that's
      // why scroll felt "treo" inside these two coin sections.
      style={{ touchAction: 'pan-y' }}
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
        // `contain: paint` removed on mobile — combined with the wrapper
        // transform layer, it pinned a sub-tree to its own paint context
        // which froze iOS scroll at section boundaries. Desktop still
        // gets contain via the wrapper-image's GPU layer below.
        style={!isMobile ? { contain: 'paint' } : undefined}
      >
        {/* Image fills the section. On MOBILE the image is wider than the
            portrait viewport so users can pan horizontally to see the full
            shoe; on DESKTOP it cover-fits the section as before. */}
        {/* When a hotspot opens the drawer (right 50% on md+), the coin
            wrapper slides left and scales 2× so the focused detail sits
            in the centre of the visible left half instead of being hidden
            under the panel. Hotspots scale together with the image so they
            stay pinned to coin features. Pure transform = compositor-only,
            no layout reflow. */}
        <div
          className='wrapper-image absolute inset-0'
          style={{
            // Mobile drawer covers from bottom, so horizontal shift is
            // wasted — keep the coin centred and zoom modestly (1.15×).
            // Desktop slides the coin 25% left + 2× zoom to fit inside
            // the visible half not covered by the right-side drawer.
            transform: tabOpen
              ? isMobile
                ? 'translate3d(0, 0, 0) scale(1.15)'
                : 'translate3d(-25%, 0, 0) scale(2)'
              : 'none',
            transformOrigin: 'center center',
            transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
            // `will-change` only while drawer is open. Permanent
            // will-change forces a GPU layer to exist at all times,
            // which on iOS held the section in a state that interfered
            // with native scroll momentum at the section boundary.
            willChange: tabOpen ? 'transform' : 'auto',
          }}
        >
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
          {/* Coin photos are circular with transparent backgrounds and the
              subject fills the frame edge-to-edge — `object-cover` cropped
              the rim. Switched to `object-contain` plus generous padding
              so the entire coin reads, with comfortable breathing space.
              Mobile pan disabled for the same reason: nothing to pan when
              the whole circle is already visible. */}
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

              {/* Hotspots positioned relative to the padded container.
                  Coordinates approximate; tune dotX/dotY in page.tsx if a
                  pin lands off the visible coin. Hidden while a drawer is
                  open so they don't blow up 2× with the zoomed coin. */}
              <div
                style={{
                  opacity: tabOpen ? 0 : 1,
                  pointerEvents: tabOpen ? 'none' : 'auto',
                  transition: 'opacity 300ms ease',
                }}
              >
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

      {/* Drawer — mobile slides UP from bottom (88vh tall sheet),
          desktop slides in from right (half viewport). z-[1950] above
          backdrop. `willChange` + `pointerEvents` gated by tabOpen so
          the off-screen drawer doesn't keep a live GPU layer at z-1950
          intercepting iOS scroll events after close (the same bug
          pattern previously fixed on .wrapper-image). */}
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
          // `data-lenis-prevent` stops Lenis from swallowing the wheel/touch
          // events on this panel — without it, the smooth-scroll engine
          // (paused on body) still ate scroll inside the drawer, so the
          // user couldn't reach the image below the description.
          // `overscroll-contain` keeps inertia from bleeding back to body.
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
      data-cta-id={`hotspot-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className='group absolute flex -translate-x-1/2 -translate-y-1/2 items-center'
      // `touch-action: manipulation` skips iOS's 300ms tap-vs-double-tap
      // detection and lets vertical scroll pass through the button
      // immediately if the finger moves at all. Without this, even a
      // touch that starts on a hotspot button would block the start
      // of a scroll gesture.
      style={{ left: `${xPct}%`, top: `${yPct}%`, touchAction: 'manipulation' }}
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
