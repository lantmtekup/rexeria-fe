'use client';

import * as React from 'react';
import { useState } from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerFaqMinimalContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerFaqMinimalProps {
  content: FramerFaqMinimalContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * FAQ Minimal (Framer), framer-native. Port từ `src/blocks/framer-faq-minimal`:
 * nền trắng, 2 cột (tiêu đề + CTA trái, accordion phải), divider mỏng.
 * Accordion state dùng useState — cần 'use client'.
 */
const TITLE_STYLE: React.CSSProperties = {
  fontFamily: "'Aboreto', sans-serif",
  fontSize: 'clamp(32px, 5cqi, 72px)',
  fontStyle: 'italic',
  fontWeight: 400,
  lineHeight: 1.1,
  color: '#111111',
  letterSpacing: '-0.01em',
  margin: 0,
};

const CTA_STYLE: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 28px',
  background: '#111111',
  color: '#ffffff',
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: 1,
  textDecoration: 'none',
  borderRadius: 100,
};

const QUESTION_STYLE: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '24px 0',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  fontSize: 'clamp(15px, 1.3cqi, 20px)',
  fontWeight: 500,
  color: '#111111',
  fontFamily: 'inherit',
};

const ANSWER_STYLE: React.CSSProperties = {
  fontSize: 'clamp(13px, 1.1cqi, 17px)',
  lineHeight: 1.55,
  color: '#555555',
};

export function FramerFaqMinimal({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerFaqMinimalProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const items: Array<{ question: string; answer: string }> = Array.isArray(
    content.items
  )
    ? content.items
    : [];

  const [openIdx, setOpenIdx] = useState<number>(0);

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative w-full overflow-hidden bg-white duration-700 ease-out',
        className
      )}
    >
      <div
        style={{
          padding: 'clamp(80px, 12cqi, 180px) clamp(24px, 4cqi, 80px)',
          fontFamily: "'Funnel Display', 'Inter', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(40px, 6cqi, 100px)',
            alignItems: 'start',
          }}
        >
          {/* Cột trái: tiêu đề + CTA */}
          <div>
            <h2
              data-element-key='title'
              style={composeStyle(TITLE_STYLE, styleOf('title'))}
              className={selectableClass(activeKey === 'title', 'mb-8')}
            >
              {content.title}
            </h2>
            <div
              data-element-key='ctaText'
              style={composeStyle(CTA_STYLE, styleOf('ctaText'))}
              className={selectableClass(
                activeKey === 'ctaText',
                'inline-block'
              )}
            >
              <span style={{ color: '#ffffff' }}>{content.ctaText}</span>
            </div>
          </div>

          {/* Cột phải: accordion */}
          <div>
            {items.map((item, i) => {
              const isOpen = openIdx === i;
              return (
                <div key={i} style={{ borderTop: '1px solid #e0e0e0' }}>
                  <button
                    type='button'
                    onClick={() => setOpenIdx(isOpen ? -1 : i)}
                    style={QUESTION_STYLE}
                    aria-expanded={isOpen}
                    data-element-key={`items.${i}.question`}
                    className={selectableClass(
                      activeKey === `items.${i}.question`
                    )}
                  >
                    <span style={{ flex: 1, paddingRight: 16 }}>
                      {item.question}
                    </span>
                    <span
                      style={{
                        fontSize: 20,
                        transition: 'transform 0.3s',
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        flexShrink: 0,
                        color: '#00940c',
                      }}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                  <div
                    style={{
                      maxHeight: isOpen ? 400 : 0,
                      overflow: 'hidden',
                      transition: 'max-height 0.4s ease, padding 0.3s ease',
                      paddingBottom: isOpen ? 24 : 0,
                    }}
                  >
                    <div
                      data-element-key={`items.${i}.answer`}
                      style={composeStyle(
                        ANSWER_STYLE,
                        styleOf(`items.${i}.answer`)
                      )}
                      className={selectableClass(
                        activeKey === `items.${i}.answer`
                      )}
                    >
                      {item.answer}
                    </div>
                  </div>
                </div>
              );
            })}
            {items.length > 0 && (
              <div style={{ borderTop: '1px solid #e0e0e0' }} aria-hidden />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
