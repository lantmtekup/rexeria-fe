'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';

const FRAME_TOTAL = 96;
const FRAME_PREFIX = '/frames/frame-';
const FRAME_EXT = '.jpg';

// Combined hero + intro section. Two pinned ScrollTriggers chained:
//   1. .hero__img — pins for 100vh, scrubs scale 1→2 + autoAlpha 1→0
//   2. .intro     — pins for 200vh, scrubs canvas frame index 0→95
// Plus a cross-fade out of canvas as .details enters viewport, ending BEFORE
// the pin ends to hide the un-pin frame swap.
export default function HeroIntroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    // ── MOBILE MODE ────────────────────────────────────────────────
    // On phones, the canvas-frame scrub (96 drawImage calls per scroll
    // tick) plus the hero pin compete for the GPU and produce visible
    // "đơ" stutter. Skip ALL scroll-driven animation on mobile, render
    // the canvas at its first frame as a static image, and let the
    // section flow naturally. Section CSS height is already capped via
    // a media query below so the page doesn't have empty hero space.
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    // ── Frame loader + drawer ──────────────────────────────────────
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    const state = { frame: 0 };
    let cw = 0,
      ch = 0,
      dpr = 1;
    let lastDrawn = -1;
    let rafScheduled = false;

    const recomputeLayout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cw = canvas.clientWidth * dpr;
      ch = canvas.clientHeight * dpr;
      const sizeChanged = canvas.width !== cw || canvas.height !== ch;
      if (canvas.width !== cw) canvas.width = cw;
      if (canvas.height !== ch) canvas.height = ch;
      // Setting canvas.width/height clears the bitmap. The draw-dedupe
      // (`idx === lastDrawn` short-circuit) would otherwise skip the
      // re-paint because state.frame hasn't changed — leaving the canvas
      // visibly blank. This is exactly what happens on mobile when the
      // address bar collapses, firing a `resize` mid-scroll.
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
      // COVER scaling (was CONTAIN). On mobile the canvas is portrait
      // (393×852) but the spinning-shoe frames are landscape (1920×1080),
      // so contain letterboxed top+bottom and produced ~600px of empty
      // white space inside the section. Cover scales the image to fill
      // the canvas; sides get cropped instead of having gaps. Desktop
      // canvas is also wide so cover fits naturally there too.
      let dw = cw,
        dh = ch,
        dx = 0,
        dy = 0;
      if (ir > cr) {
        // image wider than canvas — match height, overflow horizontally
        dw = ch * ir;
        dx = (cw - dw) / 2;
      } else {
        // image taller than canvas — match width, overflow vertically
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

    for (let i = 0; i < FRAME_TOTAL; i++) {
      const img = new Image();
      img.src = `${FRAME_PREFIX}${String(i + 1).padStart(3, '0')}${FRAME_EXT}`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 1) {
          recomputeLayout();
          draw();
        }
        if (loadedCount === FRAME_TOTAL) ScrollTrigger.refresh();
      };
      images.push(img);
    }

    // On mobile we don't drive the canvas via scroll, so we need to force
    // a paint of the first frame as soon as the image is decoded — there's
    // no scroll-onUpdate to trigger draw() naturally. Retry every 200ms
    // for up to 2s in case the canvas dimensions aren't ready yet (canvas
    // inside a not-yet-laid-out section returns clientWidth=0 immediately
    // after mount).
    if (isMobile) {
      // Pick a frame that shows the shoe well (frame 48 = mid-rotation,
      // visually most appealing). Wait until THAT specific frame is
      // loaded — picking 95 (last) caused the canvas to stay blank
      // because the bottom-of-batch frame had not finished decoding by
      // the time forceDraw ran.
      const STATIC_FRAME = 48;
      let attempts = 0;
      const forceDraw = () => {
        attempts++;
        recomputeLayout();
        const img = images[STATIC_FRAME];
        if (cw > 0 && img?.complete && img?.naturalWidth > 0) {
          state.frame = STATIC_FRAME;
          lastDrawn = -1;
          draw();
          return;
        }
        // Fallback: draw frame 0 immediately so the canvas isn't blank
        // while we wait for the preferred frame.
        if (attempts === 3 && cw > 0 && images[0]?.complete) {
          state.frame = 0;
          lastDrawn = -1;
          draw();
        }
        if (attempts < 20) setTimeout(forceDraw, 200);
      };
      setTimeout(forceDraw, 100);
    }

    // ── GSAP timelines scoped via context for atomic cleanup ─────
    const ctx = gsap.context(() => {
      // On mobile we still preload images and draw the first frame so the
      // canvas isn't empty, but we skip pin/scrub registration.
      if (isMobile) return;
      // Entrance zoom (0.9 → 1) removed. The debug overlay caught a 38ms
      // spike at t=1s scrollY=0 — that's this animation kicking in on first
      // paint while images are still decoding. Page load shouldn't have a
      // self-inflicted scale animation; the image is already at rest.

      // Hero pin: scrub scale 1→2 + autoAlpha 1→0 over 150vh — pin distance
      // matches .intro's top:50% offset (150vh of section.hero) so hero
      // fade-out ends EXACTLY when intro pin starts. No blank gap.
      // Scale removed (was 1 → 2). At scale 2, the hero image promotes to a
      // GPU composite layer at TWO viewports of pixels, and every scrub tick
      // forced GPU to reinterpolate that giant layer — the single biggest
      // contributor to the multi-trigger spikes the debug overlay logged at
      // scrollY 1500-2000 ("intro+details+details" frames at 30+ ms).
      // Replacing scale with opacity-only crossfade keeps the visual purpose
      // (image fades out as canvas takes over) at a fraction of the GPU
      // budget — opacity is a pure compositor operation, no layer
      // reinterpolation needed.
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

      // Canvas frame scrub. Pins from intro top (scroll 150) to section.hero
      // end (scroll 300) = 150vh of pin range. pinSpacing:false delegates the
      // pin scroll space to section.hero's explicit 300vh height — clean
      // handoff to .details at scroll 300.
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

      // Cross-fade canvas out as .details enters. .details lives in a sibling
      // component, so we resolve it from document (scoped selectors in
      // gsap.context only see descendants of the ref). Defer with a microtask
      // so the sibling has mounted by the time we look it up.
      queueMicrotask(() => {
        const detailsEl = document.querySelector('.details');
        if (!detailsEl) return;
        gsap.fromTo(
          canvas,
          { autoAlpha: 1 },
          {
            autoAlpha: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: detailsEl,
              start: 'top bottom',
              end: 'top 30%',
              scrub: 1,
            },
          }
        );
      });
    }, sectionRef);

    // Resize handler — debounced, recomputes canvas DPR + refreshes ST
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
  }, []);

  return (
    <section
      ref={sectionRef}
      className='hero relative h-auto w-full md:h-[300vh]'
    >
      {/* Hero image — in flow at top, 100vh, pinned over scroll 0-100vh.
          CDN-hosted WebP (124KB, was 960KB JPG). decoding=async to keep
          first-paint off the main thread. */}
      <div className='hero__img gpu-layer relative h-screen w-full overflow-hidden'>
        <picture>
          <source
            srcSet='https://d10zufojjcedud.cloudfront.net/delvaux-nextjs/hero-storefront-mobile.webp'
            media='(max-width: 480px)'
          />
          <source
            srcSet='https://d10zufojjcedud.cloudfront.net/delvaux-nextjs/hero-storefront.webp'
            media='(min-width: 481px)'
          />
          {}
          <img
            src='https://d10zufojjcedud.cloudfront.net/delvaux-nextjs/hero-storefront.webp'
            alt='Manolo Blahnik Boutique'
            decoding='async'
            fetchPriority='high'
            className='h-full w-full object-cover'
          />
        </picture>
      </div>

      {/*
        Intro container.
        Desktop: absolute @ top:50% (150vh into the 300vh section). Hero
          pin keeps the storefront fixed for the first 150vh of scroll;
          intro pin then takes over for the canvas frame scrub.
        Mobile: relative + 100vh so it just flows as the next viewport
          after the storefront. No pin animations on mobile (see useEffect
          guard above) — the canvas just shows its first frame statically.
      */}
      <div className='intro relative h-screen w-full bg-neutral-100 md:absolute md:top-1/2 md:right-0 md:left-0 md:bg-transparent'>
        {/* Canvas — desktop scrub-driven 96-frame sequence. */}
        <canvas
          ref={canvasRef}
          className='hero-canvas gpu-layer absolute inset-0 hidden h-full w-full md:block'
        />
        {/* Mobile fallback — full shoe pair, contained (not cropped) so
            the entire silhouette shows. The neutral-100 section bg fills
            the letterbox area and visually merges with the .details
            section directly below, hiding the gap. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src='https://d10zufojjcedud.cloudfront.net/delvaux-nextjs/manolo-pair.webp'
          alt='Manolo Blahnik Ronconasli pair'
          loading='eager'
          decoding='async'
          fetchPriority='high'
          className='absolute inset-0 h-full w-full object-contain object-center md:hidden'
        />
      </div>
    </section>
  );
}
