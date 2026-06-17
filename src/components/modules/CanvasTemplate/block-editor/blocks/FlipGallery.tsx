'use client';

import * as React from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FlipGalleryContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

gsap.registerPlugin(Flip);

interface FlipGalleryProps {
  content: FlipGalleryContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const ROT = [8, -5, 3, -3, 6, -4];
const SCOPED_CSS = `
.fg-root .fg-wrap{position:relative;width:100%;height:62vh;display:flex;align-items:center;justify-content:center;gap:1.25rem}
.fg-root.fg-stack .fg-wrap{display:block}
.fg-root .fg-card{width:220px;height:300px;border-radius:0.75rem;overflow:hidden;flex:none}
.fg-root.fg-stack .fg-card{position:absolute;top:50%;left:50%}
.fg-root.fg-grid .fg-card{position:relative}
.fg-root .fg-card img{width:100%;height:100%;object-fit:cover}
`;

/**
 * Flip Gallery — port từ CodeGrid "gsap flip toggle view" (130_…). Nút bấm đổi
 * giữa 2 layout: chồng-xoay (stack) ↔ dàn hàng (grid); GSAP Flip morph mượt.
 *
 * Khác bản gốc: bỏ Locomotive scroll. Đổi layout bằng classList trực tiếp (giữa
 * getState và Flip.from) để React không tranh chấp className. Tôn trọng
 * reduced-motion.
 */
export function FlipGallery({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FlipGalleryProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const rootRef = React.useRef<HTMLDivElement>(null);
  const [spread, setSpread] = React.useState(false);
  const images = content.images ?? [];

  // Áp rotation cho state stack (sau khi layout đổi xong cũng giữ).
  const applyRotation = (toGrid: boolean) => {
    const root = rootRef.current;
    if (!root) return;
    const cards = gsap.utils.toArray<HTMLElement>('.fg-card', root);
    cards.forEach((c, i) => {
      gsap.to(c, {
        rotation: toGrid ? 0 : ROT[i % ROT.length],
        x: '-50%',
        y: '-50%',
        duration: 0.8,
        ease: 'power3.inOut',
        delay: 0.1,
        overwrite: 'auto',
      });
    });
  };

  const toggle = () => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const cards = gsap.utils.toArray<HTMLElement>('.fg-card', root);
    const state = Flip.getState(cards);
    const next = !spread;
    root.classList.toggle('fg-stack', !next);
    root.classList.toggle('fg-grid', next);
    setSpread(next);
    if (next) gsap.set(cards, { clearProps: 'transform' });
    Flip.from(state, {
      absolute: true,
      duration: reduce ? 0 : 0.9,
      stagger: 0.05,
      ease: 'power3.inOut',
      onStart: () => {
        if (!next) applyRotation(false);
      },
    });
  };

  return (
    <div
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        'fg-root fg-stack animate-in fade-in @container relative w-full overflow-hidden rounded-md bg-[#17131f] px-6 py-8 duration-500 ease-out',
        className
      )}
    >
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3 text-white'>
        <div className='flex flex-col gap-1'>
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
                'text-xl font-semibold tracking-tight @2xl:text-2xl'
              )}
            >
              {content.title}
            </h2>
          )}
        </div>
        <button
          type='button'
          onClick={toggle}
          className='rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-white/90'
        >
          {spread
            ? (content.collapseLabel ?? 'Thu gọn')
            : (content.expandLabel ?? 'Dàn ra')}
        </button>
      </div>

      <div className='fg-wrap'>
        {images.map((src, i) => (
          <div
            key={i}
            className='fg-card'
            style={
              !spread
                ? {
                    transform: `translate(-50%, -50%) rotate(${ROT[i % ROT.length]}deg)`,
                  }
                : undefined
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt='' />
          </div>
        ))}
      </div>

      <style>{SCOPED_CSS}</style>
    </div>
  );
}
