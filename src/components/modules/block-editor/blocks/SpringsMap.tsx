'use client';

/**
 * Block "Springs - Map" (section `.l-map` / `#l-map-sticky` của
 * springs-estate-clone) — bản gốc là sticky-scroll phức tạp (parallax ảnh nền
 * + clip-path reveal caption). Ở đây rút gọn thành 1 section tĩnh full-bleed:
 * heading + description overlay ở góc dưới trên nền ảnh bản đồ vị trí dự án,
 * kèm icon "scroll" nhỏ (đúng icon gốc `#scroll` trong icons.svg).
 *
 * Copy gốc (`.l-map-caption__text h3`): "Easy access to Nature Park.
 * Landscapes of watercolor tenderness that belong only to you." — tách làm 2
 * (heading câu đầu, description câu sau) cho khớp interface `heading` +
 * `description`.
 *
 * Font thật của bản gốc (self-host tại springs.estate/assets/fonts):
 *   - "Victor Serif" (heading, VictorSerif-40Regular.woff2)
 *   - "TT Commons Pro" (description, TT_Commons_Pro_Regular.woff2 400 +
 *     TTCommonsPro-Md.woff2 500)
 * Nạp qua @font-face trỏ thẳng CDN gốc (không self-host lại) — khai báo lặp
 * giữa các block Springs vô hại, trình duyệt chỉ tải 1 lần.
 *
 * Motion: ảnh bản đồ scale-in nhẹ + fade khi cuộn vào viewport, heading/mô tả
 * fade-up theo sau (ScrollTrigger, scroller qua useBlockMotion, toggleActions
 * play/reverse, invalidateOnRefresh). Tôn trọng prefers-reduced-motion.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SpringsMapContent,
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
const SPRINGS_MAP_FONT_HEADING =
  "'Victor Serif', 'Cormorant Garamond', Georgia, 'Times New Roman', serif";

/** Sans dùng cho description — bản gốc: TT Commons Pro. */
const SPRINGS_MAP_FONT_BODY =
  "'TT Commons Pro', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const SPRINGS_MAP_FONT_CSS = `
@font-face { font-family: 'Victor Serif'; src: url('https://springs.estate/assets/fonts/VictorSerif-40Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TT_Commons_Pro_Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TTCommonsPro-Md.woff2') format('woff2'); font-weight: 500; font-style: normal; font-display: swap; }
`;

interface Props {
  content: SpringsMapContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function SpringsMap({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      if (!root) return;
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (reduce) return;

      const image = root.querySelector<HTMLElement>('.springs-map-image');
      const copy = root.querySelector<HTMLElement>('.springs-map-copy');
      const hint = root.querySelector<HTMLElement>('.springs-map-hint');

      // Ảnh bản đồ: scale nhẹ 1.12 → 1 + fade-in khi section vào viewport.
      if (image) {
        gsap.fromTo(
          image,
          { scale: 1.12, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }

      // Heading + description: fade-up, hơi trễ so với ảnh.
      if (copy) {
        gsap.fromTo(
          copy,
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            delay: 0.25,
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }

      // Icon "scroll": fade-in nhẹ, chậm hơn nữa (chi tiết phụ).
      if (hint) {
        gsap.fromTo(
          hint,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.8,
            ease: 'power1.out',
            delay: 0.6,
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }
    },
    []
  );

  return (
    <section
      ref={rootRef}
      className='springs-map @container relative w-full overflow-hidden'
      style={composeStyle(
        {
          minHeight: 'clamp(480px, 68cqi, 900px)',
          background: '#132018',
        },
        blockBackgroundStyle(background)
      )}
    >
      <style>{SPRINGS_MAP_FONT_CSS}</style>

      {content.mapImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          data-element-key='mapImage'
          src={content.mapImage}
          alt=''
          aria-hidden='true'
          className={selectableClass(
            activeKey === 'mapImage',
            'springs-map-image absolute inset-0 h-full w-full'
          )}
          style={composeStyle(
            { objectFit: 'cover', objectPosition: 'center' },
            styleOf('mapImage')
          )}
        />
      ) : null}

      {/* Dark gradient overlay — giữ chữ đọc được trên nền ảnh bản đồ. */}
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          background:
            'linear-gradient(0deg, rgba(10,20,15,0.65) 0%, rgba(10,20,15,0.15) 42%, rgba(10,20,15,0) 68%)',
        }}
      />

      {/* Heading + description — góc dưới trái, như bản gốc `.l-map-caption__text`. */}
      <div
        className='springs-map-copy absolute inset-x-0 bottom-0'
        style={{
          padding: 'clamp(24px, 6cqi, 80px)',
          paddingTop: 'clamp(48px, 10cqi, 140px)',
        }}
      >
        <div style={{ maxWidth: 'clamp(280px, 42cqi, 620px)' }}>
          {content.heading ? (
            <h3
              data-element-key='heading'
              className={selectableClass(activeKey === 'heading')}
              style={composeStyle(
                {
                  margin: 0,
                  fontFamily: SPRINGS_MAP_FONT_HEADING,
                  fontWeight: 400,
                  fontSize: 'clamp(22px, 3.2cqi, 34px)',
                  lineHeight: 1.25,
                  color: '#f5f4ef',
                },
                styleOf('heading')
              )}
            >
              {content.heading}
            </h3>
          ) : null}

          {content.description ? (
            <p
              data-element-key='description'
              className={selectableClass(activeKey === 'description')}
              style={composeStyle(
                {
                  marginTop: 'clamp(10px, 1.6cqi, 18px)',
                  fontFamily: SPRINGS_MAP_FONT_BODY,
                  fontSize: 'clamp(13px, 1.4cqi, 16px)',
                  lineHeight: 1.5,
                  color: 'rgba(245,244,239,0.78)',
                },
                styleOf('description')
              )}
            >
              {content.description}
            </p>
          ) : null}
        </div>

        {/* Icon "scroll" nhỏ — đúng icon gốc `#scroll` trong icons.svg. */}
        <div
          className='springs-map-hint mt-[clamp(20px,3cqi,40px)] flex items-center'
          style={{ gap: 'clamp(6px, 1cqi, 10px)', color: '#f5e8d1' }}
        >
          <span
            aria-hidden='true'
            style={{
              display: 'inline-flex',
              width: 'clamp(26px, 2.2cqi, 32px)',
              height: 'clamp(13px, 1.1cqi, 16px)',
            }}
          >
            <svg viewBox='0 0 30 15' width='100%' height='100%'>
              <rect width='30' height='15' rx='7.5' fill='#162D24' />
              <path
                d='M8.429 4 5 6.857v.571m3.429 3.429L5 8v-.572m0 0h10M21.571 4 25 6.857v.571m-3.429 3.429L25 8v-.572m0 0H15'
                stroke='#F5E8D1'
                strokeWidth={1.5}
                fill='none'
              />
            </svg>
          </span>
          <span
            style={{
              fontFamily: SPRINGS_MAP_FONT_BODY,
              fontSize: 'clamp(10px, 0.95cqi, 12px)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Scroll
          </span>
        </div>
      </div>
    </section>
  );
}
