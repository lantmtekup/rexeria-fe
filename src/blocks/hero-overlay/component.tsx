'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const ACCENT = '#a88271';

export function HeroOverlay({ content }: LegacyBlockComponentProps) {
  const tag = String(content.tag || '');
  const title = String(content.title || '');
  const subtitle = String(content.subtitle || '');
  const ctaText = String(content.ctaText || '');
  const scrollHint = String(content.scrollHint || '');
  const bg = content.backgroundImage as AssetRef | null;
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='hero-overlay'
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        fontFamily: 'Funnel Display, system-ui, sans-serif',
      }}
    >
      <style>{`
        #hero-overlay .rx-fade { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.2s ${EASE_EXPO}, transform 1.2s ${EASE_EXPO}; }
        #hero-overlay .rx-fade.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #hero-overlay .bg-zoom { transform: scale(1.08); transition: transform 2.4s ${EASE_EXPO}; }
        #hero-overlay .bg-zoom.is-visible { transform: scale(1); }
        @keyframes ho-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50% { transform: translateY(6px); opacity: 1; }
        }
      `}</style>

      {/* BG image */}
      <div
        className={`bg-zoom ${visible ? 'is-visible' : ''}`}
        style={{ position: 'absolute', inset: 0 }}
      >
        {bg?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bg.url}
            alt={bg.alt ?? title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(180deg, #14110d 0%, #2a2520 60%, #14110d 100%)',
            }}
          />
        )}
        {/* Dark gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.55) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        {tag && (
          <div
            className={`rx-fade ${visible ? 'is-visible' : ''}`}
            style={{
              fontSize: 11,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: ACCENT,
              marginBottom: 32,
              fontFamily: 'DM Mono, monospace',
            }}
          >
            {tag}
          </div>
        )}
        <h1
          className={`rx-fade ${visible ? 'is-visible' : ''}`}
          style={{
            fontSize: 'clamp(40px, 6cqi, 92px)',
            fontWeight: 200,
            margin: 0,
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            whiteSpace: 'pre-line',
            transitionDelay: '120ms',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={`rx-fade ${visible ? 'is-visible' : ''}`}
            style={{
              maxWidth: 640,
              fontSize: 16,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.78)',
              margin: '32px auto 48px',
              transitionDelay: '240ms',
            }}
          >
            {subtitle}
          </p>
        )}
        {ctaText && (
          <button
            type='button'
            className={`rx-fade ${visible ? 'is-visible' : ''}`}
            style={{
              background: '#fff',
              color: '#14110d',
              padding: '16px 36px',
              border: 'none',
              fontSize: 12,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 600,
              cursor: 'pointer',
              transitionDelay: '360ms',
            }}
          >
            {ctaText}
          </button>
        )}
      </div>

      {/* Scroll hint */}
      {scrollHint && (
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: 10,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            zIndex: 2,
            animation: 'ho-bounce 2.4s ease-in-out infinite',
          }}
        >
          {scrollHint}
          <span style={{ fontSize: 14 }}>↓</span>
        </div>
      )}
    </section>
  );
}
