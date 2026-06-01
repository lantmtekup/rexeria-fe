'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

interface ServiceItem {
  icon?: AssetRef | null;
  title?: string;
  description?: string;
}

const SLOT_CLASSES = [
  'clarity-services-slot-left-top',
  'clarity-services-slot-right-top',
  'clarity-services-slot-left-bottom',
  'clarity-services-slot-right-bottom',
];

/** Clarity Services — 3-column grid: 2 cards left, tall image center, 2 cards right. */
export function FramerClarityServices({ content }: LegacyBlockComponentProps) {
  const bgColor = String(content.bgColor || '#f8faf2');
  const cardBg = String(content.cardBg || '#f3f6e6');
  const centerImage = (content.centerImage as AssetRef | null) || null;
  const services: ServiceItem[] = Array.isArray(content.services)
    ? (content.services as ServiceItem[])
    : [];

  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-clarity-services'
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        background: bgColor,
        padding: 'clamp(48px, 8cqi, 120px) 0',
        fontFamily: '"Manrope", "Manrope Placeholder", sans-serif',
        color: '#1c2706',
      }}
    >
      <style>{`
        #framer-clarity-services .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s cubic-bezier(0.16,1,0.3,1), transform 1.1s cubic-bezier(0.16,1,0.3,1); }
        #framer-clarity-services .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-clarity-services .clarity-services-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(20px, 4cqi, 56px);
        }
        #framer-clarity-services .clarity-services-grid {
          display: grid;
          grid-template-columns: 1fr minmax(280px, 1.05fr) 1fr;
          grid-template-rows: 1fr 1fr;
          grid-auto-rows: minmax(220px, auto);
          gap: clamp(16px, 2cqi, 28px);
        }
        #framer-clarity-services .clarity-services-slot-left-top    { grid-column: 1; grid-row: 1; }
        #framer-clarity-services .clarity-services-slot-left-bottom { grid-column: 1; grid-row: 2; }
        #framer-clarity-services .clarity-services-slot-right-top   { grid-column: 3; grid-row: 1; }
        #framer-clarity-services .clarity-services-slot-right-bottom{ grid-column: 3; grid-row: 2; }
        #framer-clarity-services .clarity-services-center {
          grid-column: 2;
          grid-row: 1 / span 2;
          align-self: stretch;
          position: relative;
          width: 100%;
          height: 100%;
          min-height: clamp(400px, 60cqi, 720px);
          border-radius: clamp(20px, 2cqi, 36px);
          overflow: hidden;
          background: #d8dbcf;
        }
        #framer-clarity-services .clarity-services-center img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        #framer-clarity-services .clarity-services-card {
          min-height: clamp(220px, 26cqi, 340px);
          height: 100%;
          border-radius: clamp(20px, 2cqi, 36px);
          padding: clamp(24px, 3cqi, 44px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: clamp(40px, 6cqi, 80px);
        }
        #framer-clarity-services .clarity-services-icon-wrap {
          width: clamp(48px, 4.4cqi, 64px);
          height: clamp(48px, 4.4cqi, 64px);
          border-radius: 999px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 1px 2px rgba(28, 39, 6, 0.04);
        }
        #framer-clarity-services .clarity-services-icon-wrap img {
          width: 60%;
          height: 60%;
          object-fit: contain;
          display: block;
        }
        #framer-clarity-services .clarity-services-body {
          display: flex;
          flex-direction: column;
          gap: clamp(12px, 1.4cqi, 20px);
        }
        #framer-clarity-services .clarity-services-title {
          margin: 0;
          font-size: clamp(22px, 2.4cqi, 32px);
          font-weight: 500;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: #1c2706;
        }
        #framer-clarity-services .clarity-services-desc {
          margin: 0;
          font-size: clamp(14px, 1.3cqi, 17px);
          line-height: 1.55;
          color: rgba(28, 39, 6, 0.72);
          max-width: 32ch;
        }
        @media (max-width: 1199px) and (min-width: 810px) {
          #framer-clarity-services .clarity-services-grid {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto auto;
          }
          #framer-clarity-services .clarity-services-center {
            grid-column: 1 / -1;
            grid-row: 1;
            min-height: 480px;
          }
          #framer-clarity-services .clarity-services-slot-left-top    { grid-column: 1; grid-row: 2; }
          #framer-clarity-services .clarity-services-slot-right-top   { grid-column: 2; grid-row: 2; }
          #framer-clarity-services .clarity-services-slot-left-bottom { grid-column: 1; grid-row: 3; }
          #framer-clarity-services .clarity-services-slot-right-bottom{ grid-column: 2; grid-row: 3; }
        }
        @media (max-width: 809px) {
          #framer-clarity-services .clarity-services-grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
            gap: 12px;
          }
          #framer-clarity-services .clarity-services-center {
            grid-column: 1;
            grid-row: auto;
            min-height: 380px;
          }
          #framer-clarity-services .clarity-services-slot-left-top,
          #framer-clarity-services .clarity-services-slot-right-top,
          #framer-clarity-services .clarity-services-slot-left-bottom,
          #framer-clarity-services .clarity-services-slot-right-bottom {
            grid-column: 1;
            grid-row: auto;
          }
        }
      `}</style>

      <div className='clarity-services-container'>
        <div className='clarity-services-grid'>
          {/* Center image */}
          <div
            className={`clarity-services-center rx-reveal ${visible ? 'is-visible' : ''}`}
          >
            {centerImage?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={centerImage.url}
                alt={centerImage.alt ?? ''}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <div
                aria-hidden='true'
                style={{
                  width: '100%',
                  height: '100%',
                  background:
                    'linear-gradient(135deg, #c8d2bc 0%, #a8b59a 100%)',
                }}
              />
            )}
          </div>

          {/* Cards — placed via slot classes */}
          {services.map((item, idx) => {
            const slotClass = SLOT_CLASSES[idx % 4];
            return (
              <article
                key={idx}
                className={`clarity-services-card ${slotClass} rx-reveal ${visible ? 'is-visible' : ''}`}
                style={{ background: cardBg }}
              >
                <div className='clarity-services-icon-wrap'>
                  {item.icon?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.icon.url}
                      alt={item.icon.alt ?? ''}
                      style={{
                        width: '60%',
                        height: '60%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <svg
                      width='22'
                      height='22'
                      viewBox='0 0 24 24'
                      fill='none'
                      aria-hidden='true'
                    >
                      <path
                        d='M12 4v16M4 12h16'
                        stroke='#1c2706'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                      />
                    </svg>
                  )}
                </div>

                <div className='clarity-services-body'>
                  <h3 className='clarity-services-title'>
                    {item.title || 'Service title'}
                  </h3>
                  <p className='clarity-services-desc'>
                    {item.description || ''}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
