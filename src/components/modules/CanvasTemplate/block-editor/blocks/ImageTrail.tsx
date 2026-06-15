'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  ImageTrailContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface ImageTrailProps {
  content: ImageTrailContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const IN_EASE = 'cubic-bezier(.07,.5,.5,1)';
const OUT_EASE = 'cubic-bezier(.87,0,.13,1)';

/**
 * Image Trail — port từ CodeGrid "Burocratik image trail" (243_…, vanilla DOM
 * + CSS transition, zero-dep). Rê con trỏ trong block → ảnh lần lượt mọc tại
 * vị trí con trỏ (xoay ngẫu nhiên, scale 0→1) rồi tự thu nhỏ biến mất.
 *
 * Khác bản gốc: nghe pointer trên ROOT của block (không phải document) → chỉ
 * phản ứng khi hover trong block, mini-preview đứng yên. Tôn trọng
 * reduced-motion. Thao tác DOM trực tiếp (không render ảnh qua React) + cleanup.
 */
export function ImageTrail({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: ImageTrailProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const rootRef = React.useRef<HTMLDivElement>(null);
  const images = React.useMemo(() => content.images ?? [], [content.images]);
  const threshold = content.threshold ?? 100;
  const lifespan = content.lifespan ?? 750;
  const inDuration = content.inDuration ?? 750;
  const outDuration = content.outDuration ?? 1000;

  React.useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || images.length === 0) return;

    const root = rootRef.current;
    if (!root) return;

    let mouseX = 0;
    let mouseY = 0;
    let lastX = 0;
    let lastY = 0;
    let inside = false;
    let lastRemoval = 0;
    const removalDelay = 50;
    const trail: { el: HTMLImageElement; rot: number; removeAt: number }[] = [];
    let raf = 0;

    const createImage = () => {
      const rect = root.getBoundingClientRect();
      const img = document.createElement('img');
      const rot = (Math.random() - 0.5) * 50;
      img.src = images[Math.floor(Math.random() * images.length)];
      img.alt = '';
      img.className = 'pointer-events-none absolute z-[1] rounded';
      img.style.width = '180px';
      img.style.height = '180px';
      img.style.objectFit = 'cover';
      img.style.left = `${mouseX - rect.left}px`;
      img.style.top = `${mouseY - rect.top}px`;
      img.style.transformOrigin = 'center';
      img.style.willChange = 'transform';
      img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(0)`;
      img.style.transition = `transform ${inDuration}ms ${IN_EASE}`;
      root.appendChild(img);
      // ép reflow rồi animate vào.
      window.setTimeout(() => {
        img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(1)`;
      }, 10);
      trail.push({ el: img, rot, removeAt: Date.now() + lifespan });
    };

    const movedEnough = () =>
      Math.hypot(mouseX - lastX, mouseY - lastY) > threshold;

    const removeOld = () => {
      const now = Date.now();
      if (now - lastRemoval < removalDelay || trail.length === 0) return;
      if (now >= trail[0].removeAt) {
        const item = trail.shift()!;
        item.el.style.transition = `transform ${outDuration}ms ${OUT_EASE}`;
        item.el.style.transform = `translate(-50%, -50%) rotate(${item.rot}deg) scale(0)`;
        lastRemoval = now;
        window.setTimeout(() => item.el.remove(), outDuration);
      }
    };

    const tick = () => {
      if (inside && movedEnough()) {
        lastX = mouseX;
        lastY = mouseY;
        createImage();
      }
      removeOld();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      inside = true;
    };
    const onLeave = () => {
      inside = false;
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
      trail.forEach(t => t.el.remove());
    };
  }, [images, threshold, lifespan, inDuration, outDuration]);

  return (
    <div
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden rounded-md bg-neutral-100 duration-500 ease-out',
        className
      )}
    >
      <div className='pointer-events-none relative z-[2] flex flex-col items-center gap-2 px-6 text-center'>
        {content.eyebrow && (
          <span
            data-element-key='eyebrow'
            style={styleOf('eyebrow')}
            className={selectableClass(
              activeKey === 'eyebrow',
              'text-2xs text-content-muted pointer-events-auto font-semibold tracking-[0.32em] uppercase @2xl:text-xs'
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
              'text-foreground pointer-events-auto text-2xl font-semibold tracking-tight @2xl:text-4xl'
            )}
          >
            {content.title}
          </h2>
        )}
      </div>
    </div>
  );
}
