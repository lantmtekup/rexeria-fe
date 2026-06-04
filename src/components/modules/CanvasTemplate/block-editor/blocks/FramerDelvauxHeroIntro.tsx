'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerDelvauxHeroIntroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerDelvauxHeroIntroProps {
  content: FramerDelvauxHeroIntroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Delvaux Hero Intro — storefront → product reveal.
 * Port từ `src/blocks/delvaux-hero-intro`: 2 panels xếp chồng,
 * storefront full-bleed trên + product centered dưới.
 * Dùng mount-animation thay IntersectionObserver; responsive bằng
 * container-query, không dùng viewport breakpoints.
 */
const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

export function FramerDelvauxHeroIntro({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerDelvauxHeroIntroProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative flex w-full flex-col overflow-hidden rounded-md duration-700 ease-out',
        className
      )}
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .dx-panel { transition: none !important; }
        }
      `}</style>

      {/* Panel 1 — storefront full-bleed */}
      <div
        data-element-key='storefrontImageUrl'
        style={composeStyle(
          {
            position: 'relative',
            width: '100%',
            minHeight: 'clamp(320px, 80cqi, 700px)',
            overflow: 'hidden',
          },
          content.storefrontImageUrl
            ? {
                backgroundImage: `url("${content.storefrontImageUrl.replace(/"/g, '%22')}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : { backgroundColor: '#f5f5f5' },
          styleOf('storefrontImageUrl')
        )}
        className={selectableClass(
          activeKey === 'storefrontImageUrl',
          'dx-panel'
        )}
      />

      {/* Panel 2 — product centered on light bg */}
      <div
        style={{ position: 'relative', width: '100%', background: '#f5f5f5' }}
      >
        <div
          data-element-key='productImageUrl'
          style={composeStyle(
            {
              width: '100%',
              minHeight: 'clamp(320px, 80cqi, 700px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            },
            content.productImageUrl
              ? {
                  backgroundImage: `url("${content.productImageUrl.replace(/"/g, '%22')}")`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }
              : undefined,
            styleOf('productImageUrl')
          )}
          className={selectableClass(
            activeKey === 'productImageUrl',
            'dx-panel'
          )}
          aria-label={content.productAlt || 'Product image'}
        >
          {!content.productImageUrl && content.productAlt && (
            <span
              data-element-key='productAlt'
              style={composeStyle(
                {
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: 'clamp(14px, 2cqi, 20px)',
                  color: '#999',
                  transition: `opacity 1.4s ${EASE_EXPO}`,
                },
                styleOf('productAlt')
              )}
              className={selectableClass(activeKey === 'productAlt')}
            >
              {content.productAlt}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
