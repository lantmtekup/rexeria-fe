'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MarqueeBandContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface MarqueeBandProps {
  content: MarqueeBandContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Marquee Band — dải chữ lớn chạy ngang vô tận (port CodeGrid contact/marquee).
 * Thuần CSS keyframe, không JS. `prefers-reduced-motion` → đứng yên (CSS).
 */
export function MarqueeBand({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: MarqueeBandProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const text = content.text ?? '';
  const sep = content.separator ?? ' · ';
  const seconds = content.seconds ?? 24;
  const unit = `${text}${sep}`;

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in relative flex w-full items-center overflow-hidden rounded-md bg-[#0f1219] py-10 duration-500 ease-out',
        className
      )}
    >
      <div
        data-element-key='text'
        style={{
          ...styleOf('text'),
          animation: `mqb ${seconds}s linear infinite`,
        }}
        className={selectableClass(
          activeKey === 'text',
          'flex shrink-0 text-5xl font-extrabold tracking-tight whitespace-nowrap text-white uppercase @2xl:text-7xl'
        )}
      >
        <span className='shrink-0'>{unit.repeat(6)}</span>
        <span className='shrink-0' aria-hidden>
          {unit.repeat(6)}
        </span>
      </div>
      <style>{`@media(prefers-reduced-motion:reduce){[style*="mqb"]{animation:none!important}}@keyframes mqb{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
