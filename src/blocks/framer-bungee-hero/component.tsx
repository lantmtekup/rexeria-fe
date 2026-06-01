'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

interface CardItem {
  image?: AssetRef | null;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

const subtitleStyle: React.CSSProperties = {
  fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
  fontSize: 'clamp(16px, 2.4cqi, 24px)',
  fontWeight: 400,
  lineHeight: 1.4,
  letterSpacing: '-0.01em',
  color: 'rgb(30, 30, 30)',
  textAlign: 'center',
  margin: 0,
};

const linkRowStyle: React.CSSProperties = {
  fontFamily: '"Chivo Mono", "Courier New", monospace',
  fontSize: 14,
  fontWeight: 400,
  lineHeight: '1.22em',
  letterSpacing: '-0.02em',
  color: 'rgb(30, 30, 30)',
};

/** Hero - 05 (Bungee): wordmark + subtitle + timer/links + CSS-animated marquee strip. */
export function FramerBungeeHero({ content }: LegacyBlockComponentProps) {
  const subtitle = String(
    content.subtitle || 'Creative studio based in Gotham.'
  );
  const timerLabel = String(content.timerLabel || 'NY');
  const link1Label = String(content.link1Label || 'BE');
  const link1Url = String(content.link1Url || 'https://www.behance.net/');
  const link2Label = String(content.link2Label || 'DR');
  const link2Url = String(content.link2Url || 'https://dribbble.com/');
  const link3Label = String(content.link3Label || 'X');
  const link3Url = String(content.link3Url || 'https://x.com/');
  const wordmark = (content.wordmarkImage as AssetRef | null) ?? null;
  const marqueeSpeed = Number(content.marqueeSpeed ?? 40);
  const cards = (
    Array.isArray(content.cardImages) ? (content.cardImages as CardItem[]) : []
  ).filter(c => c?.image?.url);
  const doubled = [...cards, ...cards];
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-bungee-hero'
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'clamp(560px, 100vh, 980px)',
        overflow: 'hidden',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding:
          'clamp(48px, 6cqi, 88px) clamp(16px, 3cqi, 32px) clamp(24px, 3cqi, 32px)',
      }}
    >
      <style>{`
        #framer-bungee-hero .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-bungee-hero .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-bungee-hero a { text-decoration: none; color: inherit; }

        #framer-bungee-hero .bungee-marquee {
          width: 100%;
          margin-top: clamp(24px, 4cqi, 56px);
          height: clamp(260px, 36cqi, 480px);
          overflow: hidden;
          position: relative;
          -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 6%, rgba(0,0,0,1) 94%, rgba(0,0,0,0) 100%);
          mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 6%, rgba(0,0,0,1) 94%, rgba(0,0,0,0) 100%);
        }
        #framer-bungee-hero .bungee-marquee-track {
          display: flex;
          gap: 12px;
          height: 100%;
          width: max-content;
          animation: bungee-scroll var(--bungee-speed, 40s) linear infinite;
        }
        @keyframes bungee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          #framer-bungee-hero .bungee-marquee-track { animation: none; }
        }
        #framer-bungee-hero .bungee-card {
          flex: 0 0 auto;
          width: clamp(140px, 16cqi, 200px);
          height: 100%;
          overflow: hidden;
          background: #e8e8ea;
          position: relative;
        }
        #framer-bungee-hero .bungee-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        #framer-bungee-hero .bungee-card-a {
          border-top-left-radius: 80px;
          border-bottom-right-radius: 80px;
        }
        #framer-bungee-hero .bungee-card-b {
          border-top-right-radius: 80px;
          border-bottom-left-radius: 80px;
        }
        @media (max-width: 809px) {
          #framer-bungee-hero { padding: 56px 16px 24px; min-height: auto; }
          #framer-bungee-hero .bungee-card { width: clamp(110px, 32cqi, 160px); }
          #framer-bungee-hero .bungee-marquee { margin-top: 24px; height: clamp(180px, 52cqi, 320px); }
        }
      `}</style>

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
        }}
      >
        g
      </div>
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

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 1520,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: '1 1 auto',
        }}
      >
        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            width: '100%',
            maxWidth: 704,
            aspectRatio: '3.737 / 1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {wordmark?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={wordmark.url}
              alt={wordmark.alt ?? 'Bungee'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          ) : (
            <h1
              style={{
                fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
                fontSize: 'clamp(80px, 18cqi, 240px)',
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

        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            width: '100%',
            textAlign: 'center',
            marginTop: 'clamp(12px, 1.5cqi, 20px)',
            transitionDelay: '80ms',
          }}
        >
          <h4 style={{ ...subtitleStyle, display: 'block', width: '100%' }}>
            {subtitle}
          </h4>
        </div>

        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 24,
            position: 'relative',
            marginTop: 'clamp(20px, 2.5cqi, 32px)',
            transitionDelay: '160ms',
          }}
        >
          <div
            style={{
              ...linkRowStyle,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            <span>(</span>
            <span>{timerLabel}</span>
            <span>)</span>
          </div>

          <div
            style={{
              ...linkRowStyle,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <a href={link1Url} target='_blank' rel='noreferrer noopener'>
              {link1Label}
            </a>
            <span aria-hidden='true' style={{ opacity: 0.6 }}>
              /
            </span>
            <a href={link2Url} target='_blank' rel='noreferrer noopener'>
              {link2Label}
            </a>
            <span aria-hidden='true' style={{ opacity: 0.6 }}>
              /
            </span>
            <a href={link3Url} target='_blank' rel='noreferrer noopener'>
              {link3Label}
            </a>
          </div>
        </div>
      </div>

      {cards.length > 0 && (
        <div
          className='bungee-marquee'
          style={{ ['--bungee-speed' as string]: `${marqueeSpeed}s` }}
          aria-label='Image strip'
        >
          <div className='bungee-marquee-track'>
            {doubled.map((c, i) => {
              const isA = i % 2 === 0;
              return (
                <div
                  key={i}
                  className={`bungee-card ${isA ? 'bungee-card-a' : 'bungee-card-b'}`}
                >
                  {c.image?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image.url} alt={c.image.alt ?? ''} />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
