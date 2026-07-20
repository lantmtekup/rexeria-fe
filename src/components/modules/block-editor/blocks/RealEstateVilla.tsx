'use client';

/**
 * Block "Real Estate - Biệt thự" — port section Framer `7. Biệt thự`
 * (apps/real-estate-1). Graduate từ `apps/real-estate-1/lib/blocks/Villa.tsx`,
 * nơi mọi con số dưới đây đã được đo trên canvas 372px cố định (xem
 * apps/real-estate-1/PORTING.md).
 *
 * Hình học nguồn (.framer-dimkb5, 324x871, top 3664):
 *
 *   eyebrow   top:0    — 14px xanh
 *   title     top:63   w:300 — 23px nâu
 *   slider    top:197  w:322 — cao 674
 *     ảnh     0,0    322x264
 *     title   24,303 w:275  23px nâu
 *     desc    24,358 w:275  14px nâu
 *     counter 27,606        12px nâu
 *
 * ---------------------------------------------------------------------------
 * VÌ SAO SLIDER ĐƯỢC DỰNG LẠI CHỨ KHÔNG TÁI DÙNG — đọc trước khi "đơn giản hoá".
 *
 * Slider nguồn (components/canvas/BiTTh.tsx) là 935 dòng sinh tự động, hình học
 * nằm trong framer.css dưới một scope riêng (.framer-WyRBZ), chạy bằng một máy
 * variant `cycleOrder` 4 entry.
 *
 * Nó KHÔNG advance. Đo trên trang live: counter đứng nguyên 1/4 qua cả hai nút
 * mũi tên, qua click ảnh và qua drag-swipe. Callback tap của từng variant được
 * truyền vào một component sinh tự động lồng bên trong dưới dạng prop `tGA9atO8Q`
 * và không bao giờ fire. Truyền thẳng `variant` thì lại chạy — đó chính là cách
 * nội dung 4 slide dưới đây được khôi phục — nhưng khách truy cập không có đường
 * nào tới slide 2-4, nên bản ship thực tế là một slide tĩnh đeo nhãn "1/4".
 *
 * ĐÍNH CHÍNH (đọc lại nguồn 2026-07-20): dây nối TRONG nguồn thật ra đủ —
 * `BiTTh.tsx:121-132` dựng 4 `activeVariantCallback` và `RxaUrrPA.tsx:55-62` map
 * `tGA9atO8Q` → `onTap`. Lý do bấm không ăn nằm ở chỗ khác, và PORTING.md:315
 * đã ghi: badge "Made in Framer" (`framer-TLVk2`) fixed góc dưới phải đè lên
 * đúng hai nút, nên `elementFromPoint` trúng badge chứ không trúng nút.
 *
 * Kết luận không đổi: bản generated vẫn không dùng lại được trên host (không có
 * gì ở đây định nghĩa .framer-WyRBZ). Nên đây là slider dựng lại: cùng nội dung,
 * cùng tỉ lệ, cùng bộ control, prev/next + phím mũi tên chạy được, không phụ
 * thuộc framer.css.
 * ---------------------------------------------------------------------------
 *
 * Khác biệt CÓ CHỦ ĐÍCH so với bản apps — theo đúng quy ước 5 block anh em
 * `RealEstateLocation` / `RealEstateHero` / `RealEstateInfo` /
 * `RealEstateOverview` / `RealEstateHighlights` đã lập:
 *
 * 1. THÊM font. Bản apps cố tình bỏ trống fontFamily để style editor thắng;
 *    trên host điều đó làm section mất hẳn chất chữ gốc. Nguồn dùng SVN-Adero
 *    SemiBold (eyebrow) và Light (tiêu đề, chữ trong slide).
 *
 * 2. THÊM entrance. Bản apps không có motion nào. Dựng bằng GSAP với NGUYÊN
 *    timing của `RealEstateInfo` / `RealEstateOverview` / `RealEstateHighlights`
 *    — cùng họ section thì cùng cảm giác.
 *
 * 3. Padding dọc dùng `RE_SECTION_GAP` thay cho `py-[clamp(40px,16.7cqi,120px)]`
 *    của bản apps, đồng bộ với 5 block anh em.
 *
 * 4. Nền `SAND` thay cho nền trong suốt của bản apps, đồng bộ Info/Overview/
 *    Highlights.
 *
 * 5. Key ảnh đổi `slides[i].image` → `slides[i].imageUrl`. Bản apps lệch khỏi
 *    tên field thật trong content; host resolve `fieldType` theo ĐÚNG đường dẫn
 *    field nên key cũ sẽ không bao giờ ra control ảnh. Anh em dùng
 *    `items[i].imageUrl` / `stats[i].iconUrl` — cùng quy ước.
 *
 * NHÁNH CANVAS. Carousel chỉ render MỘT slide, nên trên canvas slide 2-4 không
 * có node `data-element-key` để chọn/sửa — author không cách nào chạm tới. Trên
 * canvas đổi sang lưới 2 cột hiện đủ 4 slide; PreviewMode và `/p` giữ nguyên
 * carousel của bản production.
 *
 * Số slide CỐ ĐỊNH 4, không mở list manager: `StatsControls` sẵn có là generic
 * trên `{value,label}[]` nên không tái dùng được cho `{title,description,imageUrl}`.
 */
import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
import type { RealEstateVillaContent, RealEstateVillaSlide } from '../types';
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
 * canh giữa ở MỌI breakpoint, đúng như `RealEstateHighlights`. `100cqw` để dưới
 * 372 thì co theo khung thay vì tràn; phải là `cqw` chứ không phải `vw` vì block
 * sống trong device frame của editor, nơi bề rộng khung khác bề rộng cửa sổ.
 *
 * Cột đã khoá nên mọi `cqi` bên trong ra THẲNG pixel gốc — vì vậy các `clamp()`
 * trần của bản apps bị bỏ: chúng chỉ tồn tại để chặn chữ phình khi cột còn co
 * theo container. Dưới 372 thì cột và chữ cùng co một nhịp.
 *
 *   thẻ 322/372 = 86.6%   hở 12/372 = 3.23%   thụt 24/322 = 7.45%
 */
const CONTENT_W = 'min(100cqw, 372px)';
const CARD_W = `calc(${CONTENT_W} * 0.866)`;
const GAP_X = `calc(${CONTENT_W} * 0.0323)`;

export function RealEstateVilla({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<RealEstateVillaContent>) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const { hasRoot } = useLandingMotion();

  const slides = Array.isArray(content.slides) ? content.slides : [];
  const count = slides.length;
  const [index, setIndex] = React.useState(0);

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

  const go = React.useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  // Giữ index hợp lệ khi danh sách slide co lại dưới chân (editor có thể xoá
  // slide trong lúc block đang mount).
  React.useEffect(() => {
    if (index > count - 1) setIndex(Math.max(0, count - 1));
  }, [count, index]);

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
    },
    [isCanvas, count]
  );

  const imageBoxRef = React.useRef<HTMLDivElement>(null);
  const textStackRef = React.useRef<HTMLDivElement>(null);
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    // Lưới canvas không có carousel → không có gì để chuyển.
    if (isCanvas) return;
    // Lần render đầu đã có entrance `[data-appear]` lo, đừng chồng thêm.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const img = imageBoxRef.current;
      if (img) {
        gsap.fromTo(
          img,
          { clipPath: 'inset(0 0 0 100%)' },
          { clipPath: 'inset(0 0 0 0%)', duration: 0.6, ease: 'power3.out' }
        );
      }
      const txt = textStackRef.current?.children[index] as
        | HTMLElement
        | undefined;
      if (txt) {
        gsap.fromTo(
          txt,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
      }
    });
    return () => ctx.revert();
  }, [index, isCanvas]);

  const cardSurfaceLayer = (
    <div
      data-element-key='cardSurface'
      aria-hidden
      className={cn(
        selectableClass(activeKey === 'cardSurface'),
        'absolute inset-0'
      )}
      style={composeStyle({ backgroundColor: '#fff' }, styleOf('cardSurface'))}
    />
  );

  const renderSlideImage = (slide: RealEstateVillaSlide, i: number) => {
    const imageKey = `slides[${i}].imageUrl`;
    return (
      <div
        data-element-key={imageKey}
        className={cn(
          selectableClass(activeKey === imageKey),
          'relative aspect-[322/264] w-full overflow-hidden'
        )}
        style={styleOf(imageKey)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={slide.imageUrl}
          src={slide.imageUrl}
          alt={slide.title}
          className='h-full w-full object-cover'
        />
      </div>
    );
  };

  /** Chữ slide. Nguồn thụt vào 24 trên 322 = 7.45cqi, rộng 275 = 85.4cqi. */
  const renderSlideText = (slide: RealEstateVillaSlide, i: number) => {
    const titleKey = `slides[${i}].title`;
    const descKey = `slides[${i}].description`;
    return (
      <div className='relative px-[7.45cqi]'>
        <h3
          data-element-key={titleKey}
          className={selectableClass(activeKey === titleKey)}
          style={composeStyle(
            {
              fontFamily: FONT_BODY,
              fontSize: '7.14cqi',
              lineHeight: 1.372,
              color: BROWN,
              fontWeight: 400,
              marginTop: '12.1cqi',
            },
            styleOf(titleKey)
          )}
        >
          {slide.title}
        </h3>

        <p
          data-element-key={descKey}
          className={selectableClass(activeKey === descKey)}
          style={composeStyle(
            {
              fontFamily: FONT_BODY,
              fontSize: '4.35cqi',
              lineHeight: 1.69,
              color: BROWN,
              fontWeight: 400,
              marginTop: '7.1cqi',
            },
            styleOf(descKey)
          )}
        >
          {slide.description}
        </p>
      </div>
    );
  };

  const renderCard = (slide: RealEstateVillaSlide, i: number) => (
    <div key={i} className='@container relative w-full'>
      {cardSurfaceLayer}
      <div style={{ paddingBottom: '17.4cqi' }}>
        {renderSlideImage(slide, i)}
        {renderSlideText(slide, i)}
      </div>
    </div>
  );

  /** Eyebrow + tiêu đề, canh giữa — dùng chung cho cả hai nhánh. */
  const header = (
    <>
      <p
        data-appear
        data-element-key='eyebrow'
        className={cn(selectableClass(activeKey === 'eyebrow'), 'text-center')}
        style={composeStyle(
          {
            fontFamily: FONT_HEADING,
            fontSize: '3.76cqi',
            lineHeight: 1.69,
            color: GREEN,
            fontWeight: 400,
          },
          styleOf('eyebrow')
        )}
      >
        {content.eyebrow}
      </p>

      <h2
        data-appear
        data-element-key='title'
        className={cn(
          selectableClass(activeKey === 'title'),
          'mx-auto w-[80.6cqi] text-center'
        )}
        style={composeStyle(
          {
            fontFamily: FONT_BODY,
            fontSize: '6.18cqi',
            lineHeight: 1.372,
            color: BROWN,
            fontWeight: 400,
            marginTop: '10.5cqi',
          },
          styleOf('title')
        )}
      >
        {content.title}
      </h2>
    </>
  );

  const rootStyle = composeStyle(
    { backgroundColor: SAND },
    blockBackgroundStyle(background)
  );

  const padY = {
    paddingTop: RE_SECTION_GAP,
    paddingBottom: RE_SECTION_GAP,
  };

  if (isCanvas) {
    return (
      <div
        ref={rootRef}
        data-canvas-edit='true'
        style={rootStyle}
        className={cn('@container relative w-full', className)}
      >
        <style>{FONT_CSS}</style>
        <div style={padY}>
          <div className='@container mx-auto' style={{ width: CONTENT_W }}>
            {header}
          </div>

          <div
            className='mx-auto grid grid-cols-2'
            style={{
              width: `calc(${CARD_W} * 2 + ${GAP_X})`,
              maxWidth: '100%',
              gap: GAP_X,
              marginTop: `calc(${CONTENT_W} * 0.145)`,
            }}
          >
            {slides.map((s, i) => renderCard(s, i))}
          </div>
        </div>
      </div>
    );
  }

  // ── Nhánh production (PreviewMode + `/p`): carousel một slide ──────────────
  const slide = slides[index];

  return (
    <div
      ref={rootRef}
      style={rootStyle}
      className={cn('@container relative w-full', className)}
    >
      <style>{FONT_CSS}</style>
      <div style={padY}>
        <div className='@container mx-auto' style={{ width: CONTENT_W }}>
          {header}

          {slide ? (
            <section
              data-appear
              aria-roledescription='carousel'
              aria-label={content.title}
              className='@container relative mx-auto mt-[14.5cqi]'
              style={{ width: '86.6cqi' }}
              onKeyDown={e => {
                if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  go(index + 1);
                } else if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  go(index - 1);
                }
              }}
            >
              {cardSurfaceLayer}
              <div style={{ paddingBottom: '17.4cqi' }}>
                <div ref={imageBoxRef}>{renderSlideImage(slide, index)}</div>

                <div ref={textStackRef} className='grid'>
                  {slides.map((s, i) => (
                    <div
                      key={i}
                      className='col-start-1 row-start-1'
                      style={{
                        visibility: i === index ? 'visible' : 'hidden',
                      }}
                      aria-hidden={i !== index}
                    >
                      {renderSlideText(s, i)}
                    </div>
                  ))}
                </div>

                <div className='relative px-[7.45cqi]'>
                  <div className='mt-[7.5cqi] flex items-center'>
                    <div
                      className='relative aspect-square w-[12.4cqi] flex-none'
                      style={{
                        backgroundColor: 'rgba(117, 96, 75, 0.2)',
                        borderRadius: '50%',
                      }}
                    >
                      <div
                        className='absolute'
                        style={{
                          inset: '2.5%',
                          backgroundColor: '#fff',
                          borderRadius: '50%',
                        }}
                      />
                      <svg
                        viewBox='0 0 40 40'
                        aria-hidden
                        className='absolute inset-0 h-full w-full -rotate-90'
                      >
                        <circle
                          cx='20'
                          cy='20'
                          r='19.5'
                          fill='none'
                          stroke='#75604B'
                          strokeWidth='1'
                          strokeDasharray={2 * Math.PI * 19.5}
                          strokeDashoffset={
                            2 *
                            Math.PI *
                            19.5 *
                            (1 - (count > 0 ? (index + 1) / count : 0))
                          }
                          style={{
                            transition: 'stroke-dashoffset 400ms ease-out',
                          }}
                        />
                      </svg>
                      <span
                        aria-live='polite'
                        className='absolute inset-0 flex items-center justify-center'
                        style={{
                          // Nguồn dùng SemiBold cho counter, không phải Light.
                          fontFamily: FONT_HEADING,
                          // 12px trên khung 322 = 3.73cqi.
                          fontSize: '3.73cqi',
                          lineHeight: 1.479,
                          color: BROWN,
                          fontWeight: 400,
                        }}
                      >
                        {index + 1}/{count}
                      </span>
                    </div>

                    <div className='ml-auto flex items-center gap-[3.73cqi]'>
                      <button
                        type='button'
                        aria-label='Slide trước'
                        onClick={() => go(index - 1)}
                        className='flex aspect-square w-[12.4cqi] cursor-pointer appearance-none items-center justify-center rounded-full border border-[rgba(117,96,75,0.5)] bg-transparent p-0 text-[rgba(117,96,75,0.5)] transition-colors duration-[400ms] hover:border-[rgb(117,96,75)] hover:text-[rgb(117,96,75)]'
                      >
                        <svg
                          viewBox='0 0 5.093 9.11'
                          aria-hidden
                          className='w-[1.55cqi]'
                          style={{ height: '2.83cqi' }}
                        >
                          <path
                            d='M 4.949 8.967 C 4.757 9.158 4.444 9.158 4.252 8.967 L 0.144 4.9 C -0.048 4.709 -0.048 4.4 0.144 4.21 L 4.252 0.143 C 4.444 -0.048 4.757 -0.048 4.949 0.143 C 5.141 0.334 5.141 0.643 4.949 0.833 L 1.19 4.555 L 4.949 8.277 C 5.141 8.467 5.141 8.776 4.949 8.967 Z'
                            fill='currentColor'
                          />
                        </svg>
                      </button>
                      <button
                        type='button'
                        aria-label='Slide kế tiếp'
                        onClick={() => go(index + 1)}
                        className='flex aspect-square w-[12.4cqi] cursor-pointer appearance-none items-center justify-center rounded-full border border-[rgba(117,96,75,0.5)] bg-transparent p-0 text-[rgba(117,96,75,0.5)] transition-colors duration-[400ms] hover:border-[rgb(117,96,75)] hover:text-[rgb(117,96,75)]'
                      >
                        <svg
                          viewBox='0 0 5.093 9.11'
                          aria-hidden
                          className='w-[1.55cqi] rotate-180'
                          style={{ height: '2.83cqi' }}
                        >
                          <path
                            d='M 4.949 8.967 C 4.757 9.158 4.444 9.158 4.252 8.967 L 0.144 4.9 C -0.048 4.709 -0.048 4.4 0.144 4.21 L 4.252 0.143 C 4.444 -0.048 4.757 -0.048 4.949 0.143 C 5.141 0.334 5.141 0.643 4.949 0.833 L 1.19 4.555 L 4.949 8.277 C 5.141 8.467 5.141 8.776 4.949 8.967 Z'
                            fill='currentColor'
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
