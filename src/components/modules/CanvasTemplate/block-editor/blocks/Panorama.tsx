'use client';

import * as React from 'react';
import { Compass } from 'lucide-react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  PanoramaContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface PanoramaProps {
  content: PanoramaContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * CSS-only equirectangular panorama. The image is rendered twice (A | A)
 * side-by-side inside a tall horizontal strip. As the user drags, we move
 * the strip via `translateX`; when the offset exceeds one image width we
 * wrap it back so the seam never shows.
 *
 *   ┌──────────────────┐  visible viewport
 *   │  ←─────────────  │
 *   │                  │
 *   └──────────────────┘
 *   ┃ strip = imgA | imgA  (2× width, translated as user drags)
 *
 * No Three.js, no Hammer.js, no heavy bundle cost. Hotspot overlays still
 * work because they live in `extraElements` and are positioned in block
 * coordinates, independent of pano yaw — they'll appear pinned at the
 * frame edge as the pano rotates beneath them (matches the user
 * mental model: hotspots are anchored to the frame, not the scene).
 */
export function Panorama({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: PanoramaProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const sEyebrow = styleOf('eyebrow');
  const sTitle = styleOf('title');
  const sDescription = styleOf('description');
  const sImage = styleOf('imageUrl');

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  // The natural width of the panorama strip = the loaded image's
  // CONTAINER-SCALED width (set to wrapper.height * 2 by CSS). We measure
  // after layout so wrap-around math uses the correct period.
  const stripWidthRef = React.useRef(0);
  const [yaw, setYaw] = React.useState((content.initialYaw ?? 0) * -1000);

  // Sync yaw when initialYaw changes (toolbar edit).
  React.useEffect(() => {
    // Multiply by -1000 to convert a 0..1 fraction into the px space the
    // strip uses. Recomputed once we know stripWidth (effect below).
    if (stripWidthRef.current > 0) {
      setYaw(-(content.initialYaw ?? 0) * stripWidthRef.current);
    }
  }, [content.initialYaw]);

  // Measure strip width once the image is loaded so wrap-around works.
  React.useEffect(() => {
    const img = imgRef.current;
    const wrap = wrapperRef.current;
    if (!img || !wrap) return;
    const measure = () => {
      const wrapHeight = wrap.getBoundingClientRect().height;
      // Strip = 1 copy of the image at 2:1 aspect = 2 × wrapHeight wide.
      stripWidthRef.current = wrapHeight * 2;
      setYaw(-(content.initialYaw ?? 0) * stripWidthRef.current);
    };
    if (img.complete) measure();
    else img.addEventListener('load', measure, { once: true });
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => {
      ro.disconnect();
      img.removeEventListener('load', measure);
    };
  }, [content.imageUrl, content.initialYaw]);

  // Drag state — uses pointer events for touch + mouse.
  const dragRef = React.useRef<{
    startClientX: number;
    baseYaw: number;
    pointerId: number;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragRef.current = {
      startClientX: e.clientX,
      baseYaw: yaw,
      pointerId: e.pointerId,
    };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    e.stopPropagation();
    const dx = (e.clientX - d.startClientX) * (content.sensitivity ?? 1);
    let next = d.baseYaw + dx;
    // Wrap into [-stripWidth, 0] so the visible strip can scroll forever.
    const w = stripWidthRef.current;
    if (w > 0) {
      next = ((next % w) + w) % w; // 0..w
      next = next - w; // -w..0
    }
    setYaw(next);
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).releasePointerCapture?.(
      dragRef.current.pointerId
    );
    dragRef.current = null;
  };

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in flex w-full flex-col gap-5 rounded-md bg-neutral-950 px-6 py-10 text-white duration-500 @2xl:px-12 @2xl:py-14',
        className
      )}
    >
      {(content.eyebrow || content.title || content.description) && (
        <div className='flex flex-col items-center gap-2 text-center'>
          {content.eyebrow && (
            <span
              data-element-key='eyebrow'
              style={sEyebrow}
              className={selectableClass(
                activeKey === 'eyebrow',
                'text-[10px] font-semibold tracking-[0.32em] text-white/60 uppercase'
              )}
            >
              {content.eyebrow}
            </span>
          )}
          {content.title && (
            <h2
              data-element-key='title'
              style={sTitle}
              className={selectableClass(
                activeKey === 'title',
                'text-2xl font-semibold tracking-tight @2xl:text-3xl'
              )}
            >
              {content.title}
            </h2>
          )}
          {content.description && (
            <p
              data-element-key='description'
              style={sDescription}
              className={selectableClass(
                activeKey === 'description',
                'max-w-[60ch] text-sm text-white/70'
              )}
            >
              {content.description}
            </p>
          )}
        </div>
      )}

      <div
        data-element-key='imageUrl'
        style={sImage}
        className={selectableClass(
          activeKey === 'imageUrl',
          'relative aspect-[16/9] w-full overflow-hidden rounded-md bg-neutral-800 ring-1 ring-white/10'
        )}
      >
        <div
          ref={wrapperRef}
          className='relative size-full cursor-grab touch-none select-none active:cursor-grabbing'
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Image strip — 2 copies side by side. Each is height-driven
              (2:1 aspect), so width = 2 × wrapper height. They cycle as a
              pair, and the wrap-around math above keeps the seam offscreen. */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              display: 'flex',
              transform: `translateX(${yaw}px)`,
              willChange: 'transform',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={content.imageUrl}
              alt=''
              draggable={false}
              className='pointer-events-none block h-full w-auto object-cover'
              style={{ aspectRatio: '2 / 1' }}
            />
            {/* Second copy for seamless wrap. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.imageUrl}
              alt=''
              draggable={false}
              aria-hidden
              className='pointer-events-none block h-full w-auto object-cover'
              style={{ aspectRatio: '2 / 1' }}
            />
          </div>

          {/* Hint badge — visible in editor / first interaction. */}
          {content.hint && (
            <span className='pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur'>
              <Compass className='mr-1 inline size-3' />
              {content.hint}
            </span>
          )}

          {/* Compass dial — small visual indicator of current yaw. */}
          <div className='pointer-events-none absolute right-3 bottom-3 flex size-12 items-center justify-center rounded-full bg-black/55 backdrop-blur'>
            <div
              className='size-9 rounded-full ring-1 ring-white/40'
              style={{
                background: `conic-gradient(from 0deg, transparent ${
                  stripWidthRef.current > 0
                    ? Math.round(
                        ((-yaw % stripWidthRef.current) /
                          stripWidthRef.current) *
                          360
                      )
                    : 0
                }deg, rgba(255,255,255,0.18) 0)`,
              }}
            />
            <span className='absolute text-[9px] font-semibold tracking-wider text-white/80'>
              360°
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
