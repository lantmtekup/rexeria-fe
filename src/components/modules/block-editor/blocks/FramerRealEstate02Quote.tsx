'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerRealEstate02QuoteContent,
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
  content: FramerRealEstate02QuoteContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const FONT_STACK =
  '"Inter", "Inter Placeholder", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

const COLORS = {
  dark: '#2c2926',
  accent: '#c49f8a',
  muted: '#66634d',
} as const;

const TRAVEL = 24;
const DURATION = 0.65;
const EASE = 'power2.out';
const BLUR_ENTER_START = 6;

const BUILDING_PARALLAX_SLOPE = 0.05;
const HEADSHOT_PARALLAX_SLOPE = 0.1;

const ROOT_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: '#565440',
};

const CARD_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: '375px',
  aspectRatio: '375 / 567',
  overflow: 'hidden',
  backgroundColor: COLORS.dark,
  fontFamily: FONT_STACK,
};

const HEADER_WRAP_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '5.33%',
  top: '7.05%',
  width: '62.23%',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 2,
};

const NAME_STYLE: React.CSSProperties = {
  margin: 0,
  fontWeight: 400,
  fontSize: '10.83px',
  lineHeight: 1.48,
  letterSpacing: '0.44px',
  textTransform: 'uppercase',
  color: COLORS.accent,
};

const ROLE_STYLE: React.CSSProperties = {
  margin: 0,
  fontWeight: 400,
  fontSize: '10.83px',
  lineHeight: 1.48,
  letterSpacing: '0.44px',
  textTransform: 'uppercase',
  color: COLORS.muted,
};

const QUOTE_WRAP_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '5.33%',
  top: '19.75%',
  width: '85.33%',
  zIndex: 2,
};

const QUOTE_STYLE: React.CSSProperties = {
  margin: 0,
  fontWeight: 400,
  fontSize: '15.9px',
  lineHeight: 1.33,
  letterSpacing: '0.63px',
  textTransform: 'uppercase',
  color: COLORS.accent,
};

const HEADSHOT_WRAP_STYLE: React.CSSProperties = {
  bottom: '69px',
  height: '129px',
  left: '20px',
  overflow: 'hidden',
  position: 'absolute',
  width: '94px',
  willChange: 'transform',
  opacity: 1,
};

const HEADSHOT_INNER_STYLE: React.CSSProperties = {
  position: 'absolute',
  borderRadius: 'inherit',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const BUILDING_WRAP_STYLE: React.CSSProperties = {
  height: '282px',
  left: '94px',
  overflow: 'hidden',
  position: 'absolute',
  right: '47px',
  top: '206px',
};

const BUILDING_INNER_WRAP_STYLE: React.CSSProperties = {
  willChange: 'transform',
  inset: '-35px -29px -34px',
  overflow: 'hidden',
  position: 'absolute',
  opacity: 1,
};

const ABSOLUTE_FILL_STYLE: React.CSSProperties = {
  position: 'absolute',
  borderRadius: 'inherit',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const PHOTO_IMAGE_STYLE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
  objectPosition: 'center',
  objectFit: 'fill',
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function FramerRealEstate02Quote({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const quoteRef = React.useRef<HTMLParagraphElement>(null);
  const buildingParallaxRef = React.useRef<HTMLDivElement>(null);
  const headshotInnerRef = React.useRef<HTMLDivElement>(null);

  const [isCanvas, setIsCanvas] = React.useState(true);

  React.useLayoutEffect(() => {
    setIsCanvas(
      !!rootRef.current?.closest('[data-testid="active-block-preview"]')
    );
  }, []);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      if (isCanvas) return;
      const root = rootRef.current;
      const reduceMotion = prefersReducedMotion();

      const textEls: Array<HTMLElement | null> = [
        headerRef.current,
        quoteRef.current,
      ];
      const els = textEls.filter((el): el is HTMLElement => !!el);
      if (root && els.length) {
        if (reduceMotion) {
          gsap.set(els, { opacity: 1, y: 0, filter: 'blur(0px)' });
        } else {
          gsap.set(els, {
            opacity: 0,
            y: TRAVEL,
            filter: `blur(${BLUR_ENTER_START}px)`,
          });
          gsap.to(els, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: DURATION,
            ease: EASE,
            stagger: 0.08,
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          });
        }
      }

      if (reduceMotion || !root) return;

      const headshotInner = headshotInnerRef.current;
      const buildingParallax = buildingParallaxRef.current;

      if (headshotInner || buildingParallax) {
        ScrollTrigger.create({
          trigger: root,
          scroller,
          start: 0,
          end: 'max',
          onUpdate: self => {
            const scrollValue = self.scroll();
            if (headshotInner) {
              gsap.set(headshotInner, {
                y: -HEADSHOT_PARALLAX_SLOPE * scrollValue,
                force3D: false,
              });
            }
            if (buildingParallax) {
              gsap.set(buildingParallax, {
                y: BUILDING_PARALLAX_SLOPE * scrollValue,
                force3D: false,
              });
            }
          },
        });
      }
    },
    [isCanvas]
  );

  return (
    <section
      ref={rootRef}
      data-block='framer-realestate02-quote'
      style={{ ...ROOT_STYLE, ...blockBackgroundStyle(background) }}
      className={cn('freq-root', className)}
    >
      <div style={CARD_STYLE} className='freq-card @container'>
        <div style={BUILDING_WRAP_STYLE}>
          <div style={BUILDING_INNER_WRAP_STYLE} ref={buildingParallaxRef}>
            <div style={ABSOLUTE_FILL_STYLE}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.buildingImageUrl}
                alt=''
                data-element-key='buildingImageUrl'
                style={composeStyle(
                  PHOTO_IMAGE_STYLE,
                  styleOf('buildingImageUrl')
                )}
                className={selectableClass(activeKey === 'buildingImageUrl')}
              />
            </div>
          </div>
        </div>

        <div style={HEADSHOT_WRAP_STYLE} ref={headshotInnerRef}>
          <div style={HEADSHOT_INNER_STYLE}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.headshotImageUrl}
              alt=''
              data-element-key='headshotImageUrl'
              style={composeStyle(
                PHOTO_IMAGE_STYLE,
                styleOf('headshotImageUrl')
              )}
              className={selectableClass(activeKey === 'headshotImageUrl')}
            />
          </div>
        </div>

        <div ref={headerRef} style={HEADER_WRAP_STYLE}>
          <p
            data-element-key='name'
            style={composeStyle(NAME_STYLE, styleOf('name'))}
            className={selectableClass(activeKey === 'name')}
          >
            {content.name}
          </p>
          <p
            data-element-key='role'
            style={composeStyle(ROLE_STYLE, styleOf('role'))}
            className={selectableClass(activeKey === 'role')}
          >
            {content.role}
          </p>
        </div>

        <div style={QUOTE_WRAP_STYLE}>
          <p
            ref={quoteRef}
            data-element-key='quote'
            style={composeStyle(QUOTE_STYLE, styleOf('quote'))}
            className={selectableClass(activeKey === 'quote', 'freq-quote')}
          >
            {content.quote}
          </p>
        </div>
      </div>
    </section>
  );
}
