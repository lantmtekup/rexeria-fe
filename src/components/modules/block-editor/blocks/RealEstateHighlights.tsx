'use client';

/**
 * Block "Real Estate - Điểm nổi trội" — port section Framer
 * `6. Điểm nổi trội dự án` (apps/real-estate-1). Graduate từ
 * `apps/real-estate-1/lib/blocks/Highlights.tsx`, nơi mọi con số dưới đây đã
 * được suy ra từ `app/framer.css` trên canvas 372px cố định (xem
 * apps/real-estate-1/PORTING.md).
 *
 * Bố cục nguồn — box 370 rộng, nền #fff, padding 64px 0, gap cột 48:
 *
 *   .framer-1fbj8oo  header, padding 0 24, gap 12  — tiêu đề 23px + mô tả 14px
 *   .framer-n93t3g   track, w:1092 h:359, gap 12, padding-left 24
 *     card           249x359, nền #f8f1e9
 *       ảnh          202x202 tại 24,24, border-radius 99% (tức hình tròn)
 *       số           99px xanh, left 24, top 54%, translateY(-50%)
 *       chữ          14px, left 24, top 264, width 202
 *
 * ---------------------------------------------------------------------------
 * VÌ SAO HÀNH VI CUỘN LỆCH KHỎI NGUỒN — đọc trước khi "sửa lại cho giống".
 *
 * Nguồn kéo track bằng styleTransform: x lerp từ 1700 về -1300 theo tiến độ
 * cuộn CẢ TRANG (`transformTrigger: 'onScroll'`). Animation đó KHÔNG chạy trên
 * trang thật: đo bản live thì x đứng nguyên 1700 ở mọi vị trí cuộn kể cả
 * progress 1.0, đẩy 4 card ra ngoài màn hình hoàn toàn, và header thì kẹt ở
 * opacity 0.001 — section 6 render ra một khối trắng trơn.
 *
 * Chép NGUYÊN x=1700 là chép lại một cái bug, không phải một thiết kế: cặp số
 * đó tinh chỉnh cho một trang cao 5349px, mà block tái sử dụng thì không thể
 * phụ thuộc vào tổng chiều dài trang. Nhưng NGỮ NGHĨA của nó thì giữ nguyên —
 * 1700 → -1300 trên canvas 372 là QUÉT một lượt từ ngoài mép phải sang ngoài
 * mép trái, chứ không phải cuộn để lộ phần tràn.
 *
 * Nên block kéo track theo tiến độ CỦA CHÍNH NÓ qua viewport, quãng đường
 * `containerWidth → -trackWidth`. Đừng đổi lại thành `trackWidth −
 * containerWidth`: cột nội dung khoá 372 nên track (≈1032px) gần như không bao
 * giờ tràn container ở desktop, công thức đó ra 0 và hiệu ứng chết ở mọi bề
 * rộng lớn — đúng cái bẫy đã vấp một lần.
 * ---------------------------------------------------------------------------
 *
 * Khác biệt CÓ CHỦ ĐÍCH so với bản apps — theo đúng quy ước 4 block anh em
 * `RealEstateLocation` / `RealEstateHero` / `RealEstateInfo` /
 * `RealEstateOverview` đã lập:
 *
 * 1. THÊM font. Bản apps cố tình bỏ trống fontFamily để style editor thắng;
 *    trên host điều đó làm section mất hẳn chất chữ gốc. Nguồn dùng
 *    SVN-Adero SemiBold (tiêu đề, chữ trong card) và Light (mô tả, số).
 *
 * 2. THÊM entrance. Nguồn có style-appear nhưng `withFX` bên apps không
 *    implement nhánh đó nên chưa từng chạy (chính là header opacity 0.001 ở
 *    trên). Dựng lại bằng GSAP, dùng NGUYÊN timing của `RealEstateInfo` /
 *    `RealEstateOverview` — cùng họ section thì cùng cảm giác.
 *
 * 3. Cột nội dung KHOÁ 372px canh giữa ở mọi breakpoint (xem `CONTENT_W`), còn
 *    track thì full-bleed và quét ra ngoài cả hai mép. Bản apps để cột co theo
 *    container và cap card ở 320px, hệ quả là ở desktop 4 card vừa khít khung
 *    (1420 trên 1440) nên chẳng còn gì để quét — section đọc thành một hàng
 *    tĩnh. Khoá 372 giữ đúng tỉ lệ canvas gốc ở MỌI bề rộng và trả lại hiệu ứng.
 *
 * 4. Padding dọc dùng `RE_SECTION_GAP` thay cho 64px của nguồn. 64px là padding
 *    NỘI BỘ của section trên canvas Framer, còn khoảng trắng thật giữa
 *    `5. Tổng quan` (đáy 2793) và section này (top 2856) là 63 + 64 = 127px —
 *    `RE_SECTION_GAP` (104px) bám sát con số đó hơn hẳn, lại đồng bộ với 4
 *    block anh em vốn đều lấy hằng này cho cả trên lẫn dưới.
 *
 * 5. Nền `SAND` thay cho `#fff` của nguồn, đồng bộ với Info/Overview.
 *
 * 6. Ảnh card thành FIELD (`items[i].imageUrl`) trỏ bản copy nội bộ trong
 *    `public/real-estate/` — KHÔNG trỏ CDN Framer gốc (PORTING.md: một lần
 *    republish là nguồn đổi thầm lặng).
 *
 * NHÁNH CANVAS — block real-estate đầu tiên cần fork. Track ngang chỉ lộ 1-2
 * card đầu ở bề rộng khung editor, nên card 3-4 không click chọn được. Trên
 * canvas đổi sang lưới wrap 2 cột hiện đủ cả 4 và tắt scrub; PreviewMode và
 * `/p` giữ nguyên track ngang + scrub của bản production.
 *
 * Số card CỐ ĐỊNH 4, không mở list manager: `StatsControls` sẵn có là generic
 * trên `{value,label}[]` nên không dùng lại được cho `{number,text,imageUrl}`.
 */
import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
import type {
  RealEstateHighlightItem,
  RealEstateHighlightsContent,
} from '../types';
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
  FONT_HEADING,
  GREEN,
  RE_SECTION_GAP,
  SAND,
  FONT_CSS,
} from './realEstateFonts';

/**
 * Bề rộng cột nội dung — KHOÁ ở 372px (chính là bề rộng canvas Framer nguồn) và
 * canh giữa ở mọi breakpoint. `100cqw` để dưới 372 thì co theo khung thay vì
 * tràn; phải là `cqw` chứ không phải `vw` vì block sống trong device frame của
 * editor, nơi bề rộng khung khác bề rộng cửa sổ.
 *
 * Mọi kích thước còn lại suy từ đây theo đúng tỉ lệ trên canvas 372, nên ở mọi
 * bề rộng ≥372 chúng ra đúng pixel gốc:
 *   card 249/372 = 66.9%   gap 12/372 = 3.23%   padding 24/372 = 6.45%
 *   hở header↔track 48/372 = 12.9%
 */
const CONTENT_W = 'min(100cqw, 372px)';
const CARD_W = `calc(${CONTENT_W} * 0.669)`;
const GAP_X = `calc(${CONTENT_W} * 0.0323)`;
const PAD_X = `calc(${CONTENT_W} * 0.0645)`;
const SECTION_GAP_X = `calc(${CONTENT_W} * 0.129)`;

export function RealEstateHighlights({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<RealEstateHighlightsContent>) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const { hasRoot } = useLandingMotion();

  const items = Array.isArray(content.items) ? content.items : [];

  // Canvas editor (author) vs PreviewMode / `/p` (production).
  const [isCanvas, setIsCanvas] = React.useState(true);
  React.useLayoutEffect(() => {
    if (!hasRoot) {
      setIsCanvas(false); // `/p` công khai — không có LandingMotion root
      return;
    }
    setIsCanvas(
      !!rootRef.current?.closest('[data-testid="active-block-preview"]')
    );
  }, [hasRoot]);

  /**
   * Reduced-motion phải là STATE chứ không đọc thẳng trong render: server không
   * có matchMedia. SSR ra `overflow-hidden`, client lật sang `overflow-x-auto`
   * nếu người dùng đã tắt animation — giữ nguyên fallback của bản apps, để card
   * vẫn với tới được thay vì mắc kẹt ngoài màn hình khi không có scrub.
   */
  const [reduce, setReduce] = React.useState(false);
  React.useLayoutEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  /**
   * Entrance — giống hệt `RealEstateInfo` / `RealEstateOverview`: nguồn
   * (Page.tsx `textEffect`) tokenization 'line', trigger 'onInView',
   * animation3 `{opacity:.001, y:10}`, transition3 `{type:'spring', bounce:0,
   * duration:.7, delay:.075}`, startDelay .1. Spring bounce:0 = không nảy →
   * 'power2.out' sát nhất.
   *
   * Rồi track trượt ngang. Quãng đường khai bằng FUNCTION chứ không phải số:
   * ScrollTrigger gọi lại nó mỗi lần refresh, nên nó thay trọn cặp
   * `ResizeObserver` + `useMotionValue` của bản apps (cùng cách
   * `RealEstateHero` đã làm cho parallax). `start/end` dưới đây chính là
   * `offset: ['start end', 'end start']` của framer-motion viết theo cú pháp
   * ScrollTrigger.
   */
  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
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

      // Ảnh load xong → chiều cao block chốt lại, ScrollTrigger phải đo lại.
      root.querySelectorAll('img').forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });

      // Lưới canvas không trượt ngang — không có gì để scrub.
      if (isCanvas) return;
      const track = trackRef.current;
      if (!track) return;

      /**
       * SWEEP, không phải "lộ phần tràn". Track đi trọn một lượt ngang màn
       * hình: mép trái xuất phát ở mép phải container rồi chạy tới khi mép phải
       * khuất hẳn bên trái. Cột nội dung khoá 372px nên track (≈1032px) hầu như
       * không bao giờ tràn container ở desktop — công thức
       * `scrollWidth − clientWidth` cũ sẽ ra 0 và hiệu ứng chết ở mọi bề rộng
       * lớn. Đây mới là ngữ nghĩa của nguồn: `x: 1700 → -1300` trên canvas 372
       * cũng là quét từ ngoài phải sang ngoài trái, chứ không phải cuộn nội bộ.
       *
       * Hệ quả có chủ đích: ở p=0.5 (section nằm giữa viewport, tức lúc người
       * đọc nhìn nó) track canh giữa ngang màn hình — đúng khung hình tham
       * chiếu. Hai đầu p→0 và p→1 track ra khỏi màn hình, nhưng lúc đó section
       * cũng đã gần như khuất nên không thấy khoảng trống.
       *
       * Khai bằng FUNCTION để ScrollTrigger đo lại mỗi lần refresh (đổi bề
       * rộng khung, ảnh load xong, thêm/bớt card).
       */
      gsap.fromTo(
        track,
        { x: () => root.clientWidth },
        {
          x: () => -track.scrollWidth,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    },
    [isCanvas, items.length]
  );

  /**
   * Card — dùng chung giữa nhánh canvas và nhánh production. Bề rộng suy từ CỘT
   * NỘI DUNG (`--re-w`) chứ không từ container: 249/372 = 66.9% của cột, nên ở
   * mọi bề rộng ≥372 card đúng 249px như nguồn, dưới 372 thì co theo cột.
   *
   * Mỗi card TỰ là container: nội dung bên trong đo theo CARD (1cqi = 1% của
   * 249 trên nguồn) chứ không theo block, nên tỉ lệ ảnh/số/chữ luôn giữ nguyên.
   */
  const renderCard = (item: RealEstateHighlightItem, i: number) => {
    const imageKey = `items[${i}].imageUrl`;
    const numberKey = `items[${i}].number`;
    const textKey = `items[${i}].text`;
    return (
      <div
        key={i}
        data-appear
        className='@container relative aspect-[249/359] flex-none'
        style={{ backgroundColor: SAND, width: CARD_W }}
      >
        {/* Ảnh: 202 trên card 249 = 81.1cqi, thụt vào 24 = 9.64cqi từ trái và
            trên. `border-radius: 99%` của nguồn chỉ là hình tròn trên hộp
            vuông. Key nằm trên khung bọc chứ không trên <img> để ô chọn không
            bị bo tròn theo. */}
        <div
          data-element-key={imageKey}
          className={cn(
            selectableClass(activeKey === imageKey),
            'absolute top-[9.64cqi] left-[9.64cqi] aspect-square w-[81.1cqi] overflow-hidden rounded-full'
          )}
          style={styleOf(imageKey)}
        >
          {/* Nguồn khai `fit` là 'fill' ở 3 card và 'stretch' ở card 2, tương
              ứng object-fit cover và fill. Hộp đều vuông và ảnh card 2 là
              820x820 nên cover cho kết quả nhìn giống hệt ở cả 4. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt=''
            className='h-full w-full object-cover'
          />
        </div>

        {/* Số: 99px trên card 249 = 39.8cqi, left 24 = 9.64cqi, canh giữa dọc
            theo 54% bằng translateY(-50%) — đúng transformTemplate2 của nguồn. */}
        <p
          data-element-key={numberKey}
          className={cn(
            selectableClass(activeKey === numberKey),
            'absolute top-[54%] left-[9.64cqi] -translate-y-1/2'
          )}
          style={composeStyle(
            {
              fontFamily: FONT_BODY,
              fontSize: '39.8cqi',
              lineHeight: 1,
              color: GREEN,
              fontWeight: 400,
            },
            styleOf(numberKey)
          )}
        >
          {item.number}
        </p>

        {/* Chữ: 14px = 5.62cqi của card, left 24, top 264 trên 359 = 73.5%,
            rộng 202 = 81.1cqi. */}
        <p
          data-element-key={textKey}
          className={cn(
            selectableClass(activeKey === textKey),
            'absolute top-[73.5%] left-[9.64cqi] w-[81.1cqi]'
          )}
          style={composeStyle(
            {
              fontFamily: FONT_HEADING,
              fontSize: '5.62cqi',
              // line-height 23.6592/14 = 1.69.
              lineHeight: 1.69,
              color: BROWN,
              fontWeight: 400,
            },
            styleOf(textKey)
          )}
        >
          {item.text}
        </p>
      </div>
    );
  };

  /**
   * Cột nội dung khoá 372px và canh giữa ở MỌI bề rộng — chính là bề rộng
   * canvas nguồn, nên mọi con số cqi bên trong ra đúng pixel gốc thay vì phình
   * theo container. Cột tự khai `@container` để `cqi` bên trong đo theo 372 chứ
   * không theo block; dưới 372 thì cả cột lẫn chữ co lại cùng nhịp.
   *
   * Track KHÔNG bị cột này giới hạn — nó full-bleed và quét ra ngoài cả hai
   * mép, nên card dùng `CARD_W` suy từ cùng biến để giữ tỉ lệ 249/372.
   */
  const header = (
    // Lớp ngoài chỉ khai bề rộng + container; `cqi` phải nằm ở lớp TRONG vì một
    // element không query được chính container-type của nó (bẫy y hệt ở root).
    <div className='@container mx-auto' style={{ width: CONTENT_W }}>
      <div className='flex flex-col items-center gap-[3.23cqi] px-[6.45cqi] text-center'>
        {/* Cột đã khoá 372 nên `cqi` ra thẳng pixel gốc — không cần clamp trần
            nữa (trần cũ chỉ tồn tại để chặn chữ phình khi cột còn co theo
            container). Dưới 372 chữ co cùng nhịp với cột. */}
        <h2
          data-appear
          data-element-key='title'
          className={cn(selectableClass(activeKey === 'title'), 'w-full')}
          style={composeStyle(
            {
              // 23px trên 372 = 6.18cqi; line-height 31.5456/23 = 1.372.
              fontFamily: FONT_HEADING,
              fontSize: '6.18cqi',
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
        <p
          data-appear
          data-element-key='description'
          className={cn(selectableClass(activeKey === 'description'), 'w-full')}
          style={composeStyle(
            {
              // 14px trên 372 = 3.76cqi; line-height 23.6592/14 = 1.69.
              fontFamily: FONT_BODY,
              fontSize: '3.76cqi',
              lineHeight: 1.69,
              color: BROWN,
              fontWeight: 400,
            },
            styleOf('description')
          )}
        >
          {content.description}
        </p>
      </div>
    </div>
  );

  /**
   * HAI lớp nền, khớp đúng nguồn (3 lớp, lớp thứ 3 là card):
   *
   *   ngoài  — nền trang `#f8f1e9` (SAND), sửa qua "Nền" của block
   *   trong  — hộp section 370 trên canvas 372, `#fff` — dải trắng chạy suốt
   *            chiều cao section, sửa qua element `contentSurface`
   *   card   — `#f8f1e9`, giữ nguyên theo nguồn
   *
   * Dải trắng là một lớp absolute PHÍA SAU chứ không phải nền của cột header:
   * nó phải chạy hết chiều cao section (kể cả sau hàng card full-bleed), đúng
   * như hộp 370 của nguồn.
   */
  const rootStyle = composeStyle(
    { backgroundColor: SAND },
    blockBackgroundStyle(background)
  );

  const contentSurface = (
    <div
      data-element-key='contentSurface'
      aria-hidden
      // KHÔNG `pointer-events-none`: dải này phải click chọn được trên canvas.
      // An toàn trên `/p` vì `selectableClass` không gắn `:hover` (chỉ outline
      // khi đang active) — xem docblock trong `applyStyle.ts`.
      className={cn(
        selectableClass(activeKey === 'contentSurface'),
        'absolute inset-y-0 left-1/2 -translate-x-1/2'
      )}
      style={composeStyle(
        { width: CONTENT_W, backgroundColor: '#fff' },
        styleOf('contentSurface')
      )}
    />
  );

  // Khoảng hở dọc nằm ở wrapper TRONG chứ không phải root: `cqi` không query
  // được chính element đang khai container-type, đặt ở root thì nó resolve theo
  // container tổ tiên — không phải bề rộng block này.
  const padY = { paddingTop: RE_SECTION_GAP, paddingBottom: RE_SECTION_GAP };

  // ── Nhánh canvas: lưới wrap, hiện đủ 4 card, không scrub ──────────────────
  if (isCanvas) {
    return (
      <div
        ref={rootRef}
        data-canvas-edit='true'
        style={rootStyle}
        className={cn('@container relative w-full', className)}
      >
        <style>{FONT_CSS}</style>
        {contentSurface}
        <div
          className='relative flex flex-col'
          style={{ ...padY, gap: SECTION_GAP_X }}
        >
          {header}
          {/* Lưới 2 card/hàng, canh giữa. Bề rộng suy từ card thật (2 card +
              1 gap) nên card giữ đúng kích thước như bản production — author
              thấy đúng cái sẽ publish, chỉ khác là xếp wrap thay vì quét ngang. */}
          <div
            className='mx-auto grid grid-cols-2'
            style={{
              width: `calc(${CARD_W} * 2 + ${GAP_X})`,
              maxWidth: '100%',
              gap: GAP_X,
            }}
          >
            {items.map((item, i) => renderCard(item, i))}
          </div>
        </div>
      </div>
    );
  }

  // ── Nhánh production (PreviewMode + `/p`): track quét ngang ───────────────
  return (
    <div
      ref={rootRef}
      style={rootStyle}
      // overflow-hidden để track quét ra ngoài hai mép mà không đẻ scrollbar
      // ngang cho cả trang.
      className={cn('@container relative w-full overflow-hidden', className)}
    >
      <style>{FONT_CSS}</style>
      {contentSurface}
      <div
        className='relative flex flex-col'
        style={{ ...padY, gap: SECTION_GAP_X }}
      >
        {header}

        {/* Khung track — full-bleed, KHÔNG bị cột nội dung 372 giới hạn. Dưới
            reduced-motion transform bị bỏ và hàng thành vùng cuộn ngang bình
            thường, để card vẫn với tới được thay vì mắc kẹt ngoài màn hình. */}
        <div
          ref={viewportRef}
          className={cn(
            'w-full',
            reduce ? 'overflow-x-auto' : 'overflow-hidden'
          )}
        >
          <div
            ref={trackRef}
            className='flex w-max flex-row flex-nowrap'
            style={{ gap: GAP_X, paddingLeft: PAD_X, paddingRight: PAD_X }}
          >
            {items.map((item, i) => renderCard(item, i))}
          </div>
        </div>
      </div>
    </div>
  );
}
