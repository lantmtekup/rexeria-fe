'use client';

/**
 * Block "Hero - Scroll Video" (section `.hero` của delvaux-clone) — bám sát
 * cơ chế gốc:
 *
 *  1. Ảnh sản phẩm ĐÓNG KHUNG (`.hero__img`: padding 80px 80px 0, img cao
 *     100vh, object-position top) — entrance scale 0.9 → 1 (2s, power2.out).
 *  2. Cuộn 100vh đầu: khung ảnh scale 1 → 2 + fade out (sine.out, scrub, pin
 *     — ở đây pin bằng CSS sticky thay GSAP pin để an toàn iOS).
 *  3. Lớp "intro" phía sau hiện dần rồi TUA theo scroll trên 200vh còn lại:
 *     - có `frameUrlPattern` + `frameCount` → canvas frame-sequence (đúng
 *       canvas 143-frame của bản gốc, `{i}` = chỉ số 1-based);
 *     - không frames nhưng có `videoUrl`   → video scrub currentTime;
 *     - còn lại                             → chính posterUrl phóng full-bleed
 *       (crossfade từ ảnh khung sang ảnh nền, zoom nhẹ).
 *
 * Heading overlay TUỲ CHỌN — bản gốc không có chữ trên hero (mặc định '').
 * Toàn bộ motion qua useBlockMotion (R1–R6), scroller trên mọi scrollTrigger.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import {
  DELVAUX_BG,
  DELVAUX_FONT_BODY,
  DELVAUX_FONT_CSS,
  DELVAUX_FONT_HEADING,
} from './delvauxTheme';
import type {
  BlockBackground,
  DelvauxHeroContent,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface Props {
  content: DelvauxHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

/** Danh sách URL frame: ưu tiên `frameUrls` tường minh (CDN key không tuần
 *  tự), fallback sinh từ pattern `{i}` (1-based). */
function frameUrls(content: DelvauxHeroContent): string[] {
  if (Array.isArray(content.frameUrls) && content.frameUrls.length > 1) {
    return content.frameUrls;
  }
  const { frameUrlPattern: pattern, frameCount: count } = content;
  if (!pattern || !pattern.includes('{i}') || count < 2) return [];
  return Array.from({ length: count }, (_, i) =>
    pattern.replaceAll('{i}', String(i + 1))
  );
}

export function DelvauxHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const urls = frameUrls(content);
  const hasFrames = urls.length > 0;
  const hasVideo = !hasFrames && Boolean(content.videoUrl);

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
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (reduce) return;

      const frame = root.querySelector<HTMLElement>('.delvaux-hero-frame');
      const frameImg = root.querySelector<HTMLElement>('.delvaux-hero-poster');
      const intro = root.querySelector<HTMLElement>('.delvaux-hero-intro');

      // (1) Entrance khi vào trang: ảnh khung scale 0.9 → 1 (JS gốc: 2s power2.out).
      if (frameImg) {
        gsap.fromTo(
          frameImg,
          { scale: 0.9 },
          { scale: 1, duration: 2, ease: 'power2.out' }
        );
      }

      // Timeline scrub trên toàn 300vh: 0→0.5 = 100vh đầu, 0.5→2 = 200vh sau.
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // (2) Khung ảnh scale 1 → 2 + biến mất trong 100vh đầu (gốc: sine.out).
      if (frame) {
        tl.fromTo(
          frame,
          { scale: 1, autoAlpha: 1 },
          { scale: 2, autoAlpha: 0, ease: 'sine.out', duration: 1.0 },
          0
        );
      }

      // (3) Lớp intro hiện dần (gốc: autoAlpha 0→1 scrub khi intro chạm đỉnh).
      if (intro) {
        tl.fromTo(
          intro,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.1 },
          0.5
        );
      }

      // (3a) Canvas frame-sequence: tua frame 0 → N-1 trên 200vh còn lại.
      const canvas = canvasRef.current;
      if (hasFrames && canvas) {
        const ctx2d = canvas.getContext('2d');
        const imgs = urls.map(src => {
          const im = new Image();
          im.src = src;
          return im;
        });
        const state = { frame: 0 };
        const draw = () => {
          const im = imgs[Math.round(state.frame)];
          if (!ctx2d || !im || !im.complete || !im.naturalWidth) return;
          if (canvas.width !== im.naturalWidth) {
            canvas.width = im.naturalWidth;
            canvas.height = im.naturalHeight;
          }
          ctx2d.clearRect(0, 0, canvas.width, canvas.height);
          ctx2d.drawImage(im, 0, 0);
        };
        imgs[0].onload = () => {
          draw();
          requestRefresh(); // R4: media load xong → refresh trigger math
        };
        tl.to(
          state,
          {
            frame: imgs.length - 1,
            snap: 'frame',
            duration: 1.5,
            onUpdate: draw,
          },
          0.5
        );
      }

      // (3b) Video scrub: currentTime = progress · duration (fallback khi không frames).
      const video = root.querySelector<HTMLVideoElement>('.delvaux-hero-video');
      if (hasVideo && video) {
        video.pause();
        const state = { t: 0 };
        tl.to(
          state,
          {
            t: 1,
            duration: 1.5,
            onUpdate: () => {
              const d = video.duration;
              if (d && Number.isFinite(d)) video.currentTime = state.t * d;
            },
          },
          0.5
        );
      }

      // (3c) Fallback ảnh full-bleed: zoom nhẹ 1.08 → 1 theo scroll.
      const introImg = root.querySelector<HTMLElement>(
        '.delvaux-hero-intro-img'
      );
      if (!hasFrames && !hasVideo && introImg) {
        tl.fromTo(introImg, { scale: 1.08 }, { scale: 1, duration: 1.5 }, 0.5);
      }

      // Heading overlay (nếu có): fade-up ngay khi mount — không gate scroll.
      const copy = root.querySelector<HTMLElement>('.delvaux-hero-copy');
      if (copy) {
        gsap.from(copy, {
          opacity: 0,
          y: 30,
          duration: 1,
          ease: 'power3.out',
          delay: 0.1,
        });
      }
    },
    [hasFrames, hasVideo, urls.join('|')]
  );

  const clampOpacity = Math.min(Math.max(content.overlayOpacity ?? 0, 0), 1);

  return (
    <section
      ref={rootRef}
      style={composeStyle(
        { background: DELVAUX_BG },
        blockBackgroundStyle(background)
      )}
      className='delvaux-hero @container relative w-full'
    >
      <style>{DELVAUX_FONT_CSS}</style>
      {/* Section cao 300vh như gốc; lớp viewport dán sticky. */}
      <div className='delvaux-hero-tall' style={{ height: '300vh' }}>
        <div className='sticky top-0 h-screen w-full overflow-hidden'>
          {/* Lớp intro (SAU): canvas frame-seq / video scrub / ảnh full-bleed. */}
          <div
            className='delvaux-hero-intro absolute inset-0'
            style={{ opacity: 0 }}
          >
            {hasFrames ? (
              <canvas
                ref={canvasRef}
                className='delvaux-hero-canvas h-full w-full'
                style={{ objectFit: 'cover' }}
              />
            ) : hasVideo ? (
              <video
                data-element-key='videoUrl'
                className={selectableClass(
                  activeKey === 'videoUrl',
                  'delvaux-hero-video'
                )}
                src={content.videoUrl}
                poster={content.posterUrl || undefined}
                muted
                playsInline
                preload='auto'
                style={composeStyle(
                  { width: '100%', height: '100%', objectFit: 'cover' },
                  styleOf('videoUrl')
                )}
              />
            ) : content.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                aria-hidden='true'
                src={content.posterUrl}
                alt=''
                className='delvaux-hero-intro-img h-full w-full'
                style={{ objectFit: 'cover' }}
              />
            ) : null}
          </div>

          {/* Lớp ảnh ĐÓNG KHUNG (TRƯỚC) — `.hero__img` gốc: padding 80px 80px 0. */}
          <div
            className='delvaux-hero-frame absolute inset-0'
            style={{
              padding:
                'clamp(24px, 6.25cqi, 80px) clamp(24px, 6.25cqi, 80px) 0',
              transformOrigin: 'bottom',
              willChange: 'transform',
            }}
          >
            {content.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                data-element-key='posterUrl'
                src={content.posterUrl}
                alt={content.heading || 'Hero'}
                className={selectableClass(
                  activeKey === 'posterUrl',
                  'delvaux-hero-poster'
                )}
                style={composeStyle(
                  {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top',
                  },
                  styleOf('posterUrl')
                )}
              />
            ) : null}
          </div>

          {/* overlay tối (mặc định 0 — bản gốc không có) */}
          {clampOpacity > 0 ? (
            <div
              className='pointer-events-none absolute inset-0'
              style={{ background: '#000000', opacity: clampOpacity }}
            />
          ) : null}

          {/* heading overlay tuỳ chọn — bản gốc không có chữ trên hero */}
          {content.heading || content.subheading ? (
            <div
              className='delvaux-hero-copy absolute inset-x-0 top-0 flex flex-col items-center text-center'
              style={{ paddingTop: 'clamp(64px, 12cqi, 128px)' }}
            >
              <h1
                data-element-key='heading'
                style={composeStyle(
                  {
                    margin: 0,
                    fontFamily: DELVAUX_FONT_HEADING,
                    fontWeight: 400,
                    fontSize: 'clamp(32px, 6cqi, 72px)',
                    lineHeight: 1.1,
                    color: '#111111',
                  },
                  styleOf('heading')
                )}
                className={selectableClass(activeKey === 'heading')}
              >
                {content.heading}
              </h1>
              {content.subheading ? (
                <p
                  data-element-key='subheading'
                  style={composeStyle(
                    {
                      marginTop: 'clamp(12px, 1.8cqi, 20px)',
                      fontFamily: DELVAUX_FONT_BODY,
                      fontSize: 'clamp(13px, 1.5cqi, 18px)',
                      letterSpacing: '0.06em',
                      color: 'rgba(17,17,17,0.72)',
                    },
                    styleOf('subheading')
                  )}
                  className={selectableClass(activeKey === 'subheading')}
                >
                  {content.subheading}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
