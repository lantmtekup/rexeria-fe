'use client';

/**
 * PNJ · Hero — storefront + overlay copy + canvas frame-scrub + hotspots.
 * Port từ apps/pnj HeroIntroSection + HeroOverlayText.
 *
 * Motion R1–R6:
 * - useLandingMotion (scroller + requestRefresh)
 * - useContainerMobile (editor canvas width, không matchMedia viewport)
 * - Desktop: CSS sticky (.pnj-hero-pin) + 1 timeline scrub (no GSAP pin)
 *   → canvas yPercent đè storefront, fade, rồi frame-scrub + scale/radius.
 * - Mobile: storefront scroll tự nhiên → sticky `.pnj-hero-rotate` scrub
 *   frame index + scale/radius (start vuông; không yPercent / fade).
 * - Editor canvas (`active-block-preview`): storefront + overlay chữ tĩnh
 *   (không opacity:0 / yPercent ẩn); không scrub / không track dài
 * - KHÔNG gsap.registerPlugin
 */

import * as React from 'react';
import gsap from 'gsap';
import type { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  PnjHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useLandingMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import { useContainerMobile } from './useContainerMobile';
import {
  HotspotDrawer,
  HotspotOverlayLayer,
  useDrawerScrollLock,
  type HotspotOverlayHandle,
} from './PnjHeroHotspots';
import { resolvePnjHeroFrames } from './pnjHeroFrames';
import { resolvePnjHeroScrim } from './pnjHeroScrim';
import { resolvePnjHeroTitleLines } from './pnjHeroTitleLines';

const PANEL_BG = 'rgba(0, 39, 78, 0.88)';
const RING_OFFSET = '#0a0a0a';
/** Khớp Tailwind `@2xl:` container (672px) — xem deviceFrame.ts. */
const MOBILE_BREAKPOINT = 672;

const RESPONSIVE = {
  subtitleFont: 'clamp(12px, 1.6cqi, 16px)',
  titleFont: 'clamp(22px, 4.2cqi, 48px)',
  overlayPadX: 'clamp(24px, 5cqi, 80px)',
  /**
   * Lift from bottom toward mid. Uses `bottom: %` (height-relative) — not
   * padding-% (width-relative) — so mobile/narrow frames lift the same.
   */
  overlayBottom: '28%',
  lineWidth: 'clamp(48px, 6cqi, 96px)',
} as const;

interface Props {
  content: PnjHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function PnjHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const behindRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const forceDrawRef = React.useRef<(() => void) | null>(null);
  const hotspotApiRef = React.useRef<HotspotOverlayHandle | null>(null);
  const isMobile = useContainerMobile(sectionRef, MOBILE_BREAKPOINT);
  const { hasRoot, scroller, requestRefresh } = useLandingMotion();

  // Chỉ BlockPreview editor — KHÔNG PreviewMode/Play (cũng có scroller).
  const isCanvas = useIsCanvasEdit(sectionRef);

  const [activeTab, setActiveTab] = React.useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const lastStepRef = React.useRef(-1);
  const inPinRef = React.useRef(false);

  const hotspots = Array.isArray(content.hotspots) ? content.hotspots : [];
  const titleLines = React.useMemo(
    () => resolvePnjHeroTitleLines(content),
    [content.titleLines, content.titleLine1, content.titleLine2]
  );
  const framesConfig = React.useMemo(
    () => resolvePnjHeroFrames({ frames: content.frames }),
    [content.frames]
  );
  const scrim = React.useMemo(
    () => resolvePnjHeroScrim({ scrim: content.scrim }),
    [content.scrim]
  );
  useDrawerScrollLock(activeTab, isMobile);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const hotspotCount = hotspots.length;
  // Scroll budget cho frame-scrub + hotspots (svh) — hơi dài hơn để scrub chậm/mượt.
  const trackVh = isMobile ? 120 + hotspotCount * 60 : 150 + hotspotCount * 75;
  // Desktop tall shell — sticky pin giữ chỗ; canvas kéo lên + frame-scrub.
  const totalVh = Math.max(360, trackVh + 120);

  // ── Canvas frame-scrub ───────────────────────────────────────────────────
  React.useEffect(() => {
    if (isCanvas || !hasRoot) return;

    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    // Gate: đợi layout có width + isMobile khớp đo thật — tránh load 76
    // frame desktop trước khi ResizeObserver flip sang mobile.
    const width = section.clientWidth;
    if (width === 0) return;
    const measuredMobile = width < MOBILE_BREAKPOINT;
    if (measuredMobile !== isMobile) return;

    const FRAMES = isMobile ? framesConfig.mobile : framesConfig.desktop;
    const FRAME_TOTAL = FRAMES.total;
    const FRAME_PREFIX = FRAMES.prefix;
    const FRAME_EXT = framesConfig.ext;
    const DPR_CAP = isMobile ? 1.0 : 1.5;
    // Scrub lag (giây) — cao hơn một chút → cảm giác mượt, ít giật theo wheel.
    const SCRUB = isMobile ? 0.6 : 1.25;

    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    let framesReadyNotified = false;
    const state = { frame: 0 };
    let cw = 0;
    let ch = 0;
    let dpr = 1;
    let lastDrawn = -1;
    let rafScheduled = false;

    // Desktop timeline: 0→0.5 canvas kéo lên; 0.5→1 frame-scrub + hotspots.
    // Mobile: hotspot phase = full rotate progress (0→1).
    const HOTSPOT_PHASE_START = isMobile ? 0 : 0.5;

    const syncHotspotFromScroll = (self: ScrollTrigger) => {
      if (hotspots.length === 0) return;

      const inHotspotPhase =
        self.isActive && self.progress >= HOTSPOT_PHASE_START;

      if (!inHotspotPhase) {
        if (inPinRef.current || lastStepRef.current >= 0) {
          inPinRef.current = false;
          lastStepRef.current = -1;
          hotspotApiRef.current?.sync(0, false);
        }
        return;
      }

      const hotspotProgress =
        HOTSPOT_PHASE_START >= 1
          ? self.progress
          : (self.progress - HOTSPOT_PHASE_START) / (1 - HOTSPOT_PHASE_START);
      const step = Math.min(
        Math.floor(hotspotProgress * hotspots.length),
        hotspots.length - 1
      );

      if (step === lastStepRef.current && inPinRef.current) return;
      inPinRef.current = true;
      lastStepRef.current = step;
      hotspotApiRef.current?.sync(step, true);
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
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = cw / ch;
      let dw = cw;
      let dh = ch;
      let dx = 0;
      let dy = 0;
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
            if (loadedCount === FRAME_TOTAL && !framesReadyNotified) {
              framesReadyNotified = true;
              requestRefresh();
            }
          });
      };
      images.push(img);
    }

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const endScale = reduced || reduceMotion ? 1 : isMobile ? 0.92 : 0.88;
    const endRadius = reduced || reduceMotion ? 0 : isMobile ? 16 : 24;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.pnj-hero__img-ken',
        { scale: reduced ? 1 : 1.06, opacity: reduced ? 1 : 0 },
        {
          scale: 1,
          opacity: 1,
          duration: reduced ? 0 : 1.4,
          ease: 'power2.out',
          delay: 0.05,
        }
      );
      gsap.set('.pnj-hero__img-wrap', { scale: 1 });

      if (reduced) {
        gsap.set('.pnj-hero-canvas-frame', {
          scale: endScale,
          borderRadius: endRadius,
          transformOrigin: '50% 50%',
        });
        if (!isMobile) {
          gsap.set('.pnj-hero-canvas-wrap', { yPercent: 0 });
          gsap.set('.pnj-hero__img', { autoAlpha: 0 });
        }
        draw();
        return;
      }

      // ── Mobile: sticky rotate — scrub frame + scale/radius (start vuông) ──
      if (isMobile) {
        const rotate = section.querySelector<HTMLElement>('.pnj-hero-rotate');
        if (!rotate) return;

        // Chưa scrub: full-bleed vuông (radius 0). Bo góc chỉ khi scale chạy.
        gsap.set('.pnj-hero-canvas-frame', {
          scale: 1,
          borderRadius: 0,
          transformOrigin: '50% 50%',
        });

        const scrubOpts = {
          trigger: rotate,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: SCRUB,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        };

        gsap.to(state, {
          frame: FRAME_TOTAL - 1,
          snap: 'frame',
          ease: 'none',
          onUpdate: draw,
          scrollTrigger: {
            ...scrubOpts,
            onToggle: (self: ScrollTrigger) => syncHotspotFromScroll(self),
            onUpdate: (self: ScrollTrigger) => syncHotspotFromScroll(self),
          },
        });

        gsap.fromTo(
          '.pnj-hero-canvas-frame',
          { scale: 1, borderRadius: 0, transformOrigin: '50% 50%' },
          {
            scale: endScale,
            borderRadius: endRadius,
            ease: 'none',
            scrollTrigger: { ...scrubOpts },
          }
        );
        return;
      }

      // ── Desktop: sticky pin + yPercent canvas + fade + frame-scrub ───────
      gsap.set('.pnj-hero-canvas-wrap', { yPercent: 100 });
      gsap.set('.pnj-hero-canvas-frame', {
        scale: 1,
        borderRadius: 0,
        transformOrigin: '50% 50%',
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: SCRUB,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
          onToggle: (self: ScrollTrigger) => {
            if (!self.isActive) syncHotspotFromScroll(self);
          },
          onUpdate: (self: ScrollTrigger) => syncHotspotFromScroll(self),
        },
      });

      tl.to('.pnj-hero-canvas-wrap', { yPercent: 0, ease: 'none' }, 0);
      tl.to('.pnj-hero__img-wrap', { scale: 1.04, ease: 'none' }, 0);
      tl.to('.pnj-hero__img', { autoAlpha: 0, ease: 'none' }, 0.35);

      tl.to(
        state,
        {
          frame: FRAME_TOTAL - 1,
          snap: 'frame',
          ease: 'none',
          onUpdate: draw,
        },
        0.5
      );
      tl.fromTo(
        '.pnj-hero-canvas-frame',
        { scale: 1, borderRadius: 0, transformOrigin: '50% 50%' },
        { scale: endScale, borderRadius: endRadius, ease: 'none' },
        0.5
      );
    }, section);

    let resizeT: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeT) clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        recomputeLayout();
        draw();
      }, 150);
    };
    window.addEventListener('resize', onResize);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      vv?.removeEventListener('resize', onResize);
      if (resizeT) clearTimeout(resizeT);
      forceDrawRef.current = null;
      ctx.revert();
    };
  }, [
    isCanvas,
    hasRoot,
    isMobile,
    hotspots.length,
    reduceMotion,
    scroller,
    requestRefresh,
    totalVh,
    trackVh,
    framesConfig,
  ]);

  // ── Overlay entrance + scrub fade ────────────────────────────────────────
  React.useEffect(() => {
    if (isCanvas || !hasRoot) return;

    const root = overlayRef.current;
    if (!root) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const subtitleEl = root.querySelector<HTMLElement>('.pnj-hero-subtitle');
      const lineEl = root.querySelector<HTMLElement>('.pnj-hero-line');
      const titleInners = root.querySelectorAll<HTMLElement>(
        '.pnj-hero-title-inner'
      );
      const parallaxEl = root.querySelector<HTMLElement>('.pnj-hero-parallax');

      if (reduced) {
        if (subtitleEl) gsap.set(subtitleEl, { yPercent: 0 });
        if (lineEl)
          gsap.set(lineEl, { scaleX: 1, transformOrigin: 'left center' });
        if (titleInners.length) gsap.set(titleInners, { yPercent: 0 });
        if (parallaxEl) gsap.set(parallaxEl, { y: 0, autoAlpha: 1 });
        return;
      }

      if (subtitleEl) gsap.set(subtitleEl, { yPercent: 100 });
      if (lineEl)
        gsap.set(lineEl, { scaleX: 0, transformOrigin: 'left center' });
      if (titleInners.length) gsap.set(titleInners, { yPercent: 110 });

      const tl = gsap.timeline({ delay: 0.55 });
      if (subtitleEl) {
        tl.to(
          subtitleEl,
          { yPercent: 0, duration: 0.7, ease: 'power3.out' },
          0
        );
      }
      if (lineEl) {
        tl.to(lineEl, { scaleX: 1, duration: 0.7, ease: 'power3.out' }, 0.2);
      }
      if (titleInners.length) {
        tl.to(
          titleInners,
          {
            yPercent: 0,
            duration: 0.85,
            stagger: 0.1,
            ease: 'power3.out',
          },
          0.35
        );
      }

      if (parallaxEl) {
        gsap.to(parallaxEl, {
          y: 40,
          autoAlpha: 0,
          ease: 'none',
          scrollTrigger: {
            scroller,
            trigger: '.pnj-hero__img',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      }
    }, root);

    return () => ctx.revert();
  }, [isCanvas, hasRoot, scroller, content.subtitle, titleLines]);

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
        ref={hotspotApiRef}
        tabs={hotspots}
        activeTab={activeTab}
        ringOffsetColor={RING_OFFSET}
        panelBackgroundColor={PANEL_BG}
        reduceMotion={reduceMotion || isMobile}
        exclusive
        onHotspotClick={handleHotspotClick}
      />
    ) : null;

  const canvasFrame = (
    <div className='pnj-hero-canvas-frame absolute inset-0 overflow-hidden bg-neutral-950 will-change-transform'>
      <canvas
        ref={canvasRef}
        className='pnj-hero-canvas absolute inset-0 z-30 h-full w-full'
      />
      {overlay}
    </div>
  );

  const heroCopy = (
    <div
      ref={overlayRef}
      className='pnj-hero__copy pointer-events-none absolute inset-0 z-30'
    >
      <div
        className='pnj-hero-parallax absolute w-full max-w-xl'
        style={{
          bottom: RESPONSIVE.overlayBottom,
          left: RESPONSIVE.overlayPadX,
          right: RESPONSIVE.overlayPadX,
        }}
      >
        <div className='mb-2 overflow-hidden'>
          <p
            data-element-key='subtitle'
            className={selectableClass(
              activeKey === 'subtitle',
              'pnj-hero-subtitle pointer-events-auto'
            )}
            style={composeStyle(
              {
                fontSize: RESPONSIVE.subtitleFont,
                lineHeight: 1.2,
                fontWeight: 500,
                letterSpacing: '0.2em',
                color: '#6A5634',
                textTransform: 'uppercase',
                margin: 0,
              },
              styleOf('subtitle')
            )}
          >
            {content.subtitle}
          </p>
        </div>
        <div
          className='pnj-hero-line mb-3 h-px bg-gradient-to-r from-[#e6b94a] via-[#c79119] to-transparent @2xl:mb-4'
          style={{ width: RESPONSIVE.lineWidth }}
          aria-hidden
        />
        <h2
          className='pnj-hero-title'
          style={{
            margin: 0,
          }}
        >
          {titleLines.map((line, i) => {
            const key = `titleLines[${i}]`;
            return (
              <span key={key} className='block overflow-hidden pb-1'>
                <span
                  data-element-key={key}
                  className={selectableClass(
                    activeKey === key,
                    'pnj-hero-title-inner pointer-events-auto block'
                  )}
                  style={composeStyle(
                    {
                      fontSize: RESPONSIVE.titleFont,
                      lineHeight: 1.15,
                      fontWeight: 500,
                      color: '#003468',
                    },
                    styleOf(key)
                  )}
                >
                  {line}
                </span>
              </span>
            );
          })}
        </h2>
      </div>
    </div>
  );

  const renderHeroImg = (outerClass: string, withWillChange: boolean) => (
    <div className={outerClass}>
      <div
        className={cn(
          'pnj-hero__img-wrap h-full w-full origin-center',
          withWillChange && 'will-change-transform'
        )}
      >
        <div
          className={cn(
            'pnj-hero__img-ken h-full w-full origin-center',
            withWillChange && 'will-change-transform'
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-element-key='storefrontUrl'
            src={content.storefrontUrl}
            alt={titleLines[0] || content.subtitle || ''}
            decoding='async'
            fetchPriority='high'
            className={selectableClass(
              activeKey === 'storefrontUrl',
              'h-full w-full object-cover'
            )}
            style={styleOf('storefrontUrl')}
          />
        </div>
      </div>
      {scrim.layers.map((layer, i) => {
        const hasBox =
          layer.top !== undefined ||
          layer.right !== undefined ||
          layer.bottom !== undefined ||
          layer.left !== undefined ||
          layer.height !== undefined ||
          layer.width !== undefined;
        return (
          <div
            key={`scrim-${i}`}
            aria-hidden
            className='pointer-events-none absolute z-10'
            style={{
              ...(hasBox
                ? {
                    top: layer.top ?? 0,
                    right: layer.right ?? 0,
                    bottom: layer.bottom ?? 0,
                    left: layer.left ?? 0,
                    height: layer.height,
                    width: layer.width,
                  }
                : { inset: 0 }),
              ...(layer.opacity !== undefined
                ? { opacity: layer.opacity }
                : null),
              background: layer.background,
            }}
          />
        );
      })}
      {heroCopy}
    </div>
  );

  const drawer = (
    <HotspotDrawer
      tab={tabData}
      open={tabOpen}
      isMobile={isMobile}
      behindRef={behindRef}
      onBehindTick={() => forceDrawRef.current?.()}
      onClose={() => setActiveTab(null)}
    />
  );

  // Editor canvas: 1 viewport tĩnh — storefront + chữ hiện đủ để chọn/sửa.
  if (isCanvas) {
    const frameSeq = isMobile ? framesConfig.mobile : framesConfig.desktop;
    const framePreview =
      hotspots[0]?.img || `${frameSeq.prefix}001${framesConfig.ext}`;

    return (
      <section
        ref={sectionRef}
        id='discover'
        style={blockBackgroundStyle(background)}
        className={cn(
          'pnj-hero @container relative w-full bg-white',
          className
        )}
      >
        <div className='relative min-h-[520px] w-full overflow-hidden'>
          {renderHeroImg(
            'pnj-hero__img relative z-10 aspect-4/5 w-full overflow-hidden bg-[#f7f5f3] @2xl:aspect-16/10',
            false
          )}

          {hotspots.length > 0 ? (
            <div className='border-t border-neutral-200/80 bg-neutral-950 px-3 py-3'>
              <p className='mb-2 text-[10px] font-semibold tracking-[0.14em] text-neutral-400 uppercase'>
                Frame scrub + hotspot · {hotspots.length}
              </p>
              <div className='relative aspect-4/5 overflow-hidden rounded-xl ring-1 ring-white/10 @2xl:aspect-16/10'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={framePreview}
                  alt=''
                  className='h-full w-full object-cover'
                  draggable={false}
                />
                {hotspots.map(tab => (
                  <button
                    key={tab.key}
                    type='button'
                    tabIndex={0}
                    aria-label={tab.label}
                    className='absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c79119] ring-2 ring-white/90'
                    style={{ left: `${tab.dotX}%`, top: `${tab.dotY}%` }}
                    onClick={() => handleHotspotClick(tab.key)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleHotspotClick(tab.key);
                      }
                    }}
                  />
                ))}
                <span className='pointer-events-none absolute top-2 left-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase'>
                  Preview
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  // Mobile: storefront normal flow → sticky canvas scrub (apps/pnj shape).
  if (isMobile) {
    return (
      <section
        ref={sectionRef}
        style={blockBackgroundStyle(background)}
        className={cn('pnj-hero @container relative w-full', className)}
      >
        {renderHeroImg(
          'pnj-hero__img relative h-svh min-h-svh w-full overflow-hidden bg-[#f7f5f3]',
          false
        )}

        <section
          id='discover'
          className='pnj-hero-rotate relative w-full bg-white'
          style={{ height: `${trackVh}svh` }}
        >
          <div className='pnj-hero-canvas-wrap sticky top-0 h-svh min-h-svh w-full overflow-hidden'>
            <div ref={behindRef} className='relative h-full w-full'>
              {canvasFrame}
            </div>
          </div>
        </section>

        {drawer}
      </section>
    );
  }

  // Desktop: sticky .pnj-hero-pin chứa storefront + canvas chồng nhau.
  return (
    <section
      ref={sectionRef}
      id='discover'
      style={{
        ...blockBackgroundStyle(background),
        height: `${totalVh}svh`,
      }}
      className={cn('pnj-hero @container relative w-full', className)}
    >
      <div className='pnj-hero-pin sticky top-0 h-svh min-h-svh w-full overflow-hidden bg-white'>
        {renderHeroImg(
          'pnj-hero__img absolute inset-0 z-10 h-full w-full overflow-hidden bg-[#f7f5f3]',
          true
        )}
        <div className='pnj-hero-canvas-wrap absolute inset-0 z-20 h-full w-full overflow-hidden will-change-transform'>
          <div ref={behindRef} className='relative h-full w-full'>
            {canvasFrame}
          </div>
        </div>
      </div>
      {drawer}
    </section>
  );
}
