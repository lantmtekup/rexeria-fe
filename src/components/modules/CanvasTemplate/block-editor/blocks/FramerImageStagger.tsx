import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerImageStaggerContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerImageStaggerProps {
  content: FramerImageStaggerContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Image Stagger (framer-image-stagger): nền #F5F3EE, eyebrow + Abril Fatface title,
 * lưới CSS bất đối xứng 12 cột cho hiệu ứng xếp lệch.
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

/**
 * Định nghĩa layout asymmetric cho tối đa 6 ảnh đầu.
 * Dùng gridColumn / gridRow để xếp lệch — pattern lặp theo nhóm 4.
 * [col-start / col-end] trong lưới 12 cột.
 */
const STAGGER_SLOTS: Array<{ col: string; row: string; aspect: string }> = [
  { col: '1 / 7', row: '1 / 3', aspect: 'aspect-[4/3]' }, // lớn trái
  { col: '7 / 13', row: '1 / 2', aspect: 'aspect-[4/3]' }, // nhỏ phải trên
  { col: '7 / 13', row: '2 / 3', aspect: 'aspect-square' }, // nhỏ phải dưới
  { col: '1 / 5', row: '3 / 4', aspect: 'aspect-[3/4]' }, // dọc trái
  { col: '5 / 9', row: '3 / 4', aspect: 'aspect-[3/4]' }, // dọc giữa
  { col: '9 / 13', row: '3 / 4', aspect: 'aspect-[3/4]' }, // dọc phải
];

export function FramerImageStagger({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerImageStaggerProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const images = content.images ?? [];

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative w-full overflow-hidden rounded-md bg-[#F5F3EE] duration-700 ease-out',
        className
      )}
    >
      <div className='px-[clamp(24px,5cqi,80px)] py-[clamp(40px,7cqi,96px)]'>
        {/* Header */}
        <div className='mb-[clamp(32px,5cqi,64px)]'>
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

        {/* Asymmetric 12-col CSS grid */}
        <div
          className='grid w-full gap-[clamp(8px,1.2cqi,16px)]'
          style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }}
        >
          {images.map((image, i) => {
            const slot = STAGGER_SLOTS[i % STAGGER_SLOTS.length];
            const imageKey = `image_${i}_imageUrl`;
            return (
              <div
                key={i}
                className={cn(
                  'overflow-hidden rounded-sm bg-[#dddbd6]',
                  slot.aspect
                )}
                style={{ gridColumn: slot.col, gridRow: slot.row }}
              >
                <div
                  data-element-key={imageKey}
                  style={composeStyle(
                    image.imageUrl
                      ? {
                          backgroundImage: `url("${image.imageUrl.replace(/"/g, '%22')}")`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : undefined,
                    styleOf(imageKey)
                  )}
                  className={selectableClass(
                    activeKey === imageKey,
                    'h-full w-full'
                  )}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
