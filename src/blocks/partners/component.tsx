'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface PartnerItem {
  role?: string;
  name?: string;
  desc?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const ACCENT = '#a88271';
const SAND = '#e8e2d3';
const INK = '#14110d';

export function Partners({ content }: LegacyBlockComponentProps) {
  const eyebrow = String(content.eyebrow || '');
  const title = String(content.title || '');
  const body = String(content.body || '');
  const items = (
    Array.isArray(content.items) ? content.items : []
  ) as PartnerItem[];
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='partners-block'
      ref={ref}
      style={{
        padding: '120px 24px',
        background: SAND,
        color: INK,
        fontFamily: 'Funnel Display, system-ui, sans-serif',
      }}
    >
      <style>{`
        #partners-block .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #partners-block .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{ textAlign: 'center', marginBottom: 64 }}
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
              fontSize: 'clamp(32px, 4cqi, 56px)',
              fontWeight: 300,
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            {title}
          </h2>
          {body && (
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.7,
                color: 'rgba(20,17,13,0.6)',
                margin: '20px auto 0',
                maxWidth: 540,
              }}
            >
              {body}
            </p>
          )}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {items.map((p, i) => (
            <PartnerCard key={i} item={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerCard({ item, index }: { item: PartnerItem; index: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`rx-reveal ${visible ? 'is-visible' : ''}`}
      style={{
        background: '#fff',
        padding: 32,
        transitionDelay: `${index * 80}ms`,
      }}
    >
      {item.role && (
        <div
          style={{
            fontSize: 10,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: ACCENT,
            marginBottom: 14,
          }}
        >
          {item.role}
        </div>
      )}
      <h3
        style={{
          fontSize: 24,
          fontWeight: 400,
          color: INK,
          margin: '0 0 12px',
          letterSpacing: '-0.01em',
        }}
      >
        {item.name}
      </h3>
      {item.desc && (
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: 'rgba(20,17,13,0.6)',
            margin: 0,
          }}
        >
          {item.desc}
        </p>
      )}
    </div>
  );
}
