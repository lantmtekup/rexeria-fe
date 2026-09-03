'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  WestlyFooterContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useWestlyPointer } from './WestlyPointer';
import { useContainerMobile } from './useContainerMobile';
import { WESTLY_FONT_DISPLAY } from './westlyTheme';

interface WestlyFooterProps {
  content: WestlyFooterContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * The Westly · Footer — port từ apps/the-westly Footer.tsx.
 *
 * Footer tĩnh: logo + tiêu đề mời đăng ký + nút SIGN UP, hai dải mây trang trí
 * hai bên (chỉ hiện từ container ≥672 — decoration-only, đúng R7). Không có
 * motion trong apps nên block cũng không gắn motion hook; mọi thứ hiện sẵn
 * → không cần canvas fork, chỉ chặn navigate của CTA khi ở canvas.
 */

const DEFAULT_LOGO = '/the-westly/logo-icon.svg';
const DEFAULT_LEFT = '/the-westly/f1.png';
const DEFAULT_RIGHT = '/the-westly/f2.png';
const DEFAULT_BG = '#ffffff';

export function WestlyFooter({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: WestlyFooterProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const isCanvas = useIsCanvasEdit(rootRef);
  const pointer = useWestlyPointer(isCanvas);
  const [hovered, setHovered] = React.useState(false);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const title =
    content.title?.trim() ||
    'Sign up for notifications to see more of our interesting products.';
  const ctaText = content.ctaText?.trim() || 'Sign up';
  const ctaHref = content.ctaHref?.trim() || '';
  const logoUrl = content.logoUrl?.trim() || DEFAULT_LOGO;
  const logoAlt = content.logoAlt?.trim() || 'The Westly';
  const leftImageUrl = content.leftImageUrl?.trim() || DEFAULT_LEFT;
  const rightImageUrl = content.rightImageUrl?.trim() || DEFAULT_RIGHT;
  const bgColor = content.bgColor?.trim() || DEFAULT_BG;

  const sideImage = (
    key: 'leftImageUrl' | 'rightImageUrl',
    src: string,
    pos: React.CSSProperties
  ) => (
    <img
      src={src}
      alt=''
      aria-hidden
      data-element-key={key}
      className={selectableClass(activeKey === key)}
      style={composeStyle(
        {
          pointerEvents: isCanvas ? undefined : 'none',
          position: 'absolute',
          transform: 'translateY(-50%)',
          userSelect: 'none',
          height: 'auto',
          ...pos,
        },
        styleOf(key)
      )}
    />
  );

  return (
    <footer
      ref={rootRef}
      data-westly-scope=''
      className={cn('@container relative w-full overflow-hidden', className)}
      style={composeStyle(
        {
          fontFamily: WESTLY_FONT_DISPLAY,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 260,
          backgroundColor: bgColor,
          padding: isMobile ? '56px 24px' : '56px 24px',
        },
        blockBackgroundStyle(background)
      )}
    >
      {pointer}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          maxWidth: 720,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Hai dải mây trang trí — decoration-only, ẩn ở container hẹp (R7) */}
        {!isMobile &&
          sideImage('leftImageUrl', leftImageUrl, {
            top: '38%',
            left: 0,
            width: 'clamp(160px, 17.6cqi, 180px)',
          })}
        {!isMobile &&
          sideImage('rightImageUrl', rightImageUrl, {
            top: '58%',
            right: 0,
            width: 'clamp(148px, 16.4cqi, 168px)',
          })}

        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <img
            src={logoUrl}
            alt={logoAlt}
            data-element-key='logoUrl'
            className={selectableClass(activeKey === 'logoUrl')}
            style={composeStyle(
              { marginBottom: 20, width: 36, height: 'auto' },
              styleOf('logoUrl')
            )}
          />

          <h2
            data-element-key='title'
            className={selectableClass(activeKey === 'title')}
            style={composeStyle(
              {
                margin: '0 0 24px',
                maxWidth: '22em',
                // Apps đạt 32px ngay từ sm (640) → hệ số 5cqi.
                fontSize: 'clamp(22px, 5cqi, 32px)',
                lineHeight: 1.25,
                fontWeight: 500,
                color: '#4A4A4A',
                textWrap: 'balance',
              },
              styleOf('title')
            )}
          >
            {title}
          </h2>

          <a
            data-element-key='ctaHref'
            href={isCanvas ? undefined : ctaHref || '#'}
            onClick={isCanvas ? e => e.preventDefault() : undefined}
            aria-label={ctaText}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={selectableClass(activeKey === 'ctaHref')}
            style={composeStyle(
              {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 44,
                padding: '8px 56px',
                cursor: 'pointer',
                border: `1px solid ${hovered ? '#6E7A6F' : '#5A5A5A'}`,
                backgroundColor: hovered ? '#6E7A6F' : '#ffffff',
                color: hovered ? '#ffffff' : '#4A4A4A',
                transition:
                  'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease',
                textDecoration: 'none',
              },
              styleOf('ctaHref')
            )}
          >
            <span
              data-element-key='ctaText'
              className={selectableClass(activeKey === 'ctaText')}
              style={composeStyle(
                {
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.35em',
                  textTransform: 'uppercase',
                },
                styleOf('ctaText')
              )}
            >
              {ctaText}
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
