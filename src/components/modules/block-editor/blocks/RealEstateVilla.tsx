'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type { RealEstateVillaContent, RealEstateVillaSlide } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import {
  BROWN,
  FONT_BODY,
  FONT_HEADING,
  GREEN,
  RE_SECTION_GAP,
  SAND,
  FONT_CSS,
} from './realEstateFonts';
import { useContainerMobile } from './useContainerMobile';

/**
 * Hai tier + giữ slide.
 *
 * `mobile` (<672): carousel xếp dọc (ảnh → chữ → nav) — tỉ lệ Framer 372.
 * `wide` (≥672): carousel SPLIT — ảnh trái lớn / chữ+nav phải, maxWidth 1280.
 * Không phóng 1 card nhỏ giữa màn, không lưới 2×2 tĩnh trên production.
 *
 * Canvas edit: lưới 2 cột để chọn/sửa mọi slide.
 * Clip-wipe khi đổi slide (production). Nhánh JS + composeStyle.
 */
const TIER = {
  mobile: {
    section: { paddingTop: RE_SECTION_GAP } as React.CSSProperties,
    eyebrow: '3.76cqi',
    title: '6.18cqi',
    titleMt: '10.5cqi',
    titleW: '80.6cqi',
    titleMax: 'none' as const,
    carouselMt: '14.5cqi',
    cardGap: '3.23cqi',
    gridMt: '14.5cqi',
    contentMax: 'none' as const,
    // Stack card — cqi theo bề rộng card (~86.6% khung)
    slideTitle: '7.14cqi',
    slideTitleMt: '12.1cqi',
    slideDesc: '4.35cqi',
    slideDescMt: '7.1cqi',
    textPadX: '7.45cqi',
    navMt: '7.5cqi',
    navBtn: '12.4cqi',
    navGap: '3.73cqi',
    counterFs: '3.73cqi',
  },
  wide: {
    section: {
      paddingTop: 'clamp(40px, 3.5cqi, 56px)',
      paddingBottom: 'clamp(88px, 8.3cqi, 120px)',
      paddingInline: 'clamp(24px, 5.5cqi, 80px)',
    } as React.CSSProperties,
    eyebrow: 'clamp(14px, 1.11cqi, 16px)',
    title: 'clamp(28px, 2.9cqi, 42px)',
    titleMt: 'clamp(18px, 1.8cqi, 26px)',
    titleW: '100%',
    titleMax: 720,
    carouselMt: 'clamp(40px, 3.5cqi, 56px)',
    cardGap: 'clamp(20px, 2.2cqi, 32px)',
    gridMt: 'clamp(40px, 3.5cqi, 56px)',
    contentMax: 1280,
    // Split panel — cqi theo carousel (~1280)
    slideTitle: 'clamp(26px, 2.4cqi, 34px)',
    slideTitleMt: '0px',
    slideDesc: 'clamp(15px, 1.25cqi, 17px)',
    slideDescMt: 'clamp(14px, 1.25cqi, 20px)',
    textPadX: 'clamp(28px, 3.2cqi, 48px)',
    navMt: 'auto',
    navBtn: '44px',
    navGap: '12px',
    counterFs: '14px',
  },
} as const;

export function RealEstateVilla({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<RealEstateVillaContent>) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const tier = isMobile ? TIER.mobile : TIER.wide;

  const slides = Array.isArray(content.slides) ? content.slides : [];
  const count = slides.length;
  const [index, setIndex] = React.useState(0);

  const isCanvas = useIsCanvasEdit(rootRef);
  // Canvas: lưới edit. Production: luôn carousel (mobile stack / wide split).
  const useEditGrid = isCanvas;
  const useSplit = !isMobile && !isCanvas;

  const go = React.useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  React.useEffect(() => {
    if (index > count - 1) setIndex(Math.max(0, count - 1));
  }, [count, index]);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.fromTo(
        root.querySelectorAll('[data-appear]'),
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.075,
          delay: 0.1,
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 85%',
            once: true,
          },
        }
      );

      root.querySelectorAll('img').forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });
    },
    [isCanvas, count]
  );

  const imageBoxRef = React.useRef<HTMLDivElement>(null);
  const textStackRef = React.useRef<HTMLDivElement>(null);
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    if (useEditGrid) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const img = imageBoxRef.current;
      if (img) {
        gsap.fromTo(
          img,
          { clipPath: 'inset(0 0 0 100%)' },
          { clipPath: 'inset(0 0 0 0%)', duration: 0.6, ease: 'power3.out' }
        );
      }
      const txt = textStackRef.current?.children[index] as
        | HTMLElement
        | undefined;
      if (txt) {
        gsap.fromTo(
          txt,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
        );
      }
    });
    return () => ctx.revert();
  }, [index, useEditGrid]);

  const renderCardSurface = (radius?: number) => (
    <div
      data-element-key='cardSurface'
      aria-hidden
      className={cn(
        selectableClass(activeKey === 'cardSurface'),
        'absolute inset-0'
      )}
      style={composeStyle(
        {
          backgroundColor: '#fff',
          ...(radius != null ? { borderRadius: radius } : null),
        },
        styleOf('cardSurface')
      )}
    />
  );

  const renderSlideImage = (
    slide: RealEstateVillaSlide,
    i: number,
    aspectClass: string
  ) => {
    const imageKey = `slides[${i}].imageUrl`;
    return (
      <div
        data-element-key={imageKey}
        className={cn(
          selectableClass(activeKey === imageKey),
          'relative w-full overflow-hidden',
          aspectClass
        )}
        style={composeStyle(
          styleOf(imageKey),
          // Stack: chỉ bo góc trên. styleOf sau cùng bị ghi đè để không bo đáy
          // (tránh hở nền giữa ảnh và panel chữ).
          {
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={slide.imageUrl}
          src={slide.imageUrl}
          alt={slide.title}
          className='h-full w-full object-cover'
        />
      </div>
    );
  };

  const renderSlideText = (
    slide: RealEstateVillaSlide,
    i: number,
    opts?: { padX?: boolean }
  ) => {
    const titleKey = `slides[${i}].title`;
    const descKey = `slides[${i}].description`;
    const padX = opts?.padX !== false;
    return (
      <div
        className='relative'
        style={
          padX
            ? { paddingLeft: tier.textPadX, paddingRight: tier.textPadX }
            : undefined
        }
      >
        <h3
          data-element-key={titleKey}
          className={selectableClass(activeKey === titleKey)}
          style={composeStyle(
            {
              fontFamily: FONT_BODY,
              fontSize: tier.slideTitle,
              lineHeight: 1.25,
              color: BROWN,
              fontWeight: 400,
              marginTop: tier.slideTitleMt,
            },
            styleOf(titleKey)
          )}
        >
          {slide.title}
        </h3>

        <p
          data-element-key={descKey}
          className={selectableClass(activeKey === descKey)}
          style={composeStyle(
            {
              fontFamily: FONT_BODY,
              fontSize: tier.slideDesc,
              lineHeight: 1.69,
              color: BROWN,
              fontWeight: 400,
              marginTop: tier.slideDescMt,
              maxWidth: useSplit ? '36ch' : undefined,
            },
            styleOf(descKey)
          )}
        >
          {slide.description}
        </p>
      </div>
    );
  };

  const renderNav = () => (
    <div
      className='relative flex items-center'
      style={{
        marginTop: tier.navMt,
        paddingLeft: useSplit ? 0 : tier.textPadX,
        paddingRight: useSplit ? 0 : tier.textPadX,
      }}
    >
      <div
        className='relative aspect-square flex-none'
        style={{
          width: tier.navBtn,
          backgroundColor: 'rgba(117, 96, 75, 0.2)',
          borderRadius: '50%',
        }}
      >
        <div
          className='absolute'
          style={{
            inset: '2.5%',
            backgroundColor: '#fff',
            borderRadius: '50%',
          }}
        />
        <svg
          viewBox='0 0 40 40'
          aria-hidden
          className='absolute inset-0 h-full w-full -rotate-90'
        >
          <circle
            cx='20'
            cy='20'
            r='19.5'
            fill='none'
            stroke='#75604B'
            strokeWidth='1'
            strokeDasharray={2 * Math.PI * 19.5}
            strokeDashoffset={
              2 * Math.PI * 19.5 * (1 - (count > 0 ? (index + 1) / count : 0))
            }
            style={{ transition: 'stroke-dashoffset 400ms ease-out' }}
          />
        </svg>
        <span
          aria-live='polite'
          className='absolute inset-0 flex items-center justify-center'
          style={{
            fontFamily: FONT_HEADING,
            fontSize: tier.counterFs,
            lineHeight: 1.479,
            color: BROWN,
            fontWeight: 400,
          }}
        >
          {index + 1}/{count}
        </span>
      </div>

      <div className='ml-auto flex items-center' style={{ gap: tier.navGap }}>
        <button
          type='button'
          aria-label='Slide trước'
          onClick={() => go(index - 1)}
          className='flex aspect-square cursor-pointer appearance-none items-center justify-center rounded-full border border-[rgba(117,96,75,0.5)] bg-transparent p-0 text-[rgba(117,96,75,0.5)] transition-colors duration-400 hover:border-[rgb(117,96,75)] hover:text-[rgb(117,96,75)]'
          style={{ width: tier.navBtn }}
        >
          <svg viewBox='0 0 5.093 9.11' aria-hidden className='h-[45%] w-auto'>
            <path
              d='M 4.949 8.967 C 4.757 9.158 4.444 9.158 4.252 8.967 L 0.144 4.9 C -0.048 4.709 -0.048 4.4 0.144 4.21 L 4.252 0.143 C 4.444 -0.048 4.757 -0.048 4.949 0.143 C 5.141 0.334 5.141 0.643 4.949 0.833 L 1.19 4.555 L 4.949 8.277 C 5.141 8.467 5.141 8.776 4.949 8.967 Z'
              fill='currentColor'
            />
          </svg>
        </button>
        <button
          type='button'
          aria-label='Slide kế tiếp'
          onClick={() => go(index + 1)}
          className='flex aspect-square cursor-pointer appearance-none items-center justify-center rounded-full border border-[rgba(117,96,75,0.5)] bg-transparent p-0 text-[rgba(117,96,75,0.5)] transition-colors duration-400 hover:border-[rgb(117,96,75)] hover:text-[rgb(117,96,75)]'
          style={{ width: tier.navBtn }}
        >
          <svg
            viewBox='0 0 5.093 9.11'
            aria-hidden
            className='h-[45%] w-auto rotate-180'
          >
            <path
              d='M 4.949 8.967 C 4.757 9.158 4.444 9.158 4.252 8.967 L 0.144 4.9 C -0.048 4.709 -0.048 4.4 0.144 4.21 L 4.252 0.143 C 4.444 -0.048 4.757 -0.048 4.949 0.143 C 5.141 0.334 5.141 0.643 4.949 0.833 L 1.19 4.555 L 4.949 8.277 C 5.141 8.467 5.141 8.776 4.949 8.967 Z'
              fill='currentColor'
            />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderEditCard = (slide: RealEstateVillaSlide, i: number) => (
    <div key={i} data-appear className='@container relative w-full min-w-0'>
      {renderCardSurface()}
      <div style={{ paddingBottom: '17.4cqi' }}>
        {renderSlideImage(slide, i, 'aspect-[322/264]')}
        {renderSlideText(slide, i)}
      </div>
    </div>
  );

  const header = (
    <div className='mx-auto flex w-full flex-col items-center'>
      <p
        data-appear
        data-element-key='eyebrow'
        className={cn(selectableClass(activeKey === 'eyebrow'), 'text-center')}
        style={composeStyle(
          {
            fontFamily: FONT_HEADING,
            fontSize: tier.eyebrow,
            lineHeight: 1.69,
            color: GREEN,
            fontWeight: 400,
          },
          styleOf('eyebrow')
        )}
      >
        {content.eyebrow}
      </p>

      <h2
        data-appear
        data-element-key='title'
        className={cn(
          selectableClass(activeKey === 'title'),
          'mx-auto text-center'
        )}
        style={composeStyle(
          {
            fontFamily: FONT_BODY,
            fontSize: tier.title,
            lineHeight: 1.372,
            color: BROWN,
            fontWeight: 400,
            marginTop: tier.titleMt,
            width: tier.titleW,
            maxWidth: tier.titleMax,
          },
          styleOf('title')
        )}
      >
        {content.title}
      </h2>
    </div>
  );

  const rootStyle = composeStyle(
    { backgroundColor: SAND },
    blockBackgroundStyle(background)
  );

  const slide = slides[index];

  const handleCarouselKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(index - 1);
    }
  };

  return (
    <div
      ref={rootRef}
      data-canvas-edit={isCanvas ? 'true' : undefined}
      style={rootStyle}
      className={cn('@container relative w-full', className)}
    >
      <style>{FONT_CSS}</style>
      <div style={tier.section}>
        {header}

        {useEditGrid ? (
          <div
            className='mx-auto grid w-full grid-cols-2'
            style={{
              maxWidth: tier.contentMax,
              gap: tier.cardGap,
              marginTop: tier.gridMt,
            }}
          >
            {slides.map((s, i) => renderEditCard(s, i))}
          </div>
        ) : slide && useSplit ? (
          <section
            data-appear
            aria-roledescription='carousel'
            aria-label={content.title}
            className='@container relative mx-auto w-full overflow-hidden'
            style={{
              maxWidth: tier.contentMax,
              marginTop: tier.carouselMt,
              borderRadius: 16,
              backgroundColor: '#fff',
            }}
            onKeyDown={handleCarouselKeyDown}
          >
            {renderCardSurface(16)}
            <div
              className='relative grid w-full items-stretch'
              style={{
                gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)',
                minHeight: 'clamp(420px, 38cqi, 560px)',
              }}
            >
              <div ref={imageBoxRef} className='relative min-h-0'>
                <div
                  data-element-key={`slides[${index}].imageUrl`}
                  className={cn(
                    selectableClass(activeKey === `slides[${index}].imageUrl`),
                    'absolute inset-0 overflow-hidden'
                  )}
                  style={styleOf(`slides[${index}].imageUrl`)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={slide.imageUrl}
                    src={slide.imageUrl}
                    alt={slide.title}
                    className='h-full w-full object-cover'
                  />
                </div>
              </div>

              <div
                className='relative flex flex-col'
                style={{
                  paddingTop: 'clamp(32px, 3.5cqi, 48px)',
                  paddingBottom: 'clamp(28px, 3cqi, 40px)',
                  paddingLeft: tier.textPadX,
                  paddingRight: tier.textPadX,
                }}
              >
                <div ref={textStackRef} className='grid'>
                  {slides.map((s, i) => (
                    <div
                      key={i}
                      className='col-start-1 row-start-1'
                      style={{
                        visibility: i === index ? 'visible' : 'hidden',
                      }}
                      aria-hidden={i !== index}
                    >
                      {renderSlideText(s, i, { padX: false })}
                    </div>
                  ))}
                </div>
                {renderNav()}
              </div>
            </div>
          </section>
        ) : slide ? (
          <section
            data-appear
            aria-roledescription='carousel'
            aria-label={content.title}
            className='@container relative mx-auto'
            style={{ width: '86.6cqi', marginTop: tier.carouselMt }}
            onKeyDown={handleCarouselKeyDown}
          >
            {renderCardSurface()}
            <div style={{ paddingBottom: '17.4cqi' }}>
              <div ref={imageBoxRef}>
                {renderSlideImage(slide, index, 'aspect-[322/264]')}
              </div>

              <div ref={textStackRef} className='grid'>
                {slides.map((s, i) => (
                  <div
                    key={i}
                    className='col-start-1 row-start-1'
                    style={{
                      visibility: i === index ? 'visible' : 'hidden',
                    }}
                    aria-hidden={i !== index}
                  >
                    {renderSlideText(s, i)}
                  </div>
                ))}
              </div>

              {renderNav()}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
