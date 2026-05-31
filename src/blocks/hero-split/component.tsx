'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

interface Stat {
  value?: string;
  label?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const ACCENT = '#a88271';
const BG = '#fafaf7';
const INK = '#14110d';

export function HeroSplit({ content }: LegacyBlockComponentProps) {
  const eyebrow = String(content.eyebrow || '');
  const title = String(content.title || '');
  const body = String(content.body || '');
  const ctaText = String(content.ctaText || 'Explore');
  const heroImage = content.heroImage as AssetRef | null;
  const stats = (Array.isArray(content.stats) ? content.stats : []) as Stat[];
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='hero-split'
      ref={ref}
      style={{
        minHeight: '100vh',
        padding: '80px 24px',
        background: BG,
        color: INK,
        fontFamily: 'Funnel Display, system-ui, sans-serif',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <style>{`
        #hero-split .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #hero-split .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
      `}</style>
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 80,
          alignItems: 'center',
        }}
      >
        <div className={`rx-reveal ${visible ? 'is-visible' : ''}`}>
          {eyebrow && (
            <div
              style={{
                color: ACCENT,
                fontSize: 11,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                marginBottom: 24,
                fontFamily: 'DM Mono, monospace',
              }}
            >
              {eyebrow}
            </div>
          )}
          <h1
            style={{
              fontSize: 'clamp(40px, 5.5cqi, 88px)',
              fontWeight: 300,
              margin: 0,
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              whiteSpace: 'pre-line',
            }}
          >
            {title}
          </h1>
          {body && (
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.7,
                color: 'rgba(20,17,13,0.6)',
                margin: '32px 0 40px',
                maxWidth: 480,
              }}
            >
              {body}
            </p>
          )}
          {ctaText && (
            <button
              type='button'
              style={{
                background: INK,
                color: '#fff',
                padding: '14px 32px',
                border: 'none',
                fontSize: 12,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {ctaText} →
            </button>
          )}

          {stats.length > 0 && (
            <div
              style={{
                marginTop: 64,
                display: 'flex',
                gap: 48,
                borderTop: '1px solid rgba(20,17,13,0.1)',
                paddingTop: 32,
              }}
            >
              {stats.map((s, i) => (
                <div key={i}>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 300,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'rgba(20,17,13,0.5)',
                      marginTop: 6,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            aspectRatio: '3 / 4',
            background: '#e8e2d3',
            overflow: 'hidden',
            transitionDelay: '160ms',
          }}
        >
          {heroImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImage.url}
              alt={heroImage.alt ?? title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
