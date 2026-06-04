import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerDarlingTimelineContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerDarlingTimelineProps {
  content: FramerDarlingTimelineContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Darling Timeline (Framer), framer-native. Port từ `src/blocks/framer-darling-timeline`:
 * nền kem #f4eed8, header căn giữa, cột sống dọc, các item xen kẽ trái/phải với dấu chấm.
 * Không dùng thẻ <img> — dùng div backgroundImage.
 */

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: '"Libre Caslon Condensed", Georgia, serif',
  fontWeight: 400,
  fontSize: 'clamp(40px, 7cqi, 110px)',
  letterSpacing: '-0.02em',
  lineHeight: 1.05,
  margin: '0 0 clamp(16px, 2.5cqi, 36px)',
  color: '#1f1d14',
};

const INTRO_STYLE: React.CSSProperties = {
  fontFamily: '"Libre Caslon Condensed", "Libre Caslon Text", Georgia, serif',
  fontSize: 'clamp(15px, 1.4cqi, 20px)',
  lineHeight: 1.55,
  color: 'rgba(31,29,20,0.7)',
  margin: '0 auto',
  maxWidth: 560,
};

const TIME_STYLE: React.CSSProperties = {
  fontSize: 'clamp(12px, 1.05cqi, 16px)',
  letterSpacing: '0.04em',
  color: 'rgba(31,29,20,0.7)',
  margin: '0 0 clamp(10px, 1.5cqi, 20px)',
  fontFamily: '"Libre Caslon Condensed", Georgia, serif',
};

const TITLE_STYLE: React.CSSProperties = {
  fontFamily: '"Libre Caslon Condensed", Georgia, serif',
  fontWeight: 400,
  fontSize: 'clamp(28px, 4.2cqi, 64px)',
  letterSpacing: '-0.01em',
  lineHeight: 1.05,
  margin: '0 0 clamp(12px, 2cqi, 28px)',
  color: '#1f1d14',
};

const DESC_STYLE: React.CSSProperties = {
  fontFamily: '"Libre Caslon Condensed", "Libre Caslon Text", Georgia, serif',
  fontSize: 'clamp(13px, 1.25cqi, 18px)',
  lineHeight: 1.55,
  color: 'rgba(31,29,20,0.78)',
  margin: '0 0 clamp(20px, 3cqi, 44px)',
  maxWidth: '44ch',
};

export function FramerDarlingTimeline({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerDarlingTimelineProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const items: Array<{
    time: string;
    title: string;
    description: string;
    imageUrl: string;
  }> = Array.isArray(content.items) ? content.items : [];

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative w-full overflow-hidden bg-[#f4eed8] duration-700 ease-out',
        className
      )}
    >
      <div
        style={{
          padding:
            'clamp(80px, 12cqi, 200px) clamp(20px, 5cqi, 80px) clamp(100px, 14cqi, 240px)',
          fontFamily:
            '"Libre Caslon Condensed", "Libre Caslon Text", Georgia, serif',
          color: '#1f1d14',
        }}
      >
        {/* Header */}
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto clamp(60px, 12cqi, 180px)',
            textAlign: 'center',
          }}
        >
          <h2
            data-element-key='heading'
            style={composeStyle(HEADING_STYLE, styleOf('heading'))}
            className={selectableClass(activeKey === 'heading')}
          >
            {content.heading}
          </h2>
          <p
            data-element-key='intro'
            style={composeStyle(INTRO_STYLE, styleOf('intro'))}
            className={selectableClass(activeKey === 'intro')}
          >
            {content.intro}
          </p>
        </div>

        {/* Timeline stage */}
        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          {/* Vertical spine */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: 1,
              background: 'rgba(31,29,20,0.18)',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
            }}
          />

          {items.map((item, idx) => {
            const isRight = idx % 2 === 0;
            return (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'clamp(32px, 5cqi, 80px)',
                  paddingBottom:
                    idx < items.length - 1 ? 'clamp(60px, 10cqi, 160px)' : 0,
                }}
                className='@[0px]:!grid-cols-1 @[600px]:!grid-cols-2'
              >
                {/* Dot on spine */}
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    width: 11,
                    height: 11,
                    borderRadius: 999,
                    background: '#1f1d14',
                    transform: 'translate(-50%, -2px)',
                    zIndex: 1,
                  }}
                />

                {/* Content — right side on even (0,2,4…), left side on odd */}
                <div
                  style={
                    isRight
                      ? {
                          gridColumn: '2 / 3',
                          paddingLeft: 'clamp(16px, 3cqi, 56px)',
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                        }
                      : {
                          gridColumn: '1 / 2',
                          paddingRight: 'clamp(16px, 3cqi, 56px)',
                          textAlign: 'right',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                        }
                  }
                >
                  <p
                    data-element-key={`items.${idx}.time`}
                    style={composeStyle(
                      TIME_STYLE,
                      styleOf(`items.${idx}.time`)
                    )}
                    className={selectableClass(
                      activeKey === `items.${idx}.time`
                    )}
                  >
                    {item.time}
                  </p>
                  <h3
                    data-element-key={`items.${idx}.title`}
                    style={composeStyle(
                      TITLE_STYLE,
                      styleOf(`items.${idx}.title`)
                    )}
                    className={selectableClass(
                      activeKey === `items.${idx}.title`
                    )}
                  >
                    {item.title}
                  </h3>
                  <p
                    data-element-key={`items.${idx}.description`}
                    style={composeStyle(
                      DESC_STYLE,
                      styleOf(`items.${idx}.description`)
                    )}
                    className={selectableClass(
                      activeKey === `items.${idx}.description`
                    )}
                  >
                    {item.description}
                  </p>

                  {/* Image — div with backgroundImage, no <img> */}
                  <div
                    data-element-key={`items.${idx}.imageUrl`}
                    style={composeStyle(
                      item.imageUrl
                        ? {
                            backgroundImage: `url("${item.imageUrl.replace(/"/g, '%22')}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : { background: '#d8d2bc' },
                      {
                        width: '100%',
                        maxWidth: 540,
                        aspectRatio: '4 / 3',
                        overflow: 'hidden',
                      },
                      styleOf(`items.${idx}.imageUrl`)
                    )}
                    className={selectableClass(
                      activeKey === `items.${idx}.imageUrl`
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
