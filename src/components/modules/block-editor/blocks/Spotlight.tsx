'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SpotlightContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface SpotlightProps {
  content: SpotlightContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Spotlight — section tối, đèn rọi radial bám chuột (CSS mask + mousemove cập
 * nhật CSS var), chữ mờ chỉ sáng vùng đèn quét qua. Port pattern Spotlight
 * (CodeGrid aug2025/oct2025/sept2025). Desktop; touch → đèn ở giữa tĩnh.
 */
export function Spotlight({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: SpotlightProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const lines = Array.isArray(content.lines) ? content.lines : [];
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const move = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      root.style.setProperty('--mx', `${e.clientX - r.left}px`);
      root.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    root.addEventListener('pointermove', move);
    return () => root.removeEventListener('pointermove', move);
  }, []);

  return (
    <div
      ref={rootRef}
      style={
        {
          ...blockBackgroundStyle(background),
          '--mx': '50%',
          '--my': '50%',
        } as React.CSSProperties
      }
      className={cn(
        'animate-in fade-in @container relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden rounded-md bg-[#08090c] px-6 py-16 duration-500 ease-out',
        className
      )}
    >
      {/* Lớp sáng theo đèn rọi */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 opacity-70'
        style={{
          background:
            'radial-gradient(260px circle at var(--mx) var(--my), rgba(255,255,255,0.14), transparent 60%)',
        }}
      />
      <div
        data-element-key='title'
        style={styleOf('title')}
        className={selectableClass(
          activeKey === 'title',
          'relative z-10 max-w-3xl text-center text-3xl font-bold tracking-tight text-white/35 @2xl:text-5xl'
        )}
      >
        {lines.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>
    </div>
  );
}
