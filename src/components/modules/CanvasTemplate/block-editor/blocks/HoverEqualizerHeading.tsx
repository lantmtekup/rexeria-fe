'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HoverEqualizerHeadingContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface HoverEqualizerHeadingProps {
  content: HoverEqualizerHeadingContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Hover Equalizer Heading — port từ CodeGrid "text hover effect" (049_…,
 * vanilla CSS transition). Rê con trỏ qua tiêu đề lớn → ký tự đang trỏ giãn cao
 * (scaleY), hai ký tự kề bên giãn nhẹ, tạo gợn sóng như thanh equalizer.
 *
 * Toàn bộ độ mượt do CSS transition lo; JS chỉ đổi giá trị scaleY đích. Tôn
 * trọng reduced-motion.
 */
export function HoverEqualizerHeading({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HoverEqualizerHeadingProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const headRef = React.useRef<HTMLHeadingElement>(null);
  const heading = content.heading ?? '';
  const peak = content.peak ?? 2.2;
  const neighbor = content.neighbor ?? 1.6;

  React.useEffect(() => {
    const head = headRef.current;
    if (!head) return;
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (reduce) return;

    const chars = Array.from(head.querySelectorAll<HTMLElement>('[data-heq]'));
    const apply = (active: number) => {
      chars.forEach((c, i) => {
        let s = 1;
        if (i === active) s = peak;
        else if (i === active - 1 || i === active + 1) s = neighbor;
        c.style.transform = `scaleY(${s})`;
      });
    };
    const onMove = (e: PointerEvent) => {
      const idx = chars.indexOf(e.target as HTMLElement);
      if (idx >= 0) apply(idx);
    };
    const onLeave = () => apply(-1);
    head.addEventListener('pointermove', onMove);
    head.addEventListener('pointerleave', onLeave);
    return () => {
      head.removeEventListener('pointermove', onMove);
      head.removeEventListener('pointerleave', onLeave);
    };
  }, [heading, peak, neighbor]);

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container flex min-h-[70vh] w-full items-end justify-center overflow-hidden rounded-md bg-[#17131f] px-6 pb-10 duration-500 ease-out',
        className
      )}
    >
      <h2
        ref={headRef}
        data-element-key='heading'
        style={styleOf('heading')}
        className={selectableClass(
          activeKey === 'heading',
          'flex flex-wrap text-5xl font-extrabold tracking-tight text-white uppercase @2xl:text-8xl'
        )}
      >
        {Array.from(heading).map((ch, i) =>
          ch === ' ' ? (
            <span key={i} className='inline-block w-[0.25em]' />
          ) : (
            <span
              key={i}
              data-heq
              className='inline-block origin-bottom transition-transform duration-[400ms] ease-out'
            >
              {ch}
            </span>
          )
        )}
      </h2>
    </div>
  );
}
