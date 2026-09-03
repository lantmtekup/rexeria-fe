'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type { RealEstateUtilitiesContent } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import {
  BROWN,
  FONT_BODY,
  FONT_HEADING,
  RE_SECTION_GAP,
  FONT_CSS,
} from './realEstateFonts';
import { useContainerMobile } from './useContainerMobile';

/**
 * Hai tier layout. `mobile` (<672) giữ tỉ lệ cqi từ canvas Framer 372px, cột
 * full bề rộng khung (bỏ `RE_CONTENT_W`) — lưới 2×3.
 *
 * `wide` (≥672) lưới 3×2, pad + maxWidth 1120, clamp title/icon/label/card.
 * Nhánh JS + composeStyle — không `@container { !important }`.
 */
const TIER = {
  mobile: {
    section: {
      paddingTop: RE_SECTION_GAP,
      paddingBottom: RE_SECTION_GAP,
    } as React.CSSProperties,
    innerW: '87.1cqi',
    contentMax: 'none' as const,
    cols: 2,
    title: '6.18cqi', // 23px @372
    gridMt: '10.6cqi',
    gap: '3.18cqi',
    icon: '26.6cqi',
    label: '3.23cqi',
    labelMt: '6.18cqi',
    cardPadY: '6.45cqi',
    cardRadius: '1.08cqi',
  },
  wide: {
    section: {
      paddingTop: 'clamp(40px, 3.5cqi, 56px)',
      paddingBottom: 'clamp(88px, 8.3cqi, 120px)',
      paddingInline: 'clamp(24px, 5.5cqi, 80px)',
    } as React.CSSProperties,
    innerW: '100%',
    contentMax: 1120,
    cols: 3,
    title: 'clamp(28px, 2.9cqi, 42px)',
    gridMt: 'clamp(40px, 3.5cqi, 56px)',
    gap: 'clamp(16px, 1.8cqi, 24px)',
    icon: 'clamp(64px, 6.5cqi, 96px)',
    label: 'clamp(13px, 1.05cqi, 15px)',
    labelMt: 'clamp(14px, 1.25cqi, 20px)',
    cardPadY: 'clamp(24px, 2.5cqi, 36px)',
    cardRadius: 12,
  },
} as const;

export function RealEstateUtilities({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<RealEstateUtilitiesContent>) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const tier = isMobile ? TIER.mobile : TIER.wide;
  const cols = tier.cols;
  const items = Array.isArray(content.items) ? content.items : [];

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const title = root.querySelector('[data-appear="title"]');
      const cards = root.querySelectorAll<HTMLElement>('[data-appear="card"]');

      gsap.fromTo(
        title,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );

      cards.forEach((card, i) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            scroller,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(
          card,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
          (i % cols) * 0.12
        );
      });

      root.querySelectorAll('img').forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });
    },
    [cols, items.length]
  );

  return (
    <div
      ref={rootRef}
      style={composeStyle(
        { backgroundColor: '#fff' },
        blockBackgroundStyle(background)
      )}
      className={cn('@container w-full', className)}
    >
      <style>{FONT_CSS}</style>

      <div className='@container mx-auto' style={{ width: '100%' }}>
        <div
          className='mx-auto'
          style={{
            ...tier.section,
            width: tier.innerW,
            maxWidth: tier.contentMax,
          }}
        >
          <h2
            data-appear='title'
            data-element-key='title'
            className={cn(
              selectableClass(activeKey === 'title'),
              'text-center'
            )}
            style={composeStyle(
              {
                fontFamily: FONT_BODY,
                fontSize: tier.title,
                lineHeight: 1.372,
                color: BROWN,
                fontWeight: 400,
              },
              styleOf('title')
            )}
          >
            {content.title}
          </h2>

          <div
            className={cn('grid', cols === 3 ? 'grid-cols-3' : 'grid-cols-2')}
            style={{
              marginTop: tier.gridMt,
              gap: tier.gap,
            }}
          >
            {items.map((item, i) => {
              const iconKey = `items[${i}].iconUrl`;
              const labelKey = `items[${i}].label`;
              return (
                <div
                  key={i}
                  data-appear='card'
                  data-element-key='cardSurface'
                  className={cn(
                    selectableClass(activeKey === 'cardSurface'),
                    'flex flex-col items-center'
                  )}
                  style={composeStyle(
                    {
                      border: '1px solid rgba(116, 96, 74, 0.2)',
                      borderRadius: tier.cardRadius,
                      paddingTop: tier.cardPadY,
                      paddingBottom: tier.cardPadY,
                    },
                    styleOf('cardSurface')
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    data-element-key={iconKey}
                    src={item.iconUrl}
                    alt=''
                    aria-hidden
                    className={selectableClass(activeKey === iconKey)}
                    style={composeStyle(
                      {
                        width: tier.icon,
                        height: 'auto',
                        objectFit: 'contain',
                      },
                      styleOf(iconKey)
                    )}
                  />

                  <p
                    data-element-key={labelKey}
                    className={cn(
                      selectableClass(activeKey === labelKey),
                      'w-full text-center whitespace-pre-line'
                    )}
                    style={composeStyle(
                      {
                        fontFamily: FONT_HEADING,
                        fontSize: tier.label,
                        lineHeight: 1.479,
                        color: BROWN,
                        fontWeight: 400,
                        marginTop: tier.labelMt,
                      },
                      styleOf(labelKey)
                    )}
                  >
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
