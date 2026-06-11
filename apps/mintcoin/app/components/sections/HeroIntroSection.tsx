'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';
import { IMG } from '@/lib/image-cdn';
import HeroOverlayText from '../HeroOverlayText';

const CDN = 'https://d10zufojjcedud.cloudfront.net/coin-nextjs';
const FRAMES_DESKTOP = { total: 96, prefix: `${CDN}/frames/frame-` };
// Mobile: 32 frames @ 480×270 — small enough to stay snappy without
// dropping the rotation entirely. Heavier sets (96) jank on iOS regardless
// of optimisations; lighter sets (16) lose rotation continuity.
const FRAMES_MOBILE = { total: 32, prefix: `${CDN}/frames-mobile/frame-` };
const FRAME_EXT = '.webp';

// Mobile vs desktop are TWO different scroll mechanisms:
//
//   Desktop: GSAP pin (pinType: 'transform') keeps the canvas in viewport
//   while it scrubs frame 0 → 95 over 150vh. Works on real browsers; on
//   iOS Safari the pin transform fights the native scroll compositor and
//   causes every scroll event to rebuild the layer — visible stutter.
//
//   Mobile: replaces GSAP pin with native CSS `position: sticky`. The
//   sticky element is parked at top:0 by the browser's compositor (a
//   first-class scroll feature, not a transform hack). GSAP keeps scrubbing
//   the frame INDEX (just a number, not a DOM property) so the canvas
//   drawImage still drives the rotation. No transform = no iOS layer
//   recomposition = no jank.
export default function HeroIntroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

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
    const SCRUB = isMobile ? 0.6 : 1;

    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    const state = { frame: 0 };
    let cw = 0,
      ch = 0,
      dpr = 1;
    let lastDrawn = -1;
    let rafScheduled = false;

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
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = cw / ch;
      let dw = cw,
        dh = ch,
        dx = 0,
        dy = 0;
      if (ir > cr) {
        dh = cw / ir;
        dy = (ch - dh) / 2;
      } else {
        dw = ch * ir;
        dx = (cw - dw) / 2;
      }
      ctx2d.clearRect(0, 0, cw, ch);
      ctx2d.drawImage(img, dx, dy, dw, dh);
    };
    const draw = () => {
      if (rafScheduled) return;
      rafScheduled = true;
      requestAnimationFrame(drawNow);
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

    const ctx = gsap.context(() => {
      // Ken Burns intro — hero image scales 0.8 → 1 on mount with a
      // gentle ease, paired with a soft opacity fade-in. Runs on both
      // mobile and desktop. Wrapped on `.hero__img-wrap` (separate from
      // `.hero__img` which carries the desktop autoAlpha fade) so the
      // two animations don't fight for transform/opacity ownership.
      gsap.fromTo(
        '.hero__img-wrap',
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 2.2,
          ease: 'power3.out',
          delay: 0.15,
        }
      );

      if (isMobile) {
        // ── MOBILE: scrub-only, NO pin ──────────────────────────────
        // Canvas is held in viewport by CSS `position: sticky` on its
        // parent. GSAP only advances the frame counter; no DOM transform,
        // no pin spacer wrapper, no layer recomposition on iOS.
        gsap.to(state, {
          frame: FRAME_TOTAL - 1,
          snap: 'frame',
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-rotate',
            start: 'top top',
            end: 'bottom bottom',
            scrub: SCRUB,
            invalidateOnRefresh: true,
          },
          onUpdate: draw,
        });
        return;
      }

      // ── DESKTOP: GSAP pin + scrub (works fine outside iOS) ──────────
      gsap.to('.hero__img', {
        autoAlpha: 0,
        ease: 'sine.out',
        scrollTrigger: {
          trigger: '.hero__img',
          start: 'top top',
          end: '+=150%',
          scrub: 1,
          pin: true,
          pinSpacing: false,
          pinType: 'transform',
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      });

      gsap.to(state, {
        frame: FRAME_TOTAL - 1,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
          trigger: '.intro',
          start: 'top top',
          end: '+=150%',
          scrub: 1,
          pin: '.hero-canvas',
          pinSpacing: false,
          pinType: 'transform',
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
        onUpdate: draw,
      });

      gsap.to(canvas, {
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.intro',
          start: 'top top-=140%',
          end: 'top top-=150%',
          scrub: 1,
        },
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

    return () => {
      window.removeEventListener('resize', onResize);
      if (resizeT) clearTimeout(resizeT);
      ctx.revert();
    };
  }, [isMobile]);

  if (isMobile) {
    return (
      <section ref={sectionRef} className='hero relative w-full'>
        {/* Hero image — normal scroll (no pin/fade). Lets iOS handle it
            entirely natively before the sticky rotation takes over. */}
        <div className='hero__img relative h-screen w-full overflow-hidden bg-black'>
          {/* hero__img-wrap is the zoom target — separate from the parent
              so the Ken Burns scale doesn't fight any other transforms. */}
          <div className='hero__img-wrap h-full w-full origin-center'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={IMG.heroStorefront}
              alt='The Jack Pine 1 Kilo Gold Coin'
              decoding='async'
              fetchPriority='high'
              className='h-full w-full -translate-y-[50px] object-cover object-center opacity-95'
            />
          </div>
          <HeroOverlayText />
        </div>

        {/* Rotation section — 200vh tall so sticky child has 100vh of
            scroll-through. The canvas inside is `sticky top-0` so the
            browser's native compositor pins it; GSAP only updates the
            frame counter as scroll progresses. Zero transform = zero
            iOS layer-rebuild jank. */}
        <section className='hero-rotate relative h-[200vh] w-full bg-neutral-900'>
          <div className='sticky top-0 h-screen w-full'>
            <canvas
              ref={canvasRef}
              className='hero-canvas absolute inset-0 h-full w-full bg-neutral-900'
            />
          </div>
        </section>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className='hero relative h-[300vh] w-full'>
      <div className='hero__img gpu-layer relative h-screen w-full overflow-hidden bg-black'>
        <div className='hero__img-wrap h-full w-full origin-center'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMG.heroStorefront}
            alt="The Jack Pine 1 Kilo Gold Coin on display before Tom Thomson's painting"
            decoding='async'
            fetchPriority='high'
            className='h-full w-full object-contain object-center opacity-95'
          />
        </div>
        <HeroOverlayText />
      </div>

      <div className='intro absolute top-1/2 right-0 left-0 h-screen w-full bg-neutral-900'>
        <canvas
          ref={canvasRef}
          className='hero-canvas gpu-layer absolute inset-0 z-30 h-full w-full bg-neutral-900'
        />
      </div>
    </section>
  );
}
