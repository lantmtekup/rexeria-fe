'use client';

/**
 * FAQ — accordion câu hỏi. Stripped down từ 360-cms (bỏ EditableContainer
 * / EditableText wrappers, dùng plain DOM). Catalog preview render-only.
 */

import type { LegacyBlockComponentProps } from '../types';

interface FaqItem {
  question?: string;
  answer?: string;
}

const ACCENT = '#a88271';
const BG_DARKEST = '#0e0d0a';
const TEXT_DIM = 'rgba(255,255,255,0.65)';
const BORDER_SUBTLE = 'rgba(255,255,255,0.12)';
const FONT_FAMILY = 'Funnel Display, system-ui, sans-serif';

export function Faq({ content }: LegacyBlockComponentProps) {
  const eyebrow = String(content.eyebrow || '');
  const title = String(content.title || '');
  const items = (
    Array.isArray(content.items) ? content.items : []
  ) as FaqItem[];

  return (
    <section
      style={{
        padding: '100px 40px',
        background: BG_DARKEST,
        color: '#fff',
        fontFamily: FONT_FAMILY,
      }}
    >
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
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
              fontSize: 'clamp(28px, 4cqi, 48px)',
              fontWeight: 300,
              whiteSpace: 'pre-line',
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>

        {items.map((faq, i) => (
          <div
            key={i}
            style={{
              borderBottom: `1px solid ${BORDER_SUBTLE}`,
              padding: '20px 0',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                {faq.question}
              </span>
              <span
                style={{
                  color: ACCENT,
                  fontSize: 14,
                  flexShrink: 0,
                  marginLeft: 16,
                }}
              >
                &#x25BC;
              </span>
            </div>
            <div
              style={{
                fontSize: 14,
                color: TEXT_DIM,
                lineHeight: 1.7,
                marginTop: 12,
                paddingRight: 32,
              }}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
