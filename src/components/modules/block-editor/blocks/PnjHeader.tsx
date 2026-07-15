'use client';

/**
 * PNJ · Header — logo fixed/absolute góc trên, thu nhỏ khi scroll.
 * Port từ apps/pnj Header.tsx.
 *
 * - /p: portal `fixed top:0` → document.body
 * - PreviewMode: portal `absolute top:0` → `[data-device-frame]` (neo trong
 *   khung 390/834/1280, không trải full browser)
 * - Editor canvas: khung `min-h-svh` + logo absolute top (để chọn/sửa)
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  PnjHeaderContent,
} from '../types';
import {
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { isPnjExternalLink } from './PnjStickyMenu';

const SCROLL_THRESHOLD = 40;

type LenisLike = {
  scroll: number;
  on: (event: string, cb: () => void) => void;
  off: (event: string, cb: () => void) => void;
};

const getLenis = (): LenisLike | undefined =>
  (window as unknown as { __lenis?: LenisLike }).__lenis;

const getScrollY = (scroller: HTMLElement | null): number => {
  const lenis = getLenis();
  if (lenis && typeof lenis.scroll === 'number') return lenis.scroll;
  if (scroller) return scroller.scrollTop;
  return window.scrollY;
};

const RESPONSIVE = {
  padX: 'clamp(24px, 5cqi, 40px)',
  padT: 'clamp(16px, 2.5cqi, 20px)',
  padB: 'clamp(10px, 1.5cqi, 12px)',
  logoH: 'clamp(48px, 8cqi, 64px)',
  logoHScrolled: 'clamp(36px, 6cqi, 48px)',
} as const;

interface Props {
  content: PnjHeaderContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function PnjHeader({
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
  const { scroller, hasRoot } = useLandingMotion();
  const [mounted, setMounted] = React.useState(false);
  const [isCanvas, setIsCanvas] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => setMounted(true), []);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    setIsCanvas(!!root.closest('[data-testid="active-block-preview"]'));
    setPortalHost(resolveDrawerPortalHost(root));
  }, [mounted, hasRoot]);

  // Overlay fixed/absolute khi không phải editor canvas + đã có LandingMotion.
  const useFixed = mounted && hasRoot && !isCanvas;
  const inFrame = isDeviceFrameHost(portalHost);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  React.useEffect(() => {
    if (!useFixed) return;

    gsap.registerPlugin(ScrollTrigger);

    const sync = () => {
      setScrolled(getScrollY(scroller) > SCROLL_THRESHOLD);
    };
    sync();

    const spy = ScrollTrigger.create({
      scroller: scroller ?? undefined,
      start: 0,
      end: 'max',
      onUpdate: sync,
      onRefresh: sync,
    });
    ScrollTrigger.addEventListener('refresh', sync);
    scroller?.addEventListener('scroll', sync, { passive: true });

    let lenis: LenisLike | undefined;
    let tries = 0;
    let retryId = 0;
    const bindLenis = () => {
      lenis = getLenis();
      if (lenis) {
        lenis.on('scroll', sync);
        return;
      }
      if (!scroller && tries < 20) {
        tries += 1;
        retryId = window.setTimeout(bindLenis, 50);
      }
    };
    bindLenis();

    return () => {
      spy.kill();
      ScrollTrigger.removeEventListener('refresh', sync);
      scroller?.removeEventListener('scroll', sync);
      lenis?.off('scroll', sync);
      window.clearTimeout(retryId);
    };
  }, [useFixed, scroller]);

  const logoUrl = content.logoUrl?.trim() || '/pnj/logo-pnj.png';
  const logoAlt = content.logoAlt?.trim() || 'PNJ';
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
        'pnj-header-logo pointer-events-auto drop-shadow-sm transition-[height] duration-300 ease-out'
      )}
      style={composeStyle(
        {
          height:
            scrolled && useFixed ? RESPONSIVE.logoHScrolled : RESPONSIVE.logoH,
          width: 'auto',
          display: 'block',
        },
        styleOf('logoUrl')
      )}
    />
  );

  const logo = logoHref ? (
    <a
      href={logoHref}
      data-element-key='logoHref'
      data-cta-id='header-logo'
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={logoAlt}
      className={selectableClass(
        activeKey === 'logoHref',
        'pnj-header-brand pointer-events-auto'
      )}
      style={styleOf('logoHref')}
    >
      {logoImg}
    </a>
  ) : (
    <span
      data-cta-id='header-logo'
      aria-label={logoAlt}
      className='pnj-header-brand pointer-events-auto'
    >
      {logoImg}
    </span>
  );

  const bar = (
    <aside
      className='pointer-events-none flex w-full items-center'
      style={{
        paddingLeft: RESPONSIVE.padX,
        paddingRight: RESPONSIVE.padX,
        paddingTop: RESPONSIVE.padT,
        paddingBottom: RESPONSIVE.padB,
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
    </aside>
  );

  // ── Overlay (/p fixed + Preview absolute trong device frame) ───────────
  if (useFixed && portalHost) {
    return (
      <section
        ref={rootRef}
        className={cn(
          'pnj-header @container relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0',
          className
        )}
      >
        {createPortal(
          <div
            className={cn(
              'pnj-header-fixed pointer-events-none inset-x-0 top-0 z-[55]',
              inFrame ? 'absolute' : 'fixed'
            )}
            data-pnj-header-fixed
          >
            {bar}
          </div>,
          portalHost
        )}
      </section>
    );
  }

  // Placeholder trước khi mount / đo context — vẫn h-0 để không tạo sọc.
  if (!mounted || (hasRoot && !isCanvas)) {
    return (
      <section
        ref={rootRef}
        className={cn(
          'pnj-header @container relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0',
          className
        )}
      />
    );
  }

  // ── Editor canvas: khung svh + logo absolute top ─────────────────────────
  return (
    <section
      ref={rootRef}
      className={cn(
        'pnj-header @container relative m-0 min-h-svh w-full overflow-hidden border-0 bg-[#f7f5f3] p-0',
        className
      )}
    >
      <div className='absolute inset-x-0 top-0 z-10'>{bar}</div>
    </section>
  );
}
