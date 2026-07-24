'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

import gsap from 'gsap';
import { LayoutGrid, X } from 'lucide-react';

import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
import { useMotionAttributes } from '../motion/useMotionAttributes';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  RolexCollectionNavContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { FONT_BODY, FONT_CSS } from './rolexFonts';

interface Props {
  content: RolexCollectionNavContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const NAV_ITEM_TEXT: React.CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: 12,
  fontWeight: 400,
  lineHeight: '14.4px',
  textTransform: 'uppercase',
  letterSpacing: 'normal',
  margin: 0,
};

const NAV_ROOT_STYLE: React.CSSProperties = {
  backdropFilter: 'blur(54px)',
  backgroundColor: 'rgba(0,0,0,0)',
  borderRadius: 8,
  opacity: 1,
};

const FLOATING_FRAME_STYLE = (
  position: 'fixed' | 'absolute'
): React.CSSProperties => ({
  position,
  inset: 0,
  zIndex: 999,
  pointerEvents: 'none',
});

const FLOATING_BAR_STYLE: React.CSSProperties = {
  position: 'absolute',
  bottom: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  pointerEvents: 'auto',
};

const MOBILE_DRAWER_OPEN_BACKDROP = {
  backgroundColor: 'rgba(0,0,0,0.09)',
  backdropFilter: 'blur(24px)',
};

const ITEM_OFFSET_X = 28;

const ITEM_BASE: React.CSSProperties = {
  display: 'flex',
  flex: '0 0 auto',
  height: '52px',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 16px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.14)',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  opacity: 1,
};

const NAV_ITEMS = [
  {
    key: 'navHomeLabel',
    hrefKey: 'navHomeHref',
    fallback: 'HOME',
    fallbackHref: '#',
  },
  {
    key: 'navCollectionLabel',
    hrefKey: 'navCollectionHref',
    fallback: 'EXPLORE OUR COLLECTION',
    fallbackHref: '#',
  },
  {
    key: 'navContactLabel',
    hrefKey: 'navContactHref',
    fallback: 'CONTACT',
    fallbackHref: '#',
  },
] as const;

function useEqualizeItemWidth(
  itemRefs: React.RefObject<Array<HTMLAnchorElement | null>>,
  deps: React.DependencyList
) {
  React.useLayoutEffect(() => {
    const items = itemRefs.current.filter(
      (el): el is HTMLAnchorElement => el !== null
    );
    if (items.length === 0) return;

    items.forEach(el => {
      el.style.width = 'auto';
    });
    const max = Math.max(...items.map(el => el.offsetWidth));
    items.forEach(el => {
      el.style.width = `${max}px`;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function RolexCollectionNav({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<Array<HTMLAnchorElement | null>>([]);
  const mobileButtonRef = React.useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = React.useRef<HTMLDivElement>(null);
  const drawerItemRefs = React.useRef<Array<HTMLElement | null>>([]);
  const { hasRoot } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(rootRef);
  const [mounted, setMounted] = React.useState(false);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  React.useEffect(() => setMounted(true), []);

  React.useLayoutEffect(() => {
    setPortalHost(resolveDrawerPortalHost(rootRef.current));
  }, [mounted, hasRoot]);

  const useFixed = mounted && hasRoot && !isCanvas;
  const inFrame = isDeviceFrameHost(portalHost);
  const contentMounted = isCanvas || (useFixed && !!portalHost);

  useMotionAttributes(rootRef);

  useEqualizeItemWidth(itemRefs, [
    content.navHomeLabel,
    content.navCollectionLabel,
    content.navContactLabel,
    styles,
    contentMounted,
  ]);

  useBlockMotion(rootRef, () => {
    const drawer = mobileDrawerRef.current;
    const button = mobileButtonRef.current;
    const items = drawerItemRefs.current.filter(
      (el): el is HTMLElement => el !== null
    );
    if (!drawer || !button) return;

    gsap.set(drawer, {
      height: button.offsetHeight,
      y: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
    });
    gsap.set(items, { x: ITEM_OFFSET_X, opacity: 0 });
  }, [contentMounted]);

  React.useEffect(() => {
    const button = mobileButtonRef.current;
    const drawer = mobileDrawerRef.current;
    const items = drawerItemRefs.current.filter(
      (el): el is HTMLElement => el !== null
    );
    if (!button || !drawer) return;

    if (mobileOpen) {
      const openHeight = drawer.scrollHeight;
      gsap.to(button, {
        opacity: 0,
        duration: 0.2,
        pointerEvents: 'none',
      });
      gsap.to(drawer, {
        height: openHeight,
        ...MOBILE_DRAWER_OPEN_BACKDROP,
        duration: 0.95,
        delay: 0.1,
        ease: 'expo.out',
        pointerEvents: 'auto',
      });
      gsap.to(items, {
        x: 0,
        opacity: 1,
        duration: 0.95,
        delay: 0.1,
        ease: 'expo.out',
      });
    } else {
      gsap.to(drawer, {
        ...NAV_ROOT_STYLE,
        height: button.offsetHeight,
        y: 0,
        duration: 0.7,
        ease: 'expo.out',
        pointerEvents: 'none',
      });
      gsap.to(button, {
        opacity: 1,
        duration: 0.6,
        ease: 'sine.out',
        delay: 0.2,
        pointerEvents: 'auto',
      });
      gsap.to(items, {
        x: ITEM_OFFSET_X,
        opacity: 0,
        duration: 0.5,
        ease: 'expo.out',
      });
    }
  }, [mobileOpen, contentMounted]);

  const navBar = (
    <nav
      style={composeStyle(NAV_ROOT_STYLE, blockBackgroundStyle(background))}
      className='rcnav relative z-10 hidden items-center justify-center @3xl:flex @3xl:h-14.5 @3xl:w-174.25'
    >
      <style>{FONT_CSS}</style>
      <div className='flex h-full w-full flex-row items-center justify-center gap-2.5'>
        {NAV_ITEMS.map((item, i) => (
          <a
            key={item.key}
            ref={el => {
              itemRefs.current[i] = el;
            }}
            data-element-key={item.key}
            href={content[item.hrefKey] || item.fallbackHref}
            style={composeStyle(ITEM_BASE, styleOf(item.key))}
            className={selectableClass(
              activeKey === item.key,
              `rcnav-item group cursor-pointer bg-white/0 transition-colors duration-200${isCanvas ? '' : 'hover:bg-white'}`
            )}
          >
            <span
              style={NAV_ITEM_TEXT}
              className={`text-white transition-colors duration-200${isCanvas ? '' : 'group-hover:text-black'}`}
            >
              {content[item.key] || item.fallback}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );

  const mobileBar = (
    <div className='relative z-10 flex h-full w-89.5 items-center justify-center @3xl:hidden'>
      <div
        ref={mobileDrawerRef}
        style={NAV_ROOT_STYLE}
        className='relative flex w-89.5 flex-col gap-2 overflow-hidden p-2'
      >
        <button
          ref={mobileButtonRef}
          type='button'
          onClick={() => setMobileOpen(true)}
          aria-label='Mở menu'
          className='absolute inset-x-0 top-0 flex h-15 cursor-pointer items-center justify-center'
        >
          <span className='flex h-12.5 w-[47%] items-center justify-center rounded-lg bg-white'>
            <LayoutGrid className='h-6 w-6 text-black' />
          </span>
        </button>

        {NAV_ITEMS.map((item, i) => (
          <a
            key={item.key}
            ref={el => {
              drawerItemRefs.current[i] = el;
            }}
            href={content[item.hrefKey] || item.fallbackHref}
            onClick={() => setMobileOpen(false)}
            style={NAV_ITEM_TEXT}
            className='flex h-12.5 w-full shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white text-black'
          >
            {content[item.key] || item.fallback}
          </a>
        ))}
        <button
          ref={el => {
            drawerItemRefs.current[NAV_ITEMS.length] = el;
          }}
          type='button'
          onClick={() => setMobileOpen(false)}
          aria-label='Đóng menu'
          className='flex h-12.5 w-full shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white text-black'
        >
          <X className='h-6 w-6' />
        </button>
      </div>
    </div>
  );

  if (useFixed && portalHost) {
    return (
      <div
        ref={rootRef}
        className='rcnav-root relative m-0 h-0 min-h-0 w-full overflow-visible'
        data-block='rolex-collection-nav'
      >
        {createPortal(
          <div
            className='@container'
            style={FLOATING_FRAME_STYLE(inFrame ? 'absolute' : 'fixed')}
          >
            <div style={FLOATING_BAR_STYLE}>
              {navBar}
              {mobileBar}
            </div>
          </div>,
          portalHost
        )}
      </div>
    );
  }

  if (hasRoot && !isCanvas) {
    return (
      <div
        ref={rootRef}
        className='rcnav-root relative m-0 h-0 min-h-0 w-full overflow-visible'
        data-block='rolex-collection-nav'
      />
    );
  }

  return (
    <div
      ref={rootRef}
      className='@container relative flex h-full w-full items-center justify-center'
      data-block='rolex-collection-nav'
    >
      {isCanvas && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src='/rolex-collection/contact-bg.png'
          alt=''
          className='absolute inset-0 h-full w-full object-cover'
        />
      )}
      {navBar}
      {mobileBar}
    </div>
  );
}
