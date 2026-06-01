'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Framer Studio Manifesto — eyebrow + italic serif title + body + optional signature. */
export function FramerStudioManifesto({ content }: LegacyBlockComponentProps) {
  const eyebrow = String(content.eyebrow || 'PHILOSOPHY');
  const title = String(content.title || 'Our approach');
  const body = String(content.body || '');
  const signature = String(content.signature || '');
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-studio-manifesto'
      ref={ref}
      style={{
        background: '#F5F3EE',
        padding: 'clamp(100px, 16vh, 220px) clamp(24px, 4vw, 80px)',
        fontFamily: "'Funnel Display', 'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`
        #framer-studio-manifesto .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-studio-manifesto .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
      `}</style>

      <div style={{ maxWidth: 760, margin: '0 auto' }}>
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
            transitionDelay: '0ms',
          }}
        >
          {eyebrow}
        </div>

        <h2
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            fontFamily: "'Abril Fatface', 'Cormorant Garamond', serif",
            fontSize: 'clamp(44px, 6.5vw, 104px)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.0,
            color: '#1A1A1A',
            letterSpacing: '-0.02em',
            margin: '0 0 clamp(40px, 7vh, 80px)',
            transitionDelay: '160ms',
          }}
        >
          {title}
        </h2>

        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            fontSize: 'clamp(18px, 1.5vw, 24px)',
            lineHeight: 1.55,
            color: '#333',
            fontWeight: 400,
            textIndent: '2em',
            transitionDelay: '340ms',
          }}
        >
          {body}
        </div>

        {signature && (
          <div
            className={`rx-reveal ${visible ? 'is-visible' : ''}`}
            style={{
              marginTop: 'clamp(32px, 5vh, 56px)',
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#666',
              transitionDelay: '520ms',
            }}
          >
            {signature}
          </div>
        )}
      </div>
    </section>
  );
}
