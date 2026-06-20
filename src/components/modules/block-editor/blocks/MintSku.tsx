'use client';

/**
 * Data-block "Mint · SKU" (P3 + inline-edit).
 * Layered composition: painting (z0) + ghost title (z10) + packaging (z20).
 * Mỗi element có data-element-key (title text, paintingUrl/packagingUrl image)
 * → chọn/sửa inline. Giữ GSAP word/char reveal cho title.
 */

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintSkuContent,
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
  content: MintSkuContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function MintSku({
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

  React.useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const titleEl = root.querySelector<HTMLElement>('.mint-sku__name span');
      if (!titleEl) return;
      const split = new SplitType(titleEl, { types: 'words,chars' });
      gsap.fromTo(
        split.chars,
        { opacity: 0, y: 30, force3D: true },
        {
          opacity: 1,
          y: 0,
          force3D: true,
          ease: 'power2.out',
          stagger: 0.03,
          duration: 0.6,
          scrollTrigger: {
            trigger: titleEl,
            start: 'top 80%',
            end: 'top 50%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='relative h-[50vh] w-full overflow-hidden bg-neutral-100'
    >
      <div className='relative h-full w-full'>
        {/* z-0 painting */}
        <div className='absolute inset-0 z-0'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-element-key='paintingUrl'
            src={content.paintingUrl}
            alt='Painting background'
            style={styleOf('paintingUrl')}
            className={selectableClass(
              activeKey === 'paintingUrl',
              'h-full w-full object-cover'
            )}
          />
          <div
            className='absolute inset-0'
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%), linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 35%, transparent 70%, rgba(0,0,0,0.55) 100%)',
            }}
          />
        </div>

        {/* z-10 ghost title */}
        <h2
          data-element-key='title'
          style={{ fontSize: 'clamp(48px, 9vw, 130px)', ...styleOf('title') }}
          className={selectableClass(
            activeKey === 'title',
            'mint-sku__name pointer-events-none absolute inset-0 z-10 grid place-items-center px-6 text-center leading-[1.05] font-light tracking-tight text-white/25'
          )}
        >
          <span>{content.title}</span>
        </h2>

        {/* z-20 packaging */}
        <div className='pointer-events-none absolute inset-0 z-20 flex items-center justify-center'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-element-key='packagingUrl'
            src={content.packagingUrl}
            alt='Packaging'
            style={styleOf('packagingUrl')}
            className={selectableClass(
              activeKey === 'packagingUrl',
              'pointer-events-auto h-[58vh] w-auto -translate-y-[100px] object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.7)] md:h-[64vh]'
            )}
          />
        </div>
      </div>
    </section>
  );
}
