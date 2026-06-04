import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerAesthaProjectDetailContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerAesthaProjectDetailProps {
  content: FramerAesthaProjectDetailContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Framer Aestha Project Detail — 3 cột: tiêu đề sticky trái,
 * body văn bản giữa, stack ảnh phải.
 * Port từ `src/blocks/framer-aestha-project-detail`.
 * Responsive bằng container-query, không dùng viewport breakpoint.
 */

const PROJECT_TITLE_STYLE: React.CSSProperties = {
  fontFamily: "'Funnel Display', 'Switzer Variable', 'Inter', sans-serif",
  fontSize: 'clamp(36px, 4.5cqi, 60px)',
  fontWeight: 500,
  letterSpacing: '-0.02em',
  lineHeight: 1,
  color: '#1A1A1A',
  margin: 0,
};

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "'Switzer Variable', 'Inter', sans-serif",
  fontSize: 14,
  fontWeight: 400,
  letterSpacing: '0.02em',
  color: '#1A1A1A',
  margin: 0,
};

const BODY_PARA_STYLE: React.CSSProperties = {
  fontFamily: "'Switzer Variable', 'Inter', sans-serif",
  fontSize: 'clamp(14px, 1.3cqi, 16px)',
  fontWeight: 400,
  lineHeight: 1.55,
  color: '#1A1A1A',
  margin: 0,
  maxWidth: 460,
};

const NEXT_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "'Switzer Variable', 'Inter', sans-serif",
  fontSize: 'clamp(11px, 0.9cqi, 13px)',
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#888888',
  margin: 0,
};

const NEXT_PROJECT_STYLE: React.CSSProperties = {
  fontFamily: "'Funnel Display', 'Switzer Variable', 'Inter', sans-serif",
  fontSize: 'clamp(28px, 4cqi, 52px)',
  fontWeight: 500,
  letterSpacing: '-0.02em',
  lineHeight: 1.05,
  color: '#1A1A1A',
  textDecoration: 'none',
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

export function FramerAesthaProjectDetail({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerAesthaProjectDetailProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const images: Array<{ imageUrl: string; aspect: string }> = Array.isArray(
    content.images
  )
    ? content.images
    : [];

  const navLinks: Array<{ label: string; href: string }> = Array.isArray(
    content.navLinks
  )
    ? content.navLinks
    : [];

  const paragraphs = (content.body ?? '')
    .split(/\n{2,}/)
    .map((p: string) => p.trim())
    .filter(Boolean);

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative w-full overflow-hidden rounded-md bg-white duration-700 ease-out',
        className
      )}
    >
      <div
        style={{
          padding: 'clamp(24px, 3.5cqi, 48px)',
          maxWidth: 1440,
          margin: '0 auto',
        }}
      >
        {/* ── 3 cột chính ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(200px, 260px) minmax(280px, 460px) 1fr',
            gap: 'clamp(24px, 3cqi, 64px)',
            alignItems: 'start',
          }}
        >
          {/* Cột 1: tiêu đề sticky + nav links */}
          <div
            style={{
              position: 'sticky',
              top: 'clamp(24px, 3vh, 48px)',
              alignSelf: 'start',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(120px, 18vh, 240px)',
            }}
          >
            <h1
              data-element-key='projectTitle'
              style={composeStyle(PROJECT_TITLE_STYLE, styleOf('projectTitle'))}
              className={selectableClass(activeKey === 'projectTitle')}
            >
              {content.projectTitle}
            </h1>

            {/* Nav links dưới tiêu đề */}
            {navLinks.length > 0 && (
              <nav
                data-element-key='navLinks'
                style={composeStyle(
                  {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'clamp(10px, 1.2vh, 18px)',
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

          {/* Cột 2: section label + body paragraphs */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(24px, 3vh, 48px)',
              paddingTop: 'clamp(8px, 1vh, 16px)',
            }}
          >
            <p
              data-element-key='sectionLabel'
              style={composeStyle(SECTION_LABEL_STYLE, styleOf('sectionLabel'))}
              className={selectableClass(activeKey === 'sectionLabel')}
            >
              {content.sectionLabel}
            </p>

            <div
              data-element-key='body'
              style={composeStyle(
                {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(16px, 2vh, 28px)',
                },
                styleOf('body')
              )}
              className={selectableClass(activeKey === 'body')}
            >
              {paragraphs.length > 0 ? (
                paragraphs.map((para, idx) => (
                  <p key={idx} style={BODY_PARA_STYLE}>
                    {para}
                  </p>
                ))
              ) : (
                <p style={BODY_PARA_STYLE}>{content.body}</p>
              )}
            </div>
          </div>

          {/* Cột 3: stack ảnh */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(16px, 2cqi, 32px)',
            }}
          >
            {images.map((img, idx) => (
              <div
                key={idx}
                data-element-key={`images[${idx}]`}
                style={composeStyle(
                  img.imageUrl
                    ? {
                        backgroundImage: `url("${img.imageUrl.replace(/"/g, '%22')}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : { backgroundColor: '#EEEEEE' },
                  {
                    width: '100%',
                    aspectRatio: img.aspect ?? '4 / 3',
                    position: 'relative',
                    overflow: 'hidden',
                  }
                )}
                className={selectableClass(activeKey === `images[${idx}]`)}
              />
            ))}
          </div>
        </div>

        {/* ── Hàng "dự án tiếp theo" ── */}
        <div
          style={{
            marginTop: 'clamp(64px, 10vh, 120px)',
            display: 'grid',
            gridTemplateColumns: 'minmax(200px, 260px) minmax(280px, 460px)',
            gap: 'clamp(24px, 3cqi, 64px)',
            alignItems: 'end',
            borderTop: '1px solid #E5E5E5',
            paddingTop: 'clamp(24px, 4vh, 48px)',
          }}
        >
          <p
            data-element-key='nextLabel'
            style={composeStyle(NEXT_LABEL_STYLE, styleOf('nextLabel'))}
            className={selectableClass(activeKey === 'nextLabel')}
          >
            {content.nextLabel}
          </p>

          <a
            data-element-key='nextProjectText'
            href={content.nextProjectHref ?? '#'}
            style={composeStyle(NEXT_PROJECT_STYLE, styleOf('nextProjectText'))}
            className={selectableClass(activeKey === 'nextProjectText')}
          >
            {content.nextProjectText}
          </a>
        </div>
      </div>
    </div>
  );
}
