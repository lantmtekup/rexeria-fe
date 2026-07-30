'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, X } from 'lucide-react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  CiteFlowHeaderContent,
  CiteFlowHeaderSocialLink,
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
import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import { useContainerMobile } from './useContainerMobile';
import { useDrawerScrollLock } from './PnjHeroHotspots';
import { CITE_FLOW_FONT_CSS, CITE_FLOW_FONT_HEADING } from './citeFlowTheme';

const CITE_FLOW_HEADER_BREAKPOINT = 896;
const SCROLL_HIDE_THRESHOLD = 100;
const SPY_RESUME_DELAY = 250;
const REFRESH_SETTLE_DELAY = 60;

type LenisLike = {
  scroll: number;
  on: (event: string, cb: () => void) => void;
  off: (event: string, cb: () => void) => void;
};

const getLenis = (): LenisLike | undefined =>
  (window as unknown as { __lenis?: LenisLike }).__lenis;

const getScrollY = (scroller: HTMLElement | null | undefined): number => {
  const lenis = getLenis();
  if (lenis && typeof lenis.scroll === 'number') return lenis.scroll;
  if (scroller) return scroller.scrollTop;
  return window.scrollY;
};

const findNextBlockEl = (root: HTMLElement): HTMLElement | null => {
  let el: HTMLElement | null = root;
  while (el && el !== document.body) {
    if (el.nextElementSibling) return el.nextElementSibling as HTMLElement;
    el = el.parentElement;
  }
  return null;
};

interface Props {
  content: CiteFlowHeaderContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const DEFAULT_LOGO_URL = '/cite-flow/ecopark-logo.png';
const DEFAULT_LOGO_ALT = 'Ecopark';
const DEFAULT_LOGO_HREF = '/';
const DEFAULT_CONTACT_LABEL = 'Contact';
const DEFAULT_CONTACT_HREF = '#';
const DEFAULT_EMAIL_HEADING = '{ SAY HELLO }';
const DEFAULT_EMAIL_LABEL = 'info@ecoparkonsen.com';
const DEFAULT_EMAIL_HREF = 'mailto:info@ecoparkonsen.com';
const DEFAULT_SOCIAL_HEADING = '{ SOCIAL MEDIA }';
const DEFAULT_SOCIAL_LINKS: CiteFlowHeaderSocialLink[] = [
  { label: 'LinkedIn', href: '#' },
  { label: 'Behance', href: '#' },
  { label: 'YouTube', href: '#' },
];

const resolveSocialLinks = (
  content: CiteFlowHeaderContent
): CiteFlowHeaderSocialLink[] => {
  const links = content.socialLinks;
  if (Array.isArray(links) && links.length > 0) return links;
  return DEFAULT_SOCIAL_LINKS;
};

export function CiteFlowHeader({
  content,
  styles,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const barWrapRef = React.useRef<HTMLDivElement>(null);
  const menuOpenRef = React.useRef(false);
  const lastScrollRef = React.useRef(0);
  const spyResumeAtRef = React.useRef(0);
  const refreshingRef = React.useRef(false);
  const { scroller, hasRoot } = useLandingMotion();
  const [mounted, setMounted] = React.useState(false);
  const [isCanvas, setIsCanvas] = React.useState(false);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isHidden, setIsHidden] = React.useState(false);
  const isMobile = useContainerMobile(rootRef, CITE_FLOW_HEADER_BREAKPOINT);

  React.useEffect(() => setMounted(true), []);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    setIsCanvas(!!root.closest('[data-testid="active-block-preview"]'));
    setPortalHost(resolveDrawerPortalHost(root));
  }, [mounted, hasRoot]);

  const useFixed = mounted && hasRoot && !isCanvas;
  const inFrame = isDeviceFrameHost(portalHost);

  const isLight = content.variant?.trim() === 'light';
  const canvasReadable = isCanvas || isLight;
  const logoUrl = content.logoUrl?.trim() || DEFAULT_LOGO_URL;
  const logoAlt = content.logoAlt?.trim() || DEFAULT_LOGO_ALT;
  const logoHref = content.logoHref?.trim() || DEFAULT_LOGO_HREF;
  const contactLabel = content.contactLabel?.trim() || DEFAULT_CONTACT_LABEL;
  const contactHref = content.contactHref?.trim() || DEFAULT_CONTACT_HREF;
  const emailHeading = content.emailHeading?.trim() || DEFAULT_EMAIL_HEADING;
  const emailLabel = content.emailLabel?.trim() || DEFAULT_EMAIL_LABEL;
  const emailHref = content.emailHref?.trim() || DEFAULT_EMAIL_HREF;
  const socialHeading = content.socialHeading?.trim() || DEFAULT_SOCIAL_HEADING;
  const socialLinks = React.useMemo(
    () => resolveSocialLinks(content),
    [content]
  );

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useDrawerScrollLock(isMenuOpen ? 'cite-flow-header' : null, false);

  React.useEffect(() => {
    if (!isMobile) setIsMenuOpen(false);
  }, [isMobile]);

  React.useEffect(() => {
    menuOpenRef.current = isMenuOpen;
    if (isMenuOpen) {
      setIsHidden(false);
      return;
    }
    lastScrollRef.current = getScrollY(scroller);
    spyResumeAtRef.current = performance.now() + SPY_RESUME_DELAY;
  }, [isMenuOpen, scroller]);

  React.useEffect(() => {
    if (!useFixed) return;

    gsap.registerPlugin(ScrollTrigger);
    lastScrollRef.current = getScrollY(scroller);

    const sync = () => {
      const current = getScrollY(scroller);

      if (
        menuOpenRef.current ||
        refreshingRef.current ||
        performance.now() < spyResumeAtRef.current
      ) {
        lastScrollRef.current = current;
        return;
      }

      const delta = current - lastScrollRef.current;

      if (current <= SCROLL_HIDE_THRESHOLD) {
        setIsHidden(false);
      } else if (delta > 0) {
        setIsHidden(true);
      } else if (delta < 0) {
        setIsHidden(false);
      }

      lastScrollRef.current = current;
    };

    const onRefreshInit = () => {
      refreshingRef.current = true;
    };
    const onRefreshDone = () => {
      refreshingRef.current = false;
      lastScrollRef.current = getScrollY(scroller);
      spyResumeAtRef.current = performance.now() + REFRESH_SETTLE_DELAY;
    };

    const spy = ScrollTrigger.create({
      scroller: scroller ?? undefined,
      start: 0,
      end: 'max',
      onUpdate: sync,
    });
    ScrollTrigger.addEventListener('refreshInit', onRefreshInit);
    ScrollTrigger.addEventListener('refresh', onRefreshDone);
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
      ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
      ScrollTrigger.removeEventListener('refresh', onRefreshDone);
      scroller?.removeEventListener('scroll', sync);
      lenis?.off('scroll', sync);
      window.clearTimeout(retryId);
    };
  }, [useFixed, scroller]);

  useBlockMotion(
    rootRef,
    ({ scroller: motionScroller }) => {
      const wrap = barWrapRef.current;
      const root = rootRef.current;
      if (!wrap || !root || isMobile || isLight) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const trigger = findNextBlockEl(root);
      if (!trigger) return;

      gsap.to(wrap, {
        y: () => -trigger.getBoundingClientRect().height * 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger,
          scroller: motionScroller,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    },
    [isMobile, isLight, portalHost]
  );

  const logo = (
    <a
      href={logoHref}
      data-element-key='logoHref'
      aria-label={logoAlt}
      className={selectableClass(activeKey === 'logoHref', 'inline-block')}
      style={styleOf('logoHref')}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-element-key='logoUrl'
        src={logoUrl}
        alt=''
        className={selectableClass(
          activeKey === 'logoUrl',
          cn('h-auto w-37.75', canvasReadable && 'invert')
        )}
        style={styleOf('logoUrl')}
        draggable={false}
      />
    </a>
  );

  const bar = (
    <div
      className={cn(
        '@container w-full',
        isMobile &&
          cn(
            'transition-transform duration-400 ease-[cubic-bezier(0.44,0,0.56,1)]',
            isHidden && !isMenuOpen ? '-translate-y-full' : 'translate-y-0'
          )
      )}
    >
      <style>{CITE_FLOW_FONT_CSS}</style>

      <div className='relative z-20 mx-auto hidden w-full max-w-[1720px] items-center justify-between px-5 py-6.25 @4xl:flex'>
        {logo}
        <a
          href={contactHref}
          data-element-key='contactHref'
          className={selectableClass(
            activeKey === 'contactHref',
            cn(
              'relative inline-block w-fit text-[18px] leading-6.75 font-normal no-underline transition-colors duration-400 ease-[cubic-bezier(0.44,0,0.56,1)]',
              !isCanvas && 'group',
              canvasReadable ? 'text-[#1a1919]' : 'text-white'
            )
          )}
          style={composeStyle(
            { fontFamily: CITE_FLOW_FONT_HEADING },
            styleOf('contactHref')
          )}
        >
          <span data-element-key='contactLabel' style={styleOf('contactLabel')}>
            {contactLabel}
          </span>
          {!isCanvas && (
            <>
              <span
                className={cn(
                  'absolute top-0 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-600 ease-[cubic-bezier(0.44,0,0.56,1)] group-hover:scale-x-100',
                  canvasReadable ? 'bg-[#1a1919]' : 'bg-white'
                )}
              />
              <span
                className={cn(
                  'absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-600 ease-[cubic-bezier(0.44,0,0.56,1)] group-hover:scale-x-100',
                  canvasReadable ? 'bg-[#1a1919]' : 'bg-white'
                )}
              />
            </>
          )}
        </a>
      </div>

      <div className='@4xl:hidden'>
        <div className='flex w-full items-center justify-between bg-white p-5'>
          <a href={logoHref} aria-label={logoAlt}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt=''
              className='h-auto w-37.75 invert'
              draggable={false}
            />
          </a>
          <button
            type='button'
            onClick={() => setIsMenuOpen(open => !open)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className='flex h-11 w-11 cursor-pointer items-center justify-center rounded-[5px] border bg-[#1a1919] text-white'
          >
            {isMenuOpen ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </button>
        </div>
      </div>

      <div
        className={cn(
          !isCanvas && '@4xl:hidden',
          'overflow-hidden bg-white transition-[max-height] duration-500 ease-in-out',
          isCanvas ? 'max-h-none' : isMenuOpen ? 'max-h-[80vh]' : 'max-h-0'
        )}
        data-lenis-prevent
      >
        <div
          className={cn(
            'flex flex-col gap-7.5 px-5 pb-5',
            isCanvas ? 'h-auto overflow-visible' : 'h-[80vh] overflow-y-auto'
          )}
        >
          <a
            href={contactHref}
            data-element-key='contactHref'
            className={selectableClass(
              activeKey === 'contactHref',
              'w-full border-t border-[#1a1919] pt-5 text-lg font-medium text-[#1a1919] transition-colors duration-400 ease-[cubic-bezier(0.44,0,0.56,1)]'
            )}
            style={composeStyle(
              { fontFamily: CITE_FLOW_FONT_HEADING },
              styleOf('contactHref')
            )}
          >
            <span
              data-element-key='contactLabel'
              style={styleOf('contactLabel')}
            >
              {contactLabel}
            </span>
          </a>

          <div className='flex flex-col gap-3'>
            <p
              data-element-key='emailHeading'
              className={selectableClass(
                activeKey === 'emailHeading',
                'text-xl font-medium tracking-widest text-[#1a1919] uppercase'
              )}
              style={composeStyle(
                { fontFamily: CITE_FLOW_FONT_HEADING },
                styleOf('emailHeading')
              )}
            >
              {emailHeading}
            </p>
            <a
              href={emailHref}
              data-element-key='emailHref'
              className={selectableClass(
                activeKey === 'emailHref',
                'text-lg font-medium text-[#1a1919] transition-colors duration-400 ease-[cubic-bezier(0.44,0,0.56,1)] hover:text-[#1a1919]/70'
              )}
              style={composeStyle(
                { fontFamily: CITE_FLOW_FONT_HEADING },
                styleOf('emailHref')
              )}
            >
              <span data-element-key='emailLabel' style={styleOf('emailLabel')}>
                {emailLabel}
              </span>
            </a>
          </div>

          <div className='flex flex-col gap-3'>
            <p
              data-element-key='socialHeading'
              className={selectableClass(
                activeKey === 'socialHeading',
                'text-xl font-medium tracking-widest text-[#1a1919] uppercase'
              )}
              style={composeStyle(
                { fontFamily: CITE_FLOW_FONT_HEADING },
                styleOf('socialHeading')
              )}
            >
              {socialHeading}
            </p>
            <div className='flex flex-col gap-3'>
              {socialLinks.map((link, i) => {
                const labelKey = `socialLinks[${i}].label`;
                return (
                  <a
                    key={i}
                    href={link.href}
                    data-element-key={labelKey}
                    className={selectableClass(
                      activeKey === labelKey,
                      'text-lg font-medium text-[#1a1919] transition-colors duration-400 ease-[cubic-bezier(0.44,0,0.56,1)] hover:text-[#1a1919]/70'
                    )}
                    style={composeStyle(
                      { fontFamily: CITE_FLOW_FONT_HEADING },
                      styleOf(labelKey)
                    )}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (useFixed && portalHost) {
    return (
      <section
        ref={rootRef}
        className={cn(
          'cite-flow-header @container relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0',
          className
        )}
      >
        {createPortal(
          <div
            ref={barWrapRef}
            className={cn(
              'cite-flow-header-fixed inset-x-0 top-0 z-55',
              inFrame || !isMobile ? 'absolute' : 'fixed'
            )}
            data-cite-flow-header-fixed
          >
            {bar}
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
          'cite-flow-header @container relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0',
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
        'cite-flow-header @container relative m-0 min-h-svh w-full overflow-hidden border-0 bg-[#f7f5f3] p-0',
        className
      )}
    >
      <div className='relative z-10 w-full'>{bar}</div>
    </section>
  );
}
