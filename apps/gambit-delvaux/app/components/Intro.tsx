'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  gsap,
  MOTION_CONDITIONS,
  type MotionConditions,
} from '@/app/lib/motion';

type IntroProps = {
  /** Optional hook for host page / parent block — visibility is owned by Intro. */
  onComplete?: () => void;
};

const LOGO_TOP_OFFSET = 28;
/** Chiều rộng icon-text khi đã lên top (như bản trước khi chỉnh). */
const ICON_TEXT_FINAL_WIDTH = 132;
const PRODUCT_TITLE = 'BRILLANT MINI';
const CLIP_HIDDEN = 'inset(0 100% 0 0)';
const CLIP_VISIBLE = 'inset(0 0% 0 0)';

const getLogoFinalY = () => -(window.innerHeight * 0.5 - LOGO_TOP_OFFSET);

const getLogoFinalScale = (logoText: HTMLElement) =>
  ICON_TEXT_FINAL_WIDTH / logoText.offsetWidth;

const getProductStartY = () => window.innerHeight * 0.65;

const getTitleChars = (titleRoot: HTMLElement) =>
  titleRoot.querySelectorAll<HTMLElement>('[data-char]');

/** Scale đều cả dòng để ~full viewport, giữ kerning tự nhiên (không giãn chữ). */
const fitTitleWidth = (titleEl: HTMLElement) => {
  gsap.set(titleEl, {
    scale: 1,
    xPercent: -50,
    transformOrigin: '50% 100%',
  });
  const nextScale = (window.innerWidth * 0.98) / titleEl.scrollWidth;
  gsap.set(titleEl, {
    scale: nextScale,
    xPercent: -50,
    transformOrigin: '50% 100%',
  });
};

const applyFinalState = (refs: {
  curtainTop: HTMLDivElement;
  curtainBottom: HTMLDivElement;
  logoGroup: HTMLDivElement;
  logoTop: HTMLImageElement;
  logoText: HTMLImageElement;
  productWrap: HTMLDivElement;
  titleRoot: HTMLElement;
  titleChars: NodeListOf<HTMLElement> | HTMLElement[];
}) => {
  const {
    curtainTop,
    curtainBottom,
    logoGroup,
    logoTop,
    logoText,
    productWrap,
    titleRoot,
    titleChars,
  } = refs;

  gsap.set([curtainTop, curtainBottom], {
    yPercent: i => (i === 0 ? -100 : 100),
  });
  gsap.set(logoGroup, {
    y: getLogoFinalY(),
    scale: getLogoFinalScale(logoText),
    autoAlpha: 1,
    transformOrigin: '50% 50%',
  });
  gsap.set(logoTop, { autoAlpha: 0, scale: 0.45 });
  gsap.set(productWrap, { y: 0, autoAlpha: 1 });
  fitTitleWidth(titleRoot);
  gsap.set(titleChars, { clipPath: CLIP_VISIBLE, autoAlpha: 1 });
};

export default function Intro({ onComplete }: IntroProps) {
  const [showIntro, setShowIntro] = useState(true);
  const rootRef = useRef<HTMLElement>(null);
  const curtainTopRef = useRef<HTMLDivElement>(null);
  const curtainBottomRef = useRef<HTMLDivElement>(null);
  const logoGroupRef = useRef<HTMLDivElement>(null);
  const logoTopRef = useRef<HTMLImageElement>(null);
  const logoTextRef = useRef<HTMLImageElement>(null);
  const productWrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const exitTweenRef = useRef<gsap.core.Tween | null>(null);
  const completedRef = useRef(false);
  const skippedRef = useRef(false);
  const exitingRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setShowIntro(false);
    onComplete?.();
  }, [onComplete]);

  const playExit = useCallback(() => {
    if (exitingRef.current || completedRef.current) return;
    exitingRef.current = true;

    const root = rootRef.current;
    if (!root) {
      handleComplete();
      return;
    }

    timelineRef.current?.kill();
    timelineRef.current = null;

    gsap.set(root, { pointerEvents: 'none' });
    exitTweenRef.current = gsap.to(root, {
      yPercent: 100,
      duration: 0.55,
      ease: 'power3.in',
      onComplete: handleComplete,
    });
  }, [handleComplete]);

  const handleSkip = useCallback(() => {
    if (skippedRef.current || exitingRef.current || completedRef.current) {
      return;
    }
    skippedRef.current = true;

    const curtainTop = curtainTopRef.current;
    const curtainBottom = curtainBottomRef.current;
    const logoGroup = logoGroupRef.current;
    const logoTop = logoTopRef.current;
    const logoText = logoTextRef.current;
    const productWrap = productWrapRef.current;
    const titleRoot = titleRef.current;

    if (
      curtainTop &&
      curtainBottom &&
      logoGroup &&
      logoTop &&
      logoText &&
      productWrap &&
      titleRoot
    ) {
      applyFinalState({
        curtainTop,
        curtainBottom,
        logoGroup,
        logoTop,
        logoText,
        productWrap,
        titleRoot,
        titleChars: getTitleChars(titleRoot),
      });
    }

    timelineRef.current?.kill();
    timelineRef.current = null;
    playExit();
  }, [playExit]);

  const handleSkipKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      handleSkip();
    },
    [handleSkip]
  );

  useEffect(() => {
    if (!showIntro) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showIntro]);

  useEffect(() => {
    if (!showIntro) return;

    const root = rootRef.current;
    const curtainTop = curtainTopRef.current;
    const curtainBottom = curtainBottomRef.current;
    const logoGroup = logoGroupRef.current;
    const logoTop = logoTopRef.current;
    const logoText = logoTextRef.current;
    const productWrap = productWrapRef.current;
    const titleRoot = titleRef.current;

    if (
      !root ||
      !curtainTop ||
      !curtainBottom ||
      !logoGroup ||
      !logoTop ||
      !logoText ||
      !productWrap ||
      !titleRoot
    ) {
      return;
    }

    const titleChars = getTitleChars(titleRoot);
    const refs = {
      curtainTop,
      curtainBottom,
      logoGroup,
      logoTop,
      logoText,
      productWrap,
      titleRoot,
      titleChars,
    };
    const mm = gsap.matchMedia();

    let cancelled = false;

    const handleResize = () => {
      fitTitleWidth(titleRoot);
    };

    const setupMotion = () => {
      if (cancelled) return;

      fitTitleWidth(titleRoot);

      mm.add(MOTION_CONDITIONS, context => {
        const { reduce } = context.conditions as MotionConditions;

        const ctx = gsap.context(() => {
          gsap.set([curtainTop, curtainBottom], { yPercent: 0 });
          gsap.set(logoGroup, {
            y: 0,
            scale: 1,
            autoAlpha: 1,
            transformOrigin: '50% 50%',
          });
          gsap.set(logoTop, {
            autoAlpha: 1,
            scale: 1,
            transformOrigin: '50% 50%',
          });
          gsap.set(productWrap, { y: getProductStartY, autoAlpha: 0 });
          gsap.set(titleChars, { clipPath: CLIP_HIDDEN, autoAlpha: 0 });

          if (reduce) {
            applyFinalState(refs);
            handleComplete();
            return;
          }

          const tl = gsap.timeline({
            defaults: { ease: 'power2.inOut' },
            onComplete: playExit,
          });

          timelineRef.current = tl;

          // Phase 1: curtain split — chậm đầu, tăng tốc khi mở hết
          tl.to(curtainTop, {
            yPercent: -100,
            duration: 1.35,
            ease: 'power3.in',
          })
            .to(
              curtainBottom,
              { yPercent: 100, duration: 1.35, ease: 'power3.in' },
              '<'
            )
            // Phase 2: giữ khung full (0.6s)
            .to({}, { duration: 0.6 })
            // Dip nhẹ xuống và scale lên một chút trước khi bay lên
            .to(logoGroup, {
              y: 12,
              scale: 1.05,
              duration: 0.28,
              ease: 'power2.in',
            })
            .addLabel('transition')

            // Phase 3: bay lên + thu nhỏ — icon-text về ~132px
            .to(
              logoGroup,
              {
                y: getLogoFinalY,
                scale: () => getLogoFinalScale(logoText),
                duration: 1.5,
                transformOrigin: '50% 50%',
              },
              'transition'
            )
            .to(
              productWrap,
              { y: 0, autoAlpha: 1, duration: 1.5 },
              'transition'
            )
            // logo-top nhỏ dần khi lên top
            .to(
              logoTop,
              { scale: 0.45, duration: 1.5, transformOrigin: '50% 50%' },
              'transition'
            )
            // logo-top bay sát top rồi mới fade
            .to(
              logoTop,
              { autoAlpha: 0, duration: 0.4, ease: 'power2.out' },
              'transition+=1.0'
            )
            // Phase 4: BRILLANT MINI — clip trái→phải + opacity rõ dần
            .add(() => {
              fitTitleWidth(titleRoot);
            })
            .to(
              titleChars,
              {
                clipPath: CLIP_VISIBLE,
                autoAlpha: 1,
                duration: 2.2,
                ease: 'power3.out',
              },
              '>'
            );
        }, root);

        // Fit ngoài context để ctx.revert() không xóa scale title
        fitTitleWidth(titleRoot);

        return () => {
          ctx.revert();
          timelineRef.current = null;
          fitTitleWidth(titleRoot);
        };
      });
    };

    void document.fonts.ready.then(setupMotion);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
      exitTweenRef.current?.kill();
      exitTweenRef.current = null;
      mm.revert();
    };
  }, [handleComplete, playExit, showIntro]);

  if (!showIntro) return null;

  return (
    <section
      ref={rootRef}
      className='fixed inset-0 z-50 overflow-hidden bg-[#F5F5F5]'
      aria-label='Delvaux intro'
    >
      <button
        type='button'
        onClick={handleSkip}
        onKeyDown={handleSkipKeyDown}
        aria-label='Skip Intro'
        className='absolute top-4 right-4 z-20 cursor-pointer text-xs font-medium tracking-wide text-black uppercase md:top-5 md:right-5 md:text-[13px] lg:top-6 lg:right-6 lg:text-sm'
      >
        Skip Intro
      </button>

      <div className='absolute inset-0 z-10 flex items-center justify-center'>
        <div
          ref={logoGroupRef}
          className='flex flex-col items-center gap-3 md:gap-4 lg:gap-5'
        >
          <img
            ref={logoTopRef}
            src='/icon-logo-top.svg'
            alt=''
            className='w-[min(72vw,280px)] md:w-[min(48vw,360px)] lg:w-[min(55vw,480px)]'
          />
          <img
            ref={logoTextRef}
            src='/icon-text.svg'
            alt='DELVAUX'
            className='w-[min(82vw,420px)] md:w-[min(62vw,560px)] lg:w-[min(70vw,720px)]'
          />
        </div>
      </div>

      <div
        ref={productWrapRef}
        className='absolute inset-x-0 bottom-0 z-5 flex justify-center pb-[22vh] md:pb-[22vh] lg:pb-[25vh]'
      >
        <img
          src='/product.png'
          alt='Delvaux handbag'
          className='w-[min(58vw,240px)] md:w-[min(48vw,300px)] lg:w-[min(65vw,380px)]'
        />
      </div>

      <h1
        ref={titleRef}
        aria-label={PRODUCT_TITLE}
        className='pointer-events-none absolute bottom-3 left-1/2 z-5 inline-flex font-(family-name:--font-genath) text-[clamp(2.75rem,13vw,10rem)] leading-none tracking-[-0.03em] text-black uppercase md:-bottom-3 md:text-[clamp(3.25rem,12vw,10rem)] lg:-bottom-5 lg:text-[clamp(3.5rem,14vw,10rem)]'
      >
        {PRODUCT_TITLE.split('').map((char, index) => {
          if (char === ' ') {
            return (
              <span
                key={`space-${index}`}
                aria-hidden
                className='inline-block w-[0.28em] shrink-0'
              />
            );
          }

          return (
            <span
              key={`${char}-${index}`}
              data-char
              aria-hidden
              className='inline-block shrink-0'
            >
              {char}
            </span>
          );
        })}
      </h1>

      <div
        ref={curtainTopRef}
        className='absolute inset-x-0 top-0 z-10 h-1/2 bg-[#F5F5F5]'
        aria-hidden
      />
      <div
        ref={curtainBottomRef}
        className='absolute inset-x-0 bottom-0 z-10 h-1/2 bg-[#F5F5F5]'
        aria-hidden
      />
    </section>
  );
}
