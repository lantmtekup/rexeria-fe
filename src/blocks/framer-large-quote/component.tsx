'use client';

import { useMemo } from 'react';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Large italic quote with word-by-word fade reveal on viewport enter. */
export function FramerLargeQuote({ content }: LegacyBlockComponentProps) {
  const quote = String(content.quote || '');
  const author = String(content.author || '');
  const role = String(content.role || '');
  const variant = content.variant === 'dark' ? 'dark' : 'light';
  const isDark = variant === 'dark';
  const { ref, visible } = useReveal<HTMLElement>();

  const words = useMemo(() => {
    const plain = quote.replace(/<[^>]+>/g, '').trim();
    return plain.split(/\s+/).filter(Boolean);
  }, [quote]);

  const bg = isDark ? '#1A1A1A' : '#F5F3EE';
  const fg = isDark ? '#F5F3EE' : '#1A1A1A';
  const mute = isDark ? 'rgba(245,243,238,0.6)' : '#666';

  return (
    <section
      id='framer-large-quote'
      ref={ref}
      style={{
        background: bg,
        padding: 'clamp(100px, 18vh, 240px) clamp(24px, 4vw, 80px)',
        fontFamily: "'Funnel Display', 'Inter', system-ui, sans-serif",
        textAlign: 'center',
      }}
    >
      <style>{`
        #framer-large-quote .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-large-quote .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-large-quote .flq-word { display: inline-block; opacity: 0; transform: translate3d(0, 18px, 0); transition: opacity 0.7s ${EASE_EXPO}, transform 0.7s ${EASE_EXPO}; will-change: transform, opacity; }
        #framer-large-quote .flq-word.is-visible { opacity: 1; transform: translate3d(0,0,0); }
      `}</style>

      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div
          style={{
            fontFamily: "'Abril Fatface', 'Cormorant Garamond', serif",
            fontSize: 'clamp(36px, 5.2vw, 88px)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.12,
            color: fg,
            letterSpacing: '-0.015em',
            margin: '0 0 clamp(32px, 5vh, 56px)',
          }}
        >
          <span aria-hidden>
            {words.map((w, i) => (
              <span
                key={i}
                className={`flq-word ${visible ? 'is-visible' : ''}`}
                style={{
                  transitionDelay: `${i * 40}ms`,
                  marginRight: '0.25em',
                }}
              >
                {w}
              </span>
            ))}
          </span>
          <span
            className='sr-only'
            style={{ position: 'absolute', left: -9999 }}
          >
            {quote}
          </span>
        </div>

        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            transitionDelay: `${words.length * 40 + 200}ms`,
          }}
        >
          <div
            style={{
              fontFamily: "'Aboreto', 'Funnel Display', serif",
              fontSize: 'clamp(14px, 1.2vw, 18px)',
              letterSpacing: '0.04em',
              color: fg,
            }}
          >
            {author}
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: mute,
            }}
          >
            {role}
          </div>
        </div>
      </div>
    </section>
  );
}
