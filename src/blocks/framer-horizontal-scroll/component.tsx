'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

interface Item {
  image?: AssetRef | null;
  label?: string;
  caption?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Horizontal scroll (simplified port) — original used sticky-pinned scroll
 * driven translateX; this port renders a native horizontally-scrollable card
 * row with the same card layout (4:5 image + label + caption).
 */
export function FramerHorizontalScroll({ content }: LegacyBlockComponentProps) {
  const eyebrow = String(content.eyebrow || 'SHOWCASE');
  const title = String(content.title || 'Spaces');
  const items = Array.isArray(content.items) ? (content.items as Item[]) : [];
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-horizontal-scroll'
      ref={ref}
      style={{
        background: '#F5F3EE',
        position: 'relative',
        fontFamily: "'Funnel Display', 'Inter', -apple-system, sans-serif",
        padding: 'clamp(60px, 10vh, 120px) 0',
        overflow: 'hidden',
      }}
    >
      <style>{`
        #framer-horizontal-scroll .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-horizontal-scroll .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-horizontal-scroll .fhs-header {
          padding: 0 clamp(24px, 4cqi, 80px) clamp(24px, 4vh, 48px);
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 24px;
          flex-wrap: wrap;
        }
        #framer-horizontal-scroll .fhs-track {
          display: flex;
          gap: clamp(20px, 3cqi, 48px);
          padding: 0 clamp(40px, 8cqi, 160px);
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: thin;
          -webkit-overflow-scrolling: touch;
        }
        #framer-horizontal-scroll .fhs-card {
          flex-shrink: 0;
          width: clamp(260px, 32cqi, 520px);
          display: flex;
          flex-direction: column;
          gap: 16px;
          scroll-snap-align: start;
        }
        #framer-horizontal-scroll .fhs-media {
          width: 100%;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: #E8E5DE;
          position: relative;
        }
        #framer-horizontal-scroll .fhs-media img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        @media (max-width: 720px) {
          #framer-horizontal-scroll .fhs-card { width: 72vw; }
        }
      `}</style>

      <div className={`fhs-header rx-reveal ${visible ? 'is-visible' : ''}`}>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#555',
          }}
        >
          {eyebrow}
        </div>
        <h2
          style={{
            fontFamily: "'Abril Fatface', 'Cormorant Garamond', serif",
            fontSize: 'clamp(36px, 4.5cqi, 72px)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.0,
            color: '#1A1A1A',
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>

      <div className='fhs-track'>
        {items.map((it, i) => {
          const url = it.image?.url || '';
          const alt = it.image?.alt ?? it.label ?? '';
          return (
            <div
              key={i}
              className={`fhs-card rx-reveal ${visible ? 'is-visible' : ''}`}
            >
              <div className='fhs-media'>
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt={alt} />
                ) : null}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: 12,
                  padding: '0 4px',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Aboreto', 'Funnel Display', serif",
                    fontSize: 'clamp(18px, 1.6cqi, 24px)',
                    color: '#1A1A1A',
                    letterSpacing: '0.02em',
                  }}
                >
                  {String(it.label || '')}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#777',
                  }}
                >
                  {String(it.caption || '')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
