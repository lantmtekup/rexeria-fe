'use client';

/**
 * Belgo · Footer — scrub headline reveal + beige curtain wipe → địa chỉ +
 * socials trên accent. Port từ apps/belgo Footer.tsx.
 *
 * Khác apps: KHÔNG dùng ScrollTrigger `pin` — trên element scroller
 * (editor/preview) pin chạy bằng transform sau scroll event nên giật. Thay
 * bằng idiom host (như ScrollMattis): root cao = stage × 4.2 (tương đương
 * `end: '+=320%'` cũ), stage `position: sticky`, scrub `top top → bottom
 * bottom`.
 *
 * Canvas: layout phẳng (headline + footer + socials hiện hết), bỏ scrub.
 * Preview + /p: giữ UX production.
 */

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type { BelgoFooterContent, BelgoFooterLocation } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  resolveBelgoFooterHeadlineWords,
  resolveBelgoFooterLocations,
  resolveBelgoFooterSocials,
} from './_registry/defs/belgoFooter';
import { socialIconOf } from './theGrandFooterSocialIcons';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import {
  BELGO_FONT_BODY,
  BELGO_FONT_CSS,
  BELGO_FONT_DISPLAY,
} from './belgoTheme';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';

const CURTAIN_ANGLE = -32;
const FOOTER_CREAM = '#e4ddcf';
const FOOTER_INK = '#1A1A1A';

const splitAddress = (address: string | undefined): string[] =>
  (address ?? '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

export function BelgoFooter({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<BelgoFooterContent>) {
  const rootRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const footerRef = React.useRef<HTMLDivElement>(null);
  const textScreenRef = React.useRef<HTMLDivElement>(null);
  const curtainRef = React.useRef<HTMLDivElement>(null);
  const cornerRef = React.useRef<HTMLDivElement>(null);
  const wordsRef = React.useRef<HTMLHeadingElement>(null);

  const isCanvas = useIsCanvasEdit(rootRef);
  const isMobile = useContainerMobile(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const logoUrl = content.logoUrl?.trim() || '/belgo/logo-2.avif';
  const logoAlt = content.logoAlt?.trim() || 'Belgő';
  const followLabel = content.followLabel?.trim() || 'FOLLOW US ON';
  const copyright =
    content.copyright?.trim() || 'Copyright © 2025 Belgo The Belgium Brewery';

  const headlineWords = React.useMemo(
    () => resolveBelgoFooterHeadlineWords(content),
    [content]
  );
  const locations = React.useMemo(
    () => resolveBelgoFooterLocations(content),
    [content]
  );
  const socials = React.useMemo(
    () => resolveBelgoFooterSocials(content),
    [content]
  );

  const leftLocations = locations
    .map((loc, i) => ({ loc, i }))
    .filter(({ i }) => i % 2 === 0);
  const rightLocations = locations
    .map((loc, i) => ({ loc, i }))
    .filter(({ i }) => i % 2 === 1);

  // Match apps/belgo Footer: clamp(2rem, 6vw, 5rem) — cqi ≈ vw inside @container.
  const headlineFontSize = isMobile
    ? 'clamp(2rem, 10cqi, 3.5rem)'
    : 'clamp(2rem, 6cqi, 5rem)';

  // apps: h-16 (4rem) mobile → md:h-36 (9rem) desktop
  const logoHeight = isMobile ? '4rem' : '9rem';

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      if (isCanvas) return;

      const root = rootRef.current;
      const stage = stageRef.current;
      const textScreen = textScreenRef.current;
      const curtain = curtainRef.current;
      const corner = cornerRef.current;
      const words = wordsRef.current;
      if (!root || !stage || !textScreen || !curtain || !corner || !words)
        return;

      const wordSpans = gsap.utils.toArray<HTMLElement>('[data-word]', words);

      const rad = ((CURTAIN_ANGLE + 90) * Math.PI) / 180;
      const dx = Math.cos(rad);
      const dy = Math.sin(rad);
      const geom = { sStart: 0, sEnd: 0 };

      const computeGeom = () => {
        const vw = stage.offsetWidth || 1;
        const vh = stage.offsetHeight || 1;
        const R = (vw * Math.abs(dx) + vh * Math.abs(dy)) / 2;
        const thickness = 0.74 * R;
        const width = 3 * (vw + vh);

        curtain.style.width = `${width}px`;
        curtain.style.height = `${thickness}px`;

        geom.sStart = -(R + thickness / 2 + 0.2 * R);
        const overshoot = 0.2 * R;
        geom.sEnd = R + overshoot - thickness / 2;
      };

      const proxy = { p: 0 };
      const applyCurtain = () => {
        const s = geom.sStart + (geom.sEnd - geom.sStart) * proxy.p;
        const tx = s * dx;
        const ty = s * dy;
        curtain.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${CURTAIN_ANGLE}deg)`;
      };

      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      computeGeom();

      if (reduce) {
        proxy.p = 1;
        applyCurtain();
        gsap.set(wordSpans, { yPercent: 0, opacity: 1 });
        gsap.set(textScreen, { autoAlpha: 0 });
        gsap.set(corner, { autoAlpha: 1 });
        return;
      }

      proxy.p = 0;
      applyCurtain();
      gsap.set(textScreen, { autoAlpha: 1 });
      gsap.set(corner, { autoAlpha: 0 });
      gsap.set(wordSpans, { yPercent: 120, opacity: 0 });

      const logoImg = root.querySelector<HTMLImageElement>(
        '[data-belgo-footer-logo]'
      );
      if (logoImg && !logoImg.complete) {
        logoImg.addEventListener('load', requestRefresh, { once: true });
      }

      // Root cao = stage × 4.2 → sticky stage "pin" 320% quãng scroll như cũ.
      const setTrackHeight = () => {
        gsap.set(root, { height: Math.round(stage.offsetHeight * 4.2) });
      };
      setTrackHeight();

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onRefreshInit: setTrackHeight,
          onRefresh: () => {
            computeGeom();
            applyCurtain();
          },
        },
      });

      tl.to(
        wordSpans,
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.16,
          ease: 'power3.out',
          stagger: 0.04,
        },
        0
      );
      tl.to(proxy, { p: 1, duration: 0.55, onUpdate: applyCurtain }, 0.4);
      tl.to(textScreen, { autoAlpha: 0, duration: 0.2 }, 0.58);
      tl.to(corner, { autoAlpha: 1, duration: 0.12 }, 0.9);
    },
    [isCanvas, headlineWords, logoUrl]
  );

  const renderLocation = (location: BelgoFooterLocation, index: number) => {
    const lines = splitAddress(location.address);
    const nameKey = `locations[${index}].name`;
    const addressKey = `locations[${index}].address`;
    const telKey = `locations[${index}].tel`;

    return (
      <div key={`loc-${index}`}>
        <p
          data-element-key={nameKey}
          className={selectableClass(activeKey === nameKey, 'block')}
          style={composeStyle(
            {
              margin: 0,
              fontFamily: BELGO_FONT_DISPLAY,
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '0.08em',
              color: FOOTER_CREAM,
            },
            styleOf(nameKey)
          )}
        >
          {location.name}
        </p>
        <div
          className='mt-3 space-y-0.5'
          style={{
            fontFamily: BELGO_FONT_BODY,
            fontSize: '13px',
            lineHeight: 1.625,
            color: 'rgba(228, 221, 207, 0.6)',
          }}
        >
          {lines.map((line, lineIdx) => (
            <p
              key={`${index}-addr-${lineIdx}`}
              data-element-key={lineIdx === 0 ? addressKey : undefined}
              className={selectableClass(
                lineIdx === 0 && activeKey === addressKey,
                'block'
              )}
              style={
                lineIdx === 0
                  ? composeStyle({ margin: 0 }, styleOf(addressKey))
                  : { margin: 0 }
              }
            >
              {line}
            </p>
          ))}
          {!lines.length && (
            <p
              data-element-key={addressKey}
              className={selectableClass(activeKey === addressKey, 'block')}
              style={composeStyle({ margin: 0 }, styleOf(addressKey))}
            >
              {' '}
            </p>
          )}
          <p
            data-element-key={telKey}
            className={selectableClass(activeKey === telKey, 'block')}
            style={composeStyle({ margin: 0 }, styleOf(telKey))}
          >
            {location.tel}
          </p>
        </div>
      </div>
    );
  };

  const renderHeadline = (forCanvas: boolean) => (
    <h2
      ref={forCanvas ? undefined : wordsRef}
      className='flex flex-wrap items-center justify-center gap-x-[0.3em] gap-y-1 text-center leading-none'
      style={{
        margin: 0,
        fontFamily: BELGO_FONT_DISPLAY,
        fontSize: headlineFontSize,
        fontWeight: 400,
      }}
    >
      {headlineWords.map((word, i) => {
        const key = `headlineWords[${i}].text`;
        return (
          <span
            key={`${word.text}-${i}`}
            className='inline-block overflow-hidden py-[0.1em]'
          >
            <span
              data-word={forCanvas ? undefined : true}
              data-element-key={key}
              className={selectableClass(activeKey === key, 'inline-block')}
              style={composeStyle(
                {
                  color: word.accent ? '#ffffff' : FOOTER_CREAM,
                },
                styleOf(key)
              )}
            >
              {word.text}
            </span>
          </span>
        );
      })}
    </h2>
  );

  const renderSocialIcons = () => (
    <div className='flex items-center gap-3'>
      {socials.map((social, i) => {
        const platform = social.platform ?? 'facebook';
        const icon = socialIconOf(platform);
        const hrefKey = `socials[${i}].href`;
        const iconKey = `socials[${i}].iconUrl`;
        const href = social.href?.trim() || '#';
        const iconUrl = social.iconUrl?.trim() || '';
        const ariaLabel = social.iconAlt?.trim() || icon.label || 'Social link';

        return (
          <a
            key={`${platform}-${i}`}
            href={href}
            aria-label={ariaLabel}
            data-element-key={hrefKey}
            className={selectableClass(
              activeKey === hrefKey || activeKey === iconKey,
              'flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-80'
            )}
            style={composeStyle(
              {
                backgroundColor: FOOTER_INK,
                color: FOOTER_CREAM,
              },
              styleOf(hrefKey)
            )}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                (e.currentTarget as HTMLAnchorElement).click();
              }
            }}
          >
            {iconUrl ? (
              <img
                data-element-key={iconKey}
                src={iconUrl}
                alt=''
                aria-hidden='true'
                className={selectableClass(
                  activeKey === iconKey,
                  'h-4 w-4 object-contain'
                )}
                style={styleOf(iconKey)}
              />
            ) : (
              <svg
                viewBox='0 0 24 24'
                className='h-4 w-4'
                fill={icon.mode === 'fill' ? 'currentColor' : 'none'}
                stroke={icon.mode === 'stroke' ? 'currentColor' : undefined}
                strokeWidth={icon.mode === 'stroke' ? 1.8 : undefined}
                aria-hidden='true'
              >
                {icon.glyph}
              </svg>
            )}
          </a>
        );
      })}
    </div>
  );

  const renderLogo = () => (
    <img
      data-belgo-footer-logo
      data-element-key='logoUrl'
      src={logoUrl}
      alt={logoAlt}
      className={selectableClass(activeKey === 'logoUrl', 'w-auto')}
      style={composeStyle(
        { height: logoHeight, width: 'auto' },
        styleOf('logoUrl')
      )}
    />
  );

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        id='footer'
        data-canvas-edit='true'
        className={cn('@container relative w-full overflow-hidden', className)}
        style={composeStyle(
          {
            backgroundColor: '#000000',
            minHeight: 'clamp(640px, 120cqi, 960px)',
          },
          blockBackgroundStyle(background)
        )}
      >
        <style>{BELGO_FONT_CSS}</style>

        <div className='relative z-10 flex flex-col gap-10 px-6 py-10 @4xl:px-16'>
          <div className='flex flex-col items-center pt-4'>{renderLogo()}</div>

          <div className='rounded-lg border border-white/10 bg-black/40 px-4 py-8'>
            <p
              className='mb-4 text-center text-[10px] tracking-widest uppercase'
              style={{ color: 'rgba(228,221,207,0.45)' }}
            >
              Headline (pin/scrub trên preview)
            </p>
            {renderHeadline(true)}
          </div>

          <div className='grid max-w-3xl grid-cols-1 gap-x-12 gap-y-5 @2xl:grid-cols-2 @2xl:gap-y-8'>
            <div className='space-y-5 @2xl:space-y-8'>
              {leftLocations.map(({ loc, i }) => renderLocation(loc, i))}
            </div>
            <div className='space-y-5 @2xl:space-y-8'>
              {rightLocations.map(({ loc, i }) => renderLocation(loc, i))}
            </div>
          </div>

          <div
            className='mt-4 flex flex-col items-end rounded-lg px-4 py-6'
            style={{ backgroundColor: FOOTER_CREAM }}
          >
            <div className='flex items-center gap-4'>
              <span
                data-element-key='followLabel'
                className={selectableClass(
                  activeKey === 'followLabel',
                  'inline-block'
                )}
                style={composeStyle(
                  {
                    fontFamily: BELGO_FONT_DISPLAY,
                    fontSize: '12px',
                    letterSpacing: '0.16em',
                    color: FOOTER_INK,
                  },
                  styleOf('followLabel')
                )}
              >
                {followLabel}
              </span>
              {renderSocialIcons()}
            </div>
            <p
              data-element-key='copyright'
              className={selectableClass(
                activeKey === 'copyright',
                'mt-6 text-right'
              )}
              style={composeStyle(
                {
                  marginTop: '1.5rem',
                  fontFamily: BELGO_FONT_DISPLAY,
                  fontSize: '12px',
                  letterSpacing: '0.08em',
                  color: FOOTER_INK,
                },
                styleOf('copyright')
              )}
            >
              {copyright}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      id='footer'
      className={cn('relative w-full', className)}
      style={{ backgroundColor: '#000000' }}
    >
      <style>{BELGO_FONT_CSS}</style>

      <div
        ref={stageRef}
        className='@container sticky top-0 h-screen w-full overflow-hidden'
        style={composeStyle(
          {
            backgroundColor: '#000000',
          },
          blockBackgroundStyle(background)
        )}
      >
        <div ref={footerRef} className='absolute inset-0 z-10'>
          <div
            className={cn(
              'relative flex h-full flex-col px-6 py-8',
              '@2xl:px-10 @2xl:py-14 @4xl:px-16'
            )}
          >
            {/* apps: pt-10 md:pt-[200px] */}
            <div
              className={cn(
                'flex shrink-0 flex-col items-center pt-10',
                !isMobile && 'pt-[200px]'
              )}
            >
              {renderLogo()}
            </div>

            {/* apps: pb-40 mobile · md:pb-0 desktop; 2-col from sm ≈ @2xl host */}
            <div
              className={cn(
                'mt-auto grid max-w-3xl grid-cols-1 gap-x-12 gap-y-5 pb-40',
                '@2xl:grid-cols-2 @2xl:gap-y-8 @2xl:pb-0'
              )}
            >
              <div className='space-y-5 @2xl:space-y-8'>
                {leftLocations.map(({ loc, i }) => renderLocation(loc, i))}
              </div>
              <div className='space-y-5 @2xl:space-y-8'>
                {rightLocations.map(({ loc, i }) => renderLocation(loc, i))}
              </div>
            </div>
          </div>
        </div>

        <div
          ref={curtainRef}
          aria-hidden='true'
          className='pointer-events-none absolute top-1/2 left-1/2 z-30 will-change-transform'
          style={{
            backgroundColor: FOOTER_CREAM,
            transform: 'translate(-150%, -150%) rotate(-32deg)',
          }}
        />

        <div ref={cornerRef} className='absolute inset-0 z-40 opacity-0'>
          {/* apps: h-[48vmin] w-[62vmin] tip fill under socials */}
          <div
            aria-hidden='true'
            className='pointer-events-none absolute right-0 bottom-0 h-[48vmin] w-[62vmin]'
            style={{
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
              backgroundColor: FOOTER_CREAM,
            }}
          />
          <div
            className={cn(
              'relative flex h-full flex-col items-end justify-end px-6 py-10',
              '@2xl:px-10 @2xl:py-14 @4xl:px-16'
            )}
          >
            <div className='flex items-center gap-4'>
              <span
                data-element-key='followLabel'
                className={selectableClass(
                  activeKey === 'followLabel',
                  'inline-block'
                )}
                style={composeStyle(
                  {
                    fontFamily: BELGO_FONT_DISPLAY,
                    fontSize: '12px',
                    letterSpacing: '0.16em',
                    color: FOOTER_INK,
                  },
                  styleOf('followLabel')
                )}
              >
                {followLabel}
              </span>
              {renderSocialIcons()}
            </div>
            <p
              data-element-key='copyright'
              className={selectableClass(activeKey === 'copyright', 'block')}
              style={composeStyle(
                {
                  marginTop: '1.5rem',
                  fontFamily: BELGO_FONT_DISPLAY,
                  fontSize: '12px',
                  letterSpacing: '0.08em',
                  color: FOOTER_INK,
                },
                styleOf('copyright')
              )}
            >
              {copyright}
            </p>
          </div>
        </div>

        <div
          ref={textScreenRef}
          className='absolute inset-0 z-20 flex items-center justify-center px-6'
          style={{ backgroundColor: '#000000' }}
        >
          {renderHeadline(false)}
        </div>
      </div>
    </section>
  );
}
