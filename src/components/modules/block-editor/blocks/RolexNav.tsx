'use client';

/**
 * Rolex Nav — navigation bar from https://capable-seat-351062.framer.app/
 * Isolated block: 3 nav items in a horizontal row with backdrop-blur glass.
 * KHÔNG gắn với hero. KHÔNG dùng clamp() — dùng @container breakpoints.
 *
 * Desktop (@4xl): 3 items side by side, container 512×58px, items 164×50px.
 * Mobile (<@4xl): compact container 160×52px.
 *
 * Contract: useBlockMotion (R1-R6), @container, tuyền inline.
 */
import * as React from 'react';

import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  RolexNavContent,
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
  content: RolexNavContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const NAV_ITEM_TEXT: React.CSSProperties = {
  fontFamily: '"Neue Montreal Regular", "Neue Montreal", system-ui, sans-serif',
  fontSize: 12,
  fontWeight: 400,
  lineHeight: '14.4px',
  color: '#ffffff',
  textTransform: 'uppercase',
  letterSpacing: 'normal',
  margin: 0,
};

const CONTAINER_BASE: React.CSSProperties = {
  backdropFilter: 'blur(54px)',
  backgroundColor: 'rgba(0,0,0,0)',
  borderRadius: 8,
};

const ITEM_BASE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.14)',
  backgroundColor: 'rgba(255,255,255,0)',
  textDecoration: 'none',
};

export function RolexNav({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const items = root.querySelectorAll<HTMLElement>('.rnav-item');
      gsap.fromTo(
        items,
        { opacity: 0, y: -10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          stagger: 0.05,
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );
    },
    []
  );

  return (
    <nav
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='rnav @container flex w-full items-center justify-center pt-5'
    >
      <div
        style={{
          ...CONTAINER_BASE,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          width: 160,
          height: 52,
        }}
        className='@4xl:!h-[58px] @4xl:!w-[512px]'
      >
        {/* Logo */}
        <a
          data-element-key='navLogoLabel'
          href='./'
          style={composeStyle(
            { ...ITEM_BASE, width: 120, height: 40, padding: '14px 40px' },
            styleOf('navLogoLabel')
          )}
          className={selectableClass(
            activeKey === 'navLogoLabel',
            'rnav-item @4xl:!h-[50px] @4xl:!w-[164px] @4xl:!px-[74px] @4xl:!py-[22px]'
          )}
        >
          <span style={NAV_ITEM_TEXT}>{content.navLogoLabel || 'HOME'}</span>
        </a>

        {/* Home */}
        <a
          data-element-key='navHomeLabel'
          href='./work'
          style={composeStyle(
            { ...ITEM_BASE, width: 120, height: 40, padding: '14px 40px' },
            styleOf('navHomeLabel')
          )}
          className={selectableClass(
            activeKey === 'navHomeLabel',
            'rnav-item @4xl:!h-[50px] @4xl:!w-[164px] @4xl:!px-[74px] @4xl:!py-[22px]'
          )}
        >
          <span style={NAV_ITEM_TEXT}>{content.navHomeLabel || 'HOME'}</span>
        </a>

        {/* Burger */}
        <a
          data-element-key='navBurgerLabel'
          href='./contact'
          style={composeStyle(
            { ...ITEM_BASE, width: 120, height: 40, padding: '14px 40px' },
            styleOf('navBurgerLabel')
          )}
          className={selectableClass(
            activeKey === 'navBurgerLabel',
            'rnav-item @4xl:!h-[50px] @4xl:!w-[164px] @4xl:!px-[74px] @4xl:!py-[22px]'
          )}
        >
          <span style={NAV_ITEM_TEXT}>
            {content.navBurgerLabel || 'Explore Our Collection'}
          </span>
        </a>
      </div>
    </nav>
  );
}
