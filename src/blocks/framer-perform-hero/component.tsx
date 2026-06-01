'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

const titleLineStyle: React.CSSProperties = {
  fontFamily: '"Manrope", system-ui, sans-serif',
  fontSize: 'clamp(40px, 6cqi, 72px)',
  fontWeight: 500,
  lineHeight: '1.2em',
  letterSpacing: '-0.05em',
  color: '#ffffff',
  margin: 0,
  textShadow: '0 2px 24px rgba(0, 0, 0, 0.35)',
};

/** Hero - 01 (Perform v1): Manrope 72/500 + dark-overlay bg + pill CTA + star reviews. */
export function FramerPerformHero({ content }: LegacyBlockComponentProps) {
  const eyebrow = String(content.eyebrow || 'Experienced triathlon coach');
  const titleRaw = String(content.title || 'Level Up Your\nPerformance');
  const subtitle = String(
    content.subtitle ||
      'Improve your triathlon performance with personalized training plans guided by an experienced coach committed to your success.'
  );
  const ctaLabel = String(content.ctaLabel || 'Start now');
  const ctaHref = String(content.ctaHref || '#start');
  const reviewStars = Number(content.reviewStars ?? 5);
  const reviewCount = String(
    content.reviewCount || '100+ Positive Client Reviews'
  );
  const bg = (content.backgroundImage as AssetRef | null) ?? null;
  const titleLines = titleRaw.split('\n').filter(Boolean);
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-perform-hero'
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'clamp(460px, 100vh, 900px)',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        fontFamily: '"Manrope", system-ui, sans-serif',
      }}
    >
      <style>{`
        #framer-perform-hero .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-perform-hero .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
      `}</style>

      {bg?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bg.url}
          alt={bg.alt ?? ''}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : null}

      <div
        aria-hidden='true'
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 35%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: 'inherit',
          padding: 'clamp(24px, 5cqi, 64px)',
          maxWidth: 720,
        }}
      >
        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span
            aria-hidden='true'
            style={{
              width: 24,
              height: 1,
              background: 'rgba(255,255,255,0.6)',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: 0.2,
            }}
          >
            {eyebrow}
          </span>
        </div>

        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{ marginBottom: 24, transitionDelay: '80ms' }}
        >
          {titleLines.map((line, i) => (
            <h1 key={i} style={titleLineStyle}>
              {line}
            </h1>
          ))}
        </div>

        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{ marginBottom: 32, maxWidth: 520, transitionDelay: '160ms' }}
        >
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.85)',
              margin: 0,
            }}
          >
            {subtitle}
          </p>
        </div>

        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{ marginBottom: 48, transitionDelay: '240ms' }}
        >
          <a
            href={ctaHref}
            aria-label={ctaLabel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 22px',
              background: '#ffffff',
              color: '#0c0c0c',
              borderRadius: 999,
              fontSize: 15,
              fontWeight: 500,
              textDecoration: 'none',
              lineHeight: 1,
            }}
          >
            <span>{ctaLabel}</span>
            <span aria-hidden='true' style={{ fontSize: 16, lineHeight: 1 }}>
              ↗
            </span>
          </a>
        </div>

        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transitionDelay: '320ms',
          }}
        >
          <div
            aria-label={`${reviewStars} out of 5 stars`}
            style={{ display: 'inline-flex', gap: 2, color: '#ffffff' }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                aria-hidden='true'
                style={{
                  fontSize: 14,
                  color: i < reviewStars ? '#ffffff' : 'rgba(255,255,255,0.3)',
                }}
              >
                ★
              </span>
            ))}
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            {reviewCount}
          </span>
        </div>
      </div>
    </section>
  );
}
