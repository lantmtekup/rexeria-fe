'use client';

/**
 * Block "Landing Page Reveal" (port Codegrid `24012024-Landing-Page-Reveal`) —
 * giữ timing gốc, bỏ nav/menu.
 *
 *  - Counter random 0→100; digit spans exit;
 *  - Logo letters rise then exit;
 *  - Strip images slide in (delay 4) then out (delay 7);
 *  - Overlay fade (delay 4); hero scale 2→1 (delay 3.5); headline reveal (delay 4).
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import { CG_LANDING_PAGE_REVEAL_DEFAULTS } from './_registry/defs/cgLandingPageReveal';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  CgLandingPageRevealContent,
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
  content: CgLandingPageRevealContent;
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
const ACCENT = '#e6e0d8';
const STRIP_COUNT = 10;
const FONT = '"Manrope", "Helvetica Neue", Helvetica, Arial, sans-serif';

function splitLetters(text: string): string[] {
  return text.split('');
}

function collectLetterEls(
  refs: React.MutableRefObject<(HTMLSpanElement | null)[]>,
  count: number
): HTMLSpanElement[] | null {
  const els: HTMLSpanElement[] = [];
  for (let i = 0; i < count; i++) {
    const el = refs.current[i];
    if (!el) return null;
    els.push(el);
  }
  return els;
}

export function CgLandingPageReveal({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const heroImgRef = React.useRef<HTMLImageElement>(null);
  const counterRef = React.useRef<HTMLParagraphElement>(null);
  const logoLetterRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const heroLetterRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const stripImgRefs = React.useRef<(HTMLImageElement | null)[]>([]);

  const { hasRoot, scroller } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(rootRef);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);
  const [layoutReady, setLayoutReady] = React.useState(false);
  const [showIntro, setShowIntro] = React.useState(true);
  const [motionComplete, setMotionComplete] = React.useState(false);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const D = CG_LANDING_PAGE_REVEAL_DEFAULTS;
  const brandText = content.brandText?.trim() || D.brandText;
  const heroImageUrl = content.heroImageUrl?.trim() || D.heroImageUrl;
  const loaderImageUrl = content.loaderImageUrl?.trim() || D.loaderImageUrl;
  const letters = splitLetters(brandText);
  const letterCount = letters.filter(char => char !== ' ').length;

  React.useEffect(() => {
    logoLetterRefs.current = [];
    heroLetterRefs.current = [];
  }, [brandText]);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || isCanvas) {
      setPortalHost(null);
      setLayoutReady(false);
      return;
    }
    const host = resolveDrawerPortalHost(root);
    setPortalHost(host === document.body ? null : host);
    setLayoutReady(true);
  }, [hasRoot, isCanvas]);

  const inFrame = isDeviceFrameHost(portalHost);
  const showStatic = isCanvas || !hasRoot;
  const useOverlay = hasRoot && !isCanvas && showIntro && layoutReady;

  const bgStyle = blockBackgroundStyle(background);

  const counterBase: React.CSSProperties = {
    margin: 0,
    fontFamily: FONT,
    fontSize: 'clamp(64px, 18vw, 200px)',
    fontWeight: 400,
    lineHeight: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: '#000000',
  };

  const logoBase: React.CSSProperties = {
    margin: 0,
    fontFamily: FONT,
    fontSize: 'clamp(64px, 18vw, 200px)',
    fontWeight: 400,
    lineHeight: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: '#000000',
    whiteSpace: 'nowrap',
  };

  const headlineBase: React.CSSProperties = {
    margin: 0,
    fontFamily: FONT,
    fontSize: '30vw',
    fontWeight: 400,
    lineHeight: 1,
    textTransform: 'uppercase',
    color: ACCENT,
    whiteSpace: 'nowrap',
  };

  const logoLetterBase: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    lineHeight: 1,
  };

  const heroLetterBase: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    lineHeight: 1,
  };

  const renderLetters = (
    interactive: boolean,
    refs: React.MutableRefObject<(HTMLSpanElement | null)[]>,
    variant: 'logo' | 'hero',
    lockedTop?: number | string
  ) => {
    let letterIndex = 0;
    const base = variant === 'logo' ? logoLetterBase : heroLetterBase;

    return letters.map((char, i) => {
      if (char === ' ') {
        return (
          <span key={`sp-${i}`} style={base}>
            {'\u00A0'}
          </span>
        );
      }

      const idx = letterIndex;
      letterIndex += 1;

      return (
        <span
          key={`${char}-${i}`}
          ref={el => {
            if (interactive) refs.current[idx] = el;
          }}
          style={{
            ...base,
            ...(lockedTop !== undefined ? { top: lockedTop } : {}),
          }}
        >
          {char}
        </span>
      );
    });
  };

  // Chỉ arm sau layoutReady — tránh portalHost flip làm effect cleanup giữa chừng counter.
  React.useEffect(() => {
    if (!useOverlay) return;

    const overlay = overlayRef.current;
    const heroImg = heroImgRef.current;
    const counter = counterRef.current;

    if (!overlay || !heroImg || !counter) {
      return;
    }

    let logoLetters: HTMLSpanElement[] = [];
    let heroLetters: HTMLSpanElement[] = [];
    const stripImgs = stripImgRefs.current.filter(
      Boolean
    ) as HTMLImageElement[];

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
    let textAnimated = false;
    let counterTimeout: ReturnType<typeof setTimeout> | null = null;
    let cleanupOverlay: (() => void) | null = null;
    let cleanupHero: (() => void) | null = null;
    let cleanupHeadline: (() => void) | null = null;
    let cleanupStrip: (() => void) | null = null;

    const handleComplete = () => {
      if (completed) return;
      completed = true;
      // Khóa trạng thái cuối trước khi unmount overlay — tránh ctx.revert() giật hero.
      gsap.set(heroImg, { scale: 1, transformOrigin: '50% 50%' });
      if (heroLetters.length > 0) {
        gsap.set(heroLetters, { top: 0 });
      }
      cleanupOverlay?.();
      cleanupStrip?.();
      cleanupOverlay = null;
      cleanupStrip = null;
      cleanupHero = null;
      cleanupHeadline = null;
      unlockScroll();
      setMotionComplete(true);
      setShowIntro(false);
    };

    lockScroll();

    const runCounter = () => {
      let currentValue = 0;

      const tick = () => {
        if (cancelled) return;

        if (currentValue >= 100) {
          animateText();
          return;
        }

        currentValue += Math.floor(Math.random() * 10) + 1;
        currentValue = Math.min(currentValue, 100);
        counter.textContent = `${currentValue}%`;

        if (currentValue < 100) {
          const delay = Math.floor(Math.random() * 200) + 100;
          counterTimeout = setTimeout(tick, delay);
        } else {
          animateText();
        }
      };

      tick();
    };

    const animateText = () => {
      if (cancelled || textAnimated) return;
      textAnimated = true;

      setTimeout(() => {
        if (cancelled) return;

        const counterDigits = counter.textContent?.replace('%', '') ?? '100';
        counter.innerHTML =
          counterDigits
            .split('')
            .map(
              char =>
                `<span style="position:relative;display:inline-block;line-height:1">${char}</span>`
            )
            .join('') +
          '<span style="position:relative;display:inline-block;line-height:1">%</span>';

        const counterSpans = counter.querySelectorAll('span');

        const ctx = gsap.context(() => {
          gsap.set(logoLetters, { top: 200 });
          gsap.set(overlay, { opacity: 1 });

          gsap.to(counterSpans, {
            top: '-400px',
            stagger: 0.1,
            ease: 'power3.inOut',
            duration: 1,
          });

          gsap.to(logoLetters, {
            top: 0,
            stagger: 0.1,
            ease: 'power3.inOut',
            duration: 1,
          });

          gsap.to(logoLetters, {
            top: -400,
            stagger: 0.1,
            ease: 'power3.inOut',
            duration: 1,
            delay: 3,
          });

          gsap.to(overlay, {
            opacity: 0,
            ease: 'power3.inOut',
            duration: 1,
            delay: 4,
            onComplete: handleComplete,
          });
        }, overlay);

        const heroRoot = rootRef.current ?? heroImg;
        const heroCtx = gsap.context(() => {
          gsap.to(heroImg, {
            scale: 1,
            ease: 'power3.inOut',
            duration: 2,
            delay: 3.5,
          });
        }, heroRoot);
        cleanupHero = () => heroCtx.revert();

        if (heroLetters.length > 0) {
          const headlineTween = gsap.to(heroLetters, {
            top: 0,
            stagger: 0.1,
            ease: 'power3.inOut',
            duration: 2,
            delay: 4,
          });
          cleanupHeadline = () => headlineTween.kill();
        }

        cleanupOverlay = () => ctx.revert();
      }, 300);
    };

    const setupMotion = () => {
      if (cancelled) return;

      const logoEls = collectLetterEls(logoLetterRefs, letterCount);
      const heroEls = collectLetterEls(heroLetterRefs, letterCount);
      if (!logoEls || !heroEls) return;

      logoLetters = logoEls;
      heroLetters = heroEls;

      const heroHideTop = window.innerWidth * 0.3;

      if (reduce) {
        counter.textContent = '100%';
        gsap.set(heroImg, { scale: 1, transformOrigin: '50% 50%' });
        gsap.set(heroLetters, { top: 0 });
        setMotionComplete(true);
        handleComplete();
        return;
      }

      gsap.set(heroImg, { scale: 2, transformOrigin: '50% 50%' });
      gsap.set(logoLetters, { top: 200 });
      gsap.set(heroLetters, { top: heroHideTop });

      counter.textContent = '0%';

      if (stripImgs.length > 0) {
        const stripCtx = gsap.context(() => {
          gsap.set(stripImgs, { left: '-110%' });
          gsap.to(stripImgs, {
            left: '0%',
            stagger: 0.1,
            ease: 'power4.out',
            duration: 1.5,
            delay: 4,
          });
          gsap.to(stripImgs, {
            left: '110%',
            stagger: -0.1,
            ease: 'power4.out',
            duration: 1.5,
            delay: 7,
          });
        }, overlay);
        cleanupStrip = () => stripCtx.revert();
      }

      runCounter();
    };

    let raf = 0;
    let attempts = 0;
    const trySetupMotion = () => {
      if (cancelled) return;
      const logoEls = collectLetterEls(logoLetterRefs, letterCount);
      const heroEls = collectLetterEls(heroLetterRefs, letterCount);
      if ((!logoEls || !heroEls) && attempts < 12) {
        attempts += 1;
        raf = requestAnimationFrame(trySetupMotion);
        return;
      }
      if (!logoEls || !heroEls) return;
      setupMotion();
    };

    raf = requestAnimationFrame(trySetupMotion);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (counterTimeout) clearTimeout(counterTimeout);
      cleanupOverlay?.();
      if (!completed) {
        cleanupHero?.();
        cleanupHeadline?.();
        gsap.set(heroImg, { clearProps: 'transform' });
        if (heroLetters.length > 0) {
          gsap.set(heroLetters, { clearProps: 'top' });
        }
      }
      cleanupStrip?.();
      unlockScroll();
    };
  }, [useOverlay, scroller, brandText, letterCount]);

  const overlayChrome = (interactive: boolean) => (
    <div
      className='flex w-full flex-col items-center'
      style={{ width: '100%', overflow: 'visible' }}
    >
      <div
        className='relative overflow-hidden'
        style={{
          width: 'clamp(280px, 75vw, 40vw)',
          maxWidth: '100%',
          height: 'clamp(320px, 55vh, 550px)',
        }}
        aria-hidden
      >
        <div
          className='relative mx-auto h-full overflow-hidden'
          style={{ width: '80%', zIndex: 2 }}
        >
          {Array.from({ length: STRIP_COUNT }, (_, i) => (
            <img
              key={i}
              ref={el => {
                if (interactive) stripImgRefs.current[i] = el;
              }}
              src={loaderImageUrl}
              alt=''
              style={{
                position: 'absolute',
                top: 0,
                left: interactive ? '-110%' : 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ))}
        </div>
      </div>

      {/* Text full-bleed — không nằm trong cột 40vw (tránh clip chữ S) */}
      <div
        className='relative flex w-full justify-center'
        style={{ margin: '1em 0', overflow: 'hidden' }}
      >
        <div
          className='relative'
          style={{ width: 'max-content', maxWidth: '96vw' }}
        >
          <div className='relative' aria-hidden={interactive}>
            <p ref={interactive ? counterRef : undefined} style={counterBase}>
              {interactive ? '0%' : '100%'}
            </p>
          </div>
          <div
            className='absolute top-0 left-1/2 -translate-x-1/2'
            style={{ width: 'max-content', maxWidth: '96vw' }}
            aria-hidden={interactive}
          >
            <p className='cg-lpr-logo' style={logoBase}>
              {renderLetters(
                interactive,
                logoLetterRefs,
                'logo',
                interactive && !motionComplete ? 200 : undefined
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const heroSection = (interactive: boolean) => (
    <>
      <div
        className='absolute inset-0 overflow-hidden'
        aria-hidden={interactive && showIntro}
      >
        <img
          ref={interactive ? heroImgRef : undefined}
          src={heroImageUrl}
          alt=''
          data-element-key='heroImageUrl'
          className={selectableClass(
            activeKey === 'heroImageUrl',
            'cg-lpr-hero-img'
          )}
          style={composeStyle(
            {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transformOrigin: '50% 50%',
            },
            styleOf('heroImageUrl')
          )}
        />
      </div>

      <div
        className='pointer-events-none absolute top-[35%] left-0 w-full -translate-y-1/2 overflow-hidden'
        style={{ textAlign: 'center' }}
      >
        <h1
          data-element-key='brandText'
          className={selectableClass(
            activeKey === 'brandText',
            'cg-lpr-headline'
          )}
          style={composeStyle(
            { ...headlineBase, display: 'inline-block' },
            styleOf('brandText')
          )}
        >
          {renderLetters(
            interactive,
            heroLetterRefs,
            'hero',
            motionComplete ? 0 : undefined
          )}
        </h1>
      </div>
    </>
  );

  // ── Canvas / mini-preview ─────────────────────────────────────────────
  if (showStatic) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit={isCanvas ? 'true' : undefined}
        aria-label='Landing page reveal'
        className={cn(
          'cg-landing-page-reveal @container relative w-full overflow-hidden',
          className
        )}
        style={composeStyle({ backgroundColor: ACCENT }, bgStyle)}
      >
        <div
          className='relative w-full overflow-hidden'
          style={{ minHeight: 'clamp(320px, 70cqi, 560px)' }}
        >
          <div
            className='absolute inset-0'
            style={{
              backgroundImage: `url(${heroImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: '50% 50%',
            }}
            role='img'
            aria-label={brandText}
          />
          <div className='absolute inset-0 flex flex-col items-center justify-center gap-[clamp(16px,3cqi,32px)] p-[clamp(16px,3cqi,32px)]'>
            <div
              className='relative w-full max-w-[min(100%,360px)] overflow-hidden'
              style={{
                height: 'clamp(160px, 30cqi, 280px)',
                backgroundColor: ACCENT,
              }}
            >
              <img
                src={loaderImageUrl}
                alt=''
                data-element-key='loaderImageUrl'
                className={selectableClass(
                  activeKey === 'loaderImageUrl',
                  'cg-lpr-loader-img'
                )}
                style={composeStyle(
                  {
                    width: '80%',
                    height: '100%',
                    margin: '0 auto',
                    display: 'block',
                    objectFit: 'cover',
                  },
                  styleOf('loaderImageUrl')
                )}
              />
            </div>
            <p
              data-element-key='brandText'
              className={selectableClass(
                activeKey === 'brandText',
                'cg-lpr-brand'
              )}
              style={composeStyle(
                {
                  ...logoBase,
                  fontSize: 'clamp(32px, 8cqi, 72px)',
                },
                styleOf('brandText')
              )}
            >
              {brandText}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p ────────────────────────────────────────────────────
  const overlay = (
    <div
      ref={overlayRef}
      aria-label='Landing page loader'
      className={cn(
        'cg-landing-page-reveal flex items-center justify-center',
        inFrame ? 'absolute inset-0' : 'fixed inset-0'
      )}
      style={{
        zIndex: OVERLAY_Z,
        backgroundColor: ACCENT,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {overlayChrome(true)}
    </div>
  );

  return (
    <section
      ref={rootRef}
      className={cn(
        'cg-landing-page-reveal relative w-full max-w-full overflow-x-clip',
        className
      )}
      style={composeStyle(
        {
          minHeight: '100svh',
          backgroundColor: '#000000',
          width: '100%',
        },
        bgStyle
      )}
    >
      {heroSection(true)}
      {useOverlay
        ? portalHost
          ? createPortal(overlay, portalHost)
          : overlay
        : null}
    </section>
  );
}
