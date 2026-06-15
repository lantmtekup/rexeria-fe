'use client';

import * as React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SvgMorphOverlayContent,
} from '../types';
import { blockBackgroundStyle, selectableClass } from './applyStyle';

gsap.registerPlugin(useGSAP);

interface SvgMorphOverlayProps {
  content: SvgMorphOverlayContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const D_CLOSED = 'M 0 100 V 100 Q 50 100 100 100 V 100 z';
const D_CURVE = 'M 0 100 V 50 Q 50 0 100 50 V 100 z';
const D_FLAT = 'M 0 100 V 0 Q 50 0 100 0 V 100 z';

/**
 * SVG Morph Overlay — port từ CodeGrid "product slider svg morph" (038_…, GSAP).
 * Bấm nút → tấm màu dâng từ đáy dạng sóng cong (morph attr `d`) rồi duỗi phẳng,
 * lộ lưới sản phẩm bên trong; bấm Đóng thì đảo ngược.
 *
 * Timeline `paused` toggle bằng `reversed()`. Tôn trọng reduced-motion.
 */
export function SvgMorphOverlay({
  content,
  background,
  activeKey,
  className,
}: SvgMorphOverlayProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const tlRef = React.useRef<gsap.core.Timeline | null>(null);
  const images = content.images ?? [];
  const overlayColor = content.overlayColor ?? '#36301d';

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const path = root.querySelector('.smo-path');
      const wines = root.querySelector('.smo-wines');
      const blocks = root.querySelectorAll('.smo-block');
      const tl = gsap.timeline({ paused: true });
      tl.set(wines, { autoAlpha: 1 })
        .to(path, { attr: { d: D_CURVE }, duration: 0.7, ease: 'power3.in' })
        .to(path, { attr: { d: D_FLAT }, duration: 0.4, ease: 'power3.out' })
        .from(
          blocks,
          {
            clipPath: 'inset(0 100% 0 0)',
            duration: 0.9,
            stagger: 0.12,
            ease: 'power4.out',
          },
          '-=0.2'
        )
        .reverse();
      tlRef.current = tl;
    },
    { scope: rootRef, dependencies: [images] }
  );

  const toggle = () => {
    const tl = tlRef.current;
    if (!tl) return;
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (reduce) tl.progress(tl.reversed() ? 1 : 0);
    tl.reversed(!tl.reversed());
  };

  return (
    <div
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden rounded-md bg-neutral-800 duration-500 ease-out',
        className
      )}
    >
      {content.title && (
        <h2
          data-element-key='title'
          className={selectableClass(
            activeKey === 'title',
            'relative z-[1] max-w-xl px-6 text-center text-3xl font-semibold tracking-tight text-white @2xl:text-5xl'
          )}
        >
          {content.title}
        </h2>
      )}

      {/* Overlay SVG morph + lưới sản phẩm. */}
      <svg
        className='pointer-events-none absolute inset-0 h-full w-full'
        viewBox='0 0 100 100'
        preserveAspectRatio='none'
      >
        <path className='smo-path' fill={overlayColor} d={D_CLOSED} />
      </svg>
      <div className='smo-wines invisible absolute inset-0 z-[2] flex items-center justify-center gap-4 px-8'>
        {images.slice(0, 4).map((src, i) => (
          <div
            key={i}
            className='smo-block h-56 w-40 overflow-hidden rounded-lg @2xl:h-72 @2xl:w-52'
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt='' className='h-full w-full object-cover' />
          </div>
        ))}
      </div>

      <button
        type='button'
        onClick={toggle}
        className='absolute bottom-5 z-[3] rounded-full bg-white px-6 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-white/90'
      >
        {content.toggleLabel ?? 'Catalog'}
      </button>
    </div>
  );
}
