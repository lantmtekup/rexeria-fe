'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Framer Hero — landscape image full-bleed + italic serif title bottom-left + minimal top nav. */
export function FramerHero({ content }: LegacyBlockComponentProps) {
  const logo = String(content.logo || 'ecopark');
  const navLink = String(content.navLink || 'Contact');
  const title = String(content.title || 'Live with Nature\nBathe in Serenity');
  const bg = (content.backgroundImage as AssetRef | null) ?? null;
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-hero'
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: 600,
        overflow: 'hidden',
        background: '#e8eae3',
        fontFamily: "'Funnel Display', 'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`
        #framer-hero .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-hero .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
      `}</style>

      {/* Background image */}
      {bg?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bg.url}
          alt={bg.alt ?? ''}
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

      {/* Top nav */}
      <nav
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'clamp(20px, 2.5cqi, 40px) clamp(24px, 4cqi, 60px)',
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontFamily: "'Aboreto', serif",
            fontSize: 24,
            fontWeight: 400,
            color: '#ffffff',
            letterSpacing: 0.5,
          }}
        >
          {logo}
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: '#ffffff',
            letterSpacing: 0.3,
          }}
        >
          {navLink}
        </span>
      </nav>

      {/* Title bottom-left */}
      <div
        className={`rx-reveal ${visible ? 'is-visible' : ''}`}
        style={{
          position: 'absolute',
          bottom: 'clamp(40px, 6vh, 80px)',
          left: 'clamp(24px, 4cqi, 80px)',
          right: 'clamp(24px, 4cqi, 80px)',
          zIndex: 2,
        }}
      >
        <h1
          style={{
            fontFamily: "'Aboreto', serif",
            fontSize: 'clamp(48px, 7cqi, 110px)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.05,
            color: '#ffffff',
            letterSpacing: -0.5,
            margin: 0,
            textShadow: '0 2px 20px rgba(0, 0, 0, 0.25)',
            whiteSpace: 'pre-line',
          }}
        >
          {title}
        </h1>
      </div>
    </section>
  );
}
