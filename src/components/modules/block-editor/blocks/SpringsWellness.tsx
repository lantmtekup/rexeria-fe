'use client';

/**
 * Block "Springs - Wellness" (section `.l-wellness` / `#wellness` của
 * springs-estate-clone) — ĐÍNH CHÍNH so với ghi chú cũ (từng đoán nhầm có
 * "chương" Spa/Yoga/Fitness/Café dạng WebGL chapter-swap — đọc lại source
 * thật KHÔNG thấy nav/chapter nào, chỉ có: `.l-wellness__webgl-title`
 * (eyebrow "Essence of Self-Care" + heading "Wellness", canh phải) và
 * `.l-wellness__slider` — mỗi ảnh trong slider có `data-plugin="parallax"`
 * clip-path reveal riêng (gốc `--120-0` ẩn dưới đáy → `--220-0` hiện trọn,
 * CÙNG shape với `CLIP_HIDDEN_BOTTOM`/`CLIP_FULL` đã dùng ở
 * `SpringsMap.tsx`). Ở đây port ĐÚNG 2 phần này: tagline+heading canh phải,
 * và mỗi ảnh trong dải có ScrollTrigger riêng animate clip-path khi cuộn tới
 * (không phải fade+rise đơn thuần như bản trước) — KHÔNG dựng canvas WebGL
 * thật (`.l-wellness__webgl-circle` xấp xỉ bằng radial-gradient tĩnh, giữ
 * nguyên như bản trước, R1: không thêm runtime nặng ngoài GSAP).
 *
 * Font thật của bản gốc (trỏ thẳng CDN springs.estate, không self-host lại —
 * khai báo lặp giữa các block Springs vô hại, trình duyệt chỉ tải 1 lần):
 *   - "Victor Serif" (heading)
 *   - "TT Commons Pro" (tagline + mô tả)
 *
 * Motion: heading/description fade-up khi cuộn vào viewport; MỖI ảnh trong
 * dải có ScrollTrigger riêng animate `clip-path` (hidden-bottom → full) khi
 * cuộn tới, toggleActions play/reverse (không scrub — khớp cảm giác "reveal
 * khi vào viewport" của bản gốc hơn là 1 pin dài). Tất cả qua useBlockMotion
 * (R1–R6), scroller trên mọi scrollTrigger, honor prefers-reduced-motion.
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

/** clip-path đầy đủ / ẩn-dưới-đáy — cùng quy ước `SpringsMap.tsx`. */
const WELLNESS_CLIP_FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
const WELLNESS_CLIP_HIDDEN_BOTTOM =
  'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)';

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
      // Mỗi ảnh: clip-path reveal riêng khi cuộn tới (gốc `data-parallax`
      // `--120-0` ẩn dưới đáy → `--220-0` hiện trọn), không phải fade+rise
      // đơn thuần — khớp cảm giác "curtain reveal" của bản gốc.
      slides.forEach((slide, i) => {
        const clip = slide.querySelector<HTMLElement>(
          '.springs-wellness-slide-clip'
        );
        if (!clip) return;
        gsap.fromTo(
          clip,
          { clipPath: WELLNESS_CLIP_HIDDEN_BOTTOM },
          {
            clipPath: WELLNESS_CLIP_FULL,
            duration: 0.9,
            ease: 'power2.out',
            delay: (i % 2) * 0.08,
            scrollTrigger: {
              trigger: slide,
              scroller,
              start: isMobile ? 'top 90%' : 'top 85%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      });

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
          className='flex flex-col items-end text-right'
          style={{ gap: 'clamp(8px, 1.2cqi, 14px)' }}
        >
          {content.tagline ? (
            <p
              data-element-key='tagline'
              className={selectableClass(
                activeKey === 'tagline',
                'springs-wellness-tagline'
              )}
              style={composeStyle(
                {
                  margin: 0,
                  fontFamily: SPRINGS_WELLNESS_FONT_BODY,
                  fontWeight: 400,
                  fontSize: 'clamp(14px, 1.5cqi, 17px)',
                  color: 'rgba(243,241,233,0.7)',
                },
                styleOf('tagline')
              )}
            >
              {content.tagline}
            </p>
          ) : null}
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
              <div className='springs-wellness-slide-clip h-full w-full'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${content.heading || 'Wellness'} ${i + 1}`}
                  className='h-full w-full object-cover'
                  loading='lazy'
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
