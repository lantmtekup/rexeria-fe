'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  CoolHunterFooterContent,
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
import { useContainerMobile } from './useContainerMobile';

interface CoolHunterFooterProps {
  content: CoolHunterFooterContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Cool Hunter Footer — port từ apps/cool-hunter FooterSection.tsx.
 *
 * Ảnh fade in; dải trắng wipe height từ trên xuống — không pin.
 * Canvas: hiện đủ field, skip scrub.
 */

const DISPLAY_FONT = "'Fraunces', 'Playfair Display', 'Times New Roman', serif";

const DEFAULT_BG = '/cool-hunter/footer-bg.png';
const DEFAULT_ICON = '/cool-hunter/icon-footer.svg';
const DEFAULT_TITLE =
  'Sign Up For Notifications To See More\nOf Our Interesting Stories.';
const DEFAULT_CTA = 'Sign Up';

export function CoolHunterFooter({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CoolHunterFooterProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const veilRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useContainerMobile(rootRef);

  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const bgUrl = content.bgUrl?.trim() || DEFAULT_BG;
  const iconUrl = content.iconUrl?.trim() || DEFAULT_ICON;
  const title = content.title?.trim() || DEFAULT_TITLE;
  const ctaText = content.ctaText?.trim() || DEFAULT_CTA;
  const ctaHref = content.ctaHref?.trim() || '';
  const titleLines = title.split(/\n/);

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      const frame = frameRef.current;
      const veil = veilRef.current;
      if (!root || !frame || !veil || isCanvas) return;

      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      gsap.set(frame, { opacity: 0 });
      gsap.set(veil, { height: '100%' });

      const img = frame.querySelector('img');
      if (img && !img.complete) {
        img.addEventListener('load', requestRefresh, { once: true });
      }

      if (reduce) {
        gsap.set(frame, { opacity: 1 });
        gsap.set(veil, { height: '0%' });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top 75%',
          end: 'bottom bottom',
          scrub: 0.45,
          invalidateOnRefresh: true,
        },
      });

      tl.to(veil, { height: '0%', duration: 1 }, 0).to(
        frame,
        { opacity: 1, duration: 1 },
        0
      );
    },
    [isCanvas, bgUrl]
  );

  const iconStyle: React.CSSProperties = {
    width: isMobile ? '52cqw' : 'clamp(13rem, 20cqw, 20rem)',
    height: 'auto',
  };

  const titleStyle: React.CSSProperties = {
    maxWidth: '46ch',
    margin: 0,
    textAlign: 'center',
    fontFamily: DISPLAY_FONT,
    fontSize: isMobile
      ? 'clamp(1.125rem, 3.5cqi, 1.25rem)'
      : 'clamp(1.5rem, 3cqi, 1.875rem)',
    fontWeight: 500,
    lineHeight: 1.375,
    color: '#171717',
  };

  const ctaStyle: React.CSSProperties = {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#171717',
    paddingInline: isMobile ? 40 : 56,
    paddingBlock: 12,
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
    fontSize: isMobile ? 12 : 14,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#171717',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  };

  const renderCta = () => {
    const classNameCta = selectableClass(
      activeKey === 'ctaText',
      'transition-colors duration-500 hover:bg-neutral-900 hover:text-white'
    );
    const style = composeStyle(ctaStyle, styleOf('ctaText'));

    if (ctaHref && !isCanvas) {
      return (
        <a
          href={ctaHref}
          data-element-key='ctaText'
          className={classNameCta}
          style={style}
        >
          {ctaText}
        </a>
      );
    }

    return (
      <button
        type='button'
        data-element-key='ctaText'
        className={classNameCta}
        style={style}
        tabIndex={0}
        aria-label={ctaText}
      >
        {ctaText}
      </button>
    );
  };

  return (
    <section
      ref={rootRef}
      data-canvas-edit={isCanvas ? 'true' : undefined}
      className={cn('@container relative w-full overflow-hidden', className)}
      style={composeStyle(
        { backgroundColor: '#ffffff' },
        blockBackgroundStyle(background)
      )}
    >
      <div
        ref={frameRef}
        className='absolute inset-0'
        style={isCanvas ? undefined : { opacity: 0 }}
      >
        <img
          src={bgUrl}
          alt=''
          aria-hidden
          data-element-key='bgUrl'
          className={selectableClass(
            activeKey === 'bgUrl',
            'h-full w-full object-cover'
          )}
          style={styleOf('bgUrl')}
        />
      </div>

      <div
        ref={veilRef}
        className='absolute inset-x-0 top-0 z-10'
        style={{
          height: isCanvas ? '0%' : '100%',
          backgroundColor: '#ffffff',
        }}
      />

      <div
        className='relative z-20 flex flex-col items-center'
        style={{
          gap: isMobile ? 20 : 24,
          paddingInline: 24,
          paddingBlock: isMobile ? 40 : 48,
        }}
      >
        <img
          src={iconUrl}
          alt=''
          aria-hidden
          data-element-key='iconUrl'
          className={selectableClass(activeKey === 'iconUrl')}
          style={composeStyle(iconStyle, styleOf('iconUrl'))}
        />

        <h2
          data-element-key='title'
          className={selectableClass(activeKey === 'title')}
          style={composeStyle(titleStyle, styleOf('title'))}
        >
          {titleLines.map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </h2>

        {renderCta()}
      </div>
    </section>
  );
}
