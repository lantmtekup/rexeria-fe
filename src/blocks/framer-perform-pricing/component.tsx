'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

interface TierItem {
  image?: AssetRef | null;
  price?: string;
  title?: string;
  features?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Pricing — sticky stacking cards, image left + tier info right. */
export function FramerPerformPricing({ content }: LegacyBlockComponentProps) {
  const eyebrow = String(content.eyebrow || 'Pricing');
  const heading = String(content.heading || 'Choose your plan');
  const subheading = String(content.subheading || '');
  const tiers = (
    Array.isArray(content.tiers) ? (content.tiers as TierItem[]) : []
  ) as TierItem[];
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-perform-pricing'
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        background: '#ffffff',
        padding: 'clamp(48px, 8cqi, 120px) 0 clamp(64px, 10cqi, 160px)',
        fontFamily: '"Manrope", system-ui, sans-serif',
        color: '#0c0c0c',
      }}
    >
      <style>{`
        #framer-perform-pricing .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-perform-pricing .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-perform-pricing .pp-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 clamp(20px, 4cqi, 48px);
        }
        #framer-perform-pricing .pp-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 18px;
          margin: 0 auto clamp(40px, 6cqi, 80px);
          max-width: 720px;
        }
        #framer-perform-pricing .pp-eyebrow {
          display: inline-block;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.55);
        }
        #framer-perform-pricing .pp-heading {
          margin: 0;
          font-size: clamp(36px, 5.5cqi, 64px);
          font-weight: 500;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }
        #framer-perform-pricing .pp-sub {
          margin: 0;
          font-size: clamp(15px, 1.4cqi, 17px);
          line-height: 1.55;
          color: rgba(0, 0, 0, 0.6);
        }
        #framer-perform-pricing .pp-stack { position: relative; }
        #framer-perform-pricing .pp-card-wrap {
          position: sticky;
          top: 80px;
          padding-bottom: clamp(40px, 6cqi, 80px);
        }
        #framer-perform-pricing .pp-card {
          background: #ffffff;
          border-radius: clamp(20px, 2cqi, 32px);
          box-shadow:
            0 1px 3px rgba(16, 24, 40, 0.06),
            0 12px 40px -8px rgba(16, 24, 40, 0.12);
          padding: clamp(16px, 1.6cqi, 24px);
          display: grid;
          grid-template-columns: minmax(280px, 1fr) 1.1fr;
          gap: clamp(24px, 4cqi, 56px);
          align-items: stretch;
          overflow: hidden;
        }
        #framer-perform-pricing .pp-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: clamp(16px, 1.6cqi, 24px);
          overflow: hidden;
          background: #e6e7ea;
        }
        #framer-perform-pricing .pp-img-wrap img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        #framer-perform-pricing .pp-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(16px, 2cqi, 32px) clamp(8px, 1.5cqi, 24px);
        }
        #framer-perform-pricing .pp-price {
          font-size: clamp(15px, 1.3cqi, 17px);
          color: rgba(0, 0, 0, 0.55);
          margin: 0 0 12px;
        }
        #framer-perform-pricing .pp-title {
          font-size: clamp(40px, 5cqi, 64px);
          font-weight: 500;
          letter-spacing: -0.03em;
          line-height: 1.05;
          margin: 0 0 clamp(28px, 4cqi, 48px);
        }
        #framer-perform-pricing .pp-features {
          list-style: none;
          padding: 0;
          margin: 0 0 clamp(28px, 4cqi, 48px);
          display: flex;
          flex-direction: column;
          gap: clamp(14px, 1.4cqi, 18px);
        }
        #framer-perform-pricing .pp-feature {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          font-size: clamp(15px, 1.25cqi, 17px);
          line-height: 1.45;
        }
        #framer-perform-pricing .pp-feature svg { flex-shrink: 0; margin-top: 4px; }
        #framer-perform-pricing .pp-cta {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 14px;
          background: #f3f3f4;
          color: #0c0c0c;
          border-radius: 999px;
          padding: 6px 6px 6px 22px;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          line-height: 1;
          transition: background-color 0.2s ease;
        }
        #framer-perform-pricing .pp-cta:hover { background: #e7e7e9; }
        #framer-perform-pricing .pp-cta-arrow {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          background: #0c0c0c;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        @media (max-width: 809px) {
          #framer-perform-pricing .pp-card { grid-template-columns: 1fr; gap: 0; }
          #framer-perform-pricing .pp-title { font-size: clamp(32px, 8cqi, 44px); }
        }
      `}</style>

      <div className='pp-container'>
        <header
          className={`pp-header rx-reveal ${visible ? 'is-visible' : ''}`}
        >
          <span className='pp-eyebrow'>{eyebrow}</span>
          <h2 className='pp-heading'>{heading}</h2>
          {subheading && <p className='pp-sub'>{subheading}</p>}
        </header>

        <div className='pp-stack'>
          {tiers.map((tier, idx) => {
            const featureLines = (tier.features || '')
              .split('\n')
              .map(s => s.trim())
              .filter(Boolean);
            return (
              <div
                key={idx}
                className='pp-card-wrap'
                style={{ zIndex: idx + 1 }}
              >
                <article className='pp-card'>
                  <div className='pp-img-wrap'>
                    {tier.image?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tier.image.url} alt={tier.image.alt ?? ''} />
                    ) : (
                      <div
                        aria-hidden='true'
                        style={{
                          width: '100%',
                          height: '100%',
                          background:
                            'linear-gradient(135deg, #d9dadd 0%, #b8babf 100%)',
                        }}
                      />
                    )}
                  </div>

                  <div className='pp-info'>
                    <p className='pp-price'>{tier.price || ''}</p>
                    <h3 className='pp-title'>{tier.title || 'Plan'}</h3>

                    <ul className='pp-features'>
                      {featureLines.map((line, li) => (
                        <li key={li} className='pp-feature'>
                          <svg
                            width='20'
                            height='20'
                            viewBox='0 0 20 20'
                            fill='none'
                            aria-hidden='true'
                          >
                            <path
                              d='M4 10.5l4 4 8-8'
                              stroke='#0c0c0c'
                              strokeWidth='1.8'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          </svg>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href={tier.ctaHref || '#'}
                      className='pp-cta'
                      aria-label={tier.ctaLabel || 'Get in touch'}
                    >
                      <span>{tier.ctaLabel || 'Get in touch'}</span>
                      <span className='pp-cta-arrow' aria-hidden='true'>
                        <svg
                          width='14'
                          height='14'
                          viewBox='0 0 14 14'
                          fill='none'
                        >
                          <path
                            d='M3.5 10.5L10.5 3.5M10.5 3.5H4.5M10.5 3.5V9.5'
                            stroke='currentColor'
                            strokeWidth='1.6'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>
                      </span>
                    </a>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
