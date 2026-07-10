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
 * - editor canvas (`data-testid=active-block-preview`) → lưới 3 slide editable
 *   (media + chữ chạy + meta; không scrub — BlockPreview `transform:scale` gãy sticky);
 * - PreviewMode / Play / `/p` → full scrub;
 * - KHÔNG `gsap.registerPlugin` (LandingMotionRoot đã đăng ký ScrollTrigger).
 */

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';
import {
  SCROLL_MATTIS_ITEMS,
  type ScrollMattisSlide,
} from '@/assets/images/scroll_mattis';

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

const SLIDE_KEYS = [
  {
    url: 'slide1Url',
    bgWord: 'slide1BgWord',
    title: 'slide1Title',
    cat1: 'slide1Category1',
    cat2: 'slide1Category2',
    year: 'slide1Year',
  },
  {
    url: 'slide2Url',
    bgWord: 'slide2BgWord',
    title: 'slide2Title',
    cat1: 'slide2Category1',
    cat2: 'slide2Category2',
    year: 'slide2Year',
  },
  {
    url: 'slide3Url',
    bgWord: 'slide3BgWord',
    title: 'slide3Title',
    cat1: 'slide3Category1',
    cat2: 'slide3Category2',
    year: 'slide3Year',
  },
] as const;

type SlideFieldKey =
  (typeof SLIDE_KEYS)[number][keyof (typeof SLIDE_KEYS)[number]];

const isVideoUrl = (src: string) =>
  /\.(mp4|webm|ogg|mov)(\?|$)/i.test(src) ||
  src.includes('framerusercontent.com/assets/');

const pick = (content: ScrollMattisContent, key: SlideFieldKey) =>
  content[key]?.trim() || '';

const resolveSlides = (content: ScrollMattisContent): ScrollMattisSlide[] =>
  SCROLL_MATTIS_ITEMS.map((base, i) => {
    const keys = SLIDE_KEYS[i];
    if (!keys) return base;
    const src = pick(content, keys.url) || base.src;
    const kind: ScrollMattisSlide['kind'] = isVideoUrl(src) ? 'video' : 'image';
    return {
      ...base,
      src,
      kind,
      poster: kind === 'video' ? base.poster : undefined,
      bgWord: pick(content, keys.bgWord) || base.bgWord,
      title: pick(content, keys.title) || base.title,
      categories: [
        pick(content, keys.cat1) || base.categories[0],
        pick(content, keys.cat2) || base.categories[1],
      ],
      year: pick(content, keys.year) || base.year,
    };
  });

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

  // Chỉ BlockPreview editor — KHÔNG PreviewMode/Play (cũng có scroller).
  const [isCanvas, setIsCanvas] = React.useState(true);
  React.useLayoutEffect(() => {
    if (!hasRoot) {
      setIsCanvas(false);
      return;
    }
    setIsCanvas(
      !!rootRef.current?.closest('[data-testid="active-block-preview"]')
    );
  }, [hasRoot]);

  const slides = React.useMemo(() => resolveSlides(content), [content]);

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

  const trackHeight = isCanvas ? undefined : isMobile ? '300dvh' : '380dvh';

  const loadedRef = React.useRef(0);
  const handleMediaLoad = () => {
    loadedRef.current += 1;
    if (loadedRef.current >= slides.length) requestRefresh();
  };

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      if (!root) return;
      // Mini-preview / editor canvas / reduced-motion: không scrub.
      if (!hasRoot || isCanvas) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const q = (sel: string) =>
        Array.from(root.querySelectorAll<HTMLElement>(sel));
      const bgs = q('.scroll-mattis__bg');
      const media = q('.scroll-mattis__frame-media');
      const words = q('.scroll-mattis__word');
      const nums = q('.scroll-mattis__num');
      const metas = q('.scroll-mattis__meta');
      if (bgs.length === 0) return;

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

      gsap.set(bgs, { transformOrigin: 'center center' });
      gsap.set(bgs[0], { yPercent: 0, autoAlpha: 1 });
      gsap.set(bgs.slice(1), { yPercent: 100, autoAlpha: 1 });
      gsap.set(media, { autoAlpha: 1 });
      gsap.set(media[0], { clipPath: clipShown });
      gsap.set(media.slice(1), { clipPath: clipHidden });
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
        tl.fromTo(
          bgs[i + 1],
          { yPercent: 100 },
          { yPercent: 0, duration: 1 },
          i
        );
        if (media[i + 1])
          tl.fromTo(
            media[i + 1],
            { clipPath: clipHidden },
            { clipPath: clipShown, duration: revealDur },
            i + revealStart
          );
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
    [isMobile, hasRoot, isCanvas, slides]
  );

  return (
    <section
      ref={rootRef}
      style={{
        ...(trackHeight ? { height: trackHeight } : undefined),
        ...blockBackgroundStyle(background),
      }}
      className={cn('relative w-full bg-neutral-950', className)}
    >
      <style>{GRAIN_CSS}</style>
      <div
        className={cn(
          '@container w-full overflow-hidden bg-neutral-950',
          isCanvas
            ? 'relative min-h-[520px] py-3'
            : 'sticky top-0 h-dvh min-h-dvh'
        )}
      >
        {isCanvas ? (
          <>
            <div
              className='pointer-events-none relative z-20 mb-2 flex items-start justify-end px-3'
              style={{ fontSize: RESPONSIVE.headerFont }}
            >
              <span
                data-element-key='portfolioLabel'
                style={sPortfolio}
                className={selectableClass(
                  activeKey === 'portfolioLabel',
                  'pointer-events-auto font-medium tracking-[0.12em] text-white/80 uppercase'
                )}
              >
                {content.portfolioLabel || 'PORTFOLIO'}
              </span>
            </div>

            <div className='grid grid-cols-1 gap-3 px-3 @2xl:grid-cols-3'>
              {slides.map((slide, i) => {
                const keys = SLIDE_KEYS[i];
                if (!keys) return null;
                return (
                  <div
                    key={keys.url}
                    className='flex min-w-0 flex-col gap-2 rounded-xl bg-white/5 p-2 ring-1 ring-white/10'
                  >
                    {/* Media */}
                    <div
                      data-element-key={keys.url}
                      style={styleOf(keys.url)}
                      className={selectableClass(
                        activeKey === keys.url,
                        'relative aspect-video overflow-hidden rounded-lg'
                      )}
                    >
                      {slide.kind === 'video' ? (
                        <video
                          src={slide.src}
                          poster={slide.poster}
                          className='pointer-events-none h-full w-full object-cover'
                          muted
                          loop
                          playsInline
                          autoPlay
                          preload='metadata'
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={slide.src}
                          alt={slide.title}
                          onLoad={handleMediaLoad}
                          className='pointer-events-none h-full w-full object-cover'
                          draggable={false}
                        />
                      )}
                      <span className='pointer-events-none absolute top-2 left-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase'>
                        {pad2(slide.index)}
                      </span>
                    </div>

                    {/* Chữ chạy (bgWord) */}
                    <div
                      data-element-key={keys.bgWord}
                      style={styleOf(keys.bgWord)}
                      className={selectableClass(
                        activeKey === keys.bgWord,
                        'truncate px-1 text-[11px] font-semibold tracking-tight text-white uppercase'
                      )}
                      title='Chữ chạy marquee'
                    >
                      {slide.bgWord}
                    </div>

                    {/* Meta: title / categories / year */}
                    <div className='flex items-start justify-between gap-1 px-1 text-[10px] font-medium tracking-wider text-white/75 uppercase'>
                      <span
                        data-element-key={keys.title}
                        style={styleOf(keys.title)}
                        className={selectableClass(
                          activeKey === keys.title,
                          'min-w-0 shrink truncate'
                        )}
                      >
                        {slide.title}
                      </span>
                      <span className='flex shrink-0 flex-col text-center leading-tight'>
                        <span
                          data-element-key={keys.cat1}
                          style={styleOf(keys.cat1)}
                          className={selectableClass(activeKey === keys.cat1)}
                        >
                          {slide.categories[0]}
                        </span>
                        <span
                          data-element-key={keys.cat2}
                          style={styleOf(keys.cat2)}
                          className={selectableClass(activeKey === keys.cat2)}
                        >
                          {slide.categories[1]}
                        </span>
                      </span>
                      <span
                        data-element-key={keys.year}
                        style={styleOf(keys.year)}
                        className={selectableClass(
                          activeKey === keys.year,
                          'shrink-0 tabular-nums'
                        )}
                      >
                        {slide.year}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {slides.map((slide, i) => (
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

            {/* Big word marquee — dùng bgWord từ content */}
            <div className='pointer-events-none absolute inset-0 z-20 overflow-hidden'>
              {slides.map((slide, i) => {
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

            <div className='pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-[4cqi] pb-[5cqi] @2xl:px-0 @2xl:pb-0'>
              <div className='relative w-[82cqi] max-w-[850px] @2xl:w-[64cqi]'>
                <div className='relative isolate aspect-video w-full overflow-hidden rounded-[2px] bg-neutral-900 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'>
                  {slides.map((slide, i) => (
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

                {slides.map((slide, i) => (
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
                  {slides.map((slide, i) => (
                    <div
                      key={slide.index}
                      className={cn(
                        'scroll-mattis__meta absolute inset-x-0 top-0 flex items-start justify-between gap-2 font-medium tracking-widest text-white/80 uppercase @2xl:tracking-[0.2em]',
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
                      <span className='shrink-0 tabular-nums'>
                        {slide.year}
                      </span>
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
          </>
        )}
      </div>
    </section>
  );
}
