'use client';

/**
 * The Westly · Header — logo giữa, nền radial gradient trắng tan dần, nổi trên
 * mọi section. Port từ apps/the-westly Header.tsx (layout.tsx gắn fixed).
 *
 * Cùng khuôn PnjHeader (không có scroll-shrink nên không cần gsap):
 * - /p: portal `fixed top:0` → document.body
 * - PreviewMode: portal `absolute top:0` → `[data-device-frame]`
 * - Editor canvas: khung thấp + bar absolute top (để chọn/sửa logo + link)
 */

import * as React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  WestlyHeaderContent,
} from '../types';
import {
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { isPnjExternalLink } from './PnjStickyMenu';
import { WESTLY_FONT_DISPLAY } from './westlyTheme';

/** Gradient trắng tan từ mép trên — chữ ký của header Westly. */
const HEADER_GRADIENT =
  'radial-gradient(58.68% 135.88% at 50% -35.88%, #FFFFFF 26.17%, rgba(255, 255, 255, 0) 100%)';

interface Props {
  content: WestlyHeaderContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function WestlyHeader({
  content,
  styles,
  background: _background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  void _background;
  const rootRef = React.useRef<HTMLElement>(null);
  const { hasRoot } = useLandingMotion();
  const [mounted, setMounted] = React.useState(false);
  const [isCanvas, setIsCanvas] = React.useState(false);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => setMounted(true), []);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    setIsCanvas(!!root.closest('[data-testid="active-block-preview"]'));
    setPortalHost(resolveDrawerPortalHost(root));
  }, [mounted, hasRoot]);

  const useFixed = mounted && hasRoot && !isCanvas;
  const inFrame = isDeviceFrameHost(portalHost);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const logoUrl = content.logoUrl?.trim() || '/the-westly/logo.svg';
  const logoAlt = content.logoAlt?.trim() || 'The Westly';
  const logoHref = content.logoHref?.trim() ?? '';
  const external = logoHref ? isPnjExternalLink(logoHref) : false;

  const logoImg = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-element-key='logoUrl'
      src={logoUrl}
      alt=''
      className={selectableClass(
        activeKey === 'logoUrl',
        'pointer-events-auto'
      )}
      style={composeStyle(
        {
          // Apps: 96px → 132px từ md (768) — hệ số đạt 132 tại 768.
          width: 'clamp(96px, 17.2cqi, 132px)',
          height: 'auto',
          display: 'block',
        },
        styleOf('logoUrl')
      )}
    />
  );

  // Canvas: luôn <a> để chọn/sửa logoHref (chặn navigate).
  // Preview + /p: không link → <span>; có link → <a>.
  const logo =
    isCanvas || logoHref ? (
      <a
        href={isCanvas ? undefined : logoHref || '#'}
        onClick={isCanvas ? e => e.preventDefault() : undefined}
        data-element-key='logoHref'
        target={!isCanvas && external ? '_blank' : undefined}
        rel={!isCanvas && external ? 'noopener noreferrer' : undefined}
        aria-label={logoAlt}
        className={selectableClass(
          activeKey === 'logoHref',
          'pointer-events-auto'
        )}
        style={styleOf('logoHref')}
      >
        {logoImg}
      </a>
    ) : (
      <span aria-label={logoAlt} className='pointer-events-auto'>
        {logoImg}
      </span>
    );

  // Font đặt trên `bar` chứ không phải root: bar dùng chung cho cả 3 nhánh —
  // kể cả nhánh portal (thoát khỏi rootRef nên không inherit được) — còn dòng
  // hint tiếng Việt dưới canvas là chrome của editor, giữ font host.
  const bar = (
    <div
      className='pointer-events-none flex w-full justify-center'
      style={{
        fontFamily: WESTLY_FONT_DISPLAY,
        paddingTop: 'clamp(24px, 3.2cqi, 32px)',
        paddingBottom: 40,
        background: HEADER_GRADIENT,
      }}
    >
      {logo}
      <span
        data-element-key='logoAlt'
        className={selectableClass(activeKey === 'logoAlt', 'sr-only')}
        style={styleOf('logoAlt')}
      >
        {logoAlt}
      </span>
    </div>
  );

  // ── Overlay (/p fixed + Preview absolute trong device frame) ─────────────
  if (useFixed && portalHost) {
    return (
      <section
        ref={rootRef}
        data-westly-scope=''
        className={cn(
          '@container relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0',
          className
        )}
      >
        {createPortal(
          <div
            className={cn(
              'pointer-events-none inset-x-0 top-0 z-50',
              inFrame ? 'absolute' : 'fixed'
            )}
            data-westly-header-fixed
            data-westly-scope=''
          >
            {bar}
          </div>,
          portalHost
        )}
      </section>
    );
  }

  // Placeholder trước khi mount / đo context — h-0 để không tạo sọc.
  if (!mounted || (hasRoot && !isCanvas)) {
    return (
      <section
        ref={rootRef}
        data-westly-scope=''
        className={cn(
          '@container relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0',
          className
        )}
      />
    );
  }

  // ── Editor canvas: khung thấp + bar absolute top ─────────────────────────
  return (
    <section
      ref={rootRef}
      data-westly-scope=''
      data-canvas-edit='true'
      className={cn(
        '@container relative m-0 w-full overflow-hidden border-0 p-0',
        className
      )}
      style={{ minHeight: 220, backgroundColor: '#F3F1EA' }}
    >
      <div className='absolute inset-x-0 top-0 z-10'>{bar}</div>
      <p
        style={{
          position: 'absolute',
          bottom: 12,
          left: 0,
          right: 0,
          margin: 0,
          textAlign: 'center',
          fontSize: 11,
          color: '#737373',
        }}
      >
        Trên trang thật: header nổi fixed trên mọi section (gradient trắng tan
        dần)
      </p>
    </section>
  );
}
