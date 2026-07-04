'use client';

/**
 * Block "Product - Hotspots" (section `.product-detail` của delvaux-clone) —
 * bám sát cơ chế + thị giác gốc:
 *
 *  - Section 100vh, ảnh sản phẩm căn giữa (gốc cao 730px), quầng sáng màu
 *    (#a77c63, blur 90px, opacity .4) phía sau.
 *  - Entrance `animate-zoomin`: ảnh scale 2 / y -150 (origin top center)
 *    scrub về 1 (start 'top 103%', end '+=100%', scrub 0.5). HOTSPOT chỉ hiện
 *    khi zoom xong (gốc: `.done .button-circle {opacity 1}`).
 *  - Hotspot gốc: vòng tròn rỗng 20px viền trắng 2px + vòng pulse
 *    (keyframes `scalebutton` 4s) — KHÔNG phải đĩa trắng; hover hiện nhãn
 *    uppercase nhỏ; đang mở → icon đóng (X) + nhãn "CLOSE".
 *  - Bấm hotspot → panel trắng trượt vào từ phải (width 0 → 600px, 1s) chứa
 *    tiêu đề serif 36px + mô tả 14px + media (video autoplay); ảnh sản phẩm
 *    dồn trái và phóng to (gốc scale 2.5, ở đây 2.2 + translate nhẹ).
 *  - Mở/đóng panel dispatch `delvaux:overlay` để sub-nav ẩn (`.hide` gốc).
 *
 * Section gắn id='discover' để sub-nav anchor tới.
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
  DelvauxProductContent,
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
  content: DelvauxProductContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

/* CSS trạng thái/keyframes (structural, không phải design token editable):
 * vòng pulse hotspot như `scalebutton` gốc + ẩn hotspot tới khi zoom done. */
const PRODUCT_CSS = `
@keyframes delvaux-scalebutton {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.9); opacity: 0; }
  51% { transform: scale(1); opacity: 0; }
  70% { opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.delvaux-product .delvaux-product-spot {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease;
}
.delvaux-product.delvaux-product-done .delvaux-product-spot {
  opacity: 1;
  visibility: visible;
}
.delvaux-product .delvaux-product-spot-pulse {
  animation: delvaux-scalebutton 4s infinite;
}
`;

export function DelvauxProduct({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const hotspots = content.hotspots ?? [];
  const isOpen = openIdx !== null;
  const glow = content.glowColor || '#a77c63';

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        root.classList.add('delvaux-product-done'); // vẫn hiện hotspot
        return;
      }

      // animate-zoomin gốc: scale 2, origin top center, y -150 → scrub về 1;
      // xong (p≥0.98) → thêm class done để hotspot hiện ra.
      const zoom = root.querySelector<HTMLElement>('.delvaux-product-zoom');
      if (zoom) {
        gsap.fromTo(
          zoom,
          { scale: 2, transformOrigin: 'top center', y: -150 },
          {
            scale: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top 103%',
              end: '+=100%',
              scrub: 0.5,
              invalidateOnRefresh: true,
              onUpdate: self => {
                root.classList.toggle(
                  'delvaux-product-done',
                  self.progress >= 0.98
                );
              },
            },
          }
        );
      } else {
        root.classList.add('delvaux-product-done');
      }

      // R4: refresh sau khi ảnh sản phẩm load.
      const img = root.querySelector<HTMLImageElement>('.delvaux-product-img');
      if (img && !img.complete) {
        img.addEventListener('load', requestRefresh, { once: true });
      }
    },
    []
  );

  // Mở panel → play video tab + báo sub-nav ẩn (gốc: sticky-menu.hide).
  const panelRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('delvaux:overlay', { detail: { open: openIdx !== null } })
    );
    if (openIdx === null) return;
    const vid = panelRef.current?.querySelector<HTMLVideoElement>(
      `[data-tab='${openIdx}'] video`
    );
    vid?.play().catch(() => {});
    return () => {
      window.dispatchEvent(
        new CustomEvent('delvaux:overlay', { detail: { open: false } })
      );
    };
  }, [openIdx]);

  return (
    <section
      ref={rootRef}
      id='discover'
      style={composeStyle(
        { background: DELVAUX_BG },
        blockBackgroundStyle(background)
      )}
      className='delvaux-product @container relative w-full overflow-hidden'
    >
      <style>{DELVAUX_FONT_CSS}</style>
      <style>{PRODUCT_CSS}</style>
      <div className='flex w-full' style={{ minHeight: 'min(100svh, 900px)' }}>
        {/* Ảnh sản phẩm + hotspots — căn giữa khi đóng, dồn trái khi mở */}
        <div
          className='flex flex-1 items-center justify-center'
          style={{ transition: 'all 0.7s ease' }}
        >
          <div
            className='delvaux-product-zoom relative'
            style={{ height: 'min(73svh, 730px)' }}
          >
            {/* Quầng sáng màu phía sau (gốc: ::before 400px blur 90px) */}
            <div
              aria-hidden='true'
              className='absolute rounded-full'
              style={{
                bottom: '10%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'clamp(220px, 31cqi, 400px)',
                height: 'clamp(220px, 31cqi, 400px)',
                background: glow,
                filter: 'blur(90px)',
                opacity: 0.4,
                zIndex: 0,
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-element-key='imageUrl'
              src={content.imageUrl}
              alt='Product'
              className={selectableClass(
                activeKey === 'imageUrl',
                'delvaux-product-img relative block'
              )}
              style={composeStyle(
                {
                  height: '100%',
                  width: 'auto',
                  objectFit: 'contain',
                  transition: 'transform 0.7s ease',
                  transitionDelay: isOpen ? '0.4s' : '0s',
                  transform: isOpen
                    ? 'scale(2.2) translate(30px, 60px)'
                    : 'scale(1)',
                  zIndex: 1,
                },
                styleOf('imageUrl')
              )}
            />

            {/* Hotspots — vòng tròn rỗng + pulse như gốc, vị trí % theo khung ảnh */}
            {hotspots.map((spot, i) => {
              const opened = openIdx === i;
              if (isOpen && !opened) return null; // gốc: siblings d-none
              return (
                <button
                  key={`spot-${i}`}
                  type='button'
                  aria-expanded={opened}
                  aria-label={spot.title}
                  onClick={() => setOpenIdx(opened ? null : i)}
                  className='delvaux-product-spot group absolute z-[2] flex min-h-10 min-w-10 items-center justify-center'
                  style={{
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '40px',
                    height: '40px',
                  }}
                >
                  {opened ? (
                    // đang mở → icon X trắng (gốc: product-detail-close.svg)
                    <span
                      aria-hidden='true'
                      className='relative block'
                      style={{ width: '30px', height: '30px' }}
                    >
                      <svg
                        width='30'
                        height='30'
                        viewBox='0 0 12 13'
                        fill='none'
                      >
                        <line
                          x1='0.48'
                          y1='11.48'
                          x2='11.09'
                          y2='0.88'
                          stroke='white'
                          strokeWidth='0.9'
                        />
                        <line
                          x1='1.02'
                          y1='0.98'
                          x2='11.62'
                          y2='11.59'
                          stroke='white'
                          strokeWidth='0.9'
                        />
                      </svg>
                    </span>
                  ) : (
                    <>
                      {/* vòng tĩnh 20px viền trắng 2px */}
                      <span
                        aria-hidden='true'
                        className='absolute rounded-full'
                        style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid #ffffff',
                          boxShadow: '0 0 6px rgba(0,0,0,0.18)',
                        }}
                      />
                      {/* vòng pulse (scalebutton 4s) */}
                      <span
                        aria-hidden='true'
                        className='delvaux-product-spot-pulse absolute rounded-full'
                        style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid #ffffff',
                        }}
                      />
                    </>
                  )}
                  {/* nhãn uppercase nhỏ hiện khi hover (gốc: .text 8px trắng) */}
                  <span
                    className='pointer-events-none absolute left-full ml-2 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100'
                    style={{
                      fontFamily: DELVAUX_FONT_BODY,
                      fontSize: '9px',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      color: '#ffffff',
                      textShadow: '0 0 4px rgba(0,0,0,0.7)',
                    }}
                  >
                    {opened ? 'CLOSE' : spot.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel chi tiết — trượt vào từ phải (gốc: width 0 → 600px, 1s) */}
        <div
          ref={panelRef}
          className='relative overflow-hidden'
          style={{
            width: isOpen ? 'min(600px, 82cqw)' : '0px',
            transition: 'width 1s ease',
          }}
        >
          {hotspots.map((spot, i) => {
            const opened = openIdx === i;
            return (
              <div
                key={`tab-${i}`}
                data-tab={i}
                className='absolute top-0 right-0 flex h-full w-full flex-col justify-end'
                style={{
                  background: '#ffffff',
                  padding: 'clamp(24px, 5cqi, 64px)',
                  transform: opened ? 'translateX(0)' : 'translateX(100%)',
                  transition: 'transform 1s ease 0.2s',
                  zIndex: opened ? 2 : 1,
                  minWidth: 'min(600px, 82cqw)',
                }}
              >
                <h3
                  data-element-key={`hotspot-${i}-title`}
                  style={composeStyle(
                    {
                      margin: 0,
                      fontFamily: DELVAUX_FONT_HEADING,
                      fontWeight: 400,
                      fontSize: 'clamp(24px, 2.9cqi, 36px)',
                      lineHeight: 1.2,
                      color: '#000000',
                    },
                    styleOf(`hotspot-${i}-title`)
                  )}
                  className={selectableClass(
                    activeKey === `hotspot-${i}-title`
                  )}
                >
                  {spot.title}
                </h3>
                <p
                  data-element-key={`hotspot-${i}-desc`}
                  style={composeStyle(
                    {
                      marginTop: 'clamp(16px, 2cqi, 24px)',
                      marginBottom: 0,
                      fontFamily: DELVAUX_FONT_BODY,
                      fontSize: '14px',
                      lineHeight: '22px',
                      color: '#111111',
                    },
                    styleOf(`hotspot-${i}-desc`)
                  )}
                  className={selectableClass(activeKey === `hotspot-${i}-desc`)}
                >
                  {spot.desc}
                </p>

                <div
                  className='w-full'
                  style={{
                    marginTop: 'clamp(24px, 3.2cqi, 40px)',
                    aspectRatio: '465 / 348',
                  }}
                >
                  {spot.mediaType === 'video' ? (
                    <video
                      loop
                      muted
                      playsInline
                      src={spot.mediaUrl}
                      className='h-full w-full'
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={spot.mediaUrl}
                      alt={spot.title}
                      className='h-full w-full'
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </div>

                {/* nút đóng (gốc: 40px, border #e8e8e8, right/top 54px) */}
                <button
                  type='button'
                  aria-label='Đóng'
                  onClick={() => setOpenIdx(null)}
                  className='absolute z-[3] flex items-center justify-center rounded-full'
                  style={{
                    width: '40px',
                    height: '40px',
                    right: 'clamp(20px, 4.2cqi, 54px)',
                    top: 'clamp(20px, 4.2cqi, 54px)',
                    border: '1px solid #e8e8e8',
                    background: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <svg
                    width='12'
                    height='13'
                    viewBox='0 0 12 13'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <line
                      x1='0.484835'
                      y1='11.4848'
                      x2='11.0914'
                      y2='0.878233'
                      stroke='black'
                      strokeWidth='0.75'
                    />
                    <line
                      x1='1.01517'
                      y1='0.984835'
                      x2='11.6218'
                      y2='11.5914'
                      stroke='black'
                      strokeWidth='0.75'
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
