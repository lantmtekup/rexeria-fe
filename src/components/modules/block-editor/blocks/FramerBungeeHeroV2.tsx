'use client';

/**
 * Hero - Bungee v2 — port từ framer-recon spec `recon-bungee-hero`.
 *
 * Recon selector: `header[data-framer-name="Header"]` của
 * https://bungee.framer.website/. Domain: "Creative studio based in Gotham.".
 *
 * Layout khớp recon:
 *  - corner deco "g" top-left + plus icon top-right
 *  - wordmark "Bungee®" giữa, subtitle dưới wordmark
 *  - info row: timer label trái + 3 social link (BE/DR/X) phải
 *  - dải marquee ảnh auto-scroll vô hạn dưới cùng (bo góc xen kẽ)
 *  - bg #ffffff desktop, edge-fade ngang + edge-fade đáy
 *
 * Theo contract GSAP R1–R6 (`docs/landing-motion-foundation.md`):
 *  - Entrance reveal (wordmark / subtitle / info row) = useBlockMotion
 *    → gsap.fromTo + scrollTrigger {trigger, scroller, start:'top 85%',
 *    toggleActions:'play none none reverse', invalidateOnRefresh:true}.
 *  - Marquee ảnh = ambient CSS @keyframes (không cần scroll-anim). Tốc độ
 *    qua CSS var `--bungee-v2-speed`. Pause khi hover.
 *  - BỎ animate-in Tailwind class + framer-motion. BỎ @media — dùng @container.
 *  - R5: marquee nằm trong block root @container; overlay/edge-fade là con
 *    trực tiếp nên không phá pin.
 *  - Reduced-motion: tắt entrance translate (chỉ opacity)
 */
import * as React from 'react';
import gsap from 'gsap';

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

// ===== Wordmark auto-fit helpers =====
// Binary-search fontSize sao cho textEl.scrollWidth <= container.clientWidth.
const fitHeroWordmarkFontSize = (
  container: HTMLElement,
  textEl: HTMLElement,
  maxPx: number,
  minPx: number
) => {
  const maxWidth = container.clientWidth;
  if (maxWidth <= 0) return minPx;

  let lo = minPx;
  let hi = maxPx;
  let best = minPx;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    textEl.style.fontSize = `${mid}px`;
    if (textEl.scrollWidth <= maxWidth) {
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
  const cards = Array.isArray(content.cardImages)
    ? content.cardImages.filter(c => c?.imageUrl)
    : [];
  const doubled = [...cards, ...cards];
  const accent = content.accentColor || 'rgb(30, 30, 30)';

  // Live clock — hiển thị giờ local cùng timerLabel, update mỗi 30s để bám sát
  // phút thay đổi mà không re-render liên tục. SSR-safe: khởi tạo '', set sau mount.
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

  React.useLayoutEffect(() => {
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
          minHeight: 'clamp(560px, 100vh, 980px)',
          overflow: 'hidden',
          background: '#ffffff',
          color: accent,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        },
        blockBackgroundStyle(background)
      )}
      className='bungee-v2-hero @container'
    >
      {/* Scoped styles — ambient marquee keyframes + container-query tweaks.
          NOTE: CSS-only animation là ambient (R5 safe) — không tạo ScrollTrigger. */}
      <style>{`
        .bungee-v2-hero :where(a) { text-decoration: none; color: inherit; }
        .bungee-v2-marquee {
          width: 100%;
          margin-top: clamp(20px, 3.5cqi, 44px);
          height: clamp(220px, 36cqi, 520px);
          overflow: hidden;
          position: relative;
          -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 6%, rgba(0,0,0,1) 94%, rgba(0,0,0,0) 100%),
                            linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%);
          -webkit-mask-composite: source-in;
          mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 6%, rgba(0,0,0,1) 94%, rgba(0,0,0,0) 100%),
                       linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%);
          mask-composite: intersect;
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
        @container (max-width: 1023px) {
        .bungee-v2-hero { min-height: auto !important; }
        .bungee-v2-marquee { height: clamp(180px, 132cqi, 520px); }
        .bungee-v2-card { width: clamp(110px, 45cqi, 180px); }
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

        {/* Subtitle — tight gap to wordmark, fades in last (A3) */}
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

        {/* Info row — timer left + links right */}
        <div
          className='bungee-v2-reveal mt-auto flex w-full items-end justify-between @3xl:mt-10 @3xl:pt-30 @4xl:pt-0'
          style={{
            gap: 24,
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
          className='bungee-v2-marquee bungee-v2-reveal'
          style={composeStyle(
            { ['--bungee-v2-speed' as string]: `${marqueeSpeed}s` },
            styleOf('cardImages')
          )}
          aria-label='Image strip'
        >
          <div className='bungee-v2-track'>
            {doubled.map((c, i) => {
              const isA = i % 2 === 0;
              return (
                <div
                  key={i}
                  className={`bungee-v2-card ${isA ? 'bungee-v2-card-a' : 'bungee-v2-card-b'}`}
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
