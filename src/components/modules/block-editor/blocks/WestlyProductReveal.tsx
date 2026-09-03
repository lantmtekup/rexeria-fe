'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  WestlyProductRevealContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useWestlyPointer, westlyCursorToggle } from './WestlyPointer';
import { useContainerMobile } from './useContainerMobile';
import { WESTLY_FONT_DISPLAY, WESTLY_FONT_UI } from './westlyTheme';

interface WestlyProductRevealProps {
  content: WestlyProductRevealContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * The Westly · Rooftop — port từ apps/the-westly ProductReveal.tsx.
 *
 * Stack 4 lớp (photo ẩn / skyline / dải mây / nét vẽ foreground với trời trong
 * suốt) — click cả stack lật sang ảnh hoàn thiện; mây + skyline + panel copy
 * drift theo scroll; mouse parallax fg ngược chiều mây. Block THƯỜNG: không
 * sticky, không veil (đây là section chốt của chuỗi, không bàn giao đi đâu).
 *
 * Khác apps:
 * - Bỏ bg fade-in (đền bù SceneReveal ghim bên dưới ở page-level) — nền đặc
 *   `bgColor` từ đầu, trùng veilColor của block trước là liền mạch.
 * - Entrance chữ: toggleActions 'restart none restart reverse' thay cặp
 *   playUi/resetUi + ScrollTrigger.create.
 * - Reveal imperative trong effect (production không re-render → aria-pressed
 *   setAttribute an toàn).
 * - Con trỏ tùy biến: `westlyCursorToggle` trên stack + `useWestlyPointer`
 *   (xem WestlyPointer.tsx — app mount ở page-level, host mount theo block).
 */

const ACCENT = '#6E7A6F';

const DEFAULT_FG = '/the-westly/s6-p1.png';
const DEFAULT_CLOUDS = '/the-westly/s6-p2.png';
const DEFAULT_SKYLINE = '/the-westly/s6-p3.png';
const DEFAULT_PHOTO = '/the-westly/s6-p4.png';
const DEFAULT_BG = '#F3F1EA';

const FILL_IMG_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

export function WestlyProductReveal({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: WestlyProductRevealProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const isCanvas = useIsCanvasEdit(rootRef);
  const pointer = useWestlyPointer(isCanvas);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const eyebrow = content.eyebrow?.trim() || 'ROOFTOP';
  const title =
    content.title?.trim() || 'A Private Rooftop Above the Upper West Side';
  const description =
    content.description?.trim() ||
    'It is not an amenity. It is an extension of the home.';
  const foregroundUrl = content.foregroundUrl?.trim() || DEFAULT_FG;
  const foregroundAlt =
    content.foregroundAlt?.trim() || 'The Terrace interior sketch';
  const cloudsUrl = content.cloudsUrl?.trim() || DEFAULT_CLOUDS;
  const skylineUrl = content.skylineUrl?.trim() || DEFAULT_SKYLINE;
  const photoUrl = content.photoUrl?.trim() || DEFAULT_PHOTO;
  const photoAlt = content.photoAlt?.trim() || 'The Terrace at dusk';
  const bgColor = content.bgColor?.trim() || DEFAULT_BG;

  useWestlyProductRevealMotion(rootRef, isCanvas, isMobile);

  const renderCopyFields = () => (
    <>
      <p
        data-wp-ui=''
        data-element-key='eyebrow'
        className={selectableClass(activeKey === 'eyebrow')}
        style={composeStyle(
          {
            margin: 0,
            fontFamily: WESTLY_FONT_UI,
            fontSize: 'clamp(11px, 1.2cqi, 12px)',
            lineHeight: 1,
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: ACCENT,
          },
          styleOf('eyebrow')
        )}
      >
        {eyebrow}
      </p>
      <h2
        data-wp-ui=''
        data-element-key='title'
        className={selectableClass(activeKey === 'title')}
        style={composeStyle(
          {
            margin: 0,
            marginTop: 'clamp(10px, 1.4cqi, 20px)',
            fontSize: 'clamp(28px, 4.7cqi, 48px)',
            lineHeight: 1.15,
            fontWeight: 500,
            color: ACCENT,
          },
          styleOf('title')
        )}
      >
        {title}
      </h2>
      <p
        data-wp-ui=''
        data-element-key='description'
        className={selectableClass(activeKey === 'description')}
        style={composeStyle(
          {
            margin: 0,
            marginTop: 'clamp(16px, 2.2cqi, 32px)',
            fontFamily: WESTLY_FONT_UI,
            fontSize: 'clamp(14px, 1.6cqi, 16px)',
            lineHeight: 1.625,
            color: ACCENT,
          },
          styleOf('description')
        )}
      >
        {description}
      </p>
    </>
  );

  const renderImage = (
    key: 'foregroundUrl' | 'cloudsUrl' | 'skylineUrl' | 'photoUrl',
    src: string,
    alt: string,
    extra?: React.CSSProperties
  ) => (
    <img
      src={src}
      alt={alt}
      data-element-key={key}
      className={selectableClass(activeKey === key)}
      style={composeStyle(FILL_IMG_STYLE, extra, styleOf(key))}
    />
  );

  // ── Editor canvas: layout phẳng — copy + 4 lớp ảnh + màu nền ──
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-westly-scope=''
        data-canvas-edit='true'
        className={cn('@container relative w-full', className)}
        style={composeStyle(
          {
            fontFamily: WESTLY_FONT_DISPLAY,
            backgroundColor: bgColor,
            padding: '40px 24px',
          },
          blockBackgroundStyle(background)
        )}
      >
        <div
          style={{
            maxWidth: '28rem',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            border: `1px solid ${ACCENT}33`,
            boxShadow: '0 20px 50px -28px rgba(0,0,0,0.22)',
            padding: 'clamp(20px, 3cqi, 40px)',
          }}
        >
          {renderCopyFields()}
        </div>

        <div className='mt-8 grid grid-cols-1 gap-4 @2xl:grid-cols-4'>
          {(
            [
              [
                'foregroundUrl',
                foregroundUrl,
                foregroundAlt,
                'Nét vẽ (trên cùng)',
              ],
              ['cloudsUrl', cloudsUrl, '', 'Dải mây (trôi)'],
              ['skylineUrl', skylineUrl, '', 'Skyline (sau cùng)'],
              ['photoUrl', photoUrl, photoAlt, 'Ảnh hoàn thiện (reveal)'],
            ] as const
          ).map(([key, src, alt, caption]) => (
            <figure key={key} style={{ margin: 0 }}>
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '816 / 552',
                  overflow: 'hidden',
                  backgroundColor: '#fafafa',
                  border: '1px solid #e5e5e5',
                }}
              >
                {renderImage(key, src, alt, { objectFit: 'contain' })}
              </div>
              <figcaption
                style={{ marginTop: 6, fontSize: 12, color: '#737373' }}
              >
                {caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <div
          style={{
            marginTop: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 12, color: '#737373' }}>Màu nền:</span>
          <span
            data-element-key='bgColor'
            className={selectableClass(activeKey === 'bgColor')}
            style={composeStyle(
              {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 10px',
                border: '1px solid #e5e5e5',
                backgroundColor: '#ffffff',
                fontSize: 12,
                color: '#404040',
              },
              styleOf('bgColor')
            )}
          >
            <span
              aria-hidden
              style={{
                width: 16,
                height: 16,
                display: 'inline-block',
                backgroundColor: bgColor,
                border: '1px solid #d4d4d4',
              }}
            />
            {bgColor}
          </span>
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p: production ──
  return (
    <section
      ref={rootRef}
      data-westly-scope=''
      className={cn('@container relative w-full', className)}
      style={composeStyle(
        {
          fontFamily: WESTLY_FONT_DISPLAY,
          backgroundColor: bgColor,
          overflow: 'hidden',
          ...(isMobile
            ? { padding: '48px 0 64px' }
            : {
                height: '100dvh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }),
        },
        blockBackgroundStyle(background)
      )}
    >
      {pointer}
      <div
        style={{
          width: '100%',
          maxWidth: 1440,
          margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 40px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
        }}
      >
        {/* Stack 4 lớp — click bất kỳ đâu trên stack lật sang ảnh hoàn thiện */}
        <div
          data-wp='stack'
          role='button'
          tabIndex={0}
          {...westlyCursorToggle}
          aria-pressed='false'
          aria-label='Toggle the finished view'
          style={{
            position: 'relative',
            aspectRatio: '816 / 552',
            width: isMobile ? '100%' : '58%',
            maxWidth: isMobile ? 'min(100%, 34rem)' : undefined,
            margin: isMobile ? '0 auto' : undefined,
            flexShrink: 0,
            overflow: 'hidden',
            cursor: 'pointer',
          }}
        >
          <div
            data-wp='photo'
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              visibility: 'hidden',
              opacity: 0,
              willChange: 'transform',
            }}
          >
            {renderImage('photoUrl', photoUrl, photoAlt)}
          </div>

          {/* Bleed -3% > biên độ drift yPercent ±2 (mobile) — không hở mép */}
          <div
            data-wp='skyline'
            style={{
              position: 'absolute',
              inset: isMobile ? '-3%' : 0,
              willChange: 'transform',
            }}
          >
            {renderImage('skylineUrl', skylineUrl, '')}
          </div>

          {/* Dải mây — nổi trong khoảng trời, neo góc trên-phải */}
          <div
            data-wp='clouds'
            style={{
              position: 'absolute',
              top: isMobile ? '2.5%' : '3.7%',
              right: isMobile ? '2.5%' : '3.7%',
              aspectRatio: '738 / 171',
              width: isMobile ? '90%' : '88%',
              willChange: 'transform',
            }}
          >
            {renderImage('cloudsUrl', cloudsUrl, '', { objectFit: 'contain' })}
          </div>

          {/* Nét vẽ sân thượng — trời trong suốt, nằm trên cùng.
              Bleed -2% > biên độ mouse-parallax (±10px/±6px ≈ 1.2%/1.1%) —
              hover đẩy lớp lên/xuống không còn hở mép, lộ răng cưa skyline. */}
          <div
            data-wp='foreground'
            style={{
              position: 'absolute',
              inset: '-2%',
              willChange: 'transform',
            }}
          >
            {renderImage('foregroundUrl', foregroundUrl, foregroundAlt)}
          </div>
        </div>

        {/* Panel copy — đè lên stack ở desktop, trôi ngược khi scroll */}
        <article
          data-wp='copy'
          style={{
            position: 'relative',
            zIndex: 10,
            backgroundColor: '#ffffff',
            border: `1px solid ${ACCENT}33`,
            boxShadow: '0 20px 50px -28px rgba(0,0,0,0.22)',
            willChange: 'transform',
            padding: isMobile ? '28px 20px' : 'clamp(40px, 5.5cqi, 80px)',
            width: isMobile ? 'min(calc(100% - 8px), 26rem)' : '100%',
            maxWidth: isMobile ? undefined : '35rem',
            margin: isMobile ? '-20px auto 0' : 0,
            bottom: isMobile ? undefined : -96,
            left: isMobile ? undefined : -40,
            alignSelf: isMobile ? 'center' : 'auto',
          }}
        >
          {renderCopyFields()}
        </article>
      </div>
    </section>
  );
}

/**
 * Motion production — giữ timing apps; đổi hợp đồng host. Không sticky/veil:
 * mọi trigger bám chính root trong luồng bình thường.
 */
function useWestlyProductRevealMotion(
  rootRef: React.RefObject<HTMLElement | null>,
  isCanvas: boolean,
  isMobile: boolean
) {
  const { scroller, requestRefresh } = useLandingMotion();

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || isCanvas) return;

    const q = (name: string) =>
      root.querySelector<HTMLElement>(`[data-wp="${name}"]`);
    const stack = q('stack');
    const photo = q('photo');
    const foreground = q('foreground');
    const clouds = q('clouds');
    const skyline = q('skyline');
    const copy = q('copy');
    const ui = root.querySelectorAll<HTMLElement>('[data-wp-ui]');
    if (!stack || !photo || !foreground || !clouds || !skyline || !copy) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const removers: Array<() => void> = [];
    let revealed = false;

    const ctx = gsap.context(() => {
      gsap.set(photo, { autoAlpha: 0 });

      // Toggle — cả stack là nút.
      const onToggle = () => {
        revealed = !revealed;
        const duration = reduce ? 0 : 0.7;

        gsap.to(photo, {
          autoAlpha: revealed ? 1 : 0,
          duration,
          ease: 'power2.inOut',
        });
        gsap.to([foreground, clouds, skyline], {
          autoAlpha: revealed ? 0 : 1,
          scale: revealed ? 1.02 : 1,
          duration,
          ease: 'power2.inOut',
          stagger: 0.08,
        });
        stack.setAttribute('aria-pressed', String(revealed));
      };
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        onToggle();
      };
      stack.addEventListener('click', onToggle);
      stack.addEventListener('keydown', onKeyDown);
      removers.push(() => {
        stack.removeEventListener('click', onToggle);
        stack.removeEventListener('keydown', onKeyDown);
      });

      if (reduce) {
        gsap.set([stack, ...Array.from(ui)], { autoAlpha: 1, y: 0 });
        return;
      }

      // Entrance stack — một lần khi block vào 75% viewport.
      gsap.fromTo(
        stack,
        { autoAlpha: 0, y: 32 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 75%',
            once: true,
            invalidateOnRefresh: true,
          },
        }
      );

      // Entrance chữ — restart khi vào lại, reverse khi cuộn ngược ra.
      if (ui.length > 0) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top 75%',
              toggleActions: 'restart none restart reverse',
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            ui,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              stagger: 0.12,
              duration: 0.9,
              ease: 'power3.out',
              delay: 0.4,
            }
          );
      }

      // Drift — mây xuôi, skyline ngược (mobile), copy ngược cho depth.
      gsap.fromTo(
        clouds,
        { yPercent: isMobile ? -5 : -6 },
        {
          yPercent: isMobile ? 5 : 6,
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
      if (isMobile) {
        gsap.fromTo(
          skyline,
          { yPercent: 2 },
          {
            yPercent: -2,
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
      }
      gsap.fromTo(
        copy,
        { yPercent: isMobile ? 4 : 6 },
        {
          yPercent: isMobile ? -16 : -42,
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

      // Mouse parallax — fg (gần) ngược chiều mây (xa).
      const finePointer = window.matchMedia(
        '(hover: hover) and (pointer: fine)'
      ).matches;
      if (finePointer) {
        const follow = { duration: 0.8, ease: 'power3.out' } as const;
        const fgX = gsap.quickTo(foreground, 'x', follow);
        const fgY = gsap.quickTo(foreground, 'y', follow);
        const cloudsX = gsap.quickTo(clouds, 'x', follow);
        const cloudsY = gsap.quickTo(clouds, 'y', follow);

        const onMove = (e: MouseEvent) => {
          if (revealed) return;
          const r = stack.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
          const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
          fgX(-nx * 10);
          fgY(-ny * 6);
          cloudsX(nx * 18);
          cloudsY(ny * 10);
        };
        const onLeave = () => {
          if (revealed) return;
          gsap.to([foreground, clouds], {
            x: 0,
            y: 0,
            duration: 1,
            ease: 'power3.out',
          });
        };

        stack.addEventListener('mousemove', onMove, { passive: true });
        stack.addEventListener('mouseleave', onLeave);
        removers.push(() => {
          stack.removeEventListener('mousemove', onMove);
          stack.removeEventListener('mouseleave', onLeave);
        });
      }
    }, root);

    // R4 — refresh khi lớp foreground load xong.
    const fgImg = foreground.querySelector<HTMLImageElement>('img');
    if (fgImg && !fgImg.complete) {
      fgImg.addEventListener('load', requestRefresh, { once: true });
      removers.push(() => fgImg.removeEventListener('load', requestRefresh));
    }

    return () => {
      removers.forEach(r => r());
      ctx.revert();
    };
  }, [rootRef, scroller, requestRefresh, isCanvas, isMobile]);
}
