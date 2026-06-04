import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerAesthaEditorialContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerAesthaEditorialProps {
  content: FramerAesthaEditorialContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Framer Aestha Editorial — cột brand sticky trái + 3 ảnh so le phải.
 * Port từ `src/blocks/framer-aestha-editorial`.
 * Responsive bằng container-query, không dùng viewport breakpoint.
 */

const BRAND_STYLE: React.CSSProperties = {
  fontFamily: "'Switzer Variable', 'Funnel Display', 'Inter', sans-serif",
  fontSize: 'clamp(32px, 5.5cqi, 72px)',
  fontWeight: 600,
  letterSpacing: '-0.03em',
  lineHeight: 1,
  color: '#1A1A1A',
  margin: 0,
};

const TAGLINE_STYLE: React.CSSProperties = {
  fontFamily: "'Switzer Variable', 'Inter', sans-serif",
  fontSize: 'clamp(14px, 1.5cqi, 18px)',
  fontWeight: 400,
  lineHeight: 1.5,
  color: '#1A1A1A',
  margin: 0,
  maxWidth: 340,
};

const SCROLL_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "'Switzer Variable', 'Inter', sans-serif",
  fontSize: 'clamp(11px, 0.9cqi, 13px)',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#1A1A1A',
  margin: 0,
};

const DESCRIPTION_STYLE: React.CSSProperties = {
  fontFamily: "'Switzer Variable', 'Inter', sans-serif",
  fontSize: 'clamp(13px, 1.2cqi, 16px)',
  fontWeight: 400,
  lineHeight: 1.6,
  color: '#555555',
  margin: 0,
};

const NAV_LINK_STYLE: React.CSSProperties = {
  fontFamily: "'Switzer Variable', 'Inter', sans-serif",
  fontSize: 'clamp(13px, 1.1cqi, 15px)',
  fontWeight: 500,
  color: '#1A1A1A',
  textDecoration: 'none',
  letterSpacing: '0.02em',
};

const CTA_STYLE: React.CSSProperties = {
  fontFamily: "'Funnel Display', 'Switzer Variable', 'Inter', sans-serif",
  fontSize: 'clamp(20px, 2.8cqi, 36px)',
  fontWeight: 500,
  letterSpacing: '-0.02em',
  color: '#1A1A1A',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'clamp(10px, 1.5cqi, 20px)',
};

export function FramerAesthaEditorial({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerAesthaEditorialProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const navLinks: Array<{ label: string; href: string }> = Array.isArray(
    content.navLinks
  )
    ? content.navLinks
    : [];

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative w-full overflow-hidden rounded-md bg-white duration-700 ease-out',
        className
      )}
    >
      {/* Layout wrapper — 2 cột sticky-left + scroll-right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 1fr) 1.35fr',
          gap: 'clamp(32px, 5cqi, 96px)',
          maxWidth: 1440,
          margin: '0 auto',
          padding: 'clamp(24px, 3.5cqi, 48px)',
          alignItems: 'start',
        }}
      >
        {/* ── Cột trái: sticky ── */}
        <div
          style={{
            position: 'sticky',
            top: 'clamp(24px, 3vh, 48px)',
            height: 'calc(100vh - clamp(48px, 6vh, 96px))',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Brand */}
          <h1
            data-element-key='brand'
            style={composeStyle(BRAND_STYLE, styleOf('brand'))}
            className={selectableClass(activeKey === 'brand')}
          >
            {content.brand}
          </h1>

          {/* Tagline row với scroll pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              flexWrap: 'wrap',
              marginTop: 'clamp(24px, 4vh, 48px)',
            }}
          >
            <p
              data-element-key='tagline'
              style={composeStyle(TAGLINE_STYLE, styleOf('tagline'))}
              className={selectableClass(activeKey === 'tagline')}
            >
              {content.tagline}
            </p>

            {/* Scroll pill */}
            <div
              data-element-key='scrollLabel'
              style={composeStyle(
                {
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px solid #1A1A1A',
                  borderRadius: 999,
                  padding: '6px 14px',
                  alignSelf: 'flex-start',
                },
                styleOf('scrollLabel')
              )}
              className={selectableClass(activeKey === 'scrollLabel')}
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 14 14'
                fill='none'
                aria-hidden
              >
                <path
                  d='M7 1v12M7 13l-3-3M7 13l3-3'
                  stroke='#1A1A1A'
                  strokeWidth='1.3'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              <span style={SCROLL_LABEL_STYLE}>{content.scrollLabel}</span>
            </div>
          </div>

          {/* Spacer */}
          <div
            style={{ flex: '1 1 auto', minHeight: 'clamp(80px, 16vh, 200px)' }}
          />

          {/* Description */}
          <p
            data-element-key='description'
            style={composeStyle(DESCRIPTION_STYLE, styleOf('description'))}
            className={selectableClass(
              activeKey === 'description',
              'max-w-[340px]'
            )}
          >
            {content.description}
          </p>

          {/* Nav links */}
          {navLinks.length > 0 && (
            <nav
              data-element-key='navLinks'
              style={composeStyle(
                {
                  display: 'flex',
                  gap: 'clamp(14px, 2cqi, 28px)',
                  alignItems: 'center',
                  marginTop: 'clamp(24px, 4vh, 48px)',
                },
                styleOf('navLinks')
              )}
              className={selectableClass(activeKey === 'navLinks')}
            >
              {navLinks.map((link, idx) => (
                <a key={idx} href={link.href} style={NAV_LINK_STYLE}>
                  {link.label}
                </a>
              ))}
            </nav>
          )}
        </div>

        {/* ── Cột phải: ảnh so le + CTA ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            paddingBottom: 'clamp(40px, 8vh, 120px)',
          }}
        >
          {/* Ảnh 1 — offset trái, offset top */}
          <div
            data-element-key='image1Url'
            style={composeStyle(
              content.image1Url
                ? {
                    backgroundImage: `url("${content.image1Url.replace(/"/g, '%22')}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : { backgroundColor: '#EEEEEE' },
              {
                width: 'min(520px, 95%)',
                marginLeft: 0,
                marginTop: 'clamp(60px, 10vh, 120px)',
                aspectRatio: '4 / 5',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 1,
              },
              styleOf('image1Url')
            )}
            className={selectableClass(activeKey === 'image1Url')}
          />

          {/* Ảnh 2 — offset phải, wide */}
          <div
            data-element-key='image2Url'
            style={composeStyle(
              content.image2Url
                ? {
                    backgroundImage: `url("${content.image2Url.replace(/"/g, '%22')}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : { backgroundColor: '#DDDDDD' },
              {
                width: 'min(680px, 100%)',
                marginLeft: 'auto',
                marginRight: 'calc(-1 * clamp(12px, 3cqi, 48px))',
                marginTop: 'clamp(-160px, -12vh, -80px)',
                aspectRatio: '5 / 6',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 2,
              },
              styleOf('image2Url')
            )}
            className={selectableClass(activeKey === 'image2Url')}
          />

          {/* Ảnh 3 — căn giữa */}
          <div
            data-element-key='image3Url'
            style={composeStyle(
              content.image3Url
                ? {
                    backgroundImage: `url("${content.image3Url.replace(/"/g, '%22')}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : { backgroundColor: '#E5E5E5' },
              {
                width: 'min(560px, 90%)',
                margin: '0 auto',
                marginTop: 'clamp(-140px, -10vh, -60px)',
                aspectRatio: '7 / 6',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 3,
              },
              styleOf('image3Url')
            )}
            className={selectableClass(activeKey === 'image3Url')}
          />

          {/* CTA */}
          <a
            data-element-key='ctaText'
            href={content.ctaHref ?? '#'}
            style={composeStyle(
              CTA_STYLE,
              {
                alignSelf: 'center',
                marginTop: 'clamp(32px, 6vh, 80px)',
              },
              styleOf('ctaText')
            )}
            className={selectableClass(activeKey === 'ctaText')}
          >
            {content.ctaText}
            {/* Arrow circle */}
            <span
              aria-hidden
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 'clamp(36px, 4cqi, 52px)',
                height: 'clamp(36px, 4cqi, 52px)',
                borderRadius: '50%',
                border: '1.5px solid #1A1A1A',
                flexShrink: 0,
              }}
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 16 16'
                fill='none'
                aria-hidden
              >
                <path
                  d='M3 8h10M9 4l4 4-4 4'
                  stroke='#1A1A1A'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
