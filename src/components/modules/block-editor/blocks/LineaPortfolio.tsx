'use client';

/**
 * Data-block "Linea · Portfolio" (port từ 360-admin-cms linea-portfolio).
 *
 * Theo contract nền GSAP: header fade-up qua useBlockMotion (reveal theo scroll,
 * thay IntersectionObserver gốc); ticker 3 cột (giữa cuộn xuống, 2 bên cuộn lên)
 * giữ CSS keyframes (ambient marquee, không phải scroll-anim). @container +
 * data-element-key cho inline-edit.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  LineaPortfolioContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface Props {
  content: LineaPortfolioContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function LineaPortfolio({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const items = content.items ?? [];
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(rootRef, ({ scroller }) => {
    const root = rootRef.current;
    if (!root) return;
    const header = root.querySelector<HTMLElement>('.linea-header');
    if (header) {
      gsap.fromTo(
        header,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: header,
            scroller,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );
    }
  });

  return (
    <section
      ref={rootRef}
      style={{
        position: 'relative',
        background: content.bgColor || '#ffffff',
        color: content.textColor || '#121212',
        ...blockBackgroundStyle(background),
      }}
      className='linea-portfolio @container w-full px-5 py-[clamp(20px,2.5cqi,48px)] @2xl:px-20'
    >
      <div className='mx-auto max-w-[1280px]'>
        {/* Header — eyebrow + heading (fade-up qua useBlockMotion) */}
        <div className='linea-header flex flex-col items-center gap-4 text-center'>
          <span
            data-element-key='eyebrow'
            style={{
              fontFamily: '"Manrope", "Inter", sans-serif',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: '#616161',
              ...styleOf('eyebrow'),
            }}
            className={selectableClass(activeKey === 'eyebrow', 'inline-block')}
          >
            {content.eyebrow}
          </span>
          <h2
            className='m-0'
            style={{
              fontFamily: '"Manrope", "Inter", sans-serif',
              fontSize: 'clamp(36px, 6.5cqi, 88px)',
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            <span
              data-element-key='headingPre'
              style={styleOf('headingPre')}
              className={selectableClass(activeKey === 'headingPre', 'inline')}
            >
              {content.headingPre + ' '}
            </span>
            <span
              data-element-key='headingAccent'
              style={{
                fontFamily: '"Instrument Serif", Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                ...styleOf('headingAccent'),
              }}
              className={selectableClass(
                activeKey === 'headingAccent',
                'inline'
              )}
            >
              {content.headingAccent}
            </span>
            <span
              data-element-key='headingPost'
              style={styleOf('headingPost')}
              className={selectableClass(activeKey === 'headingPost', 'inline')}
            >
              {' ' + content.headingPost}
            </span>
          </h2>
        </div>

        {/* Ticker — 3 cột, giữa cuộn xuống, 2 bên cuộn lên (ambient CSS) */}
        <div
          data-element-key='items'
          className={selectableClass(
            activeKey === 'items',
            'linea-ticker mt-[clamp(16px,2cqi,32px)] grid grid-cols-3 gap-4 overflow-hidden'
          )}
          style={{ height: 'min(80vh, 720px)' }}
        >
          {[0, 1, 2].map(colIdx => {
            const colItems = items
              .map((it, idx) => ({ it, idx }))
              .filter(({ idx }) => idx % 3 === colIdx);
            const doubled = [...colItems, ...colItems];
            return (
              <div
                key={colIdx}
                className='linea-ticker-col flex flex-col gap-4'
                style={{
                  animation: `linea-ticker-${colIdx === 1 ? 'down' : 'up'} 30s linear infinite`,
                }}
              >
                {doubled.map(({ it, idx }, dupIdx) => (
                  <div
                    key={`${colIdx}-${idx}-${dupIdx}`}
                    className='aspect-square w-full shrink-0 overflow-hidden rounded-[15px]'
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.img}
                      alt=''
                      loading='lazy'
                      decoding='async'
                      className='block h-full w-full rounded-[15px] object-cover'
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes linea-ticker-up { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        @keyframes linea-ticker-down { from { transform: translateY(-50%); } to { transform: translateY(0); } }
        .linea-ticker:hover .linea-ticker-col { animation-play-state: paused; }
        @container (max-width: 559px) {
          .linea-ticker { grid-template-columns: 1fr !important; }
          .linea-ticker-col:nth-child(n+2) { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .linea-ticker-col { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
