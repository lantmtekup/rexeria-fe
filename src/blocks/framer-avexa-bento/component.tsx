'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

function imgOr(asset: unknown, fallback: string): { url: string; alt: string } {
  const a = (asset as AssetRef) || null;
  return {
    url: a?.url || fallback,
    alt: a?.alt || '',
  };
}

const card1Fallback =
  'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80';
const card2Fallback =
  'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80';
const card4Fallback =
  'https://images.unsplash.com/photo-1518733057094-95b53143d2a7?w=1000&q=80';
const card5Fallback =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80';
const card6aFallback =
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1000&q=80';
const card6bFallback =
  'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1000&q=80';

/** Bento - 01 (Avexa Why-Us) — 5 cards in a 2-row bento grid. */
export function FramerAvexaBento({ content }: LegacyBlockComponentProps) {
  const c1 = imgOr(content.card1Image, card1Fallback);
  const c2 = imgOr(content.card2Image, card2Fallback);
  const c4 = imgOr(content.card4Image, card4Fallback);
  const c5 = imgOr(content.card5Image, card5Fallback);
  const c6a = imgOr(content.card6Image1, card6aFallback);
  const c6b = imgOr(content.card6Image2, card6bFallback);
  const t = (k: string, d: string) => String(content[k] || d);

  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-avexa-bento'
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        background: '#ffffff',
        color: '#0c0c0c',
        fontFamily: '"Inter", "Inter Placeholder", sans-serif',
        padding: 'clamp(40px, 5cqi, 80px) clamp(16px, 3cqi, 40px)',
      }}
    >
      <style>{`
        #framer-avexa-bento .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s cubic-bezier(0.16,1,0.3,1), transform 1.1s cubic-bezier(0.16,1,0.3,1); }
        #framer-avexa-bento .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-avexa-bento .avexa-bento-wrap {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: minmax(0, auto);
          gap: clamp(12px, 1.4cqi, 24px);
          max-width: 1400px;
          margin: 0 auto;
        }
        #framer-avexa-bento .avexa-card-1 { grid-column: span 4; }
        #framer-avexa-bento .avexa-card-2-3-stack {
          grid-column: span 4;
          display: grid;
          grid-template-rows: 1fr auto;
          gap: clamp(12px, 1.4cqi, 24px);
        }
        #framer-avexa-bento .avexa-card-4 { grid-column: span 4; }
        #framer-avexa-bento .avexa-card-5 { grid-column: span 8; }
        #framer-avexa-bento .avexa-card-6 { grid-column: span 4; }
        #framer-avexa-bento .avexa-card {
          position: relative;
          background: #f5f5f6;
          border-radius: clamp(16px, 1.8cqi, 28px);
          overflow: hidden;
          min-height: 320px;
          display: flex;
          flex-direction: column;
        }
        #framer-avexa-bento .avexa-card-light { background: #f3f4f5; }
        #framer-avexa-bento .avexa-card-orange {
          background: linear-gradient(140deg, #ff6a2c 0%, #ff8a4a 100%);
          color: #ffffff;
        }
        #framer-avexa-bento .avexa-card-dark {
          background: #131313;
          color: #ffffff;
          min-height: 0;
        }
        #framer-avexa-bento .avexa-card-title {
          font-size: clamp(20px, 2.2cqi, 30px);
          font-weight: 600;
          line-height: 1.18;
          letter-spacing: -0.015em;
          margin: 0;
        }
        #framer-avexa-bento .avexa-card-desc {
          font-size: clamp(14px, 1.15cqi, 17px);
          line-height: 1.5;
          color: rgb(96, 95, 95);
          margin: 0;
        }
        #framer-avexa-bento .avexa-card-orange .avexa-card-desc { color: rgba(255,255,255,0.92); }
        #framer-avexa-bento .avexa-card-1 .avexa-card {
          padding: clamp(28px, 3cqi, 44px);
          gap: clamp(20px, 2.4cqi, 36px);
        }
        #framer-avexa-bento .avexa-card-1 .avexa-img-frame {
          flex: 1 1 auto;
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(12px, 1.6cqi, 24px);
        }
        #framer-avexa-bento .avexa-card-1 .avexa-img-frame img {
          width: 60%;
          height: auto;
          max-height: 100%;
          object-fit: contain;
          display: block;
        }
        #framer-avexa-bento .avexa-card-2 {
          position: relative;
          padding: clamp(28px, 3cqi, 44px);
          min-height: clamp(280px, 30cqi, 360px);
          overflow: hidden;
        }
        #framer-avexa-bento .avexa-card-2 .avexa-card-title {
          font-size: clamp(24px, 2.6cqi, 36px);
          font-weight: 600;
          line-height: 1.12;
          color: #ffffff;
          max-width: 70%;
        }
        #framer-avexa-bento .avexa-card-2 .avexa-img-overlay {
          position: absolute;
          right: clamp(20px, 2cqi, 40px);
          bottom: clamp(70px, 6cqi, 100px);
          width: 38%;
          height: 70%;
          z-index: 1;
        }
        #framer-avexa-bento .avexa-card-2 .avexa-img-overlay img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
        }
        #framer-avexa-bento .avexa-card-2 .avexa-card-caption-wrap {
          position: absolute;
          right: clamp(28px, 3cqi, 44px);
          bottom: clamp(24px, 2.5cqi, 36px);
          width: clamp(180px, 18cqi, 240px);
          z-index: 2;
        }
        #framer-avexa-bento .avexa-card-2 .avexa-card-caption {
          font-size: clamp(13px, 1.05cqi, 15px);
          color: rgba(255,255,255,0.95);
          text-align: right;
          line-height: 1.4;
          margin: 0;
        }
        #framer-avexa-bento .avexa-card-3 {
          padding: clamp(22px, 2.4cqi, 32px) clamp(24px, 2.6cqi, 36px);
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          min-height: clamp(110px, 12cqi, 150px);
        }
        #framer-avexa-bento .avexa-card-3-big {
          font-size: clamp(40px, 4cqi, 56px);
          font-weight: 600;
          line-height: 1;
          letter-spacing: -0.02em;
          margin: 0;
        }
        #framer-avexa-bento .avexa-card-3-sub {
          font-size: clamp(12px, 1cqi, 14px);
          color: rgba(255,255,255,0.7);
          margin: 4px 0 0;
        }
        #framer-avexa-bento .avexa-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          color: #0c0c0c;
          padding: 10px 16px 10px 10px;
          border-radius: 999px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          font-size: clamp(11px, 0.95cqi, 13px);
        }
        #framer-avexa-bento .avexa-badge-icon {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          background: #ff6a2c;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        #framer-avexa-bento .avexa-badge-brand {
          font-weight: 600;
          line-height: 1.1;
          color: #0c0c0c;
        }
        #framer-avexa-bento .avexa-badge-label {
          font-size: clamp(10px, 0.85cqi, 12px);
          color: rgba(12,12,12,0.55);
          line-height: 1.1;
        }
        #framer-avexa-bento .avexa-card-4 .avexa-card {
          padding: clamp(28px, 3cqi, 44px);
          gap: clamp(16px, 2cqi, 28px);
        }
        #framer-avexa-bento .avexa-card-4 .avexa-img-frame {
          flex: 1 1 auto;
          aspect-ratio: 16 / 12;
          border-radius: clamp(8px, 1cqi, 16px);
          overflow: hidden;
        }
        #framer-avexa-bento .avexa-card-4 .avexa-img-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        #framer-avexa-bento .avexa-card-5 .avexa-card {
          padding: 0;
          color: #ffffff;
          min-height: clamp(360px, 36cqi, 480px);
        }
        #framer-avexa-bento .avexa-card-5 .avexa-bg-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: grayscale(100%);
        }
        #framer-avexa-bento .avexa-card-5 .avexa-bg-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.0) 50%, rgba(0,0,0,0.55) 100%);
        }
        #framer-avexa-bento .avexa-card-5 .avexa-text-overlay {
          position: relative;
          margin-top: auto;
          z-index: 2;
          padding: clamp(28px, 3cqi, 48px);
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
        }
        #framer-avexa-bento .avexa-card-5 .avexa-card-title {
          font-size: clamp(28px, 3cqi, 44px);
          color: #ffffff;
          max-width: 60%;
        }
        #framer-avexa-bento .avexa-card-5 .avexa-card-caption {
          font-size: clamp(13px, 1.1cqi, 16px);
          color: rgba(255,255,255,0.9);
          text-align: right;
          line-height: 1.4;
          max-width: 240px;
          margin: 0;
        }
        #framer-avexa-bento .avexa-card-6 .avexa-card {
          padding: clamp(28px, 3cqi, 44px);
          gap: clamp(16px, 2cqi, 28px);
          overflow: hidden;
        }
        #framer-avexa-bento .avexa-dots {
          display: flex;
          gap: 6px;
          margin-bottom: clamp(8px, 1cqi, 12px);
        }
        #framer-avexa-bento .avexa-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #ff6a2c;
        }
        #framer-avexa-bento .avexa-photo-stack {
          position: relative;
          flex: 1 1 auto;
          min-height: 160px;
        }
        #framer-avexa-bento .avexa-photo {
          position: absolute;
          width: 65%;
          aspect-ratio: 4 / 3;
          border-radius: 6px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 12px 36px -10px rgba(0,0,0,0.18);
        }
        #framer-avexa-bento .avexa-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        #framer-avexa-bento .avexa-photo-1 { top: 6%; left: 8%; transform: rotate(-7deg); }
        #framer-avexa-bento .avexa-photo-2 { top: 22%; right: 4%; transform: rotate(6deg); }
        @media (max-width: 1199px) and (min-width: 810px) {
          #framer-avexa-bento .avexa-bento-wrap { grid-template-columns: repeat(6, 1fr); }
          #framer-avexa-bento .avexa-card-1,
          #framer-avexa-bento .avexa-card-2-3-stack { grid-column: span 3; }
          #framer-avexa-bento .avexa-card-4 { grid-column: span 6; }
          #framer-avexa-bento .avexa-card-5 { grid-column: span 6; }
          #framer-avexa-bento .avexa-card-6 { grid-column: span 6; }
        }
        @media (max-width: 809px) {
          #framer-avexa-bento .avexa-bento-wrap { grid-template-columns: 1fr; gap: 12px; }
          #framer-avexa-bento .avexa-card-1,
          #framer-avexa-bento .avexa-card-2-3-stack,
          #framer-avexa-bento .avexa-card-4,
          #framer-avexa-bento .avexa-card-5,
          #framer-avexa-bento .avexa-card-6 { grid-column: span 1; }
          #framer-avexa-bento .avexa-card-2-3-stack { grid-template-rows: auto auto; }
          #framer-avexa-bento .avexa-card-2 { min-height: 280px; }
          #framer-avexa-bento .avexa-card-2 .avexa-card-title { max-width: 100%; }
          #framer-avexa-bento .avexa-card-2 .avexa-img-overlay { width: 45%; height: 50%; bottom: 100px; }
          #framer-avexa-bento .avexa-card-5 .avexa-card { min-height: 340px; }
          #framer-avexa-bento .avexa-card-5 .avexa-text-overlay { flex-direction: column; align-items: flex-start; }
          #framer-avexa-bento .avexa-card-5 .avexa-card-title { max-width: 100%; }
          #framer-avexa-bento .avexa-card-5 .avexa-card-caption { text-align: left; }
        }
      `}</style>

      <div className='avexa-bento-wrap'>
        {/* CARD 1 — Strategy */}
        <div
          className={`avexa-card-1 rx-reveal ${visible ? 'is-visible' : ''}`}
        >
          <div className='avexa-card avexa-card-light'>
            <div className='avexa-img-frame'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c1.url} alt={c1.alt} loading='lazy' />
            </div>
            <div>
              <h3 className='avexa-card-title'>
                {t('card1Title', 'Strategy-First Approach')}
              </h3>
              <p className='avexa-card-desc' style={{ marginTop: 12 }}>
                {t(
                  'card1Desc',
                  'Every decision is rooted in clarity, not guesswork.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* CARDS 2 + 3 stack */}
        <div
          className={`avexa-card-2-3-stack rx-reveal ${visible ? 'is-visible' : ''}`}
        >
          {/* CARD 2 — Quality Over Quantity (orange) */}
          <div className='avexa-card avexa-card-orange avexa-card-2'>
            <h3 className='avexa-card-title'>
              {t('card2Title', 'Quality Over Quantity, Always')}
            </h3>
            <div className='avexa-img-overlay'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c2.url} alt={c2.alt} loading='lazy' />
            </div>
            <div className='avexa-card-caption-wrap'>
              <p className='avexa-card-caption'>
                {t(
                  'card2Caption',
                  'We focus on fewer projects to deliver better outcomes.'
                )}
              </p>
            </div>
          </div>

          {/* CARD 3 — 24/7 (dark) */}
          <div className='avexa-card avexa-card-dark avexa-card-3'>
            <div>
              <div className='avexa-card-3-big'>{t('card3Big', '24/7')}</div>
              <div className='avexa-card-3-sub'>
                {t('card3Sub', 'Priority Support')}
              </div>
            </div>
            <div className='avexa-badge'>
              <div className='avexa-badge-icon' aria-hidden='true'>
                <svg width='14' height='14' viewBox='0 0 14 14' fill='none'>
                  <rect
                    x='1.5'
                    y='3'
                    width='11'
                    height='8'
                    rx='1.2'
                    stroke='currentColor'
                    strokeWidth='1.4'
                  />
                  <path
                    d='M2 4l5 4 5-4'
                    stroke='currentColor'
                    strokeWidth='1.4'
                    strokeLinecap='round'
                    fill='none'
                  />
                </svg>
              </div>
              <div>
                <div className='avexa-badge-brand'>
                  {t('card3BadgeBrand', 'Avexa')}
                </div>
                <div className='avexa-badge-label'>
                  {t('card3BadgeLabel', 'Support Ticket')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4 — Tailored */}
        <div
          className={`avexa-card-4 rx-reveal ${visible ? 'is-visible' : ''}`}
        >
          <div className='avexa-card avexa-card-light'>
            <div>
              <h3 className='avexa-card-title'>
                {t('card4Title', 'Tailored Solutions')}
              </h3>
              <p className='avexa-card-desc' style={{ marginTop: 12 }}>
                {t(
                  'card4Desc',
                  'No one-size-fits-all — everything is shaped to fit your goals.'
                )}
              </p>
            </div>
            <div className='avexa-img-frame'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c4.url} alt={c4.alt} loading='lazy' />
            </div>
          </div>
        </div>

        {/* CARD 5 — Collaborative (wide BG) */}
        <div
          className={`avexa-card-5 rx-reveal ${visible ? 'is-visible' : ''}`}
        >
          <div className='avexa-card'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className='avexa-bg-image'
              src={c5.url}
              alt={c5.alt}
              loading='lazy'
            />
            <div className='avexa-bg-shade' aria-hidden='true' />
            <div className='avexa-text-overlay'>
              <h3 className='avexa-card-title'>
                {t('card5Title', 'Collaborative Process')}
              </h3>
              <p className='avexa-card-caption'>
                {t('card5Caption', 'We work with you, not just for you.')}
              </p>
            </div>
          </div>
        </div>

        {/* CARD 6 — Creative Meets Practical */}
        <div
          className={`avexa-card-6 rx-reveal ${visible ? 'is-visible' : ''}`}
        >
          <div className='avexa-card avexa-card-light'>
            <div className='avexa-dots' aria-hidden='true'>
              <span className='avexa-dot' />
              <span className='avexa-dot' />
              <span className='avexa-dot' />
            </div>
            <div className='avexa-photo-stack'>
              <div className='avexa-photo avexa-photo-1'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c6a.url} alt={c6a.alt} loading='lazy' />
              </div>
              <div className='avexa-photo avexa-photo-2'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c6b.url} alt={c6b.alt} loading='lazy' />
              </div>
            </div>
            <div>
              <h3 className='avexa-card-title'>
                {t('card6Title', 'Creative Meets Practical')}
              </h3>
              <p className='avexa-card-desc' style={{ marginTop: 12 }}>
                {t(
                  'card6Desc',
                  'Smart design that actually works in the real world.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
