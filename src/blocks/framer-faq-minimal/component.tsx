'use client';

import { useState } from 'react';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface FaqItem {
  question: string;
  answer: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Framer minimal FAQ — big serif title + pill CTA + accordion with thin dividers */
export function FramerFaqMinimal({ content }: LegacyBlockComponentProps) {
  const title = String(content.title || 'Have some questions?');
  const ctaText = String(content.ctaText || 'Ask a question');
  const ctaHref = String(content.ctaHref || '#');
  const items = Array.isArray(content.items)
    ? (content.items as FaqItem[])
    : [];
  const [openIdx, setOpenIdx] = useState<number>(0);
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-faq-minimal'
      ref={ref}
      style={{
        background: '#ffffff',
        padding: 'clamp(80px, 12vh, 180px) clamp(24px, 4cqi, 80px)',
        fontFamily: "'Funnel Display', 'Inter', -apple-system, sans-serif",
      }}
    >
      <style>{`
        #framer-faq-minimal .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-faq-minimal .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
      `}</style>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'clamp(40px, 6cqi, 100px)',
          alignItems: 'start',
        }}
      >
        {/* Left: title + CTA */}
        <div className={`rx-reveal ${visible ? 'is-visible' : ''}`}>
          <h2
            style={{
              fontFamily: "'Aboreto', sans-serif",
              fontSize: 'clamp(40px, 5cqi, 72px)',
              fontStyle: 'italic',
              fontWeight: 400,
              lineHeight: 1.1,
              color: '#111',
              letterSpacing: -0.5,
              margin: '0 0 32px',
            }}
          >
            {title}
          </h2>
          <a
            href={ctaHref}
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              background: '#111',
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: 1,
              textDecoration: 'none',
              borderRadius: 100,
              transition: 'background 0.2s',
            }}
          >
            <span style={{ color: '#fff' }}>{ctaText}</span>
          </a>
        </div>

        {/* Right: accordion */}
        <div className={`rx-reveal ${visible ? 'is-visible' : ''}`}>
          {items.map((it, i) => {
            const open = openIdx === i;
            return (
              <div key={i} style={{ borderTop: '1px solid #e0e0e0' }}>
                <button
                  type='button'
                  onClick={() => setOpenIdx(open ? -1 : i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '24px 0',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: 'clamp(16px, 1.3cqi, 20px)',
                    fontWeight: 500,
                    color: '#111',
                    fontFamily: 'inherit',
                  }}
                  aria-expanded={open}
                >
                  <span style={{ flex: 1, paddingRight: 16 }}>
                    {String(it.question || '')}
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      transition: 'transform 0.3s',
                      transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
                      flexShrink: 0,
                      color: '#00940c',
                    }}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                <div
                  style={{
                    maxHeight: open ? 400 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.4s ease, padding 0.3s ease',
                    paddingBottom: open ? 24 : 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 'clamp(14px, 1.1cqi, 17px)',
                      lineHeight: 1.55,
                      color: '#555',
                    }}
                  >
                    {String(it.answer || '')}
                  </div>
                </div>
              </div>
            );
          })}
          {items.length > 0 && (
            <div style={{ borderTop: '1px solid #e0e0e0' }} aria-hidden />
          )}
        </div>
      </div>
    </section>
  );
}
