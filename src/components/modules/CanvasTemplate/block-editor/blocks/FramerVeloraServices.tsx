import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerVeloraServicesContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerVeloraServicesProps {
  content: FramerVeloraServicesContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Velora Services, framer-native. Port từ `src/blocks/framer-velora-services`:
 * danh sách dịch vụ numbered (01, 02, 03…), mỗi row là grid 3-col
 * (số+tiêu đề | mô tả | ảnh) với divider ngang. Mỗi element sửa inline được.
 * Responsive container-query thay viewport breakpoints.
 */

export function FramerVeloraServices({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerVeloraServicesProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const items = Array.isArray(content.items) ? content.items : [];

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative w-full duration-700 ease-out',
        className
      )}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          background: '#ffffff',
          color: '#0c0c0c',
          fontFamily: '"Inter", system-ui, sans-serif',
          padding: `clamp(40px,5cqi,80px) clamp(20px,4cqi,64px)`,
        }}
      >
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          {items.map((item, idx) => {
            const titleKey = `items[${idx}].title`;
            const descKey = `items[${idx}].description`;
            const imageKey = `items[${idx}].imageUrl`;
            const num = String(idx + 1).padStart(2, '0');

            return (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1.4fr',
                  gap: 'clamp(16px,3cqi,48px)',
                  alignItems: 'center',
                  padding: `clamp(48px,8cqi,96px) 0`,
                  borderTop: '1px solid rgba(0,0,0,0.08)',
                  ...(idx === items.length - 1
                    ? { borderBottom: '1px solid rgba(0,0,0,0.08)' }
                    : {}),
                }}
              >
                {/* Col 1: number + title */}
                <div>
                  <p
                    style={{
                      fontSize: 'clamp(11px,0.95cqi,13px)',
                      fontWeight: 500,
                      color: 'rgba(0,0,0,0.5)',
                      margin: '0 0 12px',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {num}
                  </p>
                  <h3
                    data-element-key={titleKey}
                    style={composeStyle(
                      {
                        fontSize: 'clamp(24px,3cqi,44px)',
                        fontWeight: 500,
                        lineHeight: 1.1,
                        letterSpacing: '-0.02em',
                        margin: 0,
                        color: '#0c0c0c',
                      },
                      styleOf(titleKey)
                    )}
                    className={selectableClass(activeKey === titleKey, 'block')}
                  >
                    {item.title}
                  </h3>
                </div>

                {/* Col 2: description */}
                <div>
                  <p
                    data-element-key={descKey}
                    style={composeStyle(
                      {
                        fontSize: 'clamp(13px,1.1cqi,16px)',
                        lineHeight: 1.5,
                        color: 'rgba(0,0,0,0.6)',
                        margin: 0,
                        maxWidth: '36ch',
                      },
                      styleOf(descKey)
                    )}
                    className={selectableClass(activeKey === descKey, 'block')}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Col 3: image */}
                <div
                  data-element-key={imageKey}
                  style={composeStyle(
                    {
                      aspectRatio: '16/10',
                      width: '100%',
                      overflow: 'hidden',
                      background: '#f0f0f0',
                      borderRadius: 4,
                      ...(item.imageUrl
                        ? {
                            backgroundImage: `url("${item.imageUrl.replace(/"/g, '%22')}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : {}),
                    },
                    styleOf(imageKey)
                  )}
                  className={selectableClass(activeKey === imageKey)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
