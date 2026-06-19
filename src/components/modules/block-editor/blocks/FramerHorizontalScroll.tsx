'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerHorizontalScrollContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerHorizontalScrollProps {
  content: FramerHorizontalScrollContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Horizontal Scroll (framer-horizontal-scroll): nền #F5F3EE, eyebrow + Abril Fatface title,
 * hàng card cuộn ngang, ảnh tỉ lệ 4:5 cho từng card.
 */

const EYEBROW_STYLE: React.CSSProperties = {
  fontFamily: '"DM Mono", "Courier New", monospace',
  fontSize: 'clamp(10px, 0.9cqi, 13px)',
  fontWeight: 500,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#888880',
  margin: 0,
};

const TITLE_STYLE: React.CSSProperties = {
  fontFamily: '"Abril Fatface", "Georgia", serif',
  fontSize: 'clamp(28px, 5cqi, 72px)',
  fontWeight: 400,
  lineHeight: 1.0,
  letterSpacing: '-0.01em',
  color: '#1a1a18',
  margin: 0,
};

const CARD_LABEL_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(13px, 1.1cqi, 16px)',
  fontWeight: 600,
  color: '#1a1a18',
  margin: 0,
};

const CARD_CAPTION_STYLE: React.CSSProperties = {
  fontFamily: '"DM Mono", "Courier New", monospace',
  fontSize: 'clamp(10px, 0.85cqi, 12px)',
  fontWeight: 400,
  letterSpacing: '0.06em',
  color: '#888880',
  margin: 0,
  marginTop: '0.2em',
};

export function FramerHorizontalScroll({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerHorizontalScrollProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const items = content.items ?? [];

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative w-full overflow-hidden rounded-md bg-[#F5F3EE] duration-700 ease-out',
        className
      )}
    >
      <div className='pt-[clamp(40px,7cqi,96px)]'>
        {/* Header — has side padding */}
        <div className='mb-[clamp(28px,4cqi,56px)] px-[clamp(24px,5cqi,80px)]'>
          {content.eyebrow && (
            <p
              data-element-key='eyebrow'
              style={composeStyle(EYEBROW_STYLE, styleOf('eyebrow'))}
              className={selectableClass(activeKey === 'eyebrow', 'mb-[0.6em]')}
            >
              {content.eyebrow}
            </p>
          )}
          <h2
            data-element-key='title'
            style={composeStyle(TITLE_STYLE, styleOf('title'))}
            className={selectableClass(activeKey === 'title')}
          >
            {content.title}
          </h2>
        </div>

        {/* Horizontal scrollable row — bleeds to edge on both sides */}
        <div
          className='flex gap-[clamp(12px,1.6cqi,20px)] overflow-x-auto pr-[clamp(24px,5cqi,80px)] pb-[clamp(32px,5cqi,64px)] pl-[clamp(24px,5cqi,80px)]'
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, i) => {
            const imageKey = `item_${i}_imageUrl`;
            const labelKey = `item_${i}_label`;
            const captionKey = `item_${i}_caption`;
            return (
              <div
                key={i}
                className='flex shrink-0 flex-col'
                style={{ width: 'clamp(180px, 22cqi, 320px)' }}
              >
                {/* 4:5 image */}
                <div
                  className='relative w-full overflow-hidden rounded-sm bg-[#dddbd6]'
                  style={{ aspectRatio: '4 / 5' }}
                >
                  <div
                    data-element-key={imageKey}
                    style={composeStyle(
                      item.imageUrl
                        ? {
                            backgroundImage: `url("${item.imageUrl.replace(/"/g, '%22')}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : undefined,
                      styleOf(imageKey)
                    )}
                    className={selectableClass(
                      activeKey === imageKey,
                      'absolute inset-0'
                    )}
                  />
                </div>

                {/* Label + caption */}
                <div className='mt-[clamp(8px,1cqi,14px)]'>
                  <p
                    data-element-key={labelKey}
                    style={composeStyle(CARD_LABEL_STYLE, styleOf(labelKey))}
                    className={selectableClass(
                      activeKey === labelKey,
                      'truncate'
                    )}
                  >
                    {item.label}
                  </p>
                  {item.caption && (
                    <p
                      data-element-key={captionKey}
                      style={composeStyle(
                        CARD_CAPTION_STYLE,
                        styleOf(captionKey)
                      )}
                      className={selectableClass(
                        activeKey === captionKey,
                        'truncate'
                      )}
                    >
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
