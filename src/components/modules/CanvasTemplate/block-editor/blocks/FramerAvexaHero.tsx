import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerAvexaHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerAvexaHeroProps {
  content: FramerAvexaHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Hero - Avexa, framer-native. Port từ `src/blocks/framer-avexa-hero`:
 * ảnh portrait nền full-bleed, brand mark trên-trái, heading trên-phải,
 * tagline italic dưới-trái, wordmark cam+trắng cực to dưới-phải.
 * Accent: rgb(255,98,0). Responsive bằng container-query.
 */
const ACCENT = 'rgb(255,98,0)';

const BRAND_MARK_STYLE: React.CSSProperties = {
  fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
  fontSize: 'clamp(12px, 1.2cqi, 17px)',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#ffffff',
  margin: 0,
};

const TOP_HEADING_STYLE: React.CSSProperties = {
  fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
  fontSize: 'clamp(11px, 1cqi, 14px)',
  fontWeight: 500,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.72)',
  margin: 0,
  textAlign: 'right',
};

const TAGLINE_STYLE: React.CSSProperties = {
  fontFamily: '"Georgia", "Times New Roman", serif',
  fontSize: 'clamp(13px, 1.5cqi, 22px)',
  fontWeight: 400,
  fontStyle: 'italic',
  color: 'rgba(255,255,255,0.80)',
  margin: 0,
  lineHeight: 1.35,
  maxWidth: '28ch',
};

const WORDMARK_STYLE: React.CSSProperties = {
  fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
  fontSize: 'clamp(40px, 16cqi, 220px)',
  fontWeight: 700,
  lineHeight: 0.88,
  letterSpacing: '-0.04em',
  margin: 0,
  whiteSpace: 'nowrap',
  color: ACCENT,
};

const WORDMARK_SUFFIX_STYLE: React.CSSProperties = {
  fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
  fontSize: 'clamp(14px, 1.6cqi, 22px)',
  fontWeight: 600,
  color: ACCENT,
  letterSpacing: '-0.01em',
  alignSelf: 'flex-start',
  marginTop: 'clamp(10px, 2.5cqi, 28px)',
};

const WORDMARK_AFTER_STYLE: React.CSSProperties = {
  fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
  fontSize: 'clamp(40px, 16cqi, 220px)',
  fontWeight: 700,
  lineHeight: 0.88,
  letterSpacing: '-0.04em',
  margin: 0,
  whiteSpace: 'nowrap',
  color: '#ffffff',
};

export function FramerAvexaHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerAvexaHeroProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative flex min-h-[clamp(440px,92cqi,860px)] w-full flex-col overflow-hidden rounded-md bg-[#1a1a1a] duration-700 ease-out',
        className
      )}
    >
      {/* ── Background portrait image ─────────────────────────────────── */}
      <div
        data-element-key='backgroundUrl'
        style={composeStyle(
          content.backgroundUrl
            ? {
                backgroundImage: `url("${content.backgroundUrl.replace(/"/g, '%22')}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined,
          styleOf('backgroundUrl')
        )}
        className={selectableClass(
          activeKey === 'backgroundUrl',
          'absolute inset-0'
        )}
      />
      {/* Dark vignette overlay */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0)_45%,rgba(0,0,0,0.5)_100%)]'
      />

      {/* ── Top row: brand-mark (left) + heading (right) ─────────────── */}
      <div className='relative z-10 flex items-start justify-between px-[clamp(20px,4.5cqi,68px)] pt-[clamp(22px,4cqi,48px)]'>
        <span
          data-element-key='brandMark'
          style={composeStyle(BRAND_MARK_STYLE, styleOf('brandMark'))}
          className={selectableClass(activeKey === 'brandMark')}
        >
          {content.brandMark}
        </span>

        <span
          data-element-key='topHeading'
          style={composeStyle(TOP_HEADING_STYLE, styleOf('topHeading'))}
          className={selectableClass(
            activeKey === 'topHeading',
            'max-w-[26ch]'
          )}
        >
          {content.topHeading}
        </span>
      </div>

      {/* Spacer pushes bottom content down */}
      <div className='flex-1' />

      {/* ── Bottom row: tagline (left) + wordmark (right) ─────────────── */}
      <div className='relative z-10 flex flex-wrap items-end justify-between gap-x-[clamp(16px,4cqi,48px)] gap-y-3 px-[clamp(20px,4.5cqi,68px)] pb-[clamp(18px,3.5cqi,44px)]'>
        {/* Tagline — bottom-left */}
        <p
          data-element-key='tagline'
          style={composeStyle(TAGLINE_STYLE, styleOf('tagline'))}
          className={selectableClass(activeKey === 'tagline', 'shrink-0')}
        >
          {content.tagline}
        </p>

        {/* Wordmark cluster — bottom-right */}
        <div
          className='flex flex-col items-end gap-0'
          data-element-key='wordmark'
        >
          {/* Main wordmark line: accent + optional suffix superscript */}
          <div
            className={selectableClass(
              activeKey === 'wordmark',
              'flex items-start'
            )}
          >
            <h2
              style={composeStyle(WORDMARK_STYLE, styleOf('wordmark'))}
              className='m-0 p-0'
            >
              {content.wordmark}
            </h2>
            {content.wordmarkSuffix && (
              <span
                data-element-key='wordmarkSuffix'
                style={composeStyle(
                  WORDMARK_SUFFIX_STYLE,
                  styleOf('wordmarkSuffix')
                )}
                className={selectableClass(activeKey === 'wordmarkSuffix')}
              >
                {content.wordmarkSuffix}
              </span>
            )}
          </div>

          {/* Secondary wordmark line: white */}
          {content.wordmarkAfter && (
            <h2
              data-element-key='wordmarkAfter'
              style={composeStyle(
                WORDMARK_AFTER_STYLE,
                styleOf('wordmarkAfter')
              )}
              className={selectableClass(
                activeKey === 'wordmarkAfter',
                'm-0 p-0'
              )}
            >
              {content.wordmarkAfter}
            </h2>
          )}
        </div>
      </div>
    </div>
  );
}
