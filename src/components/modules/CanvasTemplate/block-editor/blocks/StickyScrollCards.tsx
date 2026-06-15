'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  StickyScrollCardsContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface StickyScrollCardsProps {
  content: StickyScrollCardsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Sticky Scroll Cards — port từ CodeGrid "Ashfall sticky cards" (250_…, GSAP +
 * ScrollTrigger). Khi cuộn, các card ảnh chồng lên nhau: card hiện thu nhỏ +
 * xoay nhẹ, ảnh bên trong zoom, card kế trượt từ dưới lên đè lên.
 *
 * Khác bản gốc: KHÔNG dùng GSAP `pin` (gây giật trên iOS) — dùng CSS
 * `position:sticky` cho lớp giữ màn hình, GSAP chỉ scrub timeline theo scroll.
 * Bỏ Lenis (không hijack scroll toàn trang). Tôn trọng reduced-motion.
 */
export function StickyScrollCards({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: StickyScrollCardsProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const rootRef = React.useRef<HTMLDivElement>(null);
  const cards = content.cards ?? [];
  const finalScale = content.finalScale ?? 0.5;
  const rotateDeg = content.rotateDeg ?? 10;
  const imageZoom = content.imageZoom ?? 1.5;
  const n = cards.length;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || n < 2) return;
      const reduce = window.matchMedia?.(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (reduce) return;

      const cardEls = gsap.utils.toArray<HTMLElement>('.ssc-card', root);
      gsap.set(cardEls, { y: '0%', scale: 1, rotation: 0 });
      cardEls.forEach((c, i) => {
        if (i > 0) gsap.set(c, { y: '100%' });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
        },
      });

      for (let i = 0; i < n - 1; i++) {
        const cur = cardEls[i];
        const img = cur.querySelector('img');
        tl.to(cur, { scale: finalScale, rotation: rotateDeg, ease: 'none' }, i);
        if (img) tl.to(img, { scale: imageZoom, ease: 'none' }, i);
        tl.to(cardEls[i + 1], { y: '0%', ease: 'none' }, i);
      }
    },
    { scope: rootRef, dependencies: [n, finalScale, rotateDeg, imageZoom] }
  );

  return (
    // Outer = đường ray cuộn: cao n×100vh để có quãng scrub cho từng card.
    <div
      ref={rootRef}
      style={{ ...blockBackgroundStyle(background), height: `${n * 100}vh` }}
      className={cn('relative w-full', className)}
    >
      {/* Lớp giữ màn hình bằng CSS sticky (an toàn iOS). */}
      <div className='sticky top-0 flex h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-neutral-950 px-6'>
        {(content.eyebrow || content.title) && (
          <div className='flex flex-col items-center gap-1 text-center text-white'>
            {content.eyebrow && (
              <span
                data-element-key='eyebrow'
                style={styleOf('eyebrow')}
                className={selectableClass(
                  activeKey === 'eyebrow',
                  'text-2xs font-semibold tracking-[0.32em] text-white/55 uppercase'
                )}
              >
                {content.eyebrow}
              </span>
            )}
            {content.title && (
              <h2
                data-element-key='title'
                style={styleOf('title')}
                className={selectableClass(
                  activeKey === 'title',
                  'text-2xl font-semibold tracking-tight'
                )}
              >
                {content.title}
              </h2>
            )}
          </div>
        )}

        <div className='relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-xl'>
          {cards.map((card, i) => (
            <div
              key={i}
              className='ssc-card absolute inset-0 overflow-hidden rounded-xl'
            >
              {card.title && (
                <span className='text-2xs absolute top-3 left-3 z-[1] rounded bg-black/70 px-2 py-0.5 font-semibold tracking-wide text-white uppercase'>
                  {card.title}
                </span>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.imageUrl}
                alt={card.title ?? ''}
                className='h-full w-full object-cover'
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
