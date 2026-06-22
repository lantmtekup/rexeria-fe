'use client';

/**
 * Hero - 05 (Bungee) — port từ 360-admin-cms `framer-bungee-hero`.
 *
 * Design 360: corner "g" + "+" deco, wordmark to ở giữa, subtitle, info row
 * (timer dọc trái + 3 link phải), dải ảnh bo góc xen kẽ auto-scroll vô hạn dưới.
 *
 * Theo contract nền GSAP (landing-motion-foundation R1–R6):
 * - Marquee ảnh = ambient CSS @keyframes (giống LineaPortfolio ticker — KHÔNG
 *   phải scroll-anim nên không cần useBlockMotion). Tốc độ qua --bungee-speed.
 * - Entrance reveal (wordmark/subtitle/info row) = useBlockMotion → gsap.fromTo
 *   + scrollTrigger {trigger, scroller, start:'top 85%', toggleActions, invalidate}.
 *   BỎ animate-in + framer-motion.
 * - @container + đơn vị cqi (R2), data-element-key + selectableClass mỗi element.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
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

interface Props {
  content: FramerBungeeHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

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
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
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

  // Entrance reveal — wordmark/subtitle/info row fade-up theo scroll (R1, R3).
  useBlockMotion(rootRef, ({ scroller }) => {
    const root = rootRef.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>('.bungee-reveal');
    if (!targets.length) return;
    gsap.fromTo(
      targets,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        },
      }
    );
  });

  return (
    <section
      ref={rootRef}
      style={composeStyle(
        {
          position: 'relative',
          width: '100%',
          minHeight: 'clamp(560px, 100vh, 980px)',
          overflow: 'hidden',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        },
        blockBackgroundStyle(background)
      )}
      className='bungee-hero @container'
    >
      {/* Scoped styles — ambient marquee keyframes + container-query tweaks */}
      <style>{`
        .bungee-hero :where(a) { text-decoration: none; color: inherit; }
        .bungee-marquee {
          width: 100%;
          margin-top: clamp(24px, 4cqi, 56px);
          height: clamp(220px, 36cqi, 480px);
          overflow: hidden;
          position: relative;
          -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 6%, rgba(0,0,0,1) 94%, rgba(0,0,0,0) 100%);
          mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 6%, rgba(0,0,0,1) 94%, rgba(0,0,0,0) 100%);
        }
        .bungee-track {
          display: flex;
          gap: 12px;
          height: 100%;
          width: max-content;
          will-change: transform;
          animation: bungee-scroll var(--bungee-speed, 40s) linear infinite;
        }
        @keyframes bungee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .bungee-marquee:hover .bungee-track { animation-play-state: paused; }
        .bungee-card {
          flex: 0 0 auto;
          width: clamp(120px, 16cqi, 200px);
          height: 100%;
          overflow: hidden;
          background: #e8e8ea;
          position: relative;
        }
        .bungee-card-a {
          border-top-left-radius: 80px;
          border-bottom-right-radius: 80px;
        }
        .bungee-card-b {
          border-top-right-radius: 80px;
          border-bottom-left-radius: 80px;
        }
        @container (max-width: 809px) {
          .bungee-hero { min-height: auto !important; }
          .bungee-marquee { height: clamp(180px, 52cqi, 320px); }
          .bungee-card { width: clamp(110px, 32cqi, 160px); }
          .bungee-card-a, .bungee-card-b {
            border-top-left-radius: 48px;
            border-bottom-right-radius: 48px;
            border-top-right-radius: 0;
            border-bottom-left-radius: 0;
          }
          .bungee-card-b {
            border-top-right-radius: 48px;
            border-bottom-left-radius: 48px;
            border-top-left-radius: 0;
            border-bottom-right-radius: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bungee-track { animation: none; }
        }
      `}</style>

      {/* Corner deco — "g" mark top-left */}
      <div
        aria-hidden='true'
        style={{
          position: 'absolute',
          top: 'clamp(16px, 2cqi, 24px)',
          left: 'clamp(16px, 2cqi, 24px)',
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
          top: 'clamp(16px, 2cqi, 24px)',
          right: 'clamp(16px, 2cqi, 24px)',
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

      {/* Main content — tight vertical stack */}
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
          className={selectableClass(
            activeKey === 'wordmarkUrl',
            'bungee-reveal'
          )}
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

        {/* Subtitle — tight gap to wordmark */}
        <div
          className='bungee-reveal w-full text-center'
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

        {/* Info row — timer left + links right */}
        <div
          className='bungee-reveal flex w-full items-end justify-between'
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
            data-element-key='links'
            style={composeStyle(
              {
                ...LINK_ROW_STYLE,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              },
              styleOf('links')
            )}
            className={selectableClass(activeKey === 'links')}
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

      {/* Marquee strip — infinite auto-scroll (ambient CSS) */}
      {doubled.length > 0 && (
        <div
          data-element-key='cardImages'
          className={selectableClass(
            activeKey === 'cardImages',
            'bungee-marquee'
          )}
          style={composeStyle(
            { ['--bungee-speed' as string]: `${marqueeSpeed}s` },
            styleOf('cardImages')
          )}
          aria-label='Image strip'
        >
          <div className='bungee-track'>
            {doubled.map((c, i) => {
              const isA = i % 2 === 0;
              return (
                <div
                  key={i}
                  className={`bungee-card ${isA ? 'bungee-card-a' : 'bungee-card-b'}`}
                  style={{
                    backgroundImage: `url("${c.imageUrl.replace(/"/g, '%22')}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  aria-hidden='true'
                />
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
