'use client';

/**
 * Masterise Home Inside (Hệ tiện ích trong nhà) — port từ
 * `https://masterisehomes.com/the-global-city/masteri-park-place/`, block
 * `section.util-indoor-section`.
 *
 * Layout:
 * - Section trong suốt, padding responsive: `clamp(42px, 5cqi, 70px) 0`.
 * - Header row: flex column (mobile, items-center, gap 20px) → flex row
 *   (md+, items-end, gap 80px). Heading trái (`flex-shrink-0`), body phải
 *   (`md:max-w-[40%]`).
 * - Heading 2 dòng ("Hệ tiện ích / trong nhà"), font Masteri 52.5px md+ /
 *   31.5px mobile, line-height 1.3, color #c64a26. Tách thành 5 từ rời để
 *   stagger animation.
 * - Body 14px, Masteri Sans, color #000, `text-justify` mobile / `text-left`
 *   md+.
 * - Swiper carousel 5 slide:
 *     slidesPerView: 1 (mobile) | 1.2 (≥768) | 2 (≥1024)
 *     spaceBetween: 20 | 30 | 44
 *     loop: true
 *   Mỗi slide ảnh h-[320px] md:h-[400px] lg:h-[560px] object-cover + shadow.
 *   Caption overlay dưới: `from-black/70 → transparent`, padding
 *   `px-6 md:px-10 pb-6 md:pb-8`.
 * - Nav arrows: 2 nút tròn `w-12 h-12 md:w-15 md:h-15` (48/60px),
 *   `border-secondary` (#c64a26), `rounded-full`. Hover: `bg-secondary` +
 *   SVG fill → white. Transition 0.3s cubic-bezier(0.4,0,0.2,1).
 *
 * Animation (tương đương GSAP bundle.js gốc):
 *  1. Heading words: scale 2→1, blur 10→0, opacity 0→1, 0.8s power2.out,
 *     stagger 0.1s, trigger top 80%, toggle reverse. (Bundle fn
 *     `textSplitAnimation` + SplitText.words.)
 *  2. Body article: y 50→0, blur 2→0, opacity 0→1, 0.8s power2.out, trigger
 *     top 90%, toggle reverse. (Bundle fn `fadeUpAnimation`.)
 *  3. Slide reveal curtain (.reveal): xPercent -100→0, 1.5s power2.out,
 *     toggle restart/reset — RE-RUNS on every scroll-in. (Bundle fn
 *     `imageReveal` curtain tween.)
 *  4. Slide image (curtain wrapper .reveal > img): xPercent 100→0,
 *     scale 1.3→1, 1.5s power2.out, delay -1.5s (song song với curtain —
 *     image trượt từ phải trong khi curtain trượt từ trái). (Bundle fn
 *     `imageReveal` image tween.)
 *  5. Carousel slide transition: Swiper internal, 300ms cubic-bezier(0.4,0,0.2,1).
 *  6. Nav button hover: 300ms cubic-bezier(0.4,0,0.2,1) Tailwind default.
 *
 * Token ground truth: spec.md `recon-masterise-park-place-tien-ich-trong-nha/`
 * (raw/computed-*.json + bundle.js parsed by hand).
 *
 * Responsive: container-query với cqi (R2).
 * Accessibility: aria-label cho nav, role=img + aria-label cho ảnh,
 * prefers-reduced-motion honored tự động bởi useBlockMotion (revert gsap).
 *
 * ⚠ FONT SUBSTITUTION: `Masteri` (display serif) và `Masteri Sans` (sans)
 * là foundry font độc quyền của Masterise. Spec đề xuất thay bằng Google
 * Fonts `Fraunces` (400) và `Plus Jakarta Sans` (400) — file này dùng
 * các font thay thế này (xem MASTERI_FONT_FAMILY / MASTERI_SANS_FONT_FAMILY).
 * Nếu user cần exact match, fetch .woff2 từ
 * `https://masterisehomes.com/.../wp-content/themes/mh-lmt/static/src/fonts/`
 * và host locally.
 */

import * as React from 'react';
import gsap from 'gsap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
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
import { resolveMasteriseHomeInsideSlides } from './_registry/defs/masteriseHomeInside';
import { cn } from '@/lib/cn';

import 'swiper/css';

const BRAND = '#c64a26';
const TEXT_LIGHT = '#ffffff';
const MASTERI_FONT_FAMILY =
  "'Fraunces', 'Playfair Display', 'Times New Roman', serif";
const MASTERI_SANS_FONT_FAMILY =
  "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";

const ROOT_PADDING_Y = 'clamp(42px, 5cqi, 70px)';
const HEADING_FONT_SIZE = 'clamp(31.5px, 4.2cqi, 52.5px)';
const HEADING_LINE_HEIGHT = 1.3;
const HEADING_COLOR = BRAND;

const SLIDE_HEIGHT_MOBILE = '560px';
const HOVER_TRANSITION = '0.3s cubic-bezier(0.4, 0, 0.2, 1)';

const NAV_BUTTON_SIZE_MOBILE = 48;

const POWER2_OUT = 'power2.out';
const HEADING_STAGGER = 0.1;
const HEADING_DURATION = 0.8;
const BODY_DURATION = 0.8;

export interface MasteriseHomeInsideSlide {
  id: string;
  imageUrl: string;
  alt: string;
  caption?: string;
}

export interface MasteriseHomeInsideContent {
  headingLine1: string;
  headingLine2: string;
  body: string;
  slides: MasteriseHomeInsideSlide[];
}

interface Props {
  content: MasteriseHomeInsideContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const ROOT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: `${ROOT_PADDING_Y} 0`,
  display: 'flex',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
};

const HEADER_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 20,
  width: '100%',
  marginBottom: 32,
};

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: MASTERI_FONT_FAMILY,
  fontSize: HEADING_FONT_SIZE,
  fontWeight: 400,
  lineHeight: HEADING_LINE_HEIGHT,
  color: HEADING_COLOR,
  textAlign: 'center',
  margin: 0,
  flexShrink: 0,
  whiteSpace: 'nowrap',
};

const HEADING_WORD_STYLE: React.CSSProperties = {
  display: 'inline-block',
  position: 'relative',
  willChange: 'transform, opacity, filter',
};

const SLIDE_IMAGE_STYLE: React.CSSProperties = {
  width: '100%',
  aspectRatio: '4/3',
  objectFit: 'cover',
  display: 'block',
  boxShadow:
    'rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px',
  willChange: 'transform',
};

const SLIDE_CAPTION_STYLE: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  padding: '24px 24px',
  background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))',
  color: TEXT_LIGHT,
  pointerEvents: 'none',
};

const NAV_BUTTON_STYLE: React.CSSProperties = {
  width: NAV_BUTTON_SIZE_MOBILE,
  height: NAV_BUTTON_SIZE_MOBILE,
  borderRadius: '50%',
  border: `1px solid ${BRAND}`,
  background: 'transparent',
  color: BRAND,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: `all ${HOVER_TRANSITION}`,
  flexShrink: 0,
};

const NAV_BUTTON_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  marginTop: 24,
  justifyContent: 'center',
  width: '100%',
};

export function MasteriseHomeInside({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const headingLine1 = content.headingLine1 || 'Hệ tiện ích';
  const headingLine2 = content.headingLine2 || 'trong nhà';
  // Cùng resolver với LayersPanel / ElementToolbar → index của `slides[i].*`
  // luôn trỏ đúng phần tử, kể cả khi content BE có phần tử lỗi shape.
  const slides = React.useMemo(
    () => resolveMasteriseHomeInsideSlides(content),
    [content]
  );
  const navPrevClass = 'rx-masterise-prev';
  const navNextClass = 'rx-masterise-next';

  useBlockMotion(
    headerRef,
    ({ scroller }) => {
      const root = headerRef.current;
      if (!root) return;

      const wordEls = root.querySelectorAll<HTMLElement>(
        '[data-masterise-heading-word]'
      );
      if (wordEls.length) {
        gsap.from(wordEls, {
          opacity: 0,
          scale: 2,
          filter: 'blur(10px)',
          duration: HEADING_DURATION,
          ease: POWER2_OUT,
          stagger: HEADING_STAGGER,
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        });
      }

      const bodyEl = root.querySelector<HTMLElement>('[data-masterise-body]');
      if (bodyEl) {
        gsap.fromTo(
          bodyEl,
          { opacity: 0, y: 50, filter: 'blur(2px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: BODY_DURATION,
            ease: POWER2_OUT,
            scrollTrigger: {
              trigger: bodyEl,
              scroller,
              start: 'top 90%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }
    },
    [headingLine1, headingLine2, content.body]
  );

  return (
    <section
      ref={rootRef}
      data-element-key='root'
      aria-label='Hệ tiện ích trong nhà'
      style={composeStyle(
        ROOT_STYLE,
        blockBackgroundStyle(background),
        styleOf('root')
      )}
      className={cn('@container', className)}
    >
      <div
        data-element-key='container'
        style={composeStyle(
          {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            padding: '0 clamp(14px, 2cqi, 30px)',
          },
          styleOf('container')
        )}
      >
        <div
          ref={headerRef}
          data-element-key='header'
          style={composeStyle(HEADER_ROW_STYLE, styleOf('header'))}
          className='@3xl:mx-[10%] @3xl:mb-15! @3xl:flex-row! @3xl:items-start! @3xl:gap-20!'
        >
          <h2
            data-element-key='heading'
            style={composeStyle(HEADING_STYLE, styleOf('heading'))}
            className={cn(
              selectableClass(activeKey === 'heading'),
              '@3xl:text-left! @3xl:whitespace-normal!'
            )}
          >
            <span style={{ display: 'block' }} aria-hidden>
              {headingLine1.split(/\s+/).map((word, i) => (
                <span
                  key={`l1-${i}`}
                  data-masterise-heading-word
                  data-element-key={`headingWordL1_${i}`}
                  style={composeStyle(
                    HEADING_WORD_STYLE,
                    styleOf(`headingWordL1_${i}`)
                  )}
                  className={selectableClass(
                    activeKey === `headingWordL1_${i}`,
                    'mr-3'
                  )}
                >
                  {word}
                  {i < headingLine1.split(/\s+/).length - 1 ? ' ' : ''}
                </span>
              ))}
            </span>
            <span style={{ display: 'block' }} aria-hidden>
              {headingLine2.split(/\s+/).map((word, i) => (
                <span
                  key={`l2-${i}`}
                  data-masterise-heading-word
                  data-element-key={`headingWordL2_${i}`}
                  style={composeStyle(
                    HEADING_WORD_STYLE,
                    styleOf(`headingWordL2_${i}`)
                  )}
                  className={selectableClass(
                    activeKey === `headingWordL2_${i}`,
                    'mr-3'
                  )}
                >
                  {word}
                  {i < headingLine2.split(/\s+/).length - 1 ? ' ' : ''}
                </span>
              ))}
            </span>
            <span className='sr-only'>
              {headingLine1} {headingLine2}
            </span>
          </h2>

          <div
            data-masterise-body
            data-element-key='body'
            className={cn(
              selectableClass(activeKey === 'body'),
              'flex-1 @3xl:max-w-[40%] @3xl:text-left!'
            )}
          >
            <p style={{ margin: 0 }}>{content.body}</p>
          </div>
        </div>

        {/* ── Swiper carousel ───────────────────────────────────────── */}
        <div
          data-element-key='swiper'
          style={composeStyle({ width: '100%' }, styleOf('swiper'))}
          className={selectableClass(activeKey === 'swiper', 'relative')}
        >
          {slides.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: SLIDE_HEIGHT_MOBILE,
                background: 'rgba(0,0,0,0.04)',
                color: 'rgba(0,0,0,0.4)',
                fontFamily: MASTERI_SANS_FONT_FAMILY,
                fontSize: 14,
              }}
            >
              Chưa có slide nào. Thêm ảnh trong sidebar.
            </div>
          ) : (
            <Swiper
              modules={[Navigation]}
              slidesPerView={1}
              spaceBetween={20}
              loop={slides.length > 1}
              navigation={
                slides.length > 1
                  ? {
                      nextEl: `.${navNextClass}`,
                      prevEl: `.${navPrevClass}`,
                    }
                  : false
              }
              speed={300}
              breakpointsBase='container'
              breakpoints={{
                768: { slidesPerView: 1.2, spaceBetween: 30 },
                1024: { slidesPerView: 2, spaceBetween: 44 },
              }}
              style={{ width: '100%', paddingBottom: 8 }}
            >
              {slides.map((slide, i) => {
                const imageKey = `slides[${i}].imageUrl`;
                const captionKey = `slides[${i}].caption`;
                return (
                  <SwiperSlide key={slide.id || imageKey}>
                    <div
                      className='relative h-auto w-full'
                      style={{
                        width: '100%',
                      }}
                    >
                      <div
                        data-masterise-slide-reveal
                        className='aspect-4/3 w-full object-cover @3xl:aspect-4/3 @4xl:aspect-video'
                      >
                        <img
                          src={slide.imageUrl}
                          alt={slide.alt}
                          data-masterise-slide-img
                          data-element-key={imageKey}
                          style={composeStyle(
                            SLIDE_IMAGE_STYLE,
                            styleOf(imageKey)
                          )}
                          className={selectableClass(activeKey === imageKey)}
                          loading='lazy'
                          decoding='async'
                        />
                      </div>
                      {slide.caption ? (
                        <div
                          className='@md:px-10 @md:pb-8'
                          style={SLIDE_CAPTION_STYLE}
                        >
                          <p
                            data-element-key={captionKey}
                            style={composeStyle(
                              {
                                fontFamily: MASTERI_SANS_FONT_FAMILY,
                                fontSize: 'clamp(18px, 2.4cqi, 30px)',
                                fontWeight: 400,
                                lineHeight: 1.2,
                                color: TEXT_LIGHT,
                                margin: 0,
                                // Wrapper giữ pointerEvents:none để không chặn
                                // swipe; riêng dòng chữ phải click chọn được
                                // trên canvas.
                                pointerEvents: 'auto',
                              },
                              styleOf(captionKey)
                            )}
                            className={selectableClass(
                              activeKey === captionKey
                            )}
                          >
                            {slide.caption}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </div>

        {/* ── Nav arrows ────────────────────────────────────────────── */}
        {slides.length > 1 ? (
          <div
            data-element-key='nav'
            style={composeStyle(NAV_BUTTON_ROW_STYLE, styleOf('nav'))}
            className={selectableClass(activeKey === 'nav')}
          >
            <button
              type='button'
              className={cn(navPrevClass, '@md:h-15! @md:w-15!')}
              data-element-key='navPrev'
              aria-label='Slide trước'
              style={composeStyle(NAV_BUTTON_STYLE, styleOf('navPrev'))}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.background = BRAND;
                el.style.color = TEXT_LIGHT;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.background = 'transparent';
                el.style.color = BRAND;
              }}
            >
              <ChevronLeft
                size={14}
                color='currentColor'
                aria-hidden
                strokeWidth={1.5}
              />
            </button>
            <button
              type='button'
              className={cn(navNextClass, '@md:h-15! @md:w-15!')}
              data-element-key='navNext'
              aria-label='Slide tiếp'
              style={composeStyle(NAV_BUTTON_STYLE, styleOf('navNext'))}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.background = BRAND;
                el.style.color = TEXT_LIGHT;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.background = 'transparent';
                el.style.color = BRAND;
              }}
            >
              <ChevronRight
                size={14}
                color='currentColor'
                aria-hidden
                strokeWidth={1.5}
              />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
