'use client';

/**
 * Data-block "Mint · Variants" (P3/d) — self-contained, container-query.
 * Port từ template ProductVariantSection nhưng:
 *  - responsive theo @container (khung block) thay vì viewport md:/lg:
 *  - isMobile đo qua useContainerMobile (ResizeObserver) thay window.matchMedia
 *  - title 2 dòng có data-element-key → inline-edit
 *  - Discover drawer = MintDiscoverPanel (host-native): portal ra device frame
 *    /body nên không bị clip bởi @container; scroll-lock frame-aware.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintVariantsContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { DISCOVER_FALLBACK, MintDiscoverPanel } from './MintDiscoverPanel';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface Props {
  content: MintVariantsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function MintVariants({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const variants = content.variants ?? [];
  const [active, setActive] = React.useState(variants[0]?.key ?? '');
  const [discoverOpen, setDiscoverOpen] = React.useState(false);
  const activeVariant = variants.find(v => v.key === active) ?? variants[0];
  const isMobile = useContainerMobile(rootRef);

  // Trên editor canvas (active-block-preview) KHÔNG mở drawer khi click coin —
  // để element vẫn chọn/sửa được; drawer chỉ mở ở PreviewMode/Play + /p.
  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(rootRef, ({ scroller, isMobile }) => {
    if (isMobile) return; // desktop-only (đo theo container)
    const root = rootRef.current;
    if (!root) return;
    gsap.utils.toArray<HTMLElement>('.js-parallax', root).forEach(el => {
      gsap.to(el, {
        y: el.getAttribute('data-y') || '-100',
        ease: 'power4',
        scrollTrigger: {
          trigger: el,
          scroller,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    });
    // Zoom ảnh coin theo scroll (scrub): nhỏ → lớn dần khi section đi qua.
    const coin = root.querySelector<HTMLElement>('.mint-variants__coin');
    if (coin) {
      gsap.fromTo(
        coin,
        { scale: 0.88 },
        {
          scale: 1.12,
          ease: 'none',
          transformOrigin: 'center center',
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );
    }
  });

  // Merge theo từng field: content cũ có thể thiếu (hoặc mới sửa 1 field) →
  // field chưa set vẫn hiện default, KHÔNG bị mất khi sửa field khác.
  const info = { ...DISCOVER_FALLBACK, ...content.discover };

  return (
    <>
      <section
        ref={rootRef}
        style={blockBackgroundStyle(background)}
        className='@container relative h-[80vh] w-full overflow-hidden bg-neutral-50 @2xl:h-screen'
      >
        <div className='relative h-full w-full'>
          {/* BACK — editorial title (2 dòng, inline-edit) */}
          <div className='pointer-events-none absolute inset-0 z-0 flex items-center justify-center px-6 text-center'>
            <div className='content-bottom js-parallax gpu-layer' data-y='60'>
              <h2 className='text-[12cqi] leading-[1.05] font-light tracking-tight text-neutral-300/80 @2xl:text-[10cqi]'>
                <span
                  data-element-key='titleLine1'
                  style={styleOf('titleLine1')}
                  className={selectableClass(activeKey === 'titleLine1', '')}
                >
                  {content.titleLine1}
                </span>
                <br />
                <span
                  data-element-key='titleLine2'
                  style={styleOf('titleLine2')}
                  className={selectableClass(activeKey === 'titleLine2', '')}
                >
                  {content.titleLine2}
                </span>
              </h2>
            </div>
          </div>

          {/* FRONT — coin (mở discover) */}
          <div className='absolute inset-x-0 top-[20%] z-10 flex justify-center'>
            <button
              type='button'
              onClick={() => {
                if (!isCanvas) setDiscoverOpen(true);
              }}
              aria-label='More information'
              data-rexer-cta='open-discover-panel'
              className='content-top__image js-parallax gpu-layer group/info pointer-events-auto relative cursor-pointer'
              data-y='-20'
            >
              {activeVariant && (
                // Wrapper ổn định cho zoom-scrub (img có key → remount khi đổi
                // swatch; wrapper không remount nên ScrollTrigger giữ target).
                <div className='mint-variants__coin gpu-layer'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={activeVariant.key}
                    src={activeVariant.image}
                    alt={`Coin — ${activeVariant.label}`}
                    className='pointer-events-none h-[45vh] w-auto object-contain transition-opacity duration-300 @2xl:h-[55vh]'
                  />
                </div>
              )}
              <span className='pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/info:opacity-100'>
                <span className='flex items-center gap-2 rounded-full bg-black px-5 py-3 text-[11px] tracking-[0.2em] whitespace-nowrap text-white uppercase shadow-xl'>
                  + Click for more information
                </span>
              </span>
            </button>
          </div>

          {/* TOP — swatch picker */}
          <ul className='content-pagination absolute top-[78%] left-1/2 z-20 flex -translate-x-1/2 gap-3'>
            {variants.map(v => (
              <li
                key={v.key}
                onClick={() => setActive(v.key)}
                role='button'
                aria-label={`Select ${v.label}`}
                aria-pressed={active === v.key}
                className={`h-9 w-9 cursor-pointer rounded-full border transition-all ${
                  active === v.key
                    ? 'scale-110 border-black ring-2 ring-black ring-offset-2'
                    : 'border-black/30 hover:scale-105'
                }`}
                style={{
                  backgroundImage: `url(${v.swatch})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            ))}
          </ul>
        </div>

        <MintDiscoverPanel
          open={discoverOpen}
          onClose={() => setDiscoverOpen(false)}
          variants={variants}
          discover={content.discover}
          initialViewKey={active}
          isMobile={isMobile}
          behindRef={rootRef}
          styles={styles}
        />
      </section>

      {/* Canvas-only: drawer content hiện sẵn để biết mà nhập liệu (inline-edit).
          Live/Preview/`/p` KHÔNG render — drawer thật mở bằng click coin. */}
      {isCanvas && (
        <DrawerCanvasPreview
          info={info}
          variants={variants}
          activeKey={activeKey}
          styleOf={styleOf}
        />
      )}
    </>
  );
}

/**
 * Bản xem trước nội dung Discover drawer, chỉ hiện trên editor canvas.
 * Mỗi field có data-element-key + selectableClass + styleOf → click chọn +
 * sửa text/màu ngay (không cần mở drawer). Đồng bộ 1-1 với MintDiscoverPanel.
 */
function DrawerCanvasPreview({
  info,
  variants,
  activeKey,
  styleOf,
}: {
  info: typeof DISCOVER_FALLBACK;
  variants: MintVariantsContent['variants'];
  activeKey?: string | null;
  styleOf: (key: string) => React.CSSProperties | undefined;
}) {
  const field = (
    key: string,
    value: string,
    base: React.CSSProperties,
    { pre = false, tag = 'span' }: { pre?: boolean; tag?: 'span' | 'p' } = {}
  ) => {
    const Tag = tag;
    return (
      <Tag
        data-element-key={key}
        style={composeStyle(
          pre ? { ...base, whiteSpace: 'pre-line' } : base,
          styleOf(key)
        )}
        className={selectableClass(activeKey === key, '')}
      >
        {value}
      </Tag>
    );
  };

  return (
    <div className='@container w-full border-t border-dashed border-neutral-300 bg-white px-6 py-6'>
      <p className='mb-4 text-[10px] font-semibold tracking-[0.16em] text-neutral-400 uppercase'>
        Drawer chi tiết · preview (chỉ hiện trong editor)
      </p>

      <div className='mx-auto max-w-[560px]'>
        {/* 3 item ↔ 3 ảnh (1:1) — click ảnh/nhãn để đổi (image/text control). */}
        <div className='mb-6 grid grid-cols-3 gap-3'>
          {variants.map((v, i) => {
            const imgKey = `variants[${i}].image`;
            const labelKey = `variants[${i}].label`;
            return (
              <div
                key={v.key}
                className='flex flex-col items-center gap-2 rounded-lg border border-neutral-200 p-2'
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-element-key={imgKey}
                  src={v.image}
                  alt={v.label}
                  style={composeStyle(
                    {
                      height: '72px',
                      width: '100%',
                      objectFit: 'contain',
                    },
                    styleOf(imgKey)
                  )}
                  className={selectableClass(activeKey === imgKey, '')}
                />
                <span
                  data-element-key={labelKey}
                  style={composeStyle(
                    { fontSize: '12px', color: '#525252' },
                    styleOf(labelKey)
                  )}
                  className={selectableClass(
                    activeKey === labelKey,
                    'truncate'
                  )}
                >
                  {v.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className='mb-2 flex items-start justify-between gap-4'>
          {field(
            'discover.title',
            info.title,
            {
              fontSize: 'clamp(20px, 2.6cqi, 26px)',
              fontWeight: 300,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              color: '#171717',
            },
            { tag: 'span' }
          )}
          {field(
            'discover.badge',
            info.badge,
            {
              flexShrink: 0,
              border: '1px solid rgba(0,0,0,0.2)',
              padding: '6px 12px',
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              color: '#171717',
            },
            { tag: 'span' }
          )}
        </div>

        {field(
          'discover.subtitle',
          info.subtitle,
          {
            display: 'block',
            marginBottom: '20px',
            fontSize: '14px',
            fontStyle: 'italic',
            color: '#737373',
          },
          { tag: 'p' }
        )}

        <div className='flex items-start justify-between gap-6 border-t border-black/10 py-4 text-sm'>
          <span className='shrink-0 text-neutral-500'>Dimensions</span>
          {field(
            'discover.dimensions',
            info.dimensions,
            { textAlign: 'right', color: '#404040', fontSize: '14px' },
            { pre: true, tag: 'span' }
          )}
        </div>

        <div className='flex items-center justify-between border-t border-b border-black/10 py-4 text-sm'>
          <span className='text-neutral-500'>Face Value</span>
          {field('discover.faceValue', info.faceValue, {
            color: '#404040',
            fontSize: '14px',
          })}
        </div>

        <details className='border-b border-black/10 py-3' open>
          <summary className='flex cursor-pointer list-none justify-between text-sm text-neutral-700'>
            <span>Details</span>
            <span className='text-lg leading-none'>+</span>
          </summary>
          {field(
            'discover.detailsText',
            info.detailsText,
            {
              display: 'block',
              marginTop: '8px',
              fontSize: '13px',
              lineHeight: 1.6,
              color: '#525252',
            },
            { pre: true, tag: 'p' }
          )}
        </details>
        <details className='border-b border-black/10 py-3'>
          <summary className='flex cursor-pointer list-none justify-between text-sm text-neutral-700'>
            <span>Packaging</span>
            <span className='text-lg leading-none'>+</span>
          </summary>
          {field(
            'discover.packagingText',
            info.packagingText,
            {
              display: 'block',
              marginTop: '8px',
              fontSize: '13px',
              lineHeight: 1.6,
              color: '#525252',
            },
            { pre: true, tag: 'p' }
          )}
        </details>
        <details className='border-b border-black/10 py-3'>
          <summary className='flex cursor-pointer list-none justify-between text-sm text-neutral-700'>
            <span>Shipping</span>
            <span className='text-lg leading-none'>+</span>
          </summary>
          {field(
            'discover.shippingText',
            info.shippingText,
            {
              display: 'block',
              marginTop: '8px',
              fontSize: '13px',
              lineHeight: 1.6,
              color: '#525252',
            },
            { pre: true, tag: 'p' }
          )}
        </details>
      </div>
    </div>
  );
}
