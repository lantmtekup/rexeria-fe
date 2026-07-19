'use client';

/**
 * Block "Real Estate - Tổng quan" — port section Framer `5. Tổng quan dự án`
 * (apps/real-estate-1). Graduate từ `apps/real-estate-1/lib/blocks/Overview.tsx`,
 * nơi mọi con số dưới đây đã được suy ra từ `app/framer.css` trên canvas 372px
 * cố định (xem apps/real-estate-1/PORTING.md).
 *
 * Bố cục nguồn — box 310x793 tại top 2000 trên canvas 372:
 *
 *   .framer-1fdxcky  top:0                 — tiêu đề, 2 dòng, canh giữa
 *   .framer-1d0fe9q  top:103   h:201       — hàng 1
 *   .framer-1sasky6  top:351   h:201       — hàng 2
 *   .framer-sx9kut   top:592   h:201       — hàng 3
 *
 * Mỗi hàng `justify-content: center` với hai ô 155x201, và 155*2 = 310 lấp vừa
 * khít hàng nên hai cột dính sát nhau. Trong mỗi ô, layout giống hệt nhau bất
 * kể thứ tự DOM:
 *
 *   icon  top:0    ~139x138 tại left 8-9 (canh giữa trong cột 155)
 *   text  top:154  left:0   width:155    (canh giữa, 12px)
 *
 * Hai cái bẫy bản port phải ĐO chứ không đọc được:
 *
 * 1. Thứ tự DOM đảo giữa các hàng — hàng 1 emit text trước icon, hàng 2-3 emit
 *    icon trước text. Không khác gì về mặt nhìn (cả hai đều absolute theo luật
 *    chung ở trên) nên dựng lại đồng nhất.
 * 2. Mọi hàng khai `gap: 11.16.96px`, là CSS KHÔNG HỢP LỆ (hai dấu chấm thập
 *    phân). Trình duyệt bỏ luôn khai báo — computed `gap` là `normal`, tức 0.
 *    Đã xác nhận trên trang thật; ĐỪNG "sửa" thành 11.16px, làm vậy hàng sẽ
 *    phình quá box 310px.
 *
 * Khác biệt CÓ CHỦ ĐÍCH so với bản apps — theo đúng quy ước 3 block anh em
 * `RealEstateLocation` / `RealEstateHero` / `RealEstateInfo` đã lập:
 *
 * 1. THÊM font. Bản apps cố tình bỏ trống fontFamily để style editor thắng;
 *    trên host điều đó làm section mất hẳn chất chữ gốc. Nguồn dùng SVN-Adero
 *    SemiBold cho CẢ tiêu đề lẫn chữ trong ô → `FONT_HEADING` cho cả hai.
 *
 * 2. THÊM entrance. Nguồn có style-appear (fade-up) nhưng `withFX` bên apps
 *    không implement nhánh đó nên chưa từng chạy. Dựng lại bằng GSAP, dùng
 *    NGUYÊN timing của `RealEstateInfo` — cùng họ section thì cùng cảm giác.
 *
 * 3. THÊM khoảng hở trên/dưới. Bản apps để page flow lo (section nằm `top:2000`
 *    trên canvas). Xếp chồng trong host thì tiêu đề sẽ dính đáy block phía
 *    trước → `RE_SECTION_GAP` (chính là 104px đo được TRÊN section này).
 *
 * 4. Icon thành FIELD ẢNH (`stats[i].iconUrl`) thay vì hằng SVG inline. Author
 *    đổi được từ Layers, và nó gỡ luôn hazard bản apps tự cảnh báo
 *    (`overviewIcons.ts:9-11`): `<clipPath>` gốc mang id cố định
 *    `clip0_1795_11404`…`11409`, đụng nhau ngay khi block xuất hiện 2 lần trên
 *    một trang. Sáu asset đã strip defs/clip-path (rect clip trùng viewBox trên
 *    cả 6 nên là no-op) → `public/real-estate/overview-*.svg`.
 *
 * 5. THÊM nền `SAND` như Info (bản apps để trong suốt, dựa vào nền trang).
 *
 * Số hạng mục CỐ ĐỊNH 6, không mở list manager: `StatsControls` sẵn có là
 * generic trên `{value,label}[]` nên không dùng lại được cho `{iconUrl,text}`,
 * và hạng mục thứ 7 sẽ không có icon mặc định nào hợp lý.
 *
 * Lưới giữ 2 cột ở MỌI bề rộng như nguồn — chỉ cap chiều rộng cột nội dung,
 * đúng quy ước 3 block anh em (không reflow theo breakpoint).
 */
import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type { RealEstateOverviewContent } from '../types';
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
  FONT_HEADING,
  RE_SECTION_GAP,
  SAND,
  FONT_CSS,
} from './realEstateFonts';

export function RealEstateOverview({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<RealEstateOverviewContent>) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  /**
   * Entrance — giống hệt `RealEstateInfo`: nguồn (Page.tsx `textEffect`)
   * tokenization 'line', trigger 'onInView', animation3 `{opacity:.001, y:10}`,
   * transition3 `{type:'spring', bounce:0, duration:.7, delay:.075}`,
   * startDelay .1. Spring bounce:0 = không nảy → 'power2.out' sát nhất.
   *
   * Stagger theo ELEMENT, không theo ký tự: PORTING.md gọi stagger
   * per-character là "cách chắc chắn nhất làm trang sai cảm giác".
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
    // Sáu ảnh chứ không phải một (Info chỉ có một) → phải lặp.
    root.querySelectorAll('img').forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', requestRefresh, { once: true });
      }
    });
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

      {/* Cột nội dung: box nguồn rộng 310 trên canvas 372 = 83.3cqi.
          Khoảng hở dọc nằm ở wrapper TRONG chứ không phải root: `cqi` không
          query được chính element đang khai container-type, nên đặt ở root thì
          nó resolve theo container tổ tiên — không phải bề rộng block này. */}
      <div
        className='mx-auto w-[min(83.3cqi,700px)]'
        style={{ paddingTop: RE_SECTION_GAP, paddingBottom: RE_SECTION_GAP }}
      >
        <h2
          data-appear
          data-element-key='title'
          className={cn(
            selectableClass(activeKey === 'title'),
            // Nguồn tách tiêu đề thành hai <p> ("Tổng quan" / " dự án") để
            // Framer stagger từng dòng; giữ lại bằng `\n` tường minh. Dấu cách
            // đầu dòng 2 là artefact tokenisation, bỏ.
            'text-center whitespace-pre-line'
          )}
          style={composeStyle(
            {
              // 23px trên 372 = 6.18cqi; line-height 31.5456/23 = 1.372.
              fontFamily: FONT_HEADING,
              fontSize: 'clamp(22px, 6.18cqi, 40px)',
              lineHeight: 1.372,
              color: BROWN,
              // Face đã là semibold → 400 là đúng, không phải 600.
              fontWeight: 400,
            },
            styleOf('title')
          )}
        >
          {content.title}
        </h2>

        {/* Hàng: pitch 103 → 351 → 592, tức 248 và 241 so với ô cao 201, nên hở
            dọc là 47 / 41. Dựng lại đồng nhất 44px = 11.8cqi.
            Hở ngang là 0 (xem bẫy 2 ở docblock trên). */}
        <div
          className='grid grid-cols-2 gap-x-0 gap-y-[clamp(24px,11.8cqi,64px)]'
          style={{
            // Đáy tiêu đề (63.1) → top hàng 1 (103) = ~40px = 10.75cqi.
            marginTop: 'clamp(20px, 10.75cqi, 56px)',
          }}
        >
          {content.stats.map((stat, i) => {
            const iconKey = `stats[${i}].iconUrl`;
            const textKey = `stats[${i}].text`;
            return (
              <div key={i} data-appear className='flex flex-col items-center'>
                {/* Icon: 139 trên canvas 372 = 37.4cqi.
                    KHÔNG dùng `89.7%` (139 trên cột 155) như bản apps: phần
                    trăm không có trần, nên ở container 1440 icon phình lên
                    ~314px trong khi chữ đã kịch trần clamp 15px — tỉ lệ gốc
                    139:12 vỡ thành 21:1. Clamp theo cqi giữ icon đi cùng nhịp
                    với title/text. Biên lấy đúng hệ số của `RealEstateInfo`
                    (min .73×, max 1.27× cỡ gốc); tại khung mobile 390 giá trị
                    này ra đúng 146px, y như bản apps. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-element-key={iconKey}
                  src={stat.iconUrl}
                  alt=''
                  aria-hidden
                  className={selectableClass(activeKey === iconKey)}
                  style={composeStyle(
                    {
                      width: 'clamp(100px, 37.4cqi, 176px)',
                      height: 'auto',
                      objectFit: 'contain',
                    },
                    styleOf(iconKey)
                  )}
                />

                <p
                  data-element-key={textKey}
                  className={cn(
                    selectableClass(activeKey === textKey),
                    'w-full text-center whitespace-pre-line'
                  )}
                  style={composeStyle(
                    {
                      // 12px trên 372 = 3.23cqi; line-height 17.7444/12 = 1.479.
                      fontFamily: FONT_HEADING,
                      fontSize: 'clamp(11px, 3.23cqi, 15px)',
                      lineHeight: 1.479,
                      color: BROWN,
                      fontWeight: 400,
                      // Hở gốc: text top 154 − đáy icon 138 = 16px = 4.3cqi.
                      marginTop: 'clamp(8px, 4.3cqi, 22px)',
                    },
                    styleOf(textKey)
                  )}
                >
                  {stat.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
