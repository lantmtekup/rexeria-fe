'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  LetterSliderContent,
} from '../types';
import { blockBackgroundStyle } from './applyStyle';

interface LetterSliderProps {
  content: LetterSliderContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const HIDDEN = 'polygon(0 100%,100% 100%,100% 100%,0 100%)';
const SHOWN = 'polygon(0 0,100% 0,100% 100%,0 100%)';

/**
 * Letter Slider — port từ CodeGrid "product slider" (027_…, Anime.js → GSAP).
 * Mỗi slide tên sản phẩm chữ lớn; bấm next/prev → ảnh bay ngang + xoay, chữ mở
 * từng ký tự bằng clip-path (stagger).
 *
 * Tôn trọng reduced-motion (đổi slide tức thì). Cleanup tween.
 */
export function LetterSlider({
  content,
  background,
  className,
}: LetterSliderProps) {
  const slides = content.slides ?? [];
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [cur, setCur] = React.useState(0);
  const animating = React.useRef(false);

  const go = (dir: 1 | -1) => {
    if (animating.current || slides.length < 2) return;
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const next = (cur + dir + slides.length) % slides.length;
    const curEl = root.querySelector<HTMLElement>(`[data-ls="${cur}"]`);
    const nextEl = root.querySelector<HTMLElement>(`[data-ls="${next}"]`);
    if (!curEl || !nextEl) return;

    if (reduce) {
      setCur(next);
      return;
    }
    animating.current = true;
    const curCard = curEl.querySelector('.ls-card');
    const curLetters = curEl.querySelectorAll('.ls-letter');
    const nextCard = nextEl.querySelector('.ls-card');
    const nextLetters = nextEl.querySelectorAll('.ls-letter');

    const tl = gsap.timeline({
      onComplete: () => {
        animating.current = false;
        setCur(next);
      },
    });
    // OUT slide hiện tại.
    tl.to(curCard, {
      xPercent: dir > 0 ? -120 : 120,
      rotation: -30,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.in',
    })
      .to(
        curLetters,
        { clipPath: HIDDEN, duration: 0.4, stagger: 0.03, ease: 'power2.in' },
        0
      )
      // IN slide kế.
      .set(nextEl, { visibility: 'visible' })
      .fromTo(
        nextCard,
        { xPercent: dir > 0 ? 120 : -120, rotation: 30, opacity: 0 },
        {
          xPercent: 0,
          rotation: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        },
        0.45
      )
      .fromTo(
        nextLetters,
        { clipPath: HIDDEN, yPercent: 60 },
        {
          clipPath: SHOWN,
          yPercent: 0,
          duration: 0.6,
          stagger: 0.04,
          ease: 'power3.out',
        },
        0.6
      );
  };

  return (
    <div
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden rounded-md bg-neutral-950 duration-500 ease-out',
        className
      )}
    >
      {slides.map((s, i) => (
        <div
          key={i}
          data-ls={i}
          className='absolute inset-0 flex items-center justify-center'
          style={{ visibility: i === cur ? 'visible' : 'hidden' }}
        >
          <div className='ls-card relative h-80 w-60 overflow-hidden rounded-xl @2xl:h-96 @2xl:w-72'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.imageUrl}
              alt={s.title}
              className='h-full w-full object-cover'
            />
          </div>
          <h2 className='absolute flex flex-wrap justify-center text-5xl font-bold tracking-tight text-white uppercase mix-blend-difference @2xl:text-8xl'>
            {Array.from(s.title).map((ch, j) =>
              ch === ' ' ? (
                <span key={j} className='w-[0.25em]' />
              ) : (
                <span
                  key={j}
                  className='ls-letter inline-block'
                  style={{ clipPath: i === cur ? SHOWN : HIDDEN }}
                >
                  {ch}
                </span>
              )
            )}
          </h2>
        </div>
      ))}

      <button
        type='button'
        aria-label='Trước'
        onClick={() => go(-1)}
        className='absolute left-4 z-[3] grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20'
      >
        <ChevronLeft className='size-5' />
      </button>
      <button
        type='button'
        aria-label='Sau'
        onClick={() => go(1)}
        className='absolute right-4 z-[3] grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20'
      >
        <ChevronRight className='size-5' />
      </button>
    </div>
  );
}
