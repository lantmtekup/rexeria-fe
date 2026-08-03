'use client';

/**
 * Belgo · Header — logo giữa, MENU trái, CTA phải + off-canvas nav GSAP.
 * Port từ apps/belgo Header.tsx.
 *
 * - /p: portal `fixed` → document.body
 * - PreviewMode: portal `absolute` → `[data-device-frame]`
 * - Editor canvas: layout edit-friendly (menu luôn mở, bỏ GSAP ẩn link)
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import type {
  BelgoHeaderContent,
  BelgoNavLink,
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import {
  BELGO_CREAM,
  BELGO_FONT_BODY,
  BELGO_FONT_CSS,
  BELGO_FONT_DISPLAY,
  BELGO_GOLD,
  BELGO_INK,
  BELGO_INK_DEEP,
} from './belgoTheme';
import { useDrawerScrollLock } from './PnjHeroHotspots';

const SCROLL_THRESHOLD = 8;
const Z_MENU = 100;
const Z_HEADER = 110;

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

const DEFAULT_NAV: BelgoNavLink[] = [
  { label: 'HOME', href: '#hero' },
  { label: 'ABOUT', href: '#about-product' },
  { label: 'BREWING', href: '#brewing-process' },
  { label: 'PRODUCTS', href: '#our-products' },
  { label: 'FLAVORS', href: '#more-flavors' },
  { label: 'CONTACT', href: '#footer' },
];

interface Props {
  content: BelgoHeaderContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function BelgoHeader({
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
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const curtainRef = React.useRef<HTMLDivElement>(null);
  const lineRef = React.useRef<HTMLDivElement>(null);
  const menuTlRef = React.useRef<gsap.core.Timeline | null>(null);
  const hasBeenOpenRef = React.useRef(false);

  const { scroller, hasRoot } = useLandingMotion();
  const [mounted, setMounted] = React.useState(false);
  const [isCanvas, setIsCanvas] = React.useState(false);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

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

  useDrawerScrollLock(menuOpen && !isCanvas ? 'belgo-header' : null, false);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const logoUrl = content.logoUrl?.trim() || '/belgo/logo.svg';
  const logoAlt = content.logoAlt?.trim() || 'Belgő';
  const logoHref = content.logoHref?.trim() || '#hero';
  const menuLabel = content.menuLabel?.trim() || 'MENU';
  const menuCloseLabel = content.menuCloseLabel?.trim() || 'CLOSE';
  const bookTableLabel = content.bookTableLabel?.trim() || 'BOOK A TABLE';
  const bookTableHref = content.bookTableHref?.trim() || '#';
  const orderBeerLabel = content.orderBeerLabel?.trim() || 'ORDER BEER NOW';
  const orderBeerHref = content.orderBeerHref?.trim() || '#';
  const menuTagline = content.menuTagline?.trim() || '';
  const taglineLines = menuTagline ? menuTagline.split('\n') : [];
  const navLinks = Array.isArray(content.navLinks)
    ? content.navLinks.filter(l => l && typeof l.label === 'string')
    : DEFAULT_NAV;

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

  React.useEffect(() => {
    if (!menuOpen || isCanvas) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, isCanvas]);

  React.useLayoutEffect(() => {
    if (isCanvas) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    const ctx = gsap.context(() => {
      gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none' });
      gsap.set(backdropRef.current, { autoAlpha: 0 });
      gsap.set(curtainRef.current, {
        xPercent: 110,
        autoAlpha: 0,
        rotation: -32,
        transformOrigin: 'center center',
      });
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: 'left center' });
      gsap.set(overlay.querySelectorAll('[data-nav-link]'), {
        y: 56,
        autoAlpha: 0,
      });
      gsap.set(overlay.querySelectorAll('[data-nav-cta]'), {
        y: 28,
        autoAlpha: 0,
      });
    }, overlay);

    return () => ctx.revert();
  }, [isCanvas, useFixed]);

  React.useEffect(() => {
    if (isCanvas) return;

    const overlay = overlayRef.current;
    const backdrop = backdropRef.current;
    const curtain = curtainRef.current;
    const line = lineRef.current;
    if (!overlay || !backdrop || !curtain || !line) return;

    const links = gsap.utils.toArray<HTMLElement>('[data-nav-link]', overlay);
    const ctas = gsap.utils.toArray<HTMLElement>('[data-nav-cta]', overlay);
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    menuTlRef.current?.kill();

    const snapClosed = () => {
      gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none' });
      gsap.set(backdrop, { autoAlpha: 0 });
      gsap.set(curtain, {
        xPercent: 110,
        autoAlpha: 0,
        rotation: -32,
        transformOrigin: 'center center',
      });
      gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
      gsap.set(links, { y: 56, autoAlpha: 0 });
      gsap.set(ctas, { y: 28, autoAlpha: 0 });
    };

    if (reduce) {
      if (menuOpen) {
        hasBeenOpenRef.current = true;
        gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });
        gsap.set([backdrop, curtain, line, ...links, ...ctas], {
          autoAlpha: 1,
          y: 0,
          xPercent: 0,
          scaleX: 1,
        });
      } else if (!hasBeenOpenRef.current) {
        snapClosed();
      } else {
        gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none' });
        gsap.set([backdrop, curtain, line, ...links, ...ctas], {
          autoAlpha: 0,
        });
      }
      return;
    }

    if (!menuOpen && !hasBeenOpenRef.current) {
      snapClosed();
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    menuTlRef.current = tl;

    if (menuOpen) {
      hasBeenOpenRef.current = true;
      gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });

      tl.fromTo(
        backdrop,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.45, ease: 'power2.out' }
      )
        .fromTo(
          curtain,
          { xPercent: 110, autoAlpha: 0 },
          { xPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'power4.inOut' },
          0
        )
        .fromTo(
          line,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.7, ease: 'power4.inOut' },
          0.18
        )
        .fromTo(
          links,
          { y: 56, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.62,
            stagger: 0.07,
            ease: 'power3.out',
          },
          0.22
        )
        .fromTo(
          ctas,
          { y: 28, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power3.out',
          },
          0.42
        );
    } else {
      tl.to(links, {
        y: -28,
        autoAlpha: 0,
        duration: 0.28,
        ease: 'power2.in',
        stagger: { each: 0.04, from: 'end' },
      })
        .to(
          ctas,
          {
            y: 20,
            autoAlpha: 0,
            duration: 0.24,
            ease: 'power2.in',
            stagger: 0.05,
          },
          0
        )
        .to(line, { scaleX: 0, duration: 0.3, ease: 'power2.in' }, 0.06)
        .to(
          curtain,
          { xPercent: 110, autoAlpha: 0, duration: 0.6, ease: 'power4.in' },
          0.08
        )
        .to(backdrop, { autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0.14)
        .set(overlay, { autoAlpha: 0, pointerEvents: 'none' });
    }

    return () => {
      tl.kill();
    };
  }, [menuOpen, isCanvas, useFixed]);

  const handleMenuToggle = () => setMenuOpen(prev => !prev);
  const handleMenuClose = () => setMenuOpen(false);

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleMenuToggle();
    }
  };

  const renderBookTableCta = (
    className: string,
    style: React.CSSProperties,
    closeOnClick: boolean,
    editable = true
  ) => (
    <a
      href={isCanvas ? undefined : bookTableHref || '#'}
      onClick={
        isCanvas
          ? e => e.preventDefault()
          : closeOnClick
            ? handleMenuClose
            : undefined
      }
      data-element-key={editable ? 'bookTableHref' : undefined}
      data-nav-cta={!isCanvas && closeOnClick ? true : undefined}
      className={selectableClass(
        editable && activeKey === 'bookTableHref',
        className
      )}
      style={composeStyle(style, editable ? styleOf('bookTableHref') : style)}
    >
      <span
        data-element-key={editable ? 'bookTableLabel' : undefined}
        className={selectableClass(editable && activeKey === 'bookTableLabel')}
        style={editable ? styleOf('bookTableLabel') : undefined}
      >
        {bookTableLabel}
      </span>
    </a>
  );

  const renderOrderBeerCta = (
    className: string,
    style: React.CSSProperties,
    closeOnClick: boolean,
    editable = true
  ) => (
    <a
      href={isCanvas ? undefined : orderBeerHref || '#'}
      onClick={
        isCanvas
          ? e => e.preventDefault()
          : closeOnClick
            ? handleMenuClose
            : undefined
      }
      data-element-key={editable ? 'orderBeerHref' : undefined}
      data-nav-cta={!isCanvas && closeOnClick ? true : undefined}
      className={selectableClass(
        editable && activeKey === 'orderBeerHref',
        className
      )}
      style={composeStyle(style, editable ? styleOf('orderBeerHref') : style)}
    >
      <span
        data-element-key={editable ? 'orderBeerLabel' : undefined}
        className={selectableClass(editable && activeKey === 'orderBeerLabel')}
        style={editable ? styleOf('orderBeerLabel') : undefined}
      >
        {orderBeerLabel}
      </span>
    </a>
  );

  const fixedPosition = inFrame ? 'absolute' : 'fixed';
  const headerPosition = isCanvas ? 'relative' : fixedPosition;

  const headerBar = (
    <header
      className='belgo-header-bar pointer-events-auto w-full transition-[background-color,backdrop-filter,border-color] duration-300 ease-out'
      style={{
        position: headerPosition,
        top: isCanvas ? undefined : 0,
        left: isCanvas ? undefined : 0,
        right: isCanvas ? undefined : 0,
        zIndex: isCanvas ? 10 : Z_HEADER,
        backgroundColor:
          scrolled && !isCanvas ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
        backdropFilter: scrolled && !isCanvas ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled && !isCanvas ? 'blur(12px)' : 'none',
        borderBottom: '1px solid rgba(228, 221, 206, 0.4)',
      }}
    >
      <div
        className='relative mx-auto flex w-full items-center justify-between'
        style={{
          height: 'clamp(64px, 10cqi, 80px)',
          paddingLeft: 'clamp(16px, 4cqi, 40px)',
          paddingRight: 'clamp(16px, 4cqi, 40px)',
        }}
      >
        <button
          type='button'
          aria-label={menuOpen ? menuCloseLabel : menuLabel}
          aria-expanded={menuOpen}
          aria-controls='belgo-site-nav'
          onClick={handleMenuToggle}
          onKeyDown={handleMenuKeyDown}
          className='relative shrink-0 cursor-pointer border-0 bg-transparent'
          style={composeStyle(
            {
              zIndex: 60,
              fontSize: 'clamp(14px, 1.6cqi, 16px)',
              letterSpacing: '0.2em',
              color: 'rgba(255, 255, 255, 0.9)',
            },
            styleOf('menuLabel')
          )}
        >
          <span
            data-element-key='menuLabel'
            className={selectableClass(activeKey === 'menuLabel')}
          >
            {menuOpen ? menuCloseLabel : menuLabel}
          </span>
          <span
            data-element-key='menuCloseLabel'
            className={selectableClass(
              activeKey === 'menuCloseLabel',
              'sr-only'
            )}
            style={styleOf('menuCloseLabel')}
          >
            {menuCloseLabel}
          </span>
        </button>

        <a
          href={isCanvas ? undefined : logoHref}
          onClick={isCanvas ? e => e.preventDefault() : handleMenuClose}
          aria-label={logoAlt}
          data-element-key='logoHref'
          className={selectableClass(
            activeKey === 'logoHref',
            'absolute left-1/2 -translate-x-1/2'
          )}
          style={composeStyle({ zIndex: 55 }, styleOf('logoHref'))}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-element-key='logoUrl'
            src={logoUrl}
            alt=''
            className={selectableClass(activeKey === 'logoUrl')}
            style={composeStyle(
              {
                height: 'clamp(28px, 5cqi, 56px)',
                width: 'auto',
                display: 'block',
              },
              styleOf('logoUrl')
            )}
          />
        </a>
        <span
          data-element-key='logoAlt'
          className={selectableClass(activeKey === 'logoAlt', 'sr-only')}
          style={styleOf('logoAlt')}
        >
          {logoAlt}
        </span>

        <div
          className='relative flex shrink-0 items-center'
          style={{ zIndex: 60, gap: 'clamp(8px, 1.2cqi, 12px)' }}
        >
          {renderBookTableCta(
            isCanvas
              ? 'hidden no-underline'
              : 'hidden no-underline @2xl:inline-flex',
            {
              padding: '10px 20px',
              fontSize: 'clamp(12px, 1.4cqi, 14px)',
              letterSpacing: '0.16em',
              color: '#000000',
              backgroundColor: BELGO_GOLD,
            },
            false,
            !isCanvas
          )}
          {renderOrderBeerCta(
            isCanvas
              ? 'hidden no-underline'
              : 'hidden no-underline border @4xl:inline-flex',
            {
              padding: '8px 16px',
              fontSize: 'clamp(11px, 1.3cqi, 14px)',
              letterSpacing: '0.14em',
              color: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            false,
            !isCanvas
          )}
        </div>
      </div>
    </header>
  );

  const menuOverlay = (
    <div
      id='belgo-site-nav'
      ref={overlayRef}
      role='dialog'
      aria-modal={!isCanvas}
      aria-label='Site navigation'
      aria-hidden={!isCanvas && !menuOpen}
      className={cn(
        'belgo-header-nav',
        !isCanvas && 'pointer-events-none invisible opacity-0'
      )}
      style={{
        position: isCanvas ? 'relative' : fixedPosition,
        inset: isCanvas ? undefined : 0,
        zIndex: Z_MENU,
        width: '100%',
        minHeight: isCanvas ? 'auto' : undefined,
      }}
      data-lenis-prevent={!isCanvas && menuOpen ? true : undefined}
    >
      <div
        ref={backdropRef}
        className={cn(!isCanvas && 'opacity-0')}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: `${BELGO_INK}ee`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        aria-hidden='true'
      />

      <div
        ref={curtainRef}
        className={cn(!isCanvas && 'pointer-events-none opacity-0')}
        style={{
          position: 'absolute',
          top: '-22%',
          right: '-18%',
          height: '128%',
          width: '58%',
          backgroundColor: `${BELGO_GOLD}2e`,
          transform: 'rotate(-32deg)',
          transformOrigin: 'center center',
        }}
        aria-hidden='true'
      />

      <nav
        className={cn(
          'relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col @4xl:flex-row @4xl:items-end @4xl:justify-between',
          isCanvas ? 'min-h-0' : 'h-full'
        )}
        style={{
          paddingTop: isCanvas ? 'clamp(16px, 3cqi, 24px)' : undefined,
          paddingBottom: isCanvas ? 'clamp(16px, 3cqi, 24px)' : undefined,
          paddingLeft: 'clamp(24px, 5cqi, 80px)',
          paddingRight: 'clamp(24px, 5cqi, 80px)',
        }}
      >
        <div
          className={cn(
            'flex-1 @4xl:flex-none @4xl:overflow-visible',
            !isCanvas && 'overflow-y-auto'
          )}
          style={{
            paddingTop: isCanvas ? 0 : 'clamp(96px, 14cqi, 112px)',
            paddingBottom: isCanvas ? 0 : 'clamp(16px, 3cqi, 24px)',
          }}
          data-lenis-prevent
        >
          <div
            ref={lineRef}
            className={cn(!isCanvas && 'origin-left scale-x-0')}
            style={{
              marginBottom: 'clamp(24px, 4cqi, 40px)',
              height: 1,
              width: '100%',
              maxWidth: 'clamp(240px, 40cqi, 384px)',
              backgroundColor: `${BELGO_GOLD}b3`,
            }}
            aria-hidden='true'
          />

          <ul
            className='flex flex-col'
            style={{ gap: 'clamp(8px, 1.5cqi, 16px)' }}
          >
            {navLinks.map((link, index) => {
              const labelKey = `navLinks[${index}].label`;
              const hrefKey = `navLinks[${index}].href`;
              return (
                <li key={`${link.href}-${index}`} className='overflow-hidden'>
                  <a
                    href={isCanvas ? undefined : link.href || '#'}
                    onClick={
                      isCanvas ? e => e.preventDefault() : handleMenuClose
                    }
                    data-nav-link={!isCanvas ? true : undefined}
                    data-element-key={hrefKey}
                    className={selectableClass(
                      activeKey === hrefKey,
                      'group flex items-baseline no-underline'
                    )}
                    style={{
                      gap: 'clamp(12px, 2cqi, 20px)',
                      opacity: isCanvas ? 1 : undefined,
                    }}
                  >
                    <span
                      aria-hidden='true'
                      className='hidden @4xl:inline'
                      style={{
                        fontSize: 'clamp(12px, 1.3cqi, 14px)',
                        letterSpacing: '0.2em',
                        color: BELGO_GOLD,
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      data-element-key={labelKey}
                      className={selectableClass(activeKey === labelKey)}
                      style={composeStyle(
                        {
                          display: 'block',
                          fontFamily: BELGO_FONT_DISPLAY,
                          fontSize: 'clamp(36px, 8cqi, 72px)',
                          letterSpacing: '0.06em',
                          color: BELGO_CREAM,
                        },
                        styleOf(labelKey)
                      )}
                    >
                      {link.label}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div
          className={cn(
            'relative z-20 shrink-0 @4xl:mt-0 @4xl:border-0 @4xl:bg-transparent @4xl:shadow-none',
            !isCanvas &&
              '-mt-10 border-t shadow-[0_-20px_40px_rgba(15,13,11,0.95)]'
          )}
          style={{
            borderColor: `${BELGO_GOLD}4d`,
            backgroundColor: isCanvas ? 'transparent' : BELGO_INK_DEEP,
            padding: 'clamp(16px, 3cqi, 24px)',
            paddingBottom: isCanvas
              ? 'clamp(16px, 3cqi, 24px)'
              : 'max(1.5rem, env(safe-area-inset-bottom))',
          }}
        >
          {taglineLines.length > 0 ? (
            <p
              data-nav-cta={!isCanvas ? true : undefined}
              data-element-key='menuTagline'
              className={selectableClass(
                activeKey === 'menuTagline',
                'mb-2 hidden max-w-xs text-right @4xl:block'
              )}
              style={composeStyle(
                {
                  fontFamily: BELGO_FONT_BODY,
                  fontSize: 'clamp(12px, 1.4cqi, 14px)',
                  lineHeight: 1.6,
                  letterSpacing: '0.12em',
                  color: `${BELGO_CREAM}8c`,
                  opacity: isCanvas ? 1 : undefined,
                  whiteSpace: 'pre-line',
                },
                styleOf('menuTagline')
              )}
            >
              {menuTagline}
            </p>
          ) : null}

          <div
            className='flex flex-col @4xl:items-end'
            style={{ gap: 'clamp(10px, 1.6cqi, 16px)' }}
          >
            {renderBookTableCta(
              'w-full no-underline @4xl:w-auto',
              {
                padding: '14px 16px',
                minWidth: 'clamp(180px, 30cqi, 220px)',
                fontSize: 'clamp(11px, 1.3cqi, 14px)',
                letterSpacing: '0.14em',
                color: '#000000',
                backgroundColor: BELGO_GOLD,
                opacity: isCanvas ? 1 : undefined,
              },
              true,
              isCanvas
            )}
            {renderOrderBeerCta(
              'w-full no-underline border @4xl:w-auto',
              {
                padding: '14px 16px',
                minWidth: 'clamp(180px, 30cqi, 220px)',
                fontSize: 'clamp(11px, 1.3cqi, 14px)',
                letterSpacing: '0.14em',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.35)',
                opacity: isCanvas ? 1 : undefined,
              },
              true,
              isCanvas
            )}
          </div>
        </div>
      </nav>
    </div>
  );

  const chrome = (
    <>
      <style>{BELGO_FONT_CSS}</style>
      {headerBar}
      {menuOverlay}
    </>
  );

  if (useFixed && portalHost) {
    return (
      <section
        ref={rootRef}
        className={cn(
          'belgo-header @container relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0',
          className
        )}
      >
        {createPortal(
          <div className='belgo-header-portal pointer-events-none'>
            {chrome}
          </div>,
          portalHost
        )}
      </section>
    );
  }

  if (!mounted || (hasRoot && !isCanvas)) {
    return (
      <section
        ref={rootRef}
        className={cn(
          'belgo-header @container relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0',
          className
        )}
      />
    );
  }

  return (
    <section
      ref={rootRef}
      data-canvas-edit='true'
      className={cn(
        'belgo-header @container relative m-0 w-full overflow-visible border-0 bg-[#1a1816] p-0',
        className
      )}
      style={{ minHeight: 'clamp(480px, 80cqi, 720px)' }}
    >
      <div className='relative w-full'>{chrome}</div>
    </section>
  );
}
