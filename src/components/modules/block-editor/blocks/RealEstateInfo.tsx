'use client';

/**
 * Block "Real Estate - Giới thiệu" — port section Framer `1.1 Intro`
 * (apps/real-estate-1). Graduate từ `apps/real-estate-1/lib/blocks/Info.tsx`,
 * nơi mọi con số dưới đây đã được suy ra từ `app/framer.css` trên canvas 372px
 * cố định (xem apps/real-estate-1/PORTING.md).
 *
 * Bố cục nguồn — box .framer-rgbiud rộng 322, top 516, cao 272; các con định vị
 * absolute (Page.tsx:1436-1511):
 *
 *   .framer-139cmad  top:0    left:132  60x60  — icon mặt trời
 *   .framer-6my1kw   top:99   canh giữa        — tiêu đề (23px)
 *   .framer-2pl2ux   top:154  canh giữa  w:322 — mô tả (14px)
 *
 * DOM order ngược visual order (mô tả emit trước); `top` mới là thứ quyết định.
 * Dựng lại ở đây thành flex column canh giữa.
 *
 * Khác biệt CÓ CHỦ ĐÍCH so với bản apps — theo đúng quy ước 2 block anh em
 * `RealEstateLocation` / `RealEstateHero` đã lập:
 *
 * 1. THÊM font. Bản apps cố tình bỏ trống fontFamily để style editor thắng;
 *    trên host điều đó làm section mất hẳn chất chữ gốc. Dùng helper dùng chung
 *    `realEstateFonts.ts` (self-host woff2 trong public/real-estate/fonts/).
 *
 * 2. THÊM entrance. Nguồn có style-appear (fade-up) nhưng `withFX` bên apps
 *    không implement nhánh đó nên chưa từng chạy. Dựng lại bằng GSAP, dùng
 *    NGUYÊN timing của `RealEstateLocation` — cùng họ section thì cùng cảm giác.
 *
 * 3. THÊM khoảng hở trên. Bản apps để page flow lo khoảng cách (section nằm
 *    `top:516` trên canvas). Xếp chồng trong host thì icon sẽ dính đáy block
 *    phía trước → RE_SECTION_GAP.
 *
 * 4. Icon thành FIELD ẢNH (`iconUrl`) thay vì hằng SVG inline. Author đổi được
 *    từ Layers, và nó gỡ luôn hazard bản apps tự cảnh báo: `<clipPath>` gốc mang
 *    id cố định `clip0_1795_10182`, đụng nhau ngay khi block xuất hiện 2 lần
 *    trên một trang. Asset đã strip defs/clip-path (rect 60x60 trùng viewBox nên
 *    là no-op) → `public/real-estate/intro-sunburst.svg`.
 */
import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type { RealEstateInfoContent } from '../types';
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
  FONT_CSS,
  FONT_HEADING,
  RE_SECTION_GAP,
  SAND,
} from './realEstateFonts';

export function RealEstateInfo({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<RealEstateInfoContent>) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  /**
   * Entrance — giống hệt `RealEstateLocation`: nguồn (Page.tsx `textEffect`)
   * tokenization 'line', trigger 'onInView', animation3 `{opacity:.001, y:10}`,
   * transition3 `{type:'spring', bounce:0, duration:.7, delay:.075}`,
   * startDelay .1. Spring bounce:0 = không nảy → 'power2.out' sát nhất.
   *
   * Stagger theo ELEMENT, không theo ký tự: PORTING.md gọi stagger per-character
   * là "cách chắc chắn nhất làm trang sai cảm giác".
   */
  useBlockMotion(rootRef, ({ scroller, requestRefresh }) => {
    const root = rootRef.current;
    if (!root) return;
    // Phải return TRƯỚC fromTo — nếu không các node kẹt ở opacity:0.
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

    // Icon load xong → chiều cao block chốt lại, ScrollTrigger phải đo lại.
    const icon = root.querySelector('img');
    if (icon && !icon.complete) {
      icon.addEventListener('load', requestRefresh, { once: true });
    }
  });

  return (
    <div
      ref={rootRef}
      style={composeStyle(
        { backgroundColor: SAND },
        blockBackgroundStyle(background)
      )}
      className={cn('@container w-full', className)}
    >
      <style>{FONT_CSS}</style>

      {/* Khoảng hở dọc nằm ở wrapper TRONG chứ không phải root: `cqi` không
          query được chính element đang khai container-type, nên đặt ở root thì
          nó resolve theo container tổ tiên — không phải bề rộng block này. */}
      <div
        className='flex flex-col items-center text-center'
        style={{ paddingTop: RE_SECTION_GAP, paddingBottom: RE_SECTION_GAP }}
      >
        {/* Icon. Nguồn 60x60 trên canvas 372 = 16.1cqi, canh giữa (left 132 + 30
            = 162 ≈ nửa box 322). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-appear
          data-element-key='iconUrl'
          src={content.iconUrl}
          alt=''
          aria-hidden
          className={selectableClass(activeKey === 'iconUrl')}
          style={composeStyle(
            {
              width: 'clamp(44px, 16.1cqi, 76px)',
              height: 'clamp(44px, 16.1cqi, 76px)',
              objectFit: 'contain',
            },
            styleOf('iconUrl')
          )}
        />

        <h2
          data-appear
          data-element-key='title'
          className={selectableClass(activeKey === 'title')}
          style={composeStyle(
            {
              // 23px trên 372 = 6.18cqi; line-height 31.5456/23 = 1.372.
              fontFamily: FONT_HEADING,
              fontSize: 'clamp(22px, 6.18cqi, 40px)',
              lineHeight: 1.372,
              color: BROWN,
              // Face đã là semibold → 400 là đúng, không phải 600.
              fontWeight: 400,
              // Hở gốc: title top 99 − icon bottom 60 = 39px = 10.5cqi.
              marginTop: 'clamp(16px, 10.5cqi, 44px)',
            },
            styleOf('title')
          )}
        >
          {content.title}
        </h2>

        <p
          data-appear
          data-element-key='description'
          className={cn(
            selectableClass(activeKey === 'description'),
            // Nguồn rộng 322 trên canvas 372 = 86.6cqi.
            'w-[min(86.6cqi,640px)]'
          )}
          style={composeStyle(
            {
              // 14px trên 372 = 3.76cqi; line-height 23.6592/14 = 1.69.
              fontFamily: FONT_BODY,
              fontSize: 'clamp(13px, 3.76cqi, 17px)',
              lineHeight: 1.69,
              color: BROWN,
              // Hở gốc: description top 154 − đáy title ~130.5 = 23.5px = 6.3cqi.
              marginTop: 'clamp(10px, 6.3cqi, 26px)',
            },
            styleOf('description')
          )}
        >
          {content.description}
        </p>
      </div>
    </div>
  );
}
