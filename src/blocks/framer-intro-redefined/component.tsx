'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Framer Intro Redefined — eyebrow top-right + italic serif title + body. */
export function FramerIntroRedefined({ content }: LegacyBlockComponentProps) {
  const eyebrow = String(content.eyebrow || 'Epictower Onsen');
  const title = String(content.title || 'Life Style Redefined.');
  const body = String(content.body || '');
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-intro-redefined'
      ref={ref}
      style={{
        background: '#ffffff',
        padding: 'clamp(80px, 12vh, 180px) clamp(24px, 4vw, 80px)',
        fontFamily: "'Funnel Display', 'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`
        #framer-intro-redefined .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-intro-redefined .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            textAlign: 'right',
            marginBottom: 'clamp(24px, 4vh, 48px)',
            transitionDelay: '240ms',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#555',
            }}
          >
            {eyebrow}
          </div>
        </div>

        <h2
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            fontFamily: "'Abril Fatface', 'Cormorant Garamond', serif",
            fontSize: 'clamp(44px, 6vw, 96px)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.08,
            color: '#111',
            letterSpacing: '-0.01em',
            margin: '0 0 clamp(24px, 3vh, 48px)',
            maxWidth: 1100,
            transitionDelay: '120ms',
            whiteSpace: 'pre-line',
          }}
        >
          {title}
        </h2>

        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            fontSize: 'clamp(16px, 1.4vw, 20px)',
            lineHeight: 1.55,
            color: '#444',
            maxWidth: 620,
            fontWeight: 400,
            transitionDelay: '0ms',
          }}
        >
          {body}
        </div>
      </div>
    </section>
  );
}
