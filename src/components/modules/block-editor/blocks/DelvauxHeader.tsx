'use client';

/**
 * Block "Header - Logo" (section `.header` của delvaux-clone): logo căn giữa.
 *
 * Bám gốc: header là `position: fixed` (top, z 999, width max-content căn
 * giữa) — luôn nhìn thấy khi cuộn; logo svg gốc 140×14 (height 14px desktop,
 * 8.5px mobile); entrance trượt từ trên xuống (`transitionLogo`: -70px → 0, 1s).
 *
 * Hai chế độ render (giống DelvauxSubnav):
 *  - /p (scroller = window): portal ra body, `position: fixed` đúng gốc.
 *  - editor canvas: render in-flow để không đè chrome admin.
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

import { useLandingMotion } from '../motion/LandingMotion';
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
  const { scroller } = useLandingMotion();
  const isPublic = scroller === null;
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  // keyframes `transitionLogo` gốc: translateY(-70px) → 0 trong 1s.
  React.useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tween = gsap.from(logo, { y: -70, duration: 1, ease: 'power2.out' });
    return () => {
      tween.kill();
    };
  }, [mounted, isPublic]);

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
            // logo.svg gốc 140×14 → desktop 14px, mobile nhỏ hơn (gốc 8.5px)
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

  return (
    <header
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='delvaux-header @container relative w-full'
    >
      <style>{DELVAUX_FONT_CSS}</style>
      {isPublic && mounted ? (
        // /p: header dán cố định trên cùng, căn giữa như gốc (z 999).
        createPortal(
          <div
            className='delvaux-header-fixed'
            style={{
              position: 'fixed',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 999,
              width: 'max-content',
            }}
          >
            {inner}
          </div>,
          document.body
        )
      ) : (
        <div className='flex w-full items-center justify-center'>{inner}</div>
      )}
    </header>
  );
}
