'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  LightboxFlipContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface LightboxFlipProps {
  content: LightboxFlipContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Lightbox Flip — port từ CodeGrid "lightbox gsap flip" (008_…). Click thumbnail
 * → ảnh "bay" phóng to ra giữa; click nền → bay về ô cũ.
 *
 * Khác bản gốc: KHÔNG reparent node React (dễ vỡ reconcile) — thay vào dùng 1
 * ảnh clone tạm + GSAP morph theo getBoundingClientRect (cùng cảm giác FLIP),
 * overlay absolute trong block (không position:fixed → an toàn khi block nằm
 * trong ancestor có transform). Tôn trọng reduced-motion.
 */
export function LightboxFlip({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: LightboxFlipProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const rootRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const animating = React.useRef(false);
  const images = content.images ?? [];
  const columns = content.columns ?? 4;
  const duration = content.duration ?? 0.6;

  const open = (thumb: HTMLImageElement) => {
    const root = rootRef.current;
    const overlay = overlayRef.current;
    if (!root || !overlay || animating.current) return;
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const rootRect = root.getBoundingClientRect();
    const r = thumb.getBoundingClientRect();

    const clone = document.createElement('img');
    clone.src = thumb.currentSrc || thumb.src;
    clone.className = 'absolute z-[3] rounded-lg object-cover shadow-2xl';
    const fromL = r.left - rootRect.left;
    const fromT = r.top - rootRect.top;
    Object.assign(clone.style, {
      left: `${fromL}px`,
      top: `${fromT}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
    });

    // Target: fit giữ tỉ lệ ảnh thật trong 80% khung.
    const natRatio =
      thumb.naturalWidth && thumb.naturalHeight
        ? thumb.naturalWidth / thumb.naturalHeight
        : 1;
    const maxW = rootRect.width * 0.86;
    const maxH = rootRect.height * 0.86;
    let tW = maxW;
    let tH = tW / natRatio;
    if (tH > maxH) {
      tH = maxH;
      tW = tH * natRatio;
    }
    const tL = (rootRect.width - tW) / 2;
    const tT = (rootRect.height - tH) / 2;

    const close = () => {
      if (animating.current) return;
      animating.current = true;
      const done = () => {
        clone.remove();
        gsap.set(overlay, { autoAlpha: 0 });
        overlay.onclick = null;
        animating.current = false;
      };
      if (reduce) return done();
      gsap.to(clone, {
        left: fromL,
        top: fromT,
        width: r.width,
        height: r.height,
        duration,
        ease: 'power3.inOut',
        onComplete: done,
      });
    };

    overlay.appendChild(clone);
    gsap.set(overlay, { autoAlpha: 1 });
    overlay.onclick = close;
    animating.current = true;
    if (reduce) {
      Object.assign(clone.style, {
        left: `${tL}px`,
        top: `${tT}px`,
        width: `${tW}px`,
        height: `${tH}px`,
      });
      animating.current = false;
      return;
    }
    gsap.to(clone, {
      left: tL,
      top: tT,
      width: tW,
      height: tH,
      duration,
      ease: 'power3.inOut',
      onComplete: () => {
        animating.current = false;
      },
    });
  };

  return (
    <div
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container relative w-full overflow-hidden rounded-md bg-neutral-100 p-5 duration-500 ease-out',
        className
      )}
    >
      {(content.eyebrow || content.title) && (
        <div className='mb-4 flex flex-col gap-1 text-center'>
          {content.eyebrow && (
            <span
              data-element-key='eyebrow'
              style={styleOf('eyebrow')}
              className={selectableClass(
                activeKey === 'eyebrow',
                'text-2xs text-content-muted font-semibold tracking-[0.32em] uppercase'
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
                'text-foreground text-xl font-semibold tracking-tight @2xl:text-2xl'
              )}
            >
              {content.title}
            </h2>
          )}
        </div>
      )}

      <div
        className='grid gap-2'
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}
      >
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt=''
            onClick={e => open(e.currentTarget)}
            className='aspect-square w-full cursor-pointer rounded-lg object-cover transition-transform hover:scale-[1.02]'
          />
        ))}
      </div>

      {/* Overlay nền tối + ảnh clone (absolute trong block). */}
      <div
        ref={overlayRef}
        className='invisible absolute inset-0 z-[2] cursor-zoom-out bg-black/85 opacity-0'
      />
    </div>
  );
}
