'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const ACCENT = '#FF4D2E';
const INK = '#0B132A';

const headlineStyle: React.CSSProperties = {
  fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
  fontSize: 'clamp(22px, 4.2cqi, 46px)',
  fontWeight: 500,
  lineHeight: '1.05em',
  letterSpacing: '-0.02em',
  color: '#ffffff',
  margin: 0,
  whiteSpace: 'pre-line',
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(12px, 1cqi, 15px)',
  fontWeight: 500,
  color: '#ffffff',
  margin: 0,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
};

const agencyLabelStyle: React.CSSProperties = {
  fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
  fontSize: 'clamp(14px, 2.2cqi, 26px)',
  fontWeight: 500,
  color: '#ffffff',
  margin: 0,
  letterSpacing: '-0.01em',
  lineHeight: 1.1,
};

const wordmarkStyle: React.CSSProperties = {
  fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
  fontSize: 'clamp(42px, 18cqi, 260px)',
  fontWeight: 600,
  lineHeight: 0.9,
  letterSpacing: '-0.04em',
  color: ACCENT,
  margin: 0,
  whiteSpace: 'nowrap',
};

/** Hero - 03 (Arpeggio): portrait BG + headline + agency label + huge wordmark. */
export function FramerArpeggioHero({ content }: LegacyBlockComponentProps) {
  const headline = String(
    content.headline || 'One subscription,\nunlimited design iterations.'
  );
  const subtitle = String(
    content.subtitle || 'Freedom beyond the traditional project scope'
  );
  const topRightLabel = String(content.topRightLabel || 'The Creative Agency—');
  const wordmark = String(content.wordmark || 'Arpeggio');
  const wordmarkSuffix = String(content.wordmarkSuffix || '®');
  const bg = (content.backgroundImage as AssetRef | null) ?? null;
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-arpeggio-hero'
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'clamp(480px, 100vh, 900px)',
        overflow: 'hidden',
        background: INK,
        fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        #framer-arpeggio-hero .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-arpeggio-hero .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-arpeggio-hero .arpeggio-top-row {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: clamp(24px, 5cqi, 80px);
          padding: clamp(32px, 8cqi, 110px) clamp(20px, 5cqi, 80px) 0;
        }
        #framer-arpeggio-hero .arpeggio-agency-label { flex-shrink: 0; max-width: 280px; text-align: right; }
        @media (max-width: 809px) {
          #framer-arpeggio-hero .arpeggio-top-row { flex-direction: column; align-items: stretch; gap: 12px; }
          #framer-arpeggio-hero .arpeggio-agency-label { align-self: flex-start; max-width: 100%; text-align: left; }
        }
      `}</style>

      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
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
              'linear-gradient(180deg, rgba(11,19,42,0.55) 0%, rgba(11,19,42,0.2) 30%, rgba(11,19,42,0.0) 60%, rgba(11,19,42,0.4) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      <div className='arpeggio-top-row'>
        <div style={{ flex: '1 1 0', minWidth: 0, maxWidth: 720 }}>
          <div className={`rx-reveal ${visible ? 'is-visible' : ''}`}>
            <h1 style={headlineStyle}>{headline}</h1>
          </div>
          <div
            className={`rx-reveal ${visible ? 'is-visible' : ''}`}
            style={{ marginTop: 24, transitionDelay: '80ms' }}
          >
            <span
              aria-hidden='true'
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: ACCENT,
                display: 'inline-block',
                marginRight: 10,
                verticalAlign: 'middle',
              }}
            />
            <span style={subtitleStyle}>{subtitle}</span>
          </div>
        </div>

        <div
          className={`arpeggio-agency-label rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{ transitionDelay: '160ms' }}
        >
          <div style={agencyLabelStyle}>{topRightLabel}</div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div
        className={`rx-reveal ${visible ? 'is-visible' : ''}`}
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding:
            'clamp(8px, 2cqi, 16px) clamp(20px, 5cqi, 80px) clamp(16px, 2cqi, 24px)',
          gap: 12,
          transitionDelay: '240ms',
        }}
      >
        <h2 style={wordmarkStyle}>{wordmark}</h2>
        <span
          aria-hidden='true'
          style={{
            fontFamily: 'inherit',
            fontSize: 'clamp(18px, 2cqi, 32px)',
            color: ACCENT,
            fontWeight: 600,
            alignSelf: 'flex-start',
            marginTop: 'clamp(12px, 3cqi, 36px)',
          }}
        >
          {wordmarkSuffix}
        </span>
      </div>
    </section>
  );
}
