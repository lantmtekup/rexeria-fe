'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}
interface GalleryImage {
  src: AssetRef | null;
  alt: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Framer Image Stagger — asymmetric 12-col grid with per-image IO fade. */
export function FramerImageStagger({ content }: LegacyBlockComponentProps) {
  const eyebrow = String(content.eyebrow || 'GALLERY');
  const title = String(content.title || 'Interior details');
  const images = Array.isArray(content.images)
    ? (content.images as GalleryImage[])
    : [];
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-image-stagger'
      ref={ref}
      style={{
        background: '#F5F3EE',
        padding: 'clamp(80px, 12vh, 160px) clamp(24px, 4vw, 80px)',
        fontFamily: "'Funnel Display', 'Inter', system-ui, sans-serif",
        position: 'relative',
      }}
    >
      <style>{`
        #framer-image-stagger .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-image-stagger .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-image-stagger .fis-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: clamp(12px, 1.4vw, 24px);
          max-width: 1360px;
          margin: 0 auto;
        }
        #framer-image-stagger .fis-cell { overflow: hidden; background: #E8E5DE; }
        #framer-image-stagger .fis-cell:nth-child(1) { grid-column: span 7; aspect-ratio: 4 / 3; }
        #framer-image-stagger .fis-cell:nth-child(2) { grid-column: span 5; aspect-ratio: 3 / 4; }
        #framer-image-stagger .fis-cell:nth-child(3) { grid-column: span 4; aspect-ratio: 1 / 1; }
        #framer-image-stagger .fis-cell:nth-child(4) { grid-column: span 8; aspect-ratio: 16 / 9; }
        #framer-image-stagger .fis-cell:nth-child(5) { grid-column: span 5; aspect-ratio: 3 / 4; }
        #framer-image-stagger .fis-cell:nth-child(6) { grid-column: span 7; aspect-ratio: 3 / 2; }
        #framer-image-stagger .fis-cell:nth-child(7) { grid-column: span 6; aspect-ratio: 4 / 3; }
        #framer-image-stagger .fis-cell:nth-child(8) { grid-column: span 6; aspect-ratio: 4 / 3; }
        @media (max-width: 720px) {
          #framer-image-stagger .fis-grid { grid-template-columns: 1fr 1fr; }
          #framer-image-stagger .fis-cell { grid-column: span 1 !important; aspect-ratio: 4 / 5 !important; }
        }
      `}</style>

      <div
        className={`rx-reveal ${visible ? 'is-visible' : ''}`}
        style={{ maxWidth: 1360, margin: '0 auto clamp(40px, 6vh, 80px)' }}
      >
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#555',
            marginBottom: 16,
          }}
        >
          {eyebrow}
        </div>
        <h2
          style={{
            fontFamily: "'Abril Fatface', 'Cormorant Garamond', serif",
            fontSize: 'clamp(40px, 5.5vw, 88px)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.05,
            color: '#1A1A1A',
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>

      <div className='fis-grid'>
        {images.map((img, i) => (
          <ImageCell key={i} img={img} index={i} />
        ))}
      </div>
    </section>
  );
}

function ImageCell({ img, index }: { img: GalleryImage; index: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const src = img?.src?.url;
  return (
    <div
      ref={ref}
      className={`fis-cell rx-reveal ${visible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={img?.src?.alt ?? img.alt ?? ''}
          loading='lazy'
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : null}
    </div>
  );
}
