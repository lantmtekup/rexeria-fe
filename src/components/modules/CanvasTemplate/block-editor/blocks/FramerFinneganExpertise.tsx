import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerFinneganExpertiseContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerFinneganExpertiseProps {
  content: FramerFinneganExpertiseContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Finnegan Expertise (Framer), framer-native. Port từ `src/blocks/framer-finnegan-expertise`:
 * nền tối #0a0a0a, ghost heading cực to phía trên, các thẻ chuyên môn xếp chồng
 * (ảnh trái + panel màu phải). Không dùng thẻ <img> — dùng div backgroundImage.
 */

const DEFAULT_PALETTE = [
  '#e85a2c',
  '#2c7be8',
  '#1f9d55',
  '#7c4dff',
  '#f5b342',
  '#d63384',
];

function isLightHex(hex: string): boolean {
  const m = hex.match(/^#?([0-9a-fA-F]{6})$/);
  if (!m) return true;
  const v = m[1];
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 145;
}

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: '"Manrope", sans-serif',
  fontSize: 'clamp(48px, 12cqi, 180px)',
  fontWeight: 300,
  letterSpacing: '-0.02em',
  lineHeight: 1,
  textAlign: 'center',
  margin: '0 0 clamp(40px, 6cqi, 80px)',
  pointerEvents: 'none',
  userSelect: 'none',
};

const CARD_TITLE_STYLE: React.CSSProperties = {
  fontFamily: '"Manrope", sans-serif',
  fontSize: 'clamp(20px, 2.6cqi, 36px)',
  fontWeight: 500,
  letterSpacing: '-0.01em',
  lineHeight: 1.15,
  margin: '0 0 clamp(16px, 3cqi, 40px)',
};

const CARD_DESC_STYLE: React.CSSProperties = {
  fontFamily: '"Manrope", sans-serif',
  fontSize: 'clamp(13px, 1.4cqi, 17px)',
  lineHeight: 1.7,
  margin: 0,
};

export function FramerFinneganExpertise({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerFinneganExpertiseProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const slides: Array<{
    imageUrl: string;
    title: string;
    description: string;
    bgColor: string;
  }> = Array.isArray(content.slides) ? content.slides : [];

  const cardBg = content.cardBg || '#e85a2c';

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative w-full overflow-hidden bg-[#0a0a0a] duration-700 ease-out',
        className
      )}
    >
      <div
        style={{
          padding: 'clamp(80px, 12cqi, 160px) clamp(20px, 4cqi, 80px)',
          fontFamily: '"Manrope", sans-serif',
        }}
      >
        {/* Ghost heading */}
        <h2
          data-element-key='heading'
          style={composeStyle(
            HEADING_STYLE,
            { color: cardBg },
            styleOf('heading')
          )}
          className={selectableClass(activeKey === 'heading')}
        >
          {content.heading}
        </h2>

        {/* Expertise cards stack */}
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(32px, 6cqi, 80px)',
          }}
        >
          {slides.map((slide, idx) => {
            const bg =
              slide.bgColor ||
              DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length] ||
              cardBg;
            const textColor = isLightHex(bg) ? '#0a0a0a' : '#ffffff';
            return (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  overflow: 'hidden',
                  borderRadius: 12,
                  boxShadow: '0 24px 60px -16px rgba(0,0,0,0.45)',
                }}
                className='@[0px]:grid-cols-1 @[600px]:grid-cols-2'
              >
                {/* Image panel */}
                <div
                  data-element-key={`slides.${idx}.imageUrl`}
                  style={composeStyle(
                    slide.imageUrl
                      ? {
                          backgroundImage: `url("${slide.imageUrl.replace(/"/g, '%22')}")`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : {
                          background:
                            'linear-gradient(135deg, #1f2937 0%, #0a0a0a 100%)',
                        },
                    { width: '100%', aspectRatio: '16 / 9' },
                    styleOf(`slides.${idx}.imageUrl`)
                  )}
                  className={selectableClass(
                    activeKey === `slides.${idx}.imageUrl`,
                    'relative overflow-hidden'
                  )}
                />

                {/* Info panel */}
                <div
                  style={{
                    background: bg,
                    color: textColor,
                    padding:
                      'clamp(28px, 4cqi, 56px) clamp(20px, 3.5cqi, 48px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <h3
                    data-element-key={`slides.${idx}.title`}
                    style={composeStyle(
                      CARD_TITLE_STYLE,
                      { color: textColor },
                      styleOf(`slides.${idx}.title`)
                    )}
                    className={selectableClass(
                      activeKey === `slides.${idx}.title`
                    )}
                  >
                    {slide.title}
                  </h3>
                  <p
                    data-element-key={`slides.${idx}.description`}
                    style={composeStyle(
                      CARD_DESC_STYLE,
                      { color: textColor },
                      styleOf(`slides.${idx}.description`)
                    )}
                    className={selectableClass(
                      activeKey === `slides.${idx}.description`
                    )}
                  >
                    {slide.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
