'use client';

/**
 * Block "Real Estate - Banner" — port section Framer `1. Banner`
 * (apps/real-estate-1). Graduate từ `apps/real-estate-1/lib/blocks/Hero.tsx`,
 * nơi mọi con số dưới đây đã được suy ra từ `app/framer.css` trên canvas 372px
 * cố định (xem apps/real-estate-1/PORTING.md).
 *
 * Cấu trúc nguồn (Page.tsx:1512-1721):
 *
 *   .framer-ls7ks2   top:0  372x454  overflow:hidden   — section
 *     .framer-1h2hrsq      inset 0, height 453         — image clip
 *       .framer-u28s9v     inset 0, ImageWithFX speed 60 — ảnh parallax
 *     .framer-grqdu1       bottom:1  height:394        — gradient đen từ đáy
 *       .framer-16fqtll    bottom:31  left:50%  row, gap 39.43 — hàng thông số
 *
 * Khác biệt CÓ CHỦ ĐÍCH so với bản apps:
 *
 * 1. PARALLAX rewire sang GSAP. Bản apps dùng `ParallaxFX` (framer-motion +
 *    `useScroll()` KHÔNG target → đọc `window.scrollY` toàn cục). Trên host
 *    scroller là phần tử canvas chứ không phải window, nên bản đó sẽ đứng im
 *    trong editor. Công thức được giữ NGUYÊN — xem PARALLAX_FACTOR.
 *
 * 2. THÊM font. Bản apps cố tình bỏ trống fontFamily để style editor thắng;
 *    trên host điều đó làm section mất hẳn chất chữ gốc. Theo tiền lệ
 *    `RealEstateLocation.tsx` §2: đặt font, `styleOf()` vẫn đè được.
 *
 * 3. `data-element-key` của ảnh là `imageUrl` (bản apps ghi `image`). Key là
 *    thứ dùng chung cho hit-test canvas + `elements[]` trong BlockDef + field
 *    path trong content — lệch một chỗ là toolbar hiện sai ô. Cùng lý do
 *    `RealEstateLocation` đổi `map` → `videoUrl`.
 *
 * KHÔNG thêm entrance. Sáu node RichText trong nguồn không mang
 * `__framer__enter`/appear-effect nào — motion của section này chỉ có parallax
 * (đúng bảng Sections trong PORTING.md). Location có entrance vì nguồn CỦA NÓ
 * có `textEffect` per-line; bịa thêm ở đây là vi phạm PORTING.md rule 1.
 *
 * KHÔNG có padding trên: đây là section đầu trang (top:0), không có sibling
 * phía trước. Khoảng hở 104px nằm ở block kế tiếp (RE_SECTION_GAP).
 *
 * KHÔNG reflow theo tier: nguồn là canvas 372 cố định, ZERO media query
 * (PORTING.md rule 4) → aspect 372/454 giữ nguyên ở mọi container width, mọi
 * thứ scale bằng cqi. Không `md:`/`lg:`/`vw`.
 */
import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type { RealEstateHeroContent } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { FONT_BODY, FONT_CSS, FONT_HEADING } from './realEstateFonts';

/**
 * Nguồn: `linear-gradient(1.7763568394002505e-12deg, #000000e6 7.5%, #0000 84%)`.
 * Góc đó là 0 tới 12 chữ số thập phân — nhiễu float của Framer, không phải nghiêng.
 */
const SCRIM = 'linear-gradient(0deg, #000000e6 7.5%, #0000 84%)';

/**
 * Hệ số parallax, transcribe từ runtime Framer (`apps/real-estate-1/components/
 * framer/effects.ts:96-109`):
 *
 *   speedFactor    = speed / 100 - 1              // speed=60 → -0.4
 *   initialPosition = adjustPosition ? … : 0      // instance này adjustPosition=false → 0
 *   scrollOffset   = -scrollY * speedFactor       // = +0.4 * scrollY
 *
 * → ảnh trôi XUỐNG 0.4x tốc độ cuộn. Nguồn đọc `window.scrollY` toàn cục, chỉ
 * đúng vì section nằm ở top:0. Bản host neo vào tiến trình của chính section:
 * `start:'top top'` (section chạm mép trên scroller = scrollY 0 của bản gốc)
 * → `end:'bottom top'` (đáy section chạm mép trên = scrollY 454). Tại end,
 * y = 0.4 * 454 = 181.6 — TRÙNG KHỚP công thức gốc, không phải xấp xỉ.
 *
 * Vùng trống lộ ra ở mép trên clip (cao 0.4 * H * progress) luôn nằm PHÍA TRÊN
 * mép scroller nên không bao giờ thấy — đó là lý do bản gốc để adjustPosition
 * = false mà vẫn kín.
 *
 * Hệ quả: parallax chỉ chạy khi banner bắt đầu rời mép trên, tức phải có nội
 * dung phía dưới để cuộn. Trang thật (5349px) có; `/dev/blocks` một block thì
 * không — kiểm tra parallax trên `/p/[id]` hoặc PreviewMode với stack nhiều block.
 */
const PARALLAX_FACTOR = 0.4;

export function RealEstateHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<RealEstateHeroContent>) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(rootRef, ({ scroller, requestRefresh }) => {
    const root = rootRef.current;
    if (!root) return;
    // Phải return TRƯỚC fromTo — nếu không ảnh kẹt ở vị trí tween.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const img = root.querySelector<HTMLImageElement>('.re-hero-image');
    if (!img) return;

    gsap.fromTo(
      img,
      { y: 0 },
      {
        // Hàm, không hằng: invalidateOnRefresh đo lại khi container đổi width.
        y: () => PARALLAX_FACTOR * root.offsetHeight,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );

    if (!img.complete)
      img.addEventListener('load', requestRefresh, { once: true });
  });

  return (
    <div
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        // Section 372x454 → aspect 372/454. overflow-hidden cắt phần ảnh trôi,
        // khớp .framer-ls7ks2.
        '@container relative aspect-[372/454] w-full overflow-hidden',
        className
      )}
    >
      <style>{FONT_CSS}</style>

      {/* Image clip. Nguồn cao 453 trong section 454 — mạch 1px ở đáy mà scrim
          phủ kín rồi, nên dùng inset-0. Key nằm trên clip (hộp tĩnh) chứ không
          trên <img> (đang bị GSAP dịch) → khung chọn không nhảy theo parallax. */}
      <div
        data-element-key='imageUrl'
        className={cn(
          selectableClass(activeKey === 'imageUrl'),
          'absolute inset-0 overflow-hidden'
        )}
        style={styleOf('imageUrl')}
      >
        {/* Framer `fit: 'fill'` map sang CSS object-fit: cover (primitives.tsx
            OBJECT_FIT), KHÔNG phải `fill`. Ảnh nguồn 4096x2305. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={content.imageUrl}
          alt=''
          className='re-hero-image absolute inset-0 h-full w-full object-cover'
          style={{ willChange: 'transform' }}
        />
      </div>

      {/* Scrim đáy. Nguồn: height 394 / 454 = 86.8%, ghim cách đáy 1px. */}
      <div
        aria-hidden
        className='pointer-events-none absolute right-0 bottom-px left-0 h-[86.8%]'
        style={{ background: SCRIM }}
      />

      {/* Hàng thông số. Nguồn: bottom 31 (31/372 = 8.3cqi), canh giữa bằng
          left:50% + translate(-50%), flex row, gap 39.43 (= 10.6cqi),
          align-items flex-start, width min-content. */}
      <div className='absolute bottom-[8.3cqi] left-1/2 flex w-min -translate-x-1/2 flex-row flex-nowrap items-start gap-[10.6cqi]'>
        {content.stats.map((stat, i) => {
          const labelKey = `stats[${i}].label`;
          const valueKey = `stats[${i}].value`;
          return (
            // Nguồn cho mỗi nhóm một width chết (73/80/82) rồi dịch label bằng
            // tay (left 20/9/16) để canh giữa trên value — vd 20 + 33/2 ≈ 36.5
            // = 73/2. Một flex column canh giữa tái tạo đúng vậy mà không cần
            // magic number, và tự co giãn khi user sửa chữ.
            <div key={i} className='flex flex-col items-center whitespace-pre'>
              <span
                data-element-key={labelKey}
                className={selectableClass(activeKey === labelKey)}
                style={composeStyle(
                  {
                    // 8px trên 372 = 2.15cqi; line-height 17.7444/8 = 2.218.
                    fontFamily: FONT_BODY,
                    fontSize: 'clamp(7px, 2.15cqi, 11px)',
                    lineHeight: 2.218,
                    letterSpacing: '0.03em',
                    color: 'rgb(255, 255, 255)',
                  },
                  styleOf(labelKey)
                )}
              >
                {stat.label}
              </span>
              <span
                data-element-key={valueKey}
                className={selectableClass(activeKey === valueKey)}
                style={composeStyle(
                  {
                    // 14px trên 372 = 3.76cqi; line-height 17.7444/14 = 1.2675.
                    // Nguồn xếp hai dòng ở top 0 và top 18, mỗi line box cao
                    // 17.7444 → hở 0.26px, tức không hở.
                    fontFamily: FONT_HEADING,
                    fontSize: 'clamp(12px, 3.76cqi, 18px)',
                    lineHeight: 1.2675,
                    letterSpacing: '0.03em',
                    color: 'rgb(255, 255, 255)',
                    // Face đã là semibold → 400 là đúng, không phải 600.
                    fontWeight: 400,
                  },
                  styleOf(valueKey)
                )}
              >
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
