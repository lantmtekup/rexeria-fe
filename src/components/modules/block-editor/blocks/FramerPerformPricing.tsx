'use client';

/**
 * Data-block "Framer · Perform Pricing" (port từ 360-admin-cms
 * framer-perform-pricing).
 *
 * Design SOURCE 360: nền trắng, header căn giữa (eyebrow + heading + subheading),
 * các pricing card xếp chồng theo sticky scroll (ảnh trái 1:1 + price/title/
 * feature-checklist/CTA pill bên phải).
 *
 * Theo contract nền GSAP: header fade-up + từng card fade-up (stagger) qua
 * useBlockMotion (thay framer-motion whileInView gốc + CSS animate-in).
 * @container + container-query (@2xl/cqi) thay md:/lg:; data-element-key +
 * styleOf cho inline-edit (mảng tiers → data-element-key trên container 'tiers').
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerPerformPricingContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface Props {
  content: FramerPerformPricingContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const EYEBROW_STYLE: React.CSSProperties = {
  fontFamily: '"Manrope", system-ui, sans-serif',
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'rgba(0,0,0,0.55)',
  margin: 0,
};

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: '"Manrope", system-ui, sans-serif',
  fontSize: 'clamp(32px, 5.5cqi, 64px)',
  fontWeight: 500,
  letterSpacing: '-0.03em',
  lineHeight: 1.05,
  color: '#0c0c0c',
  margin: 0,
};

const SUBHEADING_STYLE: React.CSSProperties = {
  fontFamily: '"Manrope", system-ui, sans-serif',
  fontSize: 'clamp(15px, 1.4cqi, 17px)',
  fontWeight: 400,
  lineHeight: 1.55,
  color: 'rgba(0,0,0,0.6)',
  margin: 0,
};

const CARD_PRICE_STYLE: React.CSSProperties = {
  fontFamily: '"Manrope", system-ui, sans-serif',
  fontSize: 'clamp(14px, 1.3cqi, 17px)',
  color: 'rgba(0,0,0,0.55)',
  margin: '0 0 12px',
};

const CARD_TITLE_STYLE: React.CSSProperties = {
  fontFamily: '"Manrope", system-ui, sans-serif',
  fontSize: 'clamp(36px, 5cqi, 64px)',
  fontWeight: 500,
  letterSpacing: '-0.03em',
  lineHeight: 1.05,
  color: '#0c0c0c',
  margin: '0 0 clamp(24px, 4cqi, 48px)',
};

const FEATURE_ITEM_STYLE: React.CSSProperties = {
  fontFamily: '"Manrope", system-ui, sans-serif',
  fontSize: 'clamp(14px, 1.25cqi, 17px)',
  lineHeight: 1.45,
  color: '#0c0c0c',
};

const CTA_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 14,
  alignSelf: 'flex-start',
  backgroundColor: '#f3f3f4',
  color: '#0c0c0c',
  borderRadius: 999,
  padding: '6px 6px 6px 22px',
  fontSize: 15,
  fontWeight: 500,
  textDecoration: 'none',
  lineHeight: 1,
  fontFamily: '"Manrope", system-ui, sans-serif',
};

/** Checkmark SVG cho feature list */
function CheckIcon() {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 20 20'
      fill='none'
      aria-hidden
      style={{ flexShrink: 0, marginTop: 4 }}
    >
      <path
        d='M4 10.5l4 4 8-8'
        stroke='#0c0c0c'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

/** Arrow SVG cho CTA pill */
function ArrowIcon() {
  return (
    <span
      aria-hidden
      style={{
        width: 38,
        height: 38,
        borderRadius: 999,
        backgroundColor: '#0c0c0c',
        color: '#ffffff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width='14' height='14' viewBox='0 0 14 14' fill='none'>
        <path
          d='M3.5 10.5L10.5 3.5M10.5 3.5H4.5M10.5 3.5V9.5'
          stroke='currentColor'
          strokeWidth='1.6'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </span>
  );
}

export function FramerPerformPricing({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const tiers = Array.isArray(content.tiers) ? content.tiers : [];
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(rootRef, ({ scroller }) => {
    const root = rootRef.current;
    if (!root) return;

    // Header fade-up (thay HEADER_FADE whileInView gốc)
    const header = root.querySelector<HTMLElement>('.fpp-header');
    if (header) {
      gsap.fromTo(
        header,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: header,
            scroller,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );
    }

    // Mỗi card fade-up (thay CARD_FADE whileInView gốc), stagger theo card
    gsap.utils.toArray<HTMLElement>('.fpp-card', root).forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: i * 0.08,
          scrollTrigger: {
            trigger: card,
            scroller,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );
    });
  });

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='framer-perform-pricing @container relative w-full overflow-hidden bg-white'
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding:
            'clamp(48px, 8cqi, 120px) clamp(20px, 4cqi, 48px) clamp(64px, 10cqi, 160px)',
        }}
      >
        {/* ── Header ── */}
        <div
          className='fpp-header'
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 18,
            margin: '0 auto clamp(40px, 6cqi, 80px)',
            maxWidth: 720,
          }}
        >
          <span
            data-element-key='eyebrow'
            style={composeStyle(EYEBROW_STYLE, styleOf('eyebrow'))}
            className={selectableClass(activeKey === 'eyebrow', 'inline-block')}
          >
            {content.eyebrow}
          </span>

          <h2
            data-element-key='heading'
            style={composeStyle(HEADING_STYLE, styleOf('heading'))}
            className={selectableClass(activeKey === 'heading')}
          >
            {content.heading}
          </h2>

          {content.subheading && (
            <p
              data-element-key='subheading'
              style={composeStyle(SUBHEADING_STYLE, styleOf('subheading'))}
              className={selectableClass(activeKey === 'subheading')}
            >
              {content.subheading}
            </p>
          )}
        </div>

        {/* ── Stack pricing cards (sticky) — mảng tiers, 1 element-key 'tiers' ── */}
        <div
          data-element-key='tiers'
          style={composeStyle({ position: 'relative' }, styleOf('tiers'))}
          className={selectableClass(activeKey === 'tiers')}
        >
          {tiers.map((tier, idx) => {
            const featureLines = (tier.features ?? '')
              .split('\n')
              .map(l => l.trim())
              .filter(Boolean);

            return (
              <div
                key={idx}
                style={{
                  position: 'sticky',
                  // Tất cả card sticky cùng top → card sau cover 100% card trước
                  // (no peek), tránh line tối ở mép như SOURCE 360.
                  top: 80,
                  zIndex: idx + 1,
                  paddingBottom: 'clamp(40px, 6cqi, 80px)',
                }}
              >
                <article
                  className='fpp-card grid'
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 'clamp(20px, 2cqi, 32px)',
                    boxShadow:
                      '0 1px 3px rgba(16,24,40,0.06), 0 12px 40px -8px rgba(16,24,40,0.12)',
                    padding: 'clamp(16px, 1.6cqi, 24px)',
                    gridTemplateColumns: 'minmax(280px, 1fr) 1.1fr',
                    gap: 'clamp(24px, 4cqi, 56px)',
                    alignItems: 'stretch',
                    overflow: 'hidden',
                  }}
                >
                  {/* Ảnh trái (1:1) */}
                  <div
                    style={composeStyle(
                      tier.imageUrl
                        ? {
                            backgroundImage: `url("${tier.imageUrl.replace(/"/g, '%22')}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : {
                            background:
                              'linear-gradient(135deg, #d9dadd 0%, #b8babf 100%)',
                          },
                      {
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1 / 1',
                        borderRadius: 'clamp(16px, 1.6cqi, 24px)',
                        overflow: 'hidden',
                      }
                    )}
                  />

                  {/* Info phải */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      padding:
                        'clamp(16px, 2cqi, 32px) clamp(8px, 1.5cqi, 24px)',
                    }}
                  >
                    <p style={CARD_PRICE_STYLE}>{tier.price}</p>

                    <p style={CARD_TITLE_STYLE}>{tier.title || 'Plan'}</p>

                    {featureLines.length > 0 && (
                      <ul
                        style={{
                          listStyle: 'none',
                          padding: 0,
                          margin: '0 0 clamp(28px, 4cqi, 48px)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'clamp(14px, 1.4cqi, 18px)',
                        }}
                      >
                        {featureLines.map((feat, fIdx) => (
                          <li
                            key={fIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 14,
                            }}
                          >
                            <CheckIcon />
                            <span style={FEATURE_ITEM_STYLE}>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <a
                      href={tier.ctaHref || '#'}
                      aria-label={tier.ctaLabel || 'Get in touch'}
                      style={CTA_STYLE}
                    >
                      <span>{tier.ctaLabel || 'Get in touch'}</span>
                      <ArrowIcon />
                    </a>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @container (max-width: 809px) {
          .framer-perform-pricing .fpp-card {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
        }
      `}</style>
    </section>
  );
}
