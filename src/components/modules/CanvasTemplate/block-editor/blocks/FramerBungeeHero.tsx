'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerBungeeHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerBungeeHeroProps {
  content: FramerBungeeHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Hero - 05 (Bungee): wordmark image + subtitle + timer/link row +
 * CSS-animated marquee strip. Port từ `src/blocks/framer-bungee-hero`.
 * Marquee dùng @keyframes trong <style> scoped, tốc độ qua CSS custom prop
 * `--bungee-speed`. Thay <img> bằng backgroundImage div. Container-query only.
 */

const SUBTITLE_STYLE: React.CSSProperties = {
  fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
  fontSize: 'clamp(14px, 2.4cqi, 24px)',
  fontWeight: 400,
  lineHeight: 1.4,
  letterSpacing: '-0.01em',
  color: 'rgb(30, 30, 30)',
  textAlign: 'center',
  margin: 0,
};

const LINK_ROW_STYLE: React.CSSProperties = {
  fontFamily: '"Chivo Mono", "Courier New", monospace',
  fontSize: 14,
  fontWeight: 400,
  lineHeight: '1.22em',
  letterSpacing: '-0.02em',
  color: 'rgb(30, 30, 30)',
};

export function FramerBungeeHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerBungeeHeroProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const marqueeSpeed = Number(content.marqueeSpeed ?? 40);
  const cards = Array.isArray(content.cardImages)
    ? content.cardImages.filter(c => c?.imageUrl)
    : [];
  const doubled = [...cards, ...cards];

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative flex w-full flex-col items-center overflow-hidden rounded-md bg-white duration-700 ease-out',
        className
      )}
    >
      {/* Scoped styles for marquee animation */}
      <style>{`
        .bungee-hero-marquee {
          width: 100%;
          margin-top: clamp(24px, 4cqi, 56px);
          height: clamp(220px, 36cqi, 480px);
          overflow: hidden;
          position: relative;
          -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 6%, rgba(0,0,0,1) 94%, rgba(0,0,0,0) 100%);
          mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 6%, rgba(0,0,0,1) 94%, rgba(0,0,0,0) 100%);
        }
        .bungee-hero-track {
          display: flex;
          gap: 12px;
          height: 100%;
          width: max-content;
          animation: bungee-hero-scroll var(--bungee-speed, 40s) linear infinite;
        }
        @keyframes bungee-hero-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .bungee-hero-track { animation: none; }
        }
        .bungee-hero-card {
          flex: 0 0 auto;
          width: clamp(120px, 16cqi, 200px);
          height: 100%;
          overflow: hidden;
          background: #e8e8ea;
          position: relative;
        }
        .bungee-hero-card-a {
          border-top-left-radius: 80px;
          border-bottom-right-radius: 80px;
        }
        .bungee-hero-card-b {
          border-top-right-radius: 80px;
          border-bottom-left-radius: 80px;
        }
      `}</style>

      {/* Corner deco — "g" mark top-left */}
      <div
        aria-hidden='true'
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: '-0.04em',
          color: 'rgb(30, 30, 30)',
          lineHeight: 1,
          zIndex: 3,
          fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
        }}
      >
        g
      </div>

      {/* Corner deco — plus icon top-right */}
      <div
        aria-hidden='true'
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3,
          color: 'rgb(30, 30, 30)',
        }}
      >
        <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
          <path
            d='M10 2v16M2 10h16'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
          />
        </svg>
      </div>

      {/* Main content area */}
      <div
        className='relative z-[2] flex w-full flex-col items-center'
        style={{
          maxWidth: 1520,
          margin: '0 auto',
          padding: 'clamp(48px, 6cqi, 88px) clamp(16px, 3cqi, 32px) 0',
          flex: '1 1 auto',
        }}
      >
        {/* Wordmark image (or fallback text) */}
        <div
          data-element-key='wordmarkUrl'
          style={composeStyle(
            {
              width: '100%',
              maxWidth: 704,
              aspectRatio: '3.737 / 1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            },
            content.wordmarkUrl
              ? {
                  backgroundImage: `url("${content.wordmarkUrl.replace(/"/g, '%22')}")`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }
              : undefined,
            styleOf('wordmarkUrl')
          )}
          className={selectableClass(activeKey === 'wordmarkUrl')}
          aria-label='Wordmark'
        >
          {!content.wordmarkUrl && (
            <h1
              style={{
                fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
                fontSize: 'clamp(64px, 18cqi, 240px)',
                fontWeight: 800,
                letterSpacing: '-0.05em',
                color: 'rgb(30, 30, 30)',
                lineHeight: 1,
                margin: 0,
              }}
            >
              Bungee®
            </h1>
          )}
        </div>

        {/* Subtitle */}
        <div
          className='w-full text-center'
          style={{ marginTop: 'clamp(10px, 1.5cqi, 20px)' }}
        >
          <h4
            data-element-key='subtitle'
            style={composeStyle(SUBTITLE_STYLE, styleOf('subtitle'))}
            className={selectableClass(activeKey === 'subtitle')}
          >
            {content.subtitle || 'Creative studio based in Gotham.'}
          </h4>
        </div>

        {/* Timer + social links row */}
        <div
          className='flex w-full items-end justify-between'
          style={{
            gap: 24,
            marginTop: 'clamp(16px, 2.5cqi, 32px)',
            paddingBottom: 'clamp(16px, 2cqi, 24px)',
          }}
        >
          {/* Timer label */}
          <div
            data-element-key='timerLabel'
            style={composeStyle(
              {
                ...LINK_ROW_STYLE,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
              },
              styleOf('timerLabel')
            )}
            className={selectableClass(activeKey === 'timerLabel')}
          >
            <span>(</span>
            <span>{content.timerLabel || 'NY'}</span>
            <span>)</span>
          </div>

          {/* Social links */}
          <div
            style={{
              ...LINK_ROW_STYLE,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <a
              data-element-key='link1Label'
              href={content.link1Url || 'https://www.behance.net/'}
              target='_blank'
              rel='noreferrer noopener'
              style={composeStyle(
                { textDecoration: 'none', color: 'inherit' },
                styleOf('link1Label')
              )}
              className={selectableClass(activeKey === 'link1Label')}
            >
              {content.link1Label || 'BE'}
            </a>
            <span aria-hidden='true' style={{ opacity: 0.6 }}>
              /
            </span>
            <a
              data-element-key='link2Label'
              href={content.link2Url || 'https://dribbble.com/'}
              target='_blank'
              rel='noreferrer noopener'
              style={composeStyle(
                { textDecoration: 'none', color: 'inherit' },
                styleOf('link2Label')
              )}
              className={selectableClass(activeKey === 'link2Label')}
            >
              {content.link2Label || 'DR'}
            </a>
            <span aria-hidden='true' style={{ opacity: 0.6 }}>
              /
            </span>
            <a
              data-element-key='link3Label'
              href={content.link3Url || 'https://x.com/'}
              target='_blank'
              rel='noreferrer noopener'
              style={composeStyle(
                { textDecoration: 'none', color: 'inherit' },
                styleOf('link3Label')
              )}
              className={selectableClass(activeKey === 'link3Label')}
            >
              {content.link3Label || 'X'}
            </a>
          </div>
        </div>
      </div>

      {/* Marquee image strip */}
      {doubled.length > 0 && (
        <div
          className='bungee-hero-marquee'
          style={{ ['--bungee-speed' as string]: `${marqueeSpeed}s` }}
          aria-label='Image strip'
        >
          <div className='bungee-hero-track'>
            {doubled.map((c, i) => {
              const isA = i % 2 === 0;
              return (
                <div
                  key={i}
                  className={`bungee-hero-card ${isA ? 'bungee-hero-card-a' : 'bungee-hero-card-b'}`}
                  style={
                    c.imageUrl
                      ? {
                          backgroundImage: `url("${c.imageUrl.replace(/"/g, '%22')}")`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : undefined
                  }
                  aria-hidden='true'
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
