import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerArpeggioHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerArpeggioHeroProps {
  content: FramerArpeggioHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Hero - 03 (Arpeggio), framer-native. Port từ `src/blocks/framer-arpeggio-hero`:
 * ảnh nền portrait full-bleed + gradient, headline trái + agency label phải,
 * wordmark đỏ cực to dưới cùng. Mỗi element là 1 layer sửa inline được
 * (`data-element-key`). Responsive bằng container-query (`cqi` + flex-wrap)
 * thay viewport media-query; reveal đổi sang mount-animation.
 */
const ACCENT = '#FF4D2E';

const HEADLINE_STYLE: React.CSSProperties = {
  fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
  fontSize: 'clamp(22px, 4.2cqi, 46px)',
  fontWeight: 500,
  lineHeight: '1.05em',
  letterSpacing: '-0.02em',
  color: '#ffffff',
  margin: 0,
  whiteSpace: 'pre-line',
};

const SUBTITLE_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(12px, 1cqi, 15px)',
  fontWeight: 500,
  color: '#ffffff',
  margin: 0,
};

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
  fontSize: 'clamp(14px, 2.2cqi, 26px)',
  fontWeight: 500,
  color: '#ffffff',
  margin: 0,
  letterSpacing: '-0.01em',
  lineHeight: 1.1,
};

const WORDMARK_STYLE: React.CSSProperties = {
  fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
  fontSize: 'clamp(42px, 18cqi, 260px)',
  fontWeight: 600,
  lineHeight: 0.9,
  letterSpacing: '-0.04em',
  color: ACCENT,
  margin: 0,
  whiteSpace: 'nowrap',
};

export function FramerArpeggioHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerArpeggioHeroProps) {
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
        'animate-in fade-in zoom-in-95 @container relative flex min-h-[clamp(420px,90cqi,820px)] w-full flex-col overflow-hidden rounded-md bg-[#0B132A] duration-700 ease-out',
        className
      )}
    >
      {/* Background image (full-bleed) + gradient */}
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
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,19,42,0.55)_0%,rgba(11,19,42,0.2)_30%,rgba(11,19,42,0)_60%,rgba(11,19,42,0.4)_100%)]'
      />

      {/* Top row: headline + subtitle (left) · agency label (right) */}
      <div className='relative z-[2] flex flex-wrap items-start justify-between gap-[clamp(20px,5cqi,80px)] px-[clamp(20px,5cqi,80px)] pt-[clamp(28px,8cqi,110px)]'>
        <div className='max-w-[720px] min-w-[min(100%,420px)] flex-[1_1_0]'>
          <h1
            data-element-key='headline'
            style={composeStyle(HEADLINE_STYLE, styleOf('headline'))}
            className={selectableClass(
              activeKey === 'headline',
              'animate-soft-rise'
            )}
          >
            {content.headline}
          </h1>
          {content.subtitle && (
            <div
              data-element-key='subtitle'
              style={styleOf('subtitle')}
              className={selectableClass(
                activeKey === 'subtitle',
                'animate-soft-rise mt-5 inline-flex items-center gap-2.5 [animation-delay:80ms]'
              )}
            >
              <span
                aria-hidden
                className='size-2 shrink-0 rounded-full'
                style={{ background: ACCENT }}
              />
              <span style={SUBTITLE_STYLE}>{content.subtitle}</span>
            </div>
          )}
        </div>

        {content.topRightLabel && (
          <div
            data-element-key='topRightLabel'
            style={composeStyle(LABEL_STYLE, styleOf('topRightLabel'))}
            className={selectableClass(
              activeKey === 'topRightLabel',
              'animate-soft-rise max-w-[280px] shrink-0 text-right [animation-delay:160ms]'
            )}
          >
            {content.topRightLabel}
          </div>
        )}
      </div>

      <div className='flex-1' />

      {/* Bottom row: wordmark + suffix */}
      <div className='animate-soft-rise relative z-[2] flex items-end justify-between gap-3 px-[clamp(20px,5cqi,80px)] pt-[clamp(8px,2cqi,16px)] pb-[clamp(16px,2cqi,24px)] [animation-delay:240ms]'>
        <h2
          data-element-key='wordmark'
          style={composeStyle(WORDMARK_STYLE, styleOf('wordmark'))}
          className={selectableClass(activeKey === 'wordmark')}
        >
          {content.wordmark}
        </h2>
        {content.wordmarkSuffix && (
          <span
            data-element-key='wordmarkSuffix'
            style={composeStyle(
              {
                fontSize: 'clamp(18px, 2cqi, 32px)',
                color: ACCENT,
                fontWeight: 600,
                alignSelf: 'flex-start',
                marginTop: 'clamp(12px, 3cqi, 36px)',
              },
              styleOf('wordmarkSuffix')
            )}
            className={selectableClass(activeKey === 'wordmarkSuffix')}
          >
            {content.wordmarkSuffix}
          </span>
        )}
      </div>
    </div>
  );
}
