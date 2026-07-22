'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerRealEstate02MenuContent,
} from '../types';
import {
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface Props {
  content: FramerRealEstate02MenuContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const COLORS = {
  circleBg: '#e9e4dc',
  circleBorder: '#c49f8a',
  text: '#565440',
} as const;

const ROOT_STYLE: React.CSSProperties = {
  height: '64px',
  left: 'calc(49.3% - 375px / 2)',
  overflow: 'visible',
  width: '375px',
  zIndex: 999,
};

const ICON_STYLE: React.CSSProperties = {
  height: '40px',
  left: '20px',
  position: 'absolute',
  top: 'calc(50% - 20px)',
  width: '40px',
};

const LINK_STYLE: React.CSSProperties = {
  borderRadius: '20px',
  flex: 'none',
  height: '40px',
  overflow: 'hidden',
  position: 'absolute',
  right: '20px',
  top: 'calc(50% - 20px)',
  width: '104px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const LINK_BG_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  borderRadius: '9999px',
  backgroundColor: COLORS.circleBg,
  border: `1px solid ${COLORS.circleBorder}`,
  pointerEvents: 'none',
};

const LINK_TEXT_STYLE: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  fontFamily:
    '"Inter", "Inter Placeholder", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  fontSize: '11px',
  fontWeight: 400,
  lineHeight: '16px',
  letterSpacing: '0px',
  textTransform: 'uppercase',
  color: COLORS.text,
  textAlign: 'center',
  whiteSpace: 'nowrap',
};

export function FramerRealEstate02Menu({
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

  const iconUrl = content.menuIconUrl?.trim() || '/realestate02/menu-icon.svg';

  const barPosition = inFrame ? 'absolute' : 'fixed';
  const barStyle: React.CSSProperties = {
    ...ROOT_STYLE,
    position: barPosition,
    top: 0,
  };

  const barContent = (
    <>
      <div
        data-element-key='label'
        style={composeStyle(LINK_STYLE, styleOf('label'))}
        className={cn(
          selectableClass(activeKey === 'label'),
          'pointer-events-auto'
        )}
      >
        <div style={composeStyle(LINK_BG_STYLE)} aria-hidden />
        <span style={LINK_TEXT_STYLE}>{content.label}</span>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-element-key='menuIconUrl'
        src={iconUrl}
        alt=''
        style={composeStyle(ICON_STYLE, styleOf('menuIconUrl'))}
        className={cn(
          selectableClass(activeKey === 'menuIconUrl'),
          'pointer-events-auto'
        )}
      />
    </>
  );

  const bar = <div style={barStyle}>{barContent}</div>;

  if (useFixed && portalHost) {
    return (
      <section
        ref={rootRef}
        className={cn(
          'frem-root @container relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0',
          className
        )}
        data-block='framer-realestate02-menu'
      >
        {createPortal(<div data-frem-portal>{bar}</div>, portalHost)}
      </section>
    );
  }

  if (!mounted || (hasRoot && !isCanvas)) {
    return (
      <section
        ref={rootRef}
        className={cn(
          'frem-root @container relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0',
          className
        )}
        data-block='framer-realestate02-menu'
      />
    );
  }

  return (
    <section
      ref={rootRef}
      className={cn(
        'frem-root @container relative m-0 min-h-[50svh] w-full overflow-hidden border-0 p-0',
        className
      )}
      data-block='framer-realestate02-menu'
    >
      <div className='absolute top-1/2 left-1/2 z-100 -translate-x-1/2 -translate-y-1/2'>
        <div style={ROOT_STYLE}>{barContent}</div>
      </div>
    </section>
  );
}
