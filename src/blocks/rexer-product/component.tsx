'use client';

/**
 * Rexer Product — apartment grid card. Reveal animation phục hồi 2026-05-31:
 * header fade-in khi section enter viewport, cards stagger 80ms delay theo
 * index. Inline `<style>` cho .rx-reveal vì rexerai không có global CSS
 * tokens kiểu 360-cms. CSS scoped via section id.
 */

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

interface ProductItem {
  tag?: string;
  area?: string;
  image?: AssetRef | null;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

const C = {
  sand: '#e8e2d3',
  sandPale: '#f4efe2',
  ink: '#14110d',
  roseDeep: '#a88271',
};

function ProductCard({ item, index }: { item: ProductItem; index: number }) {
  const { ref, visible } = useReveal<HTMLElement>();
  const imgUrl = item.image?.url ?? '';
  return (
    <article
      ref={ref}
      className={`rx-reveal ${visible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div
        style={{
          aspectRatio: '4 / 5',
          overflow: 'hidden',
          background: C.sandPale,
          marginBottom: 16,
        }}
      >
        {imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgUrl}
            alt={item.tag ?? ''}
            loading='lazy'
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: `transform 1.4s ${EASE_EXPO}`,
            }}
            onMouseEnter={e =>
              (e.currentTarget.style.transform = 'scale(1.04)')
            }
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : null}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: 'Funnel Display, sans-serif',
            fontSize: 26,
            fontWeight: 400,
            letterSpacing: '-0.01em',
            color: C.ink,
          }}
        >
          {item.tag}
        </span>
        <span
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(20,17,13,0.55)',
          }}
        >
          {item.area}
        </span>
      </div>
    </article>
  );
}

export function RexerProduct({ content }: LegacyBlockComponentProps) {
  const eyebrowLabel = String(content.eyebrowLabel ?? '02 · Căn hộ');
  const heading = String(
    content.heading ?? 'Bốn định dạng,\nmột ngôn ngữ kiến trúc.'
  );
  const items: ProductItem[] = Array.isArray(content.items)
    ? (content.items as ProductItem[])
    : [];

  const { ref, visible } = useReveal<HTMLElement>();
  const [line1, line2] = heading.split('\n');

  return (
    <section
      id='rexer-product'
      ref={ref}
      style={{
        padding: 'clamp(80px, 12vh, 160px) 24px',
        background: C.sand,
        color: C.ink,
      }}
    >
      {/* Scoped reveal CSS — inline để self-contained không phụ thuộc global. */}
      <style>{`
        #rexer-product .rx-reveal {
          opacity: 0;
          transform: translate3d(0, 24px, 0);
          transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO};
        }
        #rexer-product .rx-reveal.is-visible {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
        @media (prefers-reduced-motion: reduce) {
          #rexer-product .rx-reveal {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{ marginBottom: 'clamp(48px, 8cqi, 96px)' }}
        >
          <div
            style={{
              color: C.roseDeep,
              fontFamily: 'DM Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            {eyebrowLabel}
          </div>
          <h2
            style={{
              fontSize: 'clamp(36px, 5cqi, 76px)',
              color: C.ink,
              maxWidth: 960,
              fontWeight: 300,
              fontFamily: 'Funnel Display, sans-serif',
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            {line1}
            {line2 ? (
              <>
                <br />
                <span style={{ color: C.roseDeep }}>{line2}</span>
              </>
            ) : null}
          </h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'clamp(16px, 2cqi, 28px)',
          }}
        >
          {items.map((it, i) => (
            <ProductCard key={it.tag ?? i} item={it} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
