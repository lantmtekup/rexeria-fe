'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}
interface Item {
  title: string;
  description: string;
  image: AssetRef | null;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Velora Services (simplified static stack).
 *
 * Original used per-row sticky positioning with ascending z-index for a
 * "page-flip" scroll effect. Rexer port renders rows as a static stack with
 * IO fade-in — visually preserved (3-col layout + divider), scroll-pin removed.
 */
export function FramerVeloraServices({ content }: LegacyBlockComponentProps) {
  const items: Item[] = Array.isArray(content.items)
    ? (content.items as Item[])
    : [];

  return (
    <section
      id='framer-velora-services'
      style={{
        position: 'relative',
        width: '100%',
        background: '#ffffff',
        color: '#0c0c0c',
        fontFamily: '"Inter", system-ui, sans-serif',
        padding: 'clamp(40px, 5vw, 80px) clamp(20px, 4vw, 64px)',
      }}
    >
      <style>{`
        #framer-velora-services .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-velora-services .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-velora-services .velora-list { max-width: 1440px; margin: 0 auto; }
        #framer-velora-services .velora-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1.4fr;
          gap: clamp(16px, 3vw, 48px);
          align-items: center;
          padding: clamp(48px, 8vh, 96px) clamp(20px, 4vw, 64px);
          border-top: 1px solid rgba(0,0,0,0.08);
        }
        #framer-velora-services .velora-row:last-child { border-bottom: 1px solid rgba(0,0,0,0.08); }
        #framer-velora-services .velora-num { font-size: clamp(11px, 0.95vw, 13px); font-weight: 500; color: rgba(0,0,0,0.5); margin: 0 0 12px; letter-spacing: 0.06em; }
        #framer-velora-services .velora-title { font-size: clamp(24px, 3vw, 44px); font-weight: 500; line-height: 1.1; letter-spacing: -0.02em; margin: 0; color: #0c0c0c; }
        #framer-velora-services .velora-desc { font-size: clamp(13px, 1.1vw, 16px); line-height: 1.5; color: rgba(0,0,0,0.6); margin: 0; max-width: 36ch; }
        #framer-velora-services .velora-img-wrap { aspect-ratio: 16 / 10; width: 100%; overflow: hidden; background: #f0f0f0; border-radius: 4px; }
        #framer-velora-services .velora-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
        @media (max-width: 1199px) and (min-width: 810px) {
          #framer-velora-services .velora-row { grid-template-columns: 1fr 1fr 1.2fr; gap: 24px; }
        }
        @media (max-width: 809px) {
          #framer-velora-services .velora-row { grid-template-columns: 1fr; gap: 16px; padding: 32px 20px; }
          #framer-velora-services .velora-img-wrap { order: 3; }
        }
      `}</style>

      <div className='velora-list'>
        {items.map((item, idx) => (
          <ServiceRow key={idx} item={item} index={idx} />
        ))}
      </div>
    </section>
  );
}

function ServiceRow({ item, index }: { item: Item; index: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`velora-row rx-reveal ${visible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div>
        <p className='velora-num'>{String(index + 1).padStart(2, '0')}</p>
        <h3 className='velora-title'>{item.title}</h3>
      </div>
      <div>
        <p className='velora-desc'>{item.description}</p>
      </div>
      <div className='velora-img-wrap'>
        {item.image?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image.url} alt={item.image.alt ?? ''} loading='lazy' />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#e5e7eb',
            }}
          />
        )}
      </div>
    </div>
  );
}
