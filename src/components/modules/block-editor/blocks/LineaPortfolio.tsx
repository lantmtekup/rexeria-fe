'use client';

/**
 * Linea · Portfolio — eyebrow + split heading + 3-column vertical ticker.
 * Port từ 360-admin-cms linea-portfolio (Path A registry).
 *
 * Canvas: lưới phẳng hiện đủ ảnh để chọn/sửa từng slot. Preview + /p: ticker
 * CSS (giữa xuống, hai bên lên). Header fade-up qua useBlockMotion.
 */
import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type { LineaPortfolioContent } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useIsCanvasEdit } from './useIsCanvasEdit';

const SANS = '"Manrope", "Inter", sans-serif';
const SERIF = '"Instrument Serif", Georgia, serif';

export function LineaPortfolio({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<LineaPortfolioContent>) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isCanvas = useIsCanvasEdit(rootRef);
  const items = Array.isArray(content.items) ? content.items : [];
  const bgColor = content.bgColor || '#ffffff';
  const textColor = content.textColor || '#121212';

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      if (isCanvas) return;
      const root = rootRef.current;
      if (!root) return;
      const header = root.querySelector<HTMLElement>('.linea-header');
      if (!header) return;
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
    },
    [isCanvas]
  );

  const header = (
    <div className='linea-header flex flex-col items-center gap-4 text-center'>
      <span
        data-element-key='eyebrow'
        style={composeStyle(
          {
            fontFamily: SANS,
            fontSize: 'clamp(12px, 1.4cqi, 14px)',
            fontWeight: 500,
            letterSpacing: '0.04em',
            color: '#616161',
          },
          styleOf('eyebrow')
        )}
        className={selectableClass(activeKey === 'eyebrow', 'inline-block')}
      >
        {content.eyebrow}
      </span>
      <h2
        className='m-0'
        style={{
          fontFamily: SANS,
          fontSize: 'clamp(36px, 6.5cqi, 88px)',
          fontWeight: 500,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          color: textColor,
        }}
      >
        <span
          data-element-key='headingPre'
          style={composeStyle(
            {
              fontFamily: SANS,
              fontWeight: 500,
              color: textColor,
            },
            styleOf('headingPre')
          )}
          className={selectableClass(activeKey === 'headingPre', 'inline')}
        >
          {content.headingPre + ' '}
        </span>
        <span
          data-element-key='headingAccent'
          style={composeStyle(
            {
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              color: textColor,
            },
            styleOf('headingAccent')
          )}
          className={selectableClass(activeKey === 'headingAccent', 'inline')}
        >
          {content.headingAccent}
        </span>
        <span
          data-element-key='headingPost'
          style={composeStyle(
            {
              fontFamily: SANS,
              fontWeight: 500,
              color: textColor,
            },
            styleOf('headingPost')
          )}
          className={selectableClass(activeKey === 'headingPost', 'inline')}
        >
          {' ' + content.headingPost}
        </span>
      </h2>
    </div>
  );

  const sectionStyle: React.CSSProperties = {
    position: 'relative',
    background: bgColor,
    color: textColor,
    ...blockBackgroundStyle(background),
  };

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        style={sectionStyle}
        className={cn(
          'linea-portfolio @container w-full px-5 py-[clamp(20px,2.5cqi,48px)] @2xl:px-20',
          className
        )}
      >
        <div className='mx-auto max-w-[1280px]'>
          {header}
          <div
            data-element-key='items'
            className={selectableClass(
              activeKey === 'items',
              'mt-[clamp(16px,2cqi,32px)] grid grid-cols-2 gap-4 @2xl:grid-cols-3'
            )}
            style={styleOf('items')}
          >
            {items.map((it, idx) => {
              const imgKey = `items[${idx}].img`;
              return (
                <div
                  key={idx}
                  className='aspect-square w-full overflow-hidden rounded-[15px]'
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    data-element-key={imgKey}
                    src={it.img}
                    alt=''
                    loading='lazy'
                    decoding='async'
                    style={styleOf(imgKey)}
                    className={selectableClass(
                      activeKey === imgKey,
                      'block h-full w-full rounded-[15px] object-cover'
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      style={sectionStyle}
      className={cn(
        'linea-portfolio @container w-full px-5 py-[clamp(20px,2.5cqi,48px)] @2xl:px-20',
        className
      )}
    >
      <div className='mx-auto max-w-[1280px]'>
        {header}
        <div
          data-element-key='items'
          className={selectableClass(
            activeKey === 'items',
            'linea-ticker mt-[clamp(16px,2cqi,32px)] grid grid-cols-3 gap-4 overflow-hidden'
          )}
          style={{
            height: 'min(80vh, 720px)',
            ...styleOf('items'),
          }}
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
                {doubled.map(({ it, idx }, dupIdx) => {
                  const imgKey = `items[${idx}].img`;
                  return (
                    <div
                      key={`${colIdx}-${idx}-${dupIdx}`}
                      className='aspect-square w-full shrink-0 overflow-hidden rounded-[15px]'
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        data-element-key={imgKey}
                        src={it.img}
                        alt=''
                        loading='lazy'
                        decoding='async'
                        style={styleOf(imgKey)}
                        className={selectableClass(
                          activeKey === imgKey,
                          'block h-full w-full rounded-[15px] object-cover'
                        )}
                      />
                    </div>
                  );
                })}
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
