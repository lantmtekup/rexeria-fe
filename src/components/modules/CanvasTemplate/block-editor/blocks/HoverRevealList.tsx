'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HoverRevealListContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface HoverRevealListProps {
  content: HoverRevealListContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Hover Reveal List — port từ CodeGrid "link hover image" (001_…, GSAP). Danh
 * sách tên dự án dạng chữ lớn; hover vào dòng nào thì ảnh preview hiện ra & bay
 * bám theo con trỏ (lerp qua duration GSAP).
 *
 * Khác bản gốc: ảnh preview `absolute` TRONG block (không position:fixed) +
 * toạ độ tương đối root → an toàn khi block nằm trong trang cuộn/transform.
 * Tôn trọng reduced-motion.
 */
export function HoverRevealList({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HoverRevealListProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const rootRef = React.useRef<HTMLDivElement>(null);
  const previewRef = React.useRef<HTMLImageElement>(null);
  const items = React.useMemo(() => content.items ?? [], [content.items]);

  React.useEffect(() => {
    const root = rootRef.current;
    const preview = previewRef.current;
    if (!root || !preview) return;
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (reduce) return;

    const rows = Array.from(
      root.querySelectorAll<HTMLElement>('[data-hrl-row]')
    );
    const cleanups: (() => void)[] = [];

    rows.forEach(row => {
      const src = row.dataset.hrlSrc ?? '';
      const onEnter = () => {
        preview.src = src;
        gsap.killTweensOf(preview);
        gsap.set(preview, { autoAlpha: 0, scale: 0.8, rotation: -12 });
        gsap.to(preview, {
          autoAlpha: 1,
          scale: 1,
          rotation: 0,
          duration: 0.5,
          ease: 'expo.out',
        });
      };
      const onLeave = () => {
        gsap.to(preview, {
          autoAlpha: 0,
          scale: 0.8,
          rotation: -12,
          duration: 0.4,
          ease: 'expo.out',
        });
      };
      const onMove = (e: PointerEvent) => {
        const rect = root.getBoundingClientRect();
        const pr = preview.getBoundingClientRect();
        gsap.to(preview, {
          duration: 1.1,
          ease: 'expo.out',
          x: e.clientX - rect.left - pr.width / 2,
          y: e.clientY - rect.top - pr.height / 2,
        });
      };
      row.addEventListener('pointerenter', onEnter);
      row.addEventListener('pointerleave', onLeave);
      row.addEventListener('pointermove', onMove);
      cleanups.push(() => {
        row.removeEventListener('pointerenter', onEnter);
        row.removeEventListener('pointerleave', onLeave);
        row.removeEventListener('pointermove', onMove);
      });
    });

    return () => cleanups.forEach(fn => fn());
  }, [items]);

  return (
    <div
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container relative flex min-h-[70vh] w-full flex-col justify-center overflow-hidden rounded-md bg-[#0e1a16] px-8 py-12 duration-500 ease-out',
        className
      )}
    >
      {/* Ảnh preview bám chuột. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={previewRef}
        alt=''
        className='pointer-events-none invisible absolute top-0 left-0 z-[1] h-64 w-96 rounded-lg object-cover opacity-0 shadow-2xl'
      />

      {content.title && (
        <h2
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'text-2xs relative z-[2] mb-6 font-semibold tracking-[0.32em] text-white/45 uppercase'
          )}
        >
          {content.title}
        </h2>
      )}

      <ul className='relative z-[2] flex flex-col'>
        {items.map((it, i) => (
          <li
            key={i}
            data-hrl-row
            data-hrl-src={it.imageUrl}
            className='cursor-pointer border-b border-white/10 py-3 text-3xl font-bold tracking-tight text-white/80 uppercase transition-colors hover:text-[#c24628] @2xl:text-5xl'
          >
            {it.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
