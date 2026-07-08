'use client';

/**
 * Block "Springs - Residences" — port section `.l-residences` /
 * `#l-residences-sticky-1` gốc (dòng 5717-6604 index.html): STICKY PIN với
 * slideshow crossfade N nhịp (gốc `data-scroll-snap-point` 4 điểm, 3 caption
 * card thực tế: "Flats" / "Townhouses" / "Penthouses" — gốc
 * `data-parallax-pattern="residencesSlide"`), panel caption bên phải hiện
 * loại căn hộ đang active + progress bar chia đoạn (gốc
 * `.l-residences__caption__line-progress`). Port sang GSAP ScrollTrigger
 * pin+scrub, khuôn mẫu chung với `SpringsMap.tsx`: curtain-reveal entrance +
 * zoom-out parallax (gốc scale 1.2→1.0), rồi mỗi ảnh crossfade nối tiếp ảnh
 * trước theo tiến trình cuộn.
 *
 * ⚠ Giống mọi scroll-block trong repo: scrub chỉ chạy đầy đủ trên trang
 * publish `/p`. Trong editor canvas không có scroll → hiển thị FRAME ĐẦU
 * (ảnh + caption đầu tiên) — đúng trạng thái ban đầu, không phải lỗi.
 *
 * Font thật của bản gốc (self-host tại springs.estate/assets/fonts), giống
 * SpringsIntro — khai báo lặp giữa các block Springs vô hại (trình duyệt chỉ
 * tải 1 lần):
 *   - "Victor Serif" (heading, VictorSerif-40Regular.woff2)
 *   - "TT Commons Pro" (mô tả, TT_Commons_Pro_Regular.woff2 400 +
 *     TTCommonsPro-Md.woff2 500)
 *
 * `images`/`captions` là content data dạng mảng (song song theo index),
 * không có `data-element-key` riêng từng item — cùng quy ước các block
 * Springs khác có mảng nội dung.
 *
 * Mobile (`useContainerMobile`): bản gốc `is-hidden--md-down` tắt hẳn pin
 * trên mobile. Ở đây GIỮ dải ảnh scroll-snap ngang tĩnh (đã có sẵn) — khác
 * biệt có chủ đích so với gốc.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SpringsResidencesContent,
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

/** clip-path đầy đủ / ẩn-dưới-đáy — cùng quy ước `SpringsMap.tsx`. */
const RES_CLIP_FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
const RES_CLIP_HIDDEN_BOTTOM =
  'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)';

/** Serif dùng cho heading — bản gốc: Victor Serif. */
export const SPRINGS_RESIDENCES_FONT_SERIF =
  "'Victor Serif', 'Cormorant Garamond', Georgia, 'Times New Roman', serif";

/** Sans dùng cho mô tả — bản gốc: TT Commons Pro. */
export const SPRINGS_RESIDENCES_FONT_BODY =
  "'TT Commons Pro', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Nền cream nhạt đồng bộ tông brand Springs (bản gốc dùng nền ảnh full-bleed). */
export const SPRINGS_RESIDENCES_BG = '#f4f1e9';

/** Chữ chính — xanh ink đậm. */
export const SPRINGS_RESIDENCES_INK = '#152018';

export const SPRINGS_RESIDENCES_FONT_CSS = `
@font-face { font-family: 'Victor Serif'; src: url('https://springs.estate/assets/fonts/VictorSerif-40Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TT_Commons_Pro_Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TTCommonsPro-Md.woff2') format('woff2'); font-weight: 500; font-style: normal; font-display: swap; }
`;

interface Props {
  content: SpringsResidencesContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function SpringsResidences({
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
  const captions = Array.isArray(content.captions) ? content.captions : [];

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
        '.springs-residences-sticky'
      );
      const wrap = root.querySelector<HTMLElement>('.springs-residences-clip');
      const slides = gsap.utils.toArray<HTMLElement>(
        '.springs-residences-slide',
        root
      );
      const slideImgs = gsap.utils.toArray<HTMLElement>(
        '.springs-residences-slide-img',
        root
      );
      const captionEls = gsap.utils.toArray<HTMLElement>(
        '.springs-residences-caption-item',
        root
      );
      const progressEls = gsap.utils.toArray<HTMLElement>(
        '.springs-residences-progress-fill',
        root
      );
      if (!sticky || !slides.length) return;

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

      const REVEAL_END = 0.16;
      if (wrap) {
        tl.fromTo(
          wrap,
          { clipPath: RES_CLIP_HIDDEN_BOTTOM },
          { clipPath: RES_CLIP_FULL, duration: REVEAL_END },
          0
        );
      }
      slideImgs.forEach(img => {
        tl.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 0.9 }, 0);
      });

      // Crossfade N ảnh nối tiếp + đồng bộ caption/progress-bar per nhịp.
      const N = slides.length;
      const step = (1 - REVEAL_END) / N;
      slides.forEach((slide, i) => {
        const at = REVEAL_END + i * step;
        if (i > 0) {
          tl.to(slides[i - 1], { autoAlpha: 0, duration: step * 0.35 }, at);
          tl.fromTo(
            slide,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: step * 0.35 },
            at
          );
        }
        const caption = captionEls[i];
        if (caption) {
          if (i === 0) {
            tl.set(caption, { autoAlpha: 1 }, 0);
          } else {
            tl.to(
              captionEls[i - 1],
              { autoAlpha: 0, duration: step * 0.3 },
              at
            );
            tl.fromTo(
              caption,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: step * 0.3 },
              at
            );
          }
        }
        const bar = progressEls[i];
        if (bar) {
          tl.fromTo(
            bar,
            { scaleX: 0 },
            { scaleX: 1, duration: step, ease: 'none' },
            at
          );
        }
      });

      root.querySelectorAll('img').forEach(img => {
        if (!(img as HTMLImageElement).complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });
    },
    [images.join('|'), isMobile]
  );

  // `onCream`: đứng trên nền cream phẳng (mobile) → chữ ink đậm. `onPhoto`:
  // overlay đè lên ảnh slideshow (desktop) → chữ kem sáng + text-shadow.
  const renderHeadingBlock = (variant: 'onPhoto' | 'onCream') => {
    const headColor =
      variant === 'onPhoto' ? '#f6f5ee' : SPRINGS_RESIDENCES_INK;
    const descColor =
      variant === 'onPhoto' ? 'rgba(246,245,238,0.86)' : SPRINGS_RESIDENCES_INK;
    return (
      <div
        className={
          variant === 'onPhoto'
            ? 'flex flex-col items-start'
            : 'flex flex-col items-start @2xl:flex-row @2xl:items-end @2xl:justify-between'
        }
        style={{
          gap: 'clamp(16px, 2.4cqi, 28px)',
          textShadow:
            variant === 'onPhoto' ? '0 2px 16px rgba(10,20,15,0.4)' : undefined,
        }}
      >
        <h2
          data-element-key='heading'
          className={selectableClass(
            activeKey === 'heading',
            'springs-residences-heading'
          )}
          style={composeStyle(
            {
              margin: 0,
              fontFamily: SPRINGS_RESIDENCES_FONT_SERIF,
              fontWeight: 400,
              fontSize: 'clamp(32px, 5cqi, 58px)',
              lineHeight: 1.08,
              letterSpacing: '-0.01em',
              color: headColor,
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
              'springs-residences-description'
            )}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: SPRINGS_RESIDENCES_FONT_BODY,
                fontWeight: 400,
                fontSize: 'clamp(14px, 1.5cqi, 18px)',
                lineHeight: 1.55,
                color: descColor,
                opacity: variant === 'onPhoto' ? 1 : 0.72,
                maxWidth: '38ch',
              },
              styleOf('description')
            )}
          >
            {content.description}
          </p>
        ) : null}
      </div>
    );
  };

  // ── Mobile: gốc ẩn hẳn (`is-hidden--md-down`) — giữ dải ảnh scroll-snap tĩnh. ─
  if (isMobile) {
    return (
      <section
        ref={rootRef}
        style={composeStyle(
          { background: SPRINGS_RESIDENCES_BG },
          blockBackgroundStyle(background)
        )}
        className='springs-residences @container relative w-full overflow-hidden'
      >
        <style>{SPRINGS_RESIDENCES_FONT_CSS}</style>
        <div
          className='mx-auto w-full max-w-[1440px]'
          style={{
            padding:
              'clamp(48px, 10cqi, 96px) clamp(20px, 6cqi, 40px) clamp(40px, 8cqi, 64px)',
          }}
        >
          {renderHeadingBlock('onCream')}

          {images.length ? (
            <div
              className='springs-residences-strip'
              style={{
                marginTop: 'clamp(32px, 5cqi, 56px)',
                display: 'flex',
                gap: 'clamp(12px, 1.8cqi, 20px)',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                paddingBottom: '4px',
              }}
            >
              {images.map((src, idx) => (
                <div
                  key={`${src}-${idx}`}
                  className='relative shrink-0 overflow-hidden'
                  style={{
                    width: 'clamp(240px, 78cqi, 420px)',
                    aspectRatio: '4 / 5',
                    scrollSnapAlign: 'start',
                    borderRadius: 'clamp(2px, 0.4cqi, 6px)',
                    background: 'rgba(21,32,24,0.06)',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={captions[idx] || content.heading || 'Residence'}
                    className='absolute inset-0 h-full w-full'
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                    loading='lazy'
                    draggable={false}
                  />
                  {captions[idx] ? (
                    <p
                      style={{
                        position: 'absolute',
                        left: '12px',
                        bottom: '12px',
                        margin: 0,
                        padding: '4px 10px',
                        background: 'rgba(21,32,24,0.6)',
                        color: '#f6f5ee',
                        fontFamily: SPRINGS_RESIDENCES_FONT_BODY,
                        fontSize: '12px',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        borderRadius: '3px',
                      }}
                    >
                      {captions[idx]}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  // ── Desktop: sticky pin, slideshow crossfade N nhịp + caption + progress. ─
  return (
    <section
      ref={rootRef}
      style={composeStyle(
        { height: `${100 + images.length * 90}vh`, background: '#12160f' },
        blockBackgroundStyle(background)
      )}
      className='springs-residences @container relative w-full'
    >
      <style>{SPRINGS_RESIDENCES_FONT_CSS}</style>

      <div className='springs-residences-sticky relative h-[100svh] w-full overflow-hidden'>
        <div
          className='springs-residences-clip absolute inset-0'
          style={{ clipPath: RES_CLIP_HIDDEN_BOTTOM }}
        >
          <div
            data-element-key='images'
            className={selectableClass(
              activeKey === 'images',
              'absolute inset-0'
            )}
            style={styleOf('images')}
          >
            {images.map((src, idx) => (
              <div
                key={`${src}-${idx}`}
                className='springs-residences-slide absolute inset-0'
                style={{ opacity: idx === 0 ? 1 : 0 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={captions[idx] || content.heading || 'Residence'}
                  className='springs-residences-slide-img h-full w-full object-cover'
                />
              </div>
            ))}
          </div>

          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-0'
            style={{
              background:
                'linear-gradient(180deg, rgba(10,14,8,0.45) 0%, rgba(10,14,8,0) 32%, rgba(10,14,8,0.15) 55%, rgba(10,14,8,0.62) 100%)',
            }}
          />

          {/* Heading + mô tả — góc trên-trái. */}
          <div
            className='absolute z-[2]'
            style={{ padding: 'clamp(24px, 5cqi, 64px)', maxWidth: '52%' }}
          >
            {renderHeadingBlock('onPhoto')}
          </div>

          {/* Panel caption — góc dưới-phải (gốc `col--md-3 offset--md-9`).
              Width TƯỜNG MINH (không phải maxWidth) — con của nó có
              `.captions` chứa toàn phần tử `position:absolute` (không đóng
              góp kích thước tự nhiên), nên panel cần 1 kích thước cố định để
              không co về 0 width. */}
          <div
            className='absolute z-[2] flex flex-col items-end text-right'
            style={{
              right: 'clamp(24px, 5cqi, 64px)',
              bottom: 'clamp(32px, 6cqi, 72px)',
              width: 'clamp(200px, 24cqi, 320px)',
            }}
          >
            <div
              data-element-key='captions'
              className={selectableClass(
                activeKey === 'captions',
                'relative h-[1.6em] w-full'
              )}
              style={styleOf('captions')}
            >
              {captions.map((label, idx) => (
                <p
                  key={`${label}-${idx}`}
                  className='springs-residences-caption-item absolute inset-x-0 bottom-0 text-right'
                  style={{
                    margin: 0,
                    opacity: idx === 0 ? 1 : 0,
                    fontFamily: SPRINGS_RESIDENCES_FONT_SERIF,
                    fontWeight: 400,
                    fontSize: 'clamp(24px, 3.2cqi, 36px)',
                    lineHeight: 1.2,
                    color: '#f6f5ee',
                  }}
                >
                  {label}
                </p>
              ))}
            </div>

            {images.length > 1 ? (
              <div
                className='mt-[clamp(12px,1.8cqi,20px)] flex w-full'
                style={{ gap: '6px' }}
              >
                {images.map((src, idx) => (
                  <div
                    key={`bar-${src}-${idx}`}
                    className='h-[2px] flex-1 overflow-hidden'
                    style={{ background: 'rgba(246,245,238,0.28)' }}
                  >
                    <div
                      className='springs-residences-progress-fill h-full w-full origin-left'
                      style={{
                        background: '#f6f5ee',
                        transform: idx === 0 ? 'scaleX(1)' : 'scaleX(0)',
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
