'use client';

/**
 * Block "Real Estate - Vị trí & Bản đồ" — port của section Framer `3. Vị trí`
 * + `4. MaP` (apps/real-estate-1). Graduate từ `apps/real-estate-1/lib/blocks/
 * Location.tsx`, nơi mọi con số dưới đây đã được suy ra từ `app/framer.css`
 * trên canvas 372px cố định (xem apps/real-estate-1/PORTING.md).
 *
 * Bản gốc là 2 sibling absolute, KHÔNG phải 1 node
 * (apps/real-estate-1/components/canvas/Page.tsx:1295-1435):
 *
 *   .framer-17ozd8c   top:1368  326x257  — ba dòng chữ
 *   .framer-umdqut    top:1687  372x209  — video bản đồ + badge xoay
 *
 * DOM order ngược với visual order ở đó (map emit trước), nên `top` mới là thứ
 * quyết định layout: chữ 1368-1625, map 1687-1896. Chữ trên, map dưới.
 *
 * Khác biệt CÓ CHỦ ĐÍCH so với bản apps:
 *
 * 1. BỎ badge <Xoay/> ("LIÊN KẾT VÙNG" xoay 360°/10s). Badge đó cần 257 dòng
 *    scope `.framer-KgUaE` trong app/framer.css (app nạp global qua layout —
 *    host không có global đó), cộng toàn bộ runtime shim `components/framer/`
 *    (~1.100 dòng) và framer-motion. Host chạy GSAP. Bản apps đã cảnh báo sẵn
 *    coupling này. Muốn có lại badge: viết mới self-contained, đừng kéo shim.
 *
 * 2. THÊM font. Bản apps cố tình bỏ trống fontFamily để style editor thắng;
 *    trên host điều đó làm section mất hẳn chất chữ gốc. Nay self-host 2 file
 *    woff2 + khai @font-face ngay trong block (đúng pattern SpringsMap.tsx).
 *
 * 3. THÊM entrance. Nguồn có appear effect per-line mà bản apps bỏ; nay dựng
 *    lại bằng GSAP (xem useBlockMotion bên dưới).
 *
 * 4. THÊM padding trên. Bản apps có padding dọc = 0 vì trên canvas 372 section
 *    nằm ở `top:1368`, khoảng cách do page flow lo. Xếp chồng trong host thì
 *    eyebrow sẽ dính đáy block trước. Xem RE_SECTION_GAP.
 */
import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type { RealEstateLocationContent } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

// Màu gốc: framer.css / inline `--framer-text-color` trong Page.tsx.
const GREEN = 'rgb(0, 147, 54)';
const BROWN = 'rgb(116, 96, 74)';
// Nền trang, framer.css:1907 `.framer-AUAI2.framer-19nsx14`.
const SAND = '#f8f1e9';

/**
 * Khoảng hở trên của block — 104px trên canvas 372 = 27.96cqi.
 *
 * KHÔNG phải số ước lượng, nhưng cũng KHÔNG lấy từ sibling ngay trước. Đo thật:
 *
 *   1.1 Intro (.framer-rgbiud)   top 516  + height 272 → đáy 788
 *   3. Vị trí (.framer-17ozd8c)  top 1368            → hở 580px
 *
 * 580px đó là LỖ HỔNG do designer xoá section `2.` (PORTING.md), không mang ý
 * đồ thiết kế nào — dùng nó làm padding là sai. Khoảng hở section-to-section
 * thật của bản gốc nằm ở đầu kia:
 *
 *   4. MaP (.framer-umdqut)      top 1687 + height 209 → đáy 1896
 *   5. Tổng quan (.framer-45fl36) top 2000            → hở 104px
 *
 * 104/372 = 27.96cqi. Đáy để full-bleed (map vốn đã tràn viền ngang, và block
 * kế tiếp tự mang 104px padding trên của nó) → xếp đúng thứ tự thì nhịp gốc
 * được tái tạo nguyên vẹn, không cộng dồn.
 */
const RE_SECTION_GAP = 'clamp(40px, 27.96cqi, 120px)';

/**
 * Bản gốc khai SVN-Adero SemiBold và Light thành HAI family riêng (không phải
 * 2 weight của một family) — mirror đúng vậy, nên `fontWeight: 400` trên title
 * là chính xác: bản thân face đã là semibold.
 * Nguồn: app/framer.css:44-69, self-host woff2 → public/real-estate/fonts/.
 */
const FONT_HEADING =
  "'SVN-Adero SemiBold', 'Be Vietnam Pro', system-ui, sans-serif";
const FONT_BODY = "'SVN-Adero Light', 'Be Vietnam Pro', system-ui, sans-serif";

const FONT_CSS = `
@font-face { font-family: 'SVN-Adero SemiBold'; src: url('/real-estate/fonts/Nuz7kEROxLMDh3fFgoJzqDWnYU.woff2') format('woff2'); font-display: swap; }
@font-face { font-family: 'SVN-Adero Light'; src: url('/real-estate/fonts/ka6swfnIlD5Xj0Y3BnE0cOpnuw.woff2') format('woff2'); font-display: swap; }
`;

export function RealEstateLocation({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<RealEstateLocationContent>) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  /**
   * Entrance. Nguồn (Page.tsx `textEffect`): tokenization 'line', trigger
   * 'onInView', animation3 `{opacity:.001, y:10}`, transition3 `{type:'spring',
   * bounce:0, duration:.7, delay:.075}`, startDelay .1.
   *
   * Spring bounce:0 = không nảy → 'power2.out' là xấp xỉ sát nhất trong GSAP.
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

    const video = root.querySelector('video');
    video?.addEventListener('loadeddata', requestRefresh, { once: true });
  });

  return (
    <div
      ref={rootRef}
      style={composeStyle(
        { backgroundColor: SAND, paddingTop: RE_SECTION_GAP },
        blockBackgroundStyle(background)
      )}
      className={cn('@container w-full overflow-hidden', className)}
    >
      <style>{FONT_CSS}</style>

      <div className='flex flex-col items-center'>
        {/* Chữ. Nguồn: canh giữa trong box 326px, tức ~87.6cqi của canvas. */}
        <div className='flex w-[min(87.6cqi,640px)] flex-col items-center text-center'>
          <p
            data-appear
            data-element-key='eyebrow'
            className={selectableClass(activeKey === 'eyebrow')}
            style={composeStyle(
              {
                // 14px trên 372 = 3.76cqi; line-height 23.6592/14 = 1.69.
                fontFamily: FONT_HEADING,
                fontSize: 'clamp(12px, 3.76cqi, 16px)',
                lineHeight: 1.69,
                color: GREEN,
              },
              styleOf('eyebrow')
            )}
          >
            {content.eyebrow}
          </p>

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
                // Hở gốc: title top 63 − eyebrow height 23.66 ≈ 39px = 10.5cqi.
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
            className={selectableClass(activeKey === 'description')}
            style={composeStyle(
              {
                fontFamily: FONT_BODY,
                fontSize: 'clamp(13px, 3.76cqi, 17px)',
                lineHeight: 1.69,
                color: BROWN,
                // Hở gốc: description top 138 − khối title ≈ 12px = 3.2cqi.
                marginTop: 'clamp(8px, 3.2cqi, 18px)',
              },
              styleOf('description')
            )}
          >
            {content.description}
          </p>
        </div>

        {/* Map. Nguồn: full-bleed 372x209 (tỉ lệ 372/209 ≈ 16:9), overflow hidden.
            Hở đo từ description chứ không từ box section: box .framer-17ozd8c cố
            định 257px nhưng nội dung kết thúc ở 233, nên 62px hở box-to-box
            (1625 → 1687) thực chất là 86px hở thị giác (1601 → 1687). Layout này
            cao theo nội dung, nên lấy 86. 86/372 = 23.1cqi.

            `videoUrl` (không phải `map`) làm data-element-key: key hit-test canvas,
            elements[] trong BlockDef và field path trong content phải trùng nhau —
            chọn map trên canvas thì toolbar hiện đúng ô URL. */}
        <div
          data-appear
          data-element-key='videoUrl'
          className={cn(
            selectableClass(activeKey === 'videoUrl'),
            'relative aspect-[372/209] w-full overflow-hidden'
          )}
          style={composeStyle(
            { marginTop: 'clamp(32px, 23.1cqi, 96px)' },
            styleOf('videoUrl')
          )}
        >
          {/* Shim Video của Framer bỏ qua có chủ đích: nó thêm plumbing
              useInView play/pause không cần ở đây, và config `objectFit`/`loop`/
              `muted`/`playsinline`/`controls` của nó rút gọn lại đúng bằng bốn
              attribute này. `srcType` gốc là 'Upload' nên Framer resolve
              `srcFile` — sibling `srcUrl` (MLWPbW1dUQawJLhhun3dBwpgJak.mp4) là
              config chết, không port. */}
          {content.videoUrl ? (
            <video
              key={content.videoUrl}
              src={content.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className='h-full w-full object-cover'
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
