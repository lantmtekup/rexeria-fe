'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

const titleStyle: React.CSSProperties = {
  fontFamily: '"Manrope", system-ui, sans-serif',
  fontSize: 72,
  fontWeight: 500,
  lineHeight: '1.2em',
  letterSpacing: '-0.05em',
  color: '#ffffff',
  margin: 0,
  textAlign: 'center',
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: '"Manrope", system-ui, sans-serif',
  fontSize: 16,
  fontWeight: 400,
  lineHeight: '24px',
  color: '#ffffff',
  margin: 0,
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: '"Manrope", system-ui, sans-serif',
  fontSize: 16,
  fontWeight: 400,
  lineHeight: '24px',
  color: '#ffffff',
  margin: 0,
  textAlign: 'center',
};

const buttonStyle: React.CSSProperties = {
  fontFamily: '"Manrope", system-ui, sans-serif',
  fontSize: 16,
  fontWeight: 500,
  color: '#000000',
  backgroundColor: '#ffffff',
  border: 'none',
  borderRadius: 999,
  padding: '14px 24px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  cursor: 'pointer',
  textDecoration: 'none',
};

/** Hero - Perform v2: 72/54 title + 544px subtitle wrapper, discrete 810 breakpoint. */
export function FramerPerformHeroV2({ content }: LegacyBlockComponentProps) {
  const eyebrow = String(content.eyebrow || 'Experienced triathlon coach');
  const title = String(content.title || 'Level Up Your Performance');
  const subtitle = String(content.subtitle || '');
  const buttonText = String(content.buttonText || 'Start now');
  const buttonHref = String(content.buttonHref || '#');
  const reviewsText = String(content.reviewsText || '');
  const bgImage = (content.bgImage as AssetRef | null) ?? null;
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-perform-hero-v2'
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'min(100vh, 900px)',
        padding: '0 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#000000',
        fontFamily: '"Manrope", system-ui, sans-serif',
      }}
    >
      <style>{`
        #framer-perform-hero-v2 .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-perform-hero-v2 .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-perform-hero-v2 .perform-title { font-size: 72px; }
        #framer-perform-hero-v2 .perform-sub-wrap { width: 544px; max-width: 544px; }
        @media (max-width: 810px) {
          #framer-perform-hero-v2 { padding: 120px 20px !important; justify-content: flex-start !important; }
          #framer-perform-hero-v2 .perform-title { font-size: 54px; }
          #framer-perform-hero-v2 .perform-sub-wrap { width: 100%; max-width: 100%; }
        }
      `}</style>

      <div
        aria-hidden='true'
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        {bgImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bgImage.url}
            alt={bgImage.alt ?? ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : null}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
          }}
        />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          width: '100%',
          maxWidth: 720,
        }}
      >
        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <span
            aria-hidden='true'
            style={{
              width: 24,
              height: 1,
              backgroundColor: '#ffffff',
              display: 'inline-block',
            }}
          />
          <span style={eyebrowStyle}>{eyebrow}</span>
        </div>

        <h1
          className={`perform-title rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{ ...titleStyle, transitionDelay: '80ms' }}
        >
          {title}
        </h1>

        <div
          className={`perform-sub-wrap rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{ transitionDelay: '160ms' }}
        >
          <p style={subtitleStyle}>{subtitle}</p>
        </div>

        <a
          href={buttonHref}
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{ ...buttonStyle, transitionDelay: '240ms' }}
        >
          <span style={{ fontSize: 16, fontWeight: 500 }}>{buttonText}</span>
          <svg
            aria-hidden='true'
            width='16'
            height='16'
            viewBox='0 0 16 16'
            fill='none'
            style={{ flex: 'none' }}
          >
            <path
              d='M3 8h10M9 4l4 4-4 4'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </a>

        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
            transitionDelay: '320ms',
          }}
        >
          <span
            aria-hidden='true'
            style={{ color: '#FBBF24', letterSpacing: 2, fontSize: 14 }}
          >
            ★★★★★
          </span>
          <span
            style={{
              fontFamily: '"Manrope", system-ui, sans-serif',
              fontSize: 14,
              fontWeight: 400,
              color: '#ffffff',
            }}
          >
            {reviewsText}
          </span>
        </div>
      </div>
    </section>
  );
}
