'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  LetterSliderContent,
  LetterSliderSlide,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { LETTER_SLIDER_DEFAULT_SLIDES } from './_registry/defs/letterSlider';
import { useLandingMotion } from '../motion/LandingMotion';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface LetterSliderProps {
  content: LetterSliderContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const HIDDEN_BOTTOM = 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)';
const HIDDEN_TOP = 'polygon(0 0, 100% 0, 100% 0, 0 0)';
const SHOWN = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';

const DISPLAY_FONT =
  "'Melodrama', 'Cormorant Garamond', Georgia, 'Times New Roman', serif";

const ArrowIcon = ({ className }: { className?: string }) => (
  <svg viewBox='0 0 50 9' className={className} aria-hidden>
    <path
      d='m0 4.5 5-3m-5 3 5 3m45-3h-77'
      fill='none'
      stroke='currentColor'
      strokeWidth='1'
    />
  </svg>
);

const resolveSlides = (
  raw: LetterSliderSlide[] | undefined
): LetterSliderSlide[] => {
  if (!Array.isArray(raw) || raw.length === 0) {
    return LETTER_SLIDER_DEFAULT_SLIDES.map(s => ({ ...s }));
  }
  return raw.map((slide, i) => {
    const fallback =
      LETTER_SLIDER_DEFAULT_SLIDES[i % LETTER_SLIDER_DEFAULT_SLIDES.length] ??
      LETTER_SLIDER_DEFAULT_SLIDES[0];
    return {
      title: slide.title?.trim() || fallback.title || `Slide ${i + 1}`,
      imageUrl: slide.imageUrl?.trim() || fallback.imageUrl || '',
      imageAlt:
        slide.imageAlt?.trim() || slide.title?.trim() || fallback.imageAlt,
    };
  });
};

/**
 * Letter Slider — port từ CodeGrid PRODUCT SLIDER (027, Anime.js → GSAP).
 * Mỗi slide: card ảnh + tên chữ lớn; next/prev → ảnh bay ngang + xoay,
 * chữ mở từng ký tự bằng clip-path stagger.
 *
 * Canvas: grid tất cả slide (edit). Preview + /p: composition gốc + motion.
 */
export function LetterSlider({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: LetterSliderProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  // Click-driven GSAP (no ScrollTrigger) — still join host motion tree for /p.
  useLandingMotion();
  const isMobile = useContainerMobile(rootRef);
  const isCanvas = useIsCanvasEdit(rootRef);
  const [cur, setCur] = React.useState(0);
  const curRef = React.useRef(0);
  const animating = React.useRef(false);
  const tlRef = React.useRef<gsap.core.Timeline | null>(null);
  const dirForward = React.useRef(true);

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

  React.useEffect(() => {
    curRef.current = cur;
  }, [cur]);

  React.useEffect(() => {
    if (cur >= slides.length) setCur(0);
  }, [slides.length, cur]);

  /** Init off-screen cards / hidden letters (preview + /p only). */
  React.useLayoutEffect(() => {
    if (isCanvas) return;
    const root = rootRef.current;
    if (!root) return;

    const items = root.querySelectorAll<HTMLElement>('[data-ls]');
    items.forEach((item, index) => {
      const card = item.querySelector<HTMLElement>('.ls-card');
      const letters = item.querySelectorAll<HTMLElement>('.ls-letter');
      if (index === curRef.current) {
        gsap.set(item, { autoAlpha: 1 });
        if (card) gsap.set(card, { x: 0, rotation: 0, opacity: 1 });
        if (letters.length) gsap.set(letters, { clipPath: SHOWN, y: 0 });
        return;
      }
      gsap.set(item, { autoAlpha: 0 });
      if (card) {
        gsap.set(card, {
          x: root.offsetWidth || 800,
          rotation: 40,
          opacity: 1,
        });
      }
      if (letters.length) {
        gsap.set(letters, { clipPath: HIDDEN_BOTTOM, y: 0 });
      }
    });

    return () => {
      tlRef.current?.kill();
      tlRef.current = null;
      animating.current = false;
    };
  }, [isCanvas, slides.length]);

  const go = (dir: 1 | -1) => {
    if (isCanvas || animating.current || slides.length < 2) return;
    const root = rootRef.current;
    if (!root) return;

    if (dir > 0) dirForward.current = true;
    else dirForward.current = false;
    const forward = dirForward.current;

    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const from = curRef.current;
    const next = (from + dir + slides.length) % slides.length;
    const curEl = root.querySelector<HTMLElement>(`[data-ls="${from}"]`);
    const nextEl = root.querySelector<HTMLElement>(`[data-ls="${next}"]`);
    if (!curEl || !nextEl) return;

    if (reduce) {
      gsap.set(curEl, { autoAlpha: 0 });
      gsap.set(nextEl, { autoAlpha: 1 });
      const nextCard = nextEl.querySelector<HTMLElement>('.ls-card');
      const nextLetters = nextEl.querySelectorAll<HTMLElement>('.ls-letter');
      if (nextCard) gsap.set(nextCard, { x: 0, rotation: 0 });
      if (nextLetters.length) gsap.set(nextLetters, { clipPath: SHOWN, y: 0 });
      setCur(next);
      return;
    }

    animating.current = true;
    tlRef.current?.kill();

    const w = root.offsetWidth || 800;
    const curCard = curEl.querySelector<HTMLElement>('.ls-card');
    const curLetters = curEl.querySelectorAll<HTMLElement>('.ls-letter');
    const nextCard = nextEl.querySelector<HTMLElement>('.ls-card');
    const nextLetters = nextEl.querySelectorAll<HTMLElement>('.ls-letter');

    const outX = forward ? -w : w;
    const inFromX = forward ? w : -w;
    const outY = forward ? '-1em' : '1em';
    const inFromY = forward ? '1em' : '-1em';

    if (nextCard) {
      gsap.set(nextCard, { x: inFromX, rotation: 40, opacity: 1 });
    }
    if (nextLetters.length) {
      gsap.set(nextLetters, { clipPath: HIDDEN_TOP, y: inFromY });
    }
    gsap.set(nextEl, { autoAlpha: 1 });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(curEl, { autoAlpha: 0 });
        animating.current = false;
        setCur(next);
      },
    });
    tlRef.current = tl;

    if (curCard) {
      tl.to(
        curCard,
        {
          x: outX,
          rotation: -40,
          duration: 1,
          ease: 'power4.inOut',
        },
        0
      );
    }
    if (curLetters.length) {
      tl.to(
        curLetters,
        {
          clipPath: HIDDEN_BOTTOM,
          y: outY,
          duration: 1,
          stagger: 0.04,
          ease: 'power4.inOut',
        },
        0
      );
    }

    const inAt = 0.5;
    if (nextCard) {
      tl.to(
        nextCard,
        {
          x: 0,
          rotation: 0,
          duration: 1,
          ease: 'expo.out',
        },
        inAt
      );
    }
    if (nextLetters.length) {
      tl.to(
        nextLetters,
        {
          clipPath: SHOWN,
          y: 0,
          duration: 1,
          stagger: 0.04,
          ease: 'expo.out',
        },
        inAt
      );
    }
  };

  const titleBase = (): React.CSSProperties => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    margin: 0,
    fontFamily: DISPLAY_FONT,
    fontSize: isMobile
      ? 'clamp(2.5rem, 14cqi, 4.5rem)'
      : 'clamp(3.5rem, 10cqi, 8rem)',
    fontWeight: 400,
    color: '#fff',
    textTransform: 'uppercase',
    lineHeight: 1.5,
    zIndex: 2,
    whiteSpace: 'nowrap',
    pointerEvents: 'auto',
  });

  const cardBase = (): React.CSSProperties => ({
    position: 'relative',
    height: isMobile ? 'min(280px, 70cqi)' : 'min(400px, 55cqi)',
    width: isMobile ? 'min(210px, 52cqi)' : 'min(300px, 40cqi)',
    zIndex: 1,
  });

  const imgBase = (): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transform: 'scale(1.2)',
  });

  const navBtnBase = (side: 'prev' | 'next'): React.CSSProperties => ({
    position: 'absolute',
    zIndex: 3,
    width: '2rem',
    height: '2rem',
    color: '#fff',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    padding: 0,
    ...(side === 'prev'
      ? {
          top: isMobile ? '1.5rem' : '4rem',
          left: isMobile ? '1.5rem' : '4rem',
          transform: 'scale(2)',
        }
      : {
          bottom: isMobile ? '1.5rem' : '4rem',
          right: isMobile ? '1.5rem' : '4rem',
          transform: 'scale(2) rotate(180deg)',
        }),
  });

  const renderLetters = (title: string, visible: boolean) =>
    Array.from(title).map((ch, j) =>
      ch === ' ' ? (
        <span key={j} className='inline-block w-[0.35em]' aria-hidden />
      ) : (
        <span
          key={j}
          className='ls-letter inline-block'
          style={{ clipPath: visible ? SHOWN : HIDDEN_BOTTOM }}
        >
          {ch}
        </span>
      )
    );

  // ── Editor canvas: flat grid, mọi title/ảnh chọn được ──
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        className={cn('@container relative w-full', className)}
        style={composeStyle(
          { backgroundColor: '#1a1a1a', minHeight: 320, padding: '1.5rem' },
          blockBackgroundStyle(background)
        )}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&display=swap');`}</style>
        <div className='grid grid-cols-1 gap-6 @2xl:grid-cols-2'>
          {slides.map((s, i) => {
            const titleKey = `slides[${i}].title`;
            const imgKey = `slides[${i}].imageUrl`;
            return (
              <div
                key={`${titleKey}-${imgKey}`}
                className='relative flex min-h-55 flex-col items-center justify-center gap-4 overflow-hidden'
              >
                <div className='relative' style={{ height: 180, width: 135 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.imageUrl}
                    alt={s.imageAlt || s.title}
                    data-element-key={imgKey}
                    className={selectableClass(
                      activeKey === imgKey,
                      'h-full w-full object-contain'
                    )}
                    style={composeStyle(
                      { objectFit: 'contain' },
                      styleOf(imgKey)
                    )}
                    draggable={false}
                  />
                </div>
                <p
                  data-element-key={titleKey}
                  className={selectableClass(activeKey === titleKey)}
                  style={composeStyle(
                    {
                      margin: 0,
                      fontFamily: DISPLAY_FONT,
                      fontSize: 'clamp(1.25rem, 4cqi, 2rem)',
                      fontWeight: 400,
                      color: '#fff',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      lineHeight: 1.3,
                    },
                    styleOf(titleKey)
                  )}
                >
                  {s.title}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p: stacked slides + card/letter motion ──
  return (
    <section
      ref={rootRef}
      className={cn('@container relative w-full overflow-hidden', className)}
      style={composeStyle(
        {
          backgroundColor: '#1a1a1a',
          minHeight: isMobile ? '70vh' : '100vh',
          height: isMobile ? 'min(70vh, 640px)' : 'min(100vh, 900px)',
        },
        blockBackgroundStyle(background)
      )}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&display=swap');`}</style>

      {slides.map((s, i) => {
        const titleKey = `slides[${i}].title`;
        const imgKey = `slides[${i}].imageUrl`;
        const active = i === cur;
        return (
          <div
            key={`${titleKey}-${imgKey}`}
            data-ls={i}
            className='absolute inset-0 flex items-center justify-center overflow-hidden'
            style={{
              pointerEvents: active ? 'auto' : 'none',
              visibility: active ? 'visible' : 'hidden',
            }}
          >
            <div className='ls-card' style={cardBase()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.imageUrl}
                alt={s.imageAlt || s.title}
                data-element-key={imgKey}
                className={selectableClass(activeKey === imgKey, 'ls-card-bg')}
                style={composeStyle(imgBase(), styleOf(imgKey))}
                draggable={false}
              />
            </div>
            <p
              data-element-key={titleKey}
              className={selectableClass(activeKey === titleKey)}
              style={composeStyle(titleBase(), styleOf(titleKey))}
            >
              <span className='inline-block whitespace-nowrap'>
                {renderLetters(s.title, active)}
              </span>
            </p>
          </div>
        );
      })}

      <button
        type='button'
        aria-label='Trước'
        onClick={() => go(-1)}
        className='ls-prev'
        style={navBtnBase('prev')}
      >
        <ArrowIcon className='h-full w-full' />
      </button>
      <button
        type='button'
        aria-label='Sau'
        onClick={() => go(1)}
        className='ls-next'
        style={navBtnBase('next')}
      >
        <ArrowIcon className='h-full w-full' />
      </button>
    </section>
  );
}
