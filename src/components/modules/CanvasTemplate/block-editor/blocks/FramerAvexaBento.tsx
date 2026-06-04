'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerAvexaBentoContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerAvexaBentoProps {
  content: FramerAvexaBentoContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Bento - 01 (Avexa Why-Us), framer-native. Port từ `src/blocks/framer-avexa-bento`:
 * 6-card bento grid (3 cột 12-col): card1 strategy, card2 quality(orange),
 * card3 24/7(dark), card4 tailored, card5 collaborative(wide), card6 creative(2 ảnh xoay).
 * Responsive bằng container-query thay viewport breakpoints.
 * Accent: rgb(255,98,0). BG tổng: #F5F3EE.
 */

const ACCENT = 'rgb(255,98,0)';

const CARD_TITLE_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(20px, 2.2cqi, 30px)',
  fontWeight: 600,
  lineHeight: 1.18,
  letterSpacing: '-0.015em',
  margin: 0,
};

const CARD_DESC_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(14px, 1.15cqi, 17px)',
  lineHeight: 1.5,
  color: 'rgb(96,95,95)',
  margin: 0,
};

const NUM_BIG_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(40px, 4cqi, 56px)',
  fontWeight: 600,
  lineHeight: 1,
  letterSpacing: '-0.02em',
  margin: 0,
};

export function FramerAvexaBento({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerAvexaBentoProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const gap = 'clamp(12px, 1.4cqi, 24px)';
  const radius = 'clamp(16px, 1.8cqi, 28px)';
  const padCard = 'clamp(28px, 3cqi, 44px)';

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative w-full duration-700 ease-out',
        className
      )}
    >
      {/* Outer section */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          background: '#F5F3EE',
          color: '#0c0c0c',
          fontFamily: '"Inter", system-ui, sans-serif',
          padding: `clamp(40px,5cqi,80px) clamp(16px,3cqi,40px)`,
        }}
      >
        {/* Bento grid — 12-col desktop, 6-col mid, 1-col mobile via container queries */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridAutoRows: 'minmax(0,auto)',
            gap,
            maxWidth: 1400,
            margin: '0 auto',
          }}
          className='@[0px]:!grid-cols-1 @[810px]:grid-cols-6'
        >
          {/* ── CARD 1 — Strategy ──────────────────────────────────────────── */}
          <div
            style={{ gridColumn: 'span 4' }}
            className='@[0px]:!col-span-full @[810px]:!col-span-3 @[1200px]:![grid-column:span_4]'
          >
            <div
              style={{
                position: 'relative',
                background: '#f3f4f5',
                borderRadius: radius,
                overflow: 'hidden',
                minHeight: 320,
                display: 'flex',
                flexDirection: 'column',
                padding: padCard,
                gap: 'clamp(20px,2.4cqi,36px)',
              }}
            >
              {/* Image */}
              <div
                data-element-key='card1ImageUrl'
                style={composeStyle(
                  {
                    flex: '1 1 auto',
                    aspectRatio: '1/1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'clamp(12px,1.6cqi,24px)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    ...(content.card1ImageUrl
                      ? {
                          backgroundImage: `url("${content.card1ImageUrl.replace(/"/g, '%22')}")`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : { background: '#e5e7eb' }),
                  },
                  styleOf('card1ImageUrl')
                )}
                className={selectableClass(activeKey === 'card1ImageUrl')}
              />
              <div>
                <h3
                  data-element-key='card1Title'
                  style={composeStyle(CARD_TITLE_STYLE, styleOf('card1Title'))}
                  className={selectableClass(activeKey === 'card1Title')}
                >
                  {content.card1Title}
                </h3>
                <p
                  data-element-key='card1Desc'
                  style={composeStyle(
                    CARD_DESC_STYLE,
                    { marginTop: 12 },
                    styleOf('card1Desc')
                  )}
                  className={selectableClass(activeKey === 'card1Desc')}
                >
                  {content.card1Desc}
                </p>
              </div>
            </div>
          </div>

          {/* ── CARDS 2 + 3 stack ────────────────────────────────────────── */}
          <div
            style={{
              gridColumn: 'span 4',
              display: 'grid',
              gridTemplateRows: '1fr auto',
              gap,
            }}
            className='@[0px]:!col-span-full @[810px]:!col-span-3 @[1200px]:![grid-column:span_4]'
          >
            {/* CARD 2 — Quality (orange) */}
            <div
              style={{
                position: 'relative',
                borderRadius: radius,
                overflow: 'hidden',
                minHeight: 'clamp(280px,30cqi,360px)',
                display: 'flex',
                flexDirection: 'column',
                background: `linear-gradient(140deg, ${ACCENT} 0%, rgb(255,138,74) 100%)`,
                color: '#ffffff',
                padding: padCard,
              }}
            >
              <h3
                data-element-key='card2Title'
                style={composeStyle(
                  CARD_TITLE_STYLE,
                  {
                    fontSize: 'clamp(24px,2.6cqi,36px)',
                    lineHeight: 1.12,
                    color: '#ffffff',
                    maxWidth: '70%',
                  },
                  styleOf('card2Title')
                )}
                className={selectableClass(activeKey === 'card2Title')}
              >
                {content.card2Title}
              </h3>
              {/* Image overlay */}
              <div
                data-element-key='card2ImageUrl'
                style={composeStyle(
                  {
                    position: 'absolute',
                    right: 'clamp(20px,2cqi,40px)',
                    bottom: 'clamp(70px,6cqi,100px)',
                    width: '38%',
                    height: '70%',
                    zIndex: 1,
                    ...(content.card2ImageUrl
                      ? {
                          backgroundImage: `url("${content.card2ImageUrl.replace(/"/g, '%22')}")`,
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                        }
                      : {}),
                  },
                  styleOf('card2ImageUrl')
                )}
                className={selectableClass(activeKey === 'card2ImageUrl')}
              />
              {/* Caption */}
              <div
                style={{
                  position: 'absolute',
                  right: padCard,
                  bottom: 'clamp(24px,2.5cqi,36px)',
                  width: 'clamp(180px,18cqi,240px)',
                  zIndex: 2,
                }}
              >
                <p
                  data-element-key='card2Caption'
                  style={composeStyle(
                    {
                      fontSize: 'clamp(13px,1.05cqi,15px)',
                      color: 'rgba(255,255,255,0.95)',
                      textAlign: 'right',
                      lineHeight: 1.4,
                      margin: 0,
                    },
                    styleOf('card2Caption')
                  )}
                  className={selectableClass(activeKey === 'card2Caption')}
                >
                  {content.card2Caption}
                </p>
              </div>
            </div>

            {/* CARD 3 — 24/7 (dark) */}
            <div
              style={{
                position: 'relative',
                borderRadius: radius,
                overflow: 'hidden',
                background: '#131313',
                color: '#ffffff',
                padding: `clamp(22px,2.4cqi,32px) clamp(24px,2.6cqi,36px)`,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                minHeight: 'clamp(110px,12cqi,150px)',
              }}
            >
              <div>
                <p
                  data-element-key='card3Big'
                  style={composeStyle(NUM_BIG_STYLE, styleOf('card3Big'))}
                  className={selectableClass(activeKey === 'card3Big')}
                >
                  {content.card3Big}
                </p>
                <p
                  data-element-key='card3Sub'
                  style={composeStyle(
                    {
                      fontSize: 'clamp(12px,1cqi,14px)',
                      color: 'rgba(255,255,255,0.7)',
                      margin: '4px 0 0',
                    },
                    styleOf('card3Sub')
                  )}
                  className={selectableClass(activeKey === 'card3Sub')}
                >
                  {content.card3Sub}
                </p>
              </div>
              {/* Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#ffffff',
                  color: '#0c0c0c',
                  padding: '10px 16px 10px 10px',
                  borderRadius: 999,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  fontSize: 'clamp(11px,0.95cqi,13px)',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: ACCENT,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  aria-hidden='true'
                >
                  <svg width='14' height='14' viewBox='0 0 14 14' fill='none'>
                    <rect
                      x='1.5'
                      y='3'
                      width='11'
                      height='8'
                      rx='1.2'
                      stroke='currentColor'
                      strokeWidth='1.4'
                    />
                    <path
                      d='M2 4l5 4 5-4'
                      stroke='currentColor'
                      strokeWidth='1.4'
                      strokeLinecap='round'
                      fill='none'
                    />
                  </svg>
                </div>
                <div>
                  <div
                    data-element-key='card3BadgeBrand'
                    style={composeStyle(
                      { fontWeight: 600, lineHeight: 1.1, color: '#0c0c0c' },
                      styleOf('card3BadgeBrand')
                    )}
                    className={selectableClass(activeKey === 'card3BadgeBrand')}
                  >
                    {content.card3BadgeBrand}
                  </div>
                  <div
                    data-element-key='card3BadgeLabel'
                    style={composeStyle(
                      {
                        fontSize: 'clamp(10px,0.85cqi,12px)',
                        color: 'rgba(12,12,12,0.55)',
                        lineHeight: 1.1,
                      },
                      styleOf('card3BadgeLabel')
                    )}
                    className={selectableClass(activeKey === 'card3BadgeLabel')}
                  >
                    {content.card3BadgeLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 4 — Tailored ────────────────────────────────────────── */}
          <div
            style={{ gridColumn: 'span 4' }}
            className='@[0px]:!col-span-full @[810px]:!col-span-full @[1200px]:![grid-column:span_4]'
          >
            <div
              style={{
                position: 'relative',
                background: '#f3f4f5',
                borderRadius: radius,
                overflow: 'hidden',
                minHeight: 320,
                display: 'flex',
                flexDirection: 'column',
                padding: padCard,
                gap: 'clamp(16px,2cqi,28px)',
              }}
            >
              <div>
                <h3
                  data-element-key='card4Title'
                  style={composeStyle(CARD_TITLE_STYLE, styleOf('card4Title'))}
                  className={selectableClass(activeKey === 'card4Title')}
                >
                  {content.card4Title}
                </h3>
                <p
                  data-element-key='card4Desc'
                  style={composeStyle(
                    CARD_DESC_STYLE,
                    { marginTop: 12 },
                    styleOf('card4Desc')
                  )}
                  className={selectableClass(activeKey === 'card4Desc')}
                >
                  {content.card4Desc}
                </p>
              </div>
              <div
                data-element-key='card4ImageUrl'
                style={composeStyle(
                  {
                    flex: '1 1 auto',
                    aspectRatio: '16/12',
                    borderRadius: 'clamp(8px,1cqi,16px)',
                    overflow: 'hidden',
                    ...(content.card4ImageUrl
                      ? {
                          backgroundImage: `url("${content.card4ImageUrl.replace(/"/g, '%22')}")`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : { background: '#e5e7eb' }),
                  },
                  styleOf('card4ImageUrl')
                )}
                className={selectableClass(activeKey === 'card4ImageUrl')}
              />
            </div>
          </div>

          {/* ── CARD 5 — Collaborative (wide, spans 8) ───────────────────── */}
          <div
            style={{ gridColumn: 'span 8' }}
            className='@[0px]:!col-span-full @[810px]:!col-span-full @[1200px]:![grid-column:span_8]'
          >
            <div
              style={{
                position: 'relative',
                borderRadius: radius,
                overflow: 'hidden',
                minHeight: 'clamp(360px,36cqi,480px)',
                display: 'flex',
                flexDirection: 'column',
                color: '#ffffff',
              }}
            >
              {/* BG image */}
              <div
                data-element-key='card5ImageUrl'
                style={composeStyle(
                  {
                    position: 'absolute',
                    inset: 0,
                    filter: 'grayscale(100%)',
                    ...(content.card5ImageUrl
                      ? {
                          backgroundImage: `url("${content.card5ImageUrl.replace(/"/g, '%22')}")`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : { background: '#6b7280' }),
                  },
                  styleOf('card5ImageUrl')
                )}
                className={selectableClass(activeKey === 'card5ImageUrl')}
              />
              {/* Shade */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg,rgba(0,0,0,0) 50%,rgba(0,0,0,0.55) 100%)',
                }}
              />
              {/* Text overlay */}
              <div
                style={{
                  position: 'relative',
                  marginTop: 'auto',
                  zIndex: 2,
                  padding: 'clamp(28px,3cqi,48px)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: 24,
                  flexWrap: 'wrap',
                }}
              >
                <h3
                  data-element-key='card5Title'
                  style={composeStyle(
                    CARD_TITLE_STYLE,
                    {
                      fontSize: 'clamp(28px,3cqi,44px)',
                      color: '#ffffff',
                      maxWidth: '60%',
                    },
                    styleOf('card5Title')
                  )}
                  className={selectableClass(activeKey === 'card5Title')}
                >
                  {content.card5Title}
                </h3>
                <p
                  data-element-key='card5Caption'
                  style={composeStyle(
                    {
                      fontSize: 'clamp(13px,1.1cqi,16px)',
                      color: 'rgba(255,255,255,0.9)',
                      textAlign: 'right',
                      lineHeight: 1.4,
                      maxWidth: 240,
                      margin: 0,
                    },
                    styleOf('card5Caption')
                  )}
                  className={selectableClass(activeKey === 'card5Caption')}
                >
                  {content.card5Caption}
                </p>
              </div>
            </div>
          </div>

          {/* ── CARD 6 — Creative (2 rotating images) ────────────────────── */}
          <div
            style={{ gridColumn: 'span 4' }}
            className='@[0px]:!col-span-full @[810px]:!col-span-full @[1200px]:![grid-column:span_4]'
          >
            <div
              style={{
                position: 'relative',
                background: '#f3f4f5',
                borderRadius: radius,
                overflow: 'hidden',
                minHeight: 320,
                display: 'flex',
                flexDirection: 'column',
                padding: padCard,
                gap: 'clamp(16px,2cqi,28px)',
              }}
            >
              {/* Dots */}
              <div
                style={{ display: 'flex', gap: 6, marginBottom: 4 }}
                aria-hidden='true'
              >
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: ACCENT,
                      display: 'inline-block',
                    }}
                  />
                ))}
              </div>

              {/* Photo stack */}
              <div
                style={{
                  position: 'relative',
                  flex: '1 1 auto',
                  minHeight: 160,
                }}
              >
                <div
                  data-element-key='card6Image1Url'
                  style={composeStyle(
                    {
                      position: 'absolute',
                      width: '65%',
                      aspectRatio: '4/3',
                      borderRadius: 6,
                      overflow: 'hidden',
                      boxShadow: '0 12px 36px -10px rgba(0,0,0,0.18)',
                      top: '6%',
                      left: '8%',
                      transform: 'rotate(-7deg)',
                      ...(content.card6Image1Url
                        ? {
                            backgroundImage: `url("${content.card6Image1Url.replace(/"/g, '%22')}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : { background: '#d1d5db' }),
                    },
                    styleOf('card6Image1Url')
                  )}
                  className={selectableClass(activeKey === 'card6Image1Url')}
                />
                <div
                  data-element-key='card6Image2Url'
                  style={composeStyle(
                    {
                      position: 'absolute',
                      width: '65%',
                      aspectRatio: '4/3',
                      borderRadius: 6,
                      overflow: 'hidden',
                      boxShadow: '0 12px 36px -10px rgba(0,0,0,0.18)',
                      top: '22%',
                      right: '4%',
                      transform: 'rotate(6deg)',
                      ...(content.card6Image2Url
                        ? {
                            backgroundImage: `url("${content.card6Image2Url.replace(/"/g, '%22')}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : { background: '#9ca3af' }),
                    },
                    styleOf('card6Image2Url')
                  )}
                  className={selectableClass(activeKey === 'card6Image2Url')}
                />
              </div>

              <div>
                <h3
                  data-element-key='card6Title'
                  style={composeStyle(CARD_TITLE_STYLE, styleOf('card6Title'))}
                  className={selectableClass(activeKey === 'card6Title')}
                >
                  {content.card6Title}
                </h3>
                <p
                  data-element-key='card6Desc'
                  style={composeStyle(
                    CARD_DESC_STYLE,
                    { marginTop: 12 },
                    styleOf('card6Desc')
                  )}
                  className={selectableClass(activeKey === 'card6Desc')}
                >
                  {content.card6Desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
