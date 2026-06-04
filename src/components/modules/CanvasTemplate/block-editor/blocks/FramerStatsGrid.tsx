'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerStatsGridContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerStatsGridProps {
  content: FramerStatsGridContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Stats Grid (framer-stats-grid): ảnh nền full-bleed + overlay tối +
 * lưới 4 cột thống kê (số serif trắng + nhãn). Không có animation đếm số —
 * canvas editor hiển thị tĩnh.
 */

const VALUE_STYLE: React.CSSProperties = {
  fontFamily: '"Georgia", "Times New Roman", serif',
  fontSize: 'clamp(32px, 6cqi, 80px)',
  fontWeight: 700,
  lineHeight: 1,
  letterSpacing: '-0.02em',
  color: '#ffffff',
  margin: 0,
};

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(11px, 1.1cqi, 15px)',
  fontWeight: 400,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.65)',
  margin: 0,
  marginTop: '0.35em',
};

export function FramerStatsGrid({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerStatsGridProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const stats = content.stats ?? [];

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative flex min-h-[clamp(280px,50cqi,560px)] w-full flex-col overflow-hidden rounded-md bg-[#111111] duration-700 ease-out',
        className
      )}
    >
      {/* Background image */}
      <div
        data-element-key='backgroundUrl'
        style={composeStyle(
          content.backgroundUrl
            ? {
                backgroundImage: `url("${content.backgroundUrl.replace(/"/g, '%22')}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined,
          styleOf('backgroundUrl')
        )}
        className={selectableClass(
          activeKey === 'backgroundUrl',
          'absolute inset-0'
        )}
      />
      {/* Dark overlay */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.45)_100%)]'
      />

      {/* Stats grid */}
      <div
        className='relative z-[2] grid w-full flex-1 items-center px-[clamp(24px,5cqi,80px)] py-[clamp(40px,8cqi,100px)]'
        style={{
          gridTemplateColumns: `repeat(${Math.min(stats.length || 4, 4)}, minmax(0, 1fr))`,
          gap: 'clamp(16px,3cqi,48px)',
        }}
      >
        {stats.map((stat, i) => {
          const valueKey = `stat_${i}_value`;
          const labelKey = `stat_${i}_label`;
          return (
            <div key={i} className='flex flex-col items-start'>
              <p
                data-element-key={valueKey}
                style={composeStyle(VALUE_STYLE, styleOf(valueKey))}
                className={selectableClass(activeKey === valueKey)}
              >
                {stat.value}
              </p>
              <p
                data-element-key={labelKey}
                style={composeStyle(LABEL_STYLE, styleOf(labelKey))}
                className={selectableClass(activeKey === labelKey)}
              >
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
