import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerHeroProps {
  content: FramerHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Framer Hero — landscape image full-bleed + italic serif title bottom-left
 * + minimal top nav (logo left, navLink right).
 * Port từ `src/blocks/framer-hero`. Responsive bằng container-query;
 * thay <img> bằng backgroundImage div.
 */

const LOGO_STYLE: React.CSSProperties = {
  fontFamily: "'Aboreto', serif",
  fontSize: 'clamp(18px, 2.4cqi, 28px)',
  fontWeight: 400,
  color: '#ffffff',
  letterSpacing: 0.5,
  margin: 0,
};

const NAV_LINK_STYLE: React.CSSProperties = {
  fontSize: 'clamp(12px, 1.2cqi, 16px)',
  fontWeight: 500,
  color: '#ffffff',
  letterSpacing: 0.3,
  textDecoration: 'none',
};

const TITLE_STYLE: React.CSSProperties = {
  fontFamily: "'Aboreto', serif",
  fontSize: 'clamp(36px, 7cqi, 110px)',
  fontStyle: 'italic',
  fontWeight: 400,
  lineHeight: 1.05,
  color: '#ffffff',
  letterSpacing: -0.5,
  margin: 0,
  textShadow: '0 2px 20px rgba(0, 0, 0, 0.25)',
  whiteSpace: 'pre-line',
};

export function FramerHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerHeroProps) {
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
        'animate-in fade-in zoom-in-95 @container relative flex min-h-[clamp(420px,90cqi,820px)] w-full flex-col overflow-hidden rounded-md duration-700 ease-out',
        className
      )}
    >
      {/* Background image full-bleed */}
      <div
        data-element-key='backgroundUrl'
        style={composeStyle(
          content.backgroundUrl
            ? {
                backgroundImage: `url("${content.backgroundUrl.replace(/"/g, '%22')}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : { backgroundColor: '#e8eae3' },
          styleOf('backgroundUrl')
        )}
        className={selectableClass(
          activeKey === 'backgroundUrl',
          'absolute inset-0'
        )}
      />

      {/* Subtle gradient so text is legible */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0'
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)',
        }}
      />

      {/* Top nav */}
      <nav
        className='relative z-[2] flex items-center justify-between'
        style={{
          padding: 'clamp(16px, 2.5cqi, 40px) clamp(20px, 4cqi, 60px)',
        }}
      >
        <span
          data-element-key='logo'
          style={composeStyle(LOGO_STYLE, styleOf('logo'))}
          className={selectableClass(activeKey === 'logo')}
        >
          {content.logo || 'ecopark'}
        </span>

        <a
          data-element-key='navLink'
          href={content.navHref || '#'}
          style={composeStyle(NAV_LINK_STYLE, styleOf('navLink'))}
          className={selectableClass(activeKey === 'navLink')}
        >
          {content.navLink || 'Contact'}
        </a>
      </nav>

      {/* Spacer */}
      <div className='flex-1' />

      {/* Title — bottom-left */}
      <div
        className='relative z-[2]'
        style={{
          padding:
            'clamp(32px, 6cqi, 80px) clamp(20px, 4cqi, 80px) clamp(32px, 6cqi, 80px)',
        }}
      >
        <h1
          data-element-key='title'
          style={composeStyle(TITLE_STYLE, styleOf('title'))}
          className={selectableClass(activeKey === 'title')}
        >
          {content.title || 'Live with Nature\nBathe in Serenity'}
        </h1>
      </div>
    </div>
  );
}
