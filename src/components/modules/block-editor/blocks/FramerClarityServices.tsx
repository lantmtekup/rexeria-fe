import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerClarityServiceItem,
  FramerClarityServicesContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { resolveFramerClarityServices } from './framerClarityServicesContent';

interface FramerClarityServicesProps {
  content: FramerClarityServicesContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Clarity Services, framer-native. Port từ `src/blocks/framer-clarity-services`:
 * 3-col grid — card dịch vụ cột trái/phải, ảnh portrait chính giữa (span hết hàng).
 * Icon trong circle trắng; BG mặc định #f8faf2; card BG #f3f6e6.
 * Responsive container-query: tablet → 2-col, mobile → 1-col.
 *
 * `services[]` ĐỘNG — thêm/xoá qua Lớp「Thêm / quản lý dịch vụ」. Item chẵn nằm
 * cột 1, item lẻ nằm cột 3, số hàng = ceil(n/2) và ảnh giữa span hết số hàng đó
 * (truyền qua CSS var `--clarity-rows` vì container query không đặt được inline).
 */

interface FramerClarityServiceCardProps {
  item: FramerClarityServiceItem;
  index: number;
  cardBg: string;
  styles?: ElementStylesMap;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

function FramerClarityServiceCard({
  item,
  index,
  cardBg,
  styles,
  order,
  positions,
  activeKey,
}: FramerClarityServiceCardProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const titleKey = `services[${index}].title`;
  const descKey = `services[${index}].description`;
  const iconKey = `services[${index}].iconUrl`;

  const cardRadius = 'clamp(20px,2cqi,36px)';
  const cardPad = 'clamp(24px,3cqi,44px)';

  return (
    <div
      style={
        {
          height: '100%',
          borderRadius: cardRadius,
          padding: cardPad,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: cardBg,
          '--clarity-col': index % 2 === 0 ? 1 : 3,
          '--clarity-row': Math.floor(index / 2) + 1,
        } as React.CSSProperties
      }
      className={cn(
        'col-start-1 row-start-auto',
        '@md:col-start-(--clarity-col) @md:row-start-(--clarity-row)'
      )}
    >
      {/* Icon circle */}
      <div
        data-element-key={iconKey}
        style={composeStyle(
          {
            width: 'clamp(48px,4.4cqi,64px)',
            height: 'clamp(48px,4.4cqi,64px)',
            borderRadius: 999,
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 1px 2px rgba(28,39,6,0.04)',
            ...(item.iconUrl
              ? {
                  backgroundImage: `url("${item.iconUrl.replace(/"/g, '%22')}")`,
                  backgroundSize: '60%',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }
              : {}),
          },
          styleOf(iconKey)
        )}
        className={cn(selectableClass(activeKey === iconKey))}
      >
        {!item.iconUrl && (
          <svg
            width='22'
            height='22'
            viewBox='0 0 24 24'
            fill='none'
            aria-hidden='true'
          >
            <path
              d='M12 4v16M4 12h16'
              stroke='#1c2706'
              strokeWidth='1.5'
              strokeLinecap='round'
            />
          </svg>
        )}
      </div>

      {/* Text */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(12px,1.4cqi,20px)',
        }}
      >
        <h3
          data-element-key={titleKey}
          style={composeStyle(
            {
              margin: 0,
              fontSize: 'clamp(22px,2.4cqi,32px)',
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: '#1c2706',
            },
            styleOf(titleKey)
          )}
          className={cn(selectableClass(activeKey === titleKey))}
        >
          {item.title || 'Service title'}
        </h3>
        <p
          data-element-key={descKey}
          style={composeStyle(
            {
              margin: 0,
              fontSize: 'clamp(14px,1.3cqi,17px)',
              lineHeight: 1.55,
              color: 'rgba(28,39,6,0.72)',
              maxWidth: '32ch',
            },
            styleOf(descKey)
          )}
          className={cn(selectableClass(activeKey === descKey))}
        >
          {item.description || ''}
        </p>
      </div>
    </div>
  );
}

export function FramerClarityServices({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerClarityServicesProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const bgColor = content.bgColor || '#f8faf2';
  const cardBg = content.cardBg || '#f3f6e6';
  const services = resolveFramerClarityServices(content);
  // 2 card / hàng → số hàng grid ở @md+; ảnh giữa span hết số hàng này.
  const rows = Math.max(1, Math.ceil(services.length / 2));

  const radius = 'clamp(20px,2cqi,36px)';

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
          background: bgColor,
          padding: `clamp(48px,8cqi,120px) 0`,
          fontFamily: '"Manrope", system-ui, sans-serif',
          color: '#1c2706',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: `0 clamp(20px,4cqi,56px)`,
          }}
        >
          <div
            className='grid grid-cols-1 @md:grid-cols-[1fr_minmax(280px,1.05fr)_1fr] @md:grid-rows-[repeat(var(--clarity-rows),minmax(0,1fr))]'
            style={
              {
                gap: 'clamp(16px,2cqi,28px)',
                '--clarity-rows': rows,
              } as React.CSSProperties
            }
          >
            {services.slice(0, 2).map((item, idx) => (
              <FramerClarityServiceCard
                key={idx}
                item={item}
                index={idx}
                cardBg={cardBg}
                styles={styles}
                order={order}
                positions={positions}
                activeKey={activeKey}
              />
            ))}

            {/* Center portrait image — auto-placed on mobile, spans center col on @md+ */}
            <div
              data-element-key='centerImageUrl'
              style={composeStyle(
                {
                  alignSelf: 'stretch',
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  minHeight: 'clamp(400px,60cqi,720px)',
                  borderRadius: radius,
                  overflow: 'hidden',
                  background: '#d8dbcf',
                  ...(content.centerImageUrl
                    ? {
                        backgroundImage: `url("${content.centerImageUrl.replace(/"/g, '%22')}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : {}),
                },
                styleOf('centerImageUrl')
              )}
              className={cn(
                'col-start-1 row-start-3 @md:col-start-2 @md:row-span-(--clarity-rows) @md:row-start-1',
                selectableClass(activeKey === 'centerImageUrl')
              )}
            />

            {/* Card còn lại — auto-flow dưới ảnh trên mobile, cột 1/3 ở @md+ */}
            {services.slice(2).map((item, idx) => (
              <FramerClarityServiceCard
                key={idx + 2}
                item={item}
                index={idx + 2}
                cardBg={cardBg}
                styles={styles}
                order={order}
                positions={positions}
                activeKey={activeKey}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
