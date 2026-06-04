import * as React from 'react';

import { cn } from '@/lib/cn';

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

interface FramerPerformPricingProps {
  content: FramerPerformPricingContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Framer Perform Pricing — nền trắng, header căn giữa,
 * các pricing card xếp chồng (ảnh trái + thông tin phải mỗi card).
 * Port từ `src/blocks/framer-perform-pricing`.
 * Responsive bằng container-query, không dùng viewport breakpoint.
 */

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
      width='18'
      height='18'
      viewBox='0 0 18 18'
      fill='none'
      aria-hidden
      style={{ flexShrink: 0, marginTop: 3 }}
    >
      <circle cx='9' cy='9' r='9' fill='#f3f3f4' />
      <path
        d='M5.5 9l2.5 2.5 4.5-5'
        stroke='#0c0c0c'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

/** Arrow-right SVG cho CTA pill */
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
      <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
        <path
          d='M3 8h10M9 4l4 4-4 4'
          stroke='#ffffff'
          strokeWidth='1.5'
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
  className,
}: FramerPerformPricingProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const tiers: Array<{
    imageUrl: string;
    price: string;
    title: string;
    features: string;
    ctaLabel: string;
    ctaHref: string;
  }> = Array.isArray(content.tiers) ? content.tiers : [];

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative w-full overflow-hidden rounded-md bg-white duration-700 ease-out',
        className
      )}
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
            className={selectableClass(activeKey === 'eyebrow')}
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

        {/* ── Stack pricing cards ── */}
        <div style={{ position: 'relative' }}>
          {tiers.map((tier, idx) => {
            const featureLines = (tier.features ?? '')
              .split('\n')
              .map((l: string) => l.trim())
              .filter(Boolean);

            return (
              <div
                key={idx}
                style={{
                  position: 'sticky',
                  top: `${80 + idx * 12}px`,
                  paddingBottom: 'clamp(40px, 6cqi, 80px)',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 'clamp(20px, 2cqi, 32px)',
                    boxShadow:
                      '0 1px 3px rgba(16,24,40,0.06), 0 12px 40px -8px rgba(16,24,40,0.12)',
                    padding: 'clamp(16px, 1.6cqi, 24px)',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(280px, 1fr) 1.1fr',
                    gap: 'clamp(24px, 4cqi, 56px)',
                    alignItems: 'stretch',
                    overflow: 'hidden',
                  }}
                >
                  {/* Ảnh trái */}
                  <div
                    data-element-key={`tiers[${idx}].imageUrl`}
                    style={composeStyle(
                      tier.imageUrl
                        ? {
                            backgroundImage: `url("${tier.imageUrl.replace(/"/g, '%22')}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : { backgroundColor: '#e6e7ea' },
                      {
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1 / 1',
                        borderRadius: 'clamp(16px, 1.6cqi, 24px)',
                        overflow: 'hidden',
                      },
                      styleOf(`tiers[${idx}].imageUrl`)
                    )}
                    className={selectableClass(
                      activeKey === `tiers[${idx}].imageUrl`
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
                    <p
                      data-element-key={`tiers[${idx}].price`}
                      style={composeStyle(
                        CARD_PRICE_STYLE,
                        styleOf(`tiers[${idx}].price`)
                      )}
                      className={selectableClass(
                        activeKey === `tiers[${idx}].price`
                      )}
                    >
                      {tier.price}
                    </p>

                    <p
                      data-element-key={`tiers[${idx}].title`}
                      style={composeStyle(
                        CARD_TITLE_STYLE,
                        styleOf(`tiers[${idx}].title`)
                      )}
                      className={selectableClass(
                        activeKey === `tiers[${idx}].title`
                      )}
                    >
                      {tier.title}
                    </p>

                    {/* Feature list */}
                    {featureLines.length > 0 && (
                      <ul
                        data-element-key={`tiers[${idx}].features`}
                        style={composeStyle(
                          {
                            listStyle: 'none',
                            padding: 0,
                            margin: '0 0 clamp(28px, 4cqi, 48px)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'clamp(12px, 1.4cqi, 18px)',
                          },
                          styleOf(`tiers[${idx}].features`)
                        )}
                        className={selectableClass(
                          activeKey === `tiers[${idx}].features`
                        )}
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

                    {/* CTA */}
                    <a
                      data-element-key={`tiers[${idx}].ctaLabel`}
                      href={tier.ctaHref ?? '#'}
                      style={composeStyle(
                        CTA_STYLE,
                        { alignSelf: 'flex-start' },
                        styleOf(`tiers[${idx}].ctaLabel`)
                      )}
                      className={selectableClass(
                        activeKey === `tiers[${idx}].ctaLabel`
                      )}
                    >
                      {tier.ctaLabel}
                      <ArrowIcon />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
