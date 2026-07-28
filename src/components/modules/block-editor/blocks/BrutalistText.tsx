'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import { useMotionAttributes } from '../motion/useMotionAttributes';
import type {
  BlockBackground,
  BrutalistTextContent,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface BrutalistTextProps {
  content: BrutalistTextContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Opacity trail: ghost gần primary → xa (0.6 → 0.12). */
const DEFAULT_ECHO_OPACITIES = [0.6, 0.3, 0.12] as const;

const ROOT_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  minHeight: '70vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  containerType: 'inline-size',
  backgroundColor: '#000000',
  padding: 'clamp(2rem, 8cqi, 5rem) clamp(1.5rem, 6cqi, 4rem)',
};

const STACK_STYLE: React.CSSProperties = {
  position: 'relative',
  display: 'inline-block',
  textAlign: 'center',
};

const LAYER_BASE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  fontSize: 'clamp(2.5rem, 14cqi, 7.5rem)',
  fontWeight: 800,
  lineHeight: 0.88,
  letterSpacing: '-0.02em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

/**
 * Brutalist Text — tiêu đề uppercase đậm với trail echo opacity xếp chồng
 * (reference: chữ trắng trên nền đen, 3 ghost layer mờ dần phía dưới).
 *
 * Motion: `echo-reveal` trên stack — các `[data-echo-layer]` stagger từ dưới lên.
 */
export function BrutalistText({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BrutalistTextProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  useMotionAttributes(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const heading = content.heading ?? 'BRUTALISM';
  const echoCount = Math.max(0, Math.min(6, content.echoCount ?? 3));
  const layerStep = content.layerStep ?? 0.09;
  const textColor = content.textColor ?? '#FFFFFF';

  const echoes = Array.from({ length: echoCount }, (_, idx) => {
    const opacity =
      content.echoOpacities?.[idx] ??
      DEFAULT_ECHO_OPACITIES[idx] ??
      DEFAULT_ECHO_OPACITIES[DEFAULT_ECHO_OPACITIES.length - 1];
    const offsetEm = (idx + 1) * layerStep;
    return { opacity, offsetEm };
  });

  return (
    <div
      ref={rootRef}
      style={{
        ...blockBackgroundStyle(background),
        ...ROOT_STYLE,
        ...(content.bgColor ? { backgroundColor: content.bgColor } : {}),
      }}
      className={cn('@container w-full', className)}
    >
      <div
        data-motion='echo-reveal'
        data-motion-distance='28'
        data-motion-stagger='0.07'
        style={{
          ...STACK_STYLE,
          paddingBottom: `${echoCount * layerStep}em`,
        }}
        className='relative inline-block text-center'
      >
        {[...echoes].reverse().map((echo, i) => (
          <span
            key={`echo-${i}`}
            aria-hidden
            data-echo-layer
            data-echo-offset={echo.offsetEm}
            data-echo-opacity={echo.opacity}
            style={{
              ...LAYER_BASE,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              color: textColor,
              opacity: echo.opacity,
              transform: `translateY(${echo.offsetEm}em)`,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {heading}
          </span>
        ))}
        <h2
          data-element-key='heading'
          data-echo-layer
          data-echo-offset={0}
          data-echo-opacity={1}
          style={{
            ...LAYER_BASE,
            ...composeStyle({ color: textColor }, styleOf('heading')),
            position: 'relative',
            margin: 0,
            opacity: 1,
            transform: 'translateY(0)',
          }}
          className={selectableClass(activeKey === 'heading', 'relative')}
        >
          {heading}
        </h2>
      </div>
    </div>
  );
}
