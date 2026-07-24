'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerRealEstate02MapContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface Props {
  content: FramerRealEstate02MapContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const COLORS = {
  bg: '#e9e4dc',
  markerFill: '#565440',
  markerAccent: '#e9e4dc',
} as const;

const MARKER_BOB_DISTANCE = 5;
const MARKER_BOB_DURATION = 1.05;
const MARKER_BOB_EASE = 'sine.inOut';

const ROOT_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: '#565440',
};

const CARD_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: '375px',
  aspectRatio: '375 / 359',
  overflow: 'hidden',
  backgroundColor: COLORS.bg,
};

const MAP_IMAGE_STYLE: React.CSSProperties = {
  display: 'block',
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  objectPosition: 'center',
};

const MARKER_WRAP_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '41.06%',
  top: '36.82%',
  width: '16.53%',
  height: '20.06%',
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function FramerRealEstate02Map({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const markerRef = React.useRef<SVGSVGElement>(null);

  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(rootRef, () => {
    if (isCanvas) return;
    const marker = markerRef.current;
    if (!marker) return;

    if (prefersReducedMotion()) {
      gsap.set(marker, { y: 0 });
      return;
    }

    gsap.to(marker, {
      y: MARKER_BOB_DISTANCE,
      duration: MARKER_BOB_DURATION,
      ease: MARKER_BOB_EASE,
      repeat: -1,
      yoyo: true,
    });
  }, [isCanvas]);

  return (
    <section
      ref={rootRef}
      data-block='framer-realestate02-map'
      style={{ ...ROOT_STYLE, ...blockBackgroundStyle(background) }}
      className={cn('frem-root', className)}
    >
      <div style={CARD_STYLE} className='frem-card @container'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={content.mapImageUrl}
          alt=''
          data-element-key='mapImageUrl'
          style={composeStyle(MAP_IMAGE_STYLE, styleOf('mapImageUrl'))}
          className={selectableClass(activeKey === 'mapImageUrl')}
        />

        <div style={MARKER_WRAP_STYLE} aria-hidden='true'>
          <svg
            ref={markerRef}
            viewBox='0 0 62 72'
            width='100%'
            height='100%'
            style={{ overflow: 'visible', display: 'block' }}
          >
            <path
              d='M 30.553 69.724 L 31 70.618 L 31.447 69.724 L 35.472 61.675 C 50.197 59.511 61.5 46.826 61.5 31.5 C 61.5 14.655 47.845 1 31 1 C 14.155 1 0.5 14.655 0.5 31.5 C 0.5 46.826 11.803 59.511 26.528 61.675 Z'
              fill={COLORS.markerFill}
              stroke={COLORS.markerAccent}
              strokeMiterlimit={10}
            />
            <g transform='translate(20.518 23)'>
              <path
                d='M 0 17.367 L 0 0 L 23.351 0 L 23.351 17.367 Z'
                fill='transparent'
              />
              <path
                d='M 6.854 5.984 L 0 5.984 L 0 17.367 L 6.854 17.367 Z'
                fill={COLORS.markerAccent}
              />
              <path
                d='M 16.498 5.985 L 6.854 5.985 L 0 0.012 L 9.643 0.012 Z'
                fill={COLORS.markerAccent}
              />
              <path
                d='M 23.351 17.364 L 13.708 17.364 L 6.853 11.391 L 16.497 11.391 Z'
                fill={COLORS.markerAccent}
              />
              <path
                d='M 16.498 0 L 16.498 11.462 C 17.974 11.396 19.368 10.764 20.389 9.696 C 21.41 8.628 21.98 7.208 21.98 5.731 C 21.98 4.253 21.41 2.833 20.389 1.765 C 19.368 0.698 17.974 0.066 16.498 0 Z'
                fill={COLORS.markerAccent}
              />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
