import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerSignatureFeatureContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerSignatureFeatureProps {
  content: FramerSignatureFeatureContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Signature Feature (Framer), framer-native. Port từ `src/blocks/framer-signature-feature`:
 * nền #f4f4f0, căn giữa, eyebrow + tiêu đề màu xanh lá #00940c (font Aboreto),
 * ảnh full-width, danh sách bullet. Không dùng thẻ <img> — dùng div backgroundImage.
 */

const EYEBROW_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: 2.5,
  textTransform: 'uppercase',
  color: '#00940c',
  fontFamily: "'Funnel Display', 'Inter', system-ui, sans-serif",
};

const TITLE_STYLE: React.CSSProperties = {
  fontFamily: "'Aboreto', sans-serif",
  fontSize: 'clamp(36px, 7cqi, 112px)',
  fontWeight: 400,
  lineHeight: '0.92em',
  color: '#00940c',
  letterSpacing: '-0.035em',
  textTransform: 'uppercase',
  margin: 0,
};

const BULLET_TEXT_STYLE: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 'clamp(11px, 0.95cqi, 14px)',
  lineHeight: 1.5,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  color: '#222222',
};

export function FramerSignatureFeature({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerSignatureFeatureProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const bullets: Array<{ text: string }> = Array.isArray(content.bullets)
    ? content.bullets
    : [];

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative w-full overflow-hidden bg-[#f4f4f0] duration-700 ease-out',
        className
      )}
    >
      <div
        style={{
          padding: 'clamp(64px, 12cqi, 160px) clamp(24px, 4cqi, 80px)',
          fontFamily: "'Funnel Display', 'Inter', system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          {/* Eyebrow */}
          <div
            data-element-key='eyebrow'
            style={composeStyle(EYEBROW_STYLE, styleOf('eyebrow'))}
            className={selectableClass(
              activeKey === 'eyebrow',
              'mb-[clamp(14px,2.5cqi,32px)]'
            )}
          >
            {content.eyebrow}
          </div>

          {/* Title */}
          <h2
            data-element-key='title'
            style={composeStyle(TITLE_STYLE, styleOf('title'))}
            className={selectableClass(activeKey === 'title')}
          >
            {content.title}
          </h2>

          {/* Image */}
          {content.imageUrl && (
            <div
              data-element-key='imageUrl'
              style={composeStyle(
                {
                  backgroundImage: `url("${content.imageUrl.replace(/"/g, '%22')}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  width: '100%',
                  aspectRatio: '16 / 10',
                },
                styleOf('imageUrl')
              )}
              className={selectableClass(
                activeKey === 'imageUrl',
                'mt-[clamp(32px,6cqi,80px)] block'
              )}
            />
          )}

          {/* Bullet list */}
          {bullets.length > 0 && (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 'clamp(24px, 4cqi, 56px) auto 0',
                maxWidth: 640,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                textAlign: 'left',
              }}
            >
              {bullets.map((bullet, i) => (
                <li
                  key={i}
                  data-element-key={`bullets.${i}.text`}
                  style={composeStyle(
                    { display: 'flex', gap: 14 },
                    BULLET_TEXT_STYLE,
                    styleOf(`bullets.${i}.text`)
                  )}
                  className={selectableClass(activeKey === `bullets.${i}.text`)}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#00940c',
                      marginTop: 9,
                    }}
                    aria-hidden
                  />
                  <span style={{ flex: 1 }}>{bullet.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
