'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Framer Paradigm Title (simplified static).
 *
 * Original 360-cms version had a sticky scroll-linked timeline (3 phases).
 * Rexer port drops GSAP/sticky for an IO-based reveal: text lines fade in
 * stacked, image fades in below, overlay text fades in last on top of image.
 * Visual intent preserved; scroll-tied progress removed.
 */
export function FramerParadigmTitle({ content }: LegacyBlockComponentProps) {
  const titleTop = String(content.titleTop || 'Explore a new paradigm');
  const titleBottom = String(content.titleBottom || 'In Residential Wellness');
  const overlayText = String(content.overlayText || 'Signature Experiences');
  const image = (content.image as AssetRef | null) ?? null;
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-paradigm-title'
      ref={ref}
      style={{
        background: '#ffffff',
        fontFamily: "'Funnel Display', 'Inter', system-ui, sans-serif",
        position: 'relative',
        padding: 'clamp(80px, 12vh, 160px) clamp(24px, 4vw, 80px)',
      }}
    >
      <style>{`
        #framer-paradigm-title .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-paradigm-title .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            fontFamily: "'Funnel Display', 'Inter', sans-serif",
            fontSize: 'clamp(36px, 5vw, 76px)',
            fontWeight: 500,
            lineHeight: 1.05,
            color: '#111',
            letterSpacing: '-0.02em',
            transitionDelay: '0ms',
          }}
        >
          {titleTop}
        </div>
        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            fontFamily: "'Funnel Display', 'Inter', sans-serif",
            fontSize: 'clamp(36px, 5vw, 76px)',
            fontWeight: 500,
            lineHeight: 1.05,
            color: '#111',
            letterSpacing: '-0.02em',
            transitionDelay: '120ms',
            margin: '0.4em 0 clamp(40px, 6vh, 80px)',
          }}
        >
          {titleBottom}
        </div>

        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            background: image?.url
              ? undefined
              : 'linear-gradient(135deg, #4a6b52 0%, #2d4a34 100%)',
            overflow: 'hidden',
            transitionDelay: '320ms',
          }}
        >
          {image?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.url}
              alt={image.alt ?? ''}
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

          {overlayText && (
            <div
              className={`rx-reveal ${visible ? 'is-visible' : ''}`}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 24px',
                transitionDelay: '700ms',
              }}
            >
              <div
                style={{
                  fontFamily: "'Funnel Display', 'Inter', sans-serif",
                  fontSize: 'clamp(32px, 4vw, 64px)',
                  fontWeight: 500,
                  lineHeight: 1.1,
                  color: '#ffffff',
                  letterSpacing: '-0.01em',
                  textShadow: '0 2px 24px rgba(0,0,0,0.35)',
                  textAlign: 'center',
                }}
              >
                {overlayText}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
