'use client';

/**
 * Block "Springs - Hero" (`#l-gallery-sticky` / `.l-gallery__split` của
 * springs-estate-clone) — tường ảnh chéo 6 tấm (2 cột x 3 ảnh), cột phải lệch
 * xuống một khoảng để tạo hiệu ứng "gạch chéo"/checkerboard. Bản gốc dùng 2
 * lớp `.col--md-6` với clip-path reveal riêng biệt cho từng cột (JS
 * `data-reveal="gallery"`) — ở đây RÚT GỌN thành offset tĩnh (transform
 * translateY cột phải) + GSAP fade/scale stagger khi vào viewport, không cố
 * dựng lại cơ chế clip-path/scroll-pin gốc (ngoài phạm vi — xem brief).
 *
 * Overlay: eyebrow nhỏ bên trái ("Exclusive residence...") + tiêu đề serif
 * khổng lồ neo bottom-right ("Splendor" / "of Renewal", 2 dòng qua
 * `whiteSpace: 'pre-line'` + ký tự xuống dòng trong content — xem
 * `defs/springsHero.ts`). Logo/nav là block Header RIÊNG (springs_header) —
 * ở đây chỉ CHỪA khoảng đệm top (paddingTop trên root) để nav nổi phía trên
 * không đè lên hàng ảnh đầu tiên; không dựng lại nav.
 *
 * Font thật (self-host tại springs.estate/assets/fonts, nạp qua @font-face
 * trỏ THẲNG origin gốc — không copy byte ảnh/font về repo):
 *   - "Victor Serif" (headline, VictorSerif-40Regular.woff2, `.h0` bản gốc)
 *   - "TT Commons Pro" (eyebrow/subheading, TT_Commons_Pro_Regular.woff2)
 * Hằng số định nghĩa CỤC BỘ trong file này (Springs chưa có theme.ts dùng
 * chung như Delvaux) — trùng giá trị với `SpringsIntro.tsx`; @font-face khai
 * báo lặp giữa các block Springs vô hại (trình duyệt chỉ tải 1 lần).
 *
 * Mảng `galleryImages` (6 ảnh): theo đúng quy ước `DelvauxVariant.tsx`
 * (`variants`) / `FramerBungeeHeroV2.tsx` (`cardImages`) — CHỈ khối bọc
 * ngoài của mảng nhận `data-element-key`, từng ảnh con KHÔNG có key riêng.
 *
 * Motion: 6 ảnh fade+scale-in so le (stagger) khi cuộn vào viewport → eyebrow
 * rồi headline rise-up theo sau. useBlockMotion (R1–R6), scroller lấy từ
 * context, tôn trọng prefers-reduced-motion.
 *
 * Mobile (R6/R7): ẩn hàng ảnh thứ 3 của mỗi cột (`hidden @2xl:block`) — còn
 * 4/6 ảnh trên container hẹp, tránh tường ảnh quá cao/dồn nén; eyebrow +
 * headline luôn hiển thị đầy đủ.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SpringsHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

/** Serif dùng cho headline lớn — bản gốc: Victor Serif (`.h0`). */
const SPRINGS_HERO_FONT_SERIF =
  "'Victor Serif', 'Cormorant Garamond', Georgia, 'Times New Roman', serif";

/** Sans dùng cho eyebrow/subheading — bản gốc: TT Commons Pro (`.text-t1`). */
const SPRINGS_HERO_FONT_BODY =
  "'TT Commons Pro', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Nền xanh rừng đậm — `--c-dark-green` gốc. */
const SPRINGS_HERO_BG = '#162d24';

/** Màu headline — `--c-beige-background` gốc (cream ấm, nổi trên nền xanh). */
const SPRINGS_HERO_CREAM = '#f5e8d1';

/** Màu eyebrow/subheading — `--c-beige` gốc (dịu hơn cream). */
const SPRINGS_HERO_BEIGE = '#e0d1b6';

const SPRINGS_HERO_FONT_CSS = `
@font-face { font-family: 'Victor Serif'; src: url('https://springs.estate/assets/fonts/VictorSerif-40Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TT_Commons_Pro_Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
`;

interface Props {
  content: SpringsHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function SpringsHero({
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

  const images = Array.isArray(content.galleryImages)
    ? content.galleryImages.filter(Boolean)
    : [];
  const left = images.slice(0, 3);
  const right = images.slice(3, 6);

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const photos = root.querySelectorAll<HTMLElement>('.springs-hero-photo');
      const eyebrow = root.querySelector<HTMLElement>('.springs-hero-eyebrow');
      const heading = root.querySelector<HTMLElement>('.springs-hero-heading');
      const subheading = root.querySelector<HTMLElement>(
        '.springs-hero-subheading'
      );

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        },
      });

      if (photos.length) {
        tl.from(
          photos,
          { autoAlpha: 0, scale: 1.12, duration: 1.1, stagger: 0.07 },
          0
        );
      }
      if (eyebrow)
        tl.from(eyebrow, { autoAlpha: 0, y: 24, duration: 0.8 }, 0.35);
      if (heading)
        tl.from(heading, { autoAlpha: 0, y: 40, duration: 0.9 }, 0.42);
      if (subheading) {
        tl.from(subheading, { autoAlpha: 0, y: 20, duration: 0.7 }, 0.58);
      }

      // R4: ảnh load async có thể đổi chiều cao khung → refresh trigger math.
      root.querySelectorAll('img').forEach(img => {
        if (!(img as HTMLImageElement).complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });
    },
    [images.length]
  );

  const renderColumn = (imgs: string[], variant: 'left' | 'right') => (
    <div
      className='springs-hero-col flex flex-col'
      style={{
        gap: 'clamp(4px, 1.1cqi, 14px)',
        transform:
          variant === 'right'
            ? 'translateY(clamp(28px, 9cqi, 96px))'
            : undefined,
      }}
    >
      {imgs.map((src, i) => (
        <div
          key={`${variant}-${i}`}
          className={
            i === 2
              ? 'springs-hero-cell relative hidden flex-1 overflow-hidden @2xl:block'
              : 'springs-hero-cell relative flex-1 overflow-hidden'
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=''
            aria-hidden='true'
            className='springs-hero-photo pointer-events-none absolute inset-0 h-full w-full object-cover'
          />
        </div>
      ))}
    </div>
  );

  return (
    <section
      ref={rootRef}
      style={composeStyle(
        { background: SPRINGS_HERO_BG },
        blockBackgroundStyle(background)
      )}
      className='springs-hero @container relative w-full overflow-hidden'
    >
      <style>{SPRINGS_HERO_FONT_CSS}</style>

      {/* Đệm top cho block Header (logo/nav) đứng riêng nổi phía trên — không
          dựng lại nav ở đây (xem note đầu file). */}
      <div style={{ paddingTop: 'clamp(64px, 9cqi, 112px)' }}>
        <div className='springs-hero-stage relative aspect-[3/4] w-full @2xl:aspect-[4/3] @4xl:aspect-[16/9]'>
          {/* Tường ảnh chéo — mảng galleryImages, 1 key duy nhất trên khối bọc. */}
          <div
            data-element-key='galleryImages'
            className={selectableClass(
              activeKey === 'galleryImages',
              'springs-hero-gallery absolute inset-0 z-0 grid grid-cols-2 overflow-hidden'
            )}
            style={composeStyle(
              { gap: 'clamp(4px, 1.1cqi, 14px)' },
              styleOf('galleryImages')
            )}
          >
            {renderColumn(left, 'left')}
            {renderColumn(right, 'right')}
          </div>

          {/* Scrim tối dần đáy khung — hỗ trợ đọc chữ overlay, không editable. */}
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 bottom-0 z-[1]'
            style={{
              height: '55%',
              background:
                'linear-gradient(180deg, rgba(22,45,36,0) 0%, rgba(22,45,36,0.65) 100%)',
            }}
          />

          {/* Copy overlay: eyebrow trái + headline serif neo bottom-right. */}
          <div
            className='springs-hero-caption relative z-[2] flex h-full flex-col justify-end @4xl:flex-row @4xl:items-end @4xl:justify-between'
            style={{
              padding: 'clamp(20px, 5cqi, 64px)',
              gap: 'clamp(16px, 3cqi, 32px)',
            }}
          >
            <p
              data-element-key='eyebrow'
              className={selectableClass(
                activeKey === 'eyebrow',
                'springs-hero-eyebrow'
              )}
              style={composeStyle(
                {
                  margin: 0,
                  maxWidth: 'min(100%, 30ch)',
                  fontFamily: SPRINGS_HERO_FONT_BODY,
                  fontWeight: 400,
                  fontSize: 'clamp(13px, 1.5cqi, 18px)',
                  lineHeight: 1.45,
                  color: SPRINGS_HERO_BEIGE,
                },
                styleOf('eyebrow')
              )}
            >
              {content.eyebrow}
            </p>

            <div className='springs-hero-heading-wrap flex flex-col items-end'>
              <h1
                data-element-key='heading'
                className={selectableClass(
                  activeKey === 'heading',
                  'springs-hero-heading'
                )}
                style={composeStyle(
                  {
                    margin: 0,
                    fontFamily: SPRINGS_HERO_FONT_SERIF,
                    fontWeight: 400,
                    fontSize: 'clamp(40px, 10cqi, 168px)',
                    lineHeight: 0.98,
                    letterSpacing: '-0.02em',
                    color: SPRINGS_HERO_CREAM,
                    whiteSpace: 'pre-line',
                    textAlign: 'right',
                  },
                  styleOf('heading')
                )}
              >
                {content.heading}
              </h1>
              {content.subheading ? (
                <p
                  data-element-key='subheading'
                  className={selectableClass(
                    activeKey === 'subheading',
                    'springs-hero-subheading'
                  )}
                  style={composeStyle(
                    {
                      margin: 0,
                      marginTop: 'clamp(8px, 1.2cqi, 16px)',
                      fontFamily: SPRINGS_HERO_FONT_BODY,
                      fontWeight: 400,
                      fontSize: 'clamp(13px, 1.4cqi, 17px)',
                      color: SPRINGS_HERO_BEIGE,
                      opacity: 0.8,
                    },
                    styleOf('subheading')
                  )}
                >
                  {content.subheading}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
