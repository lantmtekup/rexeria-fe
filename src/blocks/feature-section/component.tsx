'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const ACCENT = '#a88271';
const BG = '#fafaf7';
const INK = '#14110d';

export function FeatureSection({ content }: LegacyBlockComponentProps) {
  const tag = String(content.tag || '');
  const title = String(content.title || '');
  const body = String(content.body || '');
  const reversed = !!content.reversed;
  const mediaImage = content.mediaImage as AssetRef | null;
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='feature-section'
      ref={ref}
      style={{
        padding: '120px 24px',
        background: BG,
        color: INK,
        fontFamily: 'Funnel Display, system-ui, sans-serif',
      }}
    >
      <style>{`
        #feature-section .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #feature-section .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
      `}</style>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 64,
          alignItems: 'center',
          flexDirection: reversed ? 'row-reverse' : 'row',
        }}
      >
        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            order: reversed ? 2 : 1,
            aspectRatio: '1 / 1',
            background: '#e8e2d3',
            overflow: 'hidden',
          }}
        >
          {mediaImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaImage.url}
              alt={mediaImage.alt ?? title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : null}
        </div>
        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{ order: reversed ? 1 : 2, transitionDelay: '120ms' }}
        >
          {tag && (
            <div
              style={{
                color: ACCENT,
                fontSize: 11,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              {tag}
            </div>
          )}
          <h2
            style={{
              fontSize: 'clamp(32px, 4cqi, 56px)',
              fontWeight: 300,
              margin: '0 0 24px',
              lineHeight: 1.1,
              whiteSpace: 'pre-line',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h2>
          {body && (
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.7,
                color: 'rgba(20,17,13,0.65)',
                margin: 0,
                maxWidth: 480,
              }}
            >
              {body}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
