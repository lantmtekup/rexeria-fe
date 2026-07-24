'use client';

/**
 * The Grand · Intro — section editorial nền nâu (heading + description căn giữa,
 * tượng sư tử neo đáy). Port từ apps/the-grand `Intro`.
 *
 * Motion — Motion Attribute System (T1/T2), KHÔNG GSAP tay:
 * - Entrance TỰ CHỨA khai bằng `data-motion` + `useMotionAttributes`:
 *   heading `line-reveal`, description + lion `fade-up`; sequence bằng 1
 *   `data-motion-group` (stagger-children) trên section.
 *   (Source scrub `scale/brightness` lên previousElementSibling là hiệu ứng
 *   XUYÊN block — không port được khi mỗi block render độc lập → đã bỏ.)
 * - `useMotionAttributes` tự skip trên editor edit-canvas (nội dung tĩnh, dễ
 *   sửa) + `prefers-reduced-motion`; lo scroller/refresh/revert (R1–R6).
 * - Cùng 1 layout cho canvas + preview + /p (block không pin/sticky).
 */

import * as React from 'react';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  TheGrandIntroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useMotionAttributes } from '../motion/useMotionAttributes';

const RESPONSIVE = {
  headingFont: 'clamp(28px, 6cqi, 56px)',
  descFont: 'clamp(13px, 1.9cqi, 16px)',
  descMt: 'clamp(24px, 3.5cqi, 40px)',
  padY: 'clamp(40px, 8cqi, 88px)',
  padX: 'clamp(20px, 5cqi, 64px)',
  lionW: 'clamp(160px, 26cqi, 280px)',
  // `@container` = inline-size → dùng cqi (không cqh). Chừa chiều cao & chỗ neo lion.
  sectionMinH: 'clamp(460px, 62cqi, 760px)',
  lionClearance: 'clamp(200px, 30cqi, 340px)',
} as const;

interface Props {
  content: TheGrandIntroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const BG_GRADIENT =
  'radial-gradient(120% 80% at 50% 0%, #5a3d29 0%, #3a2417 42%, #2a1a10 100%)';

export function TheGrandIntro({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const sectionRef = React.useRef<HTMLElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  // Entrance khai bằng data-motion bên dưới; hook tự skip trên edit-canvas +
  // reduced-motion, lo scroller/refresh/revert.
  useMotionAttributes(sectionRef);

  return (
    <section
      ref={sectionRef}
      // 1 ScrollTrigger cho cả section → 3 con [data-motion] chạy tuần tự
      // (heading → description → lion) theo DOM order, cách nhau stagger-children.
      data-motion-group
      data-motion-stagger-children='0.18'
      data-motion-start='top 80%'
      className={`the-grand-intro @container relative flex w-full flex-col overflow-hidden ${className ?? ''}`}
      style={composeStyle(
        {
          background: BG_GRADIENT,
          color: '#e8d9b5',
          minHeight: RESPONSIVE.sectionMinH,
        },
        blockBackgroundStyle(background)
      )}
    >
      <div
        className='mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center text-center'
        style={{
          paddingTop: RESPONSIVE.padY,
          paddingBottom: RESPONSIVE.lionClearance,
          paddingLeft: RESPONSIVE.padX,
          paddingRight: RESPONSIVE.padX,
        }}
      >
        <h2
          data-element-key='heading'
          data-motion='line-reveal'
          data-motion-duration='0.9'
          className={selectableClass(
            activeKey === 'heading',
            'the-grand-intro__heading pointer-events-auto'
          )}
          style={composeStyle(
            {
              margin: 0,
              maxWidth: 800,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: RESPONSIVE.headingFont,
              fontWeight: 500,
              lineHeight: 1.2,
              letterSpacing: '0.005em',
              color: '#e8d9b5',
            },
            styleOf('heading')
          )}
        >
          {content.heading}
        </h2>

        <p
          data-element-key='description'
          data-motion='fade-up'
          data-motion-distance='24'
          data-motion-duration='0.7'
          className={selectableClass(
            activeKey === 'description',
            'the-grand-intro__desc pointer-events-auto'
          )}
          style={composeStyle(
            {
              margin: 0,
              marginTop: RESPONSIVE.descMt,
              maxWidth: 640,
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: RESPONSIVE.descFont,
              fontWeight: 400,
              lineHeight: 1.8,
              color: '#c9bca6',
            },
            styleOf('description')
          )}
        >
          {content.description}
        </p>
      </div>

      {/* Tượng sư tử — neo đáy, căn giữa ngang. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-element-key='imageUrl'
        data-motion='fade-up'
        data-motion-distance='44'
        data-motion-duration='0.9'
        src={content.imageUrl}
        alt={content.imageAlt}
        loading='lazy'
        decoding='async'
        className={selectableClass(
          activeKey === 'imageUrl',
          'the-grand-intro__lion pointer-events-auto'
        )}
        style={composeStyle(
          {
            // Canh giữa transform-free (left/right:0 + margin auto) để không
            // tranh chấp với transform:translateY của fade-up / free-drag.
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            marginLeft: 'auto',
            marginRight: 'auto',
            display: 'block',
            width: RESPONSIVE.lionW,
            objectFit: 'contain',
          },
          styleOf('imageUrl')
        )}
      />
    </section>
  );
}
