'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

const IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80';

/**
 * Featured Project — clone of firma-template.framer.website (Common Future Co. variant).
 *
 * Layout: image fills the LEFT half (bleeds to viewport edge), white text card
 * overlaps the image from the RIGHT, slightly offset inward.
 */
export function FramerFirmaFeatured({ content }: LegacyBlockComponentProps) {
  const category = String(content.category || 'STRATEGY / DIGITAL');
  const heading = String(content.heading || 'Common Future Co.');
  const description = String(
    content.description ||
      'Common Future Co. came to us with a big mission but little clarity on how to communicate it. We began by rethinking their messaging, positioning them as forward-thinking yet accessible.'
  );
  const ctaLabel = String(content.ctaLabel || 'Case Study');
  const ctaHref = String(content.ctaHref || '#');

  const image = (content.image as AssetRef | null) ?? null;
  const imgUrl = image?.url || IMAGE_FALLBACK;
  const imgAlt = image?.alt ?? heading;

  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-firma-featured'
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        background: '#ffffff',
        color: '#0c0c0c',
        fontFamily: '"Inter", "Inter Placeholder", sans-serif',
        overflow: 'hidden',
      }}
    >
      <style>{`
        #framer-firma-featured .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-firma-featured .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-firma-featured .ff-wrap {
          position: relative;
          width: 100%;
          padding: clamp(40px, 5cqi, 80px) clamp(20px, 4cqi, 64px) clamp(60px, 6cqi, 100px) 0;
        }
        #framer-firma-featured .ff-stage {
          position: relative;
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
          align-items: stretch;
          min-height: clamp(520px, 75vh, 820px);
        }
        #framer-firma-featured .ff-image {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: clamp(520px, 75vh, 820px);
          overflow: hidden;
          background: #e6e7ea;
        }
        #framer-firma-featured .ff-image img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        #framer-firma-featured .ff-panel-col {
          position: relative;
          display: flex;
          align-items: center;
          margin-left: clamp(-200px, -14cqi, -80px);
          z-index: 2;
        }
        #framer-firma-featured .ff-panel {
          position: relative;
          background: #ffffff;
          width: 100%;
          max-width: 720px;
          padding:
            clamp(40px, 5cqi, 88px)
            clamp(32px, 4.5cqi, 80px)
            clamp(48px, 5.5cqi, 96px);
          box-shadow:
            0 1px 3px rgba(16, 24, 40, 0.06),
            0 24px 60px -20px rgba(16, 24, 40, 0.12);
          display: flex;
          flex-direction: column;
        }
        #framer-firma-featured .ff-eyebrow {
          display: inline-block;
          font-size: clamp(12px, 0.95cqi, 14px);
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.5);
          margin: 0 0 clamp(20px, 2.5cqi, 40px);
        }
        #framer-firma-featured .ff-heading {
          font-family: '"Playfair Display", "DM Serif Display", Georgia, serif';
          font-weight: 500;
          font-size: clamp(36px, 5cqi, 80px);
          line-height: 1.02;
          letter-spacing: -0.02em;
          margin: 0 0 clamp(24px, 3cqi, 44px);
          color: #0c0c0c;
        }
        #framer-firma-featured .ff-body {
          font-size: clamp(15px, 1.2cqi, 18px);
          line-height: 1.55;
          color: rgba(0, 0, 0, 0.62);
          margin: 0 0 clamp(32px, 4cqi, 56px);
          max-width: 50ch;
        }
        #framer-firma-featured .ff-cta {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #0c0c0c;
          font-size: clamp(14px, 1.1cqi, 16px);
          font-weight: 600;
          text-decoration: none;
          line-height: 1;
        }
        #framer-firma-featured .ff-cta::before {
          content: "";
          width: 6px;
          height: 6px;
          background: currentColor;
          border-radius: 999px;
          flex-shrink: 0;
        }
        #framer-firma-featured .ff-cta-label {
          border-bottom: 1.5px solid currentColor;
          padding-bottom: 2px;
        }
        @media (max-width: 1199px) and (min-width: 810px) {
          #framer-firma-featured .ff-stage {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            min-height: 70vh;
          }
          #framer-firma-featured .ff-panel-col { margin-left: -60px; }
        }
        @media (max-width: 809px) {
          #framer-firma-featured .ff-wrap { padding: 0; }
          #framer-firma-featured .ff-stage {
            grid-template-columns: 1fr;
            min-height: 0;
          }
          #framer-firma-featured .ff-image {
            aspect-ratio: 4 / 5;
            min-height: 0;
          }
          #framer-firma-featured .ff-panel-col {
            margin-left: 0;
            margin-top: -36px;
            padding: 0 16px 32px;
          }
          #framer-firma-featured .ff-panel { padding: 32px 24px 40px; }
        }
      `}</style>

      <div className='ff-wrap'>
        <div className='ff-stage'>
          <div className='ff-image'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgUrl} alt={imgAlt} />
          </div>
          <div className='ff-panel-col'>
            <div
              className={`ff-panel rx-reveal ${visible ? 'is-visible' : ''}`}
            >
              <span className='ff-eyebrow'>{category}</span>
              <h3 className='ff-heading'>{heading}</h3>
              <p className='ff-body'>{description}</p>
              <a href={ctaHref} className='ff-cta' aria-label={ctaLabel}>
                <span className='ff-cta-label'>{ctaLabel}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
