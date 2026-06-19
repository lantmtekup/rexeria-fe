import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerPerformAboutContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerPerformAboutProps {
  content: FramerPerformAboutContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Framer Perform About — nền đen, các hàng xếp chồng: text trái + ảnh phải.
 * Port từ `src/blocks/framer-perform-about`.
 * Responsive bằng container-query, không dùng viewport breakpoint.
 */

const TEXT_HIGHLIGHT_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(20px, 3cqi, 32px)',
  fontWeight: 500,
  lineHeight: 1.28,
  letterSpacing: '-0.015em',
  color: '#ffffff',
};

const TEXT_REST_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(20px, 3cqi, 32px)',
  fontWeight: 500,
  lineHeight: 1.28,
  letterSpacing: '-0.015em',
  color: 'rgb(153, 153, 153)',
};

export function FramerPerformAbout({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerPerformAboutProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const testimonials: Array<{
    imageUrl: string;
    textHighlight: string;
    textRest: string;
  }> = Array.isArray(content.testimonials) ? content.testimonials : [];

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative w-full overflow-hidden rounded-md bg-black duration-700 ease-out',
        className
      )}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding:
            'clamp(40px, 6cqi, 100px) clamp(16px, 3cqi, 40px) clamp(32px, 4cqi, 60px)',
        }}
      >
        {testimonials.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: 'clamp(24px, 4cqi, 64px)',
              alignItems: 'center',
              marginBottom:
                idx < testimonials.length - 1 ? 'clamp(40px, 6cqi, 80px)' : 0,
            }}
          >
            {/* Text trái */}
            <p
              data-element-key={`testimonials[${idx}].textHighlight`}
              style={composeStyle(
                {
                  maxWidth: 640,
                  paddingRight: 'clamp(16px, 2cqi, 40px)',
                  margin: 0,
                },
                styleOf(`testimonials[${idx}].textHighlight`)
              )}
              className={selectableClass(
                activeKey === `testimonials[${idx}].textHighlight`
              )}
            >
              <span style={TEXT_HIGHLIGHT_STYLE}>{item.textHighlight}</span>
              {item.textRest && (
                <>
                  {' '}
                  <span style={TEXT_REST_STYLE}>{item.textRest}</span>
                </>
              )}
            </p>

            {/* Ảnh phải — dùng div background thay <img> */}
            <div
              data-element-key={`testimonials[${idx}].imageUrl`}
              style={composeStyle(
                item.imageUrl
                  ? {
                      backgroundImage: `url("${item.imageUrl.replace(/"/g, '%22')}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : { backgroundColor: '#111111' },
                {
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  maxWidth: 640,
                  borderRadius: 16,
                  overflow: 'hidden',
                },
                styleOf(`testimonials[${idx}].imageUrl`)
              )}
              className={selectableClass(
                activeKey === `testimonials[${idx}].imageUrl`
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
