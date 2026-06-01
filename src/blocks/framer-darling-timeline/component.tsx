'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

type TimelineItem = {
  time?: string;
  title?: string;
  description?: string;
  image?: AssetRef | null;
};

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

const IMAGE_FALLBACKS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
  'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=1200&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
];

/**
 * Timeline - Darling — alternating two-column timeline.
 *
 * Centred header on top; below, a vertical spine line runs through the
 * middle. Each item sits on one side (odd → right, even → left) with a
 * dot anchored on the spine. Item content: time, serif title, description,
 * image.
 */
export function FramerDarlingTimeline({ content }: LegacyBlockComponentProps) {
  const heading = String(content.heading || 'The Day');
  const intro = String(
    content.intro ||
      'Here’s what to expect on June 15. Everything takes place at Ulvhälls Herrgård, and we’ll guide you throughout the day.'
  );
  const items = Array.isArray(content.items)
    ? (content.items as TimelineItem[])
    : [];
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-darling-timeline'
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        background: '#f4eed8',
        color: '#1f1d14',
        padding:
          'clamp(80px, 12cqi, 200px) clamp(20px, 5cqi, 80px) clamp(120px, 14cqi, 240px)',
        fontFamily:
          '"Libre Caslon Condensed", "Libre Caslon Text", Georgia, serif',
        overflow: 'hidden',
      }}
    >
      <style>{`
        #framer-darling-timeline .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-darling-timeline .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-darling-timeline .dt-header {
          max-width: 720px;
          margin: 0 auto clamp(80px, 12cqi, 180px);
          text-align: center;
        }
        #framer-darling-timeline .dt-heading {
          font-family: '"Libre Caslon Condensed", Georgia, serif';
          font-weight: 400;
          font-size: clamp(48px, 7cqi, 110px);
          letter-spacing: -0.02em;
          line-height: 1.05;
          margin: 0 0 clamp(20px, 2.5cqi, 36px);
          color: #1f1d14;
        }
        #framer-darling-timeline .dt-intro {
          font-family: '"Libre Caslon Condensed", "Libre Caslon Text", Georgia, serif';
          font-size: clamp(16px, 1.4cqi, 20px);
          line-height: 1.55;
          color: rgba(31, 29, 20, 0.7);
          margin: 0 auto;
          max-width: 560px;
        }
        #framer-darling-timeline .dt-stage {
          position: relative;
          max-width: 1320px;
          margin: 0 auto;
        }
        #framer-darling-timeline .dt-spine {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 1px;
          background: rgba(31, 29, 20, 0.18);
          transform: translateX(-50%);
          pointer-events: none;
        }
        #framer-darling-timeline .dt-row {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(40px, 5cqi, 80px);
          padding-bottom: clamp(80px, 10cqi, 160px);
        }
        #framer-darling-timeline .dt-row:last-child { padding-bottom: 0; }
        #framer-darling-timeline .dt-dot {
          position: absolute;
          left: 50%;
          top: 0;
          width: 11px;
          height: 11px;
          border-radius: 999px;
          background: #1f1d14;
          transform: translate(-50%, -2px);
          z-index: 1;
        }
        #framer-darling-timeline .dt-side { display: flex; flex-direction: column; }
        #framer-darling-timeline .dt-side--right {
          grid-column: 2 / 3;
          padding-left: clamp(20px, 3cqi, 56px);
          text-align: left;
          align-items: flex-start;
        }
        #framer-darling-timeline .dt-side--left {
          grid-column: 1 / 2;
          padding-right: clamp(20px, 3cqi, 56px);
          text-align: right;
          align-items: flex-end;
        }
        #framer-darling-timeline .dt-time {
          font-size: clamp(13px, 1.05cqi, 16px);
          letter-spacing: 0.04em;
          color: rgba(31, 29, 20, 0.7);
          margin: 0 0 clamp(12px, 1.5cqi, 20px);
        }
        #framer-darling-timeline .dt-title {
          font-weight: 400;
          font-size: clamp(34px, 4.2cqi, 64px);
          letter-spacing: -0.01em;
          line-height: 1.05;
          margin: 0 0 clamp(16px, 2cqi, 28px);
          color: #1f1d14;
        }
        #framer-darling-timeline .dt-desc {
          font-size: clamp(15px, 1.25cqi, 18px);
          line-height: 1.55;
          color: rgba(31, 29, 20, 0.78);
          margin: 0 0 clamp(28px, 3cqi, 44px);
          max-width: 44ch;
        }
        #framer-darling-timeline .dt-image {
          position: relative;
          width: 100%;
          max-width: 540px;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: #d8d2bc;
        }
        #framer-darling-timeline .dt-image img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        @media (max-width: 1199px) and (min-width: 810px) {
          #framer-darling-timeline .dt-row { gap: 32px; padding-bottom: 100px; }
        }
        @media (max-width: 809px) {
          #framer-darling-timeline .dt-spine { left: 16px; transform: none; }
          #framer-darling-timeline .dt-row {
            grid-template-columns: 1fr;
            gap: 0;
            padding-bottom: 56px;
            padding-left: 40px;
          }
          #framer-darling-timeline .dt-dot { left: 16px; transform: translate(-50%, -2px); }
          #framer-darling-timeline .dt-side--left,
          #framer-darling-timeline .dt-side--right {
            grid-column: 1 / -1;
            padding: 0;
            text-align: left;
            align-items: flex-start;
          }
          #framer-darling-timeline .dt-desc { max-width: none; }
          #framer-darling-timeline .dt-title { font-size: clamp(28px, 8cqi, 40px); }
        }
      `}</style>

      <header className={`dt-header rx-reveal ${visible ? 'is-visible' : ''}`}>
        <h2 className='dt-heading'>{heading}</h2>
        <p className='dt-intro'>{intro}</p>
      </header>

      <div className='dt-stage'>
        <div className='dt-spine' aria-hidden='true' />
        {items.map((item, idx) => {
          const sideRight = idx % 2 === 0;
          const fallbackImg = IMAGE_FALLBACKS[idx % IMAGE_FALLBACKS.length];
          const imgUrl = item.image?.url || fallbackImg;
          const imgAlt = item.image?.alt ?? item.title ?? 'Timeline item';
          return (
            <div
              key={idx}
              className={`dt-row rx-reveal ${visible ? 'is-visible' : ''}`}
            >
              <span className='dt-dot' aria-hidden='true' />
              <div
                className={
                  sideRight ? 'dt-side dt-side--right' : 'dt-side dt-side--left'
                }
              >
                <p className='dt-time'>{item.time || ''}</p>
                <h3 className='dt-title'>{item.title || ''}</h3>
                <p className='dt-desc'>{item.description || ''}</p>
                <div className='dt-image'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl} alt={imgAlt} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
