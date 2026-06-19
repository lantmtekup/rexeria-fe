import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerMobiusHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerMobiusHeroProps {
  content: FramerMobiusHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Hero - Mobius, framer-native. Port từ `src/blocks/framer-mobius-hero`:
 * wordmark cực to dưới cùng, stack ảnh scatter giữa trang, intro text + nav trên.
 * Responsive bằng container-query; reveal dùng mount-animation.
 */

const WORDMARK_STYLE: React.CSSProperties = {
  fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
  fontSize: 'clamp(52px, 20cqi, 280px)',
  fontWeight: 700,
  lineHeight: 0.88,
  letterSpacing: '-0.05em',
  margin: 0,
  whiteSpace: 'nowrap',
};

const BRAND_STYLE: React.CSSProperties = {
  fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
  fontSize: 'clamp(14px, 1.4cqi, 20px)',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  margin: 0,
};

const INTRO_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(11px, 1.1cqi, 15px)',
  fontWeight: 400,
  lineHeight: 1.6,
  margin: 0,
  maxWidth: '36ch',
};

const NAV_ITEM_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(11px, 1cqi, 14px)',
  fontWeight: 500,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  textDecoration: 'none',
};

const META_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(10px, 0.9cqi, 13px)',
  fontWeight: 400,
  letterSpacing: '0.02em',
};

export function FramerMobiusHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerMobiusHeroProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const bgColor = content.bgColor ?? '#f5f0eb';
  const isDark =
    bgColor === '#000000' || bgColor === '#111' || bgColor === '#0d0d0d';
  const textColor = isDark ? '#ffffff' : '#0d0d0d';
  const mutedColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(13,13,13,0.45)';

  return (
    <div
      style={{ ...blockBackgroundStyle(background), background: bgColor }}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative flex min-h-[clamp(480px,100cqi,900px)] w-full flex-col overflow-hidden rounded-md duration-700 ease-out',
        className
      )}
    >
      {/* ── Top bar: brand + nav ───────────────────────────────────────── */}
      <div className='relative z-10 flex flex-wrap items-center justify-between gap-4 px-[clamp(20px,5cqi,72px)] pt-[clamp(22px,4cqi,48px)]'>
        <span
          data-element-key='brand'
          style={composeStyle(
            BRAND_STYLE,
            { color: textColor },
            styleOf('brand')
          )}
          className={selectableClass(activeKey === 'brand')}
        >
          {content.brand}
        </span>

        {/* Nav list */}
        <nav className='flex flex-wrap gap-x-[clamp(16px,2.5cqi,40px)] gap-y-1'>
          {(content.navItems ?? []).map((item, i) => (
            <span
              key={i}
              data-element-key='navItems'
              style={composeStyle(
                NAV_ITEM_STYLE,
                { color: mutedColor },
                styleOf('navItems')
              )}
              className={selectableClass(
                activeKey === 'navItems',
                'cursor-pointer transition-opacity hover:opacity-100'
              )}
            >
              {item.label}
            </span>
          ))}
        </nav>
      </div>

      {/* ── Intro body text ────────────────────────────────────────────── */}
      <div className='relative z-10 px-[clamp(20px,5cqi,72px)] pt-[clamp(16px,2.5cqi,32px)]'>
        <p
          data-element-key='introBody'
          style={composeStyle(
            INTRO_STYLE,
            { color: mutedColor },
            styleOf('introBody')
          )}
          className={selectableClass(activeKey === 'introBody')}
        >
          {content.introBody}
        </p>
      </div>

      {/* ── Photo scatter stack (center) ───────────────────────────────── */}
      <div className='relative z-10 flex flex-1 items-center justify-center py-[clamp(24px,5cqi,60px)]'>
        <div
          data-element-key='cards'
          className={selectableClass(activeKey === 'cards', 'relative mx-auto')}
          style={composeStyle(
            {
              width: 'clamp(180px, 36cqi, 480px)',
              height: 'clamp(220px, 44cqi, 580px)',
            },
            styleOf('cards')
          )}
        >
          {(content.cards ?? []).map((card, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: 0,
                transform: `rotate(${card.rotation ?? 0}deg) translate(${card.offsetX ?? 0}px, ${card.offsetY ?? 0}px)`,
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                backgroundImage: card.imageUrl
                  ? `url("${card.imageUrl.replace(/"/g, '%22')}")`
                  : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: i,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Bottom: wordmark + meta row ────────────────────────────────── */}
      <div className='relative z-10 px-[clamp(20px,5cqi,72px)] pb-[clamp(16px,3cqi,36px)]'>
        <h1
          data-element-key='wordmark'
          style={composeStyle(
            WORDMARK_STYLE,
            { color: textColor },
            styleOf('wordmark')
          )}
          className={selectableClass(activeKey === 'wordmark')}
        >
          {content.brand}
        </h1>

        <div className='mt-[clamp(8px,1.5cqi,18px)] flex flex-wrap items-center justify-between gap-2'>
          <span
            data-element-key='location'
            style={composeStyle(
              META_STYLE,
              { color: mutedColor },
              styleOf('location')
            )}
            className={selectableClass(activeKey === 'location')}
          >
            {content.location}
          </span>
          <span
            data-element-key='copyright'
            style={composeStyle(
              META_STYLE,
              { color: mutedColor },
              styleOf('copyright')
            )}
            className={selectableClass(activeKey === 'copyright')}
          >
            {content.copyright}
          </span>
        </div>
      </div>
    </div>
  );
}
