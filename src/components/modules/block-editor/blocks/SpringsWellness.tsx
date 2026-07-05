'use client';

/**
 * Block "Springs - Wellness" (section `.l-wellness` / `#wellness` của
 * springs-estate-clone) — bản gốc là 1 sticky đôi (desktop: canvas WebGL
 * gradient + slider ảnh crossfade theo "chương" Spa/Yoga/Fitness/Café; mobile:
 * carousel ngang) rất nặng JS. Ở đây rút gọn thành: heading "Wellness" +
 * mô tả ngắn bên trên 1 dải ảnh ngang cuộn được (scroll-snap, KHÔNG WebGL),
 * có lớp gradient wash xanh rêu/teal phía sau mô phỏng nền webgl gốc.
 *
 * Font thật của bản gốc (trỏ thẳng CDN springs.estate, không self-host lại —
 * khai báo lặp giữa các block Springs vô hại, trình duyệt chỉ tải 1 lần):
 *   - "Victor Serif" (heading)
 *   - "TT Commons Pro" (mô tả)
 *
 * Motion: heading/description fade-up khi cuộn vào viewport; dải ảnh stagger
 * vào sau. Tất cả qua useBlockMotion (R1–R6), scroller trên mọi
 * scrollTrigger, honor prefers-reduced-motion.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SpringsWellnessContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

/** Serif dùng cho heading — bản gốc: Victor Serif. */
export const SPRINGS_WELLNESS_FONT_SERIF =
  "'Victor Serif', 'Cormorant Garamond', Georgia, 'Times New Roman', serif";

/** Sans dùng cho mô tả — bản gốc: TT Commons Pro. */
export const SPRINGS_WELLNESS_FONT_BODY =
  "'TT Commons Pro', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Nền xanh rêu/than tối của section wellness gốc (`ui-dark`). */
const SPRINGS_WELLNESS_BG = '#0d1613';

export const SPRINGS_WELLNESS_FONT_CSS = `
@font-face { font-family: 'Victor Serif'; src: url('https://springs.estate/assets/fonts/VictorSerif-40Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TT_Commons_Pro_Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TTCommonsPro-Md.woff2') format('woff2'); font-weight: 500; font-style: normal; font-display: swap; }
.springs-wellness-strip::-webkit-scrollbar { display: none; }
`;

interface Props {
  content: SpringsWellnessContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function SpringsWellness({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const images = Array.isArray(content.images) ? content.images : [];

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(
    rootRef,
    ({ scroller, isMobile, requestRefresh }) => {
      const root = rootRef.current;
      if (!root) return;
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (reduce) return;

      const heading = root.querySelector<HTMLElement>(
        '.springs-wellness-heading'
      );
      const description = root.querySelector<HTMLElement>(
        '.springs-wellness-description'
      );
      const slides = root.querySelectorAll<HTMLElement>(
        '.springs-wellness-slide'
      );

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top 78%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        },
      });

      if (heading) {
        tl.from(
          heading,
          { autoAlpha: 0, y: isMobile ? 24 : 36, duration: 0.8 },
          0
        );
      }
      if (description) {
        tl.from(
          description,
          { autoAlpha: 0, y: isMobile ? 20 : 28, duration: 0.8 },
          0.12
        );
      }
      if (slides.length) {
        tl.from(
          slides,
          {
            autoAlpha: 0,
            y: isMobile ? 24 : 40,
            duration: 0.7,
            stagger: 0.12,
          },
          0.24
        );
      }

      // R4: strip đổi chiều cao khi từng ảnh load xong → refresh lại trigger math.
      root
        .querySelectorAll<HTMLImageElement>('.springs-wellness-slide img')
        .forEach(img => {
          if (!img.complete) {
            img.addEventListener('load', requestRefresh, { once: true });
          }
        });
    },
    [images.length]
  );

  return (
    <section
      ref={rootRef}
      style={composeStyle(
        { background: SPRINGS_WELLNESS_BG },
        blockBackgroundStyle(background)
      )}
      className='springs-wellness @container relative w-full overflow-hidden'
    >
      <style>{SPRINGS_WELLNESS_FONT_CSS}</style>

      {/* Gradient wash xanh rêu/teal — thay cho canvas WebGL gốc. Thuần trang
          trí, không phải nội dung editable nên không cần data-element-key. */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0'
        style={{
          background:
            'radial-gradient(120% 90% at 12% 15%, rgba(58,122,101,0.55) 0%, rgba(13,22,19,0) 55%), radial-gradient(110% 100% at 88% 90%, rgba(45,140,133,0.45) 0%, rgba(13,22,19,0) 60%), linear-gradient(180deg, #0d1613 0%, #0a120f 100%)',
        }}
      />

      <div
        className='relative mx-auto flex w-full max-w-[1400px] flex-col'
        style={{
          padding: 'clamp(64px, 11cqi, 140px) clamp(20px, 6cqi, 64px)',
        }}
      >
        <div
          className='flex flex-col @4xl:flex-row @4xl:items-end @4xl:justify-between'
          style={{ gap: 'clamp(16px, 3cqi, 28px)' }}
        >
          <h2
            data-element-key='heading'
            className={selectableClass(
              activeKey === 'heading',
              'springs-wellness-heading'
            )}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: SPRINGS_WELLNESS_FONT_SERIF,
                fontWeight: 400,
                fontSize: 'clamp(40px, 7cqi, 88px)',
                lineHeight: 1.05,
                letterSpacing: '-0.01em',
                color: '#f3f1e9',
              },
              styleOf('heading')
            )}
          >
            {content.heading}
          </h2>

          {content.description ? (
            <p
              data-element-key='description'
              className={selectableClass(
                activeKey === 'description',
                'springs-wellness-description'
              )}
              style={composeStyle(
                {
                  margin: 0,
                  fontFamily: SPRINGS_WELLNESS_FONT_BODY,
                  fontWeight: 400,
                  fontSize: 'clamp(15px, 1.6cqi, 19px)',
                  lineHeight: 1.6,
                  color: 'rgba(243,241,233,0.78)',
                  maxWidth: '38ch',
                },
                styleOf('description')
              )}
            >
              {content.description}
            </p>
          ) : null}
        </div>

        {/* content.images: dải ảnh — KHÔNG key từng phần tử riêng. LayersPanel
            fieldType hiện chỉ hỗ trợ 'text' | 'textarea' | 'image' (không có
            kiểu mảng/gallery), nên coi cả mảng là 1 khối nội dung của block,
            giống cách MintV2Works xử lý danh sách card. */}
        <div
          className='springs-wellness-strip flex w-full snap-x snap-mandatory overflow-x-auto'
          style={{
            scrollbarWidth: 'none',
            gap: 'clamp(12px, 2cqi, 20px)',
            marginTop: 'clamp(40px, 7cqi, 88px)',
            paddingBottom: 'clamp(8px, 1.5cqi, 16px)',
          }}
        >
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className='springs-wellness-slide shrink-0 snap-center overflow-hidden'
              style={{
                width: 'clamp(220px, 34cqi, 420px)',
                aspectRatio: '3 / 4',
                borderRadius: 'clamp(8px, 1.4cqi, 20px)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${content.heading || 'Wellness'} ${i + 1}`}
                className='h-full w-full object-cover'
                loading='lazy'
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
