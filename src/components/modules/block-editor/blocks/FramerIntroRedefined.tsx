import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerIntroRedefinedContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerIntroRedefinedProps {
  content: FramerIntroRedefinedContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Intro Redefined — nền trắng, eyebrow góc phải (DM Mono),
 * tiêu đề italic serif cực lớn (Abril Fatface), đoạn body.
 * Port từ `src/blocks/framer-intro-redefined`.
 * Responsive bằng container-query; reveal = mount-animation.
 */

const EYEBROW_STYLE: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 'clamp(10px, 1cqi, 12px)',
  fontWeight: 500,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#555',
  margin: 0,
};

const TITLE_STYLE: React.CSSProperties = {
  fontFamily: "'Abril Fatface', 'Cormorant Garamond', serif",
  fontSize: 'clamp(44px, 6cqi, 96px)',
  fontStyle: 'italic',
  fontWeight: 400,
  lineHeight: 1.08,
  color: '#111',
  letterSpacing: '-0.01em',
  margin: 0,
  whiteSpace: 'pre-line',
};

const BODY_STYLE: React.CSSProperties = {
  fontFamily: "'Funnel Display', 'Inter', system-ui, sans-serif",
  fontSize: 'clamp(16px, 1.4cqi, 20px)',
  lineHeight: 1.55,
  color: '#444',
  fontWeight: 400,
  maxWidth: 620,
  margin: 0,
};

export function FramerIntroRedefined({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerIntroRedefinedProps) {
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
          padding: 'clamp(80px, 12cqi, 180px) clamp(24px, 4cqi, 80px)',
        }}
      >
        {/* Eyebrow — căn phải */}
        <div
          style={{
            textAlign: 'right',
            marginBottom: 'clamp(24px, 4cqi, 48px)',
          }}
        >
          <div
            data-element-key='eyebrow'
            style={composeStyle(EYEBROW_STYLE, styleOf('eyebrow'))}
            className={selectableClass(activeKey === 'eyebrow', 'inline-block')}
          >
            {content.eyebrow}
          </div>
        </div>

        {/* Tiêu đề italic serif */}
        <h2
          data-element-key='title'
          style={composeStyle(
            TITLE_STYLE,
            { marginBottom: 'clamp(24px, 3cqi, 48px)' },
            styleOf('title')
          )}
          className={selectableClass(activeKey === 'title')}
        >
          {content.title}
        </h2>

        {/* Body paragraph */}
        <div
          data-element-key='body'
          style={composeStyle(BODY_STYLE, styleOf('body'))}
          className={selectableClass(activeKey === 'body')}
        >
          {content.body}
        </div>
      </div>
    </div>
  );
}
