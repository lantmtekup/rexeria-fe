'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

interface Slide {
  image?: AssetRef | null;
  title?: string;
  description?: string;
  bgColor?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

const DEFAULT_PALETTE = [
  '#e85a2c',
  '#2c7be8',
  '#1f9d55',
  '#7c4dff',
  '#f5b342',
  '#d63384',
];

const colorFor = (slide: Slide | undefined, idx: number, fallback: string) =>
  slide?.bgColor || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length] || fallback;

/** Lightweight luma check on a hex color string to choose readable text. */
function isLightHex(hex: string): boolean {
  const m = hex.match(/^#?([0-9a-fA-F]{6})$/);
  if (!m) return true;
  const v = m[1];
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 145;
}

/**
 * Finnegan Expertise (simplified port) — ghost heading + stacked expertise
 * cards each with an image and colored info panel. The original used a
 * scroll-pinned 3D rolling box; this static port keeps editorial intent
 * (full-bleed images, bold colored cards) without GSAP/framer-motion.
 */
export function FramerFinneganExpertise({
  content,
}: LegacyBlockComponentProps) {
  const heading = String(content.heading || 'My Expertise');
  const cardBg = String(content.cardBg || '#e85a2c');
  const slides = Array.isArray(content.slides)
    ? (content.slides as Slide[])
    : [];
  const { ref, visible } = useReveal<HTMLElement>();

  if (slides.length === 0) return null;

  return (
    <section
      id='framer-finnegan-expertise'
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        background: '#0a0a0a',
        color: '#ffffff',
        fontFamily: '"Manrope", "Manrope Placeholder", sans-serif',
        padding: 'clamp(80px, 12cqi, 160px) clamp(20px, 4cqi, 80px)',
        overflow: 'hidden',
      }}
    >
      <style>{`
        #framer-finnegan-expertise .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-finnegan-expertise .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-finnegan-expertise .fe-heading {
          margin: 0 0 clamp(40px, 6cqi, 80px);
          font-size: clamp(56px, 12cqi, 180px);
          font-weight: 300;
          letter-spacing: -0.02em;
          line-height: 1;
          color: ${cardBg};
          text-align: center;
          pointer-events: none;
          user-select: none;
        }
        #framer-finnegan-expertise .fe-stack {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: clamp(40px, 6cqi, 80px);
        }
        #framer-finnegan-expertise .fe-card {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 24px 60px -16px rgba(0,0,0,0.45);
        }
        #framer-finnegan-expertise .fe-media {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #1f2937;
        }
        #framer-finnegan-expertise .fe-media img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        #framer-finnegan-expertise .fe-info {
          padding: clamp(28px, 4cqi, 56px) clamp(24px, 3.5cqi, 48px);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        #framer-finnegan-expertise .fe-title {
          margin: 0 0 clamp(20px, 3cqi, 40px);
          font-size: clamp(22px, 2.6cqi, 36px);
          font-weight: 500;
          letter-spacing: -0.01em;
          line-height: 1.15;
        }
        #framer-finnegan-expertise .fe-desc {
          margin: 0;
          font-size: clamp(14px, 1.4cqi, 17px);
          line-height: 1.7;
        }
        @media (max-width: 809px) {
          #framer-finnegan-expertise .fe-card { grid-template-columns: 1fr; }
        }
      `}</style>

      <h2 className='fe-heading'>{heading}</h2>

      <div className='fe-stack'>
        {slides.map((slide, idx) => {
          const bg = colorFor(slide, idx, cardBg);
          const textColor = isLightHex(bg) ? '#0a0a0a' : '#ffffff';
          const img = slide.image?.url || '';
          const alt = slide.image?.alt ?? slide.title ?? '';
          return (
            <article
              key={idx}
              className={`fe-card rx-reveal ${visible ? 'is-visible' : ''}`}
            >
              <div className='fe-media'>
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={alt} />
                ) : (
                  <div
                    aria-hidden='true'
                    style={{
                      width: '100%',
                      height: '100%',
                      background:
                        'linear-gradient(135deg, #1f2937 0%, #0a0a0a 100%)',
                    }}
                  />
                )}
              </div>
              <div
                className='fe-info'
                style={{ background: bg, color: textColor }}
              >
                <h3 className='fe-title'>{slide.title || ''}</h3>
                <p className='fe-desc'>{slide.description || ''}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
