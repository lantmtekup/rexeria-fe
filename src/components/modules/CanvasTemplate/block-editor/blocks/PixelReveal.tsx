'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  PixelRevealContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface PixelRevealProps {
  content: PixelRevealContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Pixel Reveal — ảnh hiện ra qua hiệu ứng pixelation: khi cuộn vào view, vẽ ảnh
 * từ độ phân giải thấp (ô lớn) → sắc nét (1px) bằng canvas + imageSmoothing=false.
 * IntersectionObserver kích hoạt 1 lần; rAF + cleanup. reduced-motion → nét ngay.
 * Port pattern pixelated-text/video (CodeGrid sept2025).
 */
export function PixelReveal({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: PixelRevealProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let started = false;
    let w = 0;
    let h = 0;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const size = () => {
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w;
      canvas.height = h;
    };

    const drawAt = (pixel: number) => {
      if (!img.complete || !img.naturalWidth) return;
      ctx.imageSmoothingEnabled = false;
      const sw = Math.max(1, Math.round(w / pixel));
      const sh = Math.max(1, Math.round(h / pixel));
      // cover-fit ảnh gốc → khung nhỏ → phóng lên
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, sw, sh);
      ctx.drawImage(canvas, 0, 0, sw, sh, 0, 0, w, h);
    };

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const run = () => {
      if (started) return;
      started = true;
      if (reduced) {
        drawAt(1);
        return;
      }
      const t0 = performance.now();
      const DUR = 1100;
      const MAX = 48;
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / DUR);
        const pixel = Math.max(1, MAX * (1 - p) ** 2);
        drawAt(pixel);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    img.onload = () => {
      size();
      drawAt(48);
    };
    img.src = content.imageUrl;

    const io = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && run()),
      { threshold: 0.3 }
    );
    io.observe(parent);
    const ro = new ResizeObserver(() => {
      size();
      drawAt(started ? 1 : 48);
    });
    ro.observe(parent);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [content.imageUrl]);

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container relative flex min-h-[56vh] w-full items-end overflow-hidden rounded-md bg-[#0a0c10] duration-500 ease-out',
        className
      )}
    >
      <canvas ref={canvasRef} className='absolute inset-0 h-full w-full' />
      {content.title && (
        <h2
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'relative z-10 m-6 text-3xl font-bold tracking-tight text-white drop-shadow-lg @2xl:text-5xl'
          )}
        >
          {content.title}
        </h2>
      )}
    </div>
  );
}
