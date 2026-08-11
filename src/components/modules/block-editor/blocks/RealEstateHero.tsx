'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type { RealEstateHeroContent } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { FONT_BODY, FONT_CSS, FONT_HEADING, SAND } from './realEstateFonts';
import { useContainerMobile } from './useContainerMobile';

const SCRIM = 'linear-gradient(0deg, #000000e6 7.5%, #0000 84%)';

const PARALLAX_FACTOR = 0.4;

/**
 * Hai tier layout. `mobile` (<672) giữ tỉ lệ 372/454 + hàng stats canh giữa
 * như Framer; cột full bề rộng khung (bỏ `RE_CONTENT_W`).
 *
 * `wide` (≥672): full-bleed `min-h-[100dvh]`, parallax + scrim giữ nguyên;
 * 3 stats dồn góc dưới trái (asymmetric) thay vì center parade. Clamp
 * `N = maxPx / 1440 * 100`. Nhánh JS + composeStyle — không `!important`.
 */
const TIER = {
  mobile: {
    column: 'aspect-[372/454]',
    columnWidth: '100%',
    scrimH: '86.8%',
    statsBottom: '8.3cqi', // 30.9px @372
    statsLeft: '50%' as const,
    statsTransform: 'translateX(-50%)' as const,
    statsGap: '10.6cqi', // 39.4px @372
    statsAlign: 'center' as const,
    labelSize: '2.15cqi', // 8px @372
    valueSize: '3.76cqi', // 14px @372
  },
  wide: {
    column: 'min-h-[100dvh]',
    columnWidth: '100%',
    // Hero cao 100dvh: giữ 86.8% thì scrim phủ gần hết ảnh.
    scrimH: '50%',
    statsBottom: 'clamp(48px, 5cqi, 72px)',
    // Pad ngang đồng bộ family section (Location / Info).
    statsLeft: 'clamp(24px, 5.5cqi, 80px)',
    statsTransform: 'none' as const,
    statsGap: 'clamp(40px, 4.5cqi, 72px)',
    statsAlign: 'start' as const,
    labelSize: 'clamp(12px, 1.04cqi, 15px)',
    valueSize: 'clamp(24px, 2.36cqi, 34px)',
  },
} as const;

export function RealEstateHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<RealEstateHeroContent>) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const tier = isMobile ? TIER.mobile : TIER.wide;

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(rootRef, ({ scroller, requestRefresh }) => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const img = root.querySelector<HTMLImageElement>('.re-hero-image');
    if (!img) return;

    gsap.fromTo(
      img,
      { y: 0 },
      {
        y: () => PARALLAX_FACTOR * root.offsetHeight,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );

    if (!img.complete)
      img.addEventListener('load', requestRefresh, { once: true });
  });

  return (
    <div
      ref={rootRef}
      style={composeStyle(
        { backgroundColor: SAND },
        blockBackgroundStyle(background)
      )}
      className={cn('@container w-full', className)}
    >
      <style>{FONT_CSS}</style>

      <div
        className={cn(
          '@container relative mx-auto overflow-hidden',
          tier.column
        )}
        style={{ width: tier.columnWidth }}
      >
        <div
          data-element-key='imageUrl'
          className={cn(
            selectableClass(activeKey === 'imageUrl'),
            'absolute inset-0 overflow-hidden'
          )}
          style={styleOf('imageUrl')}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.imageUrl}
            alt=''
            className='re-hero-image absolute inset-0 h-full w-full object-cover'
            style={{ willChange: 'transform' }}
          />
        </div>

        <div
          aria-hidden
          className='pointer-events-none absolute right-0 bottom-px left-0'
          style={{ background: SCRIM, height: tier.scrimH }}
        />

        <div
          className='absolute flex w-min flex-row flex-nowrap items-start'
          style={{
            bottom: tier.statsBottom,
            left: tier.statsLeft,
            transform: tier.statsTransform,
            gap: tier.statsGap,
          }}
        >
          {(content.stats ?? []).map((stat, i) => {
            const labelKey = `stats[${i}].label`;
            const valueKey = `stats[${i}].value`;
            return (
              <div
                key={i}
                className={cn(
                  'flex flex-col whitespace-pre',
                  tier.statsAlign === 'start' ? 'items-start' : 'items-center'
                )}
              >
                <span
                  data-element-key={labelKey}
                  className={selectableClass(activeKey === labelKey)}
                  style={composeStyle(
                    {
                      fontFamily: FONT_BODY,
                      fontSize: tier.labelSize,
                      lineHeight: 2.218,
                      letterSpacing: '0.03em',
                      color: 'rgb(255, 255, 255)',
                      textAlign: tier.statsAlign,
                    },
                    styleOf(labelKey)
                  )}
                >
                  {stat.label}
                </span>
                <span
                  data-element-key={valueKey}
                  className={selectableClass(activeKey === valueKey)}
                  style={composeStyle(
                    {
                      fontFamily: FONT_HEADING,
                      fontSize: tier.valueSize,
                      lineHeight: 1.2675,
                      letterSpacing: '0.03em',
                      color: 'rgb(255, 255, 255)',
                      fontWeight: 400,
                      textAlign: tier.statsAlign,
                    },
                    styleOf(valueKey)
                  )}
                >
                  {stat.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
