'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

interface Testimonial {
  image?: AssetRef | null;
  textHighlight?: string;
  textRest?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

const textStyle: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(20px, 3cqi, 32px)',
  fontWeight: 500,
  lineHeight: 1.28,
  letterSpacing: '-0.015em',
  color: '#ffffff',
  margin: 0,
};

const textRestStyle: React.CSSProperties = {
  ...textStyle,
  color: 'rgb(153, 153, 153)',
};

/** Hero - 06 (Perform About): stacked testimonial rows — text left + image right per row. */
export function FramerPerformAbout({ content }: LegacyBlockComponentProps) {
  const items = (
    Array.isArray(content.testimonials)
      ? (content.testimonials as Testimonial[])
      : []
  ) as Testimonial[];
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-perform-about'
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        background: '#000000',
        color: '#ffffff',
        padding:
          'clamp(40px, 6cqi, 100px) clamp(16px, 3cqi, 40px) clamp(32px, 4cqi, 60px)',
        fontFamily: '"Inter", system-ui, sans-serif',
      }}
    >
      <style>{`
        #framer-perform-about .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-perform-about .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-perform-about .perform-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: clamp(24px, 4cqi, 64px);
          align-items: center;
          margin-bottom: clamp(40px, 6cqi, 80px);
        }
        #framer-perform-about .perform-row:last-child { margin-bottom: 0; }
        @media (max-width: 809px) {
          #framer-perform-about .perform-row {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          #framer-perform-about .perform-img { order: -1; }
        }
      `}</style>

      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
        }}
      >
        {items.map((item, idx) => (
          <div key={idx} className='perform-row'>
            <p
              className={`rx-reveal ${visible ? 'is-visible' : ''}`}
              style={{
                ...textStyle,
                maxWidth: 640,
                paddingRight: 'clamp(16px, 2cqi, 40px)',
                transitionDelay: `${idx * 80}ms`,
              }}
            >
              <span style={textStyle}>{item.textHighlight}</span>{' '}
              <span style={textRestStyle}>{item.textRest}</span>
            </p>

            <div
              className={`perform-img rx-reveal ${visible ? 'is-visible' : ''}`}
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1 / 1',
                maxWidth: 640,
                borderRadius: 16,
                overflow: 'hidden',
                background: '#111',
                transitionDelay: `${idx * 80 + 40}ms`,
              }}
            >
              {item.image?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image.url}
                  alt={item.image.alt ?? ''}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
