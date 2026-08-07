'use client';

/**
 * Block "Responsive Landing Loader" (port Codegrid `cg-responsive-landing-page`) —
 * chỉ preloader: counter + copy letter + lớp đen/đỏ, không hero/ảnh/nền sau.
 *
 * Timing gốc (bỏ loader-2 / site-content):
 *  - Counter random 0→100; copy letters in (expo) rồi out;
 *  - 3s: pre-loader scale 0.5;
 *  - 3.75s: count fade + loader đen collapse;
 *  - 4s: loader-bg đỏ collapse → overlay unmount, block thu về 0.
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import { CG_RESPONSIVE_LANDING_LOADER_DEFAULTS } from './_registry/defs/cgResponsiveLandingLoader';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  CgResponsiveLandingLoaderContent,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface Props {
  content: CgResponsiveLandingLoaderContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

type LenisLike = { stop: () => void; start: () => void };

const getLenis = (): LenisLike | undefined =>
  (window as unknown as { __lenis?: LenisLike }).__lenis;

const OVERLAY_Z = 1000;
const LOADER_BLACK = '#000000';
const LOADER_RED = '#ff0000';
const FONT_BODY =
  '"Neue Montreal", "Helvetica Neue", Helvetica, Arial, sans-serif';
const FONT_DISPLAY = '"PP Editorial Old", "Times New Roman", Georgia, serif';

const CLIP_FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';

function splitLetters(text: string): string[] {
  return text.split('');
}

export function CgResponsiveLandingLoader({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const preLoaderRef = React.useRef<HTMLDivElement>(null);
  const loaderRef = React.useRef<HTMLDivElement>(null);
  const loaderBgRef = React.useRef<HTMLDivElement>(null);
  const countRef = React.useRef<HTMLDivElement>(null);
  const countTextRef = React.useRef<HTMLParagraphElement>(null);
  const letterRefs = React.useRef<(HTMLSpanElement | null)[]>([]);

  const { hasRoot, scroller } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(rootRef);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);
  const [showIntro, setShowIntro] = React.useState(true);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const D = CG_RESPONSIVE_LANDING_LOADER_DEFAULTS;
  const copyText = content.copyText?.trim() || D.copyText;
  const letters = splitLetters(copyText);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || isCanvas) {
      setPortalHost(null);
      return;
    }
    const host = resolveDrawerPortalHost(root);
    setPortalHost(host === document.body ? null : host);
  }, [hasRoot, isCanvas]);

  const inFrame = isDeviceFrameHost(portalHost);
  const showStatic = isCanvas || !hasRoot;
  const useOverlay = hasRoot && !isCanvas && showIntro;

  const bgStyle = blockBackgroundStyle(background);

  const countBase: React.CSSProperties = {
    margin: 0,
    fontFamily: FONT_BODY,
    fontSize: 'clamp(28px, 6cqi, 48px)',
    fontWeight: 400,
    lineHeight: 1,
    color: '#ffffff',
    textAlign: 'right',
  };

  const copyBase: React.CSSProperties = {
    margin: 0,
    fontFamily: FONT_DISPLAY,
    fontSize: 'clamp(22px, 4.5cqi, 30px)',
    fontWeight: 500,
    lineHeight: 1,
    color: '#ffffff',
    textTransform: 'uppercase',
    overflow: 'hidden',
  };

  const letterBase: React.CSSProperties = {
    display: 'inline-block',
    lineHeight: 1,
  };

  // ── Motion (PreviewMode + /p) ─────────────────────────────────────────
  React.useEffect(() => {
    if (!useOverlay) return;

    const preLoader = preLoaderRef.current;
    const loader = loaderRef.current;
    const loaderBg = loaderBgRef.current;
    const count = countRef.current;
    const countText = countTextRef.current;
    const letterEls = letterRefs.current.filter(Boolean) as HTMLSpanElement[];

    if (
      !preLoader ||
      !loader ||
      !loaderBg ||
      !count ||
      !countText ||
      letterEls.length === 0
    ) {
      return;
    }

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const html = document.documentElement;
    let locked = false;
    const lockScroll = () => {
      if (locked) return;
      locked = true;
      if (scroller) {
        scroller.style.overflow = 'hidden';
        return;
      }
      const scrollbarWidth = window.innerWidth - html.clientWidth;
      html.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      getLenis()?.stop();
    };
    const unlockScroll = () => {
      if (!locked) return;
      locked = false;
      if (scroller) {
        scroller.style.overflow = '';
        return;
      }
      html.style.overflow = '';
      document.body.style.paddingRight = '';
      getLenis()?.start();
    };

    let completed = false;
    let cancelled = false;
    let counterTimeout: ReturnType<typeof setTimeout> | null = null;
    let cleanupCtx: (() => void) | null = null;

    const handleComplete = () => {
      if (completed) return;
      completed = true;
      unlockScroll();
      setShowIntro(false);
    };

    lockScroll();

    const runCounter = () => {
      let currentValue = 0;
      const tick = () => {
        if (cancelled || currentValue >= 100) return;
        const increment = Math.floor(Math.random() * 10) + 1;
        currentValue = Math.min(currentValue + increment, 100);
        countText.textContent = String(currentValue);
        if (currentValue < 100) {
          const delay = Math.floor(Math.random() * 200) + 25;
          counterTimeout = setTimeout(tick, delay);
        }
      };
      tick();
    };

    const setupMotion = () => {
      if (cancelled) return;

      countText.textContent = '0';
      gsap.set(count, { opacity: 1 });
      gsap.set(preLoader, { scale: 1, clipPath: CLIP_FULL });
      gsap.set(loader, { height: '100%' });
      gsap.set(loaderBg, { height: '100%' });
      gsap.set(letterEls, { y: 0 });

      if (reduce) {
        countText.textContent = '100';
        handleComplete();
        return;
      }

      runCounter();

      const ctx = gsap.context(() => {
        gsap.fromTo(
          letterEls,
          { y: -100 },
          {
            y: 0,
            duration: 1.5,
            ease: 'expo.out',
            stagger: 0.03,
          }
        );

        gsap.to(letterEls, {
          y: 100,
          duration: 3,
          ease: 'expo.out',
          stagger: 0.03,
          delay: 2,
        });

        gsap.to(count, {
          opacity: 0,
          ease: 'power2.inOut',
          duration: 0.5,
          delay: 3.75,
        });

        gsap.to(preLoader, {
          scale: 0.5,
          ease: 'power4.inOut',
          duration: 2,
          delay: 3,
        });

        gsap.to(loader, {
          height: '0%',
          ease: 'power4.inOut',
          duration: 1.5,
          delay: 3.75,
        });

        gsap.to(loaderBg, {
          height: '0%',
          ease: 'power4.inOut',
          duration: 1.5,
          delay: 4,
          onComplete: handleComplete,
        });
      }, preLoader);

      cleanupCtx = () => ctx.revert();
    };

    const raf = requestAnimationFrame(setupMotion);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (counterTimeout) clearTimeout(counterTimeout);
      cleanupCtx?.();
      unlockScroll();
    };
  }, [useOverlay, scroller, portalHost, copyText]);

  const loaderContentRow = (interactive: boolean) => (
    <div
      className='absolute top-1/2 left-1/2 z-[2] flex'
      style={{
        width: 'min(400px, 90cqi)',
        transform: 'translate(-50%, -50%)',
        color: '#ffffff',
      }}
    >
      <div
        ref={interactive ? countRef : undefined}
        className='flex-[2]'
        style={{ padding: '0 1em' }}
        aria-hidden={interactive}
      >
        <p
          ref={interactive ? countTextRef : undefined}
          style={composeStyle(countBase, styleOf('count'))}
        >
          {interactive ? '0' : '100'}
        </p>
      </div>
      <div className='flex-[6] overflow-hidden'>
        <p
          data-element-key='copyText'
          className={selectableClass(activeKey === 'copyText', 'cg-rlp-copy')}
          style={composeStyle(copyBase, styleOf('copyText'))}
        >
          {letters.map((char, i) =>
            char === ' ' ? (
              <span key={`sp-${i}`} style={letterBase}>
                {'\u00A0'}
              </span>
            ) : (
              <span
                key={`${char}-${i}`}
                ref={el => {
                  if (interactive) letterRefs.current[i] = el;
                }}
                style={letterBase}
              >
                {char}
              </span>
            )
          )}
        </p>
      </div>
    </div>
  );

  const loaderLayers = (interactive: boolean) => (
    <>
      <div
        ref={interactive ? preLoaderRef : undefined}
        className='absolute inset-0'
        style={{ clipPath: CLIP_FULL }}
      >
        <div
          ref={interactive ? loaderRef : undefined}
          className='absolute top-0 left-0 flex w-full items-center justify-center'
          style={{
            height: '100%',
            background: LOADER_BLACK,
            color: '#ffffff',
          }}
          aria-hidden
        />
        <div
          ref={interactive ? loaderBgRef : undefined}
          className='absolute top-0 left-0 w-full'
          style={{
            height: '100%',
            background: LOADER_RED,
            zIndex: -1,
          }}
          aria-hidden
        />
      </div>
      {loaderContentRow(interactive)}
    </>
  );

  // ── Canvas / mini-preview ─────────────────────────────────────────────
  if (showStatic) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit={isCanvas ? 'true' : undefined}
        aria-label='Responsive landing loader'
        className={cn(
          'cg-responsive-landing-loader @container relative w-full overflow-hidden',
          className
        )}
        style={composeStyle({ backgroundColor: LOADER_BLACK }, bgStyle)}
      >
        <div
          className='relative w-full overflow-hidden'
          style={{ minHeight: 'clamp(280px, 55cqi, 420px)' }}
        >
          {loaderLayers(false)}
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p ────────────────────────────────────────────────────
  const overlay = (
    <div
      aria-label='Landing page loader'
      className={cn(
        'cg-responsive-landing-loader @container overflow-hidden',
        inFrame ? 'absolute inset-0' : 'fixed inset-0'
      )}
      style={{
        zIndex: OVERLAY_Z,
        backgroundColor: LOADER_BLACK,
        pointerEvents: 'none',
      }}
    >
      {loaderLayers(true)}
    </div>
  );

  return (
    <section
      ref={rootRef}
      aria-hidden={!showIntro}
      className={cn(
        'cg-responsive-landing-loader relative w-full',
        useOverlay ? 'overflow-visible' : 'overflow-hidden',
        className
      )}
      style={composeStyle(
        showIntro
          ? { minHeight: '100svh' }
          : { minHeight: 0, height: 0, margin: 0, padding: 0 },
        bgStyle
      )}
    >
      {useOverlay
        ? portalHost
          ? createPortal(overlay, portalHost)
          : overlay
        : null}
    </section>
  );
}
