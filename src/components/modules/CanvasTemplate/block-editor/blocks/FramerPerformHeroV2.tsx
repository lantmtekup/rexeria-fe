import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerPerformHeroV2Content,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerPerformHeroV2Props {
  content: FramerPerformHeroV2Content;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Hero - Perform v2: Manrope centred layout, large title + subtitle wrapper 544px,
 * pill CTA + gold star reviews. Port từ `src/blocks/framer-perform-hero-v2`.
 * Dùng container-query thay breakpoint 810px. Font-size title scale clamp.
 */

const EYEBROW_STYLE: React.CSSProperties = {
  fontFamily: '"Manrope", system-ui, sans-serif',
  fontSize: 'clamp(13px, 1.4cqi, 16px)',
  fontWeight: 400,
  lineHeight: '1.5',
  color: '#ffffff',
  margin: 0,
};

const SUBTITLE_STYLE: React.CSSProperties = {
  fontFamily: '"Manrope", system-ui, sans-serif',
  fontSize: 'clamp(13px, 1.4cqi, 16px)',
  fontWeight: 400,
  lineHeight: '1.5',
  color: '#ffffff',
  margin: 0,
  textAlign: 'center',
};

export function FramerPerformHeroV2({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerPerformHeroV2Props) {
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
        'animate-in fade-in zoom-in-95 @container relative flex min-h-[clamp(460px,90cqi,900px)] w-full flex-col items-center justify-center overflow-hidden rounded-md duration-700 ease-out',
        className
      )}
    >
      {/* Background image + scrim */}
      <div aria-hidden className='pointer-events-none absolute inset-0 z-0'>
        <div
          data-element-key='bgImageUrl'
          style={composeStyle(
            {
              position: 'absolute',
              inset: 0,
            },
            content.bgImageUrl
              ? {
                  backgroundImage: `url("${content.bgImageUrl.replace(/"/g, '%22')}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : { backgroundColor: '#000000' },
            styleOf('bgImageUrl')
          )}
          className={selectableClass(
            activeKey === 'bgImageUrl',
            'absolute inset-0'
          )}
        />
        <div
          className='absolute inset-0'
          style={{ background: 'rgba(0,0,0,0.45)' }}
        />
      </div>

      {/* Centred content */}
      <div
        className='relative z-[1] flex w-full flex-col items-center'
        style={{
          gap: 'clamp(16px, 2cqi, 24px)',
          maxWidth: 720,
          padding: 'clamp(64px, 8cqi, 120px) clamp(20px, 4cqi, 40px)',
          fontFamily: '"Manrope", system-ui, sans-serif',
        }}
      >
        {/* Eyebrow */}
        <div
          data-element-key='eyebrow'
          style={composeStyle(
            { display: 'flex', alignItems: 'center', gap: 12 },
            styleOf('eyebrow')
          )}
          className={selectableClass(activeKey === 'eyebrow')}
        >
          <span
            aria-hidden='true'
            style={{
              width: 24,
              height: 1,
              backgroundColor: '#ffffff',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span style={EYEBROW_STYLE}>
            {content.eyebrow || 'Experienced triathlon coach'}
          </span>
        </div>

        {/* Title — clamp replaces 72px→54px media-query */}
        <h1
          data-element-key='title'
          style={composeStyle(
            {
              fontFamily: '"Manrope", system-ui, sans-serif',
              fontSize: 'clamp(36px, 7cqi, 72px)',
              fontWeight: 500,
              lineHeight: '1.2em',
              letterSpacing: '-0.05em',
              color: '#ffffff',
              margin: 0,
              textAlign: 'center',
            },
            styleOf('title')
          )}
          className={selectableClass(activeKey === 'title')}
        >
          {content.title || 'Level Up Your Performance'}
        </h1>

        {/* Subtitle — max width 544px, shrinks on small containers */}
        <div
          data-element-key='subtitle'
          style={composeStyle(
            {
              width: '100%',
              maxWidth: 'clamp(260px, 60cqi, 544px)',
              textAlign: 'center',
            },
            styleOf('subtitle')
          )}
          className={selectableClass(activeKey === 'subtitle')}
        >
          <p style={SUBTITLE_STYLE}>{content.subtitle || ''}</p>
        </div>

        {/* Button */}
        <a
          data-element-key='buttonText'
          href={content.buttonHref || '#'}
          style={composeStyle(
            {
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: '"Manrope", system-ui, sans-serif',
              fontSize: 'clamp(13px, 1.4cqi, 16px)',
              fontWeight: 500,
              color: '#000000',
              backgroundColor: '#ffffff',
              border: 'none',
              borderRadius: 999,
              padding: 'clamp(11px, 1.2cqi, 14px) clamp(18px, 2cqi, 24px)',
              textDecoration: 'none',
            },
            styleOf('buttonText')
          )}
          className={selectableClass(activeKey === 'buttonText')}
        >
          <span>{content.buttonText || 'Start now'}</span>
          <svg
            aria-hidden='true'
            width='16'
            height='16'
            viewBox='0 0 16 16'
            fill='none'
            style={{ flex: 'none' }}
          >
            <path
              d='M3 8h10M9 4l4 4-4 4'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </a>

        {/* Reviews */}
        <div
          data-element-key='reviewsText'
          style={composeStyle(
            {
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 8,
            },
            styleOf('reviewsText')
          )}
          className={selectableClass(activeKey === 'reviewsText')}
        >
          <span
            aria-hidden='true'
            style={{ color: '#FBBF24', letterSpacing: 2, fontSize: 14 }}
          >
            ★★★★★
          </span>
          <span
            style={{
              fontFamily: '"Manrope", system-ui, sans-serif',
              fontSize: 'clamp(12px, 1.2cqi, 14px)',
              fontWeight: 400,
              color: '#ffffff',
            }}
          >
            {content.reviewsText || ''}
          </span>
        </div>
      </div>
    </div>
  );
}
