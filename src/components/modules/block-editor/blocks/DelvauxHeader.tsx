'use client';

/**
 * Block "Header - Logo" (section `.header` của delvaux-clone): logo căn giữa.
 *
 * Bám gốc: header `position: fixed` (top, z 999, width max-content căn giữa)
 * — luôn nhìn thấy khi cuộn; logo svg gốc 140×14 (height 14px desktop,
 * 8.5px mobile); entrance trượt từ trên xuống (`transitionLogo`: -70px → 0, 1s).
 *
 * Ba bề mặt (apps-port-host / PnjHeader):
 *  - Editor canvas: in-flow, chọn/sửa logo
 *  - PreviewMode: portal `absolute` → `[data-device-frame]`
 *  - /p: portal `fixed` → document.body
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

import { useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import { DELVAUX_FONT_BODY, DELVAUX_FONT_CSS } from './delvauxTheme';
import type {
  BlockBackground,
  DelvauxHeaderContent,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface Props {
  content: DelvauxHeaderContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function DelvauxHeader({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const logoRef = React.useRef<HTMLDivElement>(null);
  const { hasRoot } = useLandingMotion();

  const [mounted, setMounted] = React.useState(false);
  const [isCanvas, setIsCanvas] = React.useState(false);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => setMounted(true), []);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!hasRoot) {
      setIsCanvas(false);
      setPortalHost(resolveDrawerPortalHost(root));
      return;
    }
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

  // keyframes `transitionLogo` gốc: translateY(-70px) → 0 trong 1s.
  React.useEffect(() => {
    if (!mounted) return;
    const logo = logoRef.current;
    if (!logo) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tween = gsap.from(logo, { y: -70, duration: 1, ease: 'power2.out' });
    return () => {
      tween.kill();
    };
  }, [mounted, useFixed, isCanvas]);

  const inner = (
    <div
      ref={logoRef}
      className='delvaux-header-logo flex items-center justify-center'
      style={{ padding: '28px 16px' }}
    >
      {content.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          data-element-key='logoUrl'
          src={content.logoUrl}
          alt={content.logoText || 'Logo'}
          style={composeStyle(
            { height: 'clamp(9px, 1cqi, 14px)', width: 'auto' },
            styleOf('logoUrl')
          )}
          className={selectableClass(activeKey === 'logoUrl')}
        />
      ) : (
        <span
          data-element-key='logoText'
          style={composeStyle(
            {
              fontFamily: DELVAUX_FONT_BODY,
              fontWeight: 500,
              fontSize: 'clamp(13px, 1.2cqi, 16px)',
              letterSpacing: '0.34em',
              textTransform: 'uppercase',
              color: '#000000',
            },
            styleOf('logoText')
          )}
          className={selectableClass(activeKey === 'logoText')}
        >
          {content.logoText}
        </span>
      )}
    </div>
  );

  // Overlay: Preview (absolute in device frame) + /p (fixed on body)
  if (useFixed && portalHost) {
    return (
      <header
        ref={rootRef}
        style={blockBackgroundStyle(background)}
        className='delvaux-header @container relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0'
      >
        <style>{DELVAUX_FONT_CSS}</style>
        {createPortal(
          <div
            className='delvaux-header-fixed'
            style={{
              position: inFrame ? 'absolute' : 'fixed',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 999,
              width: 'max-content',
            }}
          >
            {inner}
          </div>,
          portalHost
        )}
      </header>
    );
  }

  // Trước mount / chờ portal host — placeholder h-0 (không tạo sọc).
  if (!mounted || (hasRoot && !isCanvas)) {
    return (
      <header
        ref={rootRef}
        style={blockBackgroundStyle(background)}
        className='delvaux-header @container relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0'
      >
        <style>{DELVAUX_FONT_CSS}</style>
      </header>
    );
  }

  // Editor canvas: in-flow để chọn/sửa logo
  return (
    <header
      ref={rootRef}
      data-canvas-edit='true'
      style={composeStyle({ minHeight: 72 }, blockBackgroundStyle(background))}
      className='delvaux-header @container relative w-full'
    >
      <style>{DELVAUX_FONT_CSS}</style>
      <div className='flex w-full items-center justify-center'>{inner}</div>
    </header>
  );
}
