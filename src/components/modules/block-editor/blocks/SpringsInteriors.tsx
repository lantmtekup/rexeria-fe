'use client';

/**
 * Block "Springs - Interiors" (section `.l-interiors` / `#interiors` của
 * springs-estate-clone) — bản gốc là sticky 2-layer parallax phức tạp (ảnh
 * nền full-bleed + slider ảnh nội thất + cụm thumbnail đổi ảnh). Ở đây rút
 * gọn thành: tiêu đề "Interiors" (phải-canh, serif lớn) + đoạn mô tả phụ, và
 * MỘT dải slider ảnh nội thất cuộn ngang (scroll-snap, kéo tay/touch) — thay
 * cho cơ chế content-animation JS gốc.
 *
 * `images` là dữ liệu nội dung dạng mảng (không có fieldType "list" trong
 * LayersPanel hiện tại — chỉ text/textarea/image đơn), nên KHÔNG gắn
 * `data-element-key` riêng cho từng ảnh; heading/description mới là 2 phần
 * tử chọn được trên canvas.
 *
 * Font thật của bản gốc (self-host tại springs.estate/assets/fonts):
 *   - "Victor Serif" (tiêu đề, VictorSerif-40Regular.woff2)
 *   - "TT Commons Pro" (mô tả + nhãn, TT_Commons_Pro_Regular.woff2 400 +
 *     TTCommonsPro-Md.woff2 500)
 * Nạp qua @font-face trỏ thẳng CDN gốc (không self-host lại) — khai báo lặp
 * giữa các block Springs vô hại, trình duyệt chỉ tải 1 lần.
 *
 * Motion: heading/description fade-up khi cuộn vào viewport; các ảnh trong
 * dải slider stagger-in (fade + rise nhẹ) cùng lúc. Tôn trọng
 * prefers-reduced-motion. Mobile: dải cuộn ngang scroll-snap chạm tay được.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SpringsInteriorsContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

/** Serif dùng cho tiêu đề — bản gốc: Victor Serif. */
export const SPRINGS_INTERIORS_FONT_SERIF =
  "'Victor Serif', 'Cormorant Garamond', Georgia, 'Times New Roman', serif";

/** Sans dùng cho mô tả — bản gốc: TT Commons Pro. */
export const SPRINGS_INTERIORS_FONT_BODY =
  "'TT Commons Pro', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Nền sáng nhẹ của section (bản gốc dùng ảnh nền tối; ở đây rút gọn slider
 *  đứng trên nền cream sáng để ảnh nổi bật, giữ mạch sáng/tối xen kẽ). */
export const SPRINGS_INTERIORS_BG = '#f4f1e9';

/** Chữ chính — xanh ink đậm (đối lập nền cream), đồng bộ SpringsIntro. */
export const SPRINGS_INTERIORS_INK = '#152018';

export const SPRINGS_INTERIORS_FONT_CSS = `
@font-face { font-family: 'Victor Serif'; src: url('https://springs.estate/assets/fonts/VictorSerif-40Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TT_Commons_Pro_Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TTCommonsPro-Md.woff2') format('woff2'); font-weight: 500; font-style: normal; font-display: swap; }
`;

interface Props {
  content: SpringsInteriorsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function SpringsInteriors({
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
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      if (!root) return;
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (reduce) return;

      const heading = root.querySelector<HTMLElement>(
        '.springs-interiors-heading'
      );
      const description = root.querySelector<HTMLElement>(
        '.springs-interiors-description'
      );
      const slides = root.querySelectorAll<HTMLElement>(
        '.springs-interiors-slide'
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
        tl.from(heading, { autoAlpha: 0, y: 32, duration: 0.8 }, 0);
      }
      if (description) {
        tl.from(description, { autoAlpha: 0, y: 24, duration: 0.7 }, 0.12);
      }
      if (slides.length) {
        tl.from(
          slides,
          {
            autoAlpha: 0,
            y: 36,
            duration: 0.7,
            stagger: 0.12,
          },
          0.2
        );
      }

      // Ảnh slider load bất đồng bộ có thể đổi chiều cao — refresh sau khi mount.
      requestRefresh();
    },
    [images.join('|')]
  );

  return (
    <section
      ref={rootRef}
      style={composeStyle(
        { background: SPRINGS_INTERIORS_BG },
        blockBackgroundStyle(background)
      )}
      className='springs-interiors @container relative w-full overflow-hidden'
    >
      <style>{SPRINGS_INTERIORS_FONT_CSS}</style>

      <div
        className='mx-auto flex w-full max-w-[1400px] flex-col items-end text-right @2xl:px-0'
        style={{
          padding:
            'clamp(64px, 10cqi, 140px) clamp(20px, 6cqi, 64px) clamp(32px, 5cqi, 64px)',
        }}
      >
        <h2
          data-element-key='heading'
          className={selectableClass(
            activeKey === 'heading',
            'springs-interiors-heading'
          )}
          style={composeStyle(
            {
              margin: 0,
              fontFamily: SPRINGS_INTERIORS_FONT_SERIF,
              fontWeight: 400,
              fontSize: 'clamp(36px, 6cqi, 76px)',
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
              color: SPRINGS_INTERIORS_INK,
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
              'springs-interiors-description'
            )}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: SPRINGS_INTERIORS_FONT_BODY,
                fontWeight: 400,
                fontSize: 'clamp(15px, 1.6cqi, 19px)',
                lineHeight: 1.6,
                color: SPRINGS_INTERIORS_INK,
                opacity: 0.72,
                maxWidth: '46ch',
                marginTop: 'clamp(16px, 2.6cqi, 28px)',
              },
              styleOf('description')
            )}
          >
            {content.description}
          </p>
        ) : null}
      </div>

      {/* Dải slider ảnh nội thất — cuộn ngang, scroll-snap, kéo tay/touch trên
          mọi kích thước (bản gốc chỉ có desktop-slider + mobile carousel
          riêng; ở đây gộp 1 dải responsive dùng chung). */}
      {images.length ? (
        <div
          className='springs-interiors-track flex w-full gap-[clamp(8px,1.6cqi,20px)] overflow-x-auto'
          style={{
            padding: '0 clamp(20px, 6cqi, 64px) clamp(64px, 9cqi, 120px)',
            scrollSnapType: 'x proximity',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${src}-${i}`}
              src={src}
              alt={`${content.heading || 'Interiors'} ${i + 1}`}
              loading={i < 2 ? 'eager' : 'lazy'}
              className='springs-interiors-slide h-[clamp(260px,42cqi,560px)] w-[clamp(200px,32cqi,420px)] shrink-0 object-cover'
              style={{
                scrollSnapAlign: 'start',
                borderRadius: 'clamp(2px, 0.4cqi, 6px)',
              }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
