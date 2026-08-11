'use client';

/**
 * RADGA Horizontal Scroll — port từ Codegrid cg-radga-horizontal-scroll-animation.
 *
 * Live: CSS sticky pin track + ScrollTrigger scrub translateX; IntersectionObserver
 * cho title reveal; parallax ảnh giữa slide active/adjacent.
 * Canvas: lưới phẳng tất cả slide + outro (pattern TheGrandService / ScrollImgScale).
 */

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  CgRadgaHorizontalContent,
  CgRadgaHorizontalSlide,
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
import {
  CG_RADGA_HORIZONTAL_DEFAULT_SLIDES,
  resolveCgRadgaHorizontalSlides,
} from './_registry/defs/cgRadgaHorizontal';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface Props {
  content: CgRadgaHorizontalContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const DISPLAY_FONT =
  "'Gilroy', 'Archivo Black', system-ui, -apple-system, sans-serif";

const COLORS = {
  stickyBg: '#b4aea7',
  outroBg: '#141414',
  title: '#ffffff',
} as const;

const RESPONSIVE = {
  titleFont: 'clamp(36px, 8cqi, 85px)',
  outroFont: 'clamp(28px, 5cqi, 60px)',
  titleBlockHeight: 'clamp(120px, 18cqi, 200px)',
  padding: 'clamp(16px, 2cqi, 24px)',
  canvasSlideMinH: 'clamp(280px, 40cqi, 420px)',
} as const;

const TITLE_HIDE_Y = -200;
const IMAGE_SCALE = 1.35;

export function CgRadgaHorizontal({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const pinTrackRef = React.useRef<HTMLDivElement>(null);
  const stickyRef = React.useRef<HTMLDivElement>(null);
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);

  const { hasRoot, scroller, requestRefresh } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(rootRef);
  const isMobile = useContainerMobile(rootRef);
  const [motionOff, setMotionOff] = React.useState(false);

  const slides = React.useMemo(
    () => resolveCgRadgaHorizontalSlides(content),
    [content.slides]
  );

  const flat = isMobile || motionOff;
  const outroTitle =
    content.outroTitle?.trim() ||
    'Shaping timeless spaces with contemporary vision';

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  React.useEffect(() => {
    const pinTrack = pinTrackRef.current;
    const sticky = stickyRef.current;
    const slider = sliderRef.current;
    const track = trackRef.current;
    if (!pinTrack || !sticky || !slider || !track || slides.length === 0) {
      return;
    }
    if (isCanvas || !hasRoot) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setMotionOff(true);
      return;
    }
    if (motionOff) setMotionOff(false);

    if (flat) {
      gsap.set(track, { clearProps: 'transform' });
      sticky.querySelectorAll('.crh-title-inner').forEach(el => {
        gsap.set(el, { clearProps: 'transform' });
      });
      sticky.querySelectorAll('.crh-slide-img').forEach(el => {
        gsap.set(el, { clearProps: 'transform' });
      });
      return;
    }

    const slideEls = gsap.utils.toArray<HTMLElement>('.crh-slide', sticky);
    const titleEls = slideEls
      .map(slide => slide.querySelector<HTMLElement>('.crh-title-inner'))
      .filter(Boolean) as HTMLElement[];

    titleEls.forEach(title => gsap.set(title, { y: TITLE_HIDE_Y }));

    let currentVisibleIndex: number | null = null;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const currentIndex = slideEls.indexOf(entry.target as HTMLElement);
          if (currentIndex < 0) return;

          if (entry.intersectionRatio >= 0.25) {
            currentVisibleIndex = currentIndex;
            titleEls.forEach((title, index) => {
              gsap.to(title, {
                y: index === currentIndex ? 0 : TITLE_HIDE_Y,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true,
              });
            });
          } else if (
            entry.intersectionRatio < 0.25 &&
            currentVisibleIndex === currentIndex
          ) {
            const prevIndex = currentIndex - 1;
            currentVisibleIndex = prevIndex >= 0 ? prevIndex : null;
            titleEls.forEach((title, index) => {
              gsap.to(title, {
                y: index === prevIndex ? 0 : TITLE_HIDE_Y,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true,
              });
            });
          }
        });
      },
      { root: slider, threshold: [0, 0.25] }
    );

    slideEls.forEach(slide => observer.observe(slide));

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: pinTrack,
        scroller,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: self => {
          const totalMove = track.offsetWidth - slider.offsetWidth;
          const slideWidth = slider.offsetWidth;
          const mainMove = self.progress * totalMove;

          gsap.set(track, { x: -mainMove });

          const currentSlide = Math.floor(mainMove / slideWidth);
          const slideProgress =
            slideWidth > 0 ? (mainMove % slideWidth) / slideWidth : 0;

          slideEls.forEach((slide, index) => {
            const image = slide.querySelector<HTMLElement>('.crh-slide-img');
            if (!image) return;

            if (index === currentSlide || index === currentSlide + 1) {
              const relativeProgress =
                index === currentSlide ? slideProgress : slideProgress - 1;
              const parallaxAmount = relativeProgress * slideWidth * 0.25;
              gsap.set(image, { x: parallaxAmount, scale: IMAGE_SCALE });
            } else {
              gsap.set(image, { x: 0, scale: IMAGE_SCALE });
            }
          });
        },
      });
    }, sticky);

    rootRef.current?.querySelectorAll('img').forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', requestRefresh, { once: true });
      }
    });

    requestRefresh();

    return () => {
      observer.disconnect();
      ctx.revert();
    };
  }, [
    slides.length,
    isCanvas,
    hasRoot,
    flat,
    motionOff,
    scroller,
    requestRefresh,
  ]);

  if (slides.length === 0) return null;

  const renderSlide = (slide: CgRadgaHorizontalSlide, i: number) => {
    const line1Key = `slides[${i}].titleLine1`;
    const line2Key = `slides[${i}].titleLine2`;
    const imageKey = `slides[${i}].imageUrl`;
    const fallback =
      CG_RADGA_HORIZONTAL_DEFAULT_SLIDES[
        i % CG_RADGA_HORIZONTAL_DEFAULT_SLIDES.length
      ];
    const imageUrl = slide.imageUrl?.trim() || fallback.imageUrl || '';
    const imageAlt =
      slide.imageAlt?.trim() || slide.titleLine1?.trim() || fallback.imageAlt;

    return (
      <article className='crh-slide relative h-full min-w-0 flex-1' key={i}>
        <div
          data-element-key={imageKey}
          className={selectableClass(
            activeKey === imageKey,
            'crh-slide-media pointer-events-auto absolute inset-0 overflow-hidden'
          )}
          style={composeStyle(undefined, styleOf(imageKey))}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={imageAlt}
            className='crh-slide-img pointer-events-none relative h-full w-full object-cover'
            style={{
              transform: `translateX(0) scale(${IMAGE_SCALE})`,
              willChange: 'transform',
            }}
            draggable={false}
          />
        </div>

        <div
          className='crh-title-block relative z-[2]'
          style={{
            width: 'max-content',
            height: RESPONSIVE.titleBlockHeight,
            margin: RESPONSIVE.padding,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
          }}
        >
          <h1
            className='crh-title-inner relative m-0 uppercase'
            style={{
              color: COLORS.title,
              fontFamily: DISPLAY_FONT,
              fontSize: RESPONSIVE.titleFont,
              fontWeight: 900,
              letterSpacing: '-2px',
              lineHeight: 0.9,
              willChange: 'transform',
              transform: isCanvas || flat ? 'translateY(0)' : undefined,
            }}
          >
            <span
              data-element-key={line1Key}
              className={selectableClass(
                activeKey === line1Key,
                'pointer-events-auto block'
              )}
              style={composeStyle(undefined, styleOf(line1Key))}
            >
              {slide.titleLine1?.trim() || fallback.titleLine1}
            </span>
            <span
              data-element-key={line2Key}
              className={selectableClass(
                activeKey === line2Key,
                'pointer-events-auto block'
              )}
              style={composeStyle(undefined, styleOf(line2Key))}
            >
              {slide.titleLine2?.trim() || fallback.titleLine2}
            </span>
          </h1>
        </div>
      </article>
    );
  };

  const outro = (
    <div
      className='crh-outro relative flex w-full items-center justify-center overflow-hidden text-center'
      style={{
        minHeight: '100svh',
        padding: RESPONSIVE.padding,
        backgroundColor: COLORS.outroBg,
      }}
    >
      <h2
        data-element-key='outroTitle'
        className={selectableClass(
          activeKey === 'outroTitle',
          'crh-outro-title pointer-events-auto m-0 max-w-[min(100%,920px)] uppercase'
        )}
        style={composeStyle(
          {
            color: COLORS.title,
            fontFamily: DISPLAY_FONT,
            fontSize: RESPONSIVE.outroFont,
            fontWeight: 900,
            letterSpacing: '-2px',
            lineHeight: 0.9,
          },
          styleOf('outroTitle')
        )}
      >
        {outroTitle}
      </h2>
    </div>
  );

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        className={cn('crh @container relative w-full', className)}
        style={composeStyle(blockBackgroundStyle(background))}
      >
        <div
          className='flex flex-col gap-6'
          style={{
            padding: RESPONSIVE.padding,
            backgroundColor: COLORS.stickyBg,
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={`canvas-slide-${i}`}
              className='relative overflow-hidden rounded-sm'
              style={{
                minHeight: RESPONSIVE.canvasSlideMinH,
                backgroundColor: COLORS.stickyBg,
              }}
            >
              {renderSlide(slide, i)}
            </div>
          ))}
        </div>
        {outro}
      </section>
    );
  }

  if (flat) {
    return (
      <section
        ref={rootRef}
        className={cn('crh @container relative w-full', className)}
        style={composeStyle(blockBackgroundStyle(background))}
      >
        <div
          className='flex flex-col'
          style={{
            backgroundColor: COLORS.stickyBg,
            padding: RESPONSIVE.padding,
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={`flat-slide-${i}`}
              className='relative mb-6 overflow-hidden'
              style={{ minHeight: RESPONSIVE.canvasSlideMinH }}
            >
              {renderSlide(slide, i)}
            </div>
          ))}
        </div>
        {outro}
      </section>
    );
  }

  const pinVh = slides.length + 1;

  return (
    <section
      ref={rootRef}
      className={cn('crh @container relative w-full', className)}
      style={composeStyle(blockBackgroundStyle(background))}
    >
      <div
        ref={pinTrackRef}
        className='crh-pin-track relative w-full'
        style={{ height: `calc(100svh * ${pinVh})` }}
      >
        <div
          ref={stickyRef}
          className='crh-sticky top-0 w-full overflow-hidden'
          style={{
            position: 'sticky',
            height: '100svh',
            padding: RESPONSIVE.padding,
            backgroundColor: COLORS.stickyBg,
          }}
        >
          <div
            ref={sliderRef}
            className='crh-slider relative h-full w-full overflow-hidden'
          >
            <div
              ref={trackRef}
              className='crh-track relative flex h-full will-change-transform'
              style={{
                width: `${slides.length * 100}%`,
                transform: 'translateX(0)',
              }}
            >
              {slides.map((slide, i) => renderSlide(slide, i))}
            </div>
          </div>
        </div>
      </div>
      {outro}
    </section>
  );
}
