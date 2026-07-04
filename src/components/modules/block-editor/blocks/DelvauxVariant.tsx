'use client';

/**
 * Block "Product - Variant" (section `.product-variant` của delvaux-clone) —
 * bám sát cơ chế gốc, gồm HAI STAGE trong một section PIN (gốc: pin end 150%):
 *
 * STAGE 1 (progress < 0.5) — chọn biến thể:
 *  - Cột giữa hẹp (gốc: 1/3, max 440px): ảnh sản phẩm (aspect 474/486),
 *    "ghost title" serif mờ (100px, rgba(142,142,141,.4)) nhô trên đỉnh ảnh,
 *    dot màu dưới ảnh (crossfade ảnh), parallax (ảnh -20 / title +60).
 *  - Custom cursor "More information" bám chuột trên ảnh; bấm ảnh/nút mở
 *    POPUP chi tiết (accordion) trượt từ phải như `.content-discover`.
 *
 * STAGE 2 (progress > 0.5, class `delvaux-variant-done`) — "product-sku" gốc:
 *  - Media full-bleed (calc(100%-120px) × 660px) mở rộng bằng clip-path từ ô
 *    chữ nhật nhỏ giữa màn; tên sản phẩm serif TRẮNG khổng lồ (gốc 180px)
 *    reveal theo KÝ TỰ (clip-path inset bottom-up, 1.5s cubic-bezier);
 *    ảnh model hiện sau cùng (delay 1.3s, trượt xuống 80px).
 *  - Đồng thời dispatch `delvaux:variant-done` → sub-nav morph (links ẩn,
 *    nút Book hiện) đúng timeline gốc.
 *
 * Section gắn id='information'. Pin bằng CSS sticky (an toàn iOS).
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
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
  DelvauxVariantContent,
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
  content: DelvauxVariantContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

/* CSS chuyển stage (mirror style.css gốc `.product-variant.done ...`).
 * Structural — không phải design token editable. */
const VARIANT_CSS = `
.delvaux-variant .delvaux-variant-stage {
  opacity: 1;
  visibility: visible;
  transition: all 0.5s ease;
}
.delvaux-variant.delvaux-variant-done .delvaux-variant-stage {
  opacity: 0;
  visibility: hidden;
}
.delvaux-variant .delvaux-variant-sku {
  opacity: 0;
  visibility: hidden;
  transition: all 0.5s ease;
}
.delvaux-variant.delvaux-variant-done .delvaux-variant-sku {
  opacity: 1;
  visibility: visible;
}
.delvaux-variant .delvaux-variant-sku-media {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.5s ease 0s, clip-path 0.7s ease 0.2s;
  clip-path: polygon(44% 43%, 56% 43%, 56% 61%, 44% 61%);
}
.delvaux-variant.delvaux-variant-done .delvaux-variant-sku-media {
  opacity: 1;
  visibility: visible;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
.delvaux-variant .delvaux-variant-sku-char {
  display: inline-block;
  clip-path: inset(100% 0% 0% 0%);
  transition: clip-path 1.5s cubic-bezier(0.77, 0, 0.175, 1);
}
.delvaux-variant.delvaux-variant-done .delvaux-variant-sku-char {
  clip-path: inset(0% 0% 0% 0%);
}
.delvaux-variant .delvaux-variant-sku-person {
  opacity: 0;
  visibility: hidden;
  transform: translate(0, 140px);
}
.delvaux-variant.delvaux-variant-done .delvaux-variant-sku-person {
  opacity: 1;
  visibility: visible;
  transform: translate(0, 80px);
  transition: opacity 0.8s ease 1.3s, transform 0.7s ease 1.3s;
}
`;

export function DelvauxVariant({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const [active, setActive] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  const variants = content.variants ?? [];
  const faqs = content.faqs ?? [];
  const activeVariant = variants[active] ?? variants[0];
  const hasSku = Boolean(content.skuName || content.skuMediaUrl);

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      if (!root) return;
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      // Chuyển stage theo tiến trình pin (gốc: onUpdate p>0.5 → .done).
      if (hasSku) {
        gsap.timeline({
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: self => {
              const done = self.progress > 0.5;
              if (root.classList.contains('delvaux-variant-done') !== done) {
                root.classList.toggle('delvaux-variant-done', done);
                window.dispatchEvent(
                  new CustomEvent('delvaux:variant-done', { detail: { done } })
                );
              }
            },
          },
        });
      }

      if (reduce) return;

      // js-parallax gốc: ảnh y → -20, ghost title y → +60, scrub 1, power4.
      const media = root.querySelector<HTMLElement>('.delvaux-variant-media');
      if (media) {
        gsap.to(media, {
          y: -20,
          ease: 'power4',
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      }
      const ghost = root.querySelector<HTMLElement>('.delvaux-variant-ghost');
      if (ghost) {
        gsap.to(ghost, {
          y: 60,
          ease: 'power4',
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      }

      // R4: ảnh load xong → refresh trigger math.
      const img = root.querySelector<HTMLImageElement>('.delvaux-variant-img');
      if (img && !img.complete) {
        img.addEventListener('load', requestRefresh, { once: true });
      }
    },
    [variants.length, hasSku]
  );

  // Custom cursor "More information" bám chuột trên ảnh (customCursor gốc).
  const onImgMove = (e: React.MouseEvent) => {
    const badge = cursorRef.current;
    const host = rootRef.current;
    if (!badge || !host) return;
    const r = host.getBoundingClientRect();
    gsap.to(badge, {
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      opacity: 1,
      duration: 0.2,
      ease: 'power2.out',
    });
  };
  const onImgLeave = () => {
    const badge = cursorRef.current;
    if (badge) gsap.to(badge, { opacity: 0, duration: 0.3 });
  };

  // Popup slide-in + ESC + báo sub-nav ẩn.
  React.useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('delvaux:overlay', { detail: { open } })
    );
    if (!open) return;
    const panel = popupRef.current?.querySelector('.delvaux-variant-panel');
    let tween: gsap.core.Tween | null = null;
    if (panel) {
      tween = gsap.from(panel, {
        xPercent: 100,
        duration: 0.6,
        ease: 'power3.out',
      });
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      tween?.kill();
      window.dispatchEvent(
        new CustomEvent('delvaux:overlay', { detail: { open: false } })
      );
    };
  }, [open]);

  // Tên sku → từng ký tự (reveal clip-path như .char của Splitting gốc).
  const skuLines = (content.skuName || '').split('\n');

  return (
    <section
      ref={rootRef}
      id='information'
      style={composeStyle(
        { background: DELVAUX_BG },
        blockBackgroundStyle(background)
      )}
      className='delvaux-variant @container relative w-full'
    >
      <style>{DELVAUX_FONT_CSS}</style>
      <style>{VARIANT_CSS}</style>
      {/* pin 150% gốc → 250vh với lớp sticky (chỉ khi có stage sku) */}
      <div style={{ height: hasSku ? '250vh' : 'auto' }}>
        <div
          className={
            hasSku
              ? 'sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden'
              : 'relative flex w-full items-center justify-center overflow-hidden'
          }
        >
          {/* ── STAGE 1: chọn biến thể ── */}
          <div
            className='delvaux-variant-stage relative mx-auto flex flex-col items-center'
            style={{
              width: 'min(88cqw, 440px)',
              paddingTop: hasSku ? 0 : 'clamp(96px, 16cqi, 200px)',
              paddingBottom: hasSku ? 0 : 'clamp(80px, 13cqi, 160px)',
            }}
          >
            {/* GHOST TITLE — serif mờ, sau ảnh, nhô trên đỉnh ảnh */}
            <div
              className='delvaux-variant-ghost pointer-events-none absolute left-1/2 z-0 -translate-x-1/2'
              style={{
                top: 'clamp(-70px, -5cqi, -32px)',
                minWidth: 'max-content',
              }}
            >
              <h2
                data-element-key='title'
                style={composeStyle(
                  {
                    margin: 0,
                    fontFamily: DELVAUX_FONT_HEADING,
                    fontWeight: 400,
                    fontSize: 'clamp(44px, 7cqi, 100px)',
                    lineHeight: 1.08,
                    color: 'rgba(142,142,141,0.4)',
                    textAlign: 'center',
                    whiteSpace: 'pre-line',
                  },
                  styleOf('title')
                )}
                className={selectableClass(
                  activeKey === 'title',
                  'delvaux-variant-title'
                )}
              >
                {content.title}
              </h2>
            </div>

            {/* Ảnh sản phẩm — crossfade biến thể; hover: custom cursor */}
            <button
              type='button'
              aria-label={content.moreInfoLabel || 'More information'}
              onClick={() => setOpen(true)}
              onMouseMove={onImgMove}
              onMouseLeave={onImgLeave}
              className='delvaux-variant-media relative z-[2] block w-full'
              style={{
                aspectRatio: '474 / 486',
                marginTop: '40px',
                cursor: 'none',
              }}
            >
              {variants.map((variant, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`variant-img-${i}`}
                  className={
                    i === 0
                      ? 'delvaux-variant-img absolute inset-0'
                      : 'absolute inset-0'
                  }
                  src={variant.imageUrl}
                  alt={variant.label}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: i === active ? 1 : 0,
                    visibility: i === active ? 'visible' : 'hidden',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </button>

            {/* Dot màu (content-pagination gốc) */}
            <div
              data-element-key='variants'
              style={composeStyle(
                { marginTop: 'clamp(18px, 2.2cqi, 28px)' },
                styleOf('variants')
              )}
              className={selectableClass(
                activeKey === 'variants',
                'flex items-center justify-center gap-3'
              )}
            >
              {variants.map((variant, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={`${variant.ref}-${i}`}
                    type='button'
                    aria-label={variant.label}
                    aria-pressed={isActive}
                    onClick={() => setActive(i)}
                    className='inline-flex min-h-11 min-w-11 items-center justify-center'
                  >
                    <span
                      aria-hidden='true'
                      className='block rounded-full transition-all duration-300'
                      style={{
                        width: '14px',
                        height: '14px',
                        background: variant.color,
                        boxShadow: isActive
                          ? '0 0 0 1px #ffffff, 0 0 0 2px #764733'
                          : 'inset 0 0 0 1px rgba(0,0,0,0.15)',
                      }}
                    />
                  </button>
                );
              })}
            </div>

            <button
              type='button'
              data-element-key='moreInfoLabel'
              onClick={() => setOpen(true)}
              style={composeStyle(
                {
                  marginTop: 'clamp(14px, 1.8cqi, 20px)',
                  fontFamily: DELVAUX_FONT_BODY,
                  fontSize: '12px',
                  lineHeight: '24px',
                  color: '#111111',
                  borderBottom: '1px solid #111111',
                  paddingBottom: '2px',
                  cursor: 'pointer',
                },
                styleOf('moreInfoLabel')
              )}
              className={selectableClass(
                activeKey === 'moreInfoLabel',
                '@2xl:hidden'
              )}
            >
              {content.moreInfoLabel}
            </button>
          </div>

          {/* ── STAGE 2: product-sku (gốc .product-sku) ── */}
          {hasSku ? (
            <div className='delvaux-variant-sku absolute inset-0 flex items-center justify-center'>
              <div
                className='relative'
                style={{
                  // gốc: width calc(100vw - 120px), height 660px
                  width: 'calc(100% - clamp(48px, 8.3cqi, 120px))',
                  height: 'min(660px, 81svh)',
                }}
              >
                {/* media full-bleed mở rộng bằng clip-path */}
                <div className='delvaux-variant-sku-media absolute inset-0'>
                  {content.skuMediaType === 'video' ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      src={content.skuMediaUrl}
                      className='h-full w-full'
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={content.skuMediaUrl}
                      alt={content.skuName}
                      className='h-full w-full'
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </div>

                {/* tên sản phẩm — serif trắng khổng lồ, reveal theo ký tự */}
                <h2
                  data-element-key='skuName'
                  className={selectableClass(
                    activeKey === 'skuName',
                    'absolute top-1/2 left-1/2 z-[1] -translate-x-1/2 -translate-y-1/2'
                  )}
                  style={composeStyle(
                    {
                      margin: 0,
                      width: 'max-content',
                      maxWidth: '92%',
                      fontFamily: DELVAUX_FONT_HEADING,
                      fontWeight: 400,
                      // gốc: 180px / line-height 150px
                      fontSize: 'clamp(56px, 12.5cqi, 180px)',
                      lineHeight: 0.84,
                      color: '#ffffff',
                      textAlign: 'center',
                    },
                    styleOf('skuName')
                  )}
                >
                  {skuLines.map((line, li) => (
                    <span key={`line-${li}`} className='block'>
                      {Array.from(line).map((ch, ci) => (
                        <span
                          key={`c-${li}-${ci}`}
                          className='delvaux-variant-sku-char'
                        >
                          {ch === ' ' ? '\u00A0' : ch}
                        </span>
                      ))}
                    </span>
                  ))}
                </h2>

                {/* ảnh model hiện sau cùng (gốc person3.png, delay 1.3s) */}
                {content.skuPersonUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={content.skuPersonUrl}
                    alt=''
                    aria-hidden='true'
                    className='delvaux-variant-sku-person absolute bottom-0 left-1/2 z-[2] -translate-x-1/2'
                    style={{ height: 'min(600px, 74svh)', width: 'auto' }}
                  />
                ) : null}
              </div>
            </div>
          ) : null}

          {/* custom cursor "More information" (gốc .cursor) */}
          <div
            ref={cursorRef}
            aria-hidden='true'
            className='pointer-events-none absolute top-0 left-0 z-[5] flex items-center justify-center rounded-full'
            style={{
              width: '64px',
              height: '64px',
              marginLeft: '-32px',
              marginTop: '-32px',
              background: '#ffffff',
              opacity: 0,
              fontFamily: DELVAUX_FONT_BODY,
              fontSize: '8px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#111111',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }}
          >
            {content.moreInfoLabel || 'More information'}
          </div>
        </div>
      </div>

      {/* POPUP chi tiết (content-discover gốc) */}
      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={popupRef}
              className='fixed inset-0 z-[1999] flex justify-end'
              role='dialog'
              aria-modal='true'
            >
              <button
                type='button'
                aria-label='Đóng'
                onClick={() => setOpen(false)}
                className='absolute inset-0 h-full w-full'
                style={{ background: 'rgba(0,0,0,0.4)', cursor: 'pointer' }}
              />
              <div
                className='delvaux-variant-panel relative flex h-full flex-col overflow-y-auto'
                style={{
                  width: 'min(520px, 94vw)',
                  background: '#ffffff',
                  padding:
                    'clamp(56px, 8vh, 88px) clamp(24px, 4vw, 48px) clamp(24px, 4vh, 40px)',
                }}
              >
                <button
                  type='button'
                  aria-label='Đóng'
                  onClick={() => setOpen(false)}
                  className='absolute flex items-center justify-center rounded-full'
                  style={{
                    top: '20px',
                    right: '20px',
                    width: '40px',
                    height: '40px',
                    border: '1px solid #e8e8e8',
                    background: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <svg width='12' height='13' viewBox='0 0 12 13' fill='none'>
                    <line
                      x1='0.48'
                      y1='11.48'
                      x2='11.09'
                      y2='0.88'
                      stroke='black'
                      strokeWidth='0.75'
                    />
                    <line
                      x1='1.02'
                      y1='0.98'
                      x2='11.62'
                      y2='11.59'
                      stroke='black'
                      strokeWidth='0.75'
                    />
                  </svg>
                </button>

                <h3
                  style={{
                    margin: 0,
                    fontFamily: DELVAUX_FONT_HEADING,
                    fontWeight: 400,
                    fontSize: 'clamp(26px, 3vw, 34px)',
                    lineHeight: 1.2,
                    color: '#000000',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {content.title}
                </h3>
                {activeVariant ? (
                  <p
                    style={{
                      marginTop: '8px',
                      marginBottom: 0,
                      fontFamily: DELVAUX_FONT_BODY,
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'rgba(17,17,17,0.55)',
                    }}
                  >
                    REF. {activeVariant.ref}
                  </p>
                ) : null}

                <div className='mt-5 flex items-center gap-3'>
                  {variants.map((variant, i) => (
                    <button
                      key={`popup-dot-${i}`}
                      type='button'
                      aria-label={variant.label}
                      aria-pressed={i === active}
                      onClick={() => setActive(i)}
                      className='inline-flex min-h-11 min-w-11 items-center justify-center'
                    >
                      <span
                        aria-hidden='true'
                        className='block rounded-full transition-all duration-300'
                        style={{
                          width: '16px',
                          height: '16px',
                          background: variant.color,
                          boxShadow:
                            i === active
                              ? '0 0 0 1px #ffffff, 0 0 0 2px #764733'
                              : 'inset 0 0 0 1px rgba(0,0,0,0.15)',
                        }}
                      />
                    </button>
                  ))}
                </div>

                <div
                  data-element-key='faqs'
                  style={composeStyle({ marginTop: '28px' }, styleOf('faqs'))}
                  className={selectableClass(activeKey === 'faqs', 'w-full')}
                >
                  {faqs.map((faq, i) => {
                    const isOpen = openFaq === i;
                    return (
                      <div
                        key={`faq-${i}`}
                        style={{ borderTop: '1px solid rgba(0,0,0,0.12)' }}
                      >
                        <button
                          type='button'
                          aria-expanded={isOpen}
                          onClick={() => setOpenFaq(isOpen ? null : i)}
                          className='flex min-h-11 w-full items-center justify-between gap-4 text-left'
                          style={{
                            padding: '16px 0',
                            fontFamily: DELVAUX_FONT_BODY,
                            fontSize: '14px',
                            lineHeight: 1.35,
                            color: '#111111',
                            cursor: 'pointer',
                          }}
                        >
                          <span>{faq.question}</span>
                          <span
                            aria-hidden='true'
                            className='shrink-0 transition-transform duration-300'
                            style={{
                              transform: isOpen
                                ? 'rotate(45deg)'
                                : 'rotate(0deg)',
                              fontSize: '18px',
                              lineHeight: 1,
                            }}
                          >
                            +
                          </span>
                        </button>
                        {isOpen ? (
                          <p
                            style={{
                              margin: 0,
                              paddingBottom: '16px',
                              fontFamily: DELVAUX_FONT_BODY,
                              fontSize: '13px',
                              lineHeight: 1.6,
                              color: '#555555',
                              whiteSpace: 'pre-line',
                            }}
                          >
                            {faq.answer}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
