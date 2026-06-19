import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerStudioManifestoContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerStudioManifestoProps {
  content: FramerStudioManifestoContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Studio Manifesto — nền #F5F3EE, eyebrow DM Mono, tiêu đề italic serif
 * lớn (Abril Fatface), đoạn body thụt đầu dòng, chữ ký tùy chọn cuối.
 * Port từ `src/blocks/framer-studio-manifesto`.
 * Responsive bằng container-query; không dùng viewport breakpoint.
 */

const EYEBROW_STYLE: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 'clamp(10px, 1cqi, 12px)',
  fontWeight: 500,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: '#555',
  margin: 0,
};

const TITLE_STYLE: React.CSSProperties = {
  fontFamily: "'Abril Fatface', 'Cormorant Garamond', serif",
  fontSize: 'clamp(44px, 6.5cqi, 104px)',
  fontStyle: 'italic',
  fontWeight: 400,
  lineHeight: 1.0,
  color: '#1A1A1A',
  letterSpacing: '-0.02em',
  margin: 0,
};

const BODY_STYLE: React.CSSProperties = {
  fontFamily: "'Funnel Display', 'Inter', system-ui, sans-serif",
  fontSize: 'clamp(18px, 1.5cqi, 24px)',
  lineHeight: 1.55,
  color: '#333',
  fontWeight: 400,
  textIndent: '2em',
  margin: 0,
};

const SIGNATURE_STYLE: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 'clamp(10px, 1cqi, 12px)',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#666',
  margin: 0,
};

export function FramerStudioManifesto({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerStudioManifestoProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  return (
    <div
      style={composeStyle(
        { background: '#F5F3EE' },
        blockBackgroundStyle(background)
      )}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative w-full overflow-hidden duration-700 ease-out',
        className
      )}
    >
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: 'clamp(100px, 16cqi, 220px) clamp(24px, 4cqi, 80px)',
        }}
      >
        {/* Eyebrow */}
        <div
          data-element-key='eyebrow'
          style={composeStyle(
            EYEBROW_STYLE,
            { marginBottom: 'clamp(24px, 4cqi, 40px)' },
            styleOf('eyebrow')
          )}
          className={selectableClass(activeKey === 'eyebrow')}
        >
          {content.eyebrow}
        </div>

        {/* Tiêu đề italic serif lớn */}
        <h2
          data-element-key='title'
          style={composeStyle(
            TITLE_STYLE,
            { marginBottom: 'clamp(40px, 7cqi, 80px)' },
            styleOf('title')
          )}
          className={selectableClass(activeKey === 'title')}
        >
          {content.title}
        </h2>

        {/* Body paragraph thụt đầu dòng */}
        <div
          data-element-key='body'
          style={composeStyle(BODY_STYLE, styleOf('body'))}
          className={selectableClass(activeKey === 'body')}
        >
          {content.body}
        </div>

        {/* Chữ ký tùy chọn */}
        {content.signature && (
          <div
            data-element-key='signature'
            style={composeStyle(
              SIGNATURE_STYLE,
              { marginTop: 'clamp(32px, 5cqi, 56px)' },
              styleOf('signature')
            )}
            className={selectableClass(activeKey === 'signature')}
          >
            {content.signature}
          </div>
        )}
      </div>
    </div>
  );
}
