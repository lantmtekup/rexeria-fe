'use client';

/**
 * Block "Springs - Residences" (section `.l-residences` của
 * springs-estate-clone, dòng 5717-6604 index.html) — bản gốc là 1 sticky-scroll
 * webgl/slider phức tạp xen kẽ ảnh phối cảnh toà nhà + panel caption bên phải.
 * Section không có 1 dòng heading tường minh riêng cho phần "Residences" — chỉ
 * có caption card theo từng slide (loại căn hộ) — nên ở đây rút gọn thành 1
 * gallery tĩnh: heading "Residences" + mô tả ngắn (rút từ tinh thần subtitle
 * hero gốc "Apartments, terraced townhouses, and duplex penthouses in a quiet,
 * green neighborhood") + dải 3 ảnh render toà nhà (`7.residence/residence-1..3`).
 *
 * Font thật của bản gốc (self-host tại springs.estate/assets/fonts), giống
 * SpringsIntro — khai báo lặp giữa các block Springs vô hại (trình duyệt chỉ
 * tải 1 lần):
 *   - "Victor Serif" (heading, VictorSerif-40Regular.woff2)
 *   - "TT Commons Pro" (mô tả, TT_Commons_Pro_Regular.woff2 400 +
 *     TTCommonsPro-Md.woff2 500)
 *
 * Motion: heading/description fade-up khi cuộn vào viewport; dải ảnh stagger
 * lên + parallax-lite (dịch object-position nhẹ theo scroll) — ScrollTrigger
 * qua useBlockMotion (R1-R6), tôn trọng prefers-reduced-motion.
 *
 * Mobile: dải ảnh chuyển thành scroll-snap ngang (overflow-x-auto + snap-x),
 * touch-friendly, không cần JS riêng cho gesture.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SpringsResidencesContent,
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
export const SPRINGS_RESIDENCES_FONT_SERIF =
  "'Victor Serif', 'Cormorant Garamond', Georgia, 'Times New Roman', serif";

/** Sans dùng cho mô tả — bản gốc: TT Commons Pro. */
export const SPRINGS_RESIDENCES_FONT_BODY =
  "'TT Commons Pro', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Nền cream nhạt đồng bộ tông brand Springs (bản gốc dùng nền ảnh full-bleed). */
export const SPRINGS_RESIDENCES_BG = '#f4f1e9';

/** Chữ chính — xanh ink đậm. */
export const SPRINGS_RESIDENCES_INK = '#152018';

export const SPRINGS_RESIDENCES_FONT_CSS = `
@font-face { font-family: 'Victor Serif'; src: url('https://springs.estate/assets/fonts/VictorSerif-40Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TT_Commons_Pro_Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TTCommonsPro-Md.woff2') format('woff2'); font-weight: 500; font-style: normal; font-display: swap; }
`;

interface Props {
  content: SpringsResidencesContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function SpringsResidences({
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
    ({ scroller }) => {
      const root = rootRef.current;
      if (!root) return;
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (reduce) return;

      const heading = root.querySelector<HTMLElement>(
        '.springs-residences-heading'
      );
      const description = root.querySelector<HTMLElement>(
        '.springs-residences-description'
      );
      const cards = root.querySelectorAll<HTMLElement>(
        '.springs-residences-card'
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
      if (cards.length) {
        tl.from(
          cards,
          { autoAlpha: 0, y: 48, duration: 0.8, stagger: 0.12 },
          0.24
        );
      }

      // Parallax-lite: mỗi ảnh trôi object-position nhẹ theo tiến trình cuộn
      // qua toàn section — cảm giác "sống" mà không dùng transform (an toàn
      // với img-cover, tránh xung đột clip trên Safari mobile).
      cards.forEach((card, i) => {
        const img = card.querySelector<HTMLElement>(
          '.springs-residences-card-img'
        );
        if (!img) return;
        gsap.fromTo(
          img,
          { yPercent: -4 },
          {
            yPercent: 4,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              scroller,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
        void i;
      });
    },
    [images.join('|')]
  );

  return (
    <section
      ref={rootRef}
      style={composeStyle(
        { background: SPRINGS_RESIDENCES_BG },
        blockBackgroundStyle(background)
      )}
      className='springs-residences @container relative w-full overflow-hidden'
    >
      <style>{SPRINGS_RESIDENCES_FONT_CSS}</style>

      <div
        className='mx-auto w-full max-w-[1440px]'
        style={{
          padding:
            'clamp(64px, 11cqi, 140px) clamp(20px, 6cqi, 64px) clamp(56px, 9cqi, 112px)',
        }}
      >
        <div
          className='flex flex-col items-start @2xl:flex-row @2xl:items-end @2xl:justify-between'
          style={{ gap: 'clamp(16px, 2.4cqi, 28px)' }}
        >
          <h2
            data-element-key='heading'
            className={selectableClass(
              activeKey === 'heading',
              'springs-residences-heading'
            )}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: SPRINGS_RESIDENCES_FONT_SERIF,
                fontWeight: 400,
                fontSize: 'clamp(32px, 5cqi, 58px)',
                lineHeight: 1.08,
                letterSpacing: '-0.01em',
                color: SPRINGS_RESIDENCES_INK,
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
                'springs-residences-description'
              )}
              style={composeStyle(
                {
                  margin: 0,
                  fontFamily: SPRINGS_RESIDENCES_FONT_BODY,
                  fontWeight: 400,
                  fontSize: 'clamp(14px, 1.5cqi, 18px)',
                  lineHeight: 1.55,
                  color: SPRINGS_RESIDENCES_INK,
                  opacity: 0.72,
                  maxWidth: '38ch',
                },
                styleOf('description')
              )}
            >
              {content.description}
            </p>
          ) : null}
        </div>

        {/* Dải ảnh render toà nhà — nội dung mảng, không key riêng từng ảnh
            (đúng tinh thần "images là content data"): editor chỉnh cả mảng
            qua 1 field ảnh, không chọn được từng item trên canvas. Luôn là
            1 dải flex scroll-snap ngang: card rộng cố định (clamp) khiến 3
            ảnh vừa khít side-by-side trên màn rộng, tự trôi ngang + snap khi
            hẹp hơn (mobile) — đúng tinh thần slider gốc của section này. */}
        {images.length ? (
          <div
            className='springs-residences-strip'
            style={{
              marginTop: 'clamp(32px, 5cqi, 56px)',
              display: 'flex',
              gap: 'clamp(12px, 1.8cqi, 20px)',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: '4px',
            }}
          >
            {images.map((src, idx) => (
              <div
                key={`${src}-${idx}`}
                className='springs-residences-card relative shrink-0 overflow-hidden'
                style={{
                  width: 'clamp(240px, 78cqi, 420px)',
                  aspectRatio: '4 / 5',
                  scrollSnapAlign: 'start',
                  borderRadius: 'clamp(2px, 0.4cqi, 6px)',
                  background: 'rgba(21,32,24,0.06)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${content.heading || 'Residence'} ${idx + 1}`}
                  className='springs-residences-card-img absolute inset-0 h-full w-full'
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  loading='lazy'
                  draggable={false}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
