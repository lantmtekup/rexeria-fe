'use client';

/**
 * Block "Springs - Intro" (section `.l-intro` / `#about` của
 * springs-estate-clone) — bản gốc là 1 sticky-scroll phức tạp (parallax ảnh
 * + reveal chữ). Ở đây rút gọn thành đúng phần "brand statement" tĩnh: câu
 * lớn serif "Open the doors of Springs and step into your true self" +
 * đoạn mô tả phụ bên dưới, không ảnh — 1 khoảng lặng "thở" giữa hero và các
 * section nội dung tiếp theo (padding dọc rộng, nền sáng nhẹ).
 *
 * Font thật của bản gốc (self-host tại springs.estate/assets/fonts):
 *   - "Victor Serif" (câu lớn, VictorSerif-40Regular.woff2)
 *   - "TT Commons Pro" (đoạn phụ, TT_Commons_Pro_Regular.woff2 400 +
 *     TTCommonsPro-Md.woff2 500)
 * Nạp qua @font-face trỏ thẳng CDN gốc (không self-host lại) — khai báo lặp
 * giữa các block Springs vô hại, trình duyệt chỉ tải 1 lần.
 *
 * Motion: statement fade + rise-up khi cuộn vào viewport (ScrollTrigger,
 * scroller qua useBlockMotion, toggleActions play/reverse), đoạn mô tả theo
 * sau với delay/stagger nhẹ. Tôn trọng prefers-reduced-motion.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SpringsIntroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

/** Serif dùng cho câu tuyên ngôn lớn — bản gốc: Victor Serif. */
export const SPRINGS_FONT_SERIF =
  "'Victor Serif', 'Cormorant Garamond', Georgia, 'Times New Roman', serif";

/** Sans dùng cho đoạn mô tả phụ — bản gốc: TT Commons Pro. */
export const SPRINGS_FONT_BODY =
  "'TT Commons Pro', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Nền cream/sage rất nhạt của section "thở" — không có trong bản gốc (bản
 *  gốc dùng ảnh nền), chọn tông phù hợp brand Springs (xanh ink trên cream). */
export const SPRINGS_BG = '#f4f1e9';

/** Chữ chính — xanh ink đậm (đối lập nền cream). */
export const SPRINGS_INK = '#152018';

export const SPRINGS_FONT_CSS = `
@font-face { font-family: 'Victor Serif'; src: url('https://springs.estate/assets/fonts/VictorSerif-40Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TT_Commons_Pro_Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TTCommonsPro-Md.woff2') format('woff2'); font-weight: 500; font-style: normal; font-display: swap; }
`;

interface Props {
  content: SpringsIntroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function SpringsIntro({
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

      const tagline = root.querySelector<HTMLElement>('.springs-intro-tagline');
      const statement = root.querySelector<HTMLElement>(
        '.springs-intro-statement'
      );
      const description = root.querySelector<HTMLElement>(
        '.springs-intro-description'
      );

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        },
      });

      if (tagline) {
        tl.from(tagline, { autoAlpha: 0, y: 20, duration: 0.7 }, 0);
      }
      if (statement) {
        tl.from(statement, { autoAlpha: 0, y: 40, duration: 0.9 }, 0.08);
      }
      if (description) {
        tl.from(description, { autoAlpha: 0, y: 28, duration: 0.8 }, 0.28);
      }
    },
    []
  );

  return (
    <section
      ref={rootRef}
      style={composeStyle(
        { background: SPRINGS_BG },
        blockBackgroundStyle(background)
      )}
      className='springs-intro @container relative w-full'
    >
      <style>{SPRINGS_FONT_CSS}</style>
      <div
        className='mx-auto flex w-full max-w-[960px] flex-col items-center text-center'
        style={{
          padding:
            'clamp(96px, 16cqi, 220px) clamp(20px, 6cqi, 64px) clamp(96px, 16cqi, 220px)',
        }}
      >
        {content.tagline ? (
          <p
            data-element-key='tagline'
            className={selectableClass(
              activeKey === 'tagline',
              'springs-intro-tagline'
            )}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: SPRINGS_FONT_BODY,
                fontWeight: 500,
                fontSize: 'clamp(12px, 1.4cqi, 15px)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: SPRINGS_INK,
                opacity: 0.6,
                marginBottom: 'clamp(16px, 2.4cqi, 28px)',
              },
              styleOf('tagline')
            )}
          >
            {content.tagline}
          </p>
        ) : null}

        <h2
          data-element-key='statement'
          className={selectableClass(
            activeKey === 'statement',
            'springs-intro-statement'
          )}
          style={composeStyle(
            {
              margin: 0,
              fontFamily: SPRINGS_FONT_SERIF,
              fontWeight: 400,
              fontSize: 'clamp(32px, 5.4cqi, 64px)',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              color: SPRINGS_INK,
            },
            styleOf('statement')
          )}
        >
          {content.statement}
        </h2>

        {content.description ? (
          <p
            data-element-key='description'
            className={selectableClass(
              activeKey === 'description',
              'springs-intro-description'
            )}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: SPRINGS_FONT_BODY,
                fontWeight: 400,
                fontSize: 'clamp(15px, 1.6cqi, 19px)',
                lineHeight: 1.6,
                color: SPRINGS_INK,
                opacity: 0.72,
                maxWidth: '46ch',
                marginTop: 'clamp(24px, 3.6cqi, 40px)',
              },
              styleOf('description')
            )}
          >
            {content.description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
