'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  DotMatrixContent,
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

interface DotMatrixProps {
  content: DotMatrixContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Dot Matrix — canvas lưới chấm; chấm gần con trỏ phình to + sáng lên (lerp theo
 * khoảng cách). rAF + pointermove, ResizeObserver re-grid; cleanup đầy đủ.
 * reduced-motion / touch → lưới tĩnh. Port pattern DotMatrix (CodeGrid dec2025).
 */
export function DotMatrix({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: DotMatrixProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const gap = content.gap ?? 26;
  const dotColor = content.dotColor ?? '#5b6472';

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const pointer = { x: -9999, y: -9999 };
    let dots: { x: number; y: number }[] = [];
    let raf = 0;
    let w = 0;
    let h = 0;

    const build = () => {
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (let y = gap; y < h; y += gap)
        for (let x = gap; x < w; x += gap) dots.push({ x, y });
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const R = 120;
      for (const d of dots) {
        const dist = Math.hypot(d.x - pointer.x, d.y - pointer.y);
        const f = reduced ? 0 : Math.max(0, 1 - dist / R);
        const r = 1 + f * 3;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.globalAlpha = 0.25 + f * 0.75;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(parent);
    parent.addEventListener('pointermove', onMove);
    parent.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      parent.removeEventListener('pointermove', onMove);
      parent.removeEventListener('pointerleave', onLeave);
    };
  }, [gap, dotColor]);

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden rounded-md bg-[#0a0c10] duration-500 ease-out',
        className
      )}
    >
      <canvas ref={canvasRef} className='absolute inset-0' />
      {content.title && (
        <h2
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'pointer-events-none relative z-10 px-6 text-center text-4xl font-bold tracking-tight text-white @2xl:text-6xl'
          )}
        >
          {content.title}
        </h2>
      )}
    </div>
  );
}
