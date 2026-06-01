'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Framer explore CTA — centered, fades up on intersect. */
export function FramerExploreCta({ content }: LegacyBlockComponentProps) {
  const eyebrow = String(content.eyebrow || 'DISCOVER');
  const headline = String(content.headline || 'Explore more of our work');
  const linkLabel = String(content.linkLabel || 'EXPLORE MORE');
  const linkHref = String(content.linkHref || '#');
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-explore-cta'
      ref={ref}
      style={{
        background: '#F5F3EE',
        padding: 'clamp(80px, 12vh, 160px) clamp(24px, 4cqi, 80px)',
        textAlign: 'center',
        fontFamily: "'Funnel Display', 'Inter', -apple-system, sans-serif",
      }}
    >
      <style>{`
        #framer-explore-cta .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-explore-cta .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-explore-cta .fec-link { position: relative; }
        #framer-explore-cta .fec-link::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -6px;
          height: 1px;
          background: #1A1A1A;
          transform: scaleX(1);
          transform-origin: right;
          transition: transform 0.5s ${EASE_EXPO};
        }
        #framer-explore-cta .fec-link:hover::after { transform: scaleX(0); transform-origin: left; }
        @media (prefers-reduced-motion: reduce) {
          #framer-explore-cta .fec-link::after { transition: none; }
        }
      `}</style>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#555',
            marginBottom: 'clamp(24px, 4vh, 40px)',
          }}
        >
          {eyebrow}
        </div>
        <h2
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            fontFamily: "'Abril Fatface', 'Cormorant Garamond', serif",
            fontSize: 'clamp(36px, 5cqi, 72px)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.1,
            color: '#1A1A1A',
            letterSpacing: '-0.01em',
            margin: '0 0 clamp(32px, 5vh, 56px)',
          }}
        >
          {headline}
        </h2>
        <div className={`rx-reveal ${visible ? 'is-visible' : ''}`}>
          <a
            href={linkHref}
            className='fec-link'
            style={{
              display: 'inline-block',
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#1A1A1A',
              textDecoration: 'none',
              paddingBottom: 4,
            }}
            aria-label={linkLabel}
          >
            <span>{`[ ${linkLabel} ]`}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
