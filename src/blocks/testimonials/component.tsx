'use client';

import { useState } from 'react';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface Testimonial {
  quote?: string;
  author?: string;
  role?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const ACCENT = '#a88271';
const BG = '#f4efe2';
const INK = '#14110d';

export function Testimonials({ content }: LegacyBlockComponentProps) {
  const eyebrow = String(content.eyebrow || '');
  const title = String(content.title || '');
  const items = (
    Array.isArray(content.items) ? content.items : []
  ) as Testimonial[];
  const [active, setActive] = useState(0);
  const { ref, visible } = useReveal<HTMLElement>();

  const current = items[active] ?? items[0];

  return (
    <section
      id='testimonials-block'
      ref={ref}
      style={{
        padding: '120px 24px',
        background: BG,
        color: INK,
        fontFamily: 'Funnel Display, system-ui, sans-serif',
      }}
    >
      <style>{`
        #testimonials-block .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #testimonials-block .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #testimonials-block .quote-fade { transition: opacity 0.6s ${EASE_EXPO}; }
      `}</style>
      <div
        className={`rx-reveal ${visible ? 'is-visible' : ''}`}
        style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}
      >
        {eyebrow && (
          <div
            style={{
              color: ACCENT,
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h2
          style={{
            fontSize: 'clamp(28px, 3.5cqi, 48px)',
            fontWeight: 300,
            margin: '0 0 64px',
            lineHeight: 1.15,
          }}
        >
          {title}
        </h2>

        {current && (
          <div key={active} className='quote-fade'>
            <blockquote
              style={{
                fontSize: 'clamp(20px, 2.5cqi, 28px)',
                fontWeight: 300,
                lineHeight: 1.5,
                margin: 0,
                color: INK,
                fontStyle: 'italic',
              }}
            >
              &ldquo;{current.quote}&rdquo;
            </blockquote>
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {current.author}
              </div>
              {current.role && (
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(20,17,13,0.55)',
                    marginTop: 4,
                  }}
                >
                  {current.role}
                </div>
              )}
            </div>
          </div>
        )}

        {items.length > 1 && (
          <div
            style={{
              marginTop: 48,
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {items.map((_, i) => (
              <button
                key={i}
                type='button'
                onClick={() => setActive(i)}
                aria-label={`Testimonial ${i + 1}`}
                style={{
                  width: i === active ? 28 : 8,
                  height: 4,
                  borderRadius: 2,
                  border: 'none',
                  background: i === active ? ACCENT : 'rgba(20,17,13,0.18)',
                  cursor: 'pointer',
                  transition: `width 0.3s ${EASE_EXPO}, background 0.3s ${EASE_EXPO}`,
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
