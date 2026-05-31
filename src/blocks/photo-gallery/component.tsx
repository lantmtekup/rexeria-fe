'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface GalleryItem {
  src?: string;
  label?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const BG_DARKEST = '#0e0d0a';
const ACCENT = '#a88271';

export function PhotoGallery({ content }: LegacyBlockComponentProps) {
  const eyebrow = String(content.eyebrow || '');
  const title = String(content.title || '');
  const items = (
    Array.isArray(content.items) ? content.items : []
  ) as GalleryItem[];
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='photo-gallery'
      ref={ref}
      style={{
        padding: '120px 24px',
        background: BG_DARKEST,
        color: '#fff',
        fontFamily: 'Funnel Display, system-ui, sans-serif',
      }}
    >
      <style>{`
        #photo-gallery .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #photo-gallery .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #photo-gallery .pg-card { position: relative; overflow: hidden; border-radius: 4px; }
        #photo-gallery .pg-card img { transition: transform 1.4s ${EASE_EXPO}; }
        #photo-gallery .pg-card:hover img { transform: scale(1.05); }
      `}</style>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
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
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {items.map((item, i) => (
            <GalleryCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryCard({ item, index }: { item: GalleryItem; index: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`pg-card rx-reveal ${visible ? 'is-visible' : ''}`}
      style={{
        aspectRatio: index % 3 === 0 ? '4 / 5' : '4 / 3',
        background: 'rgba(255,255,255,0.04)',
        transitionDelay: `${index * 60}ms`,
      }}
    >
      {item.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.src}
          alt={item.label ?? ''}
          loading='lazy'
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : null}
      {item.label && (
        <span
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            background: 'rgba(0,0,0,0.4)',
            color: '#fff',
            padding: '6px 12px',
            backdropFilter: 'blur(8px)',
          }}
        >
          {item.label}
        </span>
      )}
    </div>
  );
}
