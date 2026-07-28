'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerRealEstate02StoryContent,
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
  content: FramerRealEstate02StoryContent;
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
  panel: '#c49f8a',
  cream: '#e9e4dc',
  dark: '#2c2926',
  navIcon: 'rgb(86, 84, 64)',
  navHoverBg: '#555440',
  navHoverIcon: '#ffffff',
} as const;

const IMAGE_DURATION = 1.9;
const IMAGE_DURATION_PREV = 2.8;
const IMAGE_EASE = 'expo.out';
const IMAGE_ZOOM_FROM_NEXT = 1.15;
const IMAGE_ZOOM_TO_PREV = 1.15;
const IMAGE_PARALLAX_XPERCENT = 24;
const CLIP_OPEN = 'inset(0% 0% 0% 0%)';
const CLIP_HIDDEN = 'inset(0% 100% 0% 0%)';
const TEXT_DURATION = 0.5;
const TEXT_FADE_DURATION = 1.2;
const TEXT_EASE = 'power2.out';
const TEXT_TRAVEL = 8;
const TEXT_OVERLAP = 0.22;

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
  aspectRatio: '375 / 781',
  overflow: 'hidden',
  fontFamily: FONT_STACK,
};

const IMAGE_STACK_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  height: '70%',
  overflow: 'hidden',
};

const IMAGE_WRAP_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  clipPath: 'inset(0% 0% 0% 0%)',
};

const IMAGE_INNER_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  transformOrigin: 'left center',
};

const IMAGE_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const TITLE_WRAP_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '5%',
  width: '85%',
  top: '55%',
  transform: 'translateY(-50%)',
  overflow: 'hidden',
  zIndex: 5,
};

const TITLE_STYLE: React.CSSProperties = {
  margin: 0,
  fontWeight: 300,
  fontSize: '52px',
  lineHeight: 1.2,
  color: COLORS.panel,
  whiteSpace: 'nowrap',
};

const PANEL_STYLE: React.CSSProperties = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  width: '281px',
  height: '281px',
  backgroundColor: COLORS.panel,
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  overflow: 'visible',
  zIndex: 20,
};

const LABEL_SLOT_STYLE: React.CSSProperties = {
  position: 'relative',
  minHeight: '22px',
  overflow: 'hidden',
};

const LABEL_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: '0 0 auto 0',
  margin: 0,
  fontWeight: 600,
  fontSize: '14px',
  lineHeight: 1.6,
  color: COLORS.cream,
};

const BODY_SLOT_STYLE: React.CSSProperties = {
  position: 'relative',
  flex: 1,
  minHeight: 0,
  marginTop: '15px',
  overflow: 'hidden',
};

const BODY_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: '0 0 auto 0',
  margin: 0,
  fontWeight: 600,
  fontSize: '9.1px',
  lineHeight: 1.76,
  letterSpacing: '0.54px',
  textTransform: 'uppercase',
  color: COLORS.dark,
  maxWidth: '90%',
};

const BOTTOM_ROW_STYLE: React.CSSProperties = {
  marginTop: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
};

const NAV_GROUP_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const NAV_BUTTON_BASE_STYLE: React.CSSProperties = {
  width: '35px',
  height: '35px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  padding: 0,
  transition: 'background-color 150ms ease, color 150ms ease',
};

function navButtonStyle(
  disabled: boolean,
  hovered: boolean
): React.CSSProperties {
  const active = hovered && !disabled;
  return {
    ...NAV_BUTTON_BASE_STYLE,
    border: `1px solid ${active ? COLORS.navHoverBg : COLORS.navIcon}`,
    backgroundColor: active ? COLORS.navHoverBg : 'transparent',
    color: active ? COLORS.navHoverIcon : COLORS.navIcon,
    opacity: disabled ? 0.4 : 1,
    cursor: disabled ? 'default' : 'pointer',
  };
}

const COUNTER_STYLE: React.CSSProperties = {
  margin: 0,
  fontWeight: 600,
  fontSize: '9.1px',
  lineHeight: 1.76,
  letterSpacing: '0.54px',
  textTransform: 'uppercase',
  color: COLORS.cream,
  textAlign: 'right',
};

interface SlideKeys {
  label: keyof FramerRealEstate02StoryContent;
  body: keyof FramerRealEstate02StoryContent;
  image: keyof FramerRealEstate02StoryContent;
}

const SLIDE_KEYS: SlideKeys[] = [
  { label: 'slide1Label', body: 'slide1Body', image: 'slide1ImageUrl' },
  { label: 'slide2Label', body: 'slide2Body', image: 'slide2ImageUrl' },
  { label: 'slide3Label', body: 'slide3Body', image: 'slide3ImageUrl' },
];

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function FramerRealEstate02Story({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const labelRefs = React.useRef<Array<HTMLParagraphElement | null>>([]);
  const bodyRefs = React.useRef<Array<HTMLParagraphElement | null>>([]);
  const imageWrapRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const imageInnerRefs = React.useRef<Array<HTMLDivElement | null>>([]);

  const [index, setIndex] = React.useState(0);
  const [hoveredNav, setHoveredNav] = React.useState<'prev' | 'next' | null>(
    null
  );

  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const goTo = React.useCallback(
    (next: number) => {
      if (isCanvas) return;
      const clamped = gsap.utils.clamp(0, 2, next);
      if (clamped === index) return;
      const prevIndex = index;
      const direction = clamped > prevIndex ? 'next' : 'prev';
      setIndex(clamped);

      const reduce = prefersReducedMotion();

      const oldTextCandidates: Array<HTMLElement | null> = [
        labelRefs.current[prevIndex],
        bodyRefs.current[prevIndex],
      ];
      const newTextCandidates: Array<HTMLElement | null> = [
        labelRefs.current[clamped],
        bodyRefs.current[clamped],
      ];
      const oldTextEls = oldTextCandidates.filter(
        (el): el is HTMLElement => !!el
      );
      const newTextEls = newTextCandidates.filter(
        (el): el is HTMLElement => !!el
      );

      if (reduce) {
        gsap.set(oldTextEls, { opacity: 0, y: 0 });
        gsap.set(newTextEls, { opacity: 1, y: 0 });
      } else {
        gsap.set(newTextEls, { opacity: 0, y: TEXT_TRAVEL });
        const textTl = gsap.timeline();
        textTl.to(
          oldTextEls,
          { y: TEXT_TRAVEL, duration: TEXT_DURATION, ease: TEXT_EASE },
          0
        );
        textTl.to(
          oldTextEls,
          { opacity: 0, duration: TEXT_FADE_DURATION, ease: TEXT_EASE },
          0
        );
        textTl.to(
          newTextEls,
          { y: 0, duration: TEXT_DURATION, ease: TEXT_EASE },
          TEXT_OVERLAP
        );
        textTl.to(
          newTextEls,
          { opacity: 1, duration: TEXT_FADE_DURATION, ease: TEXT_EASE },
          TEXT_OVERLAP
        );
      }

      const allWraps = imageWrapRefs.current.filter(
        (el): el is HTMLDivElement => !!el
      );
      const allInners = imageInnerRefs.current.filter(
        (el): el is HTMLDivElement => !!el
      );
      gsap.killTweensOf([...allWraps, ...allInners]);
      SLIDE_KEYS.forEach((_, i) => {
        const wrap = imageWrapRefs.current[i];
        const inner = imageInnerRefs.current[i];
        if (wrap) {
          gsap.set(wrap, {
            clipPath: CLIP_OPEN,
            zIndex: i === prevIndex ? 2 : i === clamped ? 1 : 0,
          });
        }
        if (inner) gsap.set(inner, { scale: 1, xPercent: 0 });
      });

      const outWrap = imageWrapRefs.current[prevIndex];
      const inWrap = imageWrapRefs.current[clamped];
      const outInner = imageInnerRefs.current[prevIndex];
      const inInner = imageInnerRefs.current[clamped];
      const duration =
        direction === 'next' ? IMAGE_DURATION : IMAGE_DURATION_PREV;

      if (reduce) {
        gsap.set(outWrap, {
          clipPath: direction === 'next' ? CLIP_HIDDEN : CLIP_OPEN,
          zIndex: direction === 'next' ? 0 : 2,
        });
        gsap.set(inWrap, {
          clipPath: CLIP_OPEN,
          zIndex: direction === 'next' ? 1 : 3,
        });
        gsap.set([outInner, inInner], { scale: 1, xPercent: 0 });
        return;
      }

      if (direction === 'next') {
        gsap.to(outWrap, {
          clipPath: CLIP_HIDDEN,
          duration,
          ease: IMAGE_EASE,
        });
        gsap.to(outInner, {
          xPercent: -IMAGE_PARALLAX_XPERCENT,
          duration,
          ease: IMAGE_EASE,
        });
        gsap.set(inInner, { scale: IMAGE_ZOOM_FROM_NEXT });
        gsap.to(inInner, { scale: 1, duration, ease: IMAGE_EASE });
      } else {
        gsap.set(inWrap, { clipPath: CLIP_HIDDEN, zIndex: 3 });
        gsap.to(inWrap, {
          clipPath: CLIP_OPEN,
          duration,
          ease: IMAGE_EASE,
        });
        gsap.set(inInner, { xPercent: -IMAGE_PARALLAX_XPERCENT });
        gsap.to(inInner, { xPercent: 0, duration, ease: IMAGE_EASE });
        gsap.to(outInner, {
          scale: IMAGE_ZOOM_TO_PREV,
          duration,
          ease: IMAGE_EASE,
        });
      }
    },
    [index, isCanvas]
  );

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-block='framer-realestate02-story'
        data-canvas-edit='true'
        className={cn('fres-root fres-root--canvas @container', className)}
        style={{
          position: 'relative',
          width: '100%',
          height: 'auto',
          ...blockBackgroundStyle(background),
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
            padding: 16,
          }}
        >
          {SLIDE_KEYS.map(keys => (
            <div
              key={keys.label}
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              <div
                data-element-key={keys.image}
                className={selectableClass(activeKey === keys.image)}
                style={composeStyle(
                  {
                    width: '100%',
                    aspectRatio: '375 / 500',
                    overflow: 'hidden',
                    background: '#e8e8ea',
                  },
                  styleOf(keys.image)
                )}
              >
                {content[keys.image] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={content[keys.image]}
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
              <div
                style={{
                  backgroundColor: '#c49f8a',
                  padding: '12px',
                  borderRadius: '0 0 4px 4px',
                }}
              >
                <p
                  data-element-key={keys.label}
                  style={composeStyle(
                    LABEL_STYLE,
                    { position: 'static', color: COLORS.dark },
                    styleOf(keys.label)
                  )}
                  className={selectableClass(activeKey === keys.label)}
                >
                  {content[keys.label]}
                </p>
                <p
                  data-element-key={keys.body}
                  style={composeStyle(
                    BODY_STYLE,
                    {
                      position: 'static',
                      color: COLORS.dark,
                      textTransform: 'none',
                    },
                    styleOf(keys.body)
                  )}
                  className={selectableClass(activeKey === keys.body)}
                >
                  {content[keys.body]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      data-block='framer-realestate02-story'
      style={{ ...ROOT_STYLE, ...blockBackgroundStyle(background) }}
      className={cn('fres-root', className)}
    >
      <div style={CARD_STYLE} className='fres-card @container'>
        <div style={IMAGE_STACK_STYLE}>
          {SLIDE_KEYS.map((keys, i) => {
            const url = content[keys.image];
            if (!url) return null;
            return (
              <div
                key={keys.image}
                ref={el => {
                  imageWrapRefs.current[i] = el;
                }}
                style={{
                  ...IMAGE_WRAP_STYLE,
                  zIndex: i === 0 ? 2 : 0,
                }}
              >
                <div
                  ref={el => {
                    imageInnerRefs.current[i] = el;
                  }}
                  style={IMAGE_INNER_STYLE}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=''
                    data-element-key={keys.image}
                    style={composeStyle(IMAGE_STYLE, styleOf(keys.image))}
                    className={selectableClass(activeKey === keys.image)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div style={TITLE_WRAP_STYLE}>
          <h2
            data-element-key={SLIDE_KEYS[index].label}
            style={composeStyle(TITLE_STYLE, styleOf(SLIDE_KEYS[index].label))}
            className={selectableClass(activeKey === SLIDE_KEYS[index].label)}
          >
            {content[SLIDE_KEYS[index].label]}
          </h2>
        </div>

        <div style={PANEL_STYLE}>
          <div style={LABEL_SLOT_STYLE}>
            {SLIDE_KEYS.map((keys, i) => (
              <p
                key={keys.label}
                ref={el => {
                  labelRefs.current[i] = el;
                }}
                data-element-key={keys.label}
                style={composeStyle(LABEL_STYLE, styleOf(keys.label), {
                  opacity: i === 0 ? 1 : 0,
                })}
                className={selectableClass(activeKey === keys.label)}
              >
                {content[keys.label]}
              </p>
            ))}
          </div>

          <div style={BODY_SLOT_STYLE}>
            {SLIDE_KEYS.map((keys, i) => (
              <p
                key={keys.body}
                ref={el => {
                  bodyRefs.current[i] = el;
                }}
                data-element-key={keys.body}
                style={composeStyle(BODY_STYLE, styleOf(keys.body), {
                  opacity: i === 0 ? 1 : 0,
                })}
                className={selectableClass(activeKey === keys.body)}
              >
                {content[keys.body]}
              </p>
            ))}
          </div>

          <div style={BOTTOM_ROW_STYLE}>
            <div style={NAV_GROUP_STYLE}>
              {(() => {
                const prevDisabled = index === 0;
                const nextDisabled = index === 2;
                return (
                  <>
                    <button
                      type='button'
                      style={navButtonStyle(
                        prevDisabled,
                        hoveredNav === 'prev'
                      )}
                      disabled={prevDisabled}
                      onClick={() => goTo(index - 1)}
                      onMouseEnter={() => setHoveredNav('prev')}
                      onMouseLeave={() => setHoveredNav(null)}
                      aria-label='Previous slide'
                    >
                      <ArrowLeft aria-hidden='true' size={20} />
                    </button>
                    <button
                      type='button'
                      style={navButtonStyle(
                        nextDisabled,
                        hoveredNav === 'next'
                      )}
                      disabled={nextDisabled}
                      onClick={() => goTo(index + 1)}
                      onMouseEnter={() => setHoveredNav('next')}
                      onMouseLeave={() => setHoveredNav(null)}
                      aria-label='Next slide'
                    >
                      <ArrowRight aria-hidden='true' size={20} />
                    </button>
                  </>
                );
              })()}
            </div>
            <p style={COUNTER_STYLE}>{index + 1}/3</p>
          </div>
        </div>
      </div>
    </section>
  );
}
