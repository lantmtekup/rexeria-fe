import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerFirmaFeaturedContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerFirmaFeaturedProps {
  content: FramerFirmaFeaturedContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Firma Featured Project, framer-native. Port từ `src/blocks/framer-firma-featured`:
 * ảnh lấp đầy nửa trái (full-bleed), panel trắng đè lên từ phải với eyebrow,
 * heading serif cực to, body text và CTA. Responsive container-query.
 */

export function FramerFirmaFeatured({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerFirmaFeaturedProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

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
          overflow: 'hidden',
        }}
      >
        {/* Outer wrapper with right-side padding only */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            padding: `clamp(40px,5cqi,80px) clamp(20px,4cqi,64px) clamp(60px,6cqi,100px) 0`,
          }}
          className='@[0px]:!p-0 @[810px]:pr-[clamp(20px,4cqi,64px)]'
        >
          {/* Stage: 2-col grid — image left, panel right */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,0.95fr)',
              alignItems: 'stretch',
              minHeight: 'clamp(520px,75cqi,820px)',
            }}
            className='@[0px]:!grid-cols-1'
          >
            {/* Left: full-bleed image */}
            <div
              data-element-key='imageUrl'
              style={composeStyle(
                {
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  minHeight: 'clamp(520px,75cqi,820px)',
                  overflow: 'hidden',
                  background: '#e6e7ea',
                  ...(content.imageUrl
                    ? {
                        backgroundImage: `url("${content.imageUrl.replace(/"/g, '%22')}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : {}),
                },
                styleOf('imageUrl')
              )}
              className={selectableClass(
                activeKey === 'imageUrl',
                '@[0px]:aspect-[4/5] @[0px]:min-h-0'
              )}
            />

            {/* Right: panel column — overlaps image via negative left margin */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                marginLeft: 'clamp(-200px,-14cqi,-80px)',
                zIndex: 2,
              }}
              className='@[0px]:mt-[-36px] @[0px]:!ml-0 @[0px]:px-4 @[0px]:pb-8'
            >
              <div
                style={{
                  position: 'relative',
                  background: '#ffffff',
                  width: '100%',
                  maxWidth: 720,
                  padding: `clamp(40px,5cqi,88px) clamp(32px,4.5cqi,80px) clamp(48px,5.5cqi,96px)`,
                  boxShadow:
                    '0 1px 3px rgba(16,24,40,0.06), 0 24px 60px -20px rgba(16,24,40,0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                className='@[0px]:!px-6 @[0px]:!py-8'
              >
                {/* Eyebrow / category */}
                <span
                  data-element-key='category'
                  style={composeStyle(
                    {
                      display: 'inline-block',
                      fontSize: 'clamp(12px,0.95cqi,14px)',
                      fontWeight: 500,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'rgba(0,0,0,0.5)',
                      margin: `0 0 clamp(20px,2.5cqi,40px)`,
                    },
                    styleOf('category')
                  )}
                  className={selectableClass(activeKey === 'category')}
                >
                  {content.category}
                </span>

                {/* Heading */}
                <h3
                  data-element-key='heading'
                  style={composeStyle(
                    {
                      fontFamily:
                        '"Playfair Display", "DM Serif Display", Georgia, serif',
                      fontWeight: 500,
                      fontSize: 'clamp(36px,5cqi,80px)',
                      lineHeight: 1.02,
                      letterSpacing: '-0.02em',
                      margin: `0 0 clamp(24px,3cqi,44px)`,
                      color: '#0c0c0c',
                    },
                    styleOf('heading')
                  )}
                  className={selectableClass(activeKey === 'heading')}
                >
                  {content.heading}
                </h3>

                {/* Description */}
                <p
                  data-element-key='description'
                  style={composeStyle(
                    {
                      fontSize: 'clamp(15px,1.2cqi,18px)',
                      lineHeight: 1.55,
                      color: 'rgba(0,0,0,0.62)',
                      margin: `0 0 clamp(32px,4cqi,56px)`,
                      maxWidth: '50ch',
                    },
                    styleOf('description')
                  )}
                  className={selectableClass(activeKey === 'description')}
                >
                  {content.description}
                </p>

                {/* CTA */}
                <a
                  data-element-key='ctaLabel'
                  href={content.ctaHref || '#'}
                  style={composeStyle(
                    {
                      alignSelf: 'flex-start',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 10,
                      color: '#0c0c0c',
                      fontSize: 'clamp(14px,1.1cqi,16px)',
                      fontWeight: 600,
                      textDecoration: 'none',
                      lineHeight: 1,
                    },
                    styleOf('ctaLabel')
                  )}
                  className={selectableClass(activeKey === 'ctaLabel')}
                  aria-label={content.ctaLabel}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 6,
                      height: 6,
                      background: 'currentColor',
                      borderRadius: 999,
                      flexShrink: 0,
                      display: 'inline-block',
                    }}
                  />
                  <span
                    style={{
                      borderBottom: '1.5px solid currentColor',
                      paddingBottom: 2,
                    }}
                  >
                    {content.ctaLabel}
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
