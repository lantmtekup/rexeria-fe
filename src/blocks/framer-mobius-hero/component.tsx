'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

interface NavItem {
  label?: string;
  href?: string;
}

interface CardItem {
  image?: AssetRef | null;
  href?: string;
  rotation?: number;
  offsetX?: number;
  offsetY?: number;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const FONT_FAMILY = '"Inter Display", "Inter", system-ui, sans-serif';

/** Hero - Möbius: photo stack scatter + huge wordmark + intro paragraph + nav. */
export function FramerMobiusHero({ content }: LegacyBlockComponentProps) {
  const brand = String(content.brand || 'Möbius®');
  const introBody = String(content.introBody || '');
  const navItems = (
    Array.isArray(content.navItems) ? (content.navItems as NavItem[]) : []
  ) as NavItem[];
  const cards = (
    Array.isArray(content.cards) ? (content.cards as CardItem[]) : []
  ) as CardItem[];
  const copyright = String(content.copyright || '© 2018-26');
  const location = String(content.location || 'BERLIN, DE');
  const bgColor = String(content.bgColor || '#ffffff');
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-mobius-hero'
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'min(100vh, 900px)',
        background: bgColor,
        overflow: 'hidden',
        fontFamily: FONT_FAMILY,
        padding: '24px 32px 0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        #framer-mobius-hero .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-mobius-hero .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-mobius-hero a { color: inherit; text-decoration: none; }
        #framer-mobius-hero .mobius-card-top:hover .mobius-cta-arrow,
        #framer-mobius-hero .mobius-card-top:focus-visible .mobius-cta-arrow {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
        #framer-mobius-hero .mobius-cta-arrow {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%) scale(0.8);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 200ms ease, transform 200ms ease;
          pointer-events: none;
          z-index: 2;
        }
        @media (max-width: 810px) {
          #framer-mobius-hero .mobius-nav { gap: 16px !important; font-size: 11px !important; }
          #framer-mobius-hero .mobius-stack { width: 240px !important; height: 320px !important; }
        }
      `}</style>

      <header
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 24,
          width: '100%',
          position: 'relative',
          zIndex: 3,
        }}
      >
        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            maxWidth: 380,
            fontSize: 14,
            lineHeight: '20px',
            color: '#000',
          }}
        >
          <strong style={{ fontWeight: 700 }}>{brand}</strong>{' '}
          <span style={{ fontWeight: 500 }}>{introBody}</span>
        </div>

        <nav
          className='mobius-nav'
          style={{
            display: 'flex',
            gap: 48,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          {navItems.map((n, i) => (
            <a key={i} href={n.href || '#'} style={{ color: '#000' }}>
              {n.label}
            </a>
          ))}
        </nav>
      </header>

      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          minHeight: 400,
          zIndex: 4,
        }}
      >
        <div
          className='mobius-stack'
          style={{
            position: 'relative',
            width: 380,
            height: 560,
            marginBottom: -160,
          }}
        >
          {cards.map((card, i) => {
            if (!card.image?.url) return null;
            const isTopCard = i === cards.length - 1;
            const x = card.offsetX ?? 0;
            const y = card.offsetY ?? 0;
            const rot = card.rotation ?? 0;
            return (
              <a
                key={i}
                href={card.href || '#'}
                className={
                  isTopCard ? 'mobius-card mobius-card-top' : 'mobius-card'
                }
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'block',
                  cursor: 'pointer',
                  zIndex: i + 1,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`,
                  transition: `transform 0.6s ${EASE_EXPO}`,
                }}
                aria-label={card.image.alt ?? `Card ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image.url}
                  alt={card.image.alt ?? ''}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                {isTopCard && (
                  <span className='mobius-cta-arrow' aria-hidden='true'>
                    <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                      <path
                        d='M5 12h14M13 6l6 6-6 6'
                        stroke='#fff'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, paddingBottom: 16 }}>
        <h1
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 'clamp(80px, 20cqi, 290px)',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            margin: 0,
            color: '#000',
            whiteSpace: 'nowrap',
            overflow: 'visible',
          }}
        >
          {brand}
        </h1>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginTop: 8,
            fontSize: 14,
            fontWeight: 500,
            color: '#666',
          }}
        >
          <span>{location}</span>
          <span>{copyright}</span>
        </div>
      </div>
    </section>
  );
}
