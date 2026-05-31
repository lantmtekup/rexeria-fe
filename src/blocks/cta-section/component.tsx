'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const BG_DARKER = '#161310';
const ACCENT = '#a88271';

export function CtaSection({ content }: LegacyBlockComponentProps) {
  const title = String(content.title || 'Bắt đầu ngay');
  const body = String(content.body || '');
  const ctaText = String(content.ctaText || content.cta_text || '');
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='cta-section'
      ref={ref}
      style={{
        padding: '120px 24px',
        background: BG_DARKER,
        color: '#fff',
        fontFamily: 'Funnel Display, system-ui, sans-serif',
      }}
    >
      <style>{`
        #cta-section .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #cta-section .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
      `}</style>
      <div
        className={`rx-reveal ${visible ? 'is-visible' : ''}`}
        style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}
      >
        <h2
          style={{
            fontSize: 'clamp(32px, 4cqi, 56px)',
            fontWeight: 300,
            marginBottom: 16,
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          {title}
        </h2>
        {body && (
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.7)',
              margin: '24px auto 40px',
              maxWidth: 540,
            }}
          >
            {body}
          </p>
        )}
        {ctaText && (
          <span
            style={{
              display: 'inline-block',
              background: ACCENT,
              color: '#fff',
              padding: '16px 36px',
              borderRadius: 999,
              fontSize: 13,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {ctaText}
          </span>
        )}
      </div>
    </section>
  );
}
