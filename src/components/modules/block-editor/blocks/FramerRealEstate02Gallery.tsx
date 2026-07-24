'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerRealEstate02GalleryContent,
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
  content: FramerRealEstate02GalleryContent;
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
  accent: '#c49f8a',
  cream: '#e9e4dc',
} as const;

const IMAGE_SIZE = 307;
const IMAGE_GAP = 12;
const SLIDE_STEP = IMAGE_SIZE + IMAGE_GAP;
const NAV_SIZE = 35;

const TRAVEL = 24;
const DURATION = 0.65;
const EASE = 'power2.out';
const SLIDE_DURATION = 0.6;
const SLIDE_EASE = 'power2.out';

const IMAGE_KEYS = [
  'image1Url',
  'image2Url',
  'image3Url',
  'image4Url',
] as const;
const REAL_COUNT = IMAGE_KEYS.length;
const PAD = 2;

const VIEWPORT_INSET = 0;
const LEFT_MARGIN = 24;

function trackOffset(trackIndex: number): number {
  return LEFT_MARGIN - trackIndex * SLIDE_STEP;
}

const INITIAL_TRACK_X = trackOffset(PAD);

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
  aspectRatio: '375 / 704',
  overflow: 'hidden',
  fontFamily: FONT_STACK,
};

const HEADING_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '20px',
  top: '80px',
  width: '220px',
  margin: 0,
  fontWeight: 300,
  fontSize: '40.53px',
  lineHeight: '51.11px',
  letterSpacing: '0.81px',
  textTransform: 'uppercase',
  color: COLORS.accent,
};

const SLIDER_VIEWPORT_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: `${VIEWPORT_INSET}px`,
  top: '221px',
  right: `${VIEWPORT_INSET}px`,
  height: `${IMAGE_SIZE}px`,
  overflow: 'hidden',
};

const TRACK_STYLE: React.CSSProperties = {
  display: 'flex',
  gap: `${IMAGE_GAP}px`,
  height: '100%',
  willChange: 'transform',
  transform: `translateX(${INITIAL_TRACK_X}px)`,
};

const SLIDE_STYLE: React.CSSProperties = {
  position: 'relative',
  flex: 'none',
  width: `${IMAGE_SIZE}px`,
  height: `${IMAGE_SIZE}px`,
  overflow: 'hidden',
};

const SLIDE_IMAGE_STYLE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const CANVAS_IMAGE_STYLE: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  pointerEvents: 'none',
};

const NAV_ROW_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '20px',
  top: '569px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const NAV_BUTTON_BASE_STYLE: React.CSSProperties = {
  width: `${NAV_SIZE}px`,
  height: `${NAV_SIZE}px`,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  padding: 0,
  cursor: 'pointer',
  border: `1px solid ${COLORS.accent}`,
  transition: 'background-color 150ms ease, color 150ms ease',
};

function navButtonStyle(hovered: boolean): React.CSSProperties {
  return {
    ...NAV_BUTTON_BASE_STYLE,
    backgroundColor: hovered ? COLORS.accent : 'transparent',
    color: hovered ? '#ffffff' : COLORS.accent,
  };
}

const COUNTER_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '293.5px',
  top: '588px',
  margin: 0,
  fontWeight: 600,
  fontSize: '9.1px',
  lineHeight: 1.76,
  letterSpacing: '0.54px',
  textTransform: 'uppercase',
  color: COLORS.cream,
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function FramerRealEstate02Gallery({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const lineRefs = React.useRef<Array<HTMLElement | null>>([]);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const trackIndexRef = React.useRef(PAD);
  const animatingRef = React.useRef(false);

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
    (dir: 1 | -1) => {
      if (isCanvas || animatingRef.current) return;
      animatingRef.current = true;

      const track = trackRef.current;
      const nextTrackIndex = trackIndexRef.current + dir;
      const x = trackOffset(nextTrackIndex);

      const settle = () => {
        let settled = nextTrackIndex;
        if (nextTrackIndex < PAD) {
          settled = PAD + REAL_COUNT - 1;
          gsap.set(track, { x: trackOffset(settled) });
        } else if (nextTrackIndex >= PAD + REAL_COUNT) {
          settled = PAD;
          gsap.set(track, { x: trackOffset(settled) });
        }
        trackIndexRef.current = settled;
        setIndex(settled - PAD);
        animatingRef.current = false;
      };

      if (!track) {
        settle();
        return;
      }
      if (prefersReducedMotion()) {
        gsap.set(track, { x });
        settle();
      } else {
        gsap.to(track, {
          x,
          duration: SLIDE_DURATION,
          ease: SLIDE_EASE,
          onComplete: settle,
        });
      }
    },
    [isCanvas]
  );

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      if (isCanvas) return;
      const root = rootRef.current;
      if (!root) return;

      const lines = lineRefs.current.filter((el): el is HTMLElement => !!el);
      if (!lines.length) return;

      if (prefersReducedMotion()) {
        gsap.set(lines, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(lines, { opacity: 0, y: TRAVEL });
      gsap.to(lines, {
        opacity: 1,
        y: 0,
        duration: DURATION,
        ease: EASE,
        stagger: 0.08,
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        },
      });
    },
    [isCanvas]
  );

  const headingLines = content.heading.split('\n');

  const slides: Array<{
    renderKey: string;
    fieldKey: (typeof IMAGE_KEYS)[number] | null;
    url: string;
  }> = [
    ...IMAGE_KEYS.slice(REAL_COUNT - PAD).map((key, i) => ({
      renderKey: `clone-start-${i}`,
      fieldKey: null,
      url: content[key],
    })),
    ...IMAGE_KEYS.map(key => ({
      renderKey: key,
      fieldKey: key,
      url: content[key],
    })),
    ...IMAGE_KEYS.slice(0, PAD).map((key, i) => ({
      renderKey: `clone-end-${i}`,
      fieldKey: null,
      url: content[key],
    })),
  ];

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-block='framer-realestate02-gallery'
        data-canvas-edit='true'
        className={cn('freg-root freg-root--canvas @container', className)}
        style={{
          position: 'relative',
          width: '100%',
          height: 'auto',
          ...blockBackgroundStyle(background),
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: 16,
          }}
        >
          <div
            data-element-key='heading'
            style={composeStyle(
              { ...HEADING_STYLE, position: 'static', width: 'auto' },
              styleOf('heading')
            )}
            className={selectableClass(activeKey === 'heading')}
          >
            {headingLines.map((line, i, arr) => (
              <React.Fragment key={i}>
                {line}
                {i < arr.length - 1 ? <br /> : null}
              </React.Fragment>
            ))}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 8,
            }}
          >
            {IMAGE_KEYS.map(key => (
              <div
                key={key}
                data-element-key={key}
                className={selectableClass(activeKey === key)}
                style={composeStyle(
                  {
                    aspectRatio: '1 / 1',
                    overflow: 'hidden',
                    background: '#e8e8ea',
                  },
                  styleOf(key)
                )}
              >
                {content[key] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={content[key]} alt='' style={CANVAS_IMAGE_STYLE} />
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
      data-block='framer-realestate02-gallery'
      style={{ ...ROOT_STYLE, ...blockBackgroundStyle(background) }}
      className={cn('freg-root', className)}
    >
      <div style={CARD_STYLE} className='freg-card @container'>
        <h1
          ref={headingRef}
          data-element-key='heading'
          style={composeStyle(HEADING_STYLE, styleOf('heading'))}
          className={selectableClass(activeKey === 'heading', 'freg-heading')}
        >
          {headingLines.map((line, i) => (
            <span
              key={i}
              ref={el => {
                lineRefs.current[i] = el;
              }}
              style={{ display: 'block' }}
            >
              {line}
            </span>
          ))}
        </h1>

        <div style={SLIDER_VIEWPORT_STYLE}>
          <div ref={trackRef} style={TRACK_STYLE}>
            {slides.map((slide, i) => {
              if (!slide.url) return null;
              return (
                <div key={`${slide.renderKey}-${i}`} style={SLIDE_STYLE}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.url}
                    alt=''
                    data-element-key={slide.fieldKey ?? undefined}
                    style={composeStyle(
                      SLIDE_IMAGE_STYLE,
                      slide.fieldKey ? styleOf(slide.fieldKey) : undefined
                    )}
                    className={
                      slide.fieldKey
                        ? selectableClass(activeKey === slide.fieldKey)
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div style={NAV_ROW_STYLE}>
          <button
            type='button'
            style={navButtonStyle(hoveredNav === 'prev')}
            onClick={() => goTo(-1)}
            onMouseEnter={() => setHoveredNav('prev')}
            onMouseLeave={() => setHoveredNav(null)}
            aria-label='Ảnh trước'
          >
            <ArrowLeft aria-hidden='true' size={24} />
          </button>
          <button
            type='button'
            style={navButtonStyle(hoveredNav === 'next')}
            onClick={() => goTo(1)}
            onMouseEnter={() => setHoveredNav('next')}
            onMouseLeave={() => setHoveredNav(null)}
            aria-label='Ảnh kế tiếp'
          >
            <ArrowRight aria-hidden='true' size={24} />
          </button>
        </div>

        <p style={COUNTER_STYLE}>
          {index + 1}/{REAL_COUNT}
        </p>
      </div>
    </section>
  );
}
