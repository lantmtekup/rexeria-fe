import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerExploreCtaContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerExploreCtaProps {
  content: FramerExploreCtaContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Explore CTA — căn giữa, nền #F5F3EE, eyebrow DM Mono,
 * headline Abril Fatface italic, link dạng [ LABEL ] có underline.
 * Port từ `src/blocks/framer-explore-cta`.
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

const HEADLINE_STYLE: React.CSSProperties = {
  fontFamily: "'Abril Fatface', 'Cormorant Garamond', serif",
  fontSize: 'clamp(36px, 5cqi, 72px)',
  fontStyle: 'italic',
  fontWeight: 400,
  lineHeight: 1.1,
  color: '#1A1A1A',
  letterSpacing: '-0.01em',
  margin: 0,
};

const LINK_STYLE: React.CSSProperties = {
  display: 'inline-block',
  fontFamily: "'DM Mono', monospace",
  fontSize: 'clamp(11px, 1cqi, 13px)',
  fontWeight: 500,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: '#1A1A1A',
  textDecoration: 'none',
  paddingBottom: 4,
  borderBottom: '1px solid #1A1A1A',
};

export function FramerExploreCta({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerExploreCtaProps) {
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
          maxWidth: 820,
          margin: '0 auto',
          padding: 'clamp(80px, 12cqi, 160px) clamp(24px, 4cqi, 80px)',
          textAlign: 'center',
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

        {/* Headline italic serif */}
        <h2
          data-element-key='headline'
          style={composeStyle(
            HEADLINE_STYLE,
            { marginBottom: 'clamp(32px, 5cqi, 56px)' },
            styleOf('headline')
          )}
          className={selectableClass(activeKey === 'headline')}
        >
          {content.headline}
        </h2>

        {/* Link dạng [ LABEL ] */}
        <div
          data-element-key='linkLabel'
          style={styleOf('linkLabel')}
          className={selectableClass(activeKey === 'linkLabel')}
        >
          <a
            href={content.linkHref || '#'}
            style={LINK_STYLE}
            aria-label={content.linkLabel}
          >
            {`[ ${content.linkLabel} ]`}
          </a>
        </div>
      </div>
    </div>
  );
}
