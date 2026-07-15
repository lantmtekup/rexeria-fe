'use client';

/**
 * Data-block "Mint · Hero" (P3/d) — self-contained, container-query.
 * Fork từ template HeroIntroSection + HeroOverlayText, nhưng:
 *  - isMobile đo qua useContainerMobile (ResizeObserver khung block) thay
 *    window.matchMedia(viewport) → preview editor (390/834/1440) đúng.
 *  - overlay 3 dòng: container-query font (@2xl/@4xl) + data-element-key
 *    (inline-edit qua panel; overlay pointer-events-none nên không click canvas).
 *  - canvas frame-scrub + GSAP pin giữ NGUYÊN (chạy đúng trên /p; trong editor
 *    không có scroll thật nên hiển thị frame đầu — giống mọi scroll-block).
 */
import * as React from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

import { IMG } from '@/templates/mint-coint/lib/image-cdn';

import { useLandingMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintHeroContent,
} from '../types';
import {
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useContainerMobile } from './useContainerMobile';

const CDN = 'https://d10zufojjcedud.cloudfront.net/coin-nextjs';
const FRAMES_DESKTOP = { total: 96, prefix: `${CDN}/frames/frame-` };
const FRAMES_MOBILE = { total: 32, prefix: `${CDN}/frames-mobile/frame-` };
const FRAME_EXT = '.webp';

interface Props {
  content: MintHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function MintHero({
  content,
  styles,
  order,
  positions,
  activeKey,
}: Props) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useContainerMobile(sectionRef);
  const { scroller, requestRefresh } = useLandingMotion();
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  // ── Canvas frame-scrub (port, isMobile từ container) ─────────────────────
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;
    const FRAMES = isMobile ? FRAMES_MOBILE : FRAMES_DESKTOP;
    const FRAME_TOTAL = FRAMES.total;
    const DPR_CAP = isMobile ? 1.0 : 1.5;
    const SCRUB = isMobile ? 0.6 : 1;
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    const state = { frame: 0 };
    let cw = 0,
      ch = 0,
      dpr = 1,
      lastDrawn = -1,
      rafScheduled = false;
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
      img.src = `${FRAMES.prefix}${String(i + 1).padStart(3, '0')}${FRAME_EXT}`;
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
            if (loadedCount === FRAME_TOTAL) requestRefresh();
          });
      };
      images.push(img);
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero__img-wrap',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2.2, ease: 'power3.out', delay: 0.15 }
      );
      if (isMobile) {
        gsap.to(state, {
          frame: FRAME_TOTAL - 1,
          snap: 'frame',
          ease: 'none',
          scrollTrigger: {
            scroller,
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
      gsap.to('.hero__img', {
        autoAlpha: 0,
        ease: 'sine.out',
        scrollTrigger: {
          scroller,
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
          scroller,
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
    }, sectionRef);
    let resizeT: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeT) clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        recomputeLayout();
        draw();
        requestRefresh();
      }, 150);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (resizeT) clearTimeout(resizeT);
      ctx.revert();
    };
  }, [isMobile, scroller, requestRefresh]);

  // ── Overlay text entrance + parallax (port từ HeroOverlayText) ───────────
  React.useEffect(() => {
    const root = overlayRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const lineEl = root.querySelector<HTMLElement>('.h-line');
      const titleEl = root.querySelector<HTMLElement>('.h-title');
      const parallaxEl = root.querySelector<HTMLElement>('.h-parallax');
      const tl = gsap.timeline({ delay: 0.5 });
      if (lineEl) {
        gsap.set(lineEl, { scaleX: 0, transformOrigin: 'left center' });
        tl.to(lineEl, { scaleX: 1, duration: 1, ease: 'power3.out' }, 0);
      }
      if (titleEl) {
        const split = new SplitType(titleEl, { types: 'chars' });
        gsap.set(split.chars, {
          yPercent: 115,
          opacity: 0,
          filter: 'blur(8px)',
        });
        tl.to(
          split.chars,
          {
            yPercent: 0,
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.022,
            duration: 0.9,
            ease: 'power4.out',
          },
          0.35
        );
      }
      if (parallaxEl) {
        gsap.to(parallaxEl, {
          yPercent: 60,
          opacity: 0.4,
          ease: 'none',
          scrollTrigger: {
            scroller,
            trigger: '.hero__img',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
      }
    }, root);
    return () => ctx.revert();
  }, [scroller]);

  const overlay = (
    <div
      ref={overlayRef}
      className='hero__copy pointer-events-none absolute top-1/2 left-6 z-30 mt-[150px] -translate-y-1/2 text-white @2xl:left-12 @2xl:mt-[50px] @4xl:left-20'
    >
      <div className='h-parallax'>
        <div className='h-line mb-4 h-px w-16 bg-gradient-to-r from-[#e6b94a] via-[#c79119] to-transparent @2xl:mb-5 @2xl:w-24' />
        <h2 className='h-title text-2xl leading-[1.15] font-light tracking-[0.04em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] @2xl:text-4xl @4xl:text-[44px]'>
          <span
            data-element-key='heroLine1'
            style={styleOf('heroLine1')}
            className={selectableClass(activeKey === 'heroLine1', '')}
          >
            {content.heroLine1}
          </span>
          <br />
          <span
            data-element-key='heroLine2'
            style={styleOf('heroLine2')}
            className={selectableClass(activeKey === 'heroLine2', '')}
          >
            {content.heroLine2}
          </span>
          <br />
          <span
            data-element-key='heroLine3'
            style={styleOf('heroLine3')}
            className={selectableClass(activeKey === 'heroLine3', '')}
          >
            {content.heroLine3}
          </span>
        </h2>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <section ref={sectionRef} className='hero @container relative w-full'>
        <div className='hero__img relative h-screen w-full overflow-hidden bg-black'>
          <div className='hero__img-wrap h-full w-full origin-center'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={IMG.heroStorefront}
              alt='Hero coin'
              decoding='async'
              className='h-full w-full -translate-y-[50px] object-cover object-center opacity-95'
            />
          </div>
          {overlay}
        </div>
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
    <section
      ref={sectionRef}
      className='hero @container relative h-[300vh] w-full'
    >
      <div className='hero__img gpu-layer relative h-screen w-full overflow-hidden bg-black'>
        <div className='hero__img-wrap h-full w-full origin-center'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMG.heroStorefront}
            alt='Hero coin'
            decoding='async'
            className='h-full w-full object-contain object-center opacity-95'
          />
        </div>
        {overlay}
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
