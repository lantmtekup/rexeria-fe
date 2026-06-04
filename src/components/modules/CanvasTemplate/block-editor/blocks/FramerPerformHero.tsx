import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerPerformHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerPerformHeroProps {
  content: FramerPerformHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Hero - 01 (Perform v1): Manrope 72/500 + dark-overlay bg + pill CTA + star reviews.
 * Port từ `src/blocks/framer-perform-hero`. Content bên trái, tối đa 720px,
 * overlay gradient ngang từ trái. Responsive bằng container-query.
 */

const TITLE_STYLE: React.CSSProperties = {
  fontFamily: '"Manrope", system-ui, sans-serif',
  fontSize: 'clamp(32px, 6cqi, 72px)',
  fontWeight: 500,
  lineHeight: '1.2em',
  letterSpacing: '-0.05em',
  color: '#ffffff',
  margin: 0,
  textShadow: '0 2px 24px rgba(0, 0, 0, 0.35)',
};

export function FramerPerformHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerPerformHeroProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const reviewStars = Number(content.reviewStars ?? 5);
  const titleLines = (content.title || 'Level Up Your\nPerformance')
    .split('\n')
    .filter(Boolean);

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative flex min-h-[clamp(460px,90cqi,900px)] w-full flex-col overflow-hidden rounded-md duration-700 ease-out',
        className
      )}
    >
      {/* Background image */}
      <div
        data-element-key='backgroundUrl'
        style={composeStyle(
          content.backgroundUrl
            ? {
                backgroundImage: `url("${content.backgroundUrl.replace(/"/g, '%22')}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : { backgroundColor: '#1a1a1a' },
          styleOf('backgroundUrl')
        )}
        className={selectableClass(
          activeKey === 'backgroundUrl',
          'absolute inset-0'
        )}
      />

      {/* Left-to-right gradient overlay */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0'
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 35%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0) 100%)',
        }}
      />

      {/* Content column — left-aligned, max 720px */}
      <div
        className='relative z-[2] flex flex-col justify-center'
        style={{
          minHeight: 'inherit',
          padding: 'clamp(24px, 5cqi, 64px)',
          maxWidth: 720,
          fontFamily: '"Manrope", system-ui, sans-serif',
        }}
      >
        {/* Eyebrow */}
        <div
          data-element-key='eyebrow'
          style={composeStyle(
            {
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            },
            styleOf('eyebrow')
          )}
          className={selectableClass(activeKey === 'eyebrow')}
        >
          <span
            aria-hidden='true'
            style={{
              width: 24,
              height: 1,
              background: 'rgba(255,255,255,0.6)',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 'clamp(12px, 1.2cqi, 14px)',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: 0.2,
            }}
          >
            {content.eyebrow || 'Experienced triathlon coach'}
          </span>
        </div>

        {/* Title lines */}
        <div
          data-element-key='title'
          style={composeStyle({ marginBottom: 24 }, styleOf('title'))}
          className={selectableClass(activeKey === 'title')}
        >
          {titleLines.map((line, i) => (
            <h1 key={i} style={TITLE_STYLE}>
              {line}
            </h1>
          ))}
        </div>

        {/* Subtitle */}
        <div
          data-element-key='subtitle'
          style={composeStyle(
            { marginBottom: 32, maxWidth: 520 },
            styleOf('subtitle')
          )}
          className={selectableClass(activeKey === 'subtitle')}
        >
          <p
            style={{
              fontFamily: '"Manrope", system-ui, sans-serif',
              fontSize: 'clamp(14px, 1.4cqi, 16px)',
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.85)',
              margin: 0,
            }}
          >
            {content.subtitle ||
              'Improve your triathlon performance with personalized training plans guided by an experienced coach committed to your success.'}
          </p>
        </div>

        {/* CTA pill */}
        <div style={{ marginBottom: 48 }}>
          <a
            data-element-key='ctaLabel'
            href={content.ctaHref || '#start'}
            aria-label={content.ctaLabel || 'Start now'}
            style={composeStyle(
              {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: 'clamp(11px, 1.2cqi, 14px) clamp(16px, 2cqi, 22px)',
                background: '#ffffff',
                color: '#0c0c0c',
                borderRadius: 999,
                fontSize: 'clamp(13px, 1.3cqi, 15px)',
                fontWeight: 500,
                textDecoration: 'none',
                lineHeight: 1,
                fontFamily: '"Manrope", system-ui, sans-serif',
              },
              styleOf('ctaLabel')
            )}
            className={selectableClass(activeKey === 'ctaLabel')}
          >
            <span>{content.ctaLabel || 'Start now'}</span>
            <span aria-hidden='true' style={{ fontSize: 16, lineHeight: 1 }}>
              ↗
            </span>
          </a>
        </div>

        {/* Star reviews */}
        <div
          data-element-key='reviewCount'
          style={composeStyle(
            { display: 'flex', alignItems: 'center', gap: 12 },
            styleOf('reviewCount')
          )}
          className={selectableClass(activeKey === 'reviewCount')}
        >
          <div
            aria-label={`${reviewStars} out of 5 stars`}
            style={{ display: 'inline-flex', gap: 2 }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                aria-hidden='true'
                style={{
                  fontSize: 14,
                  color: i < reviewStars ? '#ffffff' : 'rgba(255,255,255,0.3)',
                }}
              >
                ★
              </span>
            ))}
          </div>
          <span
            style={{
              fontSize: 'clamp(12px, 1.2cqi, 14px)',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.85)',
              fontFamily: '"Manrope", system-ui, sans-serif',
            }}
          >
            {content.reviewCount || '100+ Positive Client Reviews'}
          </span>
        </div>
      </div>
    </div>
  );
}
