'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';
import { IMG } from '@/lib/image-cdn';
import HeroOverlayText from '../HeroOverlayText';
import {
  HotspotDrawer,
  HotspotOverlayLayer,
  HotspotTab,
  useDrawerScrollLock,
  useIsMobile,
} from '../ProductHotspotUI';

// Local frames from public/source/video.mp4 (`yarn gen:frames`).
// Desktop: 76 subsampled WebP @ native 16:9 (first 5s). Mobile: 32 @ 480×270.
const FRAMES_DESKTOP = { total: 76, prefix: '/frames/frame-' };
const FRAMES_MOBILE = { total: 32, prefix: '/frames-mobile/frame-' };
const FRAME_EXT = '.webp';

const PANEL_BG = 'rgba(0, 39, 78, 0.88)';
const RING_OFFSET = '#0a0a0a';

interface Props {
  hotspots?: HotspotTab[];
}

// Mobile vs desktop are TWO different scroll mechanisms:
//
//   Desktop: GSAP pin on `.hero-canvas-wrap` (NOT the frame). Scale only
//   animates the child `.hero-canvas-frame` so the pin target stays still.
//
//   Mobile: CSS sticky + GSAP scrub of frame INDEX + frame scale.
export default function HeroIntroSection({ hotspots = [] }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const behindRef = useRef<HTMLDivElement>(null);
  const forceDrawRef = useRef<(() => void) | null>(null);
  const isMobile = useIsMobile();
  const [scrollStep, setScrollStep] = useState(0);
  const [inPin, setInPin] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const lastStepRef = useRef(0);
  const inPinRef = useRef(false);

  useDrawerScrollLock(activeTab);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const hotspotCount = Math.max(hotspots.length, 1);
  // Desktop: ~120vh frame band + ~60vh per hotspot.
  // Mobile: shorter track (fewer frames + dvh) so scrub doesn't feel endless.
  const trackVh = isMobile ? 100 + hotspotCount * 50 : 120 + hotspotCount * 60;

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const FRAMES = isMobile ? FRAMES_MOBILE : FRAMES_DESKTOP;
    const FRAME_TOTAL = FRAMES.total;
    const FRAME_PREFIX = FRAMES.prefix;
    const DPR_CAP = isMobile ? 1.0 : 1.5;
    // Soft scrub lag — smooths Lenis wheel jitter without feeling sticky.
    const SCRUB = isMobile ? 0.45 : 0.75;

    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    const state = { frame: 0 };
    let cw = 0,
      ch = 0,
      dpr = 1;
    let lastDrawn = -1;
    let rafScheduled = false;

    const syncHotspotStep = (progress: number) => {
      if (hotspots.length === 0) return;
      const step = Math.min(
        Math.floor(progress * hotspots.length),
        hotspots.length - 1
      );
      if (step !== lastStepRef.current) {
        lastStepRef.current = step;
        setScrollStep(step);
      }
    };

    const syncInPin = (active: boolean) => {
      if (inPinRef.current === active) return;
      inPinRef.current = active;
      setInPin(active);
    };

    const recomputeLayout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      cw = canvas.clientWidth * dpr;
      ch = canvas.clientHeight * dpr;
      const sizeChanged = canvas.width !== cw || canvas.height !== ch;
      if (canvas.width !== cw) canvas.width = cw;
      if (canvas.height !== ch) canvas.height = ch;
      if (sizeChanged) lastDrawn = -1;
    };

    const drawNow = () => {
      rafScheduled = false;
      const idx = Math.round(state.frame);
      if (idx === lastDrawn) return;
      const img = images[idx];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      if (cw === 0) recomputeLayout();
      lastDrawn = idx;
      // object-fit: cover — fill frame, crop overflow
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = cw / ch;
      let dw = cw,
        dh = ch,
        dx = 0,
        dy = 0;
      if (ir > cr) {
        dw = ch * ir;
        dx = (cw - dw) / 2;
      } else {
        dh = cw / ir;
        dy = (ch - dh) / 2;
      }
      ctx2d.clearRect(0, 0, cw, ch);
      ctx2d.drawImage(img, dx, dy, dw, dh);
    };
    const draw = () => {
      if (rafScheduled) return;
      rafScheduled = true;
      requestAnimationFrame(drawNow);
    };

    // Parent transform (drawer scale-behind) can blank the canvas — force a
    // full redraw by invalidating the last-drawn frame index.
    forceDrawRef.current = () => {
      lastDrawn = -1;
      draw();
    };

    for (let i = 0; i < FRAME_TOTAL; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = `${FRAME_PREFIX}${String(i + 1).padStart(3, '0')}${FRAME_EXT}`;
      img.onload = () => {
        img
          .decode()
          .catch(() => {})
          .finally(() => {
            loadedCount++;
            if (loadedCount === 1) {
              recomputeLayout();
              draw();
            }
            if (loadedCount === FRAME_TOTAL) ScrollTrigger.refresh();
          });
      };
      images.push(img);
    }

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      // Soft ken-burns on inner layer — settles before overlay stagger (delay 0.55).
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.hero__img-ken',
          { scale: 1.06, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1.4,
            ease: 'power2.out',
            delay: 0.05,
          }
        );

        // Depth as the storefront yields — outer wrap only (transform).
        gsap.fromTo(
          '.hero__img-wrap',
          { scale: 1 },
          {
            scale: 1.04,
            ease: 'none',
            scrollTrigger: {
              trigger: '.hero__img',
              start: 'top top',
              end: 'bottom top',
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          }
        );
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('.hero__img-ken', { scale: 1, opacity: 1 });
        gsap.set('.hero__img-wrap', { scale: 1 });
      });

      const scrubOpts = {
        trigger: '.hero-rotate',
        start: 'top top',
        end: 'bottom bottom',
        scrub: SCRUB,
        invalidateOnRefresh: true,
      };

      // Scale + radius the FRAME child only — never the pinned/sticky wrap.
      // Start square/full-bleed; radius appears as the frame shrinks.
      // Mobile: milder inset — 0.88 leaves too much white gutter on narrow screens.
      const endScale = reduceMotion ? 1 : isMobile ? 0.92 : 0.88;
      const endRadius = reduceMotion ? 0 : isMobile ? 16 : 24;
      gsap.fromTo(
        '.hero-canvas-frame',
        { scale: 1, borderRadius: 0, transformOrigin: '50% 50%' },
        {
          scale: endScale,
          borderRadius: endRadius,
          ease: 'none',
          scrollTrigger: { ...scrubOpts },
        }
      );

      if (isMobile) {
        gsap.to(state, {
          frame: FRAME_TOTAL - 1,
          snap: 'frame',
          ease: 'none',
          scrollTrigger: {
            ...scrubOpts,
            onToggle: (self: ScrollTrigger) => syncInPin(self.isActive),
            onUpdate: (self: ScrollTrigger) => syncHotspotStep(self.progress),
          },
          onUpdate: draw,
        });
        return;
      }

      gsap.to('.hero__img', {
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero__img',
          start: 'top top',
          end: '+=100%',
          scrub: 1,
          pin: true,
          pinSpacing: false,
          pinType: 'transform',
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      });

      // Pin the wrap; frame scale is a separate tween on the child.
      gsap.to(state, {
        frame: FRAME_TOTAL - 1,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
          ...scrubOpts,
          pin: '.hero-canvas-wrap',
          pinSpacing: false,
          pinType: 'transform',
          anticipatePin: 1,
          fastScrollEnd: true,
          onToggle: (self: ScrollTrigger) => syncInPin(self.isActive),
          onUpdate: (self: ScrollTrigger) => syncHotspotStep(self.progress),
        },
        onUpdate: draw,
      });
    }, sectionRef);

    let resizeT: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeT) clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        recomputeLayout();
        draw();
        ScrollTrigger.refresh();
      }, 150);
    };
    window.addEventListener('resize', onResize);
    // iOS/Android chrome show/hide changes visual viewport without a window resize.
    const vv = window.visualViewport;
    vv?.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      vv?.removeEventListener('resize', onResize);
      if (resizeT) clearTimeout(resizeT);
      forceDrawRef.current = null;
      mm.revert();
      ctx.revert();
    };
  }, [isMobile, hotspots.length, reduceMotion]);

  const tabOpen = activeTab !== null;
  const tabData = activeTab
    ? (hotspots.find(t => t.key === activeTab) ?? null)
    : null;

  const handleHotspotClick = (key: string) => {
    setActiveTab(prev => (prev === key ? null : key));
  };

  const overlay =
    hotspots.length > 0 ? (
      <HotspotOverlayLayer
        tabs={hotspots}
        scrollStep={scrollStep}
        inPin={inPin}
        activeTab={activeTab}
        ringOffsetColor={RING_OFFSET}
        panelBackgroundColor={PANEL_BG}
        reduceMotion={reduceMotion}
        exclusive
        onHotspotClick={handleHotspotClick}
      />
    ) : null;

  const canvasFrame = (
    <div className='hero-canvas-frame absolute inset-0 overflow-hidden bg-neutral-950 will-change-transform'>
      <canvas
        ref={canvasRef}
        className='hero-canvas absolute inset-0 z-30 h-full w-full'
      />
      {overlay}
    </div>
  );

  // Shared storefront — high-key silk photo + localized readability scrim.
  const heroImg = (
    <div className='hero__img gpu-layer relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-[#f7f5f3]'>
      <div className='hero__img-wrap h-full w-full origin-center will-change-transform'>
        <div className='hero__img-ken h-full w-full origin-center will-change-transform'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMG.heroStorefront}
            alt='Citizen L Arcly nữ dây kim loại trên nền lụa trắng'
            decoding='async'
            fetchPriority='high'
            className='h-full w-full object-cover'
          />
        </div>
      </div>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#003468]/14 via-white/25 to-transparent'
      />
      <div
        aria-hidden
        className='pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[55%] bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.28)_42%,transparent_72%)]'
      />
      <HeroOverlayText />
    </div>
  );

  if (isMobile) {
    return (
      <section ref={sectionRef} className='hero relative w-full'>
        {heroImg}

        <section
          id='discover'
          className='hero-rotate relative w-full bg-white'
          style={{ height: `${trackVh}dvh` }}
        >
          <div className='hero-canvas-wrap sticky top-0 h-[100dvh] min-h-[100dvh] w-full overflow-hidden'>
            <div ref={behindRef} className='relative h-full w-full'>
              {canvasFrame}
            </div>
          </div>
        </section>

        <HotspotDrawer
          tab={tabData}
          open={tabOpen}
          isMobile={isMobile}
          behindRef={behindRef}
          onBehindTick={() => forceDrawRef.current?.()}
          onClose={() => setActiveTab(null)}
        />
      </section>
    );
  }

  return (
    <section ref={sectionRef} className='hero relative w-full'>
      {heroImg}

      <section
        id='discover'
        className='hero-rotate relative w-full bg-white'
        style={{ height: `${trackVh}vh` }}
      >
        <div className='hero-canvas-wrap relative h-screen w-full'>
          <div ref={behindRef} className='relative h-full w-full'>
            {canvasFrame}
          </div>
        </div>
      </section>

      <HotspotDrawer
        tab={tabData}
        open={tabOpen}
        isMobile={isMobile}
        behindRef={behindRef}
        onBehindTick={() => forceDrawRef.current?.()}
        onClose={() => setActiveTab(null)}
      />
    </section>
  );
}
