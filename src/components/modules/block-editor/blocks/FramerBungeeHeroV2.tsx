'use client';

import * as React from 'react';
import gsap from 'gsap';

import { resolveColorValue } from '@/lib/brand-kit';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';
import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerBungeeHeroV2Content,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import {
  resolveFramerBungeeHeroV2CardImages,
  type FramerBungeeHeroV2Card,
} from './_registry/defs/framerBungeeHeroV2';

interface Props {
  content: FramerBungeeHeroV2Content;
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
  fontSize: 'clamp(11px, 1.2cqi, 14px)',
  fontWeight: 400,
  lineHeight: '1.22em',
  letterSpacing: '-0.02em',
  color: 'rgb(30, 30, 30)',
};

const fitHeroWordmarkFontSize = (
  container: HTMLElement,
  textEl: HTMLElement,
  maxPx: number,
  minPx: number
) => {
  const maxWidth = container.clientWidth;
  const maxHeight = container.clientHeight;
  if (maxWidth <= 0 || maxHeight <= 0) return minPx;

  let lo = minPx;
  let hi = maxPx;
  let best = minPx;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    textEl.style.fontSize = `${mid}px`;
    const fitsWidth = textEl.scrollWidth <= maxWidth;
    const fitsHeight = textEl.clientHeight <= maxHeight;
    if (fitsWidth && fitsHeight) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return best;
};

const HERO_WORDMARK_MAX_DESKTOP_PX = 320;
const HERO_WORDMARK_MAX_TABLET_PX = 200;
const HERO_WORDMARK_MAX_MOBILE_PX = 128;
const HERO_WORDMARK_MIN_PX = 32;
const CONTAINER_TABLET_PX = 672;
const CONTAINER_DESKTOP_PX = 896;

const getWordmarkBounds = (containerWidth: number) => {
  if (containerWidth < CONTAINER_TABLET_PX) {
    return { max: HERO_WORDMARK_MAX_MOBILE_PX, min: HERO_WORDMARK_MIN_PX };
  }
  if (containerWidth < CONTAINER_DESKTOP_PX) {
    return { max: HERO_WORDMARK_MAX_TABLET_PX, min: HERO_WORDMARK_MIN_PX };
  }
  return { max: HERO_WORDMARK_MAX_DESKTOP_PX, min: HERO_WORDMARK_MIN_PX };
};

const cardMediaKey = (i: number, card: FramerBungeeHeroV2Card) =>
  card.videoUrl?.trim()
    ? `cardImages[${i}].videoUrl`
    : `cardImages[${i}].imageUrl`;

export function FramerBungeeHeroV2({
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

  const marqueeSpeed = Number(content.marqueeSpeed ?? 30);
  const cards = resolveFramerBungeeHeroV2CardImages(content).filter(
    c => c?.imageUrl || c?.videoUrl
  );
  const doubled = [...cards, ...cards];
  const accent = content.accentColor || 'rgb(30, 30, 30)';
  const sectionBg = background?.color
    ? resolveColorValue(background.color)
    : '#ffffff';

  const [clockText, setClockText] = React.useState<string>('');
  React.useEffect(() => {
    const formatClock = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      return `${h}:${String(m).padStart(2, '0')}`;
    };
    setClockText(formatClock());
    const interval = window.setInterval(() => {
      setClockText(formatClock());
    }, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const wordmarkContainerRef = React.useRef<HTMLDivElement | null>(null);
  const wordmarkTextRef = React.useRef<HTMLHeadingElement | null>(null);
  const [fittedFontSize, setFittedFontSize] = React.useState(
    HERO_WORDMARK_MAX_MOBILE_PX
  );

  useIsomorphicLayoutEffect(() => {
    if (content.wordmarkUrl) return;
    const container = wordmarkContainerRef.current;
    const textEl = wordmarkTextRef.current;
    if (!container || !textEl) return;

    const fit = () => {
      const { max, min } = getWordmarkBounds(container.clientWidth);
      const nextSize = fitHeroWordmarkFontSize(container, textEl, max, min);
      setFittedFontSize(prev => (prev === nextSize ? prev : nextSize));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [content.wordmarkUrl]);

  useBlockMotion(rootRef, ({ scroller }) => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const targets = root.querySelectorAll<HTMLElement>('.bungee-v2-reveal');
      targets.forEach(t => {
        t.style.opacity = '1';
        t.style.transform = 'none';
      });
      return;
    }

    const wordmark = root.querySelector<HTMLElement>('.bungee-v2-wordmark');
    const carousel = root.querySelector<HTMLElement>('.bungee-v2-marquee');
    const subtitle = root.querySelector<HTMLElement>('.bungee-v2-subtitle');

    // A1 wordmark — drops in from above (translateY -40 → 0)
    if (wordmark) {
      gsap.fromTo(
        wordmark,
        { opacity: 0, y: -40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );
    }

    // A2 carousel — rises from below (translateY +60 → 0), song song A1
    if (carousel) {
      gsap.fromTo(
        carousel,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );
    }

    // A3 subtitle — fade-in only, sau khi A1+A2 settle (delay 400ms)
    if (subtitle) {
      gsap.fromTo(
        subtitle,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.0,
          ease: 'power3.out',
          delay: 0.4,
          scrollTrigger: {
            trigger: root,
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
      style={composeStyle(
        {
          position: 'relative',
          width: '100%',
          minHeight: 'clamp(560px, 100dvh, 980px)',
          overflow: 'hidden',
          background: sectionBg,
          color: accent,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          ['--bungee-v2-bg' as string]: sectionBg,
        },
        blockBackgroundStyle(background)
      )}
      className='bungee-v2-hero @container'
    >
      {/* Scoped styles — ambient marquee keyframes + container-query tweaks.
          NOTE: CSS-only animation là ambient (R5 safe) — không tạo ScrollTrigger. */}
      <style>{`
        .bungee-v2-hero :where(a) { text-decoration: none; color: inherit; }
        .bungee-v2-marquee-wrap {
          width: 100%;
          margin-top: clamp(20px, 3.5cqi, 44px);
          position: relative;
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            rgba(0, 0, 0, 0.18) 5%,
            rgba(0, 0, 0, 0.55) 9%,
            rgba(0, 0, 0, 0.88) 13%,
            black 18%,
            black 82%,
            rgba(0, 0, 0, 0.88) 87%,
            rgba(0, 0, 0, 0.55) 91%,
            rgba(0, 0, 0, 0.18) 95%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            rgba(0, 0, 0, 0.18) 5%,
            rgba(0, 0, 0, 0.55) 9%,
            rgba(0, 0, 0, 0.88) 13%,
            black 18%,
            black 82%,
            rgba(0, 0, 0, 0.88) 87%,
            rgba(0, 0, 0, 0.55) 91%,
            rgba(0, 0, 0, 0.18) 95%,
            transparent 100%
          );
        }
        .bungee-v2-marquee {
          width: 100%;
          height: clamp(220px, 36cqi, 520px);
          position: relative;
          -webkit-mask-image: linear-gradient(
            to bottom,
            black 0%,
            black 52%,
            rgba(0, 0, 0, 0.72) 68%,
            rgba(0, 0, 0, 0.35) 82%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to bottom,
            black 0%,
            black 52%,
            rgba(0, 0, 0, 0.72) 68%,
            rgba(0, 0, 0, 0.35) 82%,
            transparent 100%
          );
        }
        .bungee-v2-track {
          display: flex;
          gap: 12px;
          height: 100%;
          width: max-content;
          will-change: transform;
          animation: bungee-v2-scroll var(--bungee-v2-speed, 50s) linear infinite;
        }
        @keyframes bungee-v2-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .bungee-v2-card {
          flex: 0 0 auto;
          width: clamp(120px, 16cqi, 180px);
          height: 100%;
          overflow: hidden;
          background: #e8e8ea;
          position: relative;
        }
        .bungee-v2-card-a {
          border-top-left-radius: 80px;
          border-bottom-right-radius: 80px;
        }
        .bungee-v2-card-b {
          border-top-right-radius: 80px;
          border-bottom-left-radius: 80px;
        }
        .bungee-v2-card video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        @container (max-width: 1023px) {
        .bungee-v2-hero { min-height: auto !important; }
        .bungee-v2-marquee { height: clamp(180px, 132cqi, 520px); }
        .bungee-v2-card { width: clamp(110px, 45cqi, 180px); }
        @media (prefers-reduced-motion: reduce) {
          .bungee-v2-track { animation: none; }
        }
        }
        @container (max-width: 809px) {
          .bungee-v2-hero { min-height: auto !important; }
          .bungee-v2-marquee { height: clamp(180px, 132cqi, 520px); }
          .bungee-v2-card { width: clamp(110px, 45cqi, 180px); }
          .bungee-v2-card-a, .bungee-v2-card-b {
            border-top-left-radius: 48px;
            border-bottom-right-radius: 48px;
            border-top-right-radius: 0;
            border-bottom-left-radius: 0;
          }
          .bungee-v2-card-b {
            border-top-right-radius: 48px;
            border-bottom-left-radius: 48px;
            border-top-left-radius: 0;
            border-bottom-right-radius: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bungee-v2-track { animation: none; }
        }
      `}</style>

      <div
        className='relative z-[2] flex w-full flex-col items-center'
        style={{
          maxWidth: 1520,
          margin: '0 auto',
          padding: 'clamp(48px, 6cqi, 88px) clamp(16px, 3cqi, 32px) 0',
          flex: '1 1 auto',
        }}
      >
        {/* Wordmark (image) or fallback text */}
        <div
          ref={wordmarkContainerRef}
          data-element-key='wordmarkUrl'
          className='bungee-v2-wordmark bungee-v2-reveal w-full'
          style={composeStyle(
            {
              width: '100%',
              maxWidth: 704,
              aspectRatio: '3.737 / 1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '0.18em',
              paddingBottom: '0.22em',
              overflow: content.wordmarkUrl ? 'hidden' : 'visible',
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
          aria-label='Wordmark'
        >
          {!content.wordmarkUrl && (
            <h1
              ref={wordmarkTextRef}
              style={{
                fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
                fontSize: `${fittedFontSize}px`,
                fontWeight: 700,
                letterSpacing: '-0.05em',
                color: accent,
                lineHeight: 1,
                margin: 0,
                whiteSpace: 'nowrap',
              }}
            >
              Bungee®
            </h1>
          )}
        </div>

        <div
          className='bungee-v2-reveal w-full text-center'
          style={{ marginTop: 'clamp(10px, 1.5cqi, 20px)' }}
        >
          <h4
            data-element-key='subtitle'
            className='bungee-v2-subtitle'
            style={composeStyle(SUBTITLE_STYLE, styleOf('subtitle'))}
          >
            <span
              className={selectableClass(activeKey === 'subtitle')}
              style={{ display: 'inline-block', width: '100%', fontSize: 20 }}
            >
              {content.subtitle || 'Creative studio based in Gotham.'}
            </span>
          </h4>
        </div>

        <div
          className='bungee-v2-reveal mt-auto flex w-full items-end justify-between @3xl:mt-10 @3xl:pt-30 @4xl:pt-0'
          style={{
            gap: 24,
            paddingBottom: 'clamp(16px, 2cqi, 24px)',
          }}
        >
          <div
            data-element-key='timerLabel'
            style={composeStyle(
              {
                ...LINK_ROW_STYLE,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
                width: 22,
                height: 'auto',
                transform: 'rotate(-90deg)',
                transformOrigin: 'center',
              },
              styleOf('timerLabel')
            )}
            className={selectableClass(activeKey === 'timerLabel')}
          >
            <span>{`( ${clockText ? `${clockText} ` : ''}${content.timerLabel || 'NY'} )`}</span>
          </div>

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

      {doubled.length > 0 && (
        <div
          className='bungee-v2-marquee-wrap bungee-v2-reveal'
          style={styleOf('cardImages')}
        >
          <div
            className='bungee-v2-marquee'
            style={{ ['--bungee-v2-speed' as string]: `${marqueeSpeed}s` }}
            aria-label='Image strip'
          >
            <div className='bungee-v2-track'>
              {doubled.map((c, i) => {
                const origIdx = i % cards.length;
                const mediaKey = cardMediaKey(origIdx, c);
                const isA = i % 2 === 0;
                const safeVideoUrl = c.videoUrl?.replace(/"/g, '%22');
                const safeImageUrl = c.imageUrl?.replace(/"/g, '%22');
                return (
                  <div
                    key={`${mediaKey}-${i}`}
                    data-element-key={mediaKey}
                    className={selectableClass(
                      activeKey === mediaKey,
                      `bungee-v2-card ${isA ? 'bungee-v2-card-a' : 'bungee-v2-card-b'}`
                    )}
                    style={composeStyle(
                      safeVideoUrl
                        ? undefined
                        : {
                            backgroundImage: `url("${safeImageUrl}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          },
                      styleOf(mediaKey)
                    )}
                    aria-hidden='true'
                  >
                    {safeVideoUrl && (
                      <video
                        src={safeVideoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload='auto'
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
