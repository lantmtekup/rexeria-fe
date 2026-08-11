'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  CgModularSliderContent,
  CgModularSliderSlide,
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
import { CG_MODULAR_SLIDER_DEFAULT_SLIDES } from './_registry/defs/cgModularSlider';
import { useLandingMotion } from '../motion/LandingMotion';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface CgModularSliderProps {
  content: CgModularSliderContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const REVEAL_FROM = 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)';
const REVEAL_TO = 'polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%)';

const CLIP_TOP_DESKTOP = 'polygon(85% 0%, 0% 0%, 0% 50%, 85% 50%)';
const CLIP_BOTTOM_DESKTOP = 'polygon(100% 50%, 15% 50%, 15% 100%, 100% 100%)';
const CLIP_TOP_HOVER = 'polygon(90% 0%, 10% 0%, 10% 50%, 90% 50%)';
const CLIP_BOTTOM_HOVER = 'polygon(90% 50%, 10% 50%, 10% 100%, 90% 100%)';
const CLIP_FULL = 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)';

/** Số title hiển thị cùng lúc trên viewport (source: 300vw / 9 cells ≈ 3). */
const VISIBLE_TITLE_SLOTS = 3;

const DISPLAY_FONT =
  "'Circular Std', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const resolveSlides = (
  raw: CgModularSliderSlide[] | undefined
): CgModularSliderSlide[] => {
  if (!Array.isArray(raw) || raw.length === 0) {
    return CG_MODULAR_SLIDER_DEFAULT_SLIDES.map(s => ({ ...s }));
  }
  return raw.map((slide, i) => {
    const fallback =
      CG_MODULAR_SLIDER_DEFAULT_SLIDES[
        i % CG_MODULAR_SLIDER_DEFAULT_SLIDES.length
      ] ?? CG_MODULAR_SLIDER_DEFAULT_SLIDES[0];
    return {
      title: slide.title?.trim() || fallback.title || `Slide ${i + 1}`,
      imageUrl: slide.imageUrl?.trim() || fallback.imageUrl || '',
      imageAlt:
        slide.imageAlt?.trim() || slide.title?.trim() || fallback.imageAlt,
    };
  });
};

const trimExcessImages = (container: HTMLElement | null, max = 5) => {
  if (!container) return;
  const images = Array.from(container.querySelectorAll('img'));
  const excess = images.length - max;
  if (excess > 0) {
    images.slice(0, excess).forEach(img => img.remove());
  }
};

/**
 * Modular Carousel — port CodeGrid cg-modular-slider (164).
 * Title strip trượt ngang + ảnh cắt đôi giữa màn; click anywhere để next.
 * Canvas: grid phẳng. Preview + /p: composition + GSAP gốc.
 */
export function CgModularSlider({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CgModularSliderProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const titlesRef = React.useRef<HTMLDivElement>(null);
  const imgTopRef = React.useRef<HTMLDivElement>(null);
  const imgBottomRef = React.useRef<HTMLDivElement>(null);
  const animating = React.useRef(false);
  const currentIndexRef = React.useRef(0);

  useLandingMotion();
  const isMobile = useContainerMobile(rootRef);
  const isCanvas = useIsCanvasEdit(rootRef);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [stageHover, setStageHover] = React.useState(false);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const slides = React.useMemo(
    () => resolveSlides(content.slides),
    [content.slides]
  );

  const titleCells = React.useMemo(() => {
    if (slides.length === 0) return [];
    const clones =
      slides.length >= 2 ? [slides[0], slides[1]] : [slides[0], slides[0]];
    return [...slides, ...clones];
  }, [slides]);

  const stepPercent = titleCells.length > 0 ? 100 / titleCells.length : 100;

  /** Strip rộng (N/3)×100% section → mỗi cell ≈ 33% viewport, 3 title cùng lúc. */
  const titleStripWidthPercent =
    titleCells.length > 0
      ? (titleCells.length / VISIBLE_TITLE_SLOTS) * 100
      : 100;

  React.useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  React.useEffect(() => {
    if (currentIndex >= slides.length) setCurrentIndex(0);
  }, [slides.length, currentIndex]);

  const revealImage = React.useCallback((imageUrl: string, alt: string) => {
    const top = imgTopRef.current;
    const bottom = imgBottomRef.current;
    if (!top || !bottom || !imageUrl) return;

    const mk = () => {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = alt;
      img.draggable = false;
      img.style.position = 'absolute';
      img.style.top = '0';
      img.style.left = '0';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.clipPath = REVEAL_FROM;
      img.style.transform = 'scale(2)';
      return img;
    };

    const imgTop = mk();
    const imgBottom = mk();
    top.appendChild(imgTop);
    bottom.appendChild(imgBottom);

    gsap.to([imgTop, imgBottom], {
      clipPath: REVEAL_TO,
      transform: 'scale(1)',
      duration: 2,
      ease: 'power4.out',
      stagger: 0.15,
      onComplete: () => {
        trimExcessImages(top);
        trimExcessImages(bottom);
      },
    });
  }, []);

  /** Init first image + title position (preview + /p). */
  React.useLayoutEffect(() => {
    if (isCanvas) return;
    const root = rootRef.current;
    const titles = titlesRef.current;
    if (!root || !titles || slides.length === 0) return;

    gsap.set(titles, { x: `${-currentIndexRef.current * stepPercent}%` });

    const first = slides[0];
    if (first?.imageUrl) {
      [imgTopRef.current, imgBottomRef.current].forEach(container => {
        if (!container) return;
        container.querySelectorAll('img').forEach(img => img.remove());
        const img = document.createElement('img');
        img.src = first.imageUrl;
        img.alt = first.imageAlt || first.title;
        img.draggable = false;
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        container.appendChild(img);
      });
    }

    return () => {
      gsap.killTweensOf(titles);
    };
  }, [isCanvas, slides, stepPercent]);

  const handleAdvance = React.useCallback(() => {
    if (isCanvas || animating.current || slides.length < 2) return;
    const titles = titlesRef.current;
    if (!titles) return;

    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const from = currentIndexRef.current;
    const next = (from + 1) % slides.length;
    const wrap = from === slides.length - 1 && next === 0;

    if (reduce) {
      setCurrentIndex(next);
      gsap.set(titles, { x: `${-next * stepPercent}%` });
      const slide = slides[next];
      if (slide?.imageUrl) {
        [imgTopRef.current, imgBottomRef.current].forEach(container => {
          if (!container) return;
          container.querySelectorAll('img').forEach(img => img.remove());
          const img = document.createElement('img');
          img.src = slide.imageUrl;
          img.alt = slide.imageAlt || slide.title;
          img.draggable = false;
          img.style.position = 'absolute';
          img.style.inset = '0';
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          container.appendChild(img);
        });
      }
      return;
    }

    animating.current = true;
    const targetVisual = wrap ? slides.length : next;

    gsap.to(titles, {
      x: `${-targetVisual * stepPercent}%`,
      duration: 2,
      ease: 'power4.out',
      onStart: () => {
        window.setTimeout(() => setCurrentIndex(next), 100);
        const slide = slides[next];
        if (slide?.imageUrl) {
          revealImage(slide.imageUrl, slide.imageAlt || slide.title);
        }
      },
      onComplete: () => {
        if (wrap) {
          gsap.set(titles, { x: '0%' });
        }
        animating.current = false;
      },
    });
  }, [isCanvas, revealImage, slides, stepPercent]);

  const titleBase = (active: boolean): React.CSSProperties => ({
    margin: 0,
    textAlign: 'center',
    fontFamily: DISPLAY_FONT,
    fontSize: isMobile
      ? 'clamp(18px, 4.5cqi, 24px)'
      : 'clamp(20px, 3cqi, 28px)',
    fontWeight: 400,
    color: active ? '#fff' : 'rgba(255, 255, 255, 0.2)',
    opacity: isMobile ? (active ? 1 : 0) : 1,
    whiteSpace: 'nowrap',
    transition: 'color 0.25s ease, opacity 0.25s ease',
    pointerEvents: 'none',
  });

  const stageClipTop = isMobile
    ? CLIP_FULL
    : stageHover
      ? CLIP_TOP_HOVER
      : CLIP_TOP_DESKTOP;
  const stageClipBottom = isMobile
    ? CLIP_FULL
    : stageHover
      ? CLIP_BOTTOM_HOVER
      : CLIP_BOTTOM_DESKTOP;

  // ── Editor canvas: flat grid ──
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        className={cn('@container relative w-full', className)}
        style={composeStyle(
          { backgroundColor: '#0f0f0f', minHeight: 320, padding: '1.5rem' },
          blockBackgroundStyle(background)
        )}
      >
        <div className='grid grid-cols-1 gap-6 @2xl:grid-cols-2'>
          {slides.map((s, i) => {
            const titleKey = `slides[${i}].title`;
            const imgKey = `slides[${i}].imageUrl`;
            return (
              <div
                key={`${titleKey}-${imgKey}`}
                className='relative flex min-h-55 flex-col items-center justify-center gap-4 overflow-hidden'
              >
                <div
                  className='relative overflow-hidden'
                  style={{ height: 200, width: isMobile ? '100%' : 220 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.imageUrl}
                    alt={s.imageAlt || s.title}
                    data-element-key={imgKey}
                    className={selectableClass(
                      activeKey === imgKey,
                      'h-full w-full object-cover'
                    )}
                    style={composeStyle(
                      { objectFit: 'cover' },
                      styleOf(imgKey)
                    )}
                    draggable={false}
                  />
                </div>
                <h2
                  data-element-key={titleKey}
                  className={selectableClass(activeKey === titleKey)}
                  style={composeStyle(
                    {
                      margin: 0,
                      fontFamily: DISPLAY_FONT,
                      fontSize: 'clamp(1rem, 3cqi, 1.5rem)',
                      fontWeight: 400,
                      color: '#fff',
                      textAlign: 'center',
                      lineHeight: 1.3,
                    },
                    styleOf(titleKey)
                  )}
                >
                  {s.title}
                </h2>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p ──
  return (
    <section
      ref={rootRef}
      role='button'
      tabIndex={0}
      aria-label='Chuyển slide carousel'
      onClick={handleAdvance}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAdvance();
        }
      }}
      className={cn(
        '@container relative w-full cursor-pointer overflow-hidden',
        className
      )}
      style={composeStyle(
        {
          backgroundColor: '#0f0f0f',
          minHeight: isMobile ? 'min(100cqi, 640px)' : 'min(100cqi, 900px)',
          height: isMobile ? 'min(100cqi, 640px)' : 'min(100cqi, 900px)',
        },
        blockBackgroundStyle(background)
      )}
    >
      <div
        ref={titlesRef}
        className='cms-title-strip pointer-events-none absolute top-0 left-0 z-2 flex h-full'
        style={{
          width: `${titleStripWidthPercent}%`,
        }}
      >
        {titleCells.map((s, i) => {
          const slideIndex = i < slides.length ? i : i - slides.length;
          const titleKey = `slides[${slideIndex}].title`;
          const active = slideIndex === currentIndex;
          return (
            <div
              key={`title-${i}-${s.title}`}
              className='flex h-full flex-1 items-center justify-center'
            >
              <h1
                data-element-key={titleKey}
                className={selectableClass(activeKey === titleKey, 'cms-title')}
                style={composeStyle(titleBase(active), styleOf(titleKey))}
              >
                {s.title}
              </h1>
            </div>
          );
        })}
      </div>

      <div
        className='cms-stage absolute top-1/2 left-1/2 z-1 -translate-x-1/2 -translate-y-1/2'
        style={{
          width: isMobile ? '100%' : 'min(550px, 85cqi)',
          height: isMobile ? '100%' : 'min(500px, 78cqi)',
          opacity: 0.5,
          pointerEvents: 'all',
        }}
        onMouseEnter={() => {
          if (!isMobile) setStageHover(true);
        }}
        onMouseLeave={() => setStageHover(false)}
      >
        <div
          ref={imgTopRef}
          className='cms-img-top absolute h-full w-full'
          style={{
            clipPath: stageClipTop,
            transition: 'clip-path 1s cubic-bezier(0.075, 0.82, 0.165, 1)',
          }}
        />
        <div
          ref={imgBottomRef}
          className='cms-img-bottom absolute h-full w-full'
          style={{
            clipPath: stageClipBottom,
            transition: 'clip-path 1s cubic-bezier(0.075, 0.82, 0.165, 1)',
          }}
        />
      </div>
    </section>
  );
}
