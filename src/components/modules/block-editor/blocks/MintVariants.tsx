'use client';

/**
 * Data-block "Mint · Variants" (P3/d) — self-contained, container-query.
 * Port từ template ProductVariantSection nhưng:
 *  - responsive theo @container (khung block) thay vì viewport md:/lg:
 *  - isMobile đo qua useContainerMobile (ResizeObserver) thay window.matchMedia
 *  - title 2 dòng có data-element-key → inline-edit
 *  - DiscoverPanel bundle ngay trong block (self-contained, không cần parent)
 */
import * as React from 'react';
import gsap from 'gsap';

import DiscoverPanel from '@/templates/mint-coint/components/DiscoverPanel';
import { IMG } from '@/templates/mint-coint/lib/image-cdn';

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

  return (
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
            onClick={() => setDiscoverOpen(true)}
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

      <DiscoverPanel
        open={discoverOpen}
        onClose={() => setDiscoverOpen(false)}
        images={{
          reverse: [IMG.coinReverse, IMG.coinRevLeft, IMG.coinRevRight],
          obverse: [IMG.coinObverse, IMG.coinReverse, IMG.coinRevLeft],
          packaging: [IMG.coinPackaging, IMG.coinReverse, IMG.coinObverse],
        }}
      />
    </section>
  );
}
