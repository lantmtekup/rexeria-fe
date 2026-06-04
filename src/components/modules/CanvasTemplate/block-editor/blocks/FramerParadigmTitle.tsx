import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerParadigmTitleContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerParadigmTitleProps {
  content: FramerParadigmTitleContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Paradigm Title — 2 dòng text căn giữa trên + dưới ảnh full-width,
 * overlay text trên ảnh. Port từ `src/blocks/framer-paradigm-title`.
 * Responsive bằng container-query; không dùng viewport breakpoint.
 */

const TITLE_LINE_STYLE: React.CSSProperties = {
  fontFamily: "'Funnel Display', 'Inter', system-ui, sans-serif",
  fontSize: 'clamp(36px, 5cqi, 76px)',
  fontWeight: 500,
  lineHeight: 1.05,
  color: '#111',
  letterSpacing: '-0.02em',
  margin: 0,
};

const OVERLAY_STYLE: React.CSSProperties = {
  fontFamily: "'Funnel Display', 'Inter', system-ui, sans-serif",
  fontSize: 'clamp(32px, 4cqi, 64px)',
  fontWeight: 500,
  lineHeight: 1.1,
  color: '#ffffff',
  letterSpacing: '-0.01em',
  textShadow: '0 2px 24px rgba(0,0,0,0.35)',
  textAlign: 'center',
  margin: 0,
};

export function FramerParadigmTitle({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerParadigmTitleProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  return (
    <div
      style={composeStyle(
        { background: '#ffffff' },
        blockBackgroundStyle(background)
      )}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative w-full overflow-hidden duration-700 ease-out',
        className
      )}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 'clamp(80px, 12cqi, 160px) clamp(24px, 4cqi, 80px)',
          textAlign: 'center',
        }}
      >
        {/* Dòng tiêu đề trên */}
        <div
          data-element-key='titleTop'
          style={composeStyle(TITLE_LINE_STYLE, styleOf('titleTop'))}
          className={selectableClass(activeKey === 'titleTop')}
        >
          {content.titleTop}
        </div>

        {/* Dòng tiêu đề dưới */}
        <div
          data-element-key='titleBottom'
          style={composeStyle(
            TITLE_LINE_STYLE,
            { margin: '0.4em 0 clamp(40px, 6cqi, 80px)' },
            styleOf('titleBottom')
          )}
          className={selectableClass(activeKey === 'titleBottom')}
        >
          {content.titleBottom}
        </div>

        {/* Ảnh full-width với overlay */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            background: content.imageUrl
              ? undefined
              : 'linear-gradient(135deg, #4a6b52 0%, #2d4a34 100%)',
            overflow: 'hidden',
          }}
        >
          {/* Ảnh nền — không dùng <img> */}
          <div
            data-element-key='imageUrl'
            style={composeStyle(
              content.imageUrl
                ? {
                    backgroundImage: `url("${content.imageUrl.replace(/"/g, '%22')}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : undefined,
              styleOf('imageUrl')
            )}
            className={selectableClass(
              activeKey === 'imageUrl',
              'absolute inset-0'
            )}
          />

          {/* Overlay text */}
          {content.overlayText && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 clamp(16px, 3cqi, 40px)',
              }}
            >
              <div
                data-element-key='overlayText'
                style={composeStyle(OVERLAY_STYLE, styleOf('overlayText'))}
                className={selectableClass(activeKey === 'overlayText')}
              >
                {content.overlayText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
