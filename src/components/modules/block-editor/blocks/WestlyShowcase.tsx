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
  WestlyShowcaseContent,
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

interface WestlyShowcaseProps {
  content: WestlyShowcaseContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * The Westly · Showcase — port từ apps/the-westly ProductShowcase.tsx.
 *
 * Card 3 lớp ảnh (sketch + overlay drift + photo ẩn) với toggle "SEE FULL
 * PICTURE" ↔ "BACK TO SKETCH"; panel copy trôi ngược overlay khi scroll; exit
 * là veil (mặc định trắng) phủ dần để tan vào section sau.
 *
 * Khác apps:
 * - Pin bằng dwell spacer + veil bám #scene (page-level) → block TỰ chứa track:
 *   desktop root 235dvh = stage sticky 100dvh + dwell 100dvh (copy trôi) +
 *   35dvh veil (marker absolute đáy root, đúng quãng 'top bottom'→'top 65%'
 *   của bản gốc). Mobile: flow tự nhiên, không veil (apps mobile cũng không pin).
 * - Bỏ bg fade-in theo scroll: trò đó đền bù cho hero sticky nằm DƯỚI section
 *   (page-level); block đứng một mình thì nền đặc từ đầu — đặt `bgColor` trùng
 *   `veilColor` của block trước là liền mạch.
 * - Toggle reveal: gsap tween on-click → React state + CSS transition trên
 *   <img> (transform/opacity của WRAPPER thuộc về gsap drift, chung node là
 *   giành nhau thuộc tính).
 * - Con trỏ tùy biến: `westlyCursorToggle` trên stack + `useWestlyPointer`
 *   (xem WestlyPointer.tsx — app mount ở page-level, host mount theo block).
 */

const DEFAULT_SKETCH = '/the-westly/s2-p1.png';
const DEFAULT_OVERLAY = '/the-westly/s2-p2.png';
const DEFAULT_PHOTO = '/the-westly/s2-p3.png';
const DEFAULT_BG = '#F3F1EA';
const DEFAULT_VEIL = '#ffffff';

const ACCENT = '#6E7A6F';
const REVEAL_MS = 700;

const FILL_IMG_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

export function WestlyShowcase({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: WestlyShowcaseProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const isCanvas = useIsCanvasEdit(rootRef);
  const pointer = useWestlyPointer(isCanvas);
  const [revealed, setRevealed] = React.useState(false);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const eyebrow = content.eyebrow?.trim() || 'OVERVIEW';
  const title = content.title?.trim() || 'Penthouse B';
  const description =
    content.description?.trim() ||
    'Perched atop The Westly, Penthouse B is a sky home above the Upper West Side.';
  const sketchUrl = content.sketchUrl?.trim() || DEFAULT_SKETCH;
  const sketchAlt = content.sketchAlt?.trim() || 'Interior sketch';
  const overlayUrl = content.overlayUrl?.trim() || DEFAULT_OVERLAY;
  const photoUrl = content.photoUrl?.trim() || DEFAULT_PHOTO;
  const photoAlt = content.photoAlt?.trim() || 'Living room photo';
  const revealShowLabel =
    content.revealShowLabel?.trim() || 'SEE FULL\nPICTURE';
  const revealHideLabel = content.revealHideLabel?.trim() || 'BACK TO\nSKETCH';
  const bgColor = content.bgColor?.trim() || DEFAULT_BG;
  const veilColor = content.veilColor?.trim() || DEFAULT_VEIL;

  useWestlyShowcaseMotion(rootRef, isCanvas, isMobile);

  /** Reveal qua CSS transition trên <img> — wrapper để dành cho gsap drift. */
  const imgReveal = (visibleWhenRevealed: boolean): React.CSSProperties => ({
    opacity: revealed === visibleWhenRevealed ? 1 : 0,
    transform: !visibleWhenRevealed && revealed ? 'scale(1.02)' : 'scale(1)',
    transition: `opacity ${REVEAL_MS}ms ease-in-out, transform ${REVEAL_MS}ms ease-in-out`,
  });

  const renderImage = (
    key: 'sketchUrl' | 'overlayUrl' | 'photoUrl',
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

  const renderCopyFields = () => (
    <>
      <p
        data-ws-ui=''
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
        data-ws-ui=''
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
        data-ws-ui=''
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

  const badgeLabelStyle = (key: 'revealShowLabel' | 'revealHideLabel') =>
    composeStyle(
      {
        fontSize: 'clamp(9px, 1.2cqi, 12px)',
        lineHeight: 1,
        fontWeight: 600,
        letterSpacing: '0.18em',
        textTransform: 'uppercase' as const,
        whiteSpace: 'pre-line' as const,
        color: '#ffffff',
      },
      styleOf(key)
    );

  // ── Editor canvas: layout phẳng — copy + 3 lớp ảnh + 2 nhãn badge + màu,
  //    không sticky track, không toggle (click là để CHỌN element). ──
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
            textAlign: 'left',
            backgroundColor: '#ffffff',
            border: `1px solid ${ACCENT}33`,
            boxShadow: '0 20px 50px -28px rgba(0,0,0,0.22)',
            padding: 'clamp(20px, 3cqi, 40px)',
          }}
        >
          {renderCopyFields()}
        </div>

        <div className='mt-8 grid grid-cols-1 gap-4 @2xl:grid-cols-3'>
          {(
            [
              ['sketchUrl', sketchUrl, sketchAlt, 'Bản vẽ (sketch)'],
              ['overlayUrl', overlayUrl, '', 'Lớp overlay (trôi)'],
              ['photoUrl', photoUrl, photoAlt, 'Ảnh thật (reveal)'],
            ] as const
          ).map(([key, src, alt, caption]) => (
            <figure key={key} style={{ margin: 0 }}>
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '816 / 536',
                  overflow: 'hidden',
                  backgroundColor: '#fafafa',
                  border: '1px solid #e5e5e5',
                }}
              >
                {renderImage(key, src, alt)}
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
          className='mt-6 flex flex-wrap items-center justify-center gap-3'
          style={{ textAlign: 'center' }}
        >
          {(
            [
              ['revealShowLabel', revealShowLabel, 'Nhãn khi đang xem sketch'],
              ['revealHideLabel', revealHideLabel, 'Nhãn khi đang xem ảnh'],
            ] as const
          ).map(([key, label, caption]) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <span
                data-element-key={key}
                className={selectableClass(activeKey === key)}
                style={composeStyle(
                  {
                    display: 'inline-block',
                    padding: '10px 14px',
                    backgroundColor: ACCENT,
                    textAlign: 'center',
                  },
                  badgeLabelStyle(key)
                )}
              >
                {label}
              </span>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#737373' }}>
                {caption}
              </p>
            </div>
          ))}

          {(
            [
              ['bgColor', bgColor, 'Màu nền'],
              ['veilColor', veilColor, 'Màu veil bàn giao'],
            ] as const
          ).map(([key, value, caption]) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <span
                data-element-key={key}
                className={selectableClass(activeKey === key)}
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
                  styleOf(key)
                )}
              >
                <span
                  aria-hidden
                  style={{
                    width: 16,
                    height: 16,
                    display: 'inline-block',
                    backgroundColor: value,
                    border: '1px solid #d4d4d4',
                  }}
                />
                {value}
              </span>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#737373' }}>
                {caption}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p: production — sticky track + drift + veil ──
  return (
    <section
      ref={rootRef}
      data-westly-scope=''
      className={cn('@container relative w-full', className)}
      style={composeStyle(
        {
          fontFamily: WESTLY_FONT_DISPLAY,
          height: isMobile ? 'auto' : '235dvh',
          backgroundColor: bgColor,
        },
        blockBackgroundStyle(background)
      )}
    >
      {pointer}
      <div
        data-ws='stage'
        style={
          isMobile
            ? {
                position: 'relative',
                padding: '48px 0 64px',
                overflow: 'hidden',
              }
            : {
                position: 'sticky',
                top: 0,
                height: '100dvh',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }
        }
      >
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
          {/* Card 3 lớp — click toggle sketch ↔ photo (badge góc chỉ là mồi). */}
          <button
            type='button'
            data-ws='stack'
            {...westlyCursorToggle}
            aria-pressed={revealed}
            aria-label='Toggle the full picture'
            onClick={() => setRevealed(v => !v)}
            style={{
              position: 'relative',
              aspectRatio: '816 / 536',
              width: isMobile ? '100%' : '58%',
              maxWidth: isMobile ? 'min(100%, 34rem)' : undefined,
              margin: isMobile ? '0 auto' : undefined,
              flexShrink: 0,
              overflow: 'hidden',
              cursor: 'pointer',
              textAlign: 'left',
              border: 'none',
              padding: 0,
              background: 'transparent',
            }}
          >
            <div aria-hidden style={{ position: 'absolute', inset: 0 }}>
              {renderImage('photoUrl', photoUrl, photoAlt, imgReveal(true))}
            </div>

            {/* Wrapper nhận gsap drift/mouse-follow; <img> nhận reveal CSS. */}
            <div
              aria-hidden
              data-ws='overlay'
              style={{
                position: 'absolute',
                inset: 0,
                willChange: 'transform',
              }}
            >
              {renderImage('overlayUrl', overlayUrl, '', imgReveal(false))}
            </div>

            <div
              data-ws='sketch'
              style={{
                position: 'absolute',
                inset: 0,
                willChange: 'transform',
              }}
            >
              {renderImage('sketchUrl', sketchUrl, sketchAlt, imgReveal(false))}
            </div>

            {/* Badge góc — tam giác xoay 45° */}
            <span
              aria-hidden
              style={{
                pointerEvents: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 10,
                width: 'clamp(80px, 11.7cqi, 120px)',
                height: 'clamp(80px, 11.7cqi, 120px)',
                overflow: 'hidden',
                display: 'block',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '-60%',
                  left: '-60%',
                  width: '120%',
                  height: '120%',
                  transform: 'rotate(45deg)',
                  backgroundColor: ACCENT,
                  display: 'block',
                }}
              />
              <span
                style={composeStyle(
                  {
                    position: 'absolute',
                    top: '32%',
                    left: '32%',
                    width: '84%',
                    transform: 'translate(-50%, -50%) rotate(-45deg)',
                    textAlign: 'center',
                    display: 'block',
                  },
                  badgeLabelStyle(
                    revealed ? 'revealHideLabel' : 'revealShowLabel'
                  )
                )}
              >
                {revealed ? revealHideLabel : revealShowLabel}
              </span>
            </span>
          </button>

          {/* Panel copy — đè lên card ở desktop, trôi ngược overlay khi scroll */}
          <article
            data-ws='copy'
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

        {/* Veil bàn giao — chỉ desktop (mobile flow tự nhiên như apps) */}
        {!isMobile && (
          <div
            data-ws='veil'
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 20,
              backgroundColor: veilColor,
              opacity: 0,
              pointerEvents: 'none',
              willChange: 'opacity',
            }}
          />
        )}
      </div>

      {/* Mốc đo cho veil: 35dvh cuối track = 'top bottom'→'top 65%' của bản gốc */}
      {!isMobile && (
        <div
          data-ws='veil-marker'
          aria-hidden
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '35dvh',
            pointerEvents: 'none',
          }}
        />
      )}
    </section>
  );
}

/**
 * Motion production — giữ timing apps, đổi hợp đồng host (scroller + container
 * + cleanup). Toàn bộ scrub bám track của chính root (xem doc đầu file).
 */
function useWestlyShowcaseMotion(
  rootRef: React.RefObject<HTMLElement | null>,
  isCanvas: boolean,
  isMobile: boolean
) {
  const { scroller, requestRefresh } = useLandingMotion();

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || isCanvas) return;

    const q = (name: string) =>
      root.querySelector<HTMLElement>(`[data-ws="${name}"]`);
    const stack = q('stack');
    const overlay = q('overlay');
    const sketch = q('sketch');
    const copy = q('copy');
    const veil = q('veil');
    const veilMarker = q('veil-marker');
    const ui = root.querySelectorAll<HTMLElement>('[data-ws-ui]');
    if (!stack || !overlay || !sketch || !copy) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const removers: Array<() => void> = [];

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set([stack, ...ui], { autoAlpha: 1, y: 0 });
        return;
      }

      // Entrance card — một lần, khi block vào 75% viewport.
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

      // Entrance chữ — restart mỗi lần vào lại, reverse khi cuộn ngược ra
      // (thay cặp playUi/resetUi + ScrollTrigger.create của apps).
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

      // Drift các lớp — overlay đi xuôi, copy đi ngược (depth khi scroll).
      // Desktop (pin): overlay chạy suốt approach + dwell (2 viewport); copy
      // chỉ trôi trong dwell — phần thưởng cho việc cuộn khi màn đứng yên.
      if (isMobile) {
        gsap.fromTo(
          overlay,
          { yPercent: -10 },
          {
            yPercent: 10,
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
        gsap.fromTo(
          sketch,
          { yPercent: 2.5 },
          {
            yPercent: -2.5,
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
        gsap.fromTo(
          copy,
          { yPercent: 4 },
          {
            yPercent: -16,
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
      } else {
        gsap.fromTo(
          overlay,
          { yPercent: -14 },
          {
            yPercent: 14,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top bottom',
              end: '+=200%',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
        gsap.fromTo(
          copy,
          { yPercent: 6 },
          {
            // -26 (không phải -42 như bản không pin của apps): panel không còn
            // được che bởi pha section trôi ra, đi xa quá ăn cụt mép trên.
            yPercent: -26,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top top',
              end: '+=100%',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      // Veil bàn giao (desktop) — kín TRƯỚC khi track hết để card biến mất
      // trước khi nội dung block sau nổi lên (apps: 'top bottom'→'top 65%').
      if (!isMobile && veil && veilMarker) {
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: veilMarker,
              scroller,
              start: 'top bottom',
              end: 'bottom bottom',
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            veil,
            { opacity: 0 },
            { opacity: 1, duration: 0.85, immediateRender: false },
            0
          )
          // Veil che luôn card → card phải tắt hẳn kẻo vẫn bấm được.
          .fromTo(
            stack,
            { autoAlpha: 1 },
            { autoAlpha: 0, duration: 0.15, immediateRender: false },
            0.85
          )
          // Neo độ dài timeline = 1 — thiếu là veil bị kéo giãn cả quãng scrub.
          .to({}, { duration: 1 }, 0);
      }

      // Mouse follow overlay — chỉ máy có chuột thật.
      const finePointer = window.matchMedia(
        '(hover: hover) and (pointer: fine)'
      ).matches;
      if (finePointer && !isMobile) {
        const follow = { duration: 0.8, ease: 'power3.out' } as const;
        const overlayX = gsap.quickTo(overlay, 'x', follow);
        const overlayY = gsap.quickTo(overlay, 'y', follow);

        const onMove = (e: MouseEvent) => {
          const r = stack.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
          const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
          overlayX(nx * 14);
          overlayY(ny * 8);
        };
        const onLeave = () => {
          gsap.to(overlay, { x: 0, y: 0, duration: 1, ease: 'power3.out' });
        };

        stack.addEventListener('mousemove', onMove, { passive: true });
        stack.addEventListener('mouseleave', onLeave);
        removers.push(() => {
          stack.removeEventListener('mousemove', onMove);
          stack.removeEventListener('mouseleave', onLeave);
        });
      }
    }, root);

    // R4 — refresh khi ảnh sketch (lớp trên cùng, quyết định layout) load xong.
    const sketchImg = sketch.querySelector<HTMLImageElement>('img');
    if (sketchImg && !sketchImg.complete) {
      sketchImg.addEventListener('load', requestRefresh, { once: true });
      removers.push(() =>
        sketchImg.removeEventListener('load', requestRefresh)
      );
    }

    return () => {
      removers.forEach(r => r());
      ctx.revert();
    };
  }, [rootRef, scroller, requestRefresh, isCanvas, isMobile]);
}
