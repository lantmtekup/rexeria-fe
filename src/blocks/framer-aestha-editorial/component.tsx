'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

interface NavLink {
  label: string;
  href: string;
}

/** Framer Aestha Editorial — sticky brand column on left, 3 stacked scroll images on right. */
export function FramerAesthaEditorial({ content }: LegacyBlockComponentProps) {
  const brand = String(content.brand ?? 'RAMSA');
  const tagline = String(
    content.tagline ?? 'Nơi thanh lịch cổ điển gặp gỡ tinh tế hiện đại.'
  );
  const scrollLabel = String(content.scrollLabel ?? 'scroll');
  const description = String(content.description ?? '');
  const ctaText = String(content.ctaText ?? 'KHÁM PHÁ THÊM');
  const ctaHref = String(content.ctaHref ?? '/projects');
  const image1 = (content.image1 as AssetRef | null) ?? null;
  const image2 = (content.image2 as AssetRef | null) ?? null;
  const image3 = (content.image3 as AssetRef | null) ?? null;
  const navLinks: NavLink[] = Array.isArray(content.navLinks)
    ? (content.navLinks as NavLink[])
    : [];

  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-aestha-editorial'
      ref={ref}
      style={{
        background: '#FFFFFF',
        color: '#1A1A1A',
        fontFamily:
          "'Switzer Variable', 'Funnel Display', 'Inter', -apple-system, sans-serif",
        position: 'relative',
        padding: 'clamp(24px, 3.5cqi, 48px)',
      }}
    >
      <style>{`
        #framer-aestha-editorial .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s cubic-bezier(0.16,1,0.3,1), transform 1.1s cubic-bezier(0.16,1,0.3,1); }
        #framer-aestha-editorial .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-aestha-editorial .fae-wrap {
          display: grid;
          grid-template-columns: minmax(280px, 1fr) 1.35fr;
          gap: clamp(32px, 5cqi, 96px);
          max-width: 1440px;
          margin: 0 auto;
          align-items: start;
        }
        #framer-aestha-editorial .fae-left {
          position: sticky;
          top: clamp(24px, 3vh, 48px);
          height: calc(100vh - clamp(48px, 6vh, 96px));
          display: flex;
          flex-direction: column;
        }
        #framer-aestha-editorial .fae-tagline-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: clamp(24px, 4vh, 48px);
        }
        #framer-aestha-editorial .fae-spacer { flex: 1 1 auto; min-height: clamp(80px, 16vh, 200px); }
        #framer-aestha-editorial .fae-desc { margin-top: clamp(24px, 4vh, 48px); }
        #framer-aestha-editorial .fae-nav {
          display: flex;
          gap: clamp(14px, 2cqi, 28px);
          align-items: center;
          margin-top: clamp(24px, 4vh, 48px);
        }
        #framer-aestha-editorial .fae-right {
          display: flex;
          flex-direction: column;
          position: relative;
          padding-bottom: clamp(40px, 8vh, 120px);
        }
        #framer-aestha-editorial .fae-img-wrap {
          position: relative;
          overflow: hidden;
          background: #EEE;
        }
        #framer-aestha-editorial .fae-img1 {
          width: min(520px, 95%);
          margin-left: 0;
          margin-top: clamp(60px, 10vh, 120px);
          aspect-ratio: 4 / 5;
          z-index: 1;
        }
        #framer-aestha-editorial .fae-img2 {
          width: min(680px, 100%);
          margin-left: auto;
          margin-right: calc(-1 * clamp(12px, 3cqi, 48px));
          margin-top: clamp(-160px, -12vh, -80px);
          aspect-ratio: 5 / 6;
          z-index: 2;
        }
        #framer-aestha-editorial .fae-img3 {
          width: min(560px, 90%);
          margin: 0 auto;
          margin-top: clamp(-140px, -10vh, -60px);
          aspect-ratio: 7 / 6;
          z-index: 3;
        }
        #framer-aestha-editorial .fae-cta {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          align-self: center;
          font-family: 'Funnel Display', 'Switzer', 'Inter', sans-serif;
          font-size: clamp(24px, 3cqi, 40px);
          font-weight: 400;
          letter-spacing: -0.01em;
          color: #1A1A1A;
          text-decoration: none;
          padding: 8px 4px;
          transition: opacity 0.3s ease;
          margin-top: clamp(40px, 6vh, 80px);
        }
        #framer-aestha-editorial .fae-cta:hover { opacity: 0.7; }
        #framer-aestha-editorial .fae-cta .fae-arrow {
          display: inline-block;
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        #framer-aestha-editorial .fae-cta:hover .fae-arrow { transform: translateX(10px); }
        #framer-aestha-editorial .fae-nav-link {
          font-family: 'DM Mono', ui-monospace, monospace;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #1A1A1A;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }
        #framer-aestha-editorial .fae-nav-link:hover { opacity: 0.55; }
        #framer-aestha-editorial .fae-scroll-pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(26,26,26,0.06);
          font-family: 'DM Mono', ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: lowercase;
          color: #555;
          line-height: 1.4;
        }
        @media (max-width: 900px) {
          #framer-aestha-editorial .fae-wrap { grid-template-columns: 1fr; gap: 40px; }
          #framer-aestha-editorial .fae-left {
            position: static;
            height: auto;
            gap: 24px;
          }
          #framer-aestha-editorial .fae-spacer { display: none; }
          #framer-aestha-editorial .fae-img1,
          #framer-aestha-editorial .fae-img2,
          #framer-aestha-editorial .fae-img3 {
            width: 100%;
            margin: 0 auto;
            z-index: auto;
          }
          #framer-aestha-editorial .fae-img1 { margin-top: 0; }
          #framer-aestha-editorial .fae-img2,
          #framer-aestha-editorial .fae-img3 { margin-top: 48px; }
          #framer-aestha-editorial .fae-right { gap: 0; }
        }
      `}</style>

      <div className='fae-wrap'>
        {/* Left column (sticky) */}
        <div className='fae-left'>
          <h1
            className={`rx-reveal ${visible ? 'is-visible' : ''}`}
            style={{
              fontFamily: "'Funnel Display', 'Switzer', 'Inter', sans-serif",
              fontSize: 'clamp(36px, 4.5cqi, 60px)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              margin: 0,
            }}
          >
            {brand}
          </h1>

          <div
            className={`fae-tagline-row rx-reveal ${visible ? 'is-visible' : ''}`}
          >
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.5,
                color: '#1A1A1A',
                margin: 0,
                maxWidth: 280,
              }}
            >
              {tagline}
            </p>
            {scrollLabel ? (
              <span className='fae-scroll-pill'>{scrollLabel}</span>
            ) : null}
          </div>

          <div className='fae-spacer' aria-hidden />

          {description ? (
            <p
              className={`fae-desc rx-reveal ${visible ? 'is-visible' : ''}`}
              style={{
                fontSize: 16,
                lineHeight: 1.55,
                color: '#1A1A1A',
                margin: 0,
                maxWidth: 460,
                whiteSpace: 'pre-wrap',
              }}
            >
              {description}
            </p>
          ) : null}

          <nav className='fae-nav' aria-label='Site navigation'>
            {navLinks.map((n, i) => (
              <a
                key={i}
                href={n.href || '#'}
                className={`fae-nav-link rx-reveal ${visible ? 'is-visible' : ''}`}
                aria-label={n.label || `Menu ${i + 1}`}
              >
                <span>{String(n.label || '')}</span>
              </a>
            ))}
          </nav>
        </div>

        {/* Right column (flowing) */}
        <div className='fae-right'>
          <div
            className={`fae-img-wrap fae-img1 rx-reveal ${visible ? 'is-visible' : ''}`}
          >
            {image1?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image1.url}
                alt={image1.alt ?? ''}
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
          <div
            className={`fae-img-wrap fae-img2 rx-reveal ${visible ? 'is-visible' : ''}`}
          >
            {image2?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image2.url}
                alt={image2.alt ?? ''}
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
          <div
            className={`fae-img-wrap fae-img3 rx-reveal ${visible ? 'is-visible' : ''}`}
          >
            {image3?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image3.url}
                alt={image3.alt ?? ''}
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

          <a
            href={ctaHref || '#'}
            className={`fae-cta rx-reveal ${visible ? 'is-visible' : ''}`}
            aria-label={ctaText}
          >
            <span>{ctaText}</span>
            <span className='fae-arrow' aria-hidden>
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
