'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const ACCENT = 'rgb(255, 98, 0)';
const BG = '#3a4f4a';

const wordmarkMainStyle: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(54px, 16.5cqi, 214px)',
  fontWeight: 500,
  lineHeight: '0.8em',
  letterSpacing: '-0.09em',
  color: ACCENT,
  margin: 0,
};

const wordmarkAfterStyle: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(40px, 12.3cqi, 159.5px)',
  fontWeight: 500,
  lineHeight: '0.8em',
  letterSpacing: '-0.07em',
  color: '#ffffff',
  margin: 0,
};

const wordmarkSuffixStyle: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(18px, 3cqi, 38px)',
  fontWeight: 500,
  color: ACCENT,
  lineHeight: 1,
  marginTop: 'clamp(8px, 1.6cqi, 22px)',
};

const topHeadingStyle: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(18px, 2.2cqi, 28px)',
  fontWeight: 500,
  lineHeight: 1.15,
  letterSpacing: '-0.01em',
  color: '#ffffff',
  margin: 0,
  textAlign: 'right',
  whiteSpace: 'pre-line',
};

const taglineStyle: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(14px, 1.4cqi, 18px)',
  fontWeight: 400,
  fontStyle: 'italic',
  color: '#ffffff',
  margin: 0,
  letterSpacing: '-0.01em',
};

const brandMarkStyle: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(11px, 1cqi, 13px)',
  fontWeight: 600,
  letterSpacing: '0.18em',
  color: '#ffffff',
  margin: 0,
};

/** Hero - 04 (Avexa): top brand+headline / bottom italic tagline+orange wordmark. */
export function FramerAvexaHero({ content }: LegacyBlockComponentProps) {
  const brandMark = String(content.brandMark || 'AVEXA');
  const topHeading = String(
    content.topHeading || 'Elevate Brands Through Bold Thinking'
  );
  const tagline = String(
    content.tagline || 'Creative strategy that drives results'
  );
  const wordmark = String(content.wordmark || 'Avexa');
  const wordmarkSuffix = String(content.wordmarkSuffix || '®');
  const wordmarkAfter = String(content.wordmarkAfter || 'Studio');
  const bg = (content.backgroundImage as AssetRef | null) ?? null;
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-avexa-hero'
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'clamp(480px, 100vh, 960px)',
        overflow: 'hidden',
        background: BG,
        fontFamily: '"Inter", system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        #framer-avexa-hero .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-avexa-hero .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-avexa-hero .avexa-top-row {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: clamp(16px, 4cqi, 64px);
          padding: clamp(28px, 4cqi, 56px) clamp(24px, 5cqi, 64px) 0;
        }
        #framer-avexa-hero .avexa-bottom-row {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: clamp(16px, 4cqi, 64px);
          padding: 0 clamp(24px, 5cqi, 64px) clamp(8px, 2cqi, 24px);
        }
        @media (max-width: 809px) {
          #framer-avexa-hero .avexa-top-row { flex-direction: column; align-items: stretch; gap: 12px; }
          #framer-avexa-hero .avexa-bottom-row { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      `}</style>

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
              'linear-gradient(180deg, rgba(58,79,74,0.30) 0%, rgba(58,79,74,0.05) 35%, rgba(58,79,74,0.0) 60%, rgba(58,79,74,0.55) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      <div className='avexa-top-row'>
        <div className={`rx-reveal ${visible ? 'is-visible' : ''}`}>
          <span style={brandMarkStyle}>{brandMark}</span>
        </div>
        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{ maxWidth: 360, transitionDelay: '80ms' }}
        >
          <h4 style={topHeadingStyle}>{topHeading}</h4>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div className='avexa-bottom-row'>
        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            maxWidth: 320,
            paddingBottom: 'clamp(24px, 4cqi, 48px)',
            flexShrink: 0,
            transitionDelay: '160ms',
          }}
        >
          <h4 style={taglineStyle}>{tagline}</h4>
        </div>

        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            flexWrap: 'nowrap',
            gap: 0,
            minWidth: 0,
            transitionDelay: '240ms',
          }}
        >
          <span style={wordmarkMainStyle}>{wordmark}</span>
          <span aria-hidden='true' style={wordmarkSuffixStyle}>
            {wordmarkSuffix}
          </span>
          <span
            style={{
              ...wordmarkAfterStyle,
              marginLeft: 'clamp(4px, 0.8cqi, 10px)',
            }}
          >
            {wordmarkAfter}
          </span>
        </div>
      </div>
    </section>
  );
}
