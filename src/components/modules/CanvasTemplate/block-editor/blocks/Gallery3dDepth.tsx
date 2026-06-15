'use client';

import * as React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  Gallery3dDepthContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

gsap.registerPlugin(useGSAP);

interface Gallery3dDepthProps {
  content: Gallery3dDepthContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Vị trí rải card trong khung (lặp lại nếu nhiều ảnh hơn). */
const SPOTS = [
  { top: '30%', left: '55%' },
  { top: '20%', left: '25%' },
  { top: '55%', left: '15%' },
  { top: '62%', left: '45%' },
  { top: '32%', left: '38%' },
  { top: '58%', left: '62%' },
  { top: '22%', left: '52%' },
  { top: '64%', left: '24%' },
  { top: '24%', left: '40%' },
  { top: '46%', left: '58%' },
];

/**
 * Gallery 3D Depth — port từ CodeGrid "Mat Voyce floating 3D" (229_…, CSS-3D
 * perspective + GSAP). Các khối ảnh liên tục bay từ sâu trong không gian 3D ra
 * trước mặt rồi mờ dần, lặp vô hạn, lần lượt từng khối (stagger).
 *
 * Khác bản gốc: KHÔNG dùng scroll/Three.js — tự chạy bằng `gsap.timeline
 * ({repeat:-1})`; thu khung về 1 box chứa (không full-viewport). Tôn trọng
 * reduced-motion (render tĩnh). Cleanup do useGSAP đảm nhiệm.
 */
export function Gallery3dDepth({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Gallery3dDepthProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const rootRef = React.useRef<HTMLDivElement>(null);
  const images = content.images ?? [];
  const stagger = content.stagger ?? 0.25;
  const duration = content.duration ?? 2;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || images.length === 0) return;
      const reduce = window.matchMedia?.(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      const cards = gsap.utils.toArray<HTMLElement>('.g3d-card', root);
      if (reduce) {
        gsap.set(cards, { z: 0, scale: 1, autoAlpha: 1 });
        return;
      }
      const tl = gsap.timeline({ repeat: -1 });
      cards.forEach((card, i) => {
        const at = i * stagger;
        tl.fromTo(
          card,
          { z: -2600, scale: 0, autoAlpha: 0 },
          {
            z: 220,
            scale: 1,
            autoAlpha: 1,
            duration,
            ease: 'power1.out',
          },
          at
        ).to(
          card,
          {
            z: 1500,
            scale: 1.7,
            autoAlpha: 0,
            duration: duration * 0.6,
            ease: 'power1.in',
          },
          at + duration
        );
      });
    },
    { scope: rootRef, dependencies: [images, stagger, duration] }
  );

  return (
    <div
      ref={rootRef}
      style={{
        ...blockBackgroundStyle(background),
        perspective: '1200px',
      }}
      className={cn(
        'animate-in fade-in @container relative flex h-[70vh] w-full items-center justify-center overflow-hidden rounded-md bg-[#17131f] duration-500 ease-out [transform-style:preserve-3d]',
        className
      )}
    >
      {images.map((src, i) => {
        const spot = SPOTS[i % SPOTS.length];
        return (
          <div
            key={i}
            className='g3d-card absolute h-40 w-40 overflow-hidden rounded-2xl [will-change:transform] [transform-style:preserve-3d]'
            style={{ top: spot.top, left: spot.left }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt='' className='h-full w-full object-cover' />
          </div>
        );
      })}

      {(content.eyebrow || content.title) && (
        <div className='pointer-events-none relative z-[2] flex flex-col items-center gap-2 px-6 text-center text-white'>
          {content.eyebrow && (
            <span
              data-element-key='eyebrow'
              style={styleOf('eyebrow')}
              className={selectableClass(
                activeKey === 'eyebrow',
                'text-2xs pointer-events-auto font-semibold tracking-[0.32em] text-white/60 uppercase @2xl:text-xs'
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
                'pointer-events-auto text-2xl font-semibold tracking-tight @2xl:text-4xl'
              )}
            >
              {content.title}
            </h2>
          )}
        </div>
      )}
    </div>
  );
}
