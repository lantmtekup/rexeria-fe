'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  ParallaxHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface ParallaxHeroProps {
  content: ParallaxHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Parallax Hero — port từ CodeGrid "parallax landing + marquee" (002_…, vanilla
 * mousemove). Các sticker/ảnh trôi nhẹ theo hướng ngược/cùng con trỏ
 * (`data-speed`), tạo chiều sâu; kèm dải marquee chạy ngang tuỳ chọn.
 *
 * Khác bản gốc: mousemove nghe trên ROOT block (không document) + quy về toạ độ
 * tương đối root → mỗi block độc lập, mini-preview tĩnh. Tắt parallax trên touch
 * + tôn trọng reduced-motion. Cleanup listener.
 */
export function ParallaxHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: ParallaxHeroProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const rootRef = React.useRef<HTMLDivElement>(null);
  const layers = React.useMemo(() => content.layers ?? [], [content.layers]);
  const marqueeText = content.marqueeText;
  const marqueeSeconds = content.marqueeSeconds ?? 40;

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (reduce) return;

    const els = Array.from(
      root.querySelectorAll<HTMLElement>('[data-ph-layer]')
    );
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return; // chạm thì bỏ (chỉ chuột/pen)
      const rect = root.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      els.forEach(el => {
        const speed = parseFloat(el.dataset.phSpeed ?? '0');
        const x = ((rect.width / 2 - relX) * speed) / 100;
        const y = ((rect.height / 2 - relY) * speed) / 100;
        el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
    };
    const onLeave = () => {
      els.forEach(el => {
        el.style.transform = 'translate(-50%, -50%)';
      });
    };
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
    };
  }, [layers]);

  return (
    <div
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden rounded-md bg-[#0e1a16] duration-500 ease-out',
        className
      )}
    >
      {/* Sticker layers — neo theo top/left %, JS thêm offset parallax. */}
      {layers.map((layer, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={layer.imageUrl}
          alt=''
          data-ph-layer
          data-ph-speed={layer.speed}
          style={{
            top: layer.top ?? '50%',
            left: layer.left ?? '50%',
            width: layer.width ?? '18%',
            transform: 'translate(-50%, -50%)',
          }}
          className='pointer-events-none absolute z-[1] [will-change:transform]'
        />
      ))}

      {marqueeText && (
        <div className='pointer-events-none absolute inset-x-0 bottom-6 z-0 overflow-hidden'>
          <div
            className='ph-marquee inline-block text-7xl font-extrabold tracking-tight whitespace-nowrap text-white/10 uppercase @2xl:text-[8rem]'
            style={{
              animation: `ph-marquee ${marqueeSeconds}s linear infinite`,
            }}
          >
            {`${marqueeText} `.repeat(6)}
          </div>
        </div>
      )}

      <div className='relative z-[2] flex flex-col items-center gap-3 px-6 text-center text-white'>
        {content.eyebrow && (
          <span
            data-element-key='eyebrow'
            style={styleOf('eyebrow')}
            className={selectableClass(
              activeKey === 'eyebrow',
              'text-2xs font-semibold tracking-[0.32em] text-white/60 uppercase @2xl:text-xs'
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
              'max-w-2xl text-3xl font-semibold tracking-tight @2xl:text-5xl'
            )}
          >
            {content.title}
          </h2>
        )}
      </div>

      <style>{`@keyframes ph-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
