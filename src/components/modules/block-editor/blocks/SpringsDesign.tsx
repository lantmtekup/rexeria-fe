'use client';

/**
 * Block "Springs - Design" (section `.l-design` / `#design` của
 * springs-estate-clone) — bản gốc là 1 chuỗi 3-4 slide sticky-scroll với
 * parallax ảnh + reveal chữ theo từng nhịp cuộn (`l-design__slide--1..4`).
 * Ở đây rút gọn thành: heading "Design" + chuỗi card (ảnh + phụ đề + đoạn
 * văn) xếp dọc (mobile) / so le trái-phải (desktop từ @2xl) — KHÔNG replicate
 * cơ chế pin/parallax gốc, chỉ giữ tinh thần "mỗi tầng một góc nhìn".
 *
 * Copy + ảnh THẬT từ springs.estate (asset gốc, không self-host lại):
 *  - Slide 1: "Inspired Architecture" — câu mở đầu về toà nhà pha lê.
 *  - Slide 2: "Each floor reflects boundless perspectives..." (design-1).
 *  - Slide 3: "Tabanlioglu, the renowned architectural bureau..." (design-4).
 *  - Slide 4: phần còn lại "Freedom of expression..." (design-3).
 *
 * Font thật bản gốc (self-host tại springs.estate/assets/fonts, mirror
 * SPRINGS_FONT_CSS của `SpringsIntro.tsx` — khai báo lặp giữa các block
 * Springs vô hại, trình duyệt chỉ tải 1 lần):
 *   - "Victor Serif" (heading + phụ đề slide)
 *   - "TT Commons Pro" (đoạn văn)
 *
 * Motion: heading fade-up khi vào viewport; MỖI slide có ScrollTrigger riêng
 * (fade + rise), stagger tự nhiên theo vị trí cuộn — không gate theo 1
 * timeline chung để card nào cuộn tới thì card đó mới chạy. Tôn trọng
 * prefers-reduced-motion (R1-R6, xem gsap-motion-contract.md).
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SpringsDesignContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

/** Serif dùng cho heading + phụ đề slide — bản gốc: Victor Serif. */
const SPRINGS_DESIGN_FONT_SERIF =
  "'Victor Serif', 'Cormorant Garamond', Georgia, 'Times New Roman', serif";

/** Sans dùng cho đoạn văn — bản gốc: TT Commons Pro. */
const SPRINGS_DESIGN_FONT_BODY =
  "'TT Commons Pro', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Nền cream nhạt + ink xanh đậm — cùng tông với `SpringsIntro.tsx` để cả
 *  cụm block Springs nhất quán. */
const SPRINGS_DESIGN_BG = '#f4f1e9';
const SPRINGS_DESIGN_INK = '#152018';

const SPRINGS_DESIGN_FONT_CSS = `
@font-face { font-family: 'Victor Serif'; src: url('https://springs.estate/assets/fonts/VictorSerif-40Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TT_Commons_Pro_Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TTCommonsPro-Md.woff2') format('woff2'); font-weight: 500; font-style: normal; font-display: swap; }
`;

interface Props {
  content: SpringsDesignContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function SpringsDesign({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const slides = content.slides ?? [];

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
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (reduce) return;

      const heading = root.querySelector<HTMLElement>(
        '.springs-design-heading'
      );
      if (heading) {
        gsap.from(heading, {
          autoAlpha: 0,
          y: 32,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heading,
            scroller,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        });
      }

      // Mỗi card có ScrollTrigger riêng — card nào cuộn tới thì card đó
      // fade + rise, không gate theo 1 timeline chung của cả section.
      const cards = root.querySelectorAll<HTMLElement>('.springs-design-slide');
      cards.forEach((card, i) => {
        gsap.from(card, {
          autoAlpha: 0,
          y: 56,
          duration: 0.9,
          delay: (i % 2) * 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            scroller,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        });
      });

      // R4: ảnh load xong (async) → refresh trigger math.
      const imgs = root.querySelectorAll<HTMLImageElement>(
        '.springs-design-slide-img'
      );
      imgs.forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });
    },
    [slides.length]
  );

  return (
    <section
      ref={rootRef}
      style={composeStyle(
        { background: SPRINGS_DESIGN_BG },
        blockBackgroundStyle(background)
      )}
      className='springs-design @container relative w-full'
    >
      <style>{SPRINGS_DESIGN_FONT_CSS}</style>
      <div
        className='mx-auto w-full max-w-[1180px]'
        style={{
          padding:
            'clamp(64px, 11cqi, 140px) clamp(20px, 6cqi, 64px) clamp(72px, 12cqi, 160px)',
        }}
      >
        <h2
          data-element-key='heading'
          className={selectableClass(
            activeKey === 'heading',
            'springs-design-heading'
          )}
          style={composeStyle(
            {
              margin: 0,
              fontFamily: SPRINGS_DESIGN_FONT_SERIF,
              fontWeight: 400,
              fontSize: 'clamp(36px, 6cqi, 72px)',
              lineHeight: 1.08,
              letterSpacing: '-0.01em',
              color: SPRINGS_DESIGN_INK,
              textAlign: 'center',
            },
            styleOf('heading')
          )}
        >
          {content.heading}
        </h2>

        {/* Chuỗi slide — nội dung mảng, không data-element-key từng item;
            gắn 1 key cấp-container để editor chọn khối chung. */}
        <div
          data-element-key='slides'
          className={selectableClass(activeKey === 'slides', 'flex flex-col')}
          style={{
            marginTop: 'clamp(48px, 8cqi, 96px)',
            gap: 'clamp(56px, 9cqi, 120px)',
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={`springs-design-slide-${i}`}
              className={`springs-design-slide flex flex-col gap-6 @2xl:items-center @2xl:gap-12 ${
                i % 2 === 1 ? '@2xl:flex-row-reverse' : '@2xl:flex-row'
              }`}
            >
              <div
                className='w-full overflow-hidden @2xl:w-1/2'
                style={{
                  aspectRatio: '4 / 3',
                  borderRadius: 'clamp(4px, 0.8cqi, 12px)',
                }}
              >
                {slide.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={slide.imageUrl}
                    alt={slide.subtitle || content.heading || 'Design'}
                    className='springs-design-slide-img h-full w-full'
                    style={{ objectFit: 'cover', display: 'block' }}
                  />
                ) : null}
              </div>

              <div className='w-full @2xl:w-1/2'>
                {slide.subtitle ? (
                  <p
                    style={{
                      margin: 0,
                      fontFamily: SPRINGS_DESIGN_FONT_SERIF,
                      fontWeight: 400,
                      fontSize: 'clamp(20px, 2.6cqi, 30px)',
                      lineHeight: 1.25,
                      color: SPRINGS_DESIGN_INK,
                      marginBottom: 'clamp(12px, 1.8cqi, 20px)',
                    }}
                  >
                    {slide.subtitle}
                  </p>
                ) : null}
                {slide.text ? (
                  <p
                    style={{
                      margin: 0,
                      fontFamily: SPRINGS_DESIGN_FONT_BODY,
                      fontWeight: 400,
                      fontSize: 'clamp(15px, 1.6cqi, 18px)',
                      lineHeight: 1.6,
                      color: SPRINGS_DESIGN_INK,
                      opacity: 0.72,
                      maxWidth: '52ch',
                    }}
                  >
                    {slide.text}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
