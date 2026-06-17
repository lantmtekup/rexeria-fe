'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  GalleryPanLensContent,
} from '../types';
import { blockBackgroundStyle } from './applyStyle';

interface GalleryPanLensProps {
  content: GalleryPanLensContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Gallery Pan + Lens — port từ CodeGrid "gallery awwwards canvas" (015_…). Tấm
 * ảnh lớn hơn khung pan mượt theo hướng chuột (Web Animations API); ảnh trong
 * bán kính quanh con trỏ phồng to (GSAP scrub theo khoảng cách²).
 *
 * Khác bản gốc: mousemove trên ROOT block (không window) → contained. Tôn trọng
 * reduced-motion. Cleanup tween/listener.
 */
export function GalleryPanLens({
  content,
  background,
  className,
}: GalleryPanLensProps) {
  const images = React.useMemo(() => content.images ?? [], [content.images]);
  const radius = content.radius ?? 260;
  const maxScale = content.maxScale ?? 2.4;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const galRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = rootRef.current;
    const gal = galRef.current;
    if (!root || !gal || images.length === 0) return;
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (reduce) return;

    const blocks = Array.from(gal.querySelectorAll<HTMLElement>('.gpl-block'));
    const tweens = blocks.map(b =>
      gsap.to(b, { scale: maxScale, ease: 'power1.in', paused: true })
    );
    const r2 = radius * radius;

    const onMove = (e: PointerEvent) => {
      const rr = root.getBoundingClientRect();
      const xDec = (e.clientX - rr.left) / rr.width;
      const yDec = (e.clientY - rr.top) / rr.height;
      const maxX = gal.offsetWidth - rr.width;
      const maxY = gal.offsetHeight - rr.height;
      gal.animate(
        {
          transform: `translate(${(-maxX * xDec).toFixed(1)}px, ${(-maxY * yDec).toFixed(1)}px)`,
        },
        { duration: 1400, fill: 'forwards', easing: 'ease' }
      );
      blocks.forEach((b, i) => {
        const br = b.getBoundingClientRect();
        const dx = (br.left + br.width / 2 - e.clientX) ** 2;
        const dy = (br.top + br.height / 2 - e.clientY) ** 2;
        tweens[i].progress(Math.max(0, 1 - (dx + dy) / r2));
      });
    };
    root.addEventListener('pointermove', onMove);
    return () => {
      root.removeEventListener('pointermove', onMove);
      tweens.forEach(t => t.kill());
    };
  }, [images, radius, maxScale]);

  const cols = Math.min(5, Math.ceil(Math.sqrt(images.length)));

  return (
    <div
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in relative h-[70vh] w-full [cursor:crosshair] overflow-hidden rounded-md bg-[#0f1219] duration-500 ease-out',
        className
      )}
    >
      <div
        ref={galRef}
        className='absolute top-0 left-0 grid h-[130%] w-[140%] gap-4 p-8'
        style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className='gpl-block aspect-[3/4] overflow-hidden rounded-lg [will-change:transform]'
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt='' className='h-full w-full object-cover' />
          </div>
        ))}
      </div>
    </div>
  );
}
