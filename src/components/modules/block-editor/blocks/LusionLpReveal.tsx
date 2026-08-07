'use client';

/**
 * Block "Intro - Lusion LP Reveal" (port Codegrid `cg-lusion-lp-reveal`) —
 * giữ nguyên timing / composition của bản HTML:
 *
 *  - Counter reels: digit-3 5s, digit-2 6s, digit-1 2s delay 4s;
 *  - Digits exit top -150px at 6s (stagger 0.25);
 *  - Loader bars grow 6s / 2s (delay 1.9);
 *  - Bars rotate/translate at 6s → loader scale+rotate exit 7s;
 *  - Overlay fade 7.5s; headlines stagger y reveal delay 7.
 *
 * Host adaptations (apps-port-host / GambitDelvauxIntro):
 *  - Canvas / mini-preview: flat edit, no overlay/animation;
 *  - PreviewMode: portal absolute vào device frame;
 *  - /p: overlay fixed in-place (SSR first paint);
 *  - Scroll lock + Lenis stop/start; refs-scoped GSAP; inline style tokens.
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import { LUSION_LP_REVEAL_DEFAULTS } from './_registry/defs/lusionLpReveal';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  LusionLpRevealContent,
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
  content: LusionLpRevealContent;
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
const LOADER_BG = '#000000';
const CONTENT_BG = '#ffffff';
const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

/** Digit-3 strip: 0–9 (markup) + two more 0–9 loops + final 0. */
const COUNTER3_DIGITS = [
  ...Array.from({ length: 10 }, (_, i) => String(i)),
  ...Array.from({ length: 10 }, (_, i) => String(i)),
  ...Array.from({ length: 10 }, (_, i) => String(i)),
  '0',
];

const COUNTER2_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

const COUNTER1_DIGITS = ['0', '1'];

function DigitColumn({
  digits,
  columnRef,
  digitRef,
  offsetFor,
}: {
  digits: string[];
  columnRef: React.RefObject<HTMLDivElement | null>;
  digitRef: (el: HTMLDivElement | null) => void;
  offsetFor?: (n: string, i: number) => React.CSSProperties | undefined;
}) {
  return (
    <div
      ref={el => {
        (columnRef as React.MutableRefObject<HTMLDivElement | null>).current =
          el;
        digitRef(el);
      }}
      className='relative'
      style={{ top: '-15px' }}
    >
      {digits.map((n, i) => (
        <div
          key={`${n}-${i}`}
          data-num
          style={{
            height: '1em',
            fontFamily: FONT,
            fontSize: 'inherit',
            lineHeight: 'inherit',
            fontWeight: 400,
            ...(offsetFor?.(n, i) ?? {}),
          }}
        >
          {n}
        </div>
      ))}
    </div>
  );
}

export function LusionLpReveal({
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
  const loaderRef = React.useRef<HTMLDivElement>(null);
  const loader1Ref = React.useRef<HTMLDivElement>(null);
  const loader2Ref = React.useRef<HTMLDivElement>(null);
  const counter1Ref = React.useRef<HTMLDivElement>(null);
  const counter2Ref = React.useRef<HTMLDivElement>(null);
  const counter3Ref = React.useRef<HTMLDivElement>(null);
  const digitRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const line1Ref = React.useRef<HTMLHeadingElement>(null);
  const line2Ref = React.useRef<HTMLHeadingElement>(null);

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

  const D = LUSION_LP_REVEAL_DEFAULTS;
  const line1 = content.line1?.trim() || D.line1;
  const line2 = content.line2?.trim() || D.line2;

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

  const headlineBase: React.CSSProperties = {
    margin: 0,
    fontFamily: FONT,
    fontSize: 'clamp(2.5rem, 8cqi, 5rem)',
    fontWeight: 400,
    lineHeight: 1.05,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: '#000000',
  };

  const counterBase: React.CSSProperties = {
    fontFamily: FONT,
    fontSize: 'clamp(48px, 10cqi, 100px)',
    lineHeight: 1.02,
    fontWeight: 400,
    color: '#ffffff',
  };

  // ── Timeline (PreviewMode + /p only) ─────────────────────────────────
  React.useEffect(() => {
    if (!useOverlay) return;

    const overlay = overlayRef.current;
    const loader = loaderRef.current;
    const loader1 = loader1Ref.current;
    const loader2 = loader2Ref.current;
    const c1 = counter1Ref.current;
    const c2 = counter2Ref.current;
    const c3 = counter3Ref.current;
    const h1 = line1Ref.current;
    const h2 = line2Ref.current;
    const digits = digitRefs.current.filter(Boolean) as HTMLDivElement[];

    if (
      !overlay ||
      !loader ||
      !loader1 ||
      !loader2 ||
      !c1 ||
      !c2 ||
      !c3 ||
      !h1 ||
      !h2
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
    let cleanupOverlay: (() => void) | null = null;
    let headlineTween: gsap.core.Tween | null = null;

    const handleComplete = () => {
      if (completed) return;
      completed = true;
      // Keep final headline position when overlay unmounts / context reverts.
      gsap.set([h1, h2], { y: 0 });
      unlockScroll();
      setShowIntro(false);
    };

    lockScroll();

    const animateCounter = (
      counter: HTMLElement,
      duration: number,
      delay = 0
    ) => {
      const num = counter.querySelector<HTMLElement>('[data-num]');
      if (!num) return;
      const numHeight = num.clientHeight;
      const totalDistance =
        (counter.querySelectorAll('[data-num]').length - 1) * numHeight;
      gsap.to(counter, {
        y: -totalDistance,
        duration,
        delay,
        ease: 'power2.inOut',
      });
    };

    const setupMotion = () => {
      if (cancelled) return;

      gsap.set([h1, h2], { y: 80 });

      if (reduce) {
        gsap.set([h1, h2], { y: 0 });
        handleComplete();
        return;
      }

      // Overlay chrome only — revert must not undo headline final state.
      const ctx = gsap.context(() => {
        gsap.set(loader1, { width: 0, rotate: 0, y: 0, x: 0 });
        gsap.set(loader2, { width: 0, x: 0, y: 0 });
        gsap.set(digits, { top: '-15px' });
        gsap.set([c1, c2, c3], { y: 0 });
        gsap.set(loader, {
          background: 'rgb(80, 80, 80)',
          scale: 1,
          rotate: 0,
          x: 0,
          y: 0,
        });
        gsap.set(overlay, { opacity: 1 });

        animateCounter(c3, 5);
        animateCounter(c2, 6);
        animateCounter(c1, 2, 4);

        gsap.to(digits, {
          top: '-150px',
          stagger: { amount: 0.25 },
          delay: 6,
          duration: 1,
          ease: 'power4.inOut',
        });

        gsap.to(loader1, {
          width: 200,
          duration: 6,
          ease: 'power2.inOut',
        });

        gsap.to(loader2, {
          width: 100,
          delay: 1.9,
          duration: 2,
          ease: 'power2.inOut',
        });

        gsap.to(loader, {
          background: 'none',
          delay: 6,
          duration: 0.1,
        });

        gsap.to(loader1, {
          rotate: 90,
          y: -50,
          duration: 0.5,
          delay: 6,
        });

        // Intent of source `"<"` (simultaneous with loader-1 rotate).
        gsap.to(loader2, {
          x: -75,
          y: 75,
          duration: 0.5,
          delay: 6,
        });

        gsap.to(loader, {
          scale: 40,
          duration: 1,
          delay: 7,
          ease: 'power2.inOut',
        });

        gsap.to(loader, {
          rotate: 45,
          y: 500,
          x: 2000,
          duration: 1,
          delay: 7,
          ease: 'power2.inOut',
        });

        gsap.to(overlay, {
          opacity: 0,
          duration: 0.5,
          delay: 7.5,
          ease: 'power1.inOut',
          onComplete: handleComplete,
        });
      }, overlay);

      // Outside context so cleanup revert does not snap headlines back.
      headlineTween = gsap.to([h1, h2], {
        y: 0,
        delay: 7,
        duration: 1.5,
        ease: 'power4.inOut',
        stagger: { amount: 0.1 },
      });

      cleanupOverlay = () => {
        ctx.revert();
      };
    };

    const raf = requestAnimationFrame(() => {
      setupMotion();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cleanupOverlay?.();
      if (!completed) {
        headlineTween?.kill();
        gsap.set([h1, h2], { clearProps: 'transform' });
      } else {
        gsap.set([h1, h2], { y: 0 });
      }
      unlockScroll();
    };
  }, [useOverlay, scroller, portalHost]);

  const headlines = (
    <div className='@container relative w-max max-w-full'>
      <div className='flex items-start justify-center gap-[10px]'>
        <h1
          ref={line1Ref}
          data-element-key='line1'
          className={selectableClass(activeKey === 'line1', 'lusion-lp-line1')}
          style={composeStyle(headlineBase, styleOf('line1'))}
        >
          {line1}
        </h1>
        <h1
          ref={line2Ref}
          data-element-key='line2'
          className={selectableClass(activeKey === 'line2', 'lusion-lp-line2')}
          style={composeStyle(headlineBase, styleOf('line2'))}
        >
          {line2}
        </h1>
      </div>
      {!showStatic ? (
        <div aria-hidden className='pointer-events-none absolute inset-0'>
          <div
            style={{
              position: 'absolute',
              top: 80,
              left: 0,
              width: '105%',
              height: '110%',
              background: CONTENT_BG,
            }}
          />
        </div>
      ) : null}
    </div>
  );

  const loaderChrome = (interactive: boolean) => (
    <>
      <div
        ref={interactive ? loaderRef : undefined}
        className='absolute top-1/2 left-1/2 flex'
        style={{
          width: 300,
          height: 50,
          transform: 'translate(-50%, -50%)',
          background: 'rgb(80, 80, 80)',
        }}
        aria-hidden
      >
        <div
          ref={interactive ? loader1Ref : undefined}
          style={{
            position: 'relative',
            background: '#fff',
            height: 50,
            width: interactive ? 0 : 200,
          }}
        />
        <div
          ref={interactive ? loader2Ref : undefined}
          style={{
            position: 'relative',
            background: '#fff',
            height: 50,
            width: interactive ? 0 : 100,
          }}
        />
      </div>
      <div
        className='absolute bottom-[clamp(24px,5cqi,50px)] left-[clamp(20px,4cqi,50px)] flex overflow-hidden'
        style={{
          ...counterBase,
          height: '1em',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        }}
        aria-hidden
      >
        {interactive ? (
          <>
            <DigitColumn
              digits={COUNTER1_DIGITS}
              columnRef={counter1Ref}
              digitRef={el => {
                digitRefs.current[0] = el;
              }}
              offsetFor={(n, i) =>
                n === '1' && i === 1
                  ? { position: 'relative', right: -25 }
                  : undefined
              }
            />
            <DigitColumn
              digits={COUNTER2_DIGITS}
              columnRef={counter2Ref}
              digitRef={el => {
                digitRefs.current[1] = el;
              }}
              offsetFor={(n, i) =>
                n === '1' && i === 1
                  ? { position: 'relative', right: -10 }
                  : undefined
              }
            />
            <DigitColumn
              digits={COUNTER3_DIGITS}
              columnRef={counter3Ref}
              digitRef={el => {
                digitRefs.current[2] = el;
              }}
            />
          </>
        ) : (
          <span style={{ ...counterBase, lineHeight: 1 }}>100</span>
        )}
      </div>
    </>
  );

  // ── Canvas / mini-preview ────────────────────────────────────────────
  if (showStatic) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit={isCanvas ? 'true' : undefined}
        aria-label='Lusion LP reveal'
        className={cn(
          'lusion-lp-reveal @container relative w-full overflow-hidden',
          className
        )}
        style={composeStyle({ backgroundColor: CONTENT_BG }, bgStyle)}
      >
        <div
          className='relative flex min-h-[280px] flex-col items-center justify-center'
          style={{
            padding: 'clamp(48px, 6cqi, 96px) clamp(20px, 4cqi, 64px)',
            gap: 'clamp(32px, 4cqi, 64px)',
          }}
        >
          {headlines}
          <div
            className='relative w-full max-w-[360px] overflow-hidden'
            style={{
              aspectRatio: '16 / 10',
              background: LOADER_BG,
              minHeight: 160,
            }}
          >
            {loaderChrome(false)}
          </div>
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p ─────────────────────────────────────────────────
  const overlay = (
    <div
      ref={overlayRef}
      aria-label='Lusion loading screen'
      className={cn(
        'lusion-lp-reveal @container overflow-hidden',
        inFrame ? 'absolute inset-0' : 'fixed inset-0'
      )}
      style={{
        zIndex: OVERLAY_Z,
        backgroundColor: LOADER_BG,
        color: '#fff',
        pointerEvents: 'none',
      }}
    >
      {loaderChrome(true)}
    </div>
  );

  return (
    <section
      ref={rootRef}
      className={cn(
        'lusion-lp-reveal relative w-full',
        useOverlay ? 'overflow-visible' : '@container',
        className
      )}
      style={composeStyle(
        {
          backgroundColor: CONTENT_BG,
          minHeight: '100svh',
        },
        bgStyle
      )}
    >
      <div className='absolute inset-0 flex items-center justify-center'>
        {headlines}
      </div>
      {useOverlay
        ? portalHost
          ? createPortal(overlay, portalHost)
          : overlay
        : null}
    </section>
  );
}
