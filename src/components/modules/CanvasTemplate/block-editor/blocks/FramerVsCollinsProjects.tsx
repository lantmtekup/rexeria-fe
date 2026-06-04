import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerVsCollinsProjectsContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerVsCollinsProjectsProps {
  content: FramerVsCollinsProjectsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * VS Collins Projects (Framer), framer-native. Port từ `src/blocks/framer-vs-collins-projects`:
 * lưới 12 cột phân tán (desktop) / 4 cột (mobile), mỗi item dùng spacerBefore để
 * tạo khoảng trống, hover overlay tên + năm. Không dùng thẻ <img> — dùng div backgroundImage.
 */

const FONT_FAMILY = '"Work Sans", system-ui, sans-serif';
const YEAR_FONT_SIZE = 15;

export function FramerVsCollinsProjects({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerVsCollinsProjectsProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const items: Array<{
    imageUrl: string;
    year: string;
    name: string;
    href: string;
    spacerBefore: number;
  }> = Array.isArray(content.items) ? content.items : [];

  const sectionBg = content.bgColor || '#ffffff';

  return (
    <div
      style={composeStyle(blockBackgroundStyle(background), {
        background: sectionBg,
      })}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative w-full overflow-hidden duration-700 ease-out',
        className
      )}
    >
      <div
        style={{
          padding:
            'clamp(16px, 2cqi, 16px) clamp(20px, 3cqi, 32px) clamp(48px, 7cqi, 72px)',
          fontFamily: FONT_FAMILY,
        }}
      >
        {/* 12-col grid — container-query để co lại trên nhỏ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 'clamp(12px, 3cqi, 36px)',
            gridAutoRows: 'minmax(0, auto)',
          }}
          className='@[0px]:![grid-template-columns:repeat(4,1fr)] @[700px]:![grid-template-columns:repeat(12,1fr)]'
        >
          {items.flatMap((item, idx) => {
            const nodes: React.ReactNode[] = [];
            const spacer = Math.max(0, Math.min(item.spacerBefore ?? 0, 12));

            if (spacer > 0) {
              nodes.push(
                <div
                  key={`spacer-${idx}`}
                  aria-hidden
                  style={{ gridColumn: `span ${spacer}` }}
                  className='@[0px]:hidden @[700px]:block'
                />
              );
            }

            if (!item.imageUrl) return nodes;

            nodes.push(
              <ProjectCell
                key={`project-${idx}`}
                item={item}
                idx={idx}
                activeKey={activeKey}
                styleOf={styleOf}
              />
            );
            return nodes;
          })}
        </div>
      </div>
    </div>
  );
}

interface ProjectCellProps {
  item: { imageUrl: string; year: string; name: string; href: string };
  idx: number;
  activeKey?: string | null;
  styleOf: (key: string) => React.CSSProperties | undefined;
}

function ProjectCell({ item, idx, activeKey, styleOf }: ProjectCellProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      style={{ gridColumn: 'span 2', position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container */}
      <div
        data-element-key={`items.${idx}.imageUrl`}
        style={composeStyle(
          {
            backgroundImage: `url("${item.imageUrl.replace(/"/g, '%22')}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            width: '100%',
            aspectRatio: '3 / 4',
            overflow: 'hidden',
            borderRadius: 2,
            cursor: item.href ? 'pointer' : 'default',
          },
          styleOf(`items.${idx}.imageUrl`)
        )}
        className={selectableClass(
          activeKey === `items.${idx}.imageUrl`,
          'block'
        )}
      >
        {/* Hover mask */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 240ms ease',
            pointerEvents: 'none',
          }}
        />

        {/* Overlay text */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            pointerEvents: 'none',
            textAlign: 'center',
            padding: 16,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 240ms ease',
          }}
        >
          <span
            data-element-key={`items.${idx}.name`}
            style={composeStyle(
              {
                fontFamily: FONT_FAMILY,
                fontSize: YEAR_FONT_SIZE,
                fontWeight: 500,
                lineHeight: '24px',
                color: '#ffffff',
                letterSpacing: 0,
              },
              styleOf(`items.${idx}.name`)
            )}
            className={selectableClass(activeKey === `items.${idx}.name`)}
          >
            {item.name}
          </span>
          <span
            data-element-key={`items.${idx}.year`}
            style={composeStyle(
              {
                fontFamily: FONT_FAMILY,
                fontSize: YEAR_FONT_SIZE,
                fontWeight: 500,
                lineHeight: '24px',
                color: 'rgba(255,255,255,0.7)',
                letterSpacing: 0,
              },
              styleOf(`items.${idx}.year`)
            )}
            className={selectableClass(activeKey === `items.${idx}.year`)}
          >
            {item.year}
          </span>
        </div>
      </div>
    </div>
  );
}
