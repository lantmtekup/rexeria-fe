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
  FramerRealEstate02LocationContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface Props {
  content: FramerRealEstate02LocationContent;
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
  bg: '#e9e4dc',
  heading: '#565440',
} as const;

const PHOTO1_PARALLAX_RANGE: [number, number] = [-203, -298];
const PHOTO2_PARALLAX_RANGE: [number, number] = [123, 261];
const PHOTO3_PARALLAX_RANGE: [number, number] = [203, 319];
const PHOTO1_REST_Y = -250.5;
const PHOTO2_REST_Y = 192;
const PHOTO3_REST_Y = 261;

const HEADING_OFFSET_X = 138;
const HEADING_DURATION = 0.95;
const HEADING_EASE = 'power2.inOut';

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
  aspectRatio: '375 / 585',
  overflow: 'hidden',
  backgroundColor: COLORS.bg,
  fontFamily: FONT_STACK,
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

const PHOTO1_WINDOW_STYLE: React.CSSProperties = {
  height: '237px',
  left: 'calc(23.733333333333356% - 178px / 2)',
  overflow: 'hidden',
  position: 'absolute',
  top: '208px',
  width: '178px',
};

const PHOTO1_INNER_STYLE: React.CSSProperties = {
  bottom: '-301px',
  height: '338px',
  left: '-38px',
  overflow: 'hidden',
  position: 'absolute',
  right: '-38px',
  willChange: 'transform',
  opacity: 1,
};

const PHOTO2_WINDOW_STYLE: React.CSSProperties = {
  height: '237px',
  left: 'calc(76.53333333333336% - 178px / 2)',
  overflow: 'hidden',
  position: 'absolute',
  top: '90px',
  width: '178px',
};

const PHOTO2_INNER_STYLE: React.CSSProperties = {
  height: '381px',
  left: '-54px',
  overflow: 'hidden',
  position: 'absolute',
  right: '-54px',
  top: '-264px',
  willChange: 'transform',
  opacity: 1,
};

const PHOTO3_WINDOW_STYLE: React.CSSProperties = {
  height: '237px',
  left: 'calc(76.53333333333336% - 178px / 2)',
  overflow: 'hidden',
  position: 'absolute',
  top: '347px',
  width: '178px',
};

const PHOTO3_INNER_STYLE: React.CSSProperties = {
  height: '359px',
  left: '-46px',
  overflow: 'hidden',
  position: 'absolute',
  right: '-46px',
  top: '-322px',
  willChange: 'transform',
  opacity: 1,
};

const HEADING_WRAP_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: '40px',
  left: '-100px',
  width: '332px',
  height: '91px',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  willChange: 'transform',
};

const HEADING_TEXT_STYLE: React.CSSProperties = {
  margin: 0,
  fontWeight: 300,
  fontSize: '72px',
  lineHeight: 1.2696,
  letterSpacing: '-3.66px',
  textTransform: 'uppercase',
  color: COLORS.heading,
  whiteSpace: 'nowrap',
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function FramerRealEstate02Location({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const photo1Ref = React.useRef<HTMLDivElement>(null);
  const photo2Ref = React.useRef<HTMLDivElement>(null);
  const photo3Ref = React.useRef<HTMLDivElement>(null);
  const headingRef = React.useRef<HTMLDivElement>(null);

  const isCanvas = useIsCanvasEdit(rootRef);

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
      if (!root) return;

      const reduceMotion = prefersReducedMotion();
      const photo1 = photo1Ref.current;
      const photo2 = photo2Ref.current;
      const photo3 = photo3Ref.current;
      const heading = headingRef.current;

      if (reduceMotion) {
        if (photo1) gsap.set(photo1, { y: PHOTO1_REST_Y });
        if (photo2) gsap.set(photo2, { y: PHOTO2_REST_Y });
        if (photo3) gsap.set(photo3, { y: PHOTO3_REST_Y });
        if (heading) gsap.set(heading, { x: HEADING_OFFSET_X });
        return;
      }

      if (photo1 || photo2 || photo3) {
        const applyPhotoParallax = (self: ScrollTrigger) => {
          const p = self.progress;
          if (photo1) {
            gsap.set(photo1, {
              y: gsap.utils.mapRange(0, 1, ...PHOTO1_PARALLAX_RANGE, p),
              force3D: false,
            });
          }
          if (photo2) {
            gsap.set(photo2, {
              y: gsap.utils.mapRange(0, 1, ...PHOTO2_PARALLAX_RANGE, p),
              force3D: false,
            });
          }
          if (photo3) {
            gsap.set(photo3, {
              y: gsap.utils.mapRange(0, 1, ...PHOTO3_PARALLAX_RANGE, p),
              force3D: false,
            });
          }
        };
        const photoTrigger = ScrollTrigger.create({
          trigger: root,
          scroller,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: applyPhotoParallax,
          onRefresh: applyPhotoParallax,
        });
        applyPhotoParallax(photoTrigger);
      }

      if (heading) {
        gsap.fromTo(
          heading,
          { x: 0 },
          {
            x: HEADING_OFFSET_X,
            duration: HEADING_DURATION,
            ease: HEADING_EASE,
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top 15%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }
    },
    [isCanvas]
  );

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-block='framer-realestate02-location'
        data-canvas-edit='true'
        className={cn('frel-root frel-root--canvas @container', className)}
        style={{
          position: 'relative',
          width: '100%',
          height: 'auto',
          fontFamily: FONT_STACK,
          ...blockBackgroundStyle(background),
        }}
      >
        <div style={{ padding: '24px' }}>
          <p
            data-element-key='heading'
            style={composeStyle(
              {
                ...HEADING_TEXT_STYLE,
                color: 'white',
                position: 'static',
                whiteSpace: 'normal',
                fontSize: 'clamp(28px, 9cqi, 48px)',
              },
              styleOf('heading')
            )}
            className={selectableClass(activeKey === 'heading', 'frel-heading')}
          >
            {content.heading}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
              marginTop: 16,
            }}
          >
            {(['photo1Url', 'photo2Url', 'photo3Url'] as const).map(key => (
              <div
                key={key}
                data-element-key={key}
                className={selectableClass(activeKey === key)}
                style={composeStyle(
                  {
                    width: '100%',
                    aspectRatio: '178 / 237',
                    overflow: 'hidden',
                    background: '#e8e8ea',
                  },
                  styleOf(key)
                )}
              >
                {content[key] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={content[key]}
                    alt=''
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      pointerEvents: 'none',
                    }}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      data-block='framer-realestate02-location'
      style={{ ...ROOT_STYLE, ...blockBackgroundStyle(background) }}
      className={cn('frel-root', className)}
    >
      <div style={CARD_STYLE} className='frel-card @container'>
        <div style={PHOTO1_WINDOW_STYLE}>
          <div style={PHOTO1_INNER_STYLE} ref={photo1Ref}>
            <div style={ABSOLUTE_FILL_STYLE}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.photo1Url}
                alt=''
                data-element-key='photo1Url'
                style={composeStyle(PHOTO_IMAGE_STYLE, styleOf('photo1Url'))}
                className={selectableClass(activeKey === 'photo1Url')}
              />
            </div>
          </div>
        </div>

        <div style={PHOTO2_WINDOW_STYLE}>
          <div style={PHOTO2_INNER_STYLE} ref={photo2Ref}>
            <div style={ABSOLUTE_FILL_STYLE}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.photo2Url}
                alt=''
                data-element-key='photo2Url'
                style={composeStyle(PHOTO_IMAGE_STYLE, styleOf('photo2Url'))}
                className={selectableClass(activeKey === 'photo2Url')}
              />
            </div>
          </div>
        </div>

        <div style={HEADING_WRAP_STYLE} ref={headingRef}>
          <p
            data-element-key='heading'
            style={composeStyle(HEADING_TEXT_STYLE, styleOf('heading'))}
            className={selectableClass(activeKey === 'heading', 'frel-heading')}
          >
            {content.heading}
          </p>
        </div>

        <div style={PHOTO3_WINDOW_STYLE}>
          <div style={PHOTO3_INNER_STYLE} ref={photo3Ref}>
            <div style={ABSOLUTE_FILL_STYLE}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.photo3Url}
                alt=''
                data-element-key='photo3Url'
                style={composeStyle(PHOTO_IMAGE_STYLE, styleOf('photo3Url'))}
                className={selectableClass(activeKey === 'photo3Url')}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
