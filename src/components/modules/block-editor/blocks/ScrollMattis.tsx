'use client';

/**
 * Scroll - Mattis — "Box Mode" scroll reveal 3 slide (ảnh, video, ảnh).
 * Khung letterbox giữa CỐ ĐỊNH (1 khung duy nhất). Cuộn → nền full-bleed (media)
 * trượt/wipe lên, media bên trong khung trượt ĐỒNG BỘ (bị khung clip). Chữ lớn
 * (bgWord) CỐ ĐỊNH trên viewport — chạy marquee ngang vô tận (CSS) và crossfade
 * theo slide cùng nhãn (số/title/categories/year).
 *
 * Motion theo contract R1-R6 (docs/landing-motion-foundation.md):
 * - dùng `useBlockMotion` (scroller từ hook, invalidateOnRefresh, auto cleanup);
 * - `requestRefresh()` sau khi media load (đo lại scrub);
 * - bail reduced-motion + mini-preview (không root) → render tĩnh slide 1;
 * - KHÔNG `gsap.registerPlugin` (LandingMotionRoot đã đăng ký ScrollTrigger).
 */

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';
import { SCROLL_MATTIS_ITEMS } from '@/assets/images/scroll_mattis';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  ScrollMattisContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
import { useContainerMobile } from './useContainerMobile';

interface ScrollMattisProps {
  content: ScrollMattisContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Film grain Framer — cố định trên sticky viewport, không cuộn theo background. */
const GRAIN_TEXTURE =
  'https://framerusercontent.com/images/rR6HYXBrMmX4cRpXfXUOvpvpB0.png';

const GRAIN_CSS = `
@keyframes scroll-mattis-grain {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 100%;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .scroll-mattis__grain {
    animation: scroll-mattis-grain 0.75s steps(5) infinite alternate;
  }
}
@keyframes scroll-mattis-word-marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
.scroll-mattis__word-track {
  animation: scroll-mattis-word-marquee 28s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .scroll-mattis__word-track {
    animation: none;
  }
}
`;

const GRAIN_STYLE: React.CSSProperties = {
  backgroundImage: `url("${GRAIN_TEXTURE}")`,
  backgroundSize: '280px 280px',
  backgroundRepeat: 'repeat',
  opacity: 0.1,
};

/** Responsive tokens — clamp giữ floor mobile, scale theo container, cap desktop. */
const RESPONSIVE = {
  wordFont: 'clamp(32px, 12cqi, 130px)',
  wordPad: 'clamp(4px, 1cqi, 12px)',
  numFont: 'clamp(10px, 1.4cqi, 18px)',
  numTop: 'clamp(-14px, -3cqi, -8px)',
  metaFont: 'clamp(9px, 1.2cqi, 14px)',
  metaMt: 'clamp(10px, 1.6cqi, 22px)',
  metaMinH: 'clamp(40px, 2.6cqi, 44px)',
  headerPad: 'clamp(12px, 2cqi, 24px)',
  headerFont: 'clamp(9px, 1.2cqi, 14px)',
} as const;

const pad2 = (n: number) => String(n).padStart(2, '0');

export function ScrollMattis({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: ScrollMattisProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const { hasRoot, requestRefresh } = useLandingMotion();
  const isMobile = useContainerMobile(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const sPortfolio = composeStyle(
    { fontSize: RESPONSIVE.headerFont },
    styleOf('portfolioLabel')
  );

  const trackHeight = isMobile ? '300dvh' : '380dvh';

  const loadedRef = React.useRef(0);
  const handleMediaLoad = () => {
    loadedRef.current += 1;
    if (loadedRef.current >= SCROLL_MATTIS_ITEMS.length) requestRefresh();
  };

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      if (!root) return;
      if (!hasRoot) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const q = (sel: string) =>
        Array.from(root.querySelectorAll<HTMLElement>(sel));
      const bgs = q('.scroll-mattis__bg');
      const media = q('.scroll-mattis__frame-media');
      const words = q('.scroll-mattis__word');
      const nums = q('.scroll-mattis__num');
      const metas = q('.scroll-mattis__meta');
      if (bgs.length === 0) return;

      // The framed media is revealed along the SAME wipe seam as the full-bleed
      // background (co-planar), so both move together instead of at different
      // rates. Measure the frame's REAL position within the stage (it is not
      // perfectly centered — the meta row below nudges it up) so the reveal
      // tracks the seam exactly: seamY = stageH * (1 - p). Reveal runs while the
      // seam crosses the box → [1 - boxBottom/stageH, 1 - boxTop/stageH].
      const stageRect = bgs[0].getBoundingClientRect();
      const stageH = stageRect.height || window.innerHeight;
      const boxRect = media[0]?.getBoundingClientRect();
      const boxTop = boxRect ? boxRect.top - stageRect.top : 0;
      const boxH = boxRect?.height || 0;
      const revealDur = boxH && stageH ? Math.min(boxH / stageH, 1) : 0.4;
      const revealStart =
        boxH && stageH
          ? Math.min(Math.max(1 - (boxTop + boxH) / stageH, 0), 1 - revealDur)
          : (1 - revealDur) / 2;
      const clipHidden = 'inset(100% 0% 0% 0%)';
      const clipShown = 'inset(0% 0% 0% 0%)';

      // Backgrounds stack fully below (100) and slide up over the current one on
      // scroll — zIndex (set in JSX) rises with index.
      gsap.set(bgs, { transformOrigin: 'center center' });
      gsap.set(bgs[0], { yPercent: 0, autoAlpha: 1 });
      gsap.set(bgs.slice(1), { yPercent: 100, autoAlpha: 1 });
      // Framed media: all visible but only the active one un-clipped.
      gsap.set(media, { autoAlpha: 1 });
      gsap.set(media[0], { clipPath: clipShown });
      gsap.set(media.slice(1), { clipPath: clipHidden });
      // The fixed big word + labels crossfade in place: only the active
      // slide's set is visible.
      gsap.set([words[0], nums[0], metas[0]], { autoAlpha: 1 });
      gsap.set([...words.slice(1), ...nums.slice(1), ...metas.slice(1)], {
        autoAlpha: 0,
      });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
      });

      const last = bgs.length - 1;
      for (let i = 0; i < last; i += 1) {
        // Background full-bleed (with its big word) slides up.
        tl.fromTo(
          bgs[i + 1],
          { yPercent: 100 },
          { yPercent: 0, duration: 1 },
          i
        );
        // Framed media reveals along the same seam line as the background wipe.
        if (media[i + 1])
          tl.fromTo(
            media[i + 1],
            { clipPath: clipHidden },
            { clipPath: clipShown, duration: revealDur },
            i + revealStart
          );
        // Big word + labels crossfade around the middle of the transition.
        tl.to(
          [words[i], nums[i], metas[i]],
          { autoAlpha: 0, duration: 0.4 },
          i + 0.3
        );
        tl.to(
          [words[i + 1], nums[i + 1], metas[i + 1]],
          { autoAlpha: 1, duration: 0.4 },
          i + 0.3
        );
      }
    },
    [isMobile]
  );

  return (
    <section
      ref={rootRef}
      style={{ height: trackHeight, ...blockBackgroundStyle(background) }}
      className={cn('@container relative w-full bg-neutral-950', className)}
    >
      <style>{GRAIN_CSS}</style>
      <div className='sticky top-0 h-dvh min-h-dvh w-full overflow-hidden bg-neutral-950'>
        {/* Backgrounds — full-bleed media + big word, slide up on scroll */}
        {SCROLL_MATTIS_ITEMS.map((slide, i) => (
          <div
            key={slide.index}
            className={cn(
              'scroll-mattis__bg absolute inset-0 overflow-hidden will-change-transform',
              i !== 0 && 'opacity-0'
            )}
            style={{ zIndex: i }}
          >
            {slide.kind === 'video' ? (
              <video
                aria-hidden='true'
                src={slide.src}
                poster={slide.poster}
                className='absolute inset-[-2%] h-[104%] w-[104%] object-cover'
                autoPlay
                muted
                loop
                playsInline
                preload='auto'
              />
            ) : (
              <div
                aria-hidden='true'
                className='absolute inset-[-2%] h-[104%] w-[104%] scale-105 bg-cover bg-center'
                style={{ backgroundImage: `url(${slide.src})` }}
              />
            )}

            <div
              aria-hidden='true'
              className='absolute inset-0 bg-neutral-950/38'
            />
          </div>
        ))}

        {/* Big word — FIXED on the sticky viewport (not scrolling with the
            background), running horizontally as an infinite marquee and
            crossfading per slide (synced with num/meta labels). */}
        <div className='pointer-events-none absolute inset-0 z-20 overflow-hidden'>
          {SCROLL_MATTIS_ITEMS.map((slide, i) => {
            const unit = `${slide.bgWord} `;
            return (
              <div
                key={slide.index}
                className={cn(
                  'scroll-mattis__word absolute inset-0 flex items-center overflow-hidden',
                  i !== 0 && 'opacity-0'
                )}
              >
                <div className='scroll-mattis__word-track flex shrink-0 whitespace-nowrap'>
                  <span
                    className='leading-none font-semibold tracking-tight text-white/90 uppercase'
                    style={{
                      fontSize: RESPONSIVE.wordFont,
                      paddingLeft: RESPONSIVE.wordPad,
                      paddingRight: RESPONSIVE.wordPad,
                    }}
                  >
                    {unit.repeat(4)}
                  </span>
                  <span
                    aria-hidden='true'
                    className='leading-none font-semibold tracking-tight text-white/90 uppercase'
                    style={{
                      fontSize: RESPONSIVE.wordFont,
                      paddingLeft: RESPONSIVE.wordPad,
                      paddingRight: RESPONSIVE.wordPad,
                    }}
                  >
                    {unit.repeat(4)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fixed frame — single letterbox window; media slides inside (synced),
            labels crossfade per slide. */}
        <div className='pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-[4cqi] pb-[5cqi] @2xl:px-0 @2xl:pb-0'>
          <div className='relative w-[82cqi] max-w-[850px] @2xl:w-[64cqi]'>
            <div className='relative isolate aspect-video w-full overflow-hidden rounded-[2px] bg-neutral-900 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'>
              {SCROLL_MATTIS_ITEMS.map((slide, i) => (
                <div
                  key={slide.index}
                  className={cn(
                    'scroll-mattis__frame-media absolute inset-0 will-change-transform',
                    i !== 0 && 'opacity-0'
                  )}
                  style={{ zIndex: i }}
                >
                  {slide.kind === 'video' ? (
                    <video
                      src={slide.src}
                      poster={slide.poster}
                      onLoadedData={handleMediaLoad}
                      className='h-full w-full object-cover contrast-[1.04] saturate-[1.06]'
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload='auto'
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={slide.src}
                      alt=''
                      onLoad={handleMediaLoad}
                      className='h-full w-full object-cover contrast-[1.04] saturate-[1.06]'
                      draggable={false}
                    />
                  )}
                </div>
              ))}
            </div>

            {SCROLL_MATTIS_ITEMS.map((slide, i) => (
              <span
                key={slide.index}
                className={cn(
                  'scroll-mattis__num absolute left-0 font-medium tracking-[0.22em] text-white/70 tabular-nums @2xl:tracking-[0.3em]',
                  i !== 0 && 'opacity-0'
                )}
                style={{
                  fontSize: RESPONSIVE.numFont,
                  top: RESPONSIVE.numTop,
                }}
              >
                ({pad2(slide.index)})
              </span>
            ))}

            <div
              className='relative'
              style={{
                marginTop: RESPONSIVE.metaMt,
                minHeight: RESPONSIVE.metaMinH,
              }}
            >
              {SCROLL_MATTIS_ITEMS.map((slide, i) => (
                <div
                  key={slide.index}
                  className={cn(
                    'scroll-mattis__meta absolute inset-x-0 top-0 flex items-start justify-between gap-2 font-medium tracking-[0.1em] text-white/80 uppercase @2xl:tracking-[0.2em]',
                    i !== 0 && 'opacity-0'
                  )}
                  style={{ fontSize: RESPONSIVE.metaFont }}
                >
                  <span className='min-w-0 shrink leading-tight'>
                    {slide.title}
                  </span>
                  <span className='flex shrink-0 flex-col text-center leading-tight'>
                    <span>{slide.categories[0]}</span>
                    <span>{slide.categories[1]}</span>
                  </span>
                  <span className='shrink-0 tabular-nums'>{slide.year}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className='pointer-events-none absolute inset-x-0 top-0 z-50 flex items-start justify-between font-medium tracking-[0.12em] text-white/80 uppercase @2xl:tracking-[0.2em]'
          style={{
            padding: RESPONSIVE.headerPad,
            fontSize: RESPONSIVE.headerFont,
          }}
        >
          <span aria-hidden='true' />
          <span
            data-element-key='portfolioLabel'
            style={sPortfolio}
            className={selectableClass(
              activeKey === 'portfolioLabel',
              'pointer-events-auto'
            )}
          >
            {content.portfolioLabel || 'PORTFOLIO'}
          </span>
        </div>

        <div
          aria-hidden='true'
          className='scroll-mattis__grain pointer-events-none absolute inset-[-12%] z-60 mix-blend-overlay'
          style={GRAIN_STYLE}
        />
      </div>
    </section>
  );
}
