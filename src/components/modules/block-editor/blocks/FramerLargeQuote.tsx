import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerLargeQuoteContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerLargeQuoteProps {
  content: FramerLargeQuoteContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Large Quote — trích dẫn italic serif cực lớn (Abril Fatface), tác giả
 * + vai trò bên dưới. `variant = 'dark'` dùng nền #1A1A1A; mặc định sáng
 * (#F5F3EE). Port từ `src/blocks/framer-large-quote`.
 * Canvas editor: dùng fade-in đơn giản thay stagger word-by-word.
 * Responsive bằng container-query; không dùng viewport breakpoint.
 */

export function FramerLargeQuote({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerLargeQuoteProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const isDark = content.variant === 'dark';
  const bg = isDark ? '#1A1A1A' : '#F5F3EE';
  const fg = isDark ? '#F5F3EE' : '#1A1A1A';
  const muted = isDark ? 'rgba(245,243,238,0.6)' : '#666';

  const QUOTE_STYLE: React.CSSProperties = {
    fontFamily: "'Abril Fatface', 'Cormorant Garamond', serif",
    fontSize: 'clamp(36px, 5.2cqi, 88px)',
    fontStyle: 'italic',
    fontWeight: 400,
    lineHeight: 1.12,
    color: fg,
    letterSpacing: '-0.015em',
    margin: 0,
  };

  const AUTHOR_STYLE: React.CSSProperties = {
    fontFamily: "'Aboreto', 'Funnel Display', serif",
    fontSize: 'clamp(14px, 1.2cqi, 18px)',
    letterSpacing: '0.04em',
    color: fg,
    margin: 0,
  };

  const ROLE_STYLE: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 'clamp(10px, 1cqi, 11px)',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: muted,
    margin: 0,
  };

  return (
    <div
      style={composeStyle({ background: bg }, blockBackgroundStyle(background))}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative w-full overflow-hidden duration-700 ease-out',
        className
      )}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: 'clamp(100px, 18cqi, 240px) clamp(24px, 4cqi, 80px)',
          textAlign: 'center',
        }}
      >
        {/* Trích dẫn italic serif */}
        <div
          data-element-key='quote'
          style={composeStyle(
            QUOTE_STYLE,
            { marginBottom: 'clamp(32px, 5cqi, 56px)' },
            styleOf('quote')
          )}
          className={selectableClass(activeKey === 'quote')}
        >
          {content.quote}
        </div>

        {/* Tác giả + vai trò */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            alignItems: 'center',
          }}
        >
          <div
            data-element-key='author'
            style={composeStyle(AUTHOR_STYLE, styleOf('author'))}
            className={selectableClass(activeKey === 'author')}
          >
            {content.author}
          </div>
          <div
            data-element-key='role'
            style={composeStyle(ROLE_STYLE, styleOf('role'))}
            className={selectableClass(activeKey === 'role')}
          >
            {content.role}
          </div>
        </div>
      </div>
    </div>
  );
}
