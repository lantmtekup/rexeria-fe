'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

import { ARPEGGIO_HERO_V2_BG } from '@/assets/images/arpeggio_hero_v2';
import {
  FlashFramerArpeggioHeroV2,
  FLASH_TOTAL_DURATION,
} from '@/components/molecules/FlashFramerArpeggioHeroV2';
import { cn } from '@/lib/cn';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerArpeggioHeroV2Content,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

gsap.registerPlugin(useGSAP);

const LightRays = dynamic(() => import('@/components/molecules/LightRays'), {
  ssr: false,
});

const INTRO_BG_START_SCALE = 1.5;
const INTRO_WORDMARK_START_SCALE = 0.68;
const INTRO_BG_DURATION = FLASH_TOTAL_DURATION + 1.75;
const INTRO_WORDMARK_DURATION = FLASH_TOTAL_DURATION + 2;
const INTRO_EASE = 'power4.out';

const COPY_INTRO_DURATION = 0.85;
const COPY_INTRO_EASE = 'power3.out';

const GRID_COLS = 4;
const GRID_ROWS = 4;
const GRID_BURST_DURATION = 0.75;
const GRID_BURST_STAGGER = 0.35;
const GRID_BURST_EASE = 'power3.out';

const ACCENT = '#FF4D2E';
const HERO_LIGHT_RAYS_COLOR = '#F8FEFF';

const HERO_LIGHT_RAYS_SHARED = {
  raysColor: HERO_LIGHT_RAYS_COLOR,
  raysSpeed: 1.2,
  lightSpread: 0.88,
  rayLength: 2.5,
  fadeDistance: 2.1,
  saturation: 1,
  followMouse: false,
  noiseAmount: 0,
  distortion: 0.05,
  rayIntensity: 1.45,
} as const;

type HeroLightRaysConfig = {
  raysColor: string;
  raysSpeed: number;
  lightSpread: number;
  rayLength: number;
  fadeDistance: number;
  saturation: number;
  followMouse: boolean;
  noiseAmount: number;
  distortion: number;
  rayIntensity: number;
};

/** Container tiers — canvas-block-responsive-spec: mobile <672 · tablet @2xl · desktop @4xl */
const CONTAINER_TABLET_PX = 672;
const CONTAINER_DESKTOP_PX = 896;

/** Mobile only — subtle reach boost; tablet/desktop use shared defaults unchanged */
const getHeroLightRaysConfig = (
  containerWidth: number
): HeroLightRaysConfig => {
  if (containerWidth > 0 && containerWidth < CONTAINER_TABLET_PX) {
    return {
      ...HERO_LIGHT_RAYS_SHARED,
      lightSpread: 0.93,
      rayLength: 2.85,
      fadeDistance: 2.35,
      rayIntensity: 1.68,
    };
  }
  return HERO_LIGHT_RAYS_SHARED;
};

const CONTENT_SHELL_X = 'px-5 @2xl:px-10 @4xl:px-20';
const CONTENT_SHELL = cn('mx-auto w-full max-w-[1440px]', CONTENT_SHELL_X);

const getFlashColumnCount = (containerWidth: number) => {
  if (containerWidth < CONTAINER_TABLET_PX) return 4;
  if (containerWidth < CONTAINER_DESKTOP_PX) return 5;
  return 9;
};

const HERO_WORDMARK_MAX_DESKTOP_PX = 320;
const HERO_WORDMARK_MAX_TABLET_PX = 200;
const HERO_WORDMARK_MAX_MOBILE_PX = 128;
const HERO_WORDMARK_MIN_PX = 32;

const getWordmarkBounds = (containerWidth: number) => {
  if (containerWidth < CONTAINER_TABLET_PX) {
    return { max: HERO_WORDMARK_MAX_MOBILE_PX, min: HERO_WORDMARK_MIN_PX };
  }
  if (containerWidth < CONTAINER_DESKTOP_PX) {
    return { max: HERO_WORDMARK_MAX_TABLET_PX, min: HERO_WORDMARK_MIN_PX };
  }
  return { max: HERO_WORDMARK_MAX_DESKTOP_PX, min: HERO_WORDMARK_MIN_PX };
};

const getCopyIntroY = (containerWidth: number) =>
  containerWidth < CONTAINER_TABLET_PX ? 36 : 56;

const getWordmarkIntroY = (containerWidth: number) =>
  containerWidth < CONTAINER_TABLET_PX ? -18 : -28;

const HEADLINE_STYLE: React.CSSProperties = {
  fontWeight: 500,
  lineHeight: '1.05em',
  color: '#ffffff',
  margin: 0,
};

const SUBTITLE_STYLE: React.CSSProperties = {
  fontWeight: 500,
  color: '#ffffff',
  margin: 0,
};

const AGENCY_LABEL_STYLE: React.CSSProperties = {
  fontFamily: '"Playfair Display", Georgia, "Times New Roman", serif',
  fontWeight: 400,
  color: '#ffffff',
  margin: 0,
  letterSpacing: '-0.01em',
  lineHeight: 1.15,
};

const HERO_WORDMARK_STYLE: React.CSSProperties = {
  fontWeight: 700,
  lineHeight: 1.05,
  color: ACCENT,
  margin: 0,
  width: '100%',
  maxWidth: '100%',
  textAlign: 'justify',
  textAlignLast: 'justify',
};

const HEADER_WORDMARK_STYLE: React.CSSProperties = {
  fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
  fontSize: '28px',
  fontWeight: 600,
  lineHeight: 1,
  letterSpacing: '-0.03em',
  color: ACCENT,
  margin: 0,
  whiteSpace: 'nowrap',
};

type ArpeggioWordmarkVariant = 'hero' | 'header';

interface FramerArpeggioHeroV2Props {
  content: FramerArpeggioHeroV2Content;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

interface ArpeggioHeroBackgroundProps {
  backgroundUrl: string;
  activeKey?: string | null;
  styleOf: (key: string) => React.CSSProperties | undefined;
  mediaRef?: React.Ref<HTMLDivElement>;
  containerWidth: number;
}

interface ArpeggioHeroCopyProps {
  content: FramerArpeggioHeroV2Content;
  activeKey?: string | null;
  styleOf: (key: string) => React.CSSProperties | undefined;
  ref?: React.Ref<HTMLDivElement>;
}

interface ArpeggioWordmarkProps {
  wordmark: string;
  suffix?: string;
  variant?: ArpeggioWordmarkVariant;
  activeKey?: string | null;
  styleOf: (key: string) => React.CSSProperties | undefined;
  ref?: React.Ref<HTMLDivElement>;
  className?: string;
  introTextRef?: React.Ref<HTMLHeadingElement>;
}

interface ArpeggioGridOverlayProps {
  flashDone: boolean;
}

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

const ArpeggioHeroBackground = ({
  backgroundUrl,
  activeKey,
  styleOf,
  mediaRef,
  containerWidth,
}: ArpeggioHeroBackgroundProps) => {
  const src = backgroundUrl || ARPEGGIO_HERO_V2_BG;
  const lightRays = getHeroLightRaysConfig(containerWidth);

  return (
    <div className='absolute inset-0 z-0'>
      <div
        ref={mediaRef}
        data-element-key='backgroundUrl'
        style={styleOf('backgroundUrl')}
        className={selectableClass(
          activeKey === 'backgroundUrl',
          'absolute inset-0 origin-center overflow-hidden will-change-transform'
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=''
          className='absolute inset-0 z-0 block size-full object-cover'
        />
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 z-[1]',
            'opacity-100 mix-blend-screen',
            'mask-[linear-gradient(to_bottom,black_0%,black_76%,transparent_100%)]',
            '@2xl:mask-[linear-gradient(to_bottom,black_0%,black_70%,transparent_100%)]'
          )}
        >
          <LightRays
            {...lightRays}
            className='absolute inset-0'
            raysOrigin='top-right'
          />
          <LightRays
            {...lightRays}
            className='absolute inset-0'
            raysOrigin='top-left'
          />
        </div>
      </div>
    </div>
  );
};

const ArpeggioPlusMark = () => (
  <span
    aria-hidden
    className='relative block size-2.5 shrink-0 @2xl:size-3.5 @4xl:size-5'
  >
    <span className='absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 bg-white/65' />
    <span className='absolute top-0 left-1/2 h-full w-[2px] -translate-x-1/2 bg-white/65' />
  </span>
);

const ArpeggioGridOverlay = ({ flashDone }: ArpeggioGridOverlayProps) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const flashDoneRef = React.useRef(flashDone);

  React.useEffect(() => {
    flashDoneRef.current = flashDone;
  }, [flashDone]);

  const convergeMarks = React.useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const marks = gsap.utils.toArray<HTMLElement>('[data-grid-plus]', root);
    if (marks.length === 0) return;

    const rootRect = root.getBoundingClientRect();
    const originX = rootRect.width / 2;
    const originY = rootRect.height / 2;

    marks.forEach(mark => {
      const rect = mark.getBoundingClientRect();
      const cx = rect.left - rootRect.left + rect.width / 2;
      const cy = rect.top - rootRect.top + rect.height / 2;
      gsap.set(mark, {
        x: originX - cx,
        y: originY - cy,
        scale: 0,
        autoAlpha: 0,
        force3D: true,
      });
    });
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      convergeMarks();
    },
    { scope: rootRef }
  );

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const observer = new ResizeObserver(() => {
      if (!flashDoneRef.current) {
        convergeMarks();
      }
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [convergeMarks]);

  useGSAP(
    () => {
      if (!flashDone) return;

      const root = rootRef.current;
      if (!root) return;

      const marks = gsap.utils.toArray<HTMLElement>('[data-grid-plus]', root);
      if (marks.length === 0) return;

      if (prefersReducedMotion()) {
        gsap.set(marks, { clearProps: 'all' });
        return;
      }

      gsap
        .timeline({
          onComplete: () => {
            gsap.set(marks, { clearProps: 'transform,visibility' });
          },
        })
        .to(marks, {
          x: 0,
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: GRID_BURST_DURATION,
          ease: GRID_BURST_EASE,
          stagger: {
            amount: GRID_BURST_STAGGER,
            from: 'center',
            grid: [GRID_COLS, GRID_ROWS],
          },
        });
    },
    { scope: rootRef, dependencies: [flashDone] }
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 z-[1] grid h-full grid-cols-4 grid-rows-4 py-6 @2xl:py-10 @4xl:py-16',
        CONTENT_SHELL_X
      )}
    >
      {Array.from({ length: GRID_ROWS * GRID_COLS }, (_, index) => (
        <div
          key={index}
          data-grid-cell
          className='flex items-center justify-center'
        >
          <span data-grid-plus className='inline-flex will-change-transform'>
            <ArpeggioPlusMark />
          </span>
        </div>
      ))}
    </div>
  );
};

const ArpeggioHeroCopy = ({
  content,
  activeKey,
  styleOf,
  ref,
}: ArpeggioHeroCopyProps) => (
  <div
    ref={ref}
    className='flex flex-col justify-end gap-4 will-change-transform @2xl:flex-row @2xl:items-start @2xl:justify-between @2xl:gap-8 @3xl:flex-col @3xl:items-start @3xl:justify-start @4xl:flex-row @4xl:items-start @4xl:justify-between @4xl:gap-20'
  >
    <div className='flex w-full min-w-0 flex-col justify-end gap-6 @2xl:min-w-[min(100%,420px)] @2xl:flex-[1_1_0] @3xl:flex @3xl:flex-col @3xl:items-start @3xl:justify-start @3xl:gap-20 @4xl:gap-0'>
      <h1
        data-element-key='headline'
        style={composeStyle(HEADLINE_STYLE, styleOf('headline'))}
        className={selectableClass(
          activeKey === 'headline',
          'text-2xl @2xl:text-4xl @3xl:text-[60px] @4xl:text-[60px]'
        )}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: content.headline.replace('\n', '<br />'),
          }}
        />
      </h1>

      {content.topRightLabel ? (
        <div
          data-element-key='topRightLabel'
          style={composeStyle(AGENCY_LABEL_STYLE, styleOf('topRightLabel'))}
          className={selectableClass(
            activeKey === 'topRightLabel',
            'w-full shrink-0 text-right text-6xl @2xl:max-w-[220px] @2xl:text-right @2xl:text-3xl @3xl:max-w-[340px] @3xl:text-[60px] @4xl:hidden @4xl:max-w-[280px] @4xl:text-[48px]'
          )}
        >
          {content.topRightLabel}
        </div>
      ) : null}

      {content.subtitle ? (
        <div
          data-element-key='subtitle'
          style={styleOf('subtitle')}
          className={selectableClass(
            activeKey === 'subtitle',
            'mt-3 flex w-full max-w-full gap-2 @2xl:mt-5 @2xl:max-w-[70%] @2xl:gap-3 @4xl:max-w-[60%]'
          )}
        >
          <div
            aria-hidden
            className='mt-1 size-5 shrink-0 rounded-full border-[5px] border-[#FF4D2E] @2xl:mt-1.5 @2xl:size-4 @2xl:border-4 @3xl:size-5 @3xl:border-5 @4xl:size-6 @4xl:border-6'
          />
          <p
            style={SUBTITLE_STYLE}
            className='text-xl leading-snug @2xl:text-xl @3xl:text-[32px] @4xl:text-[30px]'
          >
            {content.subtitle}
          </p>
        </div>
      ) : null}
    </div>

    {content.topRightLabel ? (
      <div
        data-element-key='topRightLabel'
        style={composeStyle(AGENCY_LABEL_STYLE, styleOf('topRightLabel'))}
        className={selectableClass(
          activeKey === 'topRightLabel',
          'hidden w-full shrink-0 text-left text-3xl @2xl:max-w-[220px] @2xl:text-right @2xl:text-3xl @4xl:block @4xl:max-w-[280px] @4xl:text-[48px]'
        )}
      >
        {content.topRightLabel}
      </div>
    ) : null}
  </div>
);

const fitHeroWordmarkFontSize = (
  container: HTMLElement,
  textEl: HTMLElement,
  maxPx: number,
  minPx: number
) => {
  const maxWidth = container.clientWidth;
  if (maxWidth <= 0) return minPx;

  let lo = minPx;
  let hi = maxPx;
  let best = minPx;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    textEl.style.fontSize = `${mid}px`;
    if (textEl.scrollWidth <= maxWidth) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return best;
};

const ArpeggioWordmark = ({
  wordmark,
  suffix,
  variant = 'hero',
  activeKey,
  styleOf,
  ref,
  className,
  introTextRef,
}: ArpeggioWordmarkProps) => {
  const isHero = variant === 'hero';
  const containerRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLHeadingElement>(null);
  const [fittedFontSize, setFittedFontSize] = React.useState(
    HERO_WORDMARK_MAX_MOBILE_PX
  );

  const handleContainerRef = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
      return;
    }
    if (ref) {
      ref.current = node;
    }
  };

  const handleTextRef = (node: HTMLHeadingElement | null) => {
    textRef.current = node;
    if (typeof introTextRef === 'function') {
      introTextRef(node);
      return;
    }
    if (introTextRef) {
      introTextRef.current = node;
    }
  };

  React.useLayoutEffect(() => {
    if (!isHero) return;

    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const fit = () => {
      const { max, min } = getWordmarkBounds(container.clientWidth);
      const nextSize = fitHeroWordmarkFontSize(container, textEl, max, min);
      setFittedFontSize(prev => (prev === nextSize ? prev : nextSize));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [isHero, wordmark]);

  return (
    <div
      ref={handleContainerRef}
      data-arpeggio-wordmark
      data-variant={variant}
      data-element-key={isHero ? 'wordmark' : undefined}
      className={cn(
        isHero && 'w-full min-w-0 overflow-visible pb-5 @2xl:pb-8 @4xl:pb-10',
        !isHero && 'flex items-end gap-1.5',
        isHero && selectableClass(activeKey === 'wordmark'),
        className
      )}
    >
      <h2
        ref={handleTextRef}
        data-element-key={!isHero ? 'wordmark' : undefined}
        style={composeStyle(
          isHero
            ? { ...HERO_WORDMARK_STYLE, fontSize: `${fittedFontSize}px` }
            : HEADER_WORDMARK_STYLE,
          styleOf('wordmark')
        )}
        className={cn(
          !isHero && selectableClass(activeKey === 'wordmark'),
          isHero &&
            'block w-full max-w-full origin-[50%_100%] overflow-visible leading-[1.05] will-change-transform after:block after:h-0 after:w-full after:overflow-hidden after:content-[""]'
        )}
      >
        {wordmark}
      </h2>
      {!isHero && suffix ? (
        <span
          data-element-key='wordmarkSuffix'
          style={composeStyle(
            {
              fontSize: '14px',
              color: ACCENT,
              fontWeight: 600,
              alignSelf: 'flex-start',
            },
            styleOf('wordmarkSuffix')
          )}
          className={selectableClass(activeKey === 'wordmarkSuffix')}
        >
          {suffix}
        </span>
      ) : null}
    </div>
  );
};

export function FramerArpeggioHeroV2({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerArpeggioHeroV2Props) {
  const wordmarkRef = React.useRef<HTMLDivElement>(null);
  const copyRef = React.useRef<HTMLDivElement>(null);
  const backgroundMediaRef = React.useRef<HTMLDivElement>(null);
  const wordmarkTextRef = React.useRef<HTMLHeadingElement>(null);
  const sectionRef = React.useRef<HTMLElement>(null);
  const [flashDone, setFlashDone] = React.useState(false);
  const [flashColumnCount, setFlashColumnCount] = React.useState(10);
  const [sectionWidth, setSectionWidth] = React.useState(0);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const bg = backgroundMediaRef.current;
      const wordmark = wordmarkTextRef.current;
      if (!section || !bg || !wordmark) return;

      const reduce = window.matchMedia?.(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (reduce) {
        gsap.set([bg, wordmark], { clearProps: 'transform' });
        return;
      }

      const containerWidth = section.clientWidth;
      const wordmarkIntroY = getWordmarkIntroY(containerWidth);

      gsap.set(bg, {
        scale: INTRO_BG_START_SCALE,
        transformOrigin: '50% 50%',
        force3D: true,
      });
      gsap.set(wordmark, {
        scale: INTRO_WORDMARK_START_SCALE,
        y: wordmarkIntroY,
        transformOrigin: '50% 100%',
        force3D: true,
      });

      const tl = gsap.timeline({
        defaults: { ease: INTRO_EASE },
        onComplete: () => {
          gsap.set([bg, wordmark], { clearProps: 'transform' });
        },
      });

      tl.to(
        bg,
        {
          scale: 1,
          duration: INTRO_BG_DURATION,
        },
        0
      );

      tl.to(
        wordmark,
        {
          scale: 1,
          y: 0,
          duration: INTRO_WORDMARK_DURATION,
        },
        0.08
      );
    },
    { scope: sectionRef }
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      const copy = copyRef.current;
      if (!section || !copy) return;

      const reduce = window.matchMedia?.(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (reduce) return;

      gsap.set(copy, {
        y: getCopyIntroY(section.clientWidth),
        autoAlpha: 0,
        force3D: true,
      });
    },
    { scope: sectionRef }
  );

  useGSAP(
    () => {
      const copy = copyRef.current;
      if (!copy || !flashDone) return;

      const reduce = window.matchMedia?.(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (reduce) {
        gsap.set(copy, { clearProps: 'transform,opacity,visibility' });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: COPY_INTRO_EASE, duration: COPY_INTRO_DURATION },
        onComplete: () => {
          gsap.set(copy, { clearProps: 'transform,visibility' });
        },
      });

      tl.to(copy, { y: 0, autoAlpha: 1 });
    },
    { scope: sectionRef, dependencies: [flashDone] }
  );

  React.useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const update = () => {
      const width = section.clientWidth;
      const nextColumns = getFlashColumnCount(width);
      setFlashColumnCount(prev => (prev === nextColumns ? prev : nextColumns));
      setSectionWidth(prev => (prev === width ? prev : width));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  return (
    <section
      ref={sectionRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container relative flex min-h-[100dvh] w-full flex-col overflow-hidden',
        className
      )}
    >
      <ArpeggioHeroBackground
        backgroundUrl={content.backgroundUrl}
        activeKey={activeKey}
        styleOf={styleOf}
        mediaRef={backgroundMediaRef}
        containerWidth={sectionWidth}
      />
      <ArpeggioGridOverlay flashDone={flashDone} />
      <div
        className={cn(
          'relative z-[2] mb-10 flex h-full min-h-0 flex-1 flex-col @3xl:mb-5 @4xl:mb-0',
          CONTENT_SHELL
        )}
      >
        <div className='flex min-h-0 flex-1 flex-col justify-end @3xl:justify-center'>
          <ArpeggioHeroCopy
            ref={copyRef}
            content={content}
            activeKey={activeKey}
            styleOf={styleOf}
          />
        </div>
        <ArpeggioWordmark
          ref={wordmarkRef}
          wordmark={content.wordmark}
          variant='hero'
          activeKey={activeKey}
          styleOf={styleOf}
          introTextRef={wordmarkTextRef}
          className='mt-auto'
        />
      </div>
      {!flashDone ? (
        <FlashFramerArpeggioHeroV2
          columnCount={flashColumnCount}
          onComplete={() => setFlashDone(true)}
        />
      ) : null}
    </section>
  );
}
