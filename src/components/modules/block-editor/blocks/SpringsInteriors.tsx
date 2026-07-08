'use client';

/**
 * Block "Springs - Interiors" — port đầy đủ section `.l-interiors` /
 * `#interiors` gốc: STICKY PIN 300vh, 2 beat nối tiếp trong cùng 1 pin (gốc
 * `clip-path curtain` + `height:350vh; margin-top:-200vh`):
 *   (1) "intro" — ảnh nền full-bleed zoom-out (gốc `data-parallax-0-0 scale
 *       (1.2)` → `--250-0 scale(1.0)`), tiêu đề phải-canh giữa dọc + mô tả
 *       neo góc dưới-trái (gốc `.l-interiors__intro-caption` /
 *       `.l-interiors__intro__text`).
 *   (2) "slider" — crossfade sang ảnh nội thất chính + rail thumbnail dọc
 *       bên phải để đổi ảnh (gốc `.l-interiors__slider-thumb__links`, click
 *       đổi `.is-active`) — thumbnail click là tương tác thật (state cục
 *       bộ), không phụ thuộc vị trí cuộn.
 *
 * ⚠ Giống mọi scroll-block trong repo: scrub chỉ chạy đầy đủ trên trang
 * publish `/p`. Trong editor canvas không có scroll → hiển thị FRAME ĐẦU
 * (beat 1, ảnh intro) — đúng trạng thái ban đầu, không phải lỗi.
 *
 * Font thật của bản gốc (self-host tại springs.estate/assets/fonts):
 *   - "Victor Serif" (tiêu đề, VictorSerif-40Regular.woff2)
 *   - "TT Commons Pro" (mô tả + nhãn, TT_Commons_Pro_Regular.woff2 400 +
 *     TTCommonsPro-Md.woff2 500)
 * Nạp qua @font-face trỏ thẳng CDN gốc (không self-host lại) — khai báo lặp
 * giữa các block Springs vô hại, trình duyệt chỉ tải 1 lần.
 *
 * `images` là dữ liệu nội dung dạng mảng (không có fieldType "list" trong
 * LayersPanel hiện tại — chỉ text/textarea/image đơn), nên KHÔNG gắn
 * `data-element-key` riêng cho từng ảnh; heading/description/introImage mới
 * là các phần tử chọn được trên canvas.
 *
 * Mobile (`useContainerMobile`): bản gốc `is-hidden--md-down` tắt hẳn trên
 * mobile. Ở đây GIỮ hiển thị (tĩnh, không pin) — heading/mô tả + dải slider
 * ảnh cuộn ngang chạm tay được, khác biệt có chủ đích so với gốc.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SpringsInteriorsContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useContainerMobile } from './useContainerMobile';

/** clip-path đầy đủ / ẩn-dưới-đáy — cùng quy ước `SpringsHero.tsx`/`SpringsMap.tsx`. */
const INTERIORS_CLIP_FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
const INTERIORS_CLIP_HIDDEN_BOTTOM =
  'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)';

/** Serif dùng cho tiêu đề — bản gốc: Victor Serif. */
export const SPRINGS_INTERIORS_FONT_SERIF =
  "'Victor Serif', 'Cormorant Garamond', Georgia, 'Times New Roman', serif";

/** Sans dùng cho mô tả — bản gốc: TT Commons Pro. */
export const SPRINGS_INTERIORS_FONT_BODY =
  "'TT Commons Pro', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Nền cream sáng của section (mobile tĩnh + khung section desktop quanh
 *  pin) — giữ mạch sáng/tối xen kẽ giữa các block Springs. */
export const SPRINGS_INTERIORS_BG = '#f4f1e9';

/** Chữ chính — xanh ink đậm (đối lập nền cream), đồng bộ SpringsIntro. */
export const SPRINGS_INTERIORS_INK = '#152018';

export const SPRINGS_INTERIORS_FONT_CSS = `
@font-face { font-family: 'Victor Serif'; src: url('https://springs.estate/assets/fonts/VictorSerif-40Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TT_Commons_Pro_Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TTCommonsPro-Md.woff2') format('woff2'); font-weight: 500; font-style: normal; font-display: swap; }
`;

interface Props {
  content: SpringsInteriorsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function SpringsInteriors({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const images = Array.isArray(content.images) ? content.images : [];
  const [activeIndex, setActiveIndex] = React.useState(0);

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
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      if (root.clientWidth > 0 && root.clientWidth < 768) return;

      const sticky = root.querySelector<HTMLElement>(
        '.springs-interiors-sticky'
      );
      const introWrap = root.querySelector<HTMLElement>(
        '.springs-interiors-intro'
      );
      const introInner = root.querySelector<HTMLElement>(
        '.springs-interiors-intro-inner'
      );
      const heading = root.querySelector<HTMLElement>(
        '.springs-interiors-heading'
      );
      const description = root.querySelector<HTMLElement>(
        '.springs-interiors-description'
      );
      const sliderWrap = root.querySelector<HTMLElement>(
        '.springs-interiors-slider'
      );
      if (!sticky) return;

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          pin: sticky,
          pinSpacing: false,
          pinType: 'transform',
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Beat 1 — intro: curtain reveal + zoom-out (gốc scale 1.2→1.0).
      if (introWrap) {
        tl.fromTo(
          introWrap,
          { clipPath: INTERIORS_CLIP_HIDDEN_BOTTOM },
          { clipPath: INTERIORS_CLIP_FULL, duration: 0.22 },
          0
        );
      }
      if (introInner) {
        tl.fromTo(introInner, { scale: 1.2 }, { scale: 1, duration: 0.55 }, 0);
      }
      if (heading) {
        tl.fromTo(
          heading,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.18 },
          0.15
        );
      }
      if (description) {
        tl.fromTo(
          description,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.18 },
          0.2
        );
      }

      // Beat 2 — slider: crossfade từ intro sang slider + rail thumbnail.
      if (introWrap) {
        tl.to(introWrap, { autoAlpha: 0, duration: 0.15 }, 0.62);
      }
      if (sliderWrap) {
        tl.fromTo(
          sliderWrap,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.2 },
          0.58
        );
      }

      root.querySelectorAll('img').forEach(img => {
        if (!(img as HTMLImageElement).complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });
    },
    [images.join('|'), isMobile]
  );

  const activeImage = images[activeIndex] ?? images[0];

  // `onPhoto`: overlay đè lên ảnh intro (desktop) → chữ kem sáng. `onCream`:
  // đứng trên nền cream phẳng (mobile) → chữ ink đậm.
  const renderIntroCaption = (variant: 'onPhoto' | 'onCream') => {
    const inkColor = variant === 'onPhoto' ? '#f5e8d1' : SPRINGS_INTERIORS_INK;
    const descColor =
      variant === 'onPhoto' ? 'rgba(245,232,209,0.82)' : SPRINGS_INTERIORS_INK;
    return (
      <React.Fragment>
        <h2
          data-element-key='heading'
          className={selectableClass(
            activeKey === 'heading',
            'springs-interiors-heading'
          )}
          style={composeStyle(
            {
              margin: 0,
              fontFamily: SPRINGS_INTERIORS_FONT_SERIF,
              fontWeight: 400,
              fontSize: 'clamp(36px, 6cqi, 76px)',
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
              color: inkColor,
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
              'springs-interiors-description'
            )}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: SPRINGS_INTERIORS_FONT_BODY,
                fontWeight: 400,
                fontSize: 'clamp(15px, 1.6cqi, 19px)',
                lineHeight: 1.6,
                color: descColor,
                opacity: variant === 'onPhoto' ? 1 : 0.72,
                maxWidth: '46ch',
                marginTop: 'clamp(16px, 2.6cqi, 28px)',
              },
              styleOf('description')
            )}
          >
            {content.description}
          </p>
        ) : null}
      </React.Fragment>
    );
  };

  // ── Mobile: gốc ẩn hẳn (`is-hidden--md-down`) — ở đây giữ tĩnh, không pin. ─
  if (isMobile) {
    return (
      <section
        ref={rootRef}
        style={composeStyle(
          { background: SPRINGS_INTERIORS_BG },
          blockBackgroundStyle(background)
        )}
        className='springs-interiors @container relative w-full overflow-hidden'
      >
        <style>{SPRINGS_INTERIORS_FONT_CSS}</style>

        <div
          className='mx-auto flex w-full max-w-[1400px] flex-col items-end text-right'
          style={{
            padding:
              'clamp(48px, 10cqi, 96px) clamp(20px, 6cqi, 40px) clamp(24px, 5cqi, 40px)',
          }}
        >
          {renderIntroCaption('onCream')}
        </div>

        {images.length ? (
          <div
            className='springs-interiors-track flex w-full gap-[clamp(8px,1.6cqi,20px)] overflow-x-auto'
            style={{
              padding: '0 clamp(20px, 6cqi, 40px) clamp(48px, 9cqi, 80px)',
              scrollSnapType: 'x proximity',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${src}-${i}`}
                src={src}
                alt={`${content.heading || 'Interiors'} ${i + 1}`}
                loading={i < 2 ? 'eager' : 'lazy'}
                className='h-[clamp(260px,60cqi,420px)] w-[clamp(200px,45cqi,320px)] shrink-0 object-cover'
                style={{
                  scrollSnapAlign: 'start',
                  borderRadius: 'clamp(2px, 0.4cqi, 6px)',
                }}
              />
            ))}
          </div>
        ) : null}
      </section>
    );
  }

  // ── Desktop: sticky pin 300vh, 2 beat (intro → slider). ──────────────────
  return (
    <section
      ref={rootRef}
      style={composeStyle(
        { height: '300vh', background: SPRINGS_INTERIORS_BG },
        blockBackgroundStyle(background)
      )}
      className='springs-interiors @container relative w-full'
    >
      <style>{SPRINGS_INTERIORS_FONT_CSS}</style>

      <div className='springs-interiors-sticky relative h-[100svh] w-full overflow-hidden'>
        {/* Beat 1: intro — ảnh nền full-bleed + heading/description overlay. */}
        <div
          className='springs-interiors-intro absolute inset-0 z-[1]'
          style={{ clipPath: INTERIORS_CLIP_HIDDEN_BOTTOM }}
        >
          {content.introImage ? (
            <div
              data-element-key='introImage'
              className={selectableClass(
                activeKey === 'introImage',
                'springs-interiors-intro-inner absolute inset-0'
              )}
              style={styleOf('introImage')}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.introImage}
                alt=''
                aria-hidden='true'
                className='h-full w-full object-cover'
              />
            </div>
          ) : null}
          {/* Scrim tối dần về phía phải — đủ tương phản cho caption phải-canh
              mà không phủ tối toàn ảnh (ảnh gốc có thể sáng/nhiều chi tiết). */}
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-0'
            style={{
              background:
                'linear-gradient(100deg, rgba(10,20,15,0) 35%, rgba(10,20,15,0.55) 68%, rgba(10,20,15,0.72) 100%)',
            }}
          />
          <div
            className='relative flex h-full w-full items-center justify-end'
            style={{ padding: 'clamp(40px, 6cqi, 80px)' }}
          >
            <div
              className='flex flex-col items-end text-right'
              style={{
                maxWidth: '60%',
                textShadow: '0 2px 16px rgba(10,20,15,0.35)',
              }}
            >
              {renderIntroCaption('onPhoto')}
            </div>
          </div>
        </div>

        {/* Beat 2: slider — ảnh chính + rail thumbnail dọc bên phải. */}
        <div
          className='springs-interiors-slider absolute inset-0 z-[2]'
          style={{ opacity: 0 }}
        >
          {activeImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeImage}
              alt={content.heading || 'Interiors'}
              className='h-full w-full object-cover'
            />
          ) : null}
          {images.length > 1 ? (
            <div
              className='absolute top-1/2 flex -translate-y-1/2 flex-col'
              style={{
                right: 'clamp(20px, 3cqi, 48px)',
                gap: 'clamp(4px, 0.6cqi, 6px)',
              }}
            >
              {images.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type='button'
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Interior ${i + 1}`}
                  className='cursor-pointer overflow-hidden'
                  style={{
                    width: 'clamp(44px, 4.2cqi, 60px)',
                    height: 'clamp(44px, 4.2cqi, 60px)',
                    border:
                      i === activeIndex
                        ? '1.5px solid #f5e8d1'
                        : '1.5px solid transparent',
                    padding: i === activeIndex ? '4px' : 0,
                    background: 'transparent',
                    borderRadius: '2px',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=''
                    aria-hidden='true'
                    className='h-full w-full object-cover'
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
