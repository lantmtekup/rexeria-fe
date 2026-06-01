'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}
interface Bullet {
  text: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Framer Signature Feature (simplified static).
 *
 * Original used 420vh sticky scroll-linked image fly-over. Rexer port renders
 * a centered text stack with image below + bullet list, all IO fade-in.
 */
export function FramerSignatureFeature({ content }: LegacyBlockComponentProps) {
  const eyebrow = String(content.eyebrow || 'SIGNATURE EXPERIENCES');
  const title = String(content.title || 'Onsen & Wellness Pavilion');
  const image = (content.image as AssetRef | null) ?? null;
  const bullets = Array.isArray(content.bullets)
    ? (content.bullets as Bullet[])
    : [];
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-signature-feature'
      ref={ref}
      style={{
        background: '#f4f4f0',
        fontFamily: "'Funnel Display', 'Inter', system-ui, sans-serif",
        padding: 'clamp(80px, 12vh, 160px) clamp(24px, 4vw, 80px)',
      }}
    >
      <style>{`
        #framer-signature-feature .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-signature-feature .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
      `}</style>

      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: 2.5,
            textTransform: 'uppercase',
            color: '#00940c',
            marginBottom: 'clamp(16px, 2.5vh, 32px)',
            transitionDelay: '0ms',
          }}
        >
          {eyebrow}
        </div>

        <h2
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            fontFamily: "'Aboreto', sans-serif",
            fontSize: 'clamp(45px, 7vw, 112px)',
            fontWeight: 400,
            lineHeight: '0.92em',
            color: '#00940c',
            letterSpacing: '-0.035em',
            textTransform: 'uppercase',
            margin: 0,
            transitionDelay: '120ms',
          }}
        >
          {title}
        </h2>

        {image?.url && (
          <div
            className={`rx-reveal ${visible ? 'is-visible' : ''}`}
            style={{
              width: '100%',
              margin: 'clamp(40px, 6vh, 80px) auto 0',
              transitionDelay: '300ms',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.alt ?? ''}
              style={{
                width: '100%',
                aspectRatio: '16 / 10',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        )}

        {bullets.length > 0 && (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 'clamp(28px, 4vh, 56px) auto 0',
              maxWidth: 640,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              textAlign: 'left',
            }}
          >
            {bullets.map((b, i) => (
              <BulletRow key={i} text={String(b.text || '')} index={i} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function BulletRow({ text, index }: { text: string; index: number }) {
  const { ref, visible } = useReveal<HTMLLIElement>();
  return (
    <li
      ref={ref}
      className={`rx-reveal ${visible ? 'is-visible' : ''}`}
      style={{
        display: 'flex',
        gap: 14,
        fontFamily: "'DM Mono', monospace",
        fontSize: 'clamp(12px, 0.95vw, 14px)',
        lineHeight: 1.5,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        color: '#222',
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#00940c',
          marginTop: 9,
        }}
        aria-hidden
      />
      <span style={{ flex: 1 }}>{text}</span>
    </li>
  );
}
